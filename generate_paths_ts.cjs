const fs = require('fs');
const paths = JSON.parse(fs.readFileSync('paths.json', 'utf8'));

let out = `export const PROVINCE_PATHS: Record<string, string> = {\n`;
for (const [id, d] of Object.entries(paths)) {
  out += `  "${id}": "${d}",\n`;
}
out += `};\n`;

fs.writeFileSync('src/data/paths.ts', out);
