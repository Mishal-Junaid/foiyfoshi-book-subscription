/**
 * This script helps identify and fix remaining API path issues
 * where '/api' might be duplicated in API requests.
 * 
 * Run with: node fix-remaining-api-paths.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Directories to search for API calls
const DIRS_TO_CHECK = [
  path.join(__dirname, 'src/context'),
  path.join(__dirname, 'src/services'),
  path.join(__dirname, 'src/pages'),
  path.join(__dirname, 'src/components')
];

// Pattern to find API calls with the /api prefix
const API_CALL_REGEX = /api\.(get|post|put|patch|delete)\s*\(\s*['"]\/api\//g;
const API_REPLACEMENT = 'api.$1(\'/';

async function scanAndFixFiles() {
  let totalFilesScanned = 0;
  let totalFilesFixed = 0;
  let totalIssuesFixed = 0;
  
  console.log('Scanning for API path duplications...');
  
  for (const dir of DIRS_TO_CHECK) {
    await processDirectory(dir);
  }
  
  console.log(`\nScan complete!`);
  console.log(`Files scanned: ${totalFilesScanned}`);
  console.log(`Files fixed: ${totalFilesFixed}`);
  console.log(`Total API path issues fixed: ${totalIssuesFixed}`);
  
  async function processDirectory(dirPath) {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules and hidden directories
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            await processDirectory(entryPath);
          }
        } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
          totalFilesScanned++;
          await processFile(entryPath);
        }
      }
    } catch (error) {
      console.error(`Error processing directory ${dirPath}:`, error);
    }
  }
  
  async function processFile(filePath) {
    try {
      const content = await readFile(filePath, 'utf8');
      const fixedContent = content.replace(API_CALL_REGEX, API_REPLACEMENT);
      
      if (content !== fixedContent) {
        const matches = content.match(API_CALL_REGEX);
        const issuesFixed = matches ? matches.length : 0;
        
        await writeFile(filePath, fixedContent, 'utf8');
        totalFilesFixed++;
        totalIssuesFixed += issuesFixed;
        
        console.log(`✓ Fixed ${issuesFixed} API path issue(s) in: ${path.relative(__dirname, filePath)}`);
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }
}

scanAndFixFiles().catch(console.error);
