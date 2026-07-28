import { print } from "graphql";
import test from 'node:test';
import assert from 'node:assert/strict';
import { createResource, createWriteGate } from '../packages/commerce/core/resource.ts';
import { createAttemptRepository, createCheckoutAttempt } from '../packages/commerce/core/checkout-attempt.ts';
import { createCommerceStore } from '../packages/commerce/core/store.ts';
import { createProductListing } from '../packages/commerce/core/products.ts';
import { createWooCommerceAdapter } from '../packages/commerce/woocommerce/adapter.ts';
import { createProxyTransport } from '../packages/commerce/woocommerce/transport.ts';
import { commerceDocuments } from '../packages/commerce/woocommerce/documents.ts';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
function attempts() {
  const values = new Map();
  return createAttemptRepository({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }, 'test-shop');
}
const order = { status: 'completed', orderId: 10, orderKey: 'wc_test', needsPayment: false };
const emptyCart = { items: [], subtotal: '0' };
const productFilters = { search: '', sort: 'latest', stock: 'all', minPrice: null, maxPrice: null, taxonomyFilters: [], pageSize: 24 };

// Synchronization guarantees are tested without React, a DOM, Next.js or a backend.
test('shared readers coalesce requests and subscribers receive one authoritative snapshot', async () => {
  const pending = deferred(); let reads = 0; let updates = 0;
  const resource = createResource(() => { reads++; return pending.promise; });
  resource.subscribe(() => updates++);
  const first = resource.refresh(); const second = resource.refresh();
  assert.equal(first, second);
  pending.resolve({ items: [1] }); await first;
  assert.equal(reads, 1); assert.equal(updates, 2);
  assert.deepEqual(resource.getSnapshot().data, { items: [1] });
});
test('a read started before a mutation cannot overwrite its newer result', async () => {
  const old = deferred(); let reads = 0;
  const resource = createResource(() => ++reads === 1 ? old.promise : Promise.resolve('new'));
  const first = resource.refresh(); await Promise.resolve();
  await resource.mutate('save', async () => {});
  old.resolve('old'); await first;
  assert.equal(resource.getSnapshot().data, 'new');
});
test('writes are serialized across cart and checkout, with no automatic mutation retry', async () => {
  const gate = createWriteGate(); const slow = deferred(); let calls = 0;
  const cart = createResource(async () => 'cart', gate);
  const checkout = createResource(async () => 'checkout', gate);
  const write = cart.mutate('add', () => { calls++; return slow.promise; });
  await assert.rejects(checkout.mutate('coupon', async () => { calls++; }), { code: 'busy' });
  slow.reject(new Error('timeout')); await assert.rejects(write);
  assert.equal(calls, 1);
  await assert.rejects(cart.mutate('add', async () => { calls++; }), { code: 'stale' });
  await cart.refresh(); await cart.mutate('add', async () => { calls++; });
  assert.equal(calls, 2);
});
test('session reset discards old customer data and late responses', async () => {
  const old = deferred(); let reads = 0;
  const resource = createResource(() => ++reads === 1 ? old.promise : Promise.resolve('guest'));
  const first = resource.refresh(); await Promise.resolve(); resource.invalidate();
  assert.equal(resource.getSnapshot().data, null);
  await resource.refresh(); old.resolve('previous-customer'); await first;
  assert.equal(resource.getSnapshot().data, 'guest');
});
test('two store instances never share private cart data', async () => {
  const first = createCommerceStore({ cart: async () => ({ ...emptyCart, subtotal: '10' }) }, attempts(), () => 'a');
  const second = createCommerceStore({ cart: async () => ({ ...emptyCart, subtotal: '20' }) }, attempts(), () => 'b');
  await first.cart.refresh();
  assert.equal(second.cart.getSnapshot().data, null);
  await second.cart.refresh();
  assert.equal(first.cart.getSnapshot().data.subtotal, '10');
  assert.equal(second.cart.getSnapshot().data.subtotal, '20');
});
test('cart mutations invalidate checkout, coupon mutations invalidate the shared cart', async () => {
  const adapter = { cart: async () => emptyCart, checkout: async () => ({ ...emptyCart, total: '0' }), addItem: async () => {}, applyCoupon: async () => {} };
  const store = createCommerceStore(adapter, attempts(), () => 'a');
  await store.checkout.refresh(); await store.addItem({ productId: 1 });
  assert.equal(store.checkout.getSnapshot().status, 'idle');
  await store.checkout.refresh(); await store.applyCoupon('CODE');
  assert.equal(store.cart.getSnapshot().status, 'ready');
});
test('persist before submit; unknown outcome survives a new controller and only performs a status read', async () => {
  const repository = attempts(); let writes = 0; let reads = 0;
  const adapter = {
    placeOrder: async (_input, id) => { writes++; assert.equal(repository.current(), id); throw new Error('connection lost'); },
    checkoutAttempt: async id => { reads++; assert.equal(id, 'attempt-1'); return order; },
  };
  const first = createCheckoutAttempt(adapter, repository, () => 'attempt-1');
  await assert.rejects(first.submit({}));
  const afterReload = createCheckoutAttempt(adapter, repository, () => 'attempt-2');
  await assert.rejects(afterReload.submit({}), { code: 'pending' });
  assert.deepEqual(await afterReload.recover(), order);
  assert.equal(writes, 1); assert.equal(reads, 1);
  assert.equal(repository.current(), 'attempt-1');
  repository.acknowledge(99); assert.equal(repository.current(), 'attempt-1');
  repository.acknowledge(10); assert.equal(repository.current(), null);
});
test('storage failure prevents submission; definitive rejection allows a corrected attempt', async () => {
  let calls = 0;
  const adapter = { placeOrder: async () => { calls++; return { status: 'rejected' }; } };
  const broken = createAttemptRepository({ getItem: () => null, setItem: () => { throw new Error('blocked'); } }, 'x');
  await assert.rejects(createCheckoutAttempt(adapter, broken, () => 'a').submit({}), { code: 'storage' });
  assert.equal(calls, 0);
  const repository = attempts(); const controller = createCheckoutAttempt(adapter, repository, () => 'b');
  await controller.submit({}); assert.equal(repository.current(), null);
  await controller.submit({}); assert.equal(calls, 2);
});
test('same-tick double submission sends only once', async () => {
  const pending = deferred(); let calls = 0;
  const controller = createCheckoutAttempt({ placeOrder: () => { calls++; return pending.promise; } }, attempts(), () => 'a');
  const first = controller.submit({});
  await assert.rejects(controller.submit({}), { code: 'busy' });
  pending.resolve(order); await first; assert.equal(calls, 1);
});
test('pagination retries a failed read, preserves existing cards and deduplicates overlapping pages', async () => {
  let calls = 0;
  const listing = createProductListing({ products: async () => {
    if (++calls === 1) throw new Error('offline');
    return { products: [{ id: 'a' }, { id: 'b' }], found: 2, hasNextPage: false, endCursor: '2' };
  } }, productFilters, { products: [{ id: 'a' }], found: 2, hasNextPage: true, endCursor: '1' });
  await assert.rejects(listing.loadMore());
  assert.equal(listing.resource.getSnapshot().data.products.length, 1);
  await listing.loadMore();
  assert.deepEqual(listing.resource.getSnapshot().data.products, [{ id: 'a' }, { id: 'b' }]);
});
test('adapter flattens WooGraphQL cart fields and preserves variant identity', async () => {
  const adapter = createWooCommerceAdapter(async () => ({ data: { cart: {
    subtotal: '100 zł', contents: { nodes: [{ key: 'a', quantity: 2, subtotal: '100 zł', total: '100 zł',
      product: { node: { databaseId: 3, name: 'T-shirt', image: null, productCategories: { nodes: [{ databaseId: 4 }] }, attributes: { nodes: [{ name: 'pa_size', label: 'Size', terms: { nodes: [{ slug: 'm', name: 'M' }] } }] } } },
      variation: { node: { databaseId: 7, attributes: { nodes: [{ name: 'pa_size', value: 'm' }] } } },
    }] },
  } } }));
  const cart = await adapter.cart();
  assert.equal(cart.items[0].variation.databaseId, 7);
  assert.deepEqual(cart.items[0].product.categoryIds, [4]);
  assert.equal(cart.items[0].product.attributes[0].terms[0].name, 'M');
  assert.equal('contents' in cart, false);
});
test('checkout normalizes null coupons and preserves applied coupon details', async () => {
  for (const appliedCoupons of [null, [], [{ code: 'TEST', discountAmount: '10 zł' }]]) {
    const adapter = createWooCommerceAdapter(async operation => {
      assert.equal(operation, 'CheckoutQuery');
      return { data: { cart: {
        contents: { nodes: [] }, subtotal: '100 zł', shippingTotal: '0 zł', total: '100 zł', rawTotal: '100',
        appliedCoupons, availableShippingMethods: [], chosenShippingMethods: [],
      } } };
    });
    const store = createCommerceStore(adapter, attempts(), () => 'a');
    await store.checkout.refresh();
    const checkout = store.checkout.getSnapshot().data;
    assert.deepEqual(checkout.appliedCoupons, appliedCoupons ?? []);
    assert.equal(checkout.appliedCoupons.length, appliedCoupons?.length ?? 0);
  }
});
test('adapter rejects partial GraphQL data, absent mutation confirmation and nonadvancing pagination', async () => {
  await assert.rejects(createWooCommerceAdapter(async () => ({ data: { cart: {} }, errors: [{}] })).cart(), { code: 'graphql' });
  await assert.rejects(createWooCommerceAdapter(async () => ({ data: { addToCart: null } })).addItem({ productId: 1 }), { code: 'response' });
  await assert.rejects(createWooCommerceAdapter(async () => ({ data: { products: { nodes: [], found: 1, pageInfo: { hasNextPage: true, endCursor: 'same' } } } })).products(productFilters, 'same'), { code: 'response' });
});
test('checkout adapter sends only documented fields and validates completed results', async () => {
  let captured;
  const adapter = createWooCommerceAdapter(async (_op, variables) => { captured = variables; return { data: { storeCheckout: order } }; });
  await adapter.placeOrder({ acceptedTerms: true, expectedTotal: 10, billing: {}, shipping: {}, shippingMethods: ['flat:1'], paymentMethod: 'cod', isPaid: true, feeLines: [100] }, 'a');
  assert.equal(captured.input.requestId, 'a');
  assert.equal('isPaid' in captured.input.checkout, false);
  assert.equal('feeLines' in captured.input.checkout, false);
  for (const invalid of [{ status: 'completed' }, { ...order, needsPayment: true, redirectUrl: 'javascript:bad' }]) {
    await assert.rejects(createWooCommerceAdapter(async () => ({ data: { storeCheckoutStatus: invalid } })).checkoutAttempt('a'), { code: 'response' });
  }
});
test('operation proxy sends names rather than documents and signals an expired session', async () => {
  let body; let unauthorized = 0;
  const transport = createProxyTransport({ endpoint: '/api/graphql', onUnauthorized: () => unauthorized++, fetcher: async (_url, options) => {
    body = JSON.parse(options.body);
    return new Response(JSON.stringify({ errors: [{ message: 'Expired' }] }), { status: 401 });
  } });
  await assert.rejects(transport.strict('CartQuery'));
  assert.deepEqual(body, { operationName: 'CartQuery' }); assert.equal(unauthorized, 1);
});
test('rejected coupon preserves its GraphQL message without console errors and allows a corrected code', async t => {
  const logged = t.mock.method(console, 'error', () => {});
  const calls = [];
  const transport = createProxyTransport({ endpoint: '/api/graphql', fetcher: async (_url, options) => {
    const { operationName, variables } = JSON.parse(options.body);
    calls.push(operationName);
    const payload = operationName === 'ApplyCoupon'
      ? variables.code === '12'
        ? { data: { applyCoupon: null }, errors: [{ message: 'Kupon &quot;12&quot; nie istnieje.' }] }
        : { data: { applyCoupon: { cart: {} } } }
      : { data: { cart: { contents: { nodes: [] }, subtotal: '100', rawTotal: '100', total: '100', shippingTotal: '0', appliedCoupons: null } } };
    return new Response(JSON.stringify(payload));
  } });
  const store = createCommerceStore(createWooCommerceAdapter(transport.strict), attempts(), () => 'a');
  await store.checkout.refresh();
  await assert.rejects(store.applyCoupon('12'), { code: 'graphql', message: 'Kupon &quot;12&quot; nie istnieje.' });
  assert.equal(store.checkout.getSnapshot().status, 'ready');
  assert.equal(store.checkout.getSnapshot().error, null);
  assert.equal(store.cart.getSnapshot().status, 'ready');
  await store.applyCoupon('TEST');
  assert.deepEqual(calls, ['CheckoutQuery', 'ApplyCoupon', 'CheckoutQuery', 'ApplyCoupon', 'CheckoutQuery']);
  assert.equal(logged.mock.callCount(), 0);
});
test('failed coupon reconciliation keeps checkout blocked until a successful read', async () => {
  let offline = false; let writes = 0;
  const store = createCommerceStore({
    checkout: async () => { if (offline) throw new Error('read offline'); return emptyCart; },
    removeCoupon: async () => { writes++; offline = true; throw new Error('connection lost'); },
  }, attempts(), () => 'a');
  await store.checkout.refresh();
  await assert.rejects(store.removeCoupon('TEST'), /read offline/);
  assert.equal(store.checkout.getSnapshot().status, 'error');
  await assert.rejects(store.removeCoupon('TEST'), { code: 'stale' });
  assert.equal(writes, 1);
  offline = false; await store.checkout.refresh();
  assert.equal(store.checkout.getSnapshot().status, 'ready');
});
test('coupon reconciliation holds the shared write gate and reads the actual result after a lost response', async () => {
  const pending = deferred(); let writes = 0; let reads = 0;
  const actual = { ...emptyCart, appliedCoupons: [{ code: 'TEST', discountAmount: '10' }] };
  const store = createCommerceStore({
    checkout: () => { reads++; return pending.promise; },
    applyCoupon: async () => { writes++; throw new Error('response lost after write'); },
    addItem: async () => { throw new Error('must not run'); },
  }, attempts(), () => 'a');
  const mutation = store.applyCoupon('TEST');
  while (!reads) await new Promise(resolve => setImmediate(resolve));
  await assert.rejects(store.addItem({ productId: 1 }), { code: 'busy' });
  pending.resolve(actual);
  await assert.rejects(mutation, /response lost/);
  assert.deepEqual(store.checkout.getSnapshot().data, actual);
  assert.equal(store.checkout.getSnapshot().status, 'ready');
  assert.equal(writes, 1); assert.equal(reads, 1);
});
test('a coupon reconciliation from the previous session cannot publish private data', async () => {
  const pending = deferred(); const guest = deferred(); let reads = 0;
  const store = createCommerceStore({
    checkout: () => ++reads === 1 ? pending.promise : guest.promise,
    applyCoupon: async () => { throw new Error('rejected'); },
  }, attempts(), () => 'a');
  const mutation = store.applyCoupon('12');
  while (!reads) await new Promise(resolve => setImmediate(resolve));
  store.resetSession(); pending.resolve({ ...emptyCart, subtotal: 'private' });
  await assert.rejects(mutation);
  assert.equal(store.checkout.getSnapshot().data, null);
  assert.equal(store.cart.getSnapshot().data, null);
  guest.resolve(emptyCart);
  await store.checkout.refresh();
  assert.deepEqual(store.checkout.getSnapshot().data, emptyCart);
});
test('library boundaries do not import application code; core has no framework or browser storage dependency', () => {
  function files(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(dir, entry.name)) : /\.tsx?$/.test(entry.name) ? [join(dir, entry.name)] : []); }
  for (const path of files('packages/commerce')) {
    const source = readFileSync(path, 'utf8');
    assert.doesNotMatch(source, /from ["']@\//, path);
    assert.doesNotMatch(source, /from ["']next(?:\/|["'])/, path);
    if (path.includes('/core/')) assert.doesNotMatch(source, /\b(window|document|sessionStorage|localStorage)\b|from ["']react/, path);
  }
  assert.ok(print(commerceDocuments.CartQuery).includes('databaseId'));
});

test('recovering checkout also restores the cart and count after a shared backend outage', async () => {
  let failing = true;
  const confirmed = { items: [{ quantity: 2 }], subtotal: '200' };
  const adapter = { cart: async () => { throw new Error('offline'); }, checkout: async () => { if (failing) throw new Error('offline'); return confirmed; } };
  const store = createCommerceStore(adapter, attempts(), () => 'a');
  await assert.rejects(store.cart.refresh()); await assert.rejects(store.checkout.refresh());
  failing = false; await store.checkout.refresh();
  assert.deepEqual(store.cart.getSnapshot().data, confirmed);
  assert.equal(store.cart.getSnapshot().error, null);
});
