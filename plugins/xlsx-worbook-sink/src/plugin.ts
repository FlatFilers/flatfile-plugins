import api from "@flatfile/api";
import { FlatfileEvent } from "@flatfile/listener";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
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
          return acc + `\n\t'${sheet.name}' (${sheet.id})`;
        }, "")
      );
      logInfo("Sheets retrieved:" + meta);
    }

    const excelWorkbook = new ExcelJS.Workbook();

    try {
      await api.jobs.ack(jobId, {
        info: "Starting job to write to Excel file",
        progress: 10,
      });

      R.pipe(
        sheets,
        R.map(async (sheet) => {
          // Limit sheet name to 31 characters
          const worksheet = excelWorkbook.addWorksheet(
            sheet.name.substring(0, 31)
          );
          const { data } = await api.records.get(sheet.id);

          if (R.isEmpty(data.records)) {
            logWarn(`Found no records for '${sheet.name}' (${sheet.id})`);
            return;
          }

          // write header row columns
          R.pipe(
            data.records,
            R.first(),
            ({ values }) => Object.keys(values),
            (headers) => worksheet.addRow(headers).commit()
          );

          // write rows
          R.pipe(
            data.records,
            R.map(({ values: rowData }) => {
              R.pipe(
                Object.keys(rowData),
                R.reduce((acc, columnName) => {
                  return [...acc, rowData[columnName].value];
                }, []),
                (newRow) => worksheet.addRow(newRow).commit()
              );
            })
          );
        })
      );
    } catch (_jobAckError: unknown) {
      logError("Failed to acknowledge job with id: " + jobId);
      return;
    }

    if (config.debug) {
      logInfo("All data written to Excel workbook");
    }

    try {
      const dateTime = new Date().toISOString().replace(/[:.]/g, "-");
      const tempFilePath = path.join(__dirname, `Workbook_${dateTime}.xlsx`);

      await excelWorkbook.xlsx.writeFile(tempFilePath);

      const fileStream = fs.createReadStream(tempFilePath);

      await api.files
        .upload(fileStream, {
          spaceId,
          environmentId,
          mode: "export",
        })
        .then(() => {
          logInfo("Excel document uploaded");
        })
        .catch(() => {
          logError("Failed to upload file");
          return;
        });

      await api.jobs
        .complete(jobId, {
          outcome: {
            message:
              'Data was successfully written to Excel file and uploaded. You can access the workbook in the "Available Downloads" section of the Files page in Flatfile.',
          },
        })
        .then(() => {
          logInfo("Done");
        })
        .catch(() => {
          logError("Failed to complete job");
          return;
        });
    } catch (_writeError: unknown) {
      logError("Failed to write file");
      return;
    }
  } catch (_fetchSheetsError: unknown) {
    logError("Failed to fetch sheets for workbook id: " + workbookId);
    return;
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
