/**
 * Manual Price Update Script
 * 
 * This script helps you update component prices manually.
 * Run this weekly to keep prices accurate with market rates.
 * 
 * Usage:
 *   node scripts/updatePrices.js
 */

const fs = require('fs');
const path = require('path');

const marketPricesPath = path.join(__dirname, '../src/utils/marketPrices.ts');

// Read current prices
const currentContent = fs.readFileSync(marketPricesPath, 'utf8');

// Update the timestamp in the file
const today = new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
const nextUpdateDate = nextWeek.toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

// Replace the timestamp
const timestampRegex = /Last Manual Update: .*?\n \* Next Update Due: .*?\n/;
const newTimestamp = `Last Manual Update: ${today}\n * Next Update Due: ${nextUpdateDate}\n`;

const updatedContent = currentContent.replace(timestampRegex, newTimestamp);

// Write back to file
fs.writeFileSync(marketPricesPath, updatedContent, 'utf8');

console.log('✅ Price update timestamp refreshed!');
console.log(`📅 Last Updated: ${today}`);
console.log(`📅 Next Update: ${nextUpdateDate}`);
console.log('');
console.log('🔧 Next steps:');
console.log('1. Open src/utils/marketPrices.ts');
console.log('2. Update prices from Amazon/Flipkart/MDComputers');
console.log('3. Test your changes with: npm run dev');
console.log('');
console.log('💡 Tip: Focus on GPUs and processors - they change most frequently!');
