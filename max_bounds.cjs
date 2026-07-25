const pos = require('./pos.json');
let maxX = 0, maxY = 0;
for (let p of Object.values(pos)) {
  if (p.x > maxX) maxX = p.x;
  if (p.y > maxY) maxY = p.y;
}
console.log(maxX, maxY);
