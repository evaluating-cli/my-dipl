import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Flag, Hourglass, Skull, Swords } from "lucide-react";
import Board from "./Board";
import PowerChip from "./PowerChip";

import LegendBar from "./LegendBar";
import OrderPanel from "./OrderPanel";
import AdjustPanel from "./AdjustPanel";
import RetreatPanel from "./RetreatPanel";
import LogPanel from "./LogPanel";
import { POWER_MAP, WIN_CENTERS } from "../data/map";
import { powerName, validMoveTargets, validSupportTargets, type Order, type Unit } from "../game/engine";

interface GameProps { session: import("../hooks/useGameSession").GameSession; }

export default function Game({ session }: GameProps) {
  const { state, view, dispatch } = session;
  const game = state.game!;
  const { orders: humanOrders, selectedUnitId, pendingMode, changed, builds, disbands,
    retreatChoices, selectedRetreatId } = state;
  const busy = state.pendingResolution !== null;
  const { humanUnits, humanDislodged, sc, sortedPowers, buildCenters, canBuildN, mustDisbandN,
    adjustmentValidation, buildTypesByCenter, disbandableIds, retreatDestinations,
    orderedCount } = view!;
  const human = game.human;
  const selectedUnit = humanUnits.find((u) => u.id === selectedUnitId) ?? null;
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
    const t = setTimeout(() => dispatch({ type: "CLEAR_CHANGED" }), 4200);
    return () => clearTimeout(t);
  }, [changed, dispatch]);

  const highlightMove = useMemo(() => {
    if (game.phase === "Retreat" && selectedRetreatId) {
      return new Set(retreatDestinations[selectedRetreatId] ?? []);
    }
    if (selectedUnit && (pendingMode === "move" || pendingMode === null)) {
      return new Set(validMoveTargets(game, selectedUnit));
    }
    return new Set<string>();
  }, [game, pendingMode, selectedUnit, selectedRetreatId]);

  const highlightSupport = useMemo(() => {
    if (pendingMode === "support" && selectedUnit) {
      return new Set(validSupportTargets(game, selectedUnit, humanOrders));
    }
    return new Set<string>();
  }, [pendingMode, selectedUnit, game.units, humanOrders]);

  const setOrder = (unitId: string, order: Order) => dispatch({ type: "SET_ORDER", unitId, order });

  const supportOrderFor = (loc: string): Order | null => {
    const supported = game.units.find((unit) => unit.loc === loc);
    if (!supported) return null;
    const supportedOrder = humanOrders[supported.id];
    return supportedOrder?.type === "move" && supportedOrder.to
      ? { type: "support", supportFrom: loc, supportTo: supportedOrder.to }
      : { type: "support", supportFrom: loc };
  };

  const onProvince = (id: string) => {
    if (game.phase === "Retreat") {
      if (selectedRetreatId && (retreatDestinations[selectedRetreatId] ?? []).includes(id)) {
        dispatch({ type: "SET_RETREAT", unitId: selectedRetreatId, destination: id });
        dispatch({ type: "SELECT_RETREAT", unitId: null });
      }
      return;
    }
    if (game.phase === "Adjust") {
      const u = game.units.find((x) => x.power === human && x.loc === id);
      if (u) {
        if (disbandableIds.has(u.id)) dispatch({ type: "TOGGLE_DISBAND", unitId: u.id });
        return;
      }
      if (buildCenters.includes(id)) {
        const existing = builds.find(b => b.loc === id);
        if (existing) {
          if (existing.type === "A" && buildTypesByCenter[id]?.includes("F")) {
            dispatch({ type: "REMOVE_BUILD", loc: id });
            dispatch({ type: "ADD_BUILD", build: { type: "F", loc: id } });
          } else {
            dispatch({ type: "REMOVE_BUILD", loc: id });
          }
        } else if (builds.length < canBuildN && buildTypesByCenter[id]?.includes("A")) {
          dispatch({ type: "ADD_BUILD", build: { type: "A", loc: id } });
        }
      }
      return;
    }
    if (game.phase !== "Order") return;

    if (selectedUnit) {
      // 1) Support mode target click
      if (pendingMode === "support" && highlightSupport.has(id)) {
        const order = supportOrderFor(id);
        if (order) dispatch({ type: "SET_ORDER", unitId: selectedUnit.id, order });
        dispatch({ type: "SET_MODE", mode: null });
        return;
      }

      // 2) Clicked the unit's OWN province -> Set/toggle to Hold
      if (id === selectedUnit.loc) {
        dispatch({ type: "SET_ORDER", unitId: selectedUnit.id, order: { type: "hold" } });
        dispatch({ type: "SET_MODE", mode: null });
        return;
      }

      // 3) Clicked a legal move destination province (e.g. neighbouring province)
      if (highlightMove.has(id)) {
        setOrder(selectedUnit.id, { type: "move", to: id });
        dispatch({ type: "SET_MODE", mode: null });
        return;
      }

      // 4) Clicked another province that has a friendly unit
      const friendlyUnit = game.units.find((x) => x.power === human && x.loc === id);
      if (friendlyUnit) {
        dispatch({ type: "SELECT_UNIT", unitId: friendlyUnit.id });
        dispatch({ type: "SET_MODE", mode: null });
        return;
      }

      // 5) Clicked an invalid / non-adjacent empty province -> Deselect
      dispatch({ type: "SELECT_UNIT", unitId: null });
      dispatch({ type: "SET_MODE", mode: null });
      return;
    }

    // No unit currently selected: select the human unit at `id` if present
    const u = game.units.find((x) => x.power === human && x.loc === id);
    dispatch({ type: "SELECT_UNIT", unitId: u ? u.id : null });
    dispatch({ type: "SET_MODE", mode: null });
  };

  const onUnit = (u: Unit) => {
    if (game.phase === "Retreat") {
      onProvince(u.loc);
      return;
    }
    if (game.phase === "Adjust" && u.power === human) {
      if (disbandableIds.has(u.id)) dispatch({ type: "TOGGLE_DISBAND", unitId: u.id });
      return;
    }
    if (game.phase !== "Order") return;

    if (u.power === human) {
      // Friendly unit clicked
      if (pendingMode === "support" && selectedUnit && highlightSupport.has(u.loc)) {
        const order = supportOrderFor(u.loc);
        if (order) dispatch({ type: "SET_ORDER", unitId: selectedUnit.id, order });
        dispatch({ type: "SET_MODE", mode: null });
        return;
      }

      if (selectedUnitId === u.id) {
        // Clicked the currently selected unit itself -> toggle hold or deselect if already holding
        const currentOrder = humanOrders[u.id];
        if (!currentOrder || currentOrder.type === "hold") {
          dispatch({ type: "SELECT_UNIT", unitId: null });
        } else {
          dispatch({ type: "SET_ORDER", unitId: u.id, order: { type: "hold" } });
        }
        dispatch({ type: "SET_MODE", mode: null });
      } else {
        // Switch selection to this friendly unit
        dispatch({ type: "SELECT_UNIT", unitId: u.id });
        dispatch({ type: "SET_MODE", mode: null });
      }
    } else {
      // Enemy unit clicked -> Delegate to onProvince to handle move/support target
      onProvince(u.loc);
    }
  };

  const resolveTurn = () => dispatch({ type: "RESOLVE_REQUEST" });
  const confirmRetreats = () => dispatch({ type: "CONFIRM_RETREATS" });
  const adjustValid = adjustmentValidation.valid;
  const confirmAdjust = () => dispatch({ type: "CONFIRM_ADJUSTMENTS" });


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
                  onClick={() => dispatch({ type: "RESET" })}
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
                onClick={() => dispatch({ type: "RESET" })}
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
                  canMove={highlightMove.size > 0}
                  canSupport={selectedUnit ? validSupportTargets(game, selectedUnit, humanOrders).length > 0 : false}
                  onSelect={(unitId) => dispatch({ type: "SELECT_UNIT", unitId })}
                  onHold={() => {
                    if (selectedUnit) {
                      dispatch({ type: "SET_ORDER", unitId: selectedUnit.id, order: { type: "hold" } });
                      dispatch({ type: "SET_MODE", mode: null });
                    }
                  }}
                  onMove={() => dispatch({ type: "SET_MODE", mode: "move" })}
                  onSupport={() => dispatch({ type: "SET_MODE", mode: "support" })}
                  onClearAll={() => dispatch({ type: "CLEAR_ORDERS" })}
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
                  errors={adjustmentValidation.errors}
                  buildTypesByCenter={buildTypesByCenter}
                  disbandableIds={disbandableIds}
                  onBuild={(build) => dispatch({ type: "ADD_BUILD", build })}
                  onRemoveBuild={(loc) => dispatch({ type: "REMOVE_BUILD", loc })}
                  onToggleDisband={(unitId) => dispatch({ type: "TOGGLE_DISBAND", unitId })}
                  onConfirm={confirmAdjust}
                  year={game.year}
                />
              )}

              {game.phase === "Retreat" && (
                <RetreatPanel
                  units={humanDislodged}
                  choices={retreatChoices}
                  destinations={retreatDestinations}
                  selectedId={selectedRetreatId}
                  onSelect={(unitId) => dispatch({ type: "SELECT_RETREAT", unitId })}
                  onDisband={(unitId) => dispatch({ type: "SET_RETREAT", unitId, destination: null })}
                  onConfirm={confirmRetreats}
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
