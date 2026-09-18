# Widoki

Widoki składają komponenty domenowe w kompletne ekrany osadzane przez routing
Next.js z katalogu `app`.

Pozostałe spisy: [komponenty](COMPONENTS.md), [sekcje](SECTIONS.md),
[modale](MODALS.md), [providery](PROVIDERS.md), [ikony](ICONS.md).

## Oznaczenia

- **Serwer** — pobiera dane i składa widok oraz metadata.
- **Klient** — plik wyznacza granicę klienta dyrektywą `"use client"`.
- **Współdzielony** — plik może być renderowany po stronie serwera albo użyty
  wewnątrz drzewa klienckiego.
- Oznaczenie **default** wskazuje eksport domyślny.

## Widoki aplikacji

| Widok | Tryb | Plik | Odpowiedzialność |
| --- | --- | --- | --- |
| `AccountView` | Klient | [`views/AccountView/AccountView.tsx`](views/AccountView/AccountView.tsx) | Składa pełnostronicowy panel konta; bez aktywnej sesji pokazuje informację o braku dostępu i otwiera modal logowania. |
| `CartView` (default) | Klient | [`views/CartView/CartView.tsx`](views/CartView/CartView.tsx) | Koszyk, zmiana ilości, usuwanie pozycji, podsumowanie i rekomendacje. |
| `CategoryHubView` | Współdzielony | [`views/CategoryHubView.tsx`](views/CategoryHubView.tsx) | Nawigacyjny ekran kolekcji lub kategorii z kartami odsyłającymi do listingów. |
| `CheckoutView` (default) | Klient | [`views/CheckoutView/CheckoutView.tsx`](views/CheckoutView/CheckoutView.tsx) | Wieloetapowe zamówienie: dane klienta, adres, dostawa, płatność i faktura. |
| `ContactView` | Klient | [`views/ContactView/ContactView.tsx`](views/ContactView/ContactView.tsx) | Treść strony kontaktowej połączona z interaktywnym formularzem. |
| `HomeView` (default) | Serwer | [`views/HomeView.tsx`](views/HomeView.tsx) | Pobiera produkty, tworzy metadata i składa sekcje strony głównej. |
| `OrderPayView` (default) | Klient | [`views/OrderPayView/OrderPayView.tsx`](views/OrderPayView/OrderPayView.tsx) | Stan zamówienia oczekującego na płatność i przekierowanie do płatności. |
| `OrderReceivedView` (default) | Klient | [`views/OrderReceivedView/OrderReceivedView.tsx`](views/OrderReceivedView/OrderReceivedView.tsx) | Potwierdzenie przyjęcia zamówienia po powrocie z płatności. |
| `ShopView` | Klient | [`views/ShopView/ShopView.tsx`](views/ShopView/ShopView.tsx) | Aktualny katalog: filtry URL, wyszukiwanie i doładowywanie kursorem. |
| `ProductListingView` | Klient | [`views/ProductListingView.tsx`](views/ProductListingView.tsx) | Kompletny listing: filtry, sortowanie, aktywne kryteria i siatka produktów. |
| `ProductView` (default) | Klient | [`views/ProductView/ProductView.tsx`](views/ProductView/ProductView.tsx) | Galeria, warianty, koszyk, lista życzeń i opinie na karcie produktu. |
| `ResetPasswordView` | Klient | [`views/ResetPasswordView/ResetPasswordView.tsx`](views/ResetPasswordView/ResetPasswordView.tsx) | Weryfikuje proces resetowania i pozwala ustawić nowe hasło. |

## Trasy i kompozycja

Pliki z katalogu `app` są cienkimi punktami wejścia. Widoki z danymi i metadata
są w `views`, a resolver i dispatcher w `lib/routing`; [zasady routingu](docs/ROUTING.md).

| Adres | Komponent strony | Główna kompozycja |
| --- | --- | --- |
| `/` | [`HomeView`](app/page.tsx) | `HomeView` |
| `/produkty` | [`Shop`](views/ShopView/index.tsx) | `ShopView`: filtry URL i doładowywanie |
| `/kategoria/[slug]` | [`CategoryView`](views/CategoryView.tsx) | `ShopView` w kontekście kategorii |
| `/produkt/[slug]` | [`Product`](views/ProductView/index.tsx) | `ProductView`, dane strukturalne |
| `/kolekcje` | [`CollectionsView`](views/CollectionsView.tsx) | `CategoryHubView` |
| `/prezenty` | [`GiftsView`](views/GiftsView.tsx) | `CategoryHubView` |
| `/kontakt` | [`ContactView`](views/ContactView/index.tsx) | `ContactView` |
| `/koszyk` | [`CartView`](views/CartView/index.tsx) | `CartView` |
| `/konto` | [`Account`](views/AccountView/index.tsx) | `AccountView` — szczegóły konta |
| `/konto/zamowienia` | [`Account`](views/AccountView/index.tsx) | `AccountView` — zamówienia |
| `/konto/adresy` | [`Account`](views/AccountView/index.tsx) | `AccountView` — adresy |
| `/konto/pliki` | [`Account`](views/AccountView/index.tsx) | `AccountView` — pliki |
| `/zamowienie` | [`CheckoutView`](views/CheckoutView/index.tsx) | `CheckoutView` |
| `/zamowienie/order-pay/[orderId]` | [`OrderPay`](views/OrderPayView/index.tsx) | `OrderPayView` |
| `/zamowienie/order-received/[orderId]` | [`OrderReceived`](views/OrderReceivedView/index.tsx) | `OrderReceivedView` |
| `/resetuj-haslo` | [`ResetPassword`](views/ResetPasswordView/index.tsx) | `ResetPasswordView` |
| `/sklep` | [Alias sklepu](views/ShopView/index.tsx) | Ta sama strona co `/produkty`, canonical `/produkty` |
| `/[...slug]` | [`Storefront`](lib/routing/Storefront.tsx) | Wybór widoku sklepu; pozostałe adresy → `WordPressView` |
| brak dopasowania | [`NotFound`](app/not-found.tsx) | Widok 404 |

Aktualne zależności i ograniczenia: [architektura](docs/ARCHITECTURE.md).

Foldery widoków mają wejście `index.tsx` z metadata/danymi oraz komponent
kliencki. Lokalne hooki produktu i checkoutu znajdują się obok ich komponentów.
Proste widoki pozostają pojedynczymi plikami; brak osobnego katalogu tras.
