import api from "@flatfile/api";
import { FlatfileEvent } from "@flatfile/listener";
import * as fs from "fs";
import * as R from "remeda";
import * as XLSX from "xlsx";

/**
 * Plugin config options.
 *
 * @property {boolean} debug - show helpul messages useful for debugging (use intended for development).
 */
export interface PluginOptions {
  readonly debug?: boolean;
}

/**
 * Runs extractor and creates an `.xlsx` file with all Flatfile Workbook data.
 *
 * @param event - Flatfile event
 * @param opts - plugin config options
 */
export const run = async (
  event: FlatfileEvent,
  opts: PluginOptions
): Promise<void> => {
  const { environmentId, jobId, spaceId, workbookId } = event.context;

  try {
    const { data: sheets } = await api.sheets.list({ workbookId });

    if (opts.debug) {
      const meta = R.pipe(
        sheets,
        R.reduce((acc, sheet) => {
          return acc + `\n\t'${sheet.name}' (${sheet.id})`;
        }, "")
      );

      logInfo("Sheets found in Flatfile workbook:" + meta);
    }

    const workbook = XLSX.utils.book_new();

    try {
      await api.jobs.ack(jobId, {
        info: "Starting job to write to Excel file",
        progress: 10,
      });

      for (const sheet of sheets) {
        try {
          const { data } = await api.records.get(sheet.id);

          const rows = R.pipe(
            data.records,
            R.map(({ values: row }) => {
              return R.pipe(
                Object.keys(row),
                R.reduce((acc, colName) => {
                  return {
                    ...acc,
                    [colName]: row[colName].value,
                  };
                }, {})
              );
            })
          );

          const worksheet = XLSX.utils.json_to_sheet(rows);

          XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            // Limit sheet name to 31 characters
            sheet.name.substring(0, 31)
          );
        } catch (_getRecordsError: unknown) {
          logError("Failed to fetch records for sheet with id: " + sheet.id);

          return;
        }
      }
    } catch (_jobAckError: unknown) {
      logError("Failed to acknowledge job with id: " + jobId);

      return;
    }

    const fileName = `Workbook-${currentEpoch()}.xlsx`;

    try {
      XLSX.writeFileXLSX(workbook, fileName);

      if (opts.debug) {
        logInfo("File written to disk");
      }
    } catch (_writeError: unknown) {
      logError("Failed to write file to disk");

      await api.jobs.fail(jobId, {
        outcome: {
          message:
            "Job failed because it could not write the Excel Workbook to disk.",
        },
      });

      return;
    }

    try {
      const reader = fs.createReadStream(fileName);

      await api.files.upload(reader, {
        spaceId,
        environmentId,
        mode: "export",
      });

      reader.close();

      if (opts.debug) {
        logInfo(
          `Excel document uploaded. View file at https://spaces.flatfile.com/space/${spaceId}/files?mode=export`
        );
      }
    } catch (_uploadError: unknown) {
      logError("Failed to upload file");

      await api.jobs.fail(jobId, {
        outcome: {
          message: "Job failed because it could not upload Excel file.",
        },
      });

      return;
    }

    try {
      await api.jobs.complete(jobId, {
        outcome: {
          message:
            'Data was successfully written to Excel file and uploaded. You can access the workbook in the "Available Downloads" section of the Files page in Flatfile.',
        },
      });

      if (opts.debug) {
        logInfo("Done");
      }
    } catch (_jobError: unknown) {
      logError("Failed to complete job");

      return;
    }
  } catch (_fetchSheetsError: unknown) {
    logError("Failed to fetch sheets for workbook id: " + workbookId);

    return;
  }
};

const currentEpoch = (): string => {
  return `${Math.floor(Date.now() / 1000)}`;
};

const logError = (msg: string): void => {
  console.error("[@flatfile/plugin-xlsx-workbook-sink]:[FATAL] " + msg);
};

const logInfo = (msg: string): void => {
  console.log("[@flatfile/plugin-xlsx-workbook-sink]:[INFO] " + msg);
};

const logWarn = (msg: string): void => {
  console.warn("[@flatfile/plugin-xlsx-workbook-sink]:[WARN] " + msg);
};
