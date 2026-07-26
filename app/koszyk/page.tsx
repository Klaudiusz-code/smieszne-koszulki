"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import Breadcrumb from "@/components/Breadcrumb";

export default function KoszykPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 min-h-[60vh] flex flex-col">
        <Breadcrumb items={[{ label: "Koszyk" }]} />
        
        <div className="flex-1 flex flex-col items-center justify-center text-center -mt-12">
          <div className="w-24 h-24 rounded-full bg-[#ddb745]/10 flex items-center justify-center mb-8">
            <svg className="w-10 h-10 text-[#ddb745]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-medium text-black tracking-tight mb-3">
            Twój koszyk jest pusty
          </h1>
          <p className="text-stone-400 text-sm max-w-sm mb-10 leading-relaxed">
            Nie znalazłeś nic dla siebie? Sprawdź nasze najnowsze kolekcje koszulek i gadżetów.
          </p>
          <Link
            href="/sklep"
            className="inline-flex px-10 py-4 bg-black text-white text-sm font-medium tracking-wide rounded-full hover:bg-stone-800 transition-colors"
          >
            Przeglądaj produkty
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Breadcrumb items={[{ label: "Koszyk" }]} />

      <div className="flex items-baseline justify-between mb-10 border-b border-stone-100 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-medium text-black tracking-tight">
            Koszyk
          </h1>
          <p className="text-stone-400 text-sm mt-1 font-light">
            {items.length} {items.length === 1 ? "produkt" : items.length < 5 ? "produkty" : "produktów"} w Twoim zamówieniu
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-16">
        
        <div className="lg:col-span-2 divide-y divide-stone-100">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-6 py-8 first:pt-0 group">
              
              <Link 
                href={`/sklep/${item.slug}`} 
                className="relative w-32 h-40 bg-stone-50 rounded-2xl overflow-hidden shrink-0 ring-1 ring-stone-100 group-hover:ring-stone-300 transition-all duration-300"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="128px"
                />
              </Link>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <Link 
                    href={`/sklep/${item.slug}`} 
                    className="text-base font-medium text-black tracking-tight hover:underline underline-offset-4 decoration-stone-300"
                  >
                    {item.name}
                  </Link>
                  
                  {Object.entries(item.selectedAttrs).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {Object.entries(item.selectedAttrs).map(([key, value]) => (
                        <span 
                          key={key} 
                          className="text-[11px] font-medium text-stone-500 bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-md"
                        >
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center h-11 border border-stone-200 rounded-xl overflow-hidden">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-11 h-full flex items-center justify-center text-stone-500 hover:bg-stone-50 hover:text-black transition-colors text-lg font-light"
                    >
                      −
                    </button>
                    <span className="w-12 h-full flex items-center justify-center text-sm font-medium border-x border-stone-200 text-black">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-11 h-full flex items-center justify-center text-stone-500 hover:bg-stone-50 hover:text-black transition-colors text-lg font-light"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-5">
                    <span className="text-base font-medium text-black tracking-tight">
                      {(parseFloat(item.price) * item.quantity).toFixed(2)} zł
                    </span>
                    
                    <button 
                      onClick={() => removeItem(item.productId)}
                      className="text-stone-200 group-hover:text-stone-400 hover:!text-red-500 transition-colors duration-200"
                      aria-label="Usuń z koszyka"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-stone-50/50 rounded-2xl p-8 lg:sticky lg:top-24 border border-stone-100">
            <h3 className="text-sm font-medium text-black tracking-tight mb-8 uppercase tracking-widest text-xs">
              Podsumowanie
            </h3>
            
            <div className="space-y-4 text-sm pb-6 border-b border-stone-200">
              <div className="flex justify-between">
                <span className="text-stone-500 font-light">Wartość produktów ({items.reduce((a, c) => a + c.quantity, 0)} szt.)</span>
                <span className="text-black font-medium">{totalPrice} zł</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-light">Dostawa</span>
                <span className="text-[#27ae60] font-medium text-xs tracking-wide uppercase">Darmowa</span>
              </div>
            </div>

            <div className="mt-6 mb-8">
              <label className="text-xs text-stone-400 font-medium uppercase tracking-widest block mb-2">Kod rabatowy</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Wpisz kod" 
                  className="flex-1 px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-black placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#ddb745]/50 focus:border-[#ddb745] transition-all"
                />
                <button className="px-5 py-3 bg-stone-100 text-stone-600 text-xs font-medium rounded-xl hover:bg-stone-200 transition-colors">
                  Zastosuj
                </button>
              </div>
            </div>

            <div className="flex justify-between items-baseline mb-8">
              <span className="text-sm font-medium text-black">Razem do zapłaty</span>
              <span className="text-3xl font-medium text-black tracking-tight">
                {totalPrice} zł
              </span>
            </div>

            <button className="w-full py-4 bg-[#27ae60] text-white text-sm font-medium tracking-wide rounded-full hover:bg-[#219150] transition-colors shadow-sm shadow-[#27ae60]/20 flex items-center justify-center gap-2">
              Przejdź do kasy
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            <Link 
              href="/sklep" 
              className="block w-full text-center mt-6 text-xs text-stone-400 hover:text-black uppercase tracking-widest transition-colors pb-1 border-b border-transparent hover:border-stone-200 inline-block"
            >
              Kontynuuj zakupy
            </Link>
            
            <div className="mt-8 pt-6 border-t border-stone-200/50 flex items-center justify-center gap-2 text-[11px] text-stone-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Bezpieczne i szyfrowane połączenie
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}