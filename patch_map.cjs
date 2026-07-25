const fs = require('fs');
const mapStr = fs.readFileSync('src/data/map.ts', 'utf8');
const pos = JSON.parse(fs.readFileSync('pos.json', 'utf8'));

// map pos keys to uppercase
const upPos = {};
for (const k of Object.keys(pos)) {
  upPos[k.toUpperCase()] = pos[k];
}

// STp is STP, GoL is GOL, etc. Let's handle any mismatches.
upPos['STP'] = upPos['STP']; // just in case
upPos['NWG'] = upPos['NRG']; // Norwegian Sea vs Nrg?
upPos['MAO'] = upPos['MAT']; // Mid-Atlantic Ocean vs MAt?
upPos['NAO'] = upPos['NAT']; // North Atlantic vs NAt?
upPos['GOL'] = upPos['GOL']; // Gulf of Lyon

// Let's replace the x and y in map.ts
let updated = mapStr;
// Regex to match `{ id: "LON", name: "London", ..., x: 405, y: 310, ... }`
updated = updated.replace(/\{([^}]+id:\s*"([A-Z]+)"[^}]+)x:\s*[0-9.]+,\s*y:\s*[0-9.]+([^}]+)\}/g, (match, before, id, after) => {
  let p = upPos[id];
  if (!p) {
    if (id === 'NWG' && upPos['NRG']) p = upPos['NRG'];
    else if (id === 'MAO' && upPos['MAT']) p = upPos['MAT'];
    else if (id === 'NAO' && upPos['NAT']) p = upPos['NAT'];
    else if (id === 'GOL' && upPos['GOL']) p = upPos['GOL'];
    else if (id === 'BOT' && upPos['BOT']) p = upPos['BOT'];
  }
  
  if (p) {
    return `{${before}x: ${p.x}, y: ${p.y}${after}}`;
  }
  console.log("No pos for", id);
  return match;
});

fs.writeFileSync('src/data/map.ts', updated);
