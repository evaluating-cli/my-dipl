const fs = require('fs');
let code = fs.readFileSync('src/components/Board.tsx', 'utf8');

// Replace seas
code = code.replace(
  /\{PROVINCES\.filter\(\(p\) => p\.kind === "sea"\)\.map\(\(p\) => \{[\s\S]*?return \([\s\S]*?\);\n        \}\)\}/,
  `{PROVINCES.filter((p) => p.kind === "sea").map((p) => (
          <SeaNode
            key={p.id}
            p={p}
            isHover={hoverId === p.id}
            isMoveT={highlightMove.has(p.id)}
            isSupT={highlightSupport.has(p.id)}
            hasUnit={!!unitsByLoc[p.id]}
            onEnter={() => setHoverId(p.id)}
            onLeave={() => setHoverId((h) => (h === p.id ? null : h))}
            onClick={() => handleProvince(p.id)}
          />
        ))}`
);

// Replace lands
code = code.replace(
  /\{PROVINCES\.filter\(\(p\) => p\.kind === "land"\)\.map\(\(p\) => \{[\s\S]*?return \([\s\S]*?\);\n        \}\)\}/,
  `{PROVINCES.filter((p) => p.kind === "land").map((p) => (
          <LandNode
            key={p.id}
            p={p}
            isHover={hoverId === p.id}
            isMoveT={highlightMove.has(p.id)}
            isSupT={highlightSupport.has(p.id)}
            isChanged={changed.includes(p.id)}
            hasUnit={!!unitsByLoc[p.id]}
            supplyOwner={game.centers[p.id] ?? null}
            onEnter={() => setHoverId(p.id)}
            onLeave={() => setHoverId((h) => (h === p.id ? null : h))}
            onClick={() => handleProvince(p.id)}
          />
        ))}`
);

// Replace units
code = code.replace(
  /\{game\.units\.map\(\(u\) => \{[\s\S]*?return \([\s\S]*?\);\n        \}\)\}/,
  `{game.units.map((u) => (
          <UnitNode
            key={u.id}
            id={u.id}
            type={u.type}
            loc={u.loc}
            power={u.power}
            selected={u.id === selectedUnitId}
            isHuman={u.power === game.human}
            phase={game.phase}
            onEnter={() => setHoverId(u.loc)}
            onClick={(e) => {
              e.stopPropagation();
              handleUnit(u);
            }}
          />
        ))}`
);

fs.writeFileSync('src/components/Board.tsx', code);
