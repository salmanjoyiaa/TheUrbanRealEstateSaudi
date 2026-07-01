"use client";

import { useMemo } from "react";
import { adminNavGroupsDef } from "@/config/nav";
import { Sidebar } from "@/components/layout/sidebar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { useLocale } from "@/providers/locale-provider";
import { resolveNavGroups } from "@/i18n/nav-i18n";

export function AdminShell({
  children,
  userName,
  avatarUrl,
}: {
  children: React.ReactNode;
  userName?: string;
  avatarUrl?: string | null;
}) {
  const { t } = useLocale();
  const groups = useMemo(() => resolveNavGroups(adminNavGroupsDef, t), [t]);
  const panelTitle = t("nav.shell.adminPanel");
  const roleLabel = t("nav.shell.adminPanel");

  const actions = (
    <>
      <NotificationBell />
      <UserMenu userName={userName} role={roleLabel} avatarUrl={avatarUrl} />
    </>
  );

  return (
    <div className="min-h-screen bg-muted/20 lg:grid lg:grid-cols-[16rem_1fr]">
      <Sidebar groups={groups} title={panelTitle} headerActions={actions} />
      <div>
        <header className="sticky top-0 z-20 hidden border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur sm:py-3 lg:block lg:px-6">
          <div className="flex items-center justify-end gap-3">
            <NotificationBell />
            <UserMenu userName={userName} role={roleLabel} avatarUrl={avatarUrl} />
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
