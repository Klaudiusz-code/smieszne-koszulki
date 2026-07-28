// Read-only smoke test against a locally running production build.
import assert from 'node:assert/strict';
const base = new URL(process.env.ROUTING_TEST_URL || 'http://127.0.0.1:3100');
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) throw new Error('Use a local build for this check');
const checks = [
  ['/', 200], ['/produkty', 200, /<title>Sklep/], ['/sklep', 200, /rel="canonical" href="[^\"]*\/produkty"/],
  ['/produkty?q=Mercedes', 200, /noindex/], ['/produkt/kubek-mercedes', 200, /Kubek Mercedes/],
  ['/kategoria/kubki', 200, /Kubki/], ['/kategoria', 308], ['/koszyk', 200, /noindex/],
  ['/zamowienie', 200, /noindex/], ['/produkt/x/y', 404], ['/konto/unknown', 404],
  ['/zamowienie/order-pay/12?key=wc_routing_test', 200, /Zapłać za zamówienie/],
  ['/zamowienie/order-received/12?key=wc_routing_test', 200, /Potwierdzenie zamówienia/],
  ['/feed', 200, /<rss /], ['/api/token-info', 200], ['/api/store/cart', 405], ['/api/views/home', 200], ['/api/views/product?slug=kubek-mercedes', 200],
  ['/api/views/shop', 200], ['/api/views/category?slug=kubki', 200],
  ['/api/views/content?path=o-nas', 200], ['/o-nas', 200],
];
for (const [path, status, pattern] of checks) {
  const response = await fetch(new URL(path, base), { redirect: 'manual' });
  const body = await response.text();
  assert.equal(response.status, status, path);
  if (pattern) assert.match(body, pattern, path);
  if (path === '/kategoria') assert.equal(response.headers.get('location'), '/kolekcje');
  if (path.includes('order-')) assert.doesNotMatch(body.match(/<link rel="canonical"[^>]*>/)?.[0] ?? '', /wc_routing_test/);
  if (path === '/feed') assert.match(response.headers.get('content-type') ?? '', /application\/rss\+xml/);
  console.log(`PASS ${path}`);
}
