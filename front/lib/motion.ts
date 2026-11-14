// Motion values shared by the section cascade and the figures that ride on it.

// A section starts its cascade once its top has climbed about 40% up the viewport,
// i.e. crossed the upper 60%.
export const REVEAL_TRIGGER_FRACTION = 0.6;
export const REVEAL_TRIGGER_MARGIN = `0px 0px ${(REVEAL_TRIGGER_FRACTION - 1) * 100}% 0px`;

// The figure a counter shows at a given animation progress (0 to 1).
export function countUpText(target: number, progress: number, suffix = ""): string {
  const clamped = progress < 0 ? 0 : progress > 1 ? 1 : progress;
  return `${Math.round(target * clamped)}${suffix}`;
}

// Counters flow: a bigger figure counts for longer, so a small one (say 10) lands well
// before a large one (70). Its meter uses the same duration to stay in step.
export function countDurationMs(target: number): number {
  return 250 + target * 10;
}
