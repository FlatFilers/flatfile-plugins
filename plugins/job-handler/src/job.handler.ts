import type { Flatfile } from '@flatfile/api'
import { FlatfileClient } from '@flatfile/api'
import type {
  EventFilter,
  FlatfileEvent,
  FlatfileListener,
} from '@flatfile/listener'
import { log, logError } from '@flatfile/util-common'

const api = new FlatfileClient()

export interface PluginOptions {
  readonly debug?: boolean
}

export type TickFunction = (
  progress: number,
  info?: string
) => Promise<Flatfile.JobResponse>

/**
 * `jobHandler` is a factory function that constructs a job configuration plugin for
 * the Flatfile API. This function will take a string representing a job name and
 * a handler that will process the job, returning either void or a JobOutcome object.
 *
 * @param {string | EventFilter} job - The job name or event filter.
 *
 * @param {Function} handler - A function that takes an `event` and a `tick()` callback to
 * allow updating of the job's progress, returning a promise that resolves to either
 * void or a JobOutcome object. This function will be used to process the job when the
 * "job:ready" event is emitted. This function can fail the job by throwing an Error.
 *
 * @param {PluginOptions} opts - An optional object containing plugin options.
 * @param {boolean} opts.debug - An optional boolean that will enable debug logging.
 * Defaults to false.
 *
 * @returns {Function} Returns a function that takes a FlatfileListener, adding an event
 * listener for the "job:ready" event and processing the job with the provided handler.
 */
export function jobHandler(
  job: string | EventFilter,
  handler: (
    event: FlatfileEvent,
    tick: TickFunction
  ) => Promise<void | Flatfile.JobCompleteDetails>,
  opts: PluginOptions = {}
) {
  return (listener: FlatfileListener) => {
    const filter = typeof job === 'string' ? { job } : job
    listener.on('job:ready', filter, async (event) => {
      const { jobId } = event.context

      await api.jobs.ack(jobId, {
        info: 'Accepted',
        progress: 0,
      })

      const tick = async (progress: number, info?: string) => {
        return await api.jobs.ack(jobId, {
          progress,
          ...(info !== undefined && { info }),
        })
      }

      try {
        const outcome = await handler(event, tick)

        if (opts.debug) {
          log('@flatfile/plugin-job-handler', 'Job complete')
        }

        await api.jobs.complete(
          jobId,
          outcome || {
            outcome: {
              message: 'Job complete',
            },
          }
        )
      } catch (error) {
        logError('@flatfile/plugin-job-handler', (error as Error).message)

        await api.jobs.fail(jobId, {
          info: String((error as Error).message),
          outcome: {
            acknowledge: true,
            message: String((error as Error).message),
          },
        })
      }
    })
  }
}
