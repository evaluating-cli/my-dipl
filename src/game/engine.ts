import {
  GREAT_POWERS,
  HOME_SUPPLY,
  POWER_MAP,
  PROVINCE_MAP,
  PROVINCES,
  STARTING_UNITS,
  WIN_CENTERS,
  type PowerId,
  type UnitType,
} from "../data/map";

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------
export interface Unit {
  id: string;
  type: UnitType; // A = army, F = fleet
  power: PowerId;
  loc: string; // province id
}

export type OrderType = "hold" | "move" | "support";
export interface Order {
  type: OrderType;
  to?: string; // destination for a move
  supLoc?: string; // province of the supported unit
}

export type ValidationErrorCode =
  | "UNKNOWN_UNIT" | "WRONG_POWER" | "INVALID_ORDER_TYPE" | "MISSING_TARGET"
  | "ILLEGAL_DESTINATION" | "NO_UNIT_TO_SUPPORT" | "TOO_MANY_BUILDS"
  | "TOO_MANY_DISBANDS" | "INCOMPLETE_ADJUSTMENT" | "DUPLICATE_BUILD"
  | "DUPLICATE_DISBAND" | "OCCUPIED_CENTER" | "INELIGIBLE_HOME_CENTER"
  | "INVALID_UNIT_TYPE" | "FLEET_REQUIRES_COAST";

export interface ValidationError {
  code: ValidationErrorCode;
  message: string;
  unitId?: string;
  loc?: string;
  index?: number;
}

export interface ValidationResult<T> {
  valid: boolean;
  value?: T;
  errors: ValidationError[];
}

export type Phase = "Order" | "Adjust" | "GameOver";
export type Season = "Spring" | "Fall";

export interface GameState {
  year: number;
  season: Season;
  phase: Phase;
  units: Unit[];
  /** supply-centre ownership: province id -> power */
  centers: Record<string, PowerId>;
  /** the power controlled by the human */
  human: PowerId;
  log: string[];
  winner?: PowerId;
  defeat?: boolean;
}

export const provName = (id: string) => PROVINCE_MAP[id]?.name ?? id;
export const powerName = (id: PowerId) => POWER_MAP[id]?.name ?? id;

// ---------------------------------------------------------------------------
// Adjacency (symmetrised — each province only lists forward links)
// ---------------------------------------------------------------------------
const ADJ: Record<string, Set<string>> = {};
for (const p of PROVINCES) ADJ[p.id] = new Set(p.adj);
for (const p of PROVINCES) {
  for (const n of p.adj) {
    if (ADJ[n]) ADJ[n].add(p.id);
  }
}

export function adjacent(a: string, b: string): boolean {
  return ADJ[a]?.has(b) ?? false;
}

export function neighbours(id: string): string[] {
  return Array.from(ADJ[id] ?? []);
}

/** Legal destinations for a unit (armies stay on land, fleets need water or coast). */
export function legalTargets(u: Unit): string[] {
  return neighbours(u.loc).filter((id) => {
    const t = PROVINCE_MAP[id];
    if (u.type === "A") return t.kind === "land";
    return t.coast;
  });
}

/** Pure validation for a single movement-phase order. */
export function validateMovementOrder(
  state: GameState,
  unit: Unit,
  candidate: unknown,
): ValidationResult<Order> {
  const fail = (error: ValidationError): ValidationResult<Order> => ({ valid: false, errors: [error] });
  if (!state.units.some((u) => u.id === unit.id)) {
    return fail({ code: "UNKNOWN_UNIT", unitId: unit.id, message: `Unit ${unit.id} is not in this game.` });
  }
  if (!candidate || typeof candidate !== "object" || !("type" in candidate)) {
    return fail({ code: "INVALID_ORDER_TYPE", unitId: unit.id, message: "The order type is missing or invalid." });
  }
  const order = candidate as Partial<Order>;
  if (order.type === "hold") return { valid: true, value: { type: "hold" }, errors: [] };
  if (order.type === "move") {
    if (typeof order.to !== "string") return fail({ code: "MISSING_TARGET", unitId: unit.id, message: "A move requires a destination." });
    if (!legalTargets(unit).includes(order.to)) return fail({ code: "ILLEGAL_DESTINATION", unitId: unit.id, loc: order.to, message: `${unitLabel(unit)} cannot move to ${provName(order.to)}.` });
    return { valid: true, value: { type: "move", to: order.to }, errors: [] };
  }
  if (order.type === "support") {
    if (typeof order.supLoc !== "string") return fail({ code: "MISSING_TARGET", unitId: unit.id, message: "A support order requires a unit to support." });
    if (!neighbours(unit.loc).includes(order.supLoc)) return fail({ code: "ILLEGAL_DESTINATION", unitId: unit.id, loc: order.supLoc, message: `${unitLabel(unit)} cannot support ${provName(order.supLoc)}.` });
    if (!state.units.some((u) => u.loc === order.supLoc)) return fail({ code: "NO_UNIT_TO_SUPPORT", unitId: unit.id, loc: order.supLoc, message: `There is no unit in ${provName(order.supLoc)} to support.` });
    return { valid: true, value: { type: "support", supLoc: order.supLoc }, errors: [] };
  }
  return fail({ code: "INVALID_ORDER_TYPE", unitId: unit.id, message: "The order type is invalid." });
}

export function validMoveTargets(state: GameState, unit: Unit): string[] {
  return neighbours(unit.loc).filter((to) => validateMovementOrder(state, unit, { type: "move", to }).valid);
}

export function validSupportTargets(state: GameState, unit: Unit): string[] {
  return neighbours(unit.loc).filter((supLoc) => validateMovementOrder(state, unit, { type: "support", supLoc }).valid);
}

/** Invalid, missing, and foreign order keys are harmless: every affected unit holds. */
export function normalizeMovementOrders(state: GameState, orders: Record<string, unknown>): Record<string, Order> {
  return Object.fromEntries(state.units.map((unit) => {
    const checked = validateMovementOrder(state, unit, orders[unit.id]);
    return [unit.id, checked.valid ? checked.value! : { type: "hold" }];
  }));
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
export function createGame(human: PowerId): GameState {
  const units: Unit[] = STARTING_UNITS.map((s, i) => ({
    id: `u${i}`,
    type: s.type,
    power: s.power,
    loc: s.loc,
  }));
  const centers: Record<string, PowerId> = {};
  for (const p of PROVINCES) {
    if (p.supply === "home") centers[p.id] = p.owner as PowerId;
    else if (p.supply === "neutral") centers[p.id] = "NEU";
  }
  return {
    year: 1901,
    season: "Spring",
    phase: "Order",
    units,
    centers,
    human,
    log: [`Spring 1901 — the great powers mobilise. You command the forces of ${powerName(human)}.`],
  };
}

// ---------------------------------------------------------------------------
// Supply-centre accounting
// ---------------------------------------------------------------------------
function zeroCounts(): Record<PowerId, number> {
  return { ENG: 0, FRA: 0, GER: 0, ITA: 0, AUS: 0, RUS: 0, TUR: 0, NEU: 0 };
}

export function supplyCount(state: GameState): Record<PowerId, number> {
  const counts = zeroCounts();
  for (const id of Object.keys(state.centers)) counts[state.centers[id]] += 1;
  return counts;
}

export function unitCount(state: GameState): Record<PowerId, number> {
  const counts = zeroCounts();
  for (const u of state.units) counts[u.power] += 1;
  return counts;
}

export function topPower(state: GameState): PowerId {
  const sc = supplyCount(state);
  let best: PowerId = "NEU";
  let bestN = -1;
  for (const p of GREAT_POWERS) {
    if (sc[p] > bestN) {
      bestN = sc[p];
      best = p;
    }
  }
  return best;
}

export function winnerOf(state: GameState): PowerId | undefined {
  const sc = supplyCount(state);
  return GREAT_POWERS.find((p) => sc[p] >= WIN_CENTERS);
}

// ---------------------------------------------------------------------------
// Movement adjudication (iterative fixpoint so chain moves resolve correctly)
// ---------------------------------------------------------------------------
export interface MovementResult {
  units: Unit[];
  events: string[];
  /** provinces worth highlighting after resolution */
  changed: string[];
}

export function unitLabel(u: Unit): string {
  return `${u.type === "A" ? "Army" : "Fleet"} ${provName(u.loc)}`;
}

export function resolveMovement(
  state: GameState,
  orders: Record<string, Order>,
): MovementResult {
  const units = state.units;
  orders = normalizeMovementOrders(state, orders);
  const events: string[] = [];
  const unitAt: Record<string, Unit> = {};
  for (const u of units) unitAt[u.loc] = u;

  const getOrder = (u: Unit): Order => orders[u.id] ?? { type: "hold" };

  // --- Supports and which ones are cut -------------------------------------
  const supporters = units
    .map((u) => ({ u, o: getOrder(u) }))
    .filter((x) => x.o.type === "support" && x.o.supLoc);

  const cut = new Set<string>();
  for (const { u } of supporters) {
    for (const m of units) {
      const mo = getOrder(m);
      if (mo.type === "move" && mo.to === u.loc && m.power !== u.power) {
        cut.add(u.id);
        break;
      }
    }
  }

  // --- Strength helpers -----------------------------------------------------
  const moveStr = (u: Unit): number => {
    const o = getOrder(u);
    if (o.type !== "move" || !o.to) return 0;
    let s = 1;
    for (const { u: su, o: so } of supporters) {
      if (cut.has(su.id)) continue;
      const supported = unitAt[so.supLoc as string];
      if (!supported || supported.id !== u.id) continue;
      const so2 = getOrder(supported);
      if (so2.type === "move" && so2.to === o.to) s += 1;
    }
    return s;
  };

  const holdStr = (loc: string): number => {
    const holder = unitAt[loc];
    if (!holder) return 0;
    let s = 1;
    for (const { u: su, o: so } of supporters) {
      if (cut.has(su.id)) continue;
      if (so.supLoc === loc) s += 1;
    }
    return s;
  };

  const bestUnique = (list: Unit[]): Unit | null => {
    let best: Unit | null = null;
    let bestStr = -1;
    let tie = false;
    for (const u of list) {
      const s = moveStr(u);
      if (s > bestStr) {
        best = u;
        bestStr = s;
        tie = false;
      } else if (s === bestStr) tie = true;
    }
    return tie ? null : best;
  };

  // --- Group moves by destination -------------------------------------------
  const byDest: Record<string, Unit[]> = {};
  for (const u of units) {
    const o = getOrder(u);
    if (o.type === "move" && o.to) (byDest[o.to] ??= []).push(u);
  }

  const success = new Set<string>();
  const dislodged = new Set<string>();
  const attackerSrc: Record<string, string> = {};

  // Fixpoint: a province opens only when its holder's move has *succeeded*.
  let active = true;
  let guard = 0;
  while (active && guard++ < 60) {
    active = false;
    for (const dest of Object.keys(byDest)) {
      const pending = byDest[dest].filter(
        (u) => !success.has(u.id) && !dislodged.has(u.id),
      );
      if (pending.length === 0) continue;

      const holder = unitAt[dest];
      const holderMoving = holder && getOrder(holder).type === "move";
      const open =
        !holder || dislodged.has(holder.id) || (holderMoving && success.has(holder.id));

      if (open) {
        const b = bestUnique(pending);
        if (b) {
          success.add(b.id);
          active = true;
        }
        continue;
      }

      // Occupied and staying: enemies must beat the defender's strength.
      const def = holderMoving ? 1 : holdStr(dest); // a moving unit defends alone
      const enemies = pending.filter((u) => u.power !== holder!.power);
      const b = bestUnique(enemies);
      if (b && moveStr(b) > def) {
        success.add(b.id);
        dislodged.add(holder!.id);
        attackerSrc[holder!.id] = b.loc;
        // If the holder had already "won" its own destination, its move now
        // fails — unwind so the destination can be contested again.
        if (holderMoving && success.has(holder!.id)) success.delete(holder!.id);
        active = true;
      }
    }
  }

  // --- Events ---------------------------------------------------------------
  for (const u of units) {
    const o = getOrder(u);
    if (o.type !== "move" || !o.to || !success.has(u.id)) continue;
    const vacated = unitAt[o.to];
    if (vacated && dislodged.has(vacated.id)) {
      events.push(
        `${unitLabel(u)} storms ${provName(o.to)}, driving out the ${powerName(vacated.power)} ${vacated.type === "A" ? "army" : "fleet"}.`,
      );
    } else {
      events.push(`${unitLabel(u)} advances to ${provName(o.to)}.`);
    }
  }
  for (const u of units) {
    const o = getOrder(u);
    if (o.type === "move" && o.to && !success.has(u.id) && !dislodged.has(u.id)) {
      events.push(`${unitLabel(u)} fails to reach ${provName(o.to)} — the move bounces.`);
    }
  }

  // --- Apply moves -----------------------------------------------------------
  const occupied = new Set<string>();
  const survivors = units.filter((u) => !dislodged.has(u.id));
  for (const u of survivors) occupied.add(u.loc);

  const result: Unit[] = [];
  for (const u of survivors) {
    const o = getOrder(u);
    if (o.type === "move" && o.to && success.has(u.id)) {
      occupied.delete(u.loc);
      occupied.add(o.to);
      result.push({ ...u, loc: o.to });
    } else {
      result.push({ ...u });
    }
  }

  // --- Retreats or disbands ---------------------------------------------------
  for (const u of units) {
    if (!dislodged.has(u.id)) continue;
    const src = attackerSrc[u.id];
    const cands = legalTargets(u).filter(
      (id) => !occupied.has(id) && id !== src && !result.some((r) => r.loc === id),
    );
    if (cands.length > 0) {
      const dest = cands[0];
      result.push({ ...u, loc: dest });
      occupied.add(dest);
      events.push(`Dislodged ${unitLabel(u)} retreats to ${provName(dest)}.`);
    } else {
      events.push(`Dislodged ${unitLabel(u)} has nowhere to retreat and is disbanded.`);
    }
  }

  // --- Highlight set -----------------------------------------------------------
  const changed = new Set<string>();
  for (const u of units) {
    const o = getOrder(u);
    if (o.type === "move" && o.to && success.has(u.id)) changed.add(o.to);
  }
  for (const u of units) if (dislodged.has(u.id)) changed.add(u.loc);

  return { units: result, events, changed: Array.from(changed) };
}

// ---------------------------------------------------------------------------
// End-of-Fall: update supply-centre ownership from occupancy
// ---------------------------------------------------------------------------
export function applyFallOwnership(state: GameState): {
  centers: Record<string, PowerId>;
  changed: string[];
} {
  const centers = { ...state.centers };
  const changed: string[] = [];
  const unitAt: Record<string, Unit> = {};
  for (const u of state.units) unitAt[u.loc] = u;

  for (const id of Object.keys(centers)) {
    const p = PROVINCE_MAP[id];
    if (!p || !p.supply) continue;
    const occupant = unitAt[id];
    if (occupant && centers[id] !== occupant.power) {
      centers[id] = occupant.power;
      changed.push(id);
    }
  }
  return { centers, changed };
}

// ---------------------------------------------------------------------------
// AI — grabs free centres, then marches toward the nearest frontier
// ---------------------------------------------------------------------------
function isUncontrolledSC(state: GameState, id: string, power: PowerId): boolean {
  return PROVINCE_MAP[id].supply != null && state.centers[id] !== power;
}

/** BFS distance from every province to the nearest SC `power` does not own. */
function frontierDist(state: GameState, power: PowerId): Record<string, number> {
  const dist: Record<string, number> = {};
  const q: string[] = [];
  for (const p of PROVINCES) {
    if (p.supply && state.centers[p.id] !== power) {
      dist[p.id] = 0;
      q.push(p.id);
    }
  }
  while (q.length > 0) {
    const cur = q.shift() as string;
    for (const n of neighbours(cur)) {
      if (dist[n] === undefined) {
        dist[n] = dist[cur] + 1;
        q.push(n);
      }
    }
  }
  return dist;
}

export function generateAIOrders(state: GameState): Record<string, Order> {
  const orders: Record<string, Order> = {};
  const occupied = new Set(state.units.map((u) => u.loc));

  for (const power of GREAT_POWERS) {
    if (power === state.human) continue;
    const mine = state.units.filter((u) => u.power === power);
    const dist = frontierDist(state, power);

    // Pass 1 — grab adjacent uncontested supply centres.
    for (const u of mine) {
      const targets = legalTargets(u).filter((t) => !occupied.has(t));
      const prize = targets
        .filter((t) => isUncontrolledSC(state, t, power))
        .sort((a, b) => dist[a] - dist[b])[0];
      if (prize) {
        orders[u.id] = { type: "move", to: prize };
        occupied.delete(u.loc);
        occupied.add(prize);
      }
    }

    // Pass 2 — otherwise march toward the nearest uncontrolled centre.
    for (const u of mine) {
      if (orders[u.id]) continue;
      const here = dist[u.loc] ?? 99;
      const step = legalTargets(u)
        .filter((t) => !occupied.has(t) && (dist[t] ?? 99) < here)
        .sort((a, b) => (dist[a] ?? 99) - (dist[b] ?? 99))[0];
      if (step) {
        orders[u.id] = { type: "move", to: step };
        occupied.delete(u.loc);
        occupied.add(step);
      }
    }

    // Pass 3 — remaining units support a friendly attacker heading for a
    // centre this power does not control; else hold.
    for (const u of mine) {
      if (orders[u.id]) continue;
      const helper = legalTargets(u)
        .map((t) => state.units.find((x) => x.power === power && x.loc === t))
        .find((ally) => {
          if (!ally) return false;
          const ao = orders[ally.id];
          return ao?.type === "move" && !!ao.to && isUncontrolledSC(state, ao.to, power);
        });
      orders[u.id] = helper ? { type: "support", supLoc: helper.loc } : { type: "hold" };
    }
  }
  return orders;
}

// ---------------------------------------------------------------------------
// Adjustments (Winter builds / disbands)
// ---------------------------------------------------------------------------
export interface AdjustPlan {
  builds: { power: PowerId; type: UnitType; loc: string }[];
  disbands: string[]; // unit ids
}

export function emptyHomeCenters(state: GameState, power: PowerId): string[] {
  const occupied = new Set(state.units.map((u) => u.loc));
  return (HOME_SUPPLY[power as Exclude<PowerId, "NEU">] ?? []).filter(
    (c) => state.centers[c] === power && !occupied.has(c),
  );
}

/** Validate one power's winter plan without mutating game state. */
export function validateAdjustmentPlan(
  state: GameState,
  power: PowerId,
  plan: AdjustPlan,
  requireComplete = false,
): ValidationResult<AdjustPlan> {
  const errors: ValidationError[] = [];
  const delta = supplyCount(state)[power] - unitCount(state)[power];
  const allowedBuilds = Math.max(0, delta);
  const requiredDisbands = Math.max(0, -delta);
  if (plan.builds.length > allowedBuilds) errors.push({ code: "TOO_MANY_BUILDS", message: `${powerName(power)} may build at most ${allowedBuilds} unit(s).` });
  if (plan.disbands.length > requiredDisbands) errors.push({ code: "TOO_MANY_DISBANDS", message: `${powerName(power)} may disband at most ${requiredDisbands} unit(s).` });
  if (requireComplete && (plan.builds.length !== Math.min(allowedBuilds, emptyHomeCenters(state, power).length) || plan.disbands.length !== requiredDisbands)) {
    errors.push({ code: "INCOMPLETE_ADJUSTMENT", message: "The required winter adjustments have not all been selected." });
  }
  const occupied = new Set(state.units.map((u) => u.loc));
  const buildLocs = new Set<string>();
  plan.builds.forEach((build, index) => {
    if (build.power !== power) errors.push({ code: "WRONG_POWER", index, loc: build.loc, message: "A build cannot be submitted for another power." });
    if (buildLocs.has(build.loc)) errors.push({ code: "DUPLICATE_BUILD", index, loc: build.loc, message: `Only one unit may be built in ${provName(build.loc)}.` });
    buildLocs.add(build.loc);
    if (!(HOME_SUPPLY[power as Exclude<PowerId, "NEU">] ?? []).includes(build.loc) || state.centers[build.loc] !== power) {
      errors.push({ code: "INELIGIBLE_HOME_CENTER", index, loc: build.loc, message: `${provName(build.loc)} is not an eligible owned home centre.` });
    }
    if (occupied.has(build.loc)) errors.push({ code: "OCCUPIED_CENTER", index, loc: build.loc, message: `${provName(build.loc)} is occupied.` });
    if (build.type !== "A" && build.type !== "F") errors.push({ code: "INVALID_UNIT_TYPE", index, loc: build.loc, message: "Unit type must be army or fleet." });
    if (build.type === "F" && !PROVINCE_MAP[build.loc]?.coast) errors.push({ code: "FLEET_REQUIRES_COAST", index, loc: build.loc, message: `A fleet cannot be built in inland ${provName(build.loc)}.` });
  });
  const ids = new Set<string>();
  plan.disbands.forEach((id, index) => {
    if (ids.has(id)) errors.push({ code: "DUPLICATE_DISBAND", index, unitId: id, message: `Unit ${id} is listed more than once.` });
    ids.add(id);
    const unit = state.units.find((u) => u.id === id);
    if (!unit) errors.push({ code: "UNKNOWN_UNIT", index, unitId: id, message: `Unit ${id} is not in this game.` });
    else if (unit.power !== power) errors.push({ code: "WRONG_POWER", index, unitId: id, message: `${powerName(power)} cannot disband another power's unit.` });
  });
  return { valid: errors.length === 0, value: errors.length === 0 ? plan : undefined, errors };
}

export function validBuildTypes(state: GameState, power: PowerId, loc: string): UnitType[] {
  return (["A", "F"] as UnitType[]).filter((type) => validateAdjustmentPlan(state, power, { builds: [{ power, type, loc }], disbands: [] }).valid);
}

export function validDisbandUnitIds(state: GameState, power: PowerId): string[] {
  return state.units.filter((unit) => unit.power === power && validateAdjustmentPlan(state, power, { builds: [], disbands: [unit.id] }).valid).map((unit) => unit.id);
}

export function applyAdjustments(state: GameState, plan: AdjustPlan): GameState {
  const powers = new Set<PowerId>([
    ...plan.builds.map((b) => b.power),
    ...plan.disbands.map((id) => state.units.find((u) => u.id === id)?.power).filter((p): p is PowerId => !!p),
  ]);
  const errors = [...powers].flatMap((power) => validateAdjustmentPlan(state, power, {
    builds: plan.builds.filter((b) => b.power === power),
    disbands: plan.disbands.filter((id) => state.units.find((u) => u.id === id)?.power === power),
  }).errors);
  if (errors.length) throw new Error(errors.map((error) => error.message).join(" "));
  let units = state.units.filter((u) => !plan.disbands.includes(u.id));
  let nextId = 1000 + units.length;
  for (const b of plan.builds) {
    units.push({ id: `u${nextId++}`, type: b.type, power: b.power, loc: b.loc });
  }
  const log = [...state.log];
  for (const b of plan.builds) {
    log.push(
      `${powerName(b.power)} raises a new ${b.type === "A" ? "army" : "fleet"} in ${provName(b.loc)}.`,
    );
  }
  for (const id of plan.disbands) {
    const u = state.units.find((x) => x.id === id);
    if (u) log.push(`${powerName(u.power)} disbands ${unitLabel(u)}.`);
  }
  return { ...state, units };
}
