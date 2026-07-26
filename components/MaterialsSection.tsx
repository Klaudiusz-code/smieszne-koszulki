const materials = [
  {
    name: "Koszulka klasyczna",
    desc: "Miękka, oddychająca, do codziennego noszenia",
    material: "100% bawełna ringspun",
    spec: "180 g/m²",
    specColor: "text-yellow-600",
  },
  {
    name: "Bluza premium",
    desc: "Gruba, ciepła, trzyma fason",
    material: "Bawełna / poliester",
    spec: "280 g/m²",
    specColor: "text-green-600",
  },
  {
    name: "Kubek ceramiczny",
    desc: "Nadruk odporny na mycie",
    material: "Ceramika premium",
    spec: "330 ml",
    specColor: "text-blue-600",
  },
];

export default function MaterialsSection() {
  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 items-start">
        <div>
          <h2 className="text-3xl md:text-4xl font-black mb-5 tracking-tight">
            Materiały, które naprawdę nosisz
          </h2>
          <p className="text-gray-500 max-w-md leading-relaxed">
            Stawiamy na sprawdzone tkaniny i trwałe nadruki. Bez kompromisów,
            bez tanich zamienników.
          </p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 space-y-5">
          {materials.map((m, i) => (
            <div
              key={m.name}
              className={`flex items-start justify-between gap-4 pb-5 ${
                i < materials.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div>
                <p className="font-bold text-gray-900">{m.name}</p>
                <p className="text-sm text-gray-500">{m.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm text-gray-600">{m.material}</p>
                <p
                  className={`text-xs font-bold ${m.specColor} uppercase tracking-wider`}
                >
                  {m.spec}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
