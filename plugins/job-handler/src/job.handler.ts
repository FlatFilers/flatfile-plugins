import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import api, { Flatfile } from '@flatfile/api'
import { logError } from '@flatfile/util-common'

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
 * @param {Function} handler - A function that takes a job and an event, returning
 * a promise that resolves to either void or a JobOutcome object. This function will be
 * used to process the job when the "job:ready" event is emitted.
 *
 * @returns {Function} Returns a function that takes a FlatfileListener, adding an event
 * listener for the "job:ready" event and processing the job with the provided handler.
 */
export function jobHandler(
  job: string,
  handler: (event: FlatfileEvent) => Promise<void | Flatfile.JobOutcome>,
  opts: PluginOptions = {}
) {
  // Returns a function which will configure a listener
  return function (listener: FlatfileListener) {
    // Adding an event listener for "job:ready" event
    listener.on('job:ready', { job }, async (e) => {
      // Extracting the jobId from the event context
      const { jobId } = e.context

      // Acknowledging the job to Flatfile API with progress of 10% and an info message
      await api.jobs.ack(jobId, {
        info: 'Accepted',
        progress: 10,
      })

      let outcome

      try {
        // Passing job data and the event to the provided handler function and storing the outcome
        outcome = await handler(e)

        // Completing the job with the outcome from the handler, or a default message if the outcome is undefined
        await api.jobs.complete(
          jobId,
          outcome ?? {
            outcome: {
              message: 'Job complete',
            },
          }
        )
      } catch (error) {
        // Logging the error and reporting a failure to the Flatfile API if the handler throws an error
        logError('@flatfile/plugin-job-handler', error)
        await api.jobs.fail(
          jobId,
          outcome ?? {
            info: String(error),
            outcome: {
              message: String(error),
            },
          }
        )
      }
    })
  }
}
