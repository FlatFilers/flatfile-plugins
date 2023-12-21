import {
  CreateDBInstanceCommand,
  CreateOptionGroupCommand,
  DescribeDBInstancesCommand,
  ModifyDBInstanceCommand,
  ModifyOptionGroupCommand,
  RDSClient,
} from '@aws-sdk/client-rds'
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { Flatfile } from '@flatfile/api'
import { v4 as uuidv4 } from 'uuid'
import { generatePassword, generateUsername } from './utils'

const s3Client = new S3Client({
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const rdsClient = new RDSClient({
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

export async function createResources(
  buffer: Buffer,
  fileName: string,
  tick: (progress: number, message?: string) => Promise<Flatfile.JobResponse>
) {
  // Step 1: Create S3 Bucket
  const bucketName = `foreign-db-extractor-s3-bucket`
  await createS3BucketIfNotExists(bucketName)
  await tick(5, 'Created S3 bucket')

  // Step 2: Upload .bak file to S3
  try {
    const putObjectCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
    })
    await s3Client.send(putObjectCommand)
    await tick(10, 'Uploaded .bak file to S3')
  } catch (error) {
    console.error('Error during S3 upload:', error)
    throw new Error('Error during S3 upload')
  }

  // Step 3: Create RDS Instance
  const dbInstanceIdentifier = `foreign-db-extractor-${uuidv4()}`
  console.log(`Creating RDS instance with identifier "${dbInstanceIdentifier}"`)
  const user = generateUsername()
  console.log(`Creating RDS instance with username "${user}"`)
  const password = generatePassword()
  console.log(`Creating RDS instance with password "${password}"`)
  try {
    const createDBInstanceCommand = new CreateDBInstanceCommand({
      DBInstanceIdentifier: dbInstanceIdentifier,
      AllocatedStorage: 20,
      DBInstanceClass: 'db.t3.micro',
      Engine: 'sqlserver-ex',
      MasterUsername: user,
      MasterUserPassword: password,
      BackupRetentionPeriod: 0,
      PubliclyAccessible: true,
    })
    await rdsClient.send(createDBInstanceCommand)
    console.log('RDS instance creation initiated.')
    await tick(20, 'Created RDS instance')
  } catch (error) {
    console.error('Error during RDS instance creation:', error)
    throw new Error('Error during RDS instance creation')
  }

  // Wait for the RDS instance to become ready and get its endpoint and port
  const { server, port } = await waitForRDSInstance(
    rdsClient,
    dbInstanceIdentifier
  )
  await tick(30, 'RDS instance is ready')

  // Step 4: Create a `SQLSERVER_BACKUP_RESTORE` option group for the RDS instance
  const optionGroupName = 'sql-rds-native-backup-restore'
  try {
    const majorEngineVersion = await getMajorEngineVersion(dbInstanceIdentifier)
    await createOptionGroup(optionGroupName, majorEngineVersion)
    await addBackupRestoreOption(optionGroupName)
    await associateOptionGroupToInstance(dbInstanceIdentifier, optionGroupName)
    await waitForRDSInstance(rdsClient, dbInstanceIdentifier, 'modifying')
    await waitForRDSInstance(rdsClient, dbInstanceIdentifier)
    await tick(40, 'Option group created')
  } catch (error) {
    console.error('Error during RDS option group creation:', error)
  }

  return {
    server,
    port,
    bucketName,
    user,
    password,
  }
}

async function createS3BucketIfNotExists(bucketName: string) {
  try {
    // Check if the bucket already exists and is owned by you
    const headBucketCommand = new HeadBucketCommand({ Bucket: bucketName })
    await s3Client.send(headBucketCommand)

    console.log(`Bucket "${bucketName}" already exists and is owned by you.`)
  } catch (error) {
    if (error.name === 'NotFound' || error.name === 'NoSuchBucket') {
      // Bucket does not exist, create it
      const createBucketCommand = new CreateBucketCommand({
        Bucket: bucketName,
      })
      await s3Client.send(createBucketCommand)
      console.log(`Bucket "${bucketName}" created.`)
    } else {
      // Other errors
      throw error
    }
  }
}

async function waitForRDSInstance(
  rdsClient: RDSClient,
  dbInstanceIdentifier: string,
  status: string = 'available'
): Promise<{ server: string; port: number }> {
  let instanceReady = false
  let server = ''
  let port = 0
  await new Promise((resolve) => setTimeout(resolve, 30_000))
  while (!instanceReady) {
    const describeCommand = new DescribeDBInstancesCommand({
      DBInstanceIdentifier: dbInstanceIdentifier,
    })
    const response = await rdsClient.send(describeCommand)
    const dbInstance = response.DBInstances[0]
    const dbInstanceStatus = dbInstance.DBInstanceStatus

    if (dbInstanceStatus === status) {
      instanceReady = true
      server = dbInstance.Endpoint.Address
      port = dbInstance.Endpoint.Port
      console.log(`RDS instance is ${status}.`)
    } else {
      console.log(
        `Waiting for RDS instance to be ${status}... Current status: ${dbInstanceStatus}`
      )
      await new Promise((resolve) => setTimeout(resolve, 30_000))
    }
  }

  return { server, port }
}

async function getMajorEngineVersion(
  instanceIdentifier: string
): Promise<string> {
  const command = new DescribeDBInstancesCommand({
    DBInstanceIdentifier: instanceIdentifier,
  })

  const response = await rdsClient.send(command)
  const dbInstance = response.DBInstances[0]
  const fullEngineVersion = dbInstance.EngineVersion
  const majorEngineVersion =
    fullEngineVersion.split('.')[0] + '.' + fullEngineVersion.split('.')[1]

  return majorEngineVersion
}

async function createOptionGroup(
  optionGroupName: string,
  engineVersion: string
) {
  const createOptionGroupParams = {
    OptionGroupName: optionGroupName,
    EngineName: 'sqlserver-ex',
    MajorEngineVersion: engineVersion,
    OptionGroupDescription: 'Option group for SQL Server Backup and Restore',
  }

  try {
    await rdsClient.send(new CreateOptionGroupCommand(createOptionGroupParams))
    console.log('Option Group Created')
  } catch (error) {
    if (error.name === 'OptionGroupAlreadyExistsFault') {
      console.log('Option Group already exists')
    } else {
      console.error('Error creating option group:', error)
      throw error
    }
  }
}

async function addBackupRestoreOption(optionGroupName: string) {
  const addOptionParams = {
    OptionGroupName: optionGroupName,
    OptionsToInclude: [
      {
        OptionName: 'SQLSERVER_BACKUP_RESTORE',
        OptionSettings: [
          {
            Name: 'IAM_ROLE_ARN',
            Value: process.env.AWS_RESTORE_ROLE_ARN,
          },
        ],
      },
    ],
    ApplyImmediately: true,
  }

  try {
    await rdsClient.send(new ModifyOptionGroupCommand(addOptionParams))
    console.log('Option Added')
  } catch (error) {
    console.error('Error', error)
  }
}

async function associateOptionGroupToInstance(
  dbInstanceIdentifier: string,
  optionGroupName: string
) {
  const modifyDbInstanceParams = {
    DBInstanceIdentifier: dbInstanceIdentifier,
    OptionGroupName: optionGroupName,
    ApplyImmediately: true,
  }

  try {
    await rdsClient.send(new ModifyDBInstanceCommand(modifyDbInstanceParams))
    console.log('Option Group Association Initiated')
  } catch (error) {
    console.error('Error', error)
  }
}
