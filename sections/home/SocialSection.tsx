import Link from "next/link";
import { GiftIcon } from "@/components/icons/GiftIcon";
import { TagIcon } from "@/components/icons/TagIcon";

/** Prezentuje wyróżniki oferty bez zależności od zewnętrznych serwisów. */
export function SocialSection() {
  return (
    <section className="my-[64px]">
      <div className="mb-[26px]">
        <h2 className="text-[34px] font-medium sm:text-[36px]">
          <b>Zero nudy. Dużo charakteru.</b>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article className="relative min-h-[330px] overflow-hidden rounded-[24px] bg-cd-dark px-7 py-9 text-white shadow-[0_24px_70px_rgba(16,36,27,0.16)] sm:px-8">
          <div className="absolute -right-16 -top-20 h-[250px] w-[250px] rounded-full bg-[#ddb745]/20 blur-3xl" aria-hidden="true" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-cd-dark">
                <TagIcon className="h-5 w-5" />
              </div>
              <h3 className="text-[30px] font-medium leading-tight">Nadruki, które mówią za Ciebie</h3>
              <p className="mt-4 max-w-[470px] text-[16px] leading-[1.85] text-white/70">
                Od tekstów dla fanów motoryzacji po kultowe cytaty. Wybierz wzór,
                który pasuje do Twojego poczucia humoru.
              </p>
            </div>
            <Link href="/kategoria/koszulki" className="w-fit rounded-full bg-white px-6 py-3 text-[15px] font-medium text-cd-dark transition-opacity hover:opacity-85">
              Zobacz koszulki
            </Link>
          </div>
        </article>

        <article className="relative min-h-[330px] overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#effff6_0%,#ffffff_56%,#e7fff1_100%)] px-7 py-9 text-cd-brown shadow-[0_24px_70px_rgba(16,36,27,0.10)] sm:px-8">
          <div className="absolute -bottom-20 -right-12 h-[250px] w-[250px] rounded-full bg-[#ddb745]/22 blur-3xl" aria-hidden="true" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-cd-brown shadow-sm">
                <GiftIcon className="h-5 w-5" />
              </div>
              <h3 className="text-[30px] font-medium leading-tight">Prezent bez nudy</h3>
              <p className="mt-4 max-w-[470px] text-[16px] leading-[1.85] text-cd-brown/68">
                Koszulka, kubek albo gadżet z trafionym tekstem sprawdzi się wtedy,
                gdy zwykły prezent to zdecydowanie za mało.
              </p>
            </div>
            <Link href="/prezenty" className="w-fit rounded-full bg-cd-brown px-6 py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-85">
              Znajdź prezent
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
