import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export function ErrorState({ message = "Something went wrong", onRetry }: { message?: string, onRetry?: () => void }) {
  return (
    <div className="flex h-64 w-full flex-col items-center justify-center space-y-4 text-center">
      <div className="text-destructive font-medium">{message}</div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message, icon: Icon }: { message: string, icon?: React.ElementType }) {
  return (
    <div className="flex h-64 w-full flex-col items-center justify-center space-y-3 rounded-lg border border-dashed border-border p-8 text-center glass-panel">
      {Icon && <Icon className="h-10 w-10 text-muted-foreground/50" />}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
