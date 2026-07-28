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
    <section className="bg-gray-50 px-6 py-24">
      <div className="mx-auto grid max-w-7xl items-start gap-14 md:grid-cols-2">
        <div>
          <h2 className="mb-5 text-3xl font-black tracking-tight md:text-4xl">
            Materiały, które naprawdę nosisz
          </h2>
          <p className="max-w-md leading-relaxed text-gray-500">
            Stawiamy na sprawdzone tkaniny i trwałe nadruki. Bez kompromisów,
            bez tanich zamienników.
          </p>
        </div>

        <div className="space-y-5 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm md:p-10">
          {materials.map((material, index) => (
            <div
              key={material.name}
              className={`flex items-start justify-between gap-4 pb-5 ${
                index < materials.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div>
                <p className="font-bold text-gray-900">{material.name}</p>
                <p className="text-sm text-gray-500">{material.desc}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm text-gray-600">{material.material}</p>
                <p className={`text-xs font-bold uppercase tracking-wider ${material.specColor}`}>
                  {material.spec}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
