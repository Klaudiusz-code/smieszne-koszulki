# Ikony

Spis współdzielonych komponentów SVG z katalogu `components/icons`.

Pozostałe spisy: [komponenty](COMPONENTS.md), [widoki](VIEWS.md),
[sekcje](SECTIONS.md), [modale](MODALS.md), [providery](PROVIDERS.md).

Ikony przyjmują standardowe właściwości SVG przez typ `IconProps`.
`HeartIcon` i `StarIcon` obsługują dodatkowo właściwość `filled`.

| Grupa | Komponenty |
| --- | --- |
| Nawigacja | `ArrowLeftIcon`, `ArrowRightIcon`, `ChevronDownIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `ExternalArrowIcon`, `MenuIcon`, `UserIcon`, `XIcon` |
| Akcje i statusy | `CheckIcon`, `FilterIcon`, `GridIcon`, `HeartIcon`, `ListIcon`, `LockIcon`, `MinusIcon`, `PencilIcon`, `PlusIcon`, `StarIcon`, `ZoomInIcon`, `ZoomOutIcon` |
| Zakupy i dostawa | `GiftIcon`, `MapPinIcon`, `ParcelLockerIcon`, `ShoppingBagIcon`, `TagIcon`, `TruckIcon` |
| Media i pozostałe | `CookieIcon`, `ImagePlaceholderIcon`, `InstagramIcon`, `TikTokIcon` |

## Komponent bazowy

Ikony obrysowe korzystają z `StrokeIcon` z
[`components/icons/IconBase.tsx`](components/icons/IconBase.tsx). Ten moduł
udostępnia również typy `IconProps` i `FillableIconProps`.
