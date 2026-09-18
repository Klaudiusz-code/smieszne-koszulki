# Modale

Spis komponentów modalnych z katalogu `components/modals`. Kompletne modale są
komponentami klienckimi; współdzielony `ModalBackdrop` jest kontrolowanym
elementem prezentacyjnym.

Pozostałe spisy: [komponenty](COMPONENTS.md), [widoki](VIEWS.md),
[sekcje](SECTIONS.md), [providery](PROVIDERS.md), [ikony](ICONS.md).

| Modal | Plik | Odpowiedzialność |
| --- | --- | --- |
| `AccountModal` | [`components/modals/AccountModal/AccountModal.tsx`](components/modals/AccountModal/AccountModal.tsx) | Logowanie, rejestracja i odzyskiwanie hasła dla niezalogowanego użytkownika. |
| `AttributeFilterModal` | [`components/modals/AttributeFilterModal/AttributeFilterModal.tsx`](components/modals/AttributeFilterModal/AttributeFilterModal.tsx) | Wybór wartości pojedynczego atrybutu produktu. |
| `MobileFiltersModal` | [`components/modals/MobileFiltersModal/MobileFiltersModal.tsx`](components/modals/MobileFiltersModal/MobileFiltersModal.tsx) | Mobilny panel filtrów i sortowania listingu. |
| `ModalBackdrop` | [`components/modals/ModalBackdrop.tsx`](components/modals/ModalBackdrop.tsx) | Wspólne tło modala zamykające go przez callback `onClick`. |
| `ParcelLockerMap` | [`components/modals/ParcelLockerModal/ParcelLockerMap.tsx`](components/modals/ParcelLockerModal/ParcelLockerMap.tsx) | Osadza mapę w checkoutcie (nie modal) i zwraca wybrany punkt. |
| `ProductLightboxModal` | [`components/modals/ProductLightboxModal/ProductLightboxModal.tsx`](components/modals/ProductLightboxModal/ProductLightboxModal.tsx) | Pełnoekranowa galeria produktu z nawigacją, powiększeniem i obsługą klawiatury. |

`AccountModal` jest montowany globalnie przez
[`app/layout.tsx`](app/layout.tsx). Jego stan udostępnia `AccountModalProvider`
opisany w [PROVIDERS.md](PROVIDERS.md).
