import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveWordPressSettings } from '../lib/wordpress-settings.ts';
import { assertGraphQlSuccess, parseJsonResponse } from '../lib/graphql-response.ts';
import { buildAttributeTaxonomyFilters, buildProductQueryOptions } from '../lib/catalog-options.ts';
import { getProductQueryVariables } from '../packages/commerce/woocommerce/catalog.ts';
import { appendUniqueProducts } from '../lib/catalog-pagination.ts';
import { checkoutDestination } from '../lib/checkout-result.ts';
import { htmlToPlainText } from '../lib/html-text.ts';

test('coupon messages decode WooCommerce entities and remove markup for plain text rendering', () => {
  assert.equal(htmlToPlainText('Kupon <strong>&quot;12&quot;</strong> nie istnieje.'), 'Kupon "12" nie istnieje.');
});

test('all WordPress services follow one backend, including subdirectory installs', () => {
  const config = resolveWordPressSettings({ WORDPRESS_GRAPHQL_URL: 'https://test.example/shop/graphql' });
  assert.equal(config.storeProductsUrl, 'https://test.example/shop/wp-json/wc/store/v1/products');
  assert.equal(config.contactFormsUrl, 'https://test.example/shop/wp-json/contact-form-7/v1/contact-forms/');
});
test('explicit REST endpoint overrides and default production host', () => {
  assert.equal(resolveWordPressSettings({}).graphqlUrl, 'https://zabawnekoszulki.pl/graphql');
  assert.equal(resolveWordPressSettings({ WORDPRESS_REST_URL: 'https://api.example/rest' }).storeProductsUrl, 'https://api.example/rest/wc/store/v1/products');
});
test('invalid configuration rejects credentials, query strings and non-HTTP protocols without disclosing secrets', () => {
  for (const value of ['file:///tmp/private', 'https://user:secret@example.test/graphql', 'https://example.test/graphql?secret=value', 'bad-url']) {
    assert.throws(() => resolveWordPressSettings({ WORDPRESS_GRAPHQL_URL: value }), (error) => !error.message.includes('secret'));
  }
});
test('strict GraphQL operation rejects errors even with partial data and HTTP 200', () => {
  assert.throws(() => assertGraphQlSuccess({ data: { cart: null }, errors: [{ message: 'Brak produktu' }] }), /Brak produktu/);
  assert.doesNotThrow(() => assertGraphQlSuccess({ data: { cart: {} } }));
});
test('transport distinguishes non-JSON and unsuccessful responses', async () => {
  await assert.rejects(parseJsonResponse(new Response('<html>unavailable</html>', { status: 502 }), 'Test'), /non-JSON/);
  await assert.rejects(parseJsonResponse(new Response(JSON.stringify({ errors: [{ message: 'Too many requests' }] }), { status: 429 }), 'Test'), /Too many requests/);
});
test('filter values are sanitized and multiple terms are grouped by attribute', () => {
  const options = buildProductQueryOptions({ q: ' kubek ', min_price: '49,50', max_price: '-10', sort: 'invalid', stock: 'invalid' });
  assert.equal(options.search, 'kubek');
  assert.equal(options.minPrice, 49.5);
  assert.equal(options.maxPrice, null);
  assert.equal(options.sort, 'latest');
  assert.deepEqual(buildAttributeTaxonomyFilters({ pa_color: 'red,blue,red', pa_size: ['m', 'l'] }), [{ taxonomy: 'PA_COLOR', terms: ['red', 'blue'] }, { taxonomy: 'PA_SIZE', terms: ['m', 'l'] }]);
  assert.equal(getProductQueryVariables(options).search, 'kubek');
});
test('cursor pagination does not duplicate overlapping products', () => {
  const first = [{ id: 'a' }, { id: 'b' }];
  assert.deepEqual(appendUniqueProducts(first, [{ id: 'b' }, { id: 'c' }, { id: 'c' }]), [{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
  assert.equal(first.length, 2);
});
test('known order routes to receipt or payment, unknown result never redirects', () => {
  const result = { status: 'completed', orderId: 12, orderKey: 'wc_test&key' };
  assert.equal(checkoutDestination(result), '/zamowienie/order-received/12?key=wc_test%26key');
  assert.equal(checkoutDestination({ ...result, needsPayment: true }), '/zamowienie/order-pay/12?key=wc_test%26key');
  assert.equal(checkoutDestination({ ...result, needsPayment: true, redirectUrl: 'https://payments.example/transaction' }), 'https://payments.example/transaction');
  assert.throws(() => checkoutDestination({ ...result, status: 'pending' }));
  assert.throws(() => checkoutDestination({ ...result, needsPayment: true, redirectUrl: 'javascript:alert(1)' }));
  assert.throws(() => checkoutDestination({ ...result, needsPayment: true, redirectUrl: 'https://user:pass@payments.example' }));
});

test('an unrelated order cannot clear an unresolved checkout attempt', async () => {
  const { acknowledgeCheckoutOrder } = await import('../lib/checkout-attempt.ts');
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  const values = new Map([['store:checkout-attempt', 'attempt-1'], ['store:checkout-completed-order', '12']]);
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: { getItem: (key) => values.get(key) ?? null, removeItem: (key) => values.delete(key) } });
  try {
    acknowledgeCheckoutOrder(99);
    assert.equal(values.get('store:checkout-attempt'), 'attempt-1');
    acknowledgeCheckoutOrder(12);
    assert.equal(values.size, 0);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'sessionStorage', previous);
    else delete globalThis.sessionStorage;
  }
});
