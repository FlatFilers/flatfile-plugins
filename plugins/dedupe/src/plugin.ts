import api, { Flatfile } from "@flatfile/api";
import { FlatfileEvent } from "@flatfile/listener";
import * as R from "remeda";
import { match } from "ts-pattern";

/**
 * Plugin config options.
 *
 * @property {string} on - field key to match on
 * @property {string} keep - "first" | "last"
 * @property {function} custom - custom dedupe function
 * @property {boolean} debug - show helpul messages useful for debugging (usage intended for development)
 */
export interface PluginOptions {
  readonly on?: string;
  readonly keep?: "first" | "last";
  readonly custom?: (records: Flatfile.RecordsWithLinks) => Array<string>;
  readonly debug?: boolean;
}

/**
 * Keep the first record encountered based on the specified key.
 *
 * @internal
 */
export const keepFirst = (
  records: Flatfile.RecordsWithLinks,
  key: string
): Array<string> => {
  let uniques = new Set();

  return R.pipe(
    records,
    R.reduce((acc, record) => {
      const { value } = record.values[key];

      if (uniques.has(value)) {
        return [...acc, record.id];
      } else {
        uniques.add(value);

        return acc;
      }
    }, [] as Array<string>)
  );
};

/**
 * Keep the last record encountered based on the specified key.
 *
 * @internal
 */
export const keepLast = (
  records: Flatfile.RecordsWithLinks,
  key: string
): Array<string> => {
  const seen = R.pipe(
    records,
    R.reduce((acc, record) => {
      if (R.isNil(record.values[key].value)) {
        return acc;
      }

      const value = String(record.values[key].value);

      if (R.isNil(acc[value])) {
        return {
          ...acc,
          [value]: [record.id],
        };
      } else {
        return {
          ...acc,
          [value]: acc[value].concat(record.id),
        };
      }
    }, {} as Record<string, Array<string>>)
  );

  return R.pipe(
    Object.keys(seen),
    R.reduce((acc, key) => {
      const ids = seen[String(key)];

      if (R.length(ids) > 1) {
        return R.pipe(R.dropLast(ids, 1), (removeThese) => [
          ...acc,
          ...removeThese,
        ]);
      } else {
        return acc;
      }
    }, [] as Array<string>)
  );
};

/**
 * Dedupe records in a sheet.
 *
 * @param event - Flatfile event
 * @param opts - plugin config options
 */
export const dedupe = async (
  event: FlatfileEvent,
  opts: PluginOptions
): Promise<void> => {
  const { sheetId } = event.context;

  try {
    const { data } = await api.records.get(sheetId);

    const removeThese = match(opts.keep)
      .with("first", () => {
        return keepFirst(data.records, opts.on);
      })
      .with("last", () => {
        return keepLast(data.records, opts.on);
      })
      .otherwise(() => {
        return opts.custom(data.records);
      });

    if (opts.debug) {
      logInfo(
        "Removing records with ids: " + JSON.stringify(removeThese, null, 2)
      );
    }

    try {
      await api.records.delete(sheetId, { ids: removeThese });

      if (opts.debug) {
        logInfo("Successfully removed records");
      }
    } catch (_removeRecordsError: unknown) {
      logError("Failed to remove records");
    }
  } catch (_fetchRecordsError: unknown) {
    logError("Failed to fetch records");
  }

  if (opts.debug) {
    logInfo("Done");
  }
};

const logError = (msg: string): void => {
  console.error("[@flatfile/plugin-dedupe]:[FATAL] " + msg);
};

const logInfo = (msg: string): void => {
  console.log("[@flatfile/plugin-dedupe]:[INFO] " + msg);
};

const logWarn = (msg: string): void => {
  console.warn("[@flatfile/plugin-dedupe]:[WARN] " + msg);
};
