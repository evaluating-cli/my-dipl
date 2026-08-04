import { useEffect, useMemo, useReducer } from "react";
import { selectSession, sessionReducer, emptySession } from "../game/sessionReducer";

export function useGameSession() {
  const [state, dispatch] = useReducer(sessionReducer, undefined, emptySession);
  const generation = state.pendingResolution;
  useEffect(() => {
    if (generation === null) return;
    const timer = window.setTimeout(() => dispatch({ type: "RESOLVE_COMMIT", generation }), 650);
    return () => window.clearTimeout(timer);
  }, [generation]);
  const view = useMemo(() => state.game ? selectSession(state) : null, [state]);
  return { state, view, dispatch };
}

export type GameSession = ReturnType<typeof useGameSession>;
