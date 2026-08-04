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
  /** Source province of the unit receiving support. */
  supportFrom?: string;
  /** Destination of the supported move; omitted for support-to-hold. */
  supportTo?: string;
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
  forcedCuts: ReadonlySet<string> = new Set(),
): MovementResult {
  const units = state.units;
  const events: string[] = [];
  const unitAt: Record<string, Unit> = {};
  for (const u of units) unitAt[u.loc] = u;

  const getOrder = (u: Unit): Order => orders[u.id] ?? { type: "hold" };

  // --- Supports and which ones are cut -------------------------------------
  const supporters = units
    .map((u) => ({ u, o: getOrder(u) }))
    .filter((x) => {
      if (x.o.type !== "support" || !x.o.supportFrom) return false;
      const supported = unitAt[x.o.supportFrom];
      if (!supported) return false;
      const destination = x.o.supportTo ?? x.o.supportFrom;
      if (!legalTargets(x.u).includes(destination)) return false;

      const supportedOrder = getOrder(supported);
      if (x.o.supportTo) {
        return supportedOrder.type === "move" && supportedOrder.to === x.o.supportTo;
      }
      // A unit ordered to move cannot receive defensive support, even if its
      // move will ultimately fail. Holds and supports defend their province.
      return supportedOrder.type !== "move";
    });

  const cut = new Set<string>(forcedCuts);
  for (const { u, o } of supporters) {
    const supportedDestination = o.supportTo ?? o.supportFrom;
    for (const m of units) {
      const mo = getOrder(m);
      if (
        mo.type === "move" &&
        mo.to === u.loc &&
        m.power !== u.power &&
        m.loc !== supportedDestination
      ) {
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
      const supported = unitAt[so.supportFrom as string];
      if (!supported || supported.id !== u.id) continue;
      if (so.supportTo === o.to) s += 1;
    }
    return s;
  };

  const holdStr = (loc: string): number => {
    const holder = unitAt[loc];
    if (!holder) return 0;
    let s = 1;
    for (const { u: su, o: so } of supporters) {
      if (cut.has(su.id)) continue;
      if (so.supportFrom === loc && !so.supportTo) s += 1;
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

  // An attack from the province into which support is directed is normally
  // exempt from cutting that support. It does cut it if it actually dislodges
  // the supporter, so adjudicate again without that support. Repeating handles
  // the (rare) case where removing one support exposes another supporter.
  const newlyCut = supporters
    .filter(({ u, o }) => {
      if (cut.has(u.id) || !dislodged.has(u.id)) return false;
      const attacker = units.find((candidate) => {
        const order = getOrder(candidate);
        return success.has(candidate.id) && order.type === "move" && order.to === u.loc;
      });
      return !!attacker && attacker.loc === (o.supportTo ?? o.supportFrom);
    })
    .map(({ u }) => u.id);
  if (newlyCut.length > 0) {
    return resolveMovement(state, orders, new Set([...cut, ...newlyCut]));
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
      const helperOrder = helper && orders[helper.id];
      orders[u.id] = helper && helperOrder?.type === "move" && helperOrder.to
        ? { type: "support", supportFrom: helper.loc, supportTo: helperOrder.to }
        : { type: "hold" };
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
  return HOME_SUPPLY[power as Exclude<PowerId, "NEU">].filter(
    (c) => state.centers[c] === power && !occupied.has(c),
  );
}

export function applyAdjustments(state: GameState, plan: AdjustPlan): GameState {
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
