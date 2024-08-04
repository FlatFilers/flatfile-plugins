export type ZipCodeData = {
  zip_code: string
  usps_city: string
  stusps_code: string
  ste_name: string
  zcta: string
  parent_zcta: null
  population: number
  density: number
  primary_coty_code: string
  primary_coty_name: string
  county_weights: string // Can be parsed to a more specific type if needed
  coty_name: string[]
  cty_code: string[]
  imprecise: string
  military: string
  timezone: string
  geo_point_2d: {
    lon: number
    lat: number
  }
}
