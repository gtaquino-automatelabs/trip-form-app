const fs = require('fs');
const path = require('path');

// This script will output the SQL that needs to be executed
// You can pipe this to the Supabase MCP

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251020112641_remodel_bancos_brasileiros.sql');
const sql = fs.readFileSync(migrationPath, 'utf-8');

// Split into manageable chunks - the INSERT statement
const lines = sql.split('\n');
const insertStart = lines.findIndex(l => l.startsWith('INSERT INTO bancos_brasileiros'));
const insertEnd = lines.findIndex((l, idx) => idx > insertStart && l.trim() === ';');

// Get table creation + first chunk of inserts
const tableCreation = lines.slice(0, insertStart).join('\n');
const allInserts = lines.slice(insertStart, insertEnd + 1).join('\n');

console.log('=== TABLE ALREADY CREATED ===\n');
console.log('=== NOW EXECUTE THIS INSERT STATEMENT ===\n');
console.log(allInserts);
