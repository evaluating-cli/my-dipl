const d3 = require("d3-geo");
const lonLatSpain = [-3.7, 40.4];
const lonLatLondon = [-0.1, 51.5];
const lonLatStP = [30.3, 59.9];
const lonLatConstantinople = [28.9, 41.0];
const xySpain = [130, 750];
const xyLondon = [250, 400];
const xyStP = [840, 240];
const xyConstantinople = [970, 810];

const projs = [
  d3.geoMercator(),
  d3.geoConicConformal().center([15, 55]),
  d3.geoAzimuthalEqualArea().center([15, 55])
];

for (let p=0; p<projs.length; p++) {
  const proj = projs[p];
  let bestErr = Infinity;
  let bestParams = null;
  for (let s = 500; s < 3500; s += 20) {
    for (let tx = -2000; tx < 2000; tx += 50) {
      for (let ty = -2000; ty < 2000; ty += 50) {
        proj.scale(s).translate([tx, ty]);
        const p1 = proj(lonLatSpain);
        const p2 = proj(lonLatLondon);
        const p3 = proj(lonLatStP);
        const p4 = proj(lonLatConstantinople);
        
        const err = Math.pow(p1[0]-xySpain[0], 2) + Math.pow(p1[1]-xySpain[1], 2) +
                    Math.pow(p2[0]-xyLondon[0], 2) + Math.pow(p2[1]-xyLondon[1], 2) +
                    Math.pow(p3[0]-xyStP[0], 2) + Math.pow(p3[1]-xyStP[1], 2) +
                    Math.pow(p4[0]-xyConstantinople[0], 2) + Math.pow(p4[1]-xyConstantinople[1], 2);
                    
        if (err < bestErr) {
          bestErr = err;
          bestParams = [s, tx, ty];
        }
      }
    }
  }
  proj.scale(bestParams[0]).translate([bestParams[1], bestParams[2]]);
  console.log("PROJ", p, bestParams, bestErr);
  console.log("Spain", proj(lonLatSpain), xySpain);
  console.log("London", proj(lonLatLondon), xyLondon);
  console.log("StP", proj(lonLatStP), xyStP);
  console.log("Constantinople", proj(lonLatConstantinople), xyConstantinople);
}
