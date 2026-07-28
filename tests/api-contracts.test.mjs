import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHttpCommerceAdapter, createApiClient } from '../packages/commerce/http/index.ts';
import { endpoints } from '../lib/api/contracts.ts';
import { productDetails } from '../lib/api/views.ts';
import { createViewServices } from '../lib/server/views.ts';
import { mapProduct } from '../lib/server/wordpress/views.ts';
import { createWordPressStore } from '../lib/server/wordpress/store.ts';
import { createAttemptRepository, createCommerceStore } from '../packages/commerce/core/index.ts';

const empty = { items: [], subtotal: '0' };
const checkout = { ...empty, appliedCoupons: [], shippingTotal: '0', total: '0', rawTotal: '0', shippingRates: [], chosenShipping: [], paymentGateways: [], billing: null, shipping: null };
const options = { search: '', sort: 'latest', stock: 'all', minPrice: null, maxPrice: null, taxonomyFilters: [], pageSize: 24 };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status });
function attempts() { const values = new Map(); return createAttemptRepository({ getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v), removeItem: k => values.delete(k) }, 'api-test'); }

test('HTTP adapter sends domain commands and strips fields outside the contract', async () => {
  const calls = [];
  const api = createHttpCommerceAdapter(createApiClient({ fetch: async (url, init) => { calls.push([url, JSON.parse(init.body)]); return json({ data: { ok: true } }); } }));
  await api.addItem({ productId: 12, quantity: 2, malicious: 'ignored' });
  await api.saveAddress('billing', { firstName: 'Jan', password: 'ignored' });
  assert.deepEqual(calls, [['/api/store/cart/add', { productId: 12, quantity: 2 }], ['/api/store/checkout/address', { type: 'billing', address: { firstName: 'Jan' } }]]);
  assert.doesNotMatch(JSON.stringify(calls), /query|mutation|woocommerce|malicious|password/);
});
test('invalid quantities, order IDs, totals, consent, redirects and null collections cannot cross the boundary', () => {
  for (const quantity of [-1, 1.5, '2', 1000]) assert.throws(() => endpoints['cart/add'].input.parse({ productId: 1, quantity }));
  assert.throws(() => endpoints['orders/receipt'].input.parse({ orderId: 1 }));
  assert.throws(() => endpoints['products/search'].input.parse({ filters: { ...options, pageSize: 10000 } }));
  assert.throws(() => endpoints['orders/place'].input.parse({ input: { acceptedTerms: false, expectedTotal: -1 }, requestId: 'a' }));
  assert.throws(() => endpoints.checkout.output.parse({ ...checkout, appliedCoupons: null }));
  assert.throws(() => endpoints['orders/payment'].output.parse({ success: true, redirectUrl: 'javascript:alert(1)' }));
  assert.throws(() => endpoints['orders/status'].output.parse({ status: 'completed', orderId: 1, needsPayment: false }));
});
test('HTTP rejects malformed success responses, HTML failures and expired sessions', async () => {
  let unauthorized = 0;
  for (const response of [json({ data: null }), new Response('<html>', { status: 502 }), json({ error: { code: 'unauthorized', message: 'Wymagane logowanie.' } }, 401)]) {
    const api = createHttpCommerceAdapter(createApiClient({ fetch: async () => response, onUnauthorized: () => unauthorized++ }));
    await assert.rejects(api.cart());
  }
  assert.equal(unauthorized, 1);
});
test('coupon business errors keep the checkout usable after authoritative reconciliation', async () => {
  let writes = 0;
  const api = createHttpCommerceAdapter(createApiClient({ fetch: async (url, init) => {
    if (url.endsWith('/checkout')) return json({ data: checkout });
    writes++;
    return JSON.parse(init.body).code === 'TEST' ? json({ data: { ok: true } }) : json({ error: { code: 'validation', message: 'Kupon nie istnieje.' } }, 422);
  } }));
  const store = createCommerceStore(api, attempts(), () => 'test-request-id-123');
  await store.checkout.refresh();
  await assert.rejects(store.applyCoupon('12'), { code: 'validation', message: 'Kupon nie istnieje.' });
  assert.equal(store.checkout.getSnapshot().status, 'ready');
  await store.applyCoupon('TEST');
  assert.equal(writes, 2);
});
test('a lost HTTP order response is recovered by status, never by submitting twice', async () => {
  const paths = [];
  const api = createHttpCommerceAdapter(createApiClient({ fetch: async (url) => { paths.push(url); if (url.endsWith('/place')) throw new Error('lost'); return json({ data: { status: 'completed', orderId: 12, orderKey: 'test', needsPayment: false } }); } }));
  const store = createCommerceStore(api, attempts(), () => 'test-request-id-123');
  const input = { acceptedTerms: true, expectedTotal: 0, billing: null, shipping: null, shippingMethods: [], paymentMethod: 'test' };
  await assert.rejects(store.order.submit(input));
  await assert.rejects(store.order.submit(input), { code: 'pending' });
  assert.equal((await store.order.recover()).orderId, 12);
  assert.deepEqual(paths, ['/api/store/orders/place', '/api/store/orders/status']);
});
test('product mapper removes backend connections, exposes arrays and does not leak extra backend fields', () => {
  const mapped = mapProduct({ __typename: 'VariableProduct', databaseId: 1, name: 'Koszulka', slug: 'koszulka', image: null,
    variations: { nodes: [{ databaseId: 2, name: 'M', price: '100', image: null, attributes: { nodes: [{ name: 'size', value: 'm' }] }, privateField: 'secret' }] }, reviews: { nodes: [{ author: { node: { name: 'Jan' } }, date: '2026-01-01', content: 'OK' }] } });
  const dto = productDetails.parse(mapped);
  assert.equal(dto.type, 'variable'); assert.equal(dto.reviews[0].author, 'Jan'); assert.equal(dto.variations[0].attributes[0].value, 'm');
  assert.doesNotMatch(JSON.stringify(dto), /__typename|nodes|secret|privateField/);
});
test('view services work with a different provider and use the same validated DTO for SSR and JSON', async () => {
  const services = createViewServices({
    home: async () => ({ products: [] }), category: async slug => slug === 'kubki' ? { databaseId: 10, name: 'Kubki', slug, description: null } : null,
    attributes: async () => ({}), products: async filters => { assert.equal(filters.categoryId, 10); return { products: [], found: 0, hasNextPage: false, endCursor: null }; },
  });
  const dto = await services.shop({ category: 'kubki', q: ' test ' });
  assert.equal(dto.filters.search, 'test');
  assert.deepEqual(JSON.parse(JSON.stringify(dto)).initial, dto.initial);
  assert.equal(await services.shop({ category: 'missing' }), null);
});
test('account and review operations map backend envelopes to application results', async () => {
  const services = createWordPressStore(async (operation, variables) => {
    if (operation === 'CustomerOrdersQuery') return { data: { customer: { orders: { nodes: [{ databaseId: 1, orderNumber: '1', status: 'PENDING', date: '2026', total: '10', paymentMethodTitle: 'P24', lineItems: { nodes: [{ quantity: 1, product: null }] } }] } } } };
    assert.equal(operation, 'WriteReview'); assert.equal(variables.input.commentOn, 12);
    return { data: { writeReview: { rating: 5, review: { author: { node: { name: 'Jan' } }, date: null, status: 'HOLD' } } } };
  });
  const orders = endpoints['account/orders'].output.parse(await services['account/orders']({}));
  assert.deepEqual(orders[0].items, [{ name: 'Produkt', quantity: 1 }]);
  assert.deepEqual(await services['products/review']({ productId: 12, content: 'OK', rating: 5 }), { author: 'Jan', rating: 5, date: null, status: 'HOLD' });
});
test('UI and HTTP client have no backend imports; raw GraphQL proxy is removed', () => {
  function files(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : []); }
  for (const dir of ['views', 'components', 'contexts', 'hooks', 'lib/api', 'lib/store', 'packages/commerce/http']) for (const file of files(dir)) {
    const code = readFileSync(file, 'utf8');
    assert.doesNotMatch(code, /from ["'][^"']*(?:\/woocommerce|\/queries\/|\/wordpress-config|\/lib\/gql|\/graphql-allowlist)/, file);
  }
  assert.equal(existsSync('app/api/graphql/route.ts'), false);
});

test('variable-product cards preserve the displayed price range after DTO projection', async () => {
  const { getListingPriceHtml } = await import('../lib/product-price.ts');
  const { createWooCommerceAdapter } = await import('../packages/commerce/woocommerce/adapter.ts');
  const adapter = createWooCommerceAdapter(async () => ({ data: { products: { nodes: [{ __typename: 'VariableProduct', id: 'x', databaseId: 1, name: 'Koszulka', slug: 'koszulka', image: null, price: '50 - 70 zł', regularPrice: '70 zł', salePrice: '50 zł' }], found: 1, pageInfo: { hasNextPage: false, endCursor: null } } } }));
  const dto = endpoints['products/search'].output.parse(await adapter.products(options));
  assert.equal(getListingPriceHtml(dto.products[0]), '50 &ndash; 70 zł');
  assert.ok(!('__typename' in dto.products[0]));
});

test('pre-execution order rejection clears the attempt, while ambiguous failures remain pending', async () => {
  let requests = 0;
  const repository = attempts();
  const api = createHttpCommerceAdapter(createApiClient({ fetch: async () => { requests++; return json({ error: { code: 'rate_limit', message: 'Spróbuj później.' } }, 429); } }));
  const store = createCommerceStore(api, repository, () => 'test-request-id-123');
  const input = { acceptedTerms: false, expectedTotal: 0, billing: null, shipping: null, shippingMethods: [], paymentMethod: 'test' };
  assert.equal((await store.order.submit(input)).status, 'rejected');
  assert.equal(requests, 0); assert.equal(repository.current(), null);
  assert.equal((await store.order.submit({ ...input, acceptedTerms: true })).status, 'rejected');
  assert.equal(requests, 1); assert.equal(repository.current(), null);
});
