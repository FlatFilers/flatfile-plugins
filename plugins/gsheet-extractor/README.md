# @flatfile/plugin-gsheet-extractor

This package parses all Google sheets files and extracts them into Flatfile.

`npm i @flatfile/plugin-xlsx-extractor`

## Prerequisites (WIP)
1. Create a google service account, and save the json file with private keys locally.
2. Create the following flatfile secrets below using the google service account json:
  - google-cloud-project-id
  - google-cloud-private-key-id
  - google-cloud-private-key-1 (too long for one secret, split it in half)
  - google-cloud-private-key-2
  - google-cloud-client-email
  - google-cloud-client-id
  - google-cloud-client-cert-url
3. Share one or more folders with your google service account, to enable access (can be root).

## Get Started
TODO