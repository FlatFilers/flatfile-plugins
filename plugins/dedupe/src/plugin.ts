import api, { Flatfile } from "@flatfile/api";
import { FlatfileEvent } from "@flatfile/listener";
import * as R from "remeda";

/**
 * Plugin config options.
 *
 * @property {boolean} debug - show helpul messages useful for debugging (use intended for development).
 */
export interface PluginOptions {
  readonly debug?: boolean;
}

export type Equals = (
  r1: Flatfile.RecordWithLinks,
  r2: Flatfile.RecordWithLinks
) => boolean;

/**
 * asdfasdf
 *
 * @param event - Flatfile event
 * @param equals - defines how to determine if 2 records are duplicates
 */
export const keepFirst = async (
  event: FlatfileEvent,
  equals: Equals
): Promise<void> => {
  const { sheetId } = event.context;

  try {
    const { data } = await api.records.get(sheetId);

    const removeThese = keepFirst$prime(data.records, equals);
    logInfo(
      "Removing records with ids: " + JSON.stringify(removeThese, null, 2)
    );

    try {
      await api.records.delete(sheetId, { ids: removeThese });
      logInfo("Successfully removed records");
    } catch (_error2: unknown) {
      logError("Failed to remove records");
    }
  } catch (_error: unknown) {
    logError("Failed to fetch records");
  }
};

export const keepFirst$prime = (
  records: Flatfile.RecordsWithLinks,
  equals: Equals
): Array<string> => {
  // let uniques: Readonly<Record<string, string>> = {}; // use a set instead?
  let uniques = new Set();
  // let removeThese: ReadonlyArray<string> = [];

  return R.pipe(
    records,
    R.reduce((acc, record) => {
      if (uniques.has(record.values["key"])) {
        return [...acc, record.id];
      } else {
        uniques.add(record.id);

        return acc;
      }
    }, [])
  );
};

/**
 * asdfasdf
 *
 * @param event - Flatfile event
 * @param equals - defines how to determine if 2 records are duplicates
 */
export const keepLast = async (
  event: FlatfileEvent,
  equals: Equals
): Promise<void> => {
  const { sheetId } = event.context;

  try {
    const { data } = await api.records.get(sheetId);

    const removeThese = keepLast$prime(data.records, equals);
    logInfo(
      "Removing records with ids: " + JSON.stringify(removeThese, null, 2)
    );

    try {
      await api.records.delete(sheetId, { ids: removeThese });
      logInfo("Successfully removed records");
    } catch (_error2: unknown) {
      logError("Failed to remove records");
    }
  } catch (_error: unknown) {
    logError("Failed to fetch records");
  }
};

export const keepLast$prime = (
  records: Flatfile.RecordsWithLinks,
  equals: Equals
): Array<string> => {
  // let uniques: Readonly<Record<string, string>> = {}; // use a set instead?
  let uniques = new Set();
  // let removeThese: ReadonlyArray<string> = [];

  return R.pipe(
    records,
    R.reduce((acc, record) => {
      if (uniques.has(record.values["key"])) {
        return [...acc, record.id];
      } else {
        uniques.add(record.id);

        return acc;
      }
    }, [])
  );
};

const logError = (msg: string): void => {
  console.error("[@flatfile/plugin-export-workbook]:[FATAL] " + msg);
};

const logInfo = (msg: string): void => {
  console.log("[@flatfile/plugin-export-workbook]:[INFO] " + msg);
};

const logWarn = (msg: string): void => {
  console.warn("[@flatfile/plugin-export-workbook]:[WARN] " + msg);
};
