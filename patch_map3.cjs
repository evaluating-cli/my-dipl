const fs = require('fs');
let mapStr = fs.readFileSync('src/data/map.ts', 'utf8');
const pos = JSON.parse(fs.readFileSync('pos.json', 'utf8'));

const upPos = {};
for (const k of Object.keys(pos)) {
  upPos[k.toUpperCase()] = pos[k];
}

const customMap = {
  'MAO': 'MID'
};

mapStr = mapStr.replace(/\{([^}]+id:\s*"([A-Z]+)"[^}]+)x:\s*[0-9.]+,\s*y:\s*[0-9.]+([^}]+)\}/g, (match, before, id, after) => {
  let mappedId = customMap[id] || id;
  let p = upPos[mappedId];
  
  if (p) {
    return `{${before}x: ${Math.round(p.x)}, y: ${Math.round(p.y)}${after}}`;
  }
  return match;
});

fs.writeFileSync('src/data/map.ts', mapStr);
