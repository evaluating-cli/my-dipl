import { useState } from "react";
import Menu from "./components/Menu";
import Game from "./components/Game";
import { type PowerId } from "./data/map";
import { useGameSession } from "./hooks/useGameSession";

export default function App() {
  const [pick, setPick] = useState<PowerId>("ENG");
  const session = useGameSession();
  const game = session.state.game;

  if (!game) {
    return <Menu pick={pick} setPick={setPick} onStart={(human) => session.dispatch({ type: "START", human })} />;
  }

  return (
    <Game session={session} />
  );
}
