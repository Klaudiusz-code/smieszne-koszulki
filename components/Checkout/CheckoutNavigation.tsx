/** Kontrolowana nawigacja pomiędzy krokami zamówienia. */
import { Button } from "@/components/buttons/Button";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

export function CheckoutNavigation({
  showBack,
  finalStep,
  canContinue,
  onBack,
  onContinue,
  onPlaceOrder,
  placingOrder = false,
}: {
  showBack: boolean;
  finalStep: boolean;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
  onPlaceOrder?: () => void;
  placingOrder?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center ${
        showBack ? "justify-between" : "justify-end"
      } gap-4`}
    >
      {showBack ? (
        <Button
          size="lg"
          onClick={onBack}
          className="gap-2 bg-white text-[#171717] shadow-[0_2px_16px_rgba(78,52,46,0.07)] hover:bg-[#FAF7F5] hover:shadow-[0_4px_20px_rgba(78,52,46,0.12)]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Poprzedni krok
        </Button>
      ) : null}

      {finalStep ? (
        <Button
          variant="primary"
          size="lg"
          disabled={!canContinue || !onPlaceOrder}
          loading={placingOrder}
          loadingLabel="Przetwarzanie zamówienia…"
          onClick={onPlaceOrder}
          elevated
          className="gap-2 px-4 text-center text-[13px] leading-snug sm:px-7 sm:text-sm"
        >
          Zamówienie z obowiązkiem zapłaty
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="primary"
          size="lg"
          disabled={!canContinue}
          onClick={onContinue}
          elevated
          className="gap-2"
        >
          Dalej
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
