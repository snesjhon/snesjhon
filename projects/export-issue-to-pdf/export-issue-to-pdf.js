#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function exportGitHubIssueToPDF(issueUrl, outputPath) {
  const browser = await puppeteer.launch({
    headless: 'new'
  });

  try {
    const page = await browser.newPage();

    // Navigate to the GitHub issue
    await page.goto(issueUrl, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    console.log(`PDF exported successfully to: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

const issueUrl = 'https://github.com/snesjhon/snesjhon/issues/3';
const outputPath = './github-issue-3.pdf';

exportGitHubIssueToPDF(issueUrl, outputPath)
  .catch(error => {
    console.error('Error exporting PDF:', error);
    process.exit(1);
  });
