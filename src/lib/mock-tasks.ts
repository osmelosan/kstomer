export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  titleKey: string;
  subtitleKey: string;
  contact?: string;
  dueDate: string; // ISO
  priority: TaskPriority;
  status: TaskStatus;
};

export const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    titleKey: "dashboard.actions.followUp",
    subtitleKey: "dashboard.actions.followUpSub",
    contact: "Thomas Durand",
    dueDate: "2026-06-23",
    priority: "high",
    status: "todo",
  },
  {
    id: "t2",
    titleKey: "dashboard.actions.finalize",
    subtitleKey: "dashboard.actions.finalizeSub",
    contact: "StartUp Vision",
    dueDate: "2026-06-25",
    priority: "medium",
    status: "in_progress",
  },
  {
    id: "t3",
    titleKey: "dashboard.actions.late",
    subtitleKey: "dashboard.actions.lateSub",
    contact: "Jean Dupont",
    dueDate: "2026-06-15",
    priority: "high",
    status: "todo",
  },
  {
    id: "t4",
    titleKey: "tasks.seed.proposalTitle",
    subtitleKey: "tasks.seed.proposalSub",
    contact: "Studio Maelis",
    dueDate: "2026-06-28",
    priority: "medium",
    status: "todo",
  },
  {
    id: "t5",
    titleKey: "tasks.seed.callTitle",
    subtitleKey: "tasks.seed.callSub",
    contact: "Northgate Logistics",
    dueDate: "2026-06-24",
    priority: "low",
    status: "in_progress",
  },
  {
    id: "t6",
    titleKey: "tasks.seed.invoiceTitle",
    subtitleKey: "tasks.seed.invoiceSub",
    contact: "Beaumont Digital",
    dueDate: "2026-06-20",
    priority: "low",
    status: "done",
  },
  {
    id: "t7",
    titleKey: "tasks.seed.demoTitle",
    subtitleKey: "tasks.seed.demoSub",
    contact: "Boulangerie Lumen",
    dueDate: "2026-06-30",
    priority: "medium",
    status: "todo",
  },
  {
    id: "t8",
    titleKey: "tasks.seed.contractTitle",
    subtitleKey: "tasks.seed.contractSub",
    contact: "Acme Global",
    dueDate: "2026-06-18",
    priority: "high",
    status: "done",
  },
];
