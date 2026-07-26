import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-8xl font-black text-gray-100 mb-4">404</p>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
          Strona nie istnieje
        </h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
          Strona, której szukasz, mogła zostać przeniesiona lub usunięta.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex justify-center px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-green-600 transition-colors"
          >
            Strona główna
          </Link>
          <Link
            href="/sklep"
            className="inline-flex justify-center px-8 py-3.5 border-2 border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-widest rounded-full hover:border-black hover:bg-black hover:text-white transition-colors"
          >
            Przejdź do sklepu
          </Link>
        </div>
      </div>
    </div>
  );
}
