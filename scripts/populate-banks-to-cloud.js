const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, '..', 'bank_data.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvContent.trim().split('\n');
const banks = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];

  // Parse CSV line handling quoted fields with commas
  const fields = [];
  let currentField = '';
  let insideQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  fields.push(currentField);

  // Remove BOM from first field if present
  if (i === 1 && fields[0].charCodeAt(0) === 0xFEFF) {
    fields[0] = fields[0].substring(1);
  }

  const ispb = parseInt(fields[0].trim(), 10);
  const name = fields[1].trim().replace(/'/g, "''");
  const code = fields[2].trim();
  const fullName = fields[3].trim().replace(/'/g, "''");

  banks.push({ ispb, name, code, fullName });
}

console.log(`Total banks to insert: ${banks.length}`);

// Split into chunks of 50
const chunkSize = 50;
const chunks = [];

for (let i = 0; i < banks.length; i += chunkSize) {
  chunks.push(banks.slice(i, i + chunkSize));
}

console.log(`Split into ${chunks.length} chunks`);

// Generate SQL for each chunk
chunks.forEach((chunk, idx) => {
  const values = chunk.map(b => {
    const codeValue = b.code ? `'${b.code}'` : 'NULL';
    return `(${b.ispb}, '${b.name}', ${codeValue}, '${b.fullName}')`;
  });

  const sql = `INSERT INTO bancos_brasileiros (ispb, name, code, full_name) VALUES\n${values.join(',\n')}\nON CONFLICT (ispb) DO NOTHING;`;

  const filename = `/tmp/bank_chunk_${String(idx).padStart(2, '0')}.sql`;
  fs.writeFileSync(filename, sql);
  console.log(`Created ${filename} with ${chunk.length} banks`);
});

console.log('\nNow run these SQL files using the MCP Supabase execute_sql tool');
