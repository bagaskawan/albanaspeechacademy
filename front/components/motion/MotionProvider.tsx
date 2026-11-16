"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import { transition } from "@/lib/motion/tokens";

const loadFeatures = () => import("./features").then((mod) => mod.default);

// `strict` makes a stray `motion.*` import throw; use `m.*` inside this provider.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={loadFeatures} strict>
    <MotionConfig reducedMotion="user" transition={transition.micro}>{children}</MotionConfig>
  </LazyMotion>;
}
