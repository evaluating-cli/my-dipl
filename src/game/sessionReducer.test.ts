import { describe, expect, it } from "vitest";
import { createGame, type GameState } from "./engine";
import { emptySession, sessionReducer, type SessionState } from "./sessionReducer";

const start = (): SessionState => sessionReducer(emptySession(), { type: "START", human: "ENG" });
const resolve = (state: SessionState) => {
  const requested = sessionReducer(state, { type: "RESOLVE_REQUEST" });
  return sessionReducer(requested, { type: "RESOLVE_COMMIT", generation: requested.generation });
};

describe("sessionReducer", () => {
  it("owns a complete Spring → Fall → Adjust → Spring sequence", () => {
    let state = start();
    // Isolate one supported, stationary power so this lifecycle test is independent of AI tactics.
    const game = createGame("ENG");
    const unit = game.units.find(unit => unit.power === "ENG")!;
    state = { ...state, game: { ...game, units: [unit], centers: { [unit.loc]: "ENG" } } };
    state = resolve(state);
    expect([state.game?.phase, state.game?.season]).toEqual(["Order", "Fall"]);
    state = resolve(state);
    expect(state.game?.phase).toBe("Adjust");
    state = sessionReducer(state, { type: "CONFIRM_ADJUSTMENTS" });
    expect([state.game?.phase, state.game?.season, state.game?.year]).toEqual(["Order", "Spring", 1902]);
  });

  it("invalidates a pending animation when reset", () => {
    const pending = sessionReducer(start(), { type: "RESOLVE_REQUEST" });
    const generation = pending.generation;
    const reset = sessionReducer(pending, { type: "RESET" });
    expect(sessionReducer(reset, { type: "RESOLVE_COMMIT", generation })).toBe(reset);
    expect(reset.game).toBeNull();
  });

  it("ignores duplicate resolve requests and commits", () => {
    const pending = sessionReducer(start(), { type: "RESOLVE_REQUEST" });
    expect(sessionReducer(pending, { type: "RESOLVE_REQUEST" })).toBe(pending);
    const resolved = sessionReducer(pending, { type: "RESOLVE_COMMIT", generation: pending.generation });
    expect(sessionReducer(resolved, { type: "RESOLVE_COMMIT", generation: pending.generation })).toBe(resolved);
  });

  it("detects victory after Fall ownership", () => {
    let state = start();
    const game = state.game!;
    const centers: GameState["centers"] = Object.fromEntries(Object.keys(game.centers).map(id => [id, "ENG"]));
    state = { ...state, game: { ...game, season: "Fall", centers, units: game.units.map(unit => ({ ...unit, power: "ENG" })) } };
    state = resolve(state);
    expect(state.game).toMatchObject({ phase: "GameOver", winner: "ENG", defeat: false });
  });
});
