#!/usr/bin/env node

const { mdToPdf } = require('md-to-pdf');
const path = require('path');

async function convertMarkdownToPdf(mdFile, pdfFile) {
  try {
    const pdf = await mdToPdf(
      { path: mdFile },
      {
        dest: pdfFile,
        pdf_options: {
          format: 'A4',
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
          },
          printBackground: true
        },
        stylesheet: './github-style.css'
      }
    );

    console.log(`✓ PDF created successfully: ${pdfFile}`);
  } catch (error) {
    console.error('Error converting markdown to PDF:', error);
    process.exit(1);
  }
}

const mdFile = './issue-3.md';
const pdfFile = './issue-3.pdf';

convertMarkdownToPdf(mdFile, pdfFile);
