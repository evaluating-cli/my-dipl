import { useState } from "react";
import Menu from "./components/Menu";
import Game from "./components/Game";
import { createGame, type GameState, type Order } from "./game/engine";
import { type PowerId, type UnitType } from "./data/map";

export default function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [pick, setPick] = useState<PowerId>("ENG");

  // Game active states
  const [humanOrders, setHumanOrders] = useState<Record<string, Order>>({});
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [pendingMode, setPendingMode] = useState<"move" | "support" | null>(null);
  const [changed, setChanged] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  // Winter adjustment states
  const [builds, setBuilds] = useState<{ type: UnitType; loc: string }[]>([]);
  const [disbands, setDisbands] = useState<string[]>([]);

  const handleStartGame = (p: PowerId) => {
    setGame(createGame(p));
    setHumanOrders({});
    setSelectedUnitId(null);
    setPendingMode(null);
    setChanged([]);
    setBusy(false);
    setBuilds([]);
    setDisbands([]);
  };

  const handleSetGame = (g: GameState | null) => {
    setGame(g);
    if (!g) {
      setHumanOrders({});
      setSelectedUnitId(null);
      setPendingMode(null);
      setChanged([]);
      setBusy(false);
      setBuilds([]);
      setDisbands([]);
    }
  };

  if (!game) {
    return <Menu pick={pick} setPick={setPick} onStart={handleStartGame} />;
  }

  return (
    <Game
      game={game}
      setGame={handleSetGame}
      humanOrders={humanOrders}
      setHumanOrders={setHumanOrders}
      selectedUnitId={selectedUnitId}
      setSelectedUnitId={setSelectedUnitId}
      pendingMode={pendingMode}
      setPendingMode={setPendingMode}
      changed={changed}
      setChanged={setChanged}
      busy={busy}
      setBusy={setBusy}
      builds={builds}
      setBuilds={setBuilds}
      disbands={disbands}
      setDisbands={setDisbands}
    />
  );
}
