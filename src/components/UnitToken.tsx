import { Anchor, Shield } from "lucide-react";
import { POWER_MAP, type PowerId, type UnitType } from "../data/map";

interface UnitTokenProps {
  type: UnitType;
  power: PowerId;
  size?: number;
}

export default function UnitToken({ type, power, size = 18 }: UnitTokenProps) {
  const Icon = type === "A" ? Shield : Anchor;
  return (
    <span
      className="inline-flex items-center justify-center rounded-full border-2 border-white/80 shadow"
      style={{ width: size, height: size, background: POWER_MAP[power].color }}
    >
      <Icon size={size * 0.62} color="#fff" strokeWidth={2.6} />
    </span>
  );
}
