export const ROWS_TO_SEARCH_FOR_HEADER = 20

export interface DefaultOptions {
  algorithm: 'default'
  rowsToSearch?: number
}

export interface ExplicitHeadersOptions {
  algorithm: 'explicitHeaders'
  headers: string[]
  skip?: number
}

export interface SpecificRowsOptions {
  algorithm: 'specificRows'
  rowNumbers: number[]
  skip?: number
}

export interface DataRowAndSubHeaderDetectionOptions {
  algorithm: 'dataRowAndSubHeaderDetection'
  rowsToSearch?: number
}

export interface NewfangledOptions {
  algorithm: 'newfangled'
}

export interface AIDetectionOptions {
  algorithm: 'aiDetection'
  rowsToSearch?: number
}

export type GetHeadersOptions =
  | DefaultOptions
  | ExplicitHeadersOptions
  | SpecificRowsOptions
  | DataRowAndSubHeaderDetectionOptions
  | NewfangledOptions
  | AIDetectionOptions

export interface GetHeadersResult {
  header: string[]
  headerRow: number
  letters: string[]
}
