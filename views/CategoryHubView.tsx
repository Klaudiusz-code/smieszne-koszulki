/** Renderuje nawigacyjny widok kolekcji lub kategorii prowadzący do listingów produktów. */
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

interface CategoryHubCard {
  title: string;
  description: string;
  href: string;
}

export function CategoryHubView({
  title,
  description,
  cards,
  backgroundImage,
}: {
  title: string;
  description: string;
  cards: CategoryHubCard[];
  backgroundImage?: string;
}) {
  return (
    <section className="my-[64px]">
      <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#fafaf9_0%,#FFFFFF_58%,#F5EEE8_100%)] px-6 py-10 text-cd-brown sm:px-10 sm:py-14 xl:px-14">
	        {backgroundImage ? (
	          <>
	            <div
	              aria-hidden="true"
	              className="pointer-events-none absolute right-0 top-0 h-full w-full opacity-25 sm:w-[62%] sm:opacity-60"
	            >
	              <Image
	                src={backgroundImage}
	                alt=""
	                fill
	                sizes="(min-width: 640px) 62vw, 100vw"
	                loading="eager"
	                preload
	                className="object-cover object-right-top"
	              />
	            </div>
	            <div
	              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(248,244,241,0.98)_0%,rgba(255,255,255,0.9)_46%,rgba(245,238,232,0.22)_100%)]"
            />
          </>
        ) : null}

        <div className="relative flex flex-col gap-4 sm:gap-6">
          <h1 className="max-w-[760px] text-[34px] font-medium sm:text-[36px]">
            <b>{title}</b>
          </h1>
          <p className="max-w-[780px] text-[18px] leading-8 text-cd-brown/68">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-[32px] grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-[20px] border border-[#e7e5e4] bg-white p-6 text-cd-brown transition-all duration-200 hover:-translate-y-0.5 hover:border-cd-brown/30 hover:shadow-[0_18px_36px_rgba(78,52,46,0.10)]"
          >
            <div className="flex items-start justify-between gap-5">
              <h2 className="text-[24px] font-medium leading-tight">
                {card.title}
              </h2>
              <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1E7E0] text-cd-brown transition-colors group-hover:bg-cd-dark group-hover:text-white">
                <ArrowRightIcon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-4 text-[17px] leading-7 text-cd-brown/66">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
