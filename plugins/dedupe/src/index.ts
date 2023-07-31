import { FlatfileListener } from "@flatfile/listener";

// import { PluginOptions, run } from "./plugin";
import * as Dedupe from "./plugin";

/**
 * Dedupe plugin for Flatfile.
 *
 * @params jobName - Job name to match on
 * @param opts - plugin config options
 */
export const keepFirst = (jobName: string, equals: Dedupe.Equals) => {
  return (listener: FlatfileListener) => {
    listener.filter({ job: jobName }, () => {
      listener.on("job:ready", async (event) => {
        await Dedupe.keepFirst(event, equals);
      });
    });
  };
};

/**
 * Dedupe plugin for Flatfile.
 *
 * @params jobName - Job name to match on
 * @param opts - plugin config options
 */
export const keepLast = (jobName: string, equals: Dedupe.Equals) => {
  return (listener: FlatfileListener) => {
    listener.filter({ job: jobName }, () => {
      listener.on("job:ready", async (event) => {
        await Dedupe.keepLast(event, equals);
      });
    });
  };
};
