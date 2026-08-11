import {
  Building2,
  LayoutDashboard,
  Package,
  Calendar,
  ShoppingBag,
  Users,
  ScrollText,
  Wrench,
  MessageSquare,
  MapPin,
  Star,
  Clock,
  ClipboardList,
  Settings,
  FileText,
  FileDown,
  User,
} from "lucide-react";
import type { NavGroupDef, NavItemDef } from "@/i18n/nav-i18n";

export type { NavItem, NavGroup } from "@/i18n/nav-i18n";

export const agentNavDef: NavItemDef[] = [
  { titleKey: "nav.agent.overview", href: "/agent", icon: LayoutDashboard },
  { titleKey: "nav.agent.myProperties", href: "/agent/properties", icon: Building2 },
  { titleKey: "nav.agent.visits", href: "/agent/visits", icon: Calendar },
  { titleKey: "nav.agent.profile", href: "/agent/profile", icon: User },
];

export const visitingAgentNavDef: NavItemDef[] = [
  { titleKey: "nav.agent.overview", href: "/agent", icon: LayoutDashboard },
  { titleKey: "nav.agent.assignments", href: "/agent/assignments", icon: MapPin },
  { titleKey: "nav.agent.messageTemplates", href: "/agent/message-templates", icon: MessageSquare },
  { titleKey: "nav.agent.propertiesAssigned", href: "/agent/properties-assigned", icon: Building2 },
  { titleKey: "nav.agent.profile", href: "/agent/profile", icon: User },
];

export const sellerNavDef: NavItemDef[] = [
  { titleKey: "nav.agent.overview", href: "/agent", icon: LayoutDashboard },
  { titleKey: "nav.agent.myProducts", href: "/agent/products", icon: Package },
  { titleKey: "nav.agent.leads", href: "/agent/leads", icon: ShoppingBag },
  { titleKey: "nav.agent.profile", href: "/agent/profile", icon: User },
];

export const maintenanceNavDef: NavItemDef[] = [
  { titleKey: "nav.agent.overview", href: "/agent", icon: LayoutDashboard },
  { titleKey: "nav.agent.myServices", href: "/agent/maintenance-services", icon: Wrench },
  { titleKey: "nav.agent.serviceRequests", href: "/agent/maintenance-requests", icon: ScrollText },
  { titleKey: "nav.agent.profile", href: "/agent/profile", icon: User },
];

export const adminNavGroupsDef: NavGroupDef[] = [
  {
    labelKey: "nav.groups.overview",
    items: [{ titleKey: "nav.admin.dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    labelKey: "nav.groups.teamManagement",
    items: [
      { titleKey: "nav.admin.agents", href: "/admin/agents", icon: Users },
      { titleKey: "nav.admin.sellers", href: "/admin/agents?agent_type=seller", icon: ShoppingBag },
      { titleKey: "nav.admin.visitingTeam", href: "/admin/visiting-team", icon: MapPin },
      { titleKey: "nav.admin.maintenanceAgents", href: "/admin/agents?agent_type=maintenance", icon: Wrench },
    ],
  },
  {
    labelKey: "nav.groups.listings",
    items: [
      { titleKey: "nav.admin.properties", href: "/admin/properties", icon: Building2 },
      { titleKey: "nav.admin.products", href: "/admin/products", icon: Package },
      { titleKey: "nav.admin.locations", href: "/admin/locations", icon: MapPin },
      { titleKey: "nav.admin.maintenanceServices", href: "/admin/maintenance-services", icon: Settings },
    ],
  },
  {
    labelKey: "nav.groups.requests",
    items: [
      { titleKey: "nav.admin.visits", href: "/admin/visits", icon: Calendar },
      { titleKey: "nav.admin.visitPdf", href: "/admin/visit-pdf", icon: FileDown },
      { titleKey: "nav.admin.manualInvoice", href: "/admin/manual-invoice", icon: FileText },
      { titleKey: "nav.admin.leads", href: "/admin/leads", icon: ShoppingBag },
      { titleKey: "nav.admin.maintenanceRequests", href: "/admin/maintenance", icon: ClipboardList },
    ],
  },
  {
    labelKey: "nav.groups.operations",
    items: [
      { titleKey: "nav.admin.visitHours", href: "/admin/slots", icon: Clock },
      { titleKey: "nav.admin.visitPerformance", href: "/admin/visit-team-performance", icon: MapPin },
    ],
  },
  {
    labelKey: "nav.groups.content",
    items: [{ titleKey: "nav.admin.testimonials", href: "/admin/testimonials", icon: Star }],
  },
  {
    labelKey: "nav.groups.system",
    items: [
      { titleKey: "nav.admin.messageLogs", href: "/admin/logs", icon: MessageSquare },
      { titleKey: "nav.admin.auditLog", href: "/admin/audit-log", icon: FileText },
      { titleKey: "nav.admin.settings", href: "/admin/settings", icon: Settings },
    ],
  },
  {
    labelKey: "nav.groups.account",
    items: [{ titleKey: "nav.admin.profile", href: "/admin/profile", icon: User }],
  },
];

export const publicNavKeys = [
  { titleKey: "nav.home", href: "/" },
  { titleKey: "nav.properties", href: "/properties" },
  { titleKey: "nav.products", href: "/products" },
  { titleKey: "nav.maintenance", href: "/maintenance" },
  { titleKey: "nav.about", href: "/about" },
  { titleKey: "nav.contact", href: "/contact" },
] as const;
