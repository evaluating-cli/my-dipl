import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Flag, Hourglass, Skull, Swords } from "lucide-react";
import Board from "./Board";
import PowerChip from "./PowerChip";

import LegendBar from "./LegendBar";
import OrderPanel from "./OrderPanel";
import AdjustPanel from "./AdjustPanel";
import LogPanel from "./LogPanel";
import {
  GREAT_POWERS,
  POWER_MAP,
  PROVINCE_MAP,
  WIN_CENTERS,
  type UnitType,
} from "../data/map";
import {
  applyAdjustments,
  applyFallOwnership,
  emptyHomeCenters,
  generateAIOrders,
  legalTargets,
  neighbours,
  powerName,
  resolveMovement,
  supplyCount,
  topPower,
  unitCount,
  winnerOf,
  type AdjustPlan,
  type GameState,
  type Order,
  type Unit,
} from "../game/engine";

interface GameProps {
  game: GameState;
  setGame: (g: GameState | null) => void;
  humanOrders: Record<string, Order>;
  setHumanOrders: React.Dispatch<React.SetStateAction<Record<string, Order>>>;
  selectedUnitId: string | null;
  setSelectedUnitId: (id: string | null) => void;
  pendingMode: "move" | "support" | null;
  setPendingMode: (m: "move" | "support" | null) => void;
  changed: string[];
  setChanged: (c: string[]) => void;
  busy: boolean;
  setBusy: (b: boolean) => void;
  builds: { type: UnitType; loc: string }[];
  setBuilds: (b: { type: UnitType; loc: string }[]) => void;
  disbands: string[];
  setDisbands: (d: string[]) => void;
}

export default function Game(props: GameProps) {
  const {
    game,
    setGame,
    humanOrders,
    setHumanOrders,
    selectedUnitId,
    setSelectedUnitId,
    pendingMode,
    setPendingMode,
    changed,
    setChanged,
    busy,
    setBusy,
    builds,
    setBuilds,
    disbands,
    setDisbands,
  } = props;

  const human = game.human;
  const humanUnits = game.units.filter((u) => u.power === human);
  const selectedUnit = humanUnits.find((u) => u.id === selectedUnitId) ?? null;
  const sc = supplyCount(game);
  const uc = unitCount(game);

  // brief season-change toast
  const toastKey = `${game.season}-${game.year}-${game.phase}`;
  const [showToast, setShowToast] = useState(false);
  useEffect(() => {
    setShowToast(true);
    const t = setTimeout(() => setShowToast(false), 1700);
    return () => clearTimeout(t);
  }, [toastKey]);

  // clear pulse highlights after they have played
  useEffect(() => {
    if (changed.length === 0) return;
    const t = setTimeout(() => setChanged([]), 4200);
    return () => clearTimeout(t);
  }, [changed, setChanged]);

  const highlightMove = useMemo(() => {
    if (selectedUnit && (pendingMode === "move" || pendingMode === null)) {
      return new Set(legalTargets(selectedUnit));
    }
    return new Set<string>();
  }, [pendingMode, selectedUnit]);

  const highlightSupport = useMemo(() => {
    if (pendingMode === "support" && selectedUnit) {
      return new Set(neighbours(selectedUnit.loc).filter((id) => game.units.some((u) => u.loc === id)));
    }
    return new Set<string>();
  }, [pendingMode, selectedUnit, game.units]);

  const setOrder = (unitId: string, order: Order) =>
    setHumanOrders((prev) => ({ ...prev, [unitId]: order }));

  const onProvince = (id: string) => {
    if (game.phase === "Adjust") {
      const u = game.units.find((x) => x.power === human && x.loc === id);
      if (u) {
        if (disbands.includes(u.id)) setDisbands(disbands.filter((d) => d !== u.id));
        else if (disbands.length < mustDisbandN) setDisbands([...disbands, u.id]);
        return;
      }
      if (buildCenters.includes(id)) {
        const existing = builds.find(b => b.loc === id);
        if (existing) {
          const isCoastal = !!PROVINCE_MAP[id].coast;
          if (existing.type === "A" && isCoastal) {
            setBuilds(builds.map(b => b.loc === id ? { ...b, type: "F" } : b));
          } else {
            setBuilds(builds.filter(b => b.loc !== id));
          }
        } else if (builds.length < canBuildN) {
          setBuilds([...builds, { type: "A", loc: id }]);
        }
      }
      return;
    }
    if (game.phase !== "Order") return;

    if (selectedUnit) {
      // 1) Support mode target click
      if (pendingMode === "support" && highlightSupport.has(id)) {
        setOrder(selectedUnit.id, { type: "support", supLoc: id });
        setPendingMode(null);
        return;
      }

      // 2) Clicked the unit's OWN province -> Set/toggle to Hold
      if (id === selectedUnit.loc) {
        setOrder(selectedUnit.id, { type: "hold" });
        setPendingMode(null);
        return;
      }

      // 3) Clicked a legal move destination province (e.g. neighbouring province)
      if (highlightMove.has(id)) {
        setOrder(selectedUnit.id, { type: "move", to: id });
        setPendingMode(null);
        return;
      }

      // 4) Clicked another province that has a friendly unit
      const friendlyUnit = game.units.find((x) => x.power === human && x.loc === id);
      if (friendlyUnit) {
        setSelectedUnitId(friendlyUnit.id);
        setPendingMode(null);
        return;
      }

      // 5) Clicked an invalid / non-adjacent empty province -> Deselect
      setSelectedUnitId(null);
      setPendingMode(null);
      return;
    }

    // No unit currently selected: select the human unit at `id` if present
    const u = game.units.find((x) => x.power === human && x.loc === id);
    setSelectedUnitId(u ? u.id : null);
    setPendingMode(null);
  };

  const onUnit = (u: Unit) => {
    if (game.phase === "Adjust" && u.power === human) {
      if (disbands.includes(u.id)) setDisbands(disbands.filter((d) => d !== u.id));
      else if (disbands.length < mustDisbandN) setDisbands([...disbands, u.id]);
      return;
    }
    if (game.phase !== "Order") return;

    if (u.power === human) {
      // Friendly unit clicked
      if (pendingMode === "support" && selectedUnit && highlightSupport.has(u.loc)) {
        setOrder(selectedUnit.id, { type: "support", supLoc: u.loc });
        setPendingMode(null);
        return;
      }

      if (selectedUnitId === u.id) {
        // Clicked the currently selected unit itself -> toggle hold or deselect if already holding
        const currentOrder = humanOrders[u.id];
        if (!currentOrder || currentOrder.type === "hold") {
          setSelectedUnitId(null);
        } else {
          setOrder(u.id, { type: "hold" });
        }
        setPendingMode(null);
      } else {
        // Switch selection to this friendly unit
        setSelectedUnitId(u.id);
        setPendingMode(null);
      }
    } else {
      // Enemy unit clicked -> Delegate to onProvince to handle move/support target
      onProvince(u.loc);
    }
  };

  // ---- AI winter adjustments ---------------------------------------------
  const aiAdjustments = (state: GameState): AdjustPlan => {
    const plan: AdjustPlan = { builds: [], disbands: [] };
    const scNow = supplyCount(state);
    const ucNow = unitCount(state);
    for (const p of GREAT_POWERS) {
      if (p === state.human) continue;
      const diff = scNow[p] - ucNow[p];
      if (diff > 0) {
        for (const loc of emptyHomeCenters(state, p).slice(0, diff)) {
          plan.builds.push({ power: p, type: PROVINCE_MAP[loc].coast ? "F" : "A", loc });
        }
      } else if (diff < 0) {
        let toRemove = -diff;
        const mine = state.units.filter((u) => u.power === p);
        const order = [
          ...mine.filter((u) => state.centers[u.loc] !== p),
          ...mine.filter((u) => state.centers[u.loc] === p),
        ];
        for (const u of order) {
          if (toRemove <= 0) break;
          plan.disbands.push(u.id);
          toRemove--;
        }
      }
    }
    return plan;
  };

  // ---- resolve a movement turn ---------------------------------------------
  const resolveTurn = () => {
    if (busy) return;
    setBusy(true);
    setSelectedUnitId(null);
    setPendingMode(null);
    window.setTimeout(() => {
      const orders: Record<string, Order> = {};
      for (const u of game.units) {
        if (u.power === human) orders[u.id] = humanOrders[u.id] ?? { type: "hold" };
      }
      const ai = generateAIOrders(game);
      for (const k of Object.keys(ai)) orders[k] = ai[k];

      const res = resolveMovement(game, orders);
      const newLog = [...game.log, `──── ${game.season} ${game.year} resolves ────`, ...res.events];

      if (game.season === "Spring") {
        setChanged(res.changed);
        setHumanOrders({});
        setGame({ ...game, units: res.units, log: newLog, season: "Fall", phase: "Order" });
        setBusy(false);
        return;
      }

      // Fall → ownership, AI builds, winner / defeat checks
      const fall = applyFallOwnership({ ...game, units: res.units });
      const ownMsgs = fall.changed.map(
        (id) => `${PROVINCE_MAP[id].name} now belongs to ${POWER_MAP[fall.centers[id]].name}.`,
      );
      let g: GameState = {
        ...game,
        units: res.units,
        centers: fall.centers,
        log: [...newLog, ...ownMsgs],
        phase: "Adjust",
        season: "Fall",
      };
      g = applyAdjustments(g, aiAdjustments(g));

      const winner = winnerOf(g);
      const hUnits = g.units.filter((u) => u.power === human).length;
      const hCenters = supplyCount(g)[human];
      if (winner || (hUnits === 0 && hCenters === 0)) {
        setGame({
          ...g,
          winner: winner ?? topPower(g),
          defeat: !winner || winner !== human,
          phase: "GameOver",
          log: [
            ...g.log,
            winner
              ? `${powerName(winner)} controls ${WIN_CENTERS} supply centres — the war is won.`
              : `${powerName(human)} has been swept from the map.`,
          ],
        });
      } else {
        setGame(g);
      }
      setChanged(Array.from(new Set([...res.changed, ...fall.changed])));
      setHumanOrders({});
      setBuilds([]);
      setDisbands([]);
      setBusy(false);
    }, 650);
  };

  // ---- winter builds / disbands ---------------------------------------------
  const buildCenters = emptyHomeCenters(game, human);
  const canBuildN = Math.min(Math.max(0, sc[human] - uc[human]), buildCenters.length);
  const mustDisbandN = Math.max(0, uc[human] - sc[human]);
  const adjustValid = builds.length === canBuildN && disbands.length === mustDisbandN;

  const confirmAdjust = () => {
    if (!adjustValid) return;
    const plan: AdjustPlan = {
      builds: builds.map((b) => ({ power: human, type: b.type, loc: b.loc })),
      disbands,
    };
    let g = applyAdjustments(game, plan);
    const ny = game.year + 1;
    g = {
      ...g,
      year: ny,
      season: "Spring",
      phase: "Order",
      log: [...g.log, `Winter ${game.year} passes — the campaign of ${ny} begins.`],
    };
    setGame(g);
    setBuilds([]);
    setDisbands([]);
    setHumanOrders({});
    setSelectedUnitId(null);
    setPendingMode(null);
    setChanged([]);
  };

  const sortedPowers = [...GREAT_POWERS].sort((a, b) => sc[b] - sc[a]);
  const orderedCount = humanUnits.filter((u) => humanOrders[u.id]).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1c1a16] text-slate-200">
      {/* Main Map Area */}
      <main className="relative flex-1 overflow-hidden bg-[#efe6cd]">
        <Board
          game={game}
          orders={humanOrders}
          selectedUnitId={selectedUnitId}
          pendingMode={pendingMode}
          highlightMove={highlightMove}
          highlightSupport={highlightSupport}
          changed={changed}
          busy={busy}
          onProvince={onProvince}
          onUnit={onUnit}
        />

        {/* season toast overlay */}
        <AnimatePresence>
          {showToast && game.phase !== "GameOver" && (
            <motion.div
              key={toastKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pointer-events-none absolute left-1/2 top-32 z-30 -translate-x-1/2 rounded-2xl border border-amber-300/30 bg-[#191713]/95 px-8 py-4 text-center shadow-2xl backdrop-blur-sm"
            >
              <p className="font-display text-2xl font-black tracking-[0.18em] text-amber-100">
                {game.phase === "Adjust" ? `WINTER ${game.year}` : `${game.season.toUpperCase()} ${game.year}`}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400">
                {game.phase === "Adjust" ? "Muster & Disband" : "Orders Phase"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* game-over overlay */}
        <AnimatePresence>
          {game.phase === "GameOver" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                className="mx-4 max-w-md rounded-2xl border-2 p-8 text-center shadow-2xl"
                style={{
                  borderColor: POWER_MAP[game.winner ?? "NEU"].color,
                  background: "#191713",
                }}
              >
                {game.defeat ? (
                  <Skull size={40} className="mx-auto mb-3 text-rose-400" />
                ) : (
                  <Crown size={40} className="mx-auto mb-3 text-amber-300" />
                )}
                <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">
                  {game.defeat ? "Defeat" : "Victory"}
                </p>
                <p
                  className="my-2 font-display text-3xl font-black"
                  style={{ color: game.defeat ? "#fb7185" : POWER_MAP[game.winner ?? human].color }}
                >
                  {game.defeat
                    ? `${powerName(human)} has fallen`
                    : `${powerName(game.winner!)} reigns supreme`}
                </p>
                <p className="text-sm leading-relaxed text-slate-400">
                  {game.defeat
                    ? "Your banners are struck, your armies scattered. Europe remembers only the victorious."
                    : `${WIN_CENTERS} supply centres fly your colours. The Concert of Europe plays to your tune now.`}
                </p>
                <button
                  onClick={() => setGame(null)}
                  className="mt-6 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold tracking-wide text-[#241a05] shadow-lg shadow-amber-900/50 transition hover:bg-amber-400 hover:-translate-y-0.5"
                >
                  Return to the War Room
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sidebar */}
      <aside className="relative z-20 flex w-[380px] shrink-0 flex-col border-l border-[#3a3428]/50 bg-[#14120f] shadow-2xl">
        {/* Header / Game Status */}
        <div className="flex flex-col gap-4 border-b border-white/10 bg-[#1a1713] p-4">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl shadow-inner"
                  style={{ background: POWER_MAP[human].color }}
                >
                  <Swords size={24} color="#fff" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-black leading-tight tracking-[0.14em] text-amber-100">
                    DIPLOMACY
                  </h1>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    {game.phase === "Adjust" ? "Winter" : game.season} {game.year} · {POWER_MAP[human].name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGame(null)}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
              >
                Menu
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5">
              {sortedPowers.map((p) => (
                <PowerChip key={p} power={p} count={sc[p]} active={p === human} />
              ))}
              <div className="ml-auto flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                <Flag size={10} /> {WIN_CENTERS} to win
              </div>
            </div>
            
            {game.phase === "Order" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resolveTurn}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 px-4 py-3 text-sm font-bold text-[#241a05] shadow-lg shadow-amber-950/50 disabled:opacity-60"
              >
                {busy ? <Hourglass size={15} className="animate-spin" /> : <Swords size={15} />}
                {busy
                  ? "Adjudicating…"
                  : orderedCount < humanUnits.length
                    ? `Resolve (${orderedCount}/${humanUnits.length} ordered)`
                    : "Resolve Orders"}
              </motion.button>
            )}
          </div>

          {/* Scrollable Panels */}
          <div className="flex-1 overflow-y-auto p-4 [scrollbar-width:none]">
            <div className={`flex flex-col gap-4 transition-opacity ${busy ? "pointer-events-none opacity-50" : ""}`}>
              {game.phase === "Order" && (
                <OrderPanel
                  units={humanUnits}
                  orders={humanOrders}
                  selectedUnit={selectedUnit}
                  pendingMode={pendingMode}
                  onSelect={setSelectedUnitId}
                  onHold={() => {
                    if (selectedUnit) {
                      setOrder(selectedUnit.id, { type: "hold" });
                      setPendingMode(null);
                    }
                  }}
                  onMove={() => setPendingMode("move")}
                  onSupport={() => setPendingMode("support")}
                  onClearAll={() => setHumanOrders({})}
                />
              )}

              {game.phase === "Adjust" && (
                <AdjustPanel
                  canBuild={canBuildN}
                  mustDisband={mustDisbandN}
                  centers={buildCenters}
                  units={humanUnits}
                  builds={builds}
                  disbands={disbands}
                  valid={adjustValid}
                  onBuild={(b) => {
                    if (builds.length < canBuildN && !builds.some((x) => x.loc === b.loc)) {
                      setBuilds([...builds, b]);
                    }
                  }}
                  onRemoveBuild={(loc) => setBuilds(builds.filter((b) => b.loc !== loc))}
                  onToggleDisband={(id) => {
                    if (disbands.includes(id)) setDisbands(disbands.filter((d) => d !== id));
                    else if (disbands.length < mustDisbandN) setDisbands([...disbands, id]);
                  }}
                  onConfirm={confirmAdjust}
                  year={game.year}
                />
              )}

              {game.phase === "GameOver" && (
                <div className="rounded-xl border border-white/10 bg-[#1a1713]/80 p-4 text-center text-sm text-slate-400 shadow-xl backdrop-blur-md">
                  The war is over. Start a new campaign from the menu.
                </div>
              )}

              <LogPanel log={game.log} />
            </div>
          </div>

          {/* Integrated Legend */}
          <div className="border-t border-white/5 bg-[#14120f]/80 p-3">
            <LegendBar />
          </div>
      </aside>
    </div>
  );
}
