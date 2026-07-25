const pos = require('./pos.json');
let minX = 9999, minY = 9999;
for (let p of Object.values(pos)) {
  if (p.x < minX) minX = p.x;
  if (p.y < minY) minY = p.y;
}
console.log(minX, minY);
