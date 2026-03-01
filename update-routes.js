// Quick script to update all routes to async/await
import { readFileSync, writeFileSync } from 'fs';

const files = [
  'server/routes/vehicles.js',
  'server/routes/repairs.js',
  'server/routes/invoices.js'
];

files.forEach(file => {
  let content = readFileSync(file, 'utf8');
  
  // Replace all db.prepare().get() with await
  content = content.replace(/db\.prepare\((.*?)\)\.get\((.*?)\)/g, 'await db.prepare($1).get($2)');
  
  // Replace all db.prepare().all() with await
  content = content.replace(/db\.prepare\((.*?)\)\.all\((.*?)\)/g, 'await db.prepare($1).all($2)');
  
  // Replace all db.prepare().run() with await
  content = content.replace(/db\.prepare\((.*?)\)\.run\((.*?)\)/g, 'await db.prepare($1).run($2)');
  
  // Add async to route handlers that don't have it
  content = content.replace(/router\.(get|post|put|delete)\(([^,]+),\s*\(/g, 'router.$1($2, async (');
  
  writeFileSync(file, content);
  console.log(`✅ Updated ${file}`);
});

console.log('Done!');
