const fs = require('fs');
const paths = JSON.parse(fs.readFileSync('paths.json', 'utf8'));

const customMap = {
  'Lvn': 'LIV',
  'Nwy': 'NOR',
  'Sui': 'SWI',
  'NAt': 'ATL',
  'Eng': 'ENC',
  'MAt': 'MAO',
  'Mar': 'MAR',
  'Ska': 'SKG',
  'Tyn': 'TYS',
  'BOt': 'BOT',
  'GoL': 'GOL',
  'Nrg': 'NWG',
  'Mid': 'MAO',
  'Wes': 'WES',
  'Eas': 'EAS',
  'Bla': 'BLA',
  'Bal': 'BAL',
  'Lvp': 'LVP'
};

let out = `export const PROVINCE_PATHS: Record<string, string> = {\n`;
for (const [id, d] of Object.entries(paths)) {
  let finalId = customMap[id] || id.toUpperCase();
  out += `  "${finalId}": "${d}",\n`;
}
out += `};\n`;

fs.writeFileSync('src/data/paths.ts', out);
