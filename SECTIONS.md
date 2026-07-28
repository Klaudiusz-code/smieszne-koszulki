# Sekcje

Spis większych, domenowych fragmentów stron z katalogu `sections`. Sekcje mogą
być składane przez widoki albo bezpośrednio przez punkty wejścia aplikacji.

Pozostałe spisy: [komponenty](COMPONENTS.md), [widoki](VIEWS.md),
[modale](MODALS.md), [providery](PROVIDERS.md), [ikony](ICONS.md).

| Sekcja | Tryb | Plik | Odpowiedzialność |
| --- | --- | --- | --- |
| `FrontProductsSection` | Klient | [`sections/home/FrontProductsSection.tsx`](sections/home/FrontProductsSection.tsx) | Wyróżnione produkty strony głównej wraz z obsługą listy życzeń. |
| `SocialSection` | Współdzielony | [`sections/home/SocialSection.tsx`](sections/home/SocialSection.tsx) | Karty odsyłające do profili marki w mediach społecznościowych. |
| `FaqSection` | Współdzielony | [`sections/home/FaqSection.tsx`](sections/home/FaqSection.tsx) | Rozwijana lista najczęściej zadawanych pytań; moduł eksportuje również `FAQ_ITEMS`. |
| `RelatedProductsSection` | Współdzielony | [`sections/products/RelatedProductsSection.tsx`](sections/products/RelatedProductsSection.tsx) | Produkty powiązane lub polecane, wraz ze stanem ładowania. |
