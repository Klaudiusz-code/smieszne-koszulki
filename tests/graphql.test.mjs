import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSchema, validate } from 'graphql';
import { commerceDocuments } from '../packages/commerce/woocommerce/documents.ts';
import * as wordpress from '../lib/server/wordpress/generated.ts';
import { graphqlBody } from '../packages/commerce/woocommerce/graphql.ts';
import { addressInput, taxonomyInput } from '../packages/commerce/woocommerce/inputs.ts';

test('generated executable documents validate against the committed schema, including shared fragments', () => {
  const schema = buildSchema(readFileSync(new URL('../graphql/schema.graphql', import.meta.url), 'utf8'));
  const documents = [...Object.values(commerceDocuments), ...Object.entries(wordpress).filter(([name]) => name.endsWith('Document')).map(([, value]) => value)];
  for (const document of documents) assert.deepEqual(validate(schema, document), []);
  for (const name of ['CartQuery', 'CheckoutQuery']) {
    assert.ok(commerceDocuments[name].definitions.some(definition => definition.kind === 'FragmentDefinition' && definition.name.value === 'CartItemProduct'));
  }
});

test('refresh credentials remain in variables and cannot change the GraphQL document', () => {
  const refreshToken = 'test-token"}) { viewer { databaseId } } #';
  const first = JSON.parse(graphqlBody(wordpress.RefreshAuthTokenDocument, { refreshToken }));
  const second = JSON.parse(graphqlBody(wordpress.RefreshAuthTokenDocument, { refreshToken: 'another-test-token' }));
  assert.equal(first.variables.refreshToken, refreshToken);
  assert.equal(first.query, second.query);
  assert.ok(!first.query.includes(refreshToken));
});

test('backend enum conversion uses the schema and rejects unknown values before transport', () => {
  assert.equal(addressInput({ country: 'PL', firstName: 'Jan' }).country, 'PL');
  assert.equal(addressInput(null), null);
  assert.throws(() => addressInput({ country: 'ZZ' }), error => error.code === 'validation');
  assert.deepEqual(taxonomyInput([{ taxonomy: 'PA_COLOR', terms: ['bialy'] }]), [{ taxonomy: 'PA_COLOR', terms: ['bialy'] }]);
  assert.throws(() => taxonomyInput([{ taxonomy: 'UNKNOWN', terms: [] }]), error => error.code === 'validation');
});
