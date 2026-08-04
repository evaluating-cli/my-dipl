import { POWER_MAP, type PowerId } from "../../data/map";
import { provName, type Order } from "../../game/engine";

export function unitColor(power: PowerId): string {
  return POWER_MAP[power]?.color ?? "#64748b";
}

export function orderText(order?: Order): string {
  if (!order || order.type === "hold") return "Hold";
  if (order.type === "move") return `Move to ${provName(order.to!)}`;
  const source = provName(order.supportFrom!);
  return order.supportTo
    ? `Support ${source} to ${provName(order.supportTo)}`
    : `Support ${source} to hold`;
}
