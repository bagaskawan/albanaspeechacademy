"use client";

import { LazyMotion, MotionConfig, domMax } from "motion/react";
import { transition } from "@/lib/motion/tokens";

// Features load synchronously: async loading let the first pill/rail animation jump.
// `strict` makes a stray `motion.*` import throw; use `m.*` inside this provider.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domMax} strict>
    <MotionConfig reducedMotion="user" transition={transition.micro}>{children}</MotionConfig>
  </LazyMotion>;
}
