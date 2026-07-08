import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type DueReminder = {
  id: string;
  contact_id: string;
  trigger_offset_days: number;
  contacts: {
    archived_at: string | null;
    organization_id: string;
    organizations: { owner_id: string } | null;
  } | null;
};

export const Route = createFileRoute("/api/cron/renewal-reminders")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret) {
          const authHeader = request.headers.get("authorization");
          if (authHeader !== `Bearer ${cronSecret}`) {
            return new Response("Unauthorized", { status: 401 });
          }
        }

        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabaseAdmin
          .from("reminders")
          .select(
            "id, contact_id, trigger_offset_days, contacts(archived_at, organization_id, organizations(owner_id))",
          )
          .eq("is_active", true)
          .is("sent_at", null)
          .lte("reminder_date", today);

        if (error) {
          console.error("[cron/renewal-reminders] fetch failed:", error);
          return Response.json({ notified: 0, errors: 1 });
        }

        const due = (data ?? []) as unknown as DueReminder[];
        let notified = 0;
        let errors = 0;

        for (const reminder of due) {
          const ownerId = reminder.contacts?.organizations?.owner_id;
          if (!reminder.contacts || reminder.contacts.archived_at || !ownerId) continue;

          try {
            const { error: insertError } = await supabaseAdmin.from("notifications").insert({
              organization_id: reminder.contacts.organization_id,
              user_id: ownerId,
              type: "renewal",
              contact_id: reminder.contact_id,
              reminder_id: reminder.id,
              trigger_offset_days: reminder.trigger_offset_days,
            });
            if (insertError) throw insertError;

            const { error: updateError } = await supabaseAdmin
              .from("reminders")
              .update({ sent_at: new Date().toISOString() })
              .eq("id", reminder.id);
            if (updateError) throw updateError;

            notified += 1;
          } catch (err) {
            errors += 1;
            console.error(`[cron/renewal-reminders] failed for reminder ${reminder.id}:`, err);
          }
        }

        return Response.json({ notified, errors });
      },
    },
  },
});
