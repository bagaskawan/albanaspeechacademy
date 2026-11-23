import "server-only";

import { academyBillingClient } from "@/lib/server/academy-billing";

export type AdminActivityAction =
  | "create"
  | "update"
  | "delete"
  | "verify"
  | "reject"
  | "status"
  | "password";

export const ADMIN_ACTIVITY_ACTIONS: ReadonlySet<AdminActivityAction> = new Set([
  "create",
  "update",
  "delete",
  "verify",
  "reject",
  "status",
  "password",
]);

export type AdminActivityActor = {
  user_id: string;
  username: string | null;
  role: string;
};

export type AdminActivityInput = {
  actor: AdminActivityActor;
  action: AdminActivityAction;
  module: string;
  entityId?: string | number | null;
  entityLabel?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
};

export type AdminActivityLogRow = {
  id: number;
  actor_user_id: string;
  actor_username: string;
  actor_role: string;
  action: AdminActivityAction;
  module: string;
  entity_id: string | null;
  entity_label: string | null;
  summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export async function logAdminActivity(input: AdminActivityInput): Promise<void> {
  try {
    const client = academyBillingClient();
    const actorUsername = input.actor.username?.trim() || "admin";
    const entityId =
      input.entityId === null || input.entityId === undefined
        ? null
        : String(input.entityId).slice(0, 120);
    const entityLabel = input.entityLabel ? input.entityLabel.trim().slice(0, 160) : null;

    const { error } = await client.from("admin_activity_logs").insert({
      actor_user_id: input.actor.user_id,
      actor_username: actorUsername,
      actor_role: input.actor.role || "admin",
      action: input.action,
      module: input.module.trim().slice(0, 64),
      entity_id: entityId,
      entity_label: entityLabel || null,
      summary: input.summary.trim().slice(0, 300),
      metadata: input.metadata ?? {},
    });

    if (error) {
      console.warn("[admin-activity] Gagal mencatat log aktivitas:", error.message);
    }
  } catch (err) {
    console.warn(
      "[admin-activity] Pengecualian saat mencatat log aktivitas:",
      err instanceof Error ? err.message : String(err),
    );
  }
}
