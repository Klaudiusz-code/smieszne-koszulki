// Local-only backend for browser regression checks; never sends requests to WordPress.
import { createServer } from 'node:http';
const address = { firstName: 'Test', lastName: 'Sklepu', address1: 'Testowa 1', address2: '', city: 'Zamość', postcode: '22-400', country: 'PL', phone: '000000000', email: 'test@example.invalid', company: '' };
const products = Array.from({ length: 26 }, (_, i) => ({ id: `fixture-${i + 1}`, databaseId: i + 1, name: `Produkt testowy ${i + 1}`, slug: `fixture-${i + 1}`, image: { sourceUrl: '/koszulka1.jpg', altText: 'Produkt testowy' }, price: '100 zł', regularPrice: '100 zł', stockStatus: 'IN_STOCK', productCategories: { nodes: [{ slug: 'koszulki', databaseId: 10 }] } }));
let customer = { billing: { ...address }, shipping: { ...address } };
let chosenShipping = ['flat_rate:1'];
let coupon = false;
let quantity = 1;
let cartWrites = 0;
let reads = 0;
let placeCalls = 0;
let failCart = false;
let lastSession = null;
const cart = () => ({
  contents: { nodes: quantity ? [{ key: 'fixture-item', quantity, total: `${quantity * 100} zł`, subtotal: `${quantity * 100} zł`, product: { node: { ...products[0], attributes: null } }, variation: null }] : [] },
  appliedCoupons: coupon ? [{ code: 'TEST', discountAmount: '10 zł' }] : null,
  subtotal: `${quantity * 100} zł`, shippingTotal: '10 zł', total: `${quantity * 100 + 10 - (coupon ? 10 : 0)} zł`, rawTotal: String(quantity * 100 + 10 - (coupon ? 10 : 0)),
  availableShippingMethods: [{ rates: [{ id: 'flat_rate:1', methodId: 'flat_rate', label: 'Dostawa testowa', cost: '10.00' }] }], chosenShippingMethods: chosenShipping,
});
const server = createServer(async (request, response) => {
  response.setHeader('Content-Type', 'application/json');
  if (request.url === '/stats') return response.end(JSON.stringify({ placeCalls, reads, cartWrites, quantity, lastSession }));
  let body = ''; for await (const chunk of request) body += chunk;
  if (request.url === '/failure') { failCart = JSON.parse(body).enabled; return response.end('{}'); }
  lastSession = request.headers['woocommerce-session'] ?? null;
  response.setHeader('woocommerce-session', 'fixture-refreshed');
  const { query = '', variables = {} } = JSON.parse(body || '{}');
  let data;
  if (query.includes('CheckoutSupport')) data = { mutation: { name: 'StoreCheckoutInput' }, result: { name: 'StoreCheckoutResult' }, receipt: { name: 'OrderReceivedData' }, payment: { name: 'OrderPaymentRedirectPayload' } };
  else if (query.includes('storeCheckoutStatus')) data = { storeCheckoutStatus: { status: 'completed', orderId: 999, orderKey: 'wc_fixture', needsPayment: false } };
  else if (query.includes('storeCheckout(input:')) { placeCalls++; response.statusCode = 502; return response.end('{}'); }
  else if (query.includes('orderPaymentRedirect')) data = { orderPaymentRedirect: { success: true, redirectUrl: 'https://payments.example.invalid/fixture', message: null } };
  else if (query.includes('writeReview')) data = { writeReview: { rating: variables.input.rating, review: { author: { node: { name: 'Test' } }, date: '2026-09-18', status: 'HOLD' } } };
  else if (query.includes('GetFrontPageProducts')) data = { products: { nodes: products.slice(0, 12) } };
  else if (query.includes('GetPage')) data = { page: null };
  else if (query.includes('orderByKey')) data = { orderByKey: { databaseId: 999, orderNumber: 'TEST-999', status: 'PROCESSING', date: '2026-09-18', subtotal: '100 zł', shippingTotal: '10 zł', total: '110 zł', needsPayment: false, paymentMethodTitle: 'Płatność testowa', shippingMethodTitle: 'Dostawa testowa', lineItems: [{ name: 'Produkt testowy', quantity: 1 }] } };
  else if (/query (CartQuery|CheckoutQuery|CartCountQuery)/.test(query)) {
    reads++; if (failCart) { response.statusCode = 503; return response.end(JSON.stringify({ errors: [{ message: 'Test awarii' }] })); }
    data = { cart: cart(), customer, paymentGateways: { nodes: [{ id: 'fixture', title: 'Płatność testowa' }] } };
  } else if (query.includes('updateItemQuantities')) { cartWrites++; quantity = variables.quantity; data = { updateItemQuantities: { cart: cart() } }; }
  else if (query.includes('removeItemsFromCart')) { cartWrites++; quantity = 0; data = { removeItemsFromCart: { cart: cart() } }; }
  else if (query.includes('addToCart')) { cartWrites++; quantity += variables.quantity || 1; data = { addToCart: { cart: cart() } }; }
  else if (query.includes('updateCustomer')) { customer = { ...customer, ...variables.input }; data = { updateCustomer: { customer } }; }
  else if (query.includes('updateShippingMethod')) { chosenShipping = variables.shippingMethods; data = { updateShippingMethod: { cart: cart() } }; }
  else if (query.includes('applyCoupon')) {
    if (String(variables.code ?? '').trim().toLowerCase() !== 'test') return response.end(JSON.stringify({ data: { applyCoupon: null }, errors: [{ message: 'Podany kupon nie istnieje.' }] }));
    coupon = true; data = { applyCoupon: { cart: cart() } };
  }
  else if (query.includes('removeCoupons')) { coupon = false; data = { removeCoupons: { cart: cart() } }; }
  else if (query.includes('allPaColor')) data = { allPaColor: { nodes: [] }, allPaSize: { nodes: [] } };
  else if (query.includes('query Products')) {
    const after = Number(variables.after || 0); const nodes = products.slice(after, after + (variables.first || 24));
    data = { products: { nodes, found: 26, pageInfo: { endCursor: String(after + nodes.length), hasNextPage: after + nodes.length < 26 } } };
  } else if (query.includes('SimilarCartProducts')) data = { products: { nodes: [] } };
  else data = {};
  response.end(JSON.stringify({ data }));
});
server.listen(4301, '127.0.0.1', () => console.log('Fixture backend: http://127.0.0.1:4301 (local data only)'));
