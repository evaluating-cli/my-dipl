const MAP_WIDTH = 1000;
const MAP_HEIGHT = 800;

export function BoardDefinitions() {
  return (
    <defs>
      <radialGradient id="paper" cx="50%" cy="40%" r="75%"><stop offset="0%" stopColor="#f7f1dd" /><stop offset="70%" stopColor="#efe6cd" /><stop offset="100%" stopColor="#e2d4b2" /></radialGradient>
      <radialGradient id="seaGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#dbeffb" /><stop offset="75%" stopColor="#cfe2ec" /><stop offset="100%" stopColor="#bdd4e2" /></radialGradient>
      <linearGradient id="landGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#fbf9f4" /><stop offset="100%" stopColor="#eae1cb" /></linearGradient>
      <marker id="arrMove" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#d97706" /></marker>
      <marker id="arrSup" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#0891b2" /></marker>
    </defs>
  );
}

export function BoardBackground() {
  return <rect x={-600} y={-600} width={MAP_WIDTH + 1200} height={MAP_HEIGHT + 1200} fill="url(#paper)" />;
}

export function BoardDecorations() {
  return (
    <>
      <g stroke="#a59169" strokeWidth={0.5} strokeDasharray="1 11" opacity={0.35} pointerEvents="none">
        <line x1={-600} y1={200} x2={MAP_WIDTH + 600} y2={200} /><line x1={-600} y1={400} x2={MAP_WIDTH + 600} y2={400} /><line x1={-600} y1={600} x2={MAP_WIDTH + 600} y2={600} />
        <line x1={300} y1={-600} x2={300} y2={MAP_HEIGHT + 600} /><line x1={600} y1={-600} x2={600} y2={MAP_HEIGHT + 600} /><line x1={900} y1={-600} x2={900} y2={MAP_HEIGHT + 600} />
      </g>
      <g transform="translate(110, 750)" stroke="#a08c60" fill="none" opacity={0.65} pointerEvents="none">
        <circle r={34} strokeWidth={0.8} /><circle r={37} strokeWidth={0.4} strokeDasharray="2 3" /><circle r={30} strokeWidth={0.4} />
        <path d="M 0,0 L 4.5,-10 L 0,-33 L -4.5,-10 Z" fill="#8a7a56" strokeWidth={0.4} /><path d="M 0,0 L -4.5,10 L 0,33 L 4.5,10 Z" fill="#8a7a56" strokeWidth={0.4} opacity={0.7} /><path d="M 0,0 L 10,4.5 L 33,0 L 10,-4.5 Z" fill="#8a7a56" strokeWidth={0.4} opacity={0.8} /><path d="M 0,0 L -10,-4.5 L -33,0 L -10,4.5 Z" fill="#8a7a56" strokeWidth={0.4} opacity={0.6} />
        <path d="M 0,0 L 3.5,-7 L 18,-18 L 7,-3.5 Z" fill="#a08c60" strokeWidth={0.4} opacity={0.5} /><path d="M 0,0 L -3.5,7 L -18,18 L -7,3.5 Z" fill="#a08c60" strokeWidth={0.4} opacity={0.5} /><path d="M 0,0 L -7,-3.5 L -18,-18 L -3.5,-7 Z" fill="#a08c60" strokeWidth={0.4} opacity={0.5} /><path d="M 0,0 L 7,3.5 L 18,18 L 3.5,7 Z" fill="#a08c60" strokeWidth={0.4} opacity={0.5} />
        <text x={0} y={-38} textAnchor="middle" style={{ fontSize: 9, fontFamily: "Cinzel", fontWeight: "bold", fill: "#5c5140" }}>N</text><text x={38} y={3} textAnchor="middle" style={{ fontSize: 7.5, fontFamily: "Cinzel", fontWeight: "bold", fill: "#5c5140" }}>E</text><text x={0} y={43} textAnchor="middle" style={{ fontSize: 7.5, fontFamily: "Cinzel", fontWeight: "bold", fill: "#5c5140" }}>S</text><text x={-40} y={3} textAnchor="middle" style={{ fontSize: 7.5, fontFamily: "Cinzel", fontWeight: "bold", fill: "#5c5140" }}>W</text>
      </g>
    </>
  );
}
