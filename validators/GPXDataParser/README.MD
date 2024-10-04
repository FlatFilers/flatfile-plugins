# Flatfile GPX Parser Plugin

A powerful Flatfile Listener plugin for parsing and analyzing GPX (GPS Exchange Format) files. This plugin extracts valuable information from GPX files, performs data processing, and provides statistical analysis.

## Features

- Parse GPX files containing waypoints, tracks, and routes
- Convert GPX data to a tabular format
- Calculate total distance and elevation gain
- Remove duplicate points
- Filter data by date range
- Extract metadata such as name and description
- Count waypoints, tracks, and routes

## Installation

To install the plugin, run the following command:

```bash
npm install @flatfile/plugin-gpx-parser
```

## Example Usage

```typescript
import { FlatfileListener } from "@flatfile/listener";
import gpxParser from "@flatfile/plugin-gpx-parser";

export default function (listener: FlatfileListener) {
  listener.use(gpxParser);
}
```

## Configuration

The plugin accepts the following configuration options through record fields:

- `gpx_file`: (Required) The content of the GPX file as a string
- `remove_duplicates`: Set to "true" to remove duplicate points
- `filter_dates`: Set to "true" to filter points by date range
- `start_date`: The start date for filtering (when `filter_dates` is true)
- `end_date`: The end date for filtering (when `filter_dates` is true)

## Behavior

1. The plugin parses the GPX file content provided in the `gpx_file` field.
2. It extracts waypoints, tracks, and routes from the GPX data.
3. The data is converted to a tabular format for easier processing.
4. If `remove_duplicates` is set to "true", duplicate points are removed.
5. If `filter_dates` is set to "true" and valid start and end dates are provided, the data is filtered by date range.
6. The plugin calculates statistics such as total distance and elevation gain.
7. Metadata and statistics are set on the record fields:
   - `name`: Name from GPX metadata
   - `description`: Description from GPX metadata
   - `waypoint_count`: Number of waypoints
   - `track_count`: Number of tracks
   - `route_count`: Number of routes
   - `total_distance`: Calculated total distance in kilometers
   - `elevation_gain`: Calculated elevation gain in meters
   - `point_count`: Total number of points after processing
   - `tabular_data`: JSON string of the processed tabular data

The plugin handles errors gracefully and adds appropriate error messages to the record if parsing fails or required data is missing.