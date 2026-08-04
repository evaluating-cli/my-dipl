import { PROVINCE_CONNECTIONS } from "./geometry";

export default function AdjacencyConnections() {
  return (
    <g pointerEvents="none">
      {PROVINCE_CONNECTIONS.map((connection) => {
        const style = connection.kind === "sea"
          ? { stroke: "#47708a", dash: "3 5", opacity: 0.26, width: 1.2 }
          : connection.kind === "coastal"
            ? { stroke: "#8e7b57", dash: "1 4", opacity: 0.18, width: 1 }
            : { stroke: "#a59169", dash: "4 4", opacity: 0.28, width: 1.1 };
        return <line key={connection.key} x1={connection.from.x} y1={connection.from.y} x2={connection.to.x} y2={connection.to.y} stroke={style.stroke} strokeWidth={style.width} strokeDasharray={style.dash} strokeOpacity={style.opacity} fill="none" />;
      })}
    </g>
  );
}
