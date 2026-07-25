const fs = require('fs');
const content = fs.readFileSync('package/target/src/standardMap/default/map-image.js', 'utf8');

const regex = /className:\s*"([^"]+)",\s*d:\s*"([^"]+)"/g;
const paths = {};

let match;
while ((match = regex.exec(content)) !== null) {
  let classes = match[1].split(' ');
  let provId = classes.find(c => c !== 'fix-color' && c !== 'sea' && c !== 'land');
  if (provId) {
    paths[provId] = match[2];
  }
}

fs.writeFileSync('paths.json', JSON.stringify(paths, null, 2));
console.log(Object.keys(paths).length, "paths extracted");
