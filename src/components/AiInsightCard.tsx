import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export type AiInsightStatus = "idle" | "loading" | "ready" | "error";

export function AiInsightCard({
  title,
  disclaimer,
  status,
  markdown,
  errorMessage,
  loadingLabel,
  regenerateLabel,
  onRegenerate,
  className = "mb-5",
}: {
  title: string;
  disclaimer: string;
  status: AiInsightStatus;
  markdown: string;
  errorMessage: string;
  loadingLabel: string;
  regenerateLabel: string;
  onRegenerate: () => void;
  className?: string;
}) {
  return (
    <div className={`k-card p-6 border-l-4 border-l-secondary ${className}`}>
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-secondary/10 text-secondary grid place-items-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-[15px] tracking-tight">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{disclaimer}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={status === "loading"}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${status === "loading" ? "animate-spin" : ""}`} />
          {status === "loading" ? loadingLabel : regenerateLabel}
        </button>
      </div>

      {status === "loading" && (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </div>
      )}

      {status === "error" && (
        <div className="flex items-start gap-2 text-sm text-error">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {status === "ready" && (
        <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
