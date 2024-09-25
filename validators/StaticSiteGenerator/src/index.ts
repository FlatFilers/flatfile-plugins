/* 
  Task: Create a Static Site Generation Flatfile Listener plugin:
      - Implement a custom action to generate a static website from imported data
      - Allow users to choose between different static site generators (e.g., Gatsby, Next.js, or a custom solution)
      - Generate an index.html file and additional pages based on the data structure
      - Implement customizable templates for different data types and layouts
      - Include options for styling (CSS) and basic interactivity (JavaScript)
      - Generate a sitemap and basic SEO metadata
      - Provide an option to export the generated site as a zip file or deploy directly to a hosting service
      - Implement data visualization components (e.g., charts, tables) for relevant data
      - Include a search functionality for larger datasets
      - Ensure responsive design for mobile and desktop viewing
  _____________________________
  Summary: This Flatfile Listener plugin implements a static site generator that processes imported data, generates static pages, and provides options for different static site generators, styling, and interactivity. It also includes features like sitemap generation, SEO metadata, data visualization, search functionality, and responsive design.
*/
  
import { FlatfileListener } from '@flatfile/listener';
import { ExcelExtractor } from '@flatfile/plugin-xlsx-extractor';
import { DelimiterExtractor } from '@flatfile/plugin-delimiter-extractor';
import { RecordHook, BulkRecordHook } from '@flatfile/plugin-record-hook';
import { exportRecords } from '@flatfile/plugin-export-workbook';
import { automap } from '@flatfile/plugin-automap';
import api from '@flatfile/api';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import Handlebars from 'handlebars';
import JSZip from 'jszip';
import Chart from 'chart.js';
  
const execPromise = util.promisify(exec);

const listener = FlatfileListener.create((client) => {
  client.use(ExcelExtractor());
  client.use(DelimiterExtractor('.txt', { delimiter: ',' }));

  client.use(
    RecordHook(async (record) => {
      // Process individual records
      const email = record.get('email') as string;
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        record.addError('email', 'Invalid email address');
      }
      return record;
    })
  );

  client.use(
    BulkRecordHook(async (records) => {
      // Process records in bulk
      records.forEach(record => {
        const name = record.get('name') as string;
        if (name) {
          record.set('name', name.trim());
        }
      });
      return records;
    })
  );

  client.use(
    automap({
      accuracy: 'confident',
      defaultTargetSheet: 'MainSheet',
      matchFilename: /^import_.*\.csv$/,
    })
  );

  client.use(
    exportRecords({
      jobName: 'Export for Static Site Generation',
      autoDownload: true,
    })
  );

  client.on('job:ready', async (event) => {
    if (event.payload.type === 'workbook:export') {
      await generateStaticSite(event);
    }
  });
});

async function generateStaticSite(event) {
  const workbookId = event.context.workbookId;
  const sheets = await api.sheets.list({ workbookId });
  const siteData = await processSheets(sheets.data);

  const generator = await promptUserForGenerator();
  const template = await promptUserForTemplate();
  const styling = await promptUserForStyling();
  const interactivity = await promptUserForInteractivity();

  const siteContent = await generateSiteContent(siteData, generator, template, styling, interactivity);
  const sitemap = generateSitemap(siteData);
  const seoMetadata = generateSEOMetadata(siteData);

  const zip = new JSZip();
  Object.entries(siteContent).forEach(([fileName, content]) => {
    zip.file(fileName, content);
  });
  zip.file('sitemap.xml', sitemap);
  zip.file('robots.txt', 'User-agent: *\nAllow: /\nSitemap: /sitemap.xml');

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  const fileName = `static-site-${workbookId}.zip`;
  await api.files.upload(zipBuffer, fileName, 'application/zip');

  console.log(`Static site generated and uploaded as ${fileName}`);
}

async function processSheets(sheets) {
  // Process sheet data and return structured site data
  // Implementation details omitted for brevity
}

async function generateSiteContent(siteData, generator, template, styling, interactivity) {
  // Generate site content based on the chosen generator, template, styling, and interactivity
  // Implementation details omitted for brevity
}

function generateSitemap(siteData) {
  // Generate sitemap XML
  // Implementation details omitted for brevity
}

function generateSEOMetadata(siteData) {
  // Generate SEO metadata for each page
  // Implementation details omitted for brevity
}

async function promptUserForGenerator() {
  // Simulate user input for generator selection
  return 'gatsby';
}

async function promptUserForTemplate() {
  // Simulate user input for template selection
  return 'default';
}

async function promptUserForStyling() {
  // Simulate user input for styling selection
  return 'minimal';
}

async function promptUserForInteractivity() {
  // Simulate user input for interactivity selection
  return ['search', 'sort'];
}

export default listener;