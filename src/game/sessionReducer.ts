import { GREAT_POWERS, POWER_MAP, PROVINCE_MAP, WIN_CENTERS, type PowerId, type UnitType } from "../data/map";
import {
  applyAdjustments, applyFallOwnership, createGame, emptyHomeCenters,
  generateAIOrders, generateAIRetreatChoices, legalRetreatDestinations, powerName,
  resolveMovement, resolveRetreats, supplyCount, topPower, unitCount,
  validateAdjustmentPlan, validBuildTypes, validDisbandUnitIds, winnerOf,
  type AdjustPlan, type GameState, type Order,
} from "./engine";

export type PendingMode = "move" | "support" | null;
export interface SessionState {
  game: GameState | null;
  orders: Record<string, Order>;
  selectedUnitId: string | null;
  pendingMode: PendingMode;
  changed: string[];
  builds: { type: UnitType; loc: string }[];
  disbands: string[];
  retreatChoices: Record<string, string | null>;
  selectedRetreatId: string | null;
  /** A monotonically increasing identity makes delayed adjudications cancellable. */
  generation: number;
  pendingResolution: number | null;
}

export type SessionAction =
  | { type: "START"; human: PowerId }
  | { type: "RESET" }
  | { type: "SET_ORDER"; unitId: string; order: Order }
  | { type: "CLEAR_ORDERS" }
  | { type: "SELECT_UNIT"; unitId: string | null }
  | { type: "SET_MODE"; mode: PendingMode }
  | { type: "CLEAR_CHANGED" }
  | { type: "RESOLVE_REQUEST" }
  | { type: "RESOLVE_COMMIT"; generation: number }
  | { type: "SELECT_RETREAT"; unitId: string | null }
  | { type: "SET_RETREAT"; unitId: string; destination: string | null }
  | { type: "CONFIRM_RETREATS" }
  | { type: "ADD_BUILD"; build: { type: UnitType; loc: string } }
  | { type: "REMOVE_BUILD"; loc: string }
  | { type: "TOGGLE_DISBAND"; unitId: string }
  | { type: "CONFIRM_ADJUSTMENTS" };

export const emptySession = (): SessionState => ({ game: null, orders: {}, selectedUnitId: null,
  pendingMode: null, changed: [], builds: [], disbands: [], retreatChoices: {},
  selectedRetreatId: null, generation: 0, pendingResolution: null });

function aiAdjustments(state: GameState): AdjustPlan {
  const plan: AdjustPlan = { builds: [], disbands: [] };
  const sc = supplyCount(state), uc = unitCount(state);
  for (const power of GREAT_POWERS) {
    if (power === state.human) continue;
    const diff = sc[power] - uc[power];
    if (diff > 0) for (const loc of emptyHomeCenters(state, power).slice(0, diff))
      plan.builds.push({ power, type: PROVINCE_MAP[loc].fleetAdj.length ? "F" : "A", loc });
    if (diff < 0) {
      const units = state.units.filter(u => u.power === power)
        .sort((a, b) => Number(state.centers[a.loc] === power) - Number(state.centers[b.loc] === power));
      plan.disbands.push(...units.slice(0, -diff).map(u => u.id));
    }
  }
  return plan;
}

function finishMovement(state: SessionState, moved: GameState, changed: string[]): SessionState {
  if (moved.dislodged.length) return { ...state, game: { ...moved, phase: "Retreat" }, changed,
    retreatChoices: {}, pendingResolution: null, orders: {} };
  if (moved.season === "Spring") return { ...state, game: { ...moved, season: "Fall", phase: "Order", dislodged: [] },
    changed, pendingResolution: null, orders: {} };
  const fall = applyFallOwnership(moved);
  const messages = fall.changed.map(id => `${PROVINCE_MAP[id].name} now belongs to ${POWER_MAP[fall.centers[id]].name}.`);
  let game = applyAdjustments({ ...moved, centers: fall.centers, phase: "Adjust", season: "Fall", dislodged: [],
    log: [...moved.log, ...messages] }, aiAdjustments({ ...moved, centers: fall.centers }));
  const winner = winnerOf(game);
  const defeated = !game.units.some(u => u.power === game.human) && supplyCount(game)[game.human] === 0;
  if (winner || defeated) game = { ...game, winner: winner ?? topPower(game), defeat: !winner || winner !== game.human,
    phase: "GameOver", log: [...game.log, winner ? `${powerName(winner)} controls ${WIN_CENTERS} supply centres — the war is won.` : `${powerName(game.human)} has been swept from the map.`] };
  return { ...state, game, changed: [...new Set([...changed, ...fall.changed])], builds: [], disbands: [],
    pendingResolution: null, orders: {} };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  const game = state.game;
  switch (action.type) {
    case "START": return { ...emptySession(), game: createGame(action.human), generation: state.generation + 1 };
    case "RESET": return { ...emptySession(), generation: state.generation + 1 };
    case "SET_ORDER": return game?.phase === "Order" ? { ...state, orders: { ...state.orders, [action.unitId]: action.order } } : state;
    case "CLEAR_ORDERS": return { ...state, orders: {} };
    case "SELECT_UNIT": return { ...state, selectedUnitId: action.unitId };
    case "SET_MODE": return { ...state, pendingMode: action.mode };
    case "CLEAR_CHANGED": return { ...state, changed: [] };
    case "RESOLVE_REQUEST": return !game || game.phase !== "Order" || state.pendingResolution !== null ? state
      : { ...state, pendingResolution: state.generation, selectedUnitId: null, pendingMode: null };
    case "RESOLVE_COMMIT": {
      if (!game || state.pendingResolution !== action.generation || state.generation !== action.generation) return state;
      const orders: Record<string, Order> = {};
      for (const unit of game.units) if (unit.power === game.human) orders[unit.id] = state.orders[unit.id] ?? { type: "hold" };
      Object.assign(orders, generateAIOrders(game));
      const result = resolveMovement(game, orders);
      return finishMovement(state, { ...game, units: result.units, dislodged: result.dislodged,
        log: [...game.log, `──── ${game.season} ${game.year} resolves ────`, ...result.events] }, result.changed);
    }
    case "SELECT_RETREAT": return { ...state, selectedRetreatId: action.unitId };
    case "SET_RETREAT": return { ...state, retreatChoices: { ...state.retreatChoices, [action.unitId]: action.destination }, selectedRetreatId: null };
    case "CONFIRM_RETREATS": if (game?.phase === "Retreat") {
      const resolved = resolveRetreats(game, { ...generateAIRetreatChoices(game), ...state.retreatChoices });
      return finishMovement({ ...state, retreatChoices: {}, selectedRetreatId: null }, resolved, game.dislodged.map(d => d.unit.loc));
    } return state;
    case "ADD_BUILD": {
      if (game?.phase !== "Adjust") return state;
      const proposed = [...state.builds, action.build];
      const plan = { builds: proposed.map(build => ({ power: game.human, ...build })), disbands: state.disbands };
      return validateAdjustmentPlan(game, game.human, plan).valid ? { ...state, builds: proposed } : state;
    }
    case "REMOVE_BUILD": return { ...state, builds: state.builds.filter(b => b.loc !== action.loc) };
    case "TOGGLE_DISBAND": {
      if (game?.phase !== "Adjust") return state;
      const proposed = state.disbands.includes(action.unitId) ? state.disbands.filter(id => id !== action.unitId) : [...state.disbands, action.unitId];
      const plan = { builds: state.builds.map(build => ({ power: game.human, ...build })), disbands: proposed };
      return validateAdjustmentPlan(game, game.human, plan).valid ? { ...state, disbands: proposed } : state;
    }
    case "CONFIRM_ADJUSTMENTS": {
      if (game?.phase !== "Adjust") return state;
      const plan: AdjustPlan = { builds: state.builds.map(b => ({ power: game.human, ...b })), disbands: state.disbands };
      if (!validateAdjustmentPlan(game, game.human, plan, true).valid) return state;
      const next = applyAdjustments(game, plan), year = game.year + 1;
      return { ...state, game: { ...next, year, season: "Spring", phase: "Order", log: [...next.log, `Winter ${game.year} passes — the campaign of ${year} begins.`] },
        builds: [], disbands: [], orders: {}, selectedUnitId: null, pendingMode: null, changed: [] };
    }
  }
}

export function selectSession(state: SessionState) {
  const game = state.game!; const sc = supplyCount(game), uc = unitCount(game);
  const humanUnits = game.units.filter(u => u.power === game.human);
  const buildCenters = emptyHomeCenters(game, game.human);
  const plan: AdjustPlan = { builds: state.builds.map(b => ({ power: game.human, ...b })), disbands: state.disbands };
  return { humanUnits, humanDislodged: game.dislodged.filter(d => d.unit.power === game.human), sc, uc,
    sortedPowers: [...GREAT_POWERS].sort((a,b) => sc[b]-sc[a]), buildCenters,
    canBuildN: Math.min(Math.max(0, sc[game.human]-uc[game.human]), buildCenters.length),
    mustDisbandN: Math.max(0, uc[game.human]-sc[game.human]), adjustmentPlan: plan,
    adjustmentValidation: validateAdjustmentPlan(game, game.human, plan, true),
    buildTypesByCenter: Object.fromEntries(buildCenters.map(loc => [loc, validBuildTypes(game, game.human, loc)])),
    disbandableIds: new Set(validDisbandUnitIds(game, game.human)),
    retreatDestinations: Object.fromEntries(game.dislodged.map(d => [d.unit.id, legalRetreatDestinations(game, d)])),
    orderedCount: humanUnits.filter(u => state.orders[u.id]).length };
}
