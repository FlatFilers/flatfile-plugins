import type { FlatfileEvent } from '@flatfile/listener'
import { request } from 'node:https'
import { RecordHookStreamOptions } from '.'
import { Item } from './utils/item'

const MIN_BATCH_SIZE = 100
const MAX_BATCH_SIZE = 500
const TARGET_BATCH_DURATION = 5000
const MAX_CONCURRENT_BATCHES = 15
const CHUNK_SIZE = 50

export async function recordReadWriteStream(
  callback: (items: Item[], event: FlatfileEvent) => Item[] | Promise<Item[]>,
  event: FlatfileEvent,
  options: RecordHookStreamOptions = {}
) {
  const {
    includeMessages = false,
    includeMetadata = false,
    debug = false,
  } = options

  const processedRecordIds = new Set<string>()
  const startTime = Date.now()
  let pendingBatches = 0

  // Pre-create Item instances in smaller chunks to prevent memory spikes
  const processItemsInChunks = async (records: any[]) => {
    const results = []
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      const chunk = records.slice(i, i + CHUNK_SIZE)
      const items = chunk.map((record) => new Item(record))

      // Process all records in chunk at once
      chunk.forEach((record) => {
        if (!processedRecordIds.has(record.__k)) {
          processedRecordIds.add(record.__k)
        }
      })

      const transformedItems = await callback(items, event)
      const chunkResults = transformedItems.map((item) => item.changeset())
      results.push(...chunkResults)
    }
    return results
  }

  let currentBatchSize = 250

  const processBatchOfRecords = async (records: any[]) => {
    if (records.length === 0) return

    while (pendingBatches >= MAX_CONCURRENT_BATCHES) {
      await new Promise((resolve) => setTimeout(resolve, 25))
    }

    pendingBatches++
    const batchStartTime = Date.now()

    try {
      const results = await processItemsInChunks(records)
      const sendStart = Date.now()
      await sendBatch(results, event, options)

      // Adjust batch size based on send duration
      const batchDuration = Date.now() - sendStart
      if (batchDuration > TARGET_BATCH_DURATION) {
        currentBatchSize = Math.max(
          MIN_BATCH_SIZE,
          Math.floor(currentBatchSize * 0.8)
        )
      } else if (batchDuration < TARGET_BATCH_DURATION * 0.8) {
        currentBatchSize = Math.min(
          MAX_BATCH_SIZE,
          Math.floor(currentBatchSize * 1.2)
        )
      }

      debug &&
        console.log(
          `Batch metrics - Size: ${records.length}, Process: ${sendStart - batchStartTime}ms, ` +
            `Send: ${batchDuration}ms, Next batch size: ${currentBatchSize}`
        )
    } catch (error) {
      if (error.message.includes('Too Many Requests')) {
        currentBatchSize = Math.max(
          MIN_BATCH_SIZE,
          Math.floor(currentBatchSize * 0.5)
        )
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await processBatchOfRecords(records)
        return
      }
      throw error
    } finally {
      pendingBatches--
    }
  }

  return new Promise((resolve, reject) => {
    let buffer = ''
    let recordBuffer: any[] = []
    let lastProgressLog = Date.now()
    let lastRecordCount = 0
    const PROGRESS_INTERVAL = 5000

    const logProgress = () => {
      const now = Date.now()
      if (now - lastProgressLog >= PROGRESS_INTERVAL) {
        const timeElapsed = (now - lastProgressLog) / 1000
        const recordsSinceLastLog = processedRecordIds.size - lastRecordCount
        const currentRecordsPerSecond = recordsSinceLastLog / timeElapsed
        const overallRecordsPerSecond =
          processedRecordIds.size / ((now - startTime) / 1000)

        // Only log if we've processed new records or have pending batches
        if (recordsSinceLastLog > 0 || pendingBatches > 0) {
          debug &&
            console.log(
              `Progress: ${processedRecordIds.size} records processed ` +
                `(current: ${recordsSinceLastLog > 0 ? Math.round(currentRecordsPerSecond) : 'waiting'} r/s, ` +
                `avg: ${Math.round(overallRecordsPerSecond)} r/s)` +
                `${pendingBatches > 0 ? ` - ${pendingBatches} batches pending` : ''}`
            )
        }

        lastProgressLog = now
        lastRecordCount = processedRecordIds.size
      }
    }

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/jsonl',
        Authorization: `Bearer ${process.env.FLATFILE_API_KEY || process.env.FLATFILE_BEARER_TOKEN}`,
      },
      timeout: 120000,
    }
    const req = request(
      getRecordStreamEndpoint(event, { includeMessages, includeMetadata }),
      options
    )

    req.on('response', (res) => {
      res.setEncoding('utf8')

      res.on('data', async (chunk: string) => {
        try {
          buffer += chunk
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          const records = lines
            .filter((line) => line.length > 0)
            .map((line) => JSON.parse(line))

          if (records.length > 0) {
            recordBuffer.push(...records)

            while (recordBuffer.length >= currentBatchSize) {
              const batch = recordBuffer.splice(0, currentBatchSize)
              await processBatchOfRecords(batch)
              logProgress()
            }
          }
        } catch (error) {
          reject(error)
        }
      })

      res.on('end', async () => {
        try {
          if (buffer.length > 0) {
            const records = buffer
              .split('\n')
              .filter((line) => line.length > 0)
              .map((line) => JSON.parse(line))
            recordBuffer.push(...records)
          }

          if (recordBuffer.length > 0) {
            await processBatchOfRecords(recordBuffer)
            recordBuffer = []
            logProgress()
          }

          while (pendingBatches > 0) {
            logProgress()
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }

          const endTime = Date.now()
          const totalTimeSeconds = (endTime - startTime) / 1000
          resolve({
            totalProcessed: processedRecordIds.size,
            totalTimeSeconds: totalTimeSeconds.toFixed(2),
          })
        } catch (error) {
          reject(error)
        }
      })
    })

    req.on('error', reject)
    req.end()
  })
}

async function sendBatch(
  batch: any[],
  event: FlatfileEvent,
  options: RecordHookStreamOptions
) {
  const { debug = false } = options

  const MAX_RETRIES = 5
  const INITIAL_RETRY_DELAY = 250

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await sendBatchWithTimeout(batch, event, options)
    } catch (error) {
      if (error.message.includes('Too Many Requests')) {
        debug &&
          console.log(
            `Rate limited, retry attempt ${attempt + 1} of ${MAX_RETRIES}`
          )
        const delay =
          INITIAL_RETRY_DELAY * Math.pow(1.5, attempt) * (0.75 + Math.random())
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        if (attempt === MAX_RETRIES - 1) throw error
        const delay = INITIAL_RETRY_DELAY * Math.pow(1.5, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }
}

async function sendBatchWithTimeout(
  batch: any[],
  event: FlatfileEvent,
  options: RecordHookStreamOptions
) {
  const { includeMessages = true, includeMetadata = false } = options

  const RECORD_STREAM_ENDPOINT = getRecordStreamEndpoint(event, {
    includeMessages,
    includeMetadata,
  })
  const TIMEOUT = 60000
  const MAX_RECORDS_PER_REQUEST = 1000

  if (batch.length > MAX_RECORDS_PER_REQUEST) {
    const chunks = []
    for (let i = 0; i < batch.length; i += MAX_RECORDS_PER_REQUEST) {
      chunks.push(batch.slice(i, i + MAX_RECORDS_PER_REQUEST))
    }

    for (const chunk of chunks) {
      await sendBatchWithTimeout(chunk, event, options)
    }
    return
  }

  return new Promise((resolve, reject) => {
    let isRequestEnded = false
    let timeout: NodeJS.Timeout

    const cleanup = () => {
      clearTimeout(timeout)
      if (!isRequestEnded) {
        req.destroy()
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-ndjson',
        Authorization: `Bearer ${process.env.FLATFILE_API_KEY || process.env.FLATFILE_BEARER_TOKEN}`,
      },
    }

    const req = request(RECORD_STREAM_ENDPOINT, options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        isRequestEnded = true
        cleanup()
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(undefined)
        } else {
          reject(new Error(`Failed to write batch: ${data}`))
        }
      })
    })

    timeout = setTimeout(() => {
      cleanup()
      reject(new Error('Request timeout'))
    }, TIMEOUT)

    req.on('error', (error) => {
      cleanup()
      reject(error)
    })

    for (const record of batch) {
      req.write(JSON.stringify(record) + '\n')
    }

    req.end()
  })
}

const getRecordStreamEndpoint = (
  event: FlatfileEvent,
  options: Omit<RecordHookStreamOptions, 'debug'>
) => {
  const { includeMessages = false, includeMetadata = false } = options
  return `${process.env.FLATFILE_API_URL}/v2-alpha/records.jsonl?sheetId=${event.context.sheetId}&for=${event.src.id}&stream=true&includeMessages=${includeMessages}&includeMetadata=${includeMetadata}`
}
