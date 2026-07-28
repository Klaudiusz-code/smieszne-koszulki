// Run ONLY against the local fixture backend (tests/fixtures/store.mjs), never production.
import assert from 'node:assert/strict';
const base = 'http://127.0.0.1:3101';
const fixture = await fetch('http://127.0.0.1:4301/stats').then(r => r.json());
assert.equal(typeof fixture.placeCalls, 'number');
async function request(path, body = {}, status = 200, headers = {}) {
  const response = await fetch(`${base}/api/store/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base, ...headers }, body: JSON.stringify(body) });
  const payload = await response.json();
  assert.equal(response.status, status, `${path}: ${JSON.stringify(payload)}`);
  assert.match(response.headers.get('cache-control'), /private, no-store/);
  if (['checkout', 'checkout/coupons/apply', 'orders/place'].includes(path) && [200, 422, 502].includes(status)) {
    assert.match(response.headers.get('set-cookie') || '', /wc_session=fixture-refreshed/);
    assert.match(response.headers.get('set-cookie'), /HttpOnly/);
    assert.match(response.headers.get('set-cookie'), /Secure/);
    assert.match(response.headers.get('set-cookie'), /SameSite=lax/i);
  }
  if (status === 200) { assert.ok('data' in payload); assert.ok(!('errors' in payload)); }
  else assert.equal(typeof payload.error.code, 'string');
  return payload;
}
assert.equal((await request('checkout')).data.total, '110 zł');
for (const session of ['fixture-a', 'fixture-b']) {
  await request('checkout', {}, 200, { Cookie: `wc_session=${session}` });
  const stats = await fetch('http://127.0.0.1:4301/stats').then(r => r.json());
  assert.equal(stats.lastSession, `Session ${session}`);
}
await request('checkout/coupons/apply', { code: 'missing' }, 422);
assert.deepEqual((await request('checkout')).data.appliedCoupons, []);
await request('checkout/coupons/apply', { code: 'tEsT' });
assert.equal((await request('checkout')).data.total, '100 zł');
await request('checkout/coupons/remove', { code: 'TEST' });
await request('cart/quantity', { key: 'fixture-item', quantity: 2 });
assert.equal((await request('cart')).data.items[0].quantity, 2);
await request('cart/quantity', { key: 'fixture-item', quantity: 1 });
await request('cart/add', { productId: 1, quantity: -1 }, 400);
await request('orders/receipt', { orderId: 999 }, 400);
await request('checkout', {}, 403, { Origin: 'https://foreign.invalid' });
await request('checkout', {}, 415, { 'Content-Type': 'text/plain' });
await request('checkout/coupons/apply', { code: 'x'.repeat(17000) }, 413);
await request('unknown', {}, 404);
const input = { acceptedTerms: true, expectedTotal: 110, billing: null, shipping: null, shippingMethods: ['flat_rate:1'], paymentMethod: 'fixture' };
const requestId = 'fixture-api-request-0001';
await request('orders/place', { input, requestId }, 502);
assert.equal((await request('orders/status', { requestId })).data.orderId, 999);
assert.equal((await request('orders/receipt', { orderId: 999, orderKey: 'wc_fixture' })).data.orderNumber, 'TEST-999');
const filters = { search: '', sort: 'latest', stock: 'all', minPrice: null, maxPrice: null, taxonomyFilters: [], pageSize: 24 };
const first = (await request('products/search', { filters })).data;
assert.equal(first.products.length, 24);
assert.equal((await request('products/search', { filters, after: first.endCursor })).data.products.length, 2);
await request('account', {}, 503);
assert.equal((await request('orders/payment', { orderId: 999, orderKey: 'wc_fixture' })).data.redirectUrl, 'https://payments.example.invalid/fixture');
assert.equal((await request('products/review', { productId: 1, content: 'Test fixture', rating: 5 })).data.author, 'Test');
const stats = await fetch('http://127.0.0.1:4301/stats').then(r => r.json());
assert.equal(stats.placeCalls, fixture.placeCalls + 1);
assert.equal(stats.cartWrites, fixture.cartWrites + 2); // invalid quantities never reach the backend
console.log('PASS: coupon recovery, cart, input validation, origin/content-type, limits, pagination, feature gate, lost order response, private cache');
