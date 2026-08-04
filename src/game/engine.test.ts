import { describe, expect, it } from "vitest";
import { resolveMovement, type GameState, type Order, type Unit } from "./engine";

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
