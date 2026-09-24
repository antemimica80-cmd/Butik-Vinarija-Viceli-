// Generates real-coastline SVG paths (Natural Earth 1:10m via world-atlas) for the
// Pelješac / Dingač geography section. Output: src/generated/map.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { feature } from 'topojson-client';

const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/land-10m.json', import.meta.url)));
const land = feature(topo, topo.objects.land);

function makeProjector([minLon, minLat, maxLon, maxLat], width) {
  const k = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180); // equirectangular, latitude-corrected
  const w = (maxLon - minLon) * k, h = maxLat - minLat;
  const s = width / w, height = Math.round(h * s);
  return { width, height, p: ([lon, lat]) => [((lon - minLon) * k * s), ((maxLat - lat) * s)] };
}

// Sutherland–Hodgman clip against a slightly padded viewport rectangle
function clip(pts, w, h, pad = 4) {
  const edges = [[p => p[0] >= -pad, (a, b) => ix(a, b, 0, -pad)], [p => p[0] <= w + pad, (a, b) => ix(a, b, 0, w + pad)],
                 [p => p[1] >= -pad, (a, b) => ix(a, b, 1, -pad)], [p => p[1] <= h + pad, (a, b) => ix(a, b, 1, h + pad)]];
  function ix(a, b, axis, v) { const t = (v - a[axis]) / (b[axis] - a[axis]); return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]; }
  let out = pts;
  for (const [inside, cut] of edges) {
    const input = out; out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i], prev = input[(i + input.length - 1) % input.length];
      if (inside(cur)) { if (!inside(prev)) out.push(cut(prev, cur)); out.push(cur); }
      else if (inside(prev)) out.push(cut(prev, cur));
    }
    if (!out.length) break;
  }
  return out;
}

function pathFor(bbox, width, minArea = 0) {
  const pr = makeProjector(bbox, width);
  let d = '';
  const polys = land.features.flatMap(f => f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates);
  for (const poly of polys) {
    for (const ring of poly) {
      // skip rings entirely outside bbox (with margin)
      const inside = ring.some(([x, y]) => x > bbox[0] - .5 && x < bbox[2] + .5 && y > bbox[1] - .5 && y < bbox[3] + .5);
      if (!inside) continue;
      let pts = clip(ring.map(pr.p), pr.width, pr.height);
      if (pts.length < 3) continue;
      pts = pts.filter((q, i) => i === 0 || Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1]) > 0.9);
      pts.push(pts[0]);
      let area = 0; for (let i = 0; i < pts.length - 1; i++) area += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1];
      if (Math.abs(area / 2) < minArea) continue;
      d += 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z';
    }
  }
  return { d, width: pr.width, height: pr.height, project: pr.p };
}

// Places (approximate WGS84 coordinates, for orientation only)
const places = {
  dingac: [17.345, 42.962], dubrovnik: [18.094, 42.650], ston: [17.697, 42.838],
  orebic: [17.178, 42.975], korcula: [17.135, 42.960], split: [16.440, 43.508], zagreb: [15.98, 45.81]
};

const region = pathFor([16.85, 42.55, 18.25, 43.15], 1000, 2);
const regionPlaces = Object.fromEntries(Object.entries(places).map(([k, v]) => [k, region.project(v).map(n => +n.toFixed(1))]));
const croatia = pathFor([13.2, 42.3, 19.6, 46.6], 400, 1);
const croatiaPlaces = { dingac: croatia.project(places.dingac).map(n => +n.toFixed(1)), zagreb: croatia.project(places.zagreb).map(n => +n.toFixed(1)) };
const frame = croatia.project([16.85, 43.15]).concat(croatia.project([18.25, 42.55]));

mkdirSync(new URL('./generated/', import.meta.url), { recursive: true });
writeFileSync(new URL('./generated/map.json', import.meta.url), JSON.stringify({
  region: { d: region.d, width: region.width, height: region.height, places: regionPlaces },
  croatia: { d: croatia.d, width: croatia.width, height: croatia.height, places: croatiaPlaces, frame: frame.map(n => +n.toFixed(1)) }
}));
console.log('map.json written', region.width, region.height, region.d.length, croatia.d.length);
