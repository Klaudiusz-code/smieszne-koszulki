/** Renderuje sekcję najczęstszych pytań jako rozwijaną listę odpowiedzi. */
import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";

export const FAQ_ITEMS = [
  {
    question: "Jak dobrać rozmiar koszulki lub bluzy?",
    answer:
      "Na stronie produktu wybierz dostępny wariant rozmiaru. Przed zakupem porównaj wymiary swojej ulubionej koszulki z tabelą lub informacjami w opisie produktu.",
  },
  {
    question: "Czy produkty nadają się na prezent?",
    answer:
      "Jasne. Zabawna koszulka, kubek lub gadżet to prosty prezent na urodziny, święta i każdą okazję, która zasługuje na odrobinę humoru.",
  },
  {
    question: "Jak dbać o nadruk?",
    answer:
      "Odzież pierz na lewej stronie, w temperaturze podanej na metce, bez agresywnych wybielaczy. Nie prasuj bezpośrednio po nadruku.",
  },
  {
    question: "Kiedy otrzymam swoje zamówienie?",
    answer:
      "Czas realizacji zależy od rodzaju produktu i wybranej formy dostawy. Aktualne informacje o zamówieniu możesz śledzić po zakupie w swoim koncie klienta",
  },
];

export function FaqSection() {
  return (
    <section className="my-[64px]">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div>
          <h2 className="text-[34px] font-medium sm:text-[36px]">
            <b>FAQ</b>
          </h2>
          <p className="mt-[22px] max-w-[640px] text-[21px] leading-9 text-cd-brown/74">
            Masz pytania? Sprawdź najczęściej zadawane. Znajdziesz tu odpowiedzi dotyczące
            rozmiarów, nadruków, zamówień, dostawy i zakupów w sklepie.
          </p>
        </div>

        <div>
          <div className="overflow-hidden rounded-[24px] border border-[#e7e5e4] text-cd-brown">
            {FAQ_ITEMS.map((item, idx) => (
              <details
                key={item.question}
                name="faq"
                className={`group bg-white p-6 transition-colors open:bg-[#fafaf9]${idx !== FAQ_ITEMS.length - 1 ? " border-b border-[#e7e5e4]" : ""}`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[19px] font-medium leading-snug">
                  <span>{item.question}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fafaf9] transition-all group-open:bg-[#e7e5e4]">
                    <ChevronDownIcon className="h-4 w-4 text-cd-brown/50 transition-transform group-open:rotate-180 group-open:text-cd-brown/70" strokeWidth={2.5} />
                  </span>
                </summary>
                <div className="mt-4 text-[17px] leading-8 text-cd-brown/68">{item.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
