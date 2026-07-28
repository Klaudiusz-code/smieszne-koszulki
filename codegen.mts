import type { CodegenConfig } from "@graphql-codegen/cli";
const plugins = ["typescript-operations", "typed-document-node", "./scripts/codegen-enums.cjs"];
const config: CodegenConfig = {
  schema: "graphql/schema.graphql",
  config: {
    enumsAsTypes: true,
    arrayInputCoercion: false,
    useTypeImports: true,
    strictScalars: true,
    defaultScalarType: "unknown",
    skipTypename: true,
  },
  generates: {
    "packages/commerce/woocommerce/generated.ts": { documents: "packages/commerce/woocommerce/queries/**/*.graphql", plugins },
    "lib/server/wordpress/generated.ts": { documents: "queries/**/*.graphql", plugins },
  },
};
export default config;
