import type { ComponentType } from "react";
import { SaudiNationalDaySettingsForm } from "@/components/admin/saudi-national-day-settings-form";

/**
 * Registry of seasonal / campaign themes controllable from Admin → Themes.
 * To add a theme: create its settings form component and append an entry here.
 */
export type ThemeDefinition = {
  id: string;
  /** Dashboard i18n keys for the list header. */
  nameKey: string;
  descriptionKey: string;
  /** Brand accent used for the theme's swatch in the admin list. */
  accent: string;
  /** Settings UI for this theme (owns its own load/save). */
  SettingsForm: ComponentType;
};

export const themeRegistry: ThemeDefinition[] = [
  {
    id: "saudi-national-day",
    nameKey: "admin.themes.saudiNationalDay.name",
    descriptionKey: "admin.themes.saudiNationalDay.description",
    accent: "#006c35",
    SettingsForm: SaudiNationalDaySettingsForm,
  },
];
