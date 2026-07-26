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
    <section className="py-24 px-6 bg-stone-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
            Nasze atuty
          </p>
          <h2 className="text-3xl font-medium text-stone-900 tracking-tight">
            Dlaczego warto nam zaufać?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map(({ title, desc, Icon }) => (
            <div
              key={title}
              className="bg-white p-8 rounded-2xl transition-shadow duration-300 hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center mb-6 text-stone-600 group-hover:bg-stone-900 group-hover:text-white group-hover:border-stone-900 transition-colors duration-300">
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </div>

              <h3 className="text-base font-medium text-stone-900 tracking-tight mb-2">
                {title}
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed font-light">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
