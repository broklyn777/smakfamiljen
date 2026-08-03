import type { HealthClass } from "../../lib/recipes";

export function HealthBadge({ health }: { health: HealthClass }) {
  return <span className={`wm-health wm-health-${health.toLowerCase().replaceAll(" ", "-")}`}>{health}</span>;
}
