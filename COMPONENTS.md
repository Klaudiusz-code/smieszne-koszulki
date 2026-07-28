# Komponenty

Spis komponentów React wielokrotnego użytku z katalogu `components`.
Elementy wyższego poziomu zostały opisane w osobnych dokumentach:

- [Widoki](VIEWS.md)
- [Sekcje](SECTIONS.md)
- [Modale](MODALS.md)
- [Providery](PROVIDERS.md)
- [Ikony](ICONS.md)

## Oznaczenia

- **Klient** — plik zawiera dyrektywę `"use client"` i korzysta z interakcji,
  stanu Reacta albo API przeglądarki.
- **Współdzielony** — plik nie wyznacza granicy klienta. Może być renderowany po
  stronie serwera lub wejść do bundla klienta przez import z komponentu klienckiego.
- Komponenty oznaczone jako **default** mają eksport domyślny. Pozostałe korzystają
  z eksportu nazwanego.

| Komponent | Tryb | Plik | Odpowiedzialność |
| --- | --- | --- | --- |
| `AccountShell` | Klient | [`components/Account/AccountShell.tsx`](components/Account/AccountShell.tsx) | Wspólna rama widoków konta i formularzy uwierzytelniania. |
| `Addresses` (default) | Klient | [`components/Addresses/Addresses.tsx`](components/Addresses/Addresses.tsx) | Wyświetla i edytuje adres rozliczeniowy oraz wysyłkowy klienta. |
| `AttributeFilterPanel` | Klient | [`components/Filters/AttributeFilterPanel.tsx`](components/Filters/AttributeFilterPanel.tsx) | Panel grup filtrów i ich dostępnych wartości. |
| `BasicProductGrid` (default) | Współdzielony | [`components/BasicProductGrid/BasicProductGrid.tsx`](components/BasicProductGrid/BasicProductGrid.tsx) | Prosta, responsywna siatka kart produktów bez interaktywnego doładowywania. |
| `Button` | Współdzielony | [`components/buttons/Button.tsx`](components/buttons/Button.tsx) | Bazowy przycisk tekstowy z wariantami, rozmiarami i kontrolowanym stanem ładowania. |
| `CheckoutNavigation` | Współdzielony | [`components/Checkout/CheckoutNavigation.tsx`](components/Checkout/CheckoutNavigation.tsx) | Kontrolowana nawigacja pomiędzy krokami procesu zamówienia. |
| `ClearFiltersButton` | Współdzielony | [`components/buttons/ClearFiltersButton.tsx`](components/buttons/ClearFiltersButton.tsx) | Kontrolowany przycisk czyszczenia filtrów; operację otrzymuje przez `onClick`. |
| `CloseButton` | Współdzielony | [`components/buttons/CloseButton.tsx`](components/buttons/CloseButton.tsx) | Kontrolowany przycisk zamknięcia z wariantami dopasowanymi do jasnych i ciemnych powierzchni. |
| `CompanyLogo` | Współdzielony | [`components/CompanyLogo/CompanyLogo.tsx`](components/CompanyLogo/CompanyLogo.tsx) | Skalowalne logo SVG marki, którego rozmiar i kolor wynikają z klas CSS. |
| `ContactForm` | Klient | [`components/ContactForm/ContactForm.tsx`](components/ContactForm/ContactForm.tsx) | Obsługuje dane, walidację i wysyłkę wiadomości kontaktowej. |
| `ContactFormField` | Współdzielony | [`components/ContactForm/ContactFormField.tsx`](components/ContactForm/ContactFormField.tsx) | Spójne pole tekstowe lub wielowierszowe formularza kontaktowego. |
| `CookieConsentManager` | Klient | [`components/CookieConsentManager/CookieConsentManager.tsx`](components/CookieConsentManager/CookieConsentManager.tsx) | Baner i ustawienia zgód cookies oraz uruchamianie opcjonalnych integracji. |
| `CookieSettingsButton` | Współdzielony | [`components/buttons/CookieSettingsButton.tsx`](components/buttons/CookieSettingsButton.tsx) | Kontrolowany przycisk ustawień cookies używany w stopce. |
| `CookieSettingsControl` | Klient | [`components/SiteFooter/CookieSettingsControl.tsx`](components/SiteFooter/CookieSettingsControl.tsx) | Łączy przycisk stopki z mechanizmem otwierania panelu zgód. |
| `CustomSelect` | Klient | [`components/CustomSelect/CustomSelect.tsx`](components/CustomSelect/CustomSelect.tsx) | Stylizowana kontrolka wyboru z rozmiarem i kierunkiem wyrównania listy opcji. |
| `Details` (default) | Klient | [`components/Details/Details.tsx`](components/Details/Details.tsx) | Wyświetla i edytuje dane osobowe oraz kontaktowe klienta. |
| `EditButton` | Współdzielony | [`components/buttons/EditButton.tsx`](components/buttons/EditButton.tsx) | Kontrolowany przycisk edycji sekcji z ikoną ołówka. |
| `Files` (default) | Klient | [`components/Files/Files.tsx`](components/Files/Files.tsx) | Lista cyfrowych plików klienta dostępnych do pobrania. |
| `FilterChips` | Klient | [`components/Filters/FilterChips.tsx`](components/Filters/FilterChips.tsx) | Aktywne filtry jako znaczniki z możliwością usuwania pojedynczych kryteriów. |
| `Filters` | Klient | [`components/Filters/Filters.tsx`](components/Filters/Filters.tsx) | Pasek filtrów atrybutów, zsynchronizowany z parametrami URL. |
| `HeaderIconButton` | Współdzielony | [`components/buttons/HeaderIconButton.tsx`](components/buttons/HeaderIconButton.tsx) | Ikonowy przycisk otwierania i zamykania elementów nagłówka. |
| `JsonLd` | Współdzielony | [`components/JsonLd/JsonLd.tsx`](components/JsonLd/JsonLd.tsx) | Bezpiecznie serializuje i osadza dane strukturalne JSON-LD. |
| `ListingFilterControls` | Klient | [`components/ListingControls/ListingFilterControls.tsx`](components/ListingControls/ListingFilterControls.tsx) | Kontrolki ceny i dostępności w wariancie paska albo panelu. |
| `ListingSortControl` | Klient | [`components/ListingControls/ListingSortControl.tsx`](components/ListingControls/ListingSortControl.tsx) | Zmienia sposób sortowania produktów. |
| `Orders` (default) | Klient | [`components/Orders/Orders.tsx`](components/Orders/Orders.tsx) | Historia zamówień wraz ze statusami i najważniejszymi danymi. |
| `ProductGrid` | Klient | [`components/ProductGrid/ProductGrid.tsx`](components/ProductGrid/ProductGrid.tsx) | Siatka lub lista produktów z doładowywaniem, cenami, promocjami i listą życzeń. |
| `ProductThumbnail` | Współdzielony | [`components/ProductThumbnail/ProductThumbnail.tsx`](components/ProductThumbnail/ProductThumbnail.tsx) | Renderuje zoptymalizowany obraz produktu albo ikonę zastępczą. |
| `PromotionBadge` | Współdzielony | [`components/PromotionBadge/PromotionBadge.tsx`](components/PromotionBadge/PromotionBadge.tsx) | Etykieta informująca o promocji produktu. |
| `SiteFooter` | Współdzielony | [`components/SiteFooter/SiteFooter.tsx`](components/SiteFooter/SiteFooter.tsx) | Stopka z nawigacją, usługami i informacjami o marce. |
| `SiteFrame` | Klient | [`components/SiteFrame/SiteFrame.tsx`](components/SiteFrame/SiteFrame.tsx) | Mała granica kliencka łącząca bieżącą trasę, nagłówek, treść i stopkę. |
| `SiteHeader` | Klient | [`components/SiteHeader/SiteHeader.tsx`](components/SiteHeader/SiteHeader.tsx) | Nagłówek, nawigacja, menu mobilne oraz skróty konta, koszyka i listy życzeń. |
| `Switch` | Współdzielony | [`components/controls/Switch.tsx`](components/controls/Switch.tsx) | Kontrolowany przełącznik wartości logicznej w dwóch rozmiarach. |
| `ViewToggle` | Współdzielony | [`components/buttons/ViewToggle.tsx`](components/buttons/ViewToggle.tsx) | Kontrolowany przycisk prezentujący wybór między siatką i listą; stan oraz reakcję na kliknięcie otrzymuje przez właściwości. |
