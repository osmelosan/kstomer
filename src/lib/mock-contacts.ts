export type ContactTone = "success" | "warning" | "muted";
export type ContactSource = "web" | "referral" | "email";

export type Contact = {
  id: string;
  initials: string;
  name: string;
  email: string;
  company: string;
  statusKey: string;
  tone: ContactTone;
  activityKey: string;
  source: ContactSource;
};

export const CONTACTS: Contact[] = [
  {
    id: "jean-dupont",
    initials: "JD",
    name: "Jean Dupont",
    email: "jean.dupont@techcorp.fr",
    company: "TechCorp Solutions",
    statusKey: "contacts.statuses.activeClient",
    tone: "success",
    activityKey: "contacts.activities.twoDays",
    source: "referral",
  },
  {
    id: "marie-lefebvre",
    initials: "ML",
    name: "Marie Lefebvre",
    email: "marie.l@innovate.co",
    company: "Innovate & Co",
    statusKey: "contacts.statuses.hotProspect",
    tone: "warning",
    activityKey: "contacts.activities.today",
    source: "web",
  },
  {
    id: "pierre-durand",
    initials: "PD",
    name: "Pierre Durand",
    email: "pdurand@logistics.net",
    company: "Global Logistics",
    statusKey: "contacts.statuses.inactive",
    tone: "muted",
    activityKey: "contacts.activities.twoMonths",
    source: "email",
  },
];

export function getContactById(id: string): Contact | undefined {
  return CONTACTS.find((c) => c.id === id);
}
