# Routing przez catch-all

W `app` pozostają wyłącznie katalogi `[...slug]` i `api` oraz pliki wymagane przez
Next.js: layout, strona główna, 404, styles, favicon, robots i sitemap.
Nie ma katalogu `pages` ani osobnych katalogów stron.

## Podział odpowiedzialności

- `app/[...slug]/page.tsx`: cienkie wejście Next.js; eksportuje renderowanie,
  metadata i konfigurację segmentu.
- `lib/routing/storefront.ts`: czyste dopasowanie pełnej ścieżki do nazwy widoku.
- `lib/routing/Storefront.tsx`: rejestr modułów, lazy import, przekazanie
  parametrów i wybór metadanych. Nie przenosi całego routingu do klienta.
- `views`: kompletne widoki, bez osobnego katalogu tras. Prosty widok to jeden
  plik; folder widoku mieści `index.tsx` (metadata i dane serwerowe), komponent
  kliencki i hooki używane tylko w tym widoku. Np. `ProductView` zawiera również
  `useProductVariationSelection` i `useProductCartStatus`, a `CheckoutView`
  swoje hooki formularza, finalizacji i hydratacji.
- Sekcje konta obsługuje wspólny moduł `views/AccountView/index.tsx`.
  Przekierowanie `/kategoria` jest częścią dispatchera, nie osobnym widokiem.
- `app/page.tsx`: wejście `/` delegujące do `HomeView`, ponieważ wymagany
  catch-all `[...slug]` obsługuje ścieżki z co najmniej jednym segmentem.
- `app/api`: dotychczasowe endpointy, cookies, sesja i kontrola origin bez zmian.
  `/feed` jest wewnętrznie przepisywane do `app/api/feed/route.ts` przez
  `beforeFiles` w `next.config.ts`; publiczny adres RSS pozostaje `/feed`.

## Kolejność dopasowania

1. Nazwane adresy sklepu, w tym alias `/sklep` → ten sam widok co `/produkty`.
2. Konto i jego dozwolone sekcje — tylko przy aktywnej fladze funkcji konta.
3. Produkt `/produkt/:slug` i kategoria `/kategoria/:slug`.
4. `/zamowienie/order-pay/:orderId` i `/zamowienie/order-received/:orderId`.
   ID musi być dodatnią liczbą całkowitą zapisaną cyframi. Klucz zamówienia jest
   przekazywany z query string do istniejącego widoku; backend nadal go weryfikuje.
5. Pozostałe adresy → `WordPressView`, z dotychczasową obsługą strony/wpisu i 404.

Nieprawidłowe ścieżki pod zarezerwowanymi prefiksami sklepu zwracają 404 i nie
trafiają do CMS. `/kategoria` zachowuje przekierowanie 308 do `/kolekcje`, a
numeryczne adresy produktów nadal korzystają z dotychczasowego resolvera i 308 na slug.

## Metadata i cache

Każdy moduł widoku zachowuje swoje metadata lub `generateMetadata`. Dispatcher
wybiera je według tego samego dopasowania co widok. Filtry katalogu nadal wpływają
na noindex; klucze zamówień nie trafiają do canonical ani listy stron statycznych.

Jeden segment catch-all obejmuje też strony zależne od `searchParams`, dlatego
ma `revalidate = 0`: HTML powstaje na żądanie, bez wspólnego `generateStaticParams`.
Zachowano jawny cache danych przy fetchach (np. katalog 60 s, produkt 1 s, CMS 300 s).
Strona główna, sitemap i RSS zachowują własne generowanie/cache. To świadomy koszt
centralizacji routingu: produkty nie mają już osobno generowanych stron HTML w buildzie.
Nie używamy `force-dynamic`, aby nie wyłączać jawnie skonfigurowanego cache fetchy.
Zasada `revalidate = 0` jest opisana w [dokumentacji Next.js](https://nextjs.org/docs/15/app/api-reference/file-conventions/route-segment-config#revalidate)
i została sprawdzona na zainstalowanej wersji przez build oraz żądania HTTP.

## Dodanie adresu

Dodaj dopasowanie do resolvera, moduł do `views` i wpis w rejestrze.
W razie potrzeby uwzględnij publiczną stronę w sitemap oraz testach. Nie dodawaj katalogu strony do `app`.

Testy `tests/routing.test.mjs` sprawdzają rozpoznawanie adresów, ograniczenia konta,
nieprawidłowe ścieżki, fallback WordPressa oraz dozwolone katalogi w `app`.
