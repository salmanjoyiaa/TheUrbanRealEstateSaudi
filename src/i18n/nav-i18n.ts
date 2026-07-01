import type { LucideIcon } from "lucide-react";
import type { Translator } from "@/i18n/create-translator";

export type NavItemDef = {
  titleKey: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavGroupDef = {
  labelKey: string;
  items: NavItemDef[];
};

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export function resolveNavItems(items: NavItemDef[], t: Translator): NavItem[] {
  return items.map((item) => ({
    ...item,
    title: t(item.titleKey),
  }));
}

export function resolveNavGroups(groups: NavGroupDef[], t: Translator): NavGroup[] {
  return groups.map((group) => ({
    label: t(group.labelKey),
    items: resolveNavItems(group.items, t),
  }));
}

export function resolveNavFlat(items: NavItemDef[], t: Translator): NavItem[] {
  return resolveNavItems(items, t);
}
