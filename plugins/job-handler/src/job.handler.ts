import api, { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { log, logError } from '@flatfile/util-common'

export interface PluginOptions {
  readonly debug?: boolean
}

/**
 * `jobHandler` is a factory function that constructs a job configuration plugin for
 * the Flatfile API. This function will take a string representing a job name and
 * a handler that will process the job, returning either void or a JobOutcome object.
 *
 * @param {string} job - The job name.
 *
 * @param {Function} handler - A function that takes an `event` and a `tick()` callback to
 * allow updating of the job's progress, returning a promise that resolves to either
 * void or a JobOutcome object. This function will be used to process the job when the
 * "job:ready" event is emitted.
 *
 * @param {PluginOptions} opts - An optional object containing plugin options.
 * @param {boolean} opts.debug - An optional boolean that will enable debug logging.
 * Defaults to false.
 *
 * @returns {Function} Returns a function that takes a FlatfileListener, adding an event
 * listener for the "job:ready" event and processing the job with the provided handler.
 */
export function jobHandler(
  job: string,
  handler: (
    event: FlatfileEvent,
    tick: (progress: number, message?: string) => Promise<Flatfile.JobResponse>
  ) => Promise<void | Flatfile.JobCompleteDetails>,
  opts: PluginOptions = {}
) {
  return (listener: FlatfileListener) => {
    listener.on('job:ready', { job }, async (event) => {
      const { jobId } = event.context

      await api.jobs.ack(jobId, {
        info: 'Accepted',
        progress: 10,
      })

      const tick = async (progress: number, info?: string) => {
        return await api.jobs.ack(jobId, {
          progress,
          ...(info !== undefined && { info }),
        })
      }

      let outcome
      try {
        outcome = await handler(event, tick)

        if (opts.debug) {
          log('@flatfile/plugin-job-handler', 'Job complete')
        }
        await api.jobs.complete(
          jobId,
          outcome ?? {
            outcome: {
              message: 'Job complete',
            },
          }
        )
      } catch (error) {
        logError('@flatfile/plugin-job-handler', error.message)
        await api.jobs.fail(
          jobId,
          outcome ?? {
            info: String(error.message),
            outcome: {
              acknowledge: true,
              message: String(error.message),
            },
          }
        )
      }
    })
  }
}
