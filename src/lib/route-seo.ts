import i18n from "@/lib/i18n";

const SITE = "https://kstomer.lovable.app";

type Lang = "fr" | "en" | "es";

type RouteKey =
  | "home"
  | "auth"
  | "reset"
  | "dashboard"
  | "contacts"
  | "contactDetail"
  | "newContact"
  | "kanban"
  | "tasks"
  | "analytics"
  | "archives"
  | "resellers"
  | "onboarding"
  | "pricing"
  | "access"
  | "settings";

const DESCRIPTIONS: Record<RouteKey, Record<Lang, string>> = {
  home: {
    fr: "Kstomer, le CRM efficace et sans bruit pour solopreneurs : pipeline, contacts, relances et analytics en 2 minutes.",
    en: "Kstomer is the efficient, no-noise CRM for solopreneurs: pipeline, contacts, follow-ups and analytics in 2 minutes.",
    es: "Kstomer, el CRM eficaz y sin ruido para emprendedores: pipeline, contactos, seguimiento y analítica en 2 minutos.",
  },
  auth: {
    fr: "Connectez-vous, créez votre compte Kstomer ou récupérez votre mot de passe.",
    en: "Sign in, create your Kstomer account or recover your password.",
    es: "Inicia sesión, crea tu cuenta de Kstomer o recupera tu contraseña.",
  },
  reset: {
    fr: "Choisissez un nouveau mot de passe pour votre compte Kstomer.",
    en: "Choose a new password for your Kstomer account.",
    es: "Elige una nueva contraseña para tu cuenta de Kstomer.",
  },
  dashboard: {
    fr: "Vos priorités, KPI et opportunités du jour en un coup d'œil.",
    en: "Your daily priorities, KPIs and opportunities at a glance.",
    es: "Tus prioridades, KPI y oportunidades del día de un vistazo.",
  },
  contacts: {
    fr: "Carnet de contacts unifié : recherche, filtres et historique.",
    en: "Unified contact book: search, filters and history.",
    es: "Libreta de contactos unificada: búsqueda, filtros e historial.",
  },
  contactDetail: {
    fr: "Fiche contact détaillée : interactions, notes et activité.",
    en: "Detailed contact sheet: interactions, notes and activity.",
    es: "Ficha de contacto detallada: interacciones, notas y actividad.",
  },
  newContact: {
    fr: "Ajoutez un nouveau contact à votre CRM Kstomer.",
    en: "Add a new contact to your Kstomer CRM.",
    es: "Añade un nuevo contacto a tu CRM Kstomer.",
  },
  kanban: {
    fr: "Pipeline commercial visuel par étapes pour piloter vos deals.",
    en: "Visual sales pipeline by stages to drive your deals.",
    es: "Pipeline comercial visual por etapas para gestionar tus oportunidades.",
  },
  tasks: {
    fr: "Toutes vos tâches et relances priorisées en une vue.",
    en: "All your tasks and follow-ups prioritized in one view.",
    es: "Todas tus tareas y seguimientos priorizados en una vista.",
  },
  analytics: {
    fr: "Analytique commerciale : revenus, conversion et tendances.",
    en: "Sales analytics: revenue, conversion and trends.",
    es: "Analítica comercial: ingresos, conversión y tendencias.",
  },
  archives: {
    fr: "Retrouvez vos contacts et deals archivés.",
    en: "Find your archived contacts and deals.",
    es: "Consulta tus contactos y oportunidades archivados.",
  },
  resellers: {
    fr: "Gérez votre réseau de revendeurs et partenaires.",
    en: "Manage your reseller and partner network.",
    es: "Gestiona tu red de distribuidores y socios.",
  },
  onboarding: {
    fr: "Configurez votre profil Kstomer en quelques étapes.",
    en: "Set up your Kstomer profile in a few steps.",
    es: "Configura tu perfil de Kstomer en unos pasos.",
  },
  pricing: {
    fr: "Choisissez votre plan Kstomer : Starter, Expansion ou Empire. Essai gratuit 14 jours.",
    en: "Choose your Kstomer plan: Starter, Expansion or Empire. 14-day free trial.",
    es: "Elige tu plan Kstomer: Starter, Expansion o Empire. Prueba gratis de 14 días.",
  },
  access: {
    fr: "Gérez les accès à vos serrures connectées Nuki.",
    en: "Manage access to your Nuki smart locks.",
    es: "Gestiona los accesos a tus cerraduras inteligentes Nuki.",
  },
  settings: {
    fr: "Préférences de compte, équipe et notifications.",
    en: "Account, team and notification preferences.",
    es: "Preferencias de cuenta, equipo y notificaciones.",
  },
};

function lang(): Lang {
  const l = i18n.language?.split("-")[0] as Lang;
  return l === "en" || l === "es" ? l : "fr";
}

export function pageHead(opts: {
  routeKey: RouteKey;
  title: string;
  path: string;
  noindex?: boolean;
  ogType?: string;
}) {
  const description = DESCRIPTIONS[opts.routeKey][lang()];
  const url = `${SITE}${opts.path}`;
  const meta: Array<Record<string, string>> = [
    { title: opts.title },
    { name: "description", content: description },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: opts.ogType ?? "website" },
    { property: "og:site_name", content: "Kstomer" },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: description },
  ];
  if (opts.noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }
  return {
    meta,
    links: [{ rel: "canonical", href: url }],
  };
}

export const SITE_URL = SITE;
