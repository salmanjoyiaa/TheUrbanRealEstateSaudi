"use client";

import { useMemo } from "react";
import {
  agentNavDef,
  visitingAgentNavDef,
  sellerNavDef,
  maintenanceNavDef,
} from "@/config/nav";
import { Sidebar } from "@/components/layout/sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { useLocale } from "@/providers/locale-provider";
import { resolveNavFlat } from "@/i18n/nav-i18n";

export function AgentShell({
  children,
  agentType = "property",
  userName,
  avatarUrl,
}: {
  children: React.ReactNode;
  agentType?: string;
  userName?: string;
  avatarUrl?: string | null;
}) {
  const { t } = useLocale();

  const navDef =
    agentType === "visiting"
      ? visitingAgentNavDef
      : agentType === "seller"
        ? sellerNavDef
        : agentType === "maintenance"
          ? maintenanceNavDef
          : agentNavDef;

  const nav = useMemo(() => resolveNavFlat(navDef, t), [navDef, t]);

  const title =
    agentType === "visiting"
      ? t("nav.shell.visitingTeam")
      : t("nav.shell.agentDashboard");

  const roleLabel =
    agentType === "visiting"
      ? t("nav.shell.visitingAgent")
      : t("nav.shell.agentDashboard");

  const actions = <UserMenu userName={userName} role={roleLabel} avatarUrl={avatarUrl} />;

  return (
    <div className="min-h-screen bg-muted/20 lg:grid lg:grid-cols-[16rem_1fr]">
      <Sidebar items={nav} title={title} headerActions={actions} />
      <div>
        <header className="sticky top-0 z-20 hidden border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur sm:py-3 lg:block lg:px-6">
          <div className="flex items-center justify-end gap-3">
            <UserMenu userName={userName} role={roleLabel} avatarUrl={avatarUrl} />
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
