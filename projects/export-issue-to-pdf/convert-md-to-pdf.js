#!/usr/bin/env node

const { mdToPdf } = require("md-to-pdf");
const path = require("path");
const fs = require("fs");

async function convertMarkdownToPdf(mdFile, pdfFile) {
  try {
    const pdf = await mdToPdf(
      { path: mdFile },
      {
        dest: pdfFile,
        pdf_options: {
          format: "A4",
          margin: {
            top: "20mm",
            right: "20mm",
            bottom: "20mm",
            left: "20mm",
          },
          printBackground: true,
        },
        stylesheet: path.join(__dirname, "github-style.css"),
      },
    );

    console.log(`✓ PDF created successfully: ${pdfFile}`);
  } catch (error) {
    console.error("Error converting markdown to PDF:", error);
    process.exit(1);
  }
}

// Find markdown files in current directory
const currentDir = process.cwd();
const files = fs.readdirSync(currentDir);
const mdFiles = files.filter((file) => file.endsWith("study-guide.md"));

if (mdFiles.length === 0) {
  console.error("Error: No markdown files found in current directory");
  process.exit(1);
}

if (mdFiles.length > 1) {
  console.error(
    `Error: Multiple markdown files found. Please specify which one to convert:`,
  );
  mdFiles.forEach((file) => console.error(`  - ${file}`));
  process.exit(1);
}

const mdFile = path.join(currentDir, mdFiles[0]);
const pdfFile = path.join(currentDir, mdFiles[0].replace(".md", ".pdf"));

convertMarkdownToPdf(mdFile, pdfFile);
