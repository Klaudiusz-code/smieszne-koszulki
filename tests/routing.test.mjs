import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, existsSync } from 'node:fs';
import { resolveStorefrontRoute, staticRoutes } from '../lib/routing/storefront.ts';

const resolve = (path, accounts = false) => resolveStorefrontRoute(path ? path.split('/') : [], accounts);

test('all storefront routes resolve through the catch-all including the shop alias', () => {
  assert.equal(resolve('').name, 'home');
  for (const [path, name] of Object.entries(staticRoutes)) assert.equal(resolve(path).name, name);
  assert.equal(resolve('produkt/kubek').slug, 'kubek');
  assert.equal(resolve('kategoria/kubki').name, 'category');
  assert.equal(resolve('produkt/123').slug, '123'); // Product resolver retains canonical redirects.
});
test('account feature gate applies to every account route and never falls through to WordPress', () => {
  for (const path of ['konto', 'konto/adresy', 'konto/pliki', 'konto/zamowienia']) {
    assert.equal(resolve(path).name, 'notFound');
    assert.match(resolve(path, true).name, /^account/);
  }
  assert.equal(resolve('konto/unknown', true).name, 'notFound');
  assert.equal(resolve('konto/adresy/extra', true).name, 'notFound');
});
test('payment routes match exact shapes with positive order IDs', () => {
  assert.equal(resolve('zamowienie/order-pay/123').name, 'orderPay');
  assert.equal(resolve('zamowienie/order-received/123').orderId, '123');
  for (const path of ['zamowienie/order-pay', 'zamowienie/order-pay/0', 'zamowienie/order-pay/abc', 'zamowienie/order-pay/12/extra', 'zamowienie/unknown/12']) assert.equal(resolve(path).name, 'notFound');
});
test('unknown CMS pages remain reachable but malformed store paths cannot become CMS content', () => {
  assert.equal(resolve('regulamin').name, 'wordpress');
  assert.equal(resolve('2026/09/18/wpis').name, 'wordpress');
  for (const path of ['produkt', 'produkt/foo/extra', 'produkty/extra', 'api/graphql/extra', 'feed/extra', 'koszyk/extra', 'konto/__proto__', 'produkt/..']) assert.equal(resolve(path, true).name, 'notFound');
  assert.equal(resolveStorefrontRoute(['produkt', 'a/b'], true).name, 'notFound');
});
test('app has only the catch-all and API directories; views have no separate routes layer', () => {
  const directories = readdirSync('app', { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  assert.deepEqual(directories, ['[...slug]', 'api']);
  assert.equal(existsSync('views/routes'), false);
});
