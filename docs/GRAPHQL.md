# Dokumenty i generowanie typów GraphQL

Stan: 2026-09-19. GraphQL jest szczegółem serwerowych adapterów WordPress/WooCommerce.
Widoki i przeglądarka nadal korzystają z własnych DTO oraz `/api/store` i `/api/views`.

## Pliki

| Źródło | Przeznaczenie |
| --- | --- |
| `graphql/schema.graphql` | Posortowany SDL z publicznej introspekcji docelowego WordPressa |
| `packages/commerce/woocommerce/queries/**/*.graphql` | Operacje adaptera commerce i wspólny fragment `CartItemProduct` |
| `queries/**/*.graphql` | Konto, auth, produkt, CMS, feed i pozostałe zapytania aplikacji |
| `codegen.mts` | Konfiguracja Codegen dla obu zestawów dokumentów |
| `packages/commerce/woocommerce/generated.ts` | Generowane typy i dokumenty adaptera commerce |
| `lib/server/wordpress/generated.ts` | Generowane typy i dokumenty aplikacji |

Oba `generated.ts` oraz SDL przechowujemy w repo i nie edytujemy ręcznie.
Nie wymagamy loadera `.graphql` w Next: aplikacja importuje gotowe dokumenty TS.
`typescript-operations` w używanej wersji generuje również potrzebne typy wejściowe
i enumy; `typed-document-node` dodaje dokumenty z powiązanym wynikiem i zmiennymi.
`scripts/codegen-enums.cjs` generuje wartości enumów kraju i taksonomii do walidacji
konwersji stringów domenowych na wejścia WooGraphQL. Źródłem wartości jest SDL.
Typy odpowiedzi obejmują wyłącznie wybrane pola i nullowalność z backendu.

## Workflow

```bash
# Tylko gdy chcesz pobrać aktualny schemat backendu:
npm run graphql:schema

# Po edycji dokumentów lub aktualizacji schematu, bez sieci:
npm run graphql:generate
npm run graphql:check

./node_modules/.bin/tsc --noEmit --incremental false
./node_modules/.bin/tsc -p packages/commerce/tsconfig.json
npm test
```

Introspekcja korzysta z `WORDPRESS_GRAPHQL_URL` (wczytuje pliki env Next), domyślnie
`https://zabawnekoszulki.pl/graphql`. Pobiera sam schemat, bez cookies, tokenów i
danych klientów. Zapisuje plik dopiero po poprawnym zbudowaniu całego schematu.
Zmiana wtyczek WP może zmienić schemat — najpierw przejrzyj diff SDL, potem
wygeneruj typy i dostosuj adapter. Aktualizacja schematu nie wdraża wtyczek PHP.

`graphql:check` waliduje dokumenty i porównuje wynik generacji z zapisanymi plikami;
nie zapisuje zmian. Jest częścią `npm run build` / `build:release`, więc brak
regeneracji blokuje build. Generacja jest offline; Next nadal może pobierać dane
publicznych stron w swojej fazie budowania.

## Nowa operacja

1. Dodaj nazwane zapytanie/mutację w odpowiednim `.graphql`; powtarzane selekcje
   współdziel fragmentami w tym samym zestawie dokumentów.
2. Wykonaj `graphql:generate`. Niepoprawne pole/argument zatrzyma generator.
3. Importuj wygenerowany dokument w adapterze. Dla operacji sesyjnej dopisz go
   do `commerceDocuments` lub serwerowej mapy `GRAPHQL_ALLOWLIST`.
4. Mapuj wynik na DTO i waliduj go istniejącym schematem runtime.

```ts
const result = await transport("ApplyCoupon", { code });
// Typ result wynika z dokumentu ApplyCoupon, bez transport<MyManualResponse>.
```

Publiczne odczyty używają `publicQuery(Document, variables, revalidate)`.
Żądania prywatne nadal mają `no-store`, sesję na żądanie i rotację HttpOnly cookies.
Parametry, w tym refresh token, są przesyłane osobno jako variables; nie interpoluj
ich do tekstu zapytania. `print(document)` jest potrzebne dopiero przy serializacji HTTP.
Nie dodawaj publicznego endpointu przyjmującego dowolny GraphQL.

Codegen kontroluje kontrakt podczas kompilacji, a nie faktyczną odpowiedź sieciową.
Pozostaw obsługę `errors`, sprawdzanie potwierdzeń mutacji, normalizację kolekcji
`null`, walidację DTO i odzyskiwanie wyniku zamówienia bez ponawiania zapisu.

Referencja: [TypedDocumentNode — The Guild](https://the-guild.dev/graphql/codegen/plugins/typescript/typed-document-node).
