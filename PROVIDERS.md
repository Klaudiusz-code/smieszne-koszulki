# Providery

Spis providerów globalnego stanu i ich publicznych hooków z katalogu `contexts`.
Wszystkie wymienione moduły działają po stronie klienta.

Pozostałe spisy: [komponenty](COMPONENTS.md), [widoki](VIEWS.md),
[sekcje](SECTIONS.md), [modale](MODALS.md), [ikony](ICONS.md).

| Provider | Hook | Pliki | Udostępniany stan |
| --- | --- | --- | --- |
| `AccountModalProvider` | `useAccountModal` | [`Provider`](contexts/account-modal/AccountModalProvider.tsx), [`hook`](contexts/account-modal/useAccountModal.ts) | Stan modala uwierzytelniania oraz operacje otwarcia i zamknięcia. |
| `AuthStateProvider` | `useAuthState` | [`Provider`](contexts/auth-state/AuthStateProvider.tsx), [`hook`](contexts/auth-state/useAuthState.ts) | Stan uwierzytelnienia, sesja klienta i jej odświeżanie. |
| `StoreProvider` | `useCart`, `useCheckout`, `useProducts`, `usePlaceOrder` | [`Provider`](contexts/StoreProvider.tsx), [biblioteka](packages/commerce/README.md) | Wspólne dane koszyka i checkoutu; `useCartCount` jest fasadą licznika z tego samego koszyka. |
| `ToastProvider` | `useToast` | [`Provider`](contexts/toast/ToastProvider.tsx), [`hook`](contexts/toast/useToast.ts) | API krótkich powiadomień i ich warstwa wizualna. |

Surowe konteksty są szczegółami implementacyjnymi w plikach `*Context.ts`.
Komponenty aplikacji powinny korzystać z odpowiadających im hooków.

Providery są składane w [`app/layout.tsx`](app/layout.tsx).
