# Strava GPX Fetcher Plugin for Flatfile

This Flatfile Listener plugin fetches GPX data from Strava, parses it, and converts it to a tabular format suitable for Flatfile. It includes authentication with the Strava API, data fetching, parsing, and caching to optimize performance.

## Features

- Authenticates with Strava API
- Fetches GPX data for specified Strava activities
- Parses GPX data and converts it to tabular format
- Caches fetched data to reduce API calls
- Integrates seamlessly with Flatfile Listener
- Handles error logging and information logging

## Installation

Install the plugin using npm:

```bash
npm install @flatfile/plugin-strava-gpx-fetcher
```

## Example Usage

```javascript
import { FlatfileListener } from '@flatfile/listener';
import { stravaGPXFetcher } from '@flatfile/plugin-strava-gpx-fetcher';

const listener = new FlatfileListener();

const config = {
  clientId: 'your_strava_client_id',
  clientSecret: 'your_strava_client_secret',
  redirectUri: 'your_redirect_uri'
};

listener.use(stravaGPXFetcher(config));

// ... rest of your Flatfile setup
```

## Configuration

The plugin requires the following configuration:

- `clientId`: Your Strava API client ID
- `clientSecret`: Your Strava API client secret
- `redirectUri`: The redirect URI set in your Strava API application

## Behavior

1. The plugin listens for the 'job:ready' event.
2. When triggered, it sets up a listener for the 'strava:fetch-gpx' event.
3. On 'strava:fetch-gpx', it:
   - Checks the cache for existing GPX data
   - If not cached, authenticates with Strava and fetches the GPX data
   - Parses the GPX data and converts it to tabular format
   - Inserts the data into the specified Flatfile sheet
4. The plugin handles errors and logs information throughout the process.

Note: This plugin requires an authorization code obtained through the OAuth flow with Strava. Ensure you have set up the OAuth flow in your application before using this plugin.