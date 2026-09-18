import { Button } from "@/components/buttons/Button";

export function RequestError({ message, onRetry, busy = false }: {
  message: string;
  onRetry?: () => void;
  busy?: boolean;
}) {
  return (
    <div role="alert" className="my-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
      <p>{message}</p>
      {onRetry && <Button className="mt-3" onClick={onRetry} loading={busy}>Spróbuj ponownie</Button>}
    </div>
  );
}
