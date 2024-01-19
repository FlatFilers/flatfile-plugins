import sql from 'mssql'

export async function restoreDatabaseFromBackup(
  connConfig: sql.config,
  s3Arn: string
) {
  let conn
  const dbName = connConfig.database
  try {
    // Connecting to the master database to execute restore command
    conn = await sql.connect({ ...connConfig, database: 'master' })
    const command = `
      exec msdb.dbo.rds_restore_database 
      @restore_db_name='${dbName}', 
      @s3_arn_to_restore_from='${s3Arn}'
    `

    await conn.query(command)
    console.log(`Database restore initiated for ${dbName}`)

    // Checking if the database is available
    let isAvailable = false
    while (!isAvailable) {
      //TODO needs to timeout after so many tries
      const result = await conn.query(
        `SELECT state_desc FROM sys.databases WHERE name = '${dbName}'`
      )
      if (result.recordset.length > 0 && result.recordset[0].state_desc) {
        const dbState = result.recordset[0].state_desc
        if (dbState === 'ONLINE') {
          isAvailable = true
          console.log(`Database ${dbName} is available.`)
        } else {
          console.log(
            `Waiting for database ${dbName} to become available... Current state: ${dbState}`
          )
          await new Promise((resolve) => setTimeout(resolve, 30_000))
        }
      } else {
        console.log(`Database ${dbName} not found, waiting...`)
        await new Promise((resolve) => setTimeout(resolve, 30_000))
      }
    }
  } catch (error) {
    console.error('Error during database restore:', error)
  } finally {
    if (conn) {
      conn.close()
      console.log('Closed SQL connection.')
    }
  }
}
