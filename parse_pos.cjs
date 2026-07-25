const fs = require('fs');
const content = fs.readFileSync('package/target/src/standardMap/default/position.js', 'utf8');

// There are two blocks: isDislodged and normal. We want normal (or it doesn't matter much).
// But let's find all occurrences of `location === $\.([A-Zaz]+)\) return \{ x: ([0-9.]+), y: ([0-9.]+) \}`
// Wait, the formatting might vary. Let's use a simple regex on the string.
const regex = /location === \$\.([A-Za-z]+)\s*\)\s*return \{ x: ([0-9.]+), y: ([0-9.]+) \}/g;

const pos = {};
let match;
while ((match = regex.exec(content)) !== null) {
  pos[match[1]] = { x: parseFloat(match[2]), y: parseFloat(match[3]) };
}
console.log(Object.keys(pos).length);
fs.writeFileSync('pos.json', JSON.stringify(pos, null, 2));
