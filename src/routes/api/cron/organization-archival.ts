import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const RETENTION_DAYS = 365;

export const Route = createFileRoute("/api/cron/organization-archival")({
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

        const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabaseAdmin
          .from("organizations")
          .select("id")
          .not("archived_at", "is", null)
          .eq("is_test", false)
          .lt("archived_at", cutoff);

        if (error) {
          console.error("[cron/organization-archival] fetch failed:", error);
          return Response.json({ purged: 0, errors: 1 });
        }

        const due = data ?? [];
        let purged = 0;
        let errors = 0;

        for (const org of due) {
          const { error: deleteError } = await supabaseAdmin
            .from("organizations")
            .delete()
            .eq("id", org.id);

          if (deleteError) {
            errors += 1;
            console.error(`[cron/organization-archival] failed to purge org ${org.id}:`, deleteError);
            continue;
          }
          purged += 1;
        }

        return Response.json({ purged, errors });
      },
    },
  },
});
