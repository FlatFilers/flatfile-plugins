import api, { Flatfile } from "@flatfile/api";
import { FlatfileEvent } from "@flatfile/listener";
import * as ExcelJS from "exceljs";
import * as path from "path";
import * as fs from "fs";
import * as R from "remeda";

export interface PluginOptions {
  readonly debug?: boolean;
}

/**
 * Some JSDOC here
 */
export const run = async (event: FlatfileEvent, config: PluginOptions) => {
  const { environmentId, jobId, spaceId, workbookId } = event.context;

  try {
    const { data: sheets } = await api.sheets.list({ workbookId });

    if (config.debug) {
      const meta = R.pipe(
        sheets,
        R.reduce((acc, sheet) => {
          return acc + `\n\t${sheet.name}(${sheet.id})`;
        }, "")
      );
      logInfo("Sheets retrieved:" + meta);
    }

    const recordsForAllSheets: Record<string, Flatfile.RecordsWithLinks> =
      R.pipe(
        sheets,
        R.reduce(async (acc, sheet) => {
          return api.records
            .get(sheet.id)
            .then(({ data }) => {
              return Object.assign(acc, { [sheet.name]: data.records });
            })
            .catch((_sheetRecordsError: unknown) => {
              logError("Failed to fetch records for sheet: " + sheet.name);
              return acc;
            });
        }, {})
      );

    if (config.debug) {
      logInfo("Records for all sheets fetched");
    }

    const excelWorkbook = new ExcelJS.Workbook();

    try {
      await api.jobs.ack(jobId, {
        info: "Starting job to write to Excel file",
        progress: 10,
      });

      R.pipe(
        R.keys(recordsForAllSheets),
        R.map(async (sheetName) => {
          const newWorksheet = excelWorkbook.addWorksheet(
            sheetName.substring(0, 31)
          );
          const data = recordsForAllSheets[sheetName];

          if (R.length(data) > 0) {
            const headers = R.pipe(data, R.first(), ({ values }) => values);
            newWorksheet.addRow(headers);
          }

          R.pipe(
            data,
            R.map((record) => {
              const { values: cellData } = record;
              newWorksheet.addRow(cellData.value);
            })
          );

          if (config.debug) {
            logInfo("Data written to workbook");
          }

          try {
            const dateTime = new Date().toISOString().replace(/[:.]/g, "-");
            const tempFilePath = path.join(
              __dirname,
              `Workbook_${dateTime}.xlsx`
            );

            await excelWorkbook.xlsx.writeFile(tempFilePath);

            try {
              const fileStream = fs.createReadStream(tempFilePath);

              Promise.all([
                api.files.upload(fileStream, {
                  spaceId,
                  environmentId,
                  mode: "export",
                }),
                api.jobs.complete(jobId, {
                  outcome: {
                    message:
                      'Data was successfully written to Excel file and uploaded. You can access the workbook in the "Available Downloads" section of the Files page in Flatfile.',
                  },
                }),
              ]);
            } catch (_uploadError: unknown) {
              logError("Failed to upload file");
            }
          } catch (_writeError: unknown) {
            logError("Failed to write file");
          }
        })
      );
    } catch (_jobAckError: unknown) {
      logError("Failed to acknowledge job with id: " + jobId);
    }
  } catch (_fetchSheetsError: unknown) {
    logError("Failed to fetch sheets for workbook id: " + workbookId);
  }
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
