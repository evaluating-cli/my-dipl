import { describe, expect, it } from "vitest";
import {
  createGame,
  normalizeMovementOrders,
  resolveMovement,
  validateAdjustmentPlan,
  validateMovementOrder,
  type GameState,
  type Order,
  type Unit,
} from "./engine";
const unit = (id: string, loc: string, power: Unit["power"]): Unit => ({
  id,
  loc,
  power,
  type: "A",
});

const state = (units: Unit[]): GameState => ({
  year: 1901,
  season: "Spring",
  phase: "Order",
  units,
  centers: {},
  human: "FRA",
  log: [],
});

const locations = (result: ReturnType<typeof resolveMovement>) =>
  Object.fromEntries(result.units.map((candidate) => [candidate.id, candidate.loc]));

describe("dependency-graph movement adjudication", () => {
  it("allows a three-unit circular rotation without requiring a first success", () => {
    const units = [unit("one", "PAR", "FRA"), unit("two", "BUR", "GER"), unit("three", "GAS", "ITA")];
    const result = resolveMovement(state(units), {
      one: { type: "move", to: "BUR" },
      two: { type: "move", to: "GAS" },
      three: { type: "move", to: "PAR" },
    });

    expect(locations(result)).toMatchObject({ one: "BUR", two: "GAS", three: "PAR" });
  });

  it("resolves an ordinary chain backwards from a vacant province", () => {
    const units = [unit("one", "PAR", "FRA"), unit("two", "BUR", "GER"), unit("three", "MUN", "ITA")];
    const result = resolveMovement(state(units), {
      one: { type: "move", to: "BUR" },
      two: { type: "move", to: "MUN" },
      three: { type: "move", to: "BER" },
    });

    expect(locations(result)).toMatchObject({ one: "BUR", two: "MUN", three: "BER" });
  });

  it("bounces equal-strength head-to-head moves", () => {
    const units = [unit("left", "PAR", "FRA"), unit("right", "BUR", "GER")];
    const result = resolveMovement(state(units), {
      left: { type: "move", to: "BUR" }, right: { type: "move", to: "PAR" },
    });

    expect(locations(result)).toMatchObject({ left: "PAR", right: "BUR" });
  });

  it("lets the stronger supported move win a head-to-head battle", () => {
    const units = [unit("left", "PAR", "FRA"), unit("support", "GAS", "FRA"), unit("right", "BUR", "GER")];
    const result = resolveMovement(state(units), {
      left: { type: "move", to: "BUR" },
      support: { type: "support", supportFrom: "PAR", supportTo: "BUR" },
      right: { type: "move", to: "PAR" },
    });

    expect(locations(result).left).toBe("BUR");
    expect(locations(result).right).not.toBe("BUR");
  });

  it("creates a standoff when equal attacks contest one destination", () => {
    const units = [unit("west", "PAR", "FRA"), unit("east", "MUN", "GER")];
    const result = resolveMovement(state(units), {
      west: { type: "move", to: "BUR" }, east: { type: "move", to: "BUR" },
    });

    expect(locations(result)).toMatchObject({ west: "PAR", east: "MUN" });
  });

  it("does not permit a power to dislodge its own unit", () => {
    const units = [unit("attacker", "PAR", "FRA"), unit("support", "GAS", "FRA"), unit("holder", "BUR", "FRA")];
    const result = resolveMovement(state(units), {
      attacker: { type: "move", to: "BUR" },
      support: { type: "support", supportFrom: "PAR", supportTo: "BUR" },
    });

    expect(locations(result)).toMatchObject({ attacker: "PAR", holder: "BUR" });
  });
});

describe.each([
  {
    name: "support-to-hold defends an eligible holding unit",
    units: [unit("def", "PAR", "FRA"), unit("sup", "GAS", "FRA"), unit("atk", "PIC", "GER")],
    orders: {
      sup: { type: "support", supportFrom: "PAR" },
      atk: { type: "move", to: "PAR" },
    },
    expected: { def: "PAR", atk: "PIC" },
  },
  {
    name: "support-to-move adds strength to the matching move",
    units: [unit("mov", "PAR", "FRA"), unit("sup", "GAS", "FRA"), unit("def", "BUR", "GER")],
    orders: {
      mov: { type: "move", to: "BUR" },
      sup: { type: "support", supportFrom: "PAR", supportTo: "BUR" },
    },
    expected: { mov: "BUR" },
  },
  {
    name: "mismatched support does not add strength",
    units: [unit("mov", "PAR", "FRA"), unit("sup", "GAS", "FRA"), unit("def", "BUR", "GER")],
    orders: {
      mov: { type: "move", to: "BUR" },
      sup: { type: "support", supportFrom: "PAR", supportTo: "MAR" },
    },
    expected: { mov: "PAR", def: "BUR" },
  },
  {
    name: "an attack on the supporter cuts support",
    units: [
      unit("mov", "PAR", "FRA"), unit("sup", "GAS", "FRA"),
      unit("def", "BUR", "GER"), unit("cut", "BRE", "GER"),
    ],
    orders: {
      mov: { type: "move", to: "BUR" },
      sup: { type: "support", supportFrom: "PAR", supportTo: "BUR" },
      cut: { type: "move", to: "GAS" },
    },
    expected: { mov: "PAR", def: "BUR" },
  },
  {
    name: "an attack from the supported province does not cut support",
    units: [unit("mov", "PAR", "FRA"), unit("sup", "GAS", "FRA"), unit("def", "BUR", "GER")],
    orders: {
      mov: { type: "move", to: "BUR" },
      sup: { type: "support", supportFrom: "PAR", supportTo: "BUR" },
      def: { type: "move", to: "GAS" },
    },
    expected: { mov: "BUR" },
  },
  {
    name: "the exception ends when that attacker dislodges the supporter",
    units: [
      unit("atk", "BUR", "GER"), unit("atkSup", "SPA", "GER"),
      unit("mov", "PAR", "FRA"), unit("sup", "GAS", "FRA"), unit("rival", "MUN", "GER"),
    ],
    orders: {
      mov: { type: "move", to: "BUR" },
      sup: { type: "support", supportFrom: "PAR", supportTo: "BUR" },
      atk: { type: "move", to: "GAS" },
      atkSup: { type: "support", supportFrom: "BUR", supportTo: "GAS" },
      rival: { type: "move", to: "BUR" },
    },
    expected: { mov: "PAR", atk: "GAS" },
  },
] as Array<{
  name: string;
  units: Unit[];
  orders: Record<string, Order>;
  expected: Record<string, string>;
}>)("support adjudication", ({ name, units, orders, expected }) => {
  it(name, () => {
    const result = resolveMovement(state(units), orders);
    for (const [id, loc] of Object.entries(expected)) {
      expect(result.units.find((candidate) => candidate.id === id)?.loc).toBe(loc);
    }
  });
});

it("does not apply support-to-hold to a unit ordered to move", () => {
  const units = [unit("mov", "PAR", "FRA"), unit("sup", "GAS", "FRA"), unit("atk", "PIC", "GER")];
  const result = resolveMovement(state(units), {
    mov: { type: "move", to: "BUR" },
    sup: { type: "support", supportFrom: "PAR" },
    atk: { type: "move", to: "PAR" },
  });
  expect(result.units.find((candidate) => candidate.id === "atk")?.loc).toBe("PAR");
});

describe("movement validation", () => {
  it("reports malformed moves and supports", () => {
    const game = createGame("ENG");
    const london = game.units.find((unit) => unit.loc === "LON")!;

    expect(validateMovementOrder(game, london, { type: "move", to: "MOS" }).errors[0]).toMatchObject({
      code: "ILLEGAL_DESTINATION", loc: "MOS", unitId: london.id,
    });
    expect(validateMovementOrder(game, london, { type: "support", supportFrom: "WAL" }).errors[0]).toMatchObject({
      code: "NO_UNIT_TO_SUPPORT", loc: "WAL",
    });
  });

  it("normalizes missing and invalid orders to holds before adjudication", () => {
    const game = createGame("ENG");
    const london = game.units.find((unit) => unit.loc === "LON")!;
    const normalized = normalizeMovementOrders(game, { [london.id]: { type: "move", to: "MOS" } });

    expect(normalized[london.id]).toEqual({ type: "hold" });
    expect(resolveMovement(game, { [london.id]: { type: "move", to: "MOS" } }).units).toEqual(game.units);
  });
});

describe("adjustment validation", () => {
  it("returns structured errors for excessive and malformed builds", () => {
    const game = createGame("ENG");
    game.centers.BEL = "ENG";
    const result = validateAdjustmentPlan(game, "ENG", {
      builds: [
        { power: "ENG", type: "F", loc: "LON" },
        { power: "ENG", type: "X" as never, loc: "PAR" },
      ],
      disbands: [],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.code)).toEqual(expect.arrayContaining([
      "TOO_MANY_BUILDS", "OCCUPIED_CENTER", "INELIGIBLE_HOME_CENTER", "INVALID_UNIT_TYPE",
    ]));
  });

  it("rejects disbands of another power's unit", () => {
    const game = createGame("ENG");
    delete game.centers.LON;
    const french = game.units.find((unit) => unit.power === "FRA")!;
    const result = validateAdjustmentPlan(game, "ENG", { builds: [], disbands: [french.id] });

    expect(result.errors).toContainEqual(expect.objectContaining({ code: "WRONG_POWER", unitId: french.id }));
  });
});
