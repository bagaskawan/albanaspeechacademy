// JS mirror of the admin motion tokens in app/globals.css (.admin-shell, admin-ui-patterns §4.1).
export const ease = {
  out: [0.23, 1, 0.32, 1],
  inOut: [0.77, 0, 0.175, 1],
} as const;

export const duration = {
  press: 0.09,
  hover: 0.14,
  micro: 0.18,
  pop: 0.22,
  overlay: 0.28,
  exit: 0.18,
} as const;

// Replaces --ease-spring. Only for pills and round buttons (§4.3).
export const spring = { type: "spring", bounce: 0.25, visualDuration: 0.22 } as const;

export const transition = {
  micro: { duration: duration.micro, ease: ease.out },
  pop: { duration: duration.pop, ease: ease.out },
  overlay: { duration: duration.overlay, ease: ease.out },
  exit: { duration: duration.exit, ease: ease.out },
  pill: { duration: 0.32, ease: ease.inOut },
} as const;
