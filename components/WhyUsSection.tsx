import {
  HiOutlineShieldCheck,
  HiOutlineBolt,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";

const items = [
  {
    title: "Najwyższa jakość",
    desc: "Bawełna ringspun, gramatura 180 g/m² i trwałe nadruki DTG, które nie blakną.",
    Icon: HiOutlineShieldCheck,
  },
  {
    title: "Szybka realizacja",
    desc: "Wysyłamy w 24h robocze. Bezpieczne, estetycznie zapakowane paczki.",
    Icon: HiOutlineBolt,
  },
  {
    title: "Indywidualne wsparcie",
    desc: "Pomagamy dobrać materiał, rozmiar i technikę druku do Twojego projektu.",
    Icon: HiOutlineChatBubbleLeftRight,
  },
];

export default function WhyUsSection() {
  return (
    <section className="bg-stone-50/50 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-stone-400">
            Nasze atuty
          </p>
          <h2 className="text-3xl font-medium tracking-tight text-stone-900">
            Dlaczego warto nam zaufać?
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map(({ title, desc, Icon }) => (
            <div
              key={title}
              className="group rounded-2xl bg-white p-8 transition-shadow duration-300 hover:shadow-md"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-stone-100 bg-stone-50 text-stone-600 transition-colors duration-300 group-hover:border-stone-900 group-hover:bg-stone-900 group-hover:text-white">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-base font-medium tracking-tight text-stone-900">
                {title}
              </h3>
              <p className="text-sm font-light leading-relaxed text-stone-500">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
