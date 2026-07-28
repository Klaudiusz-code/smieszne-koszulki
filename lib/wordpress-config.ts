import { resolveWordPressSettings } from "./wordpress-settings";

const settings = resolveWordPressSettings(process.env);
export const WORDPRESS_GRAPHQL_URL = settings.graphqlUrl;
export const WORDPRESS_BASE_URL = settings.baseUrl;
export const WORDPRESS_REST_URL = settings.restUrl;
export const STORE_API_PRODUCTS_URL = settings.storeProductsUrl;
export const CONTACT_FORMS_URL = settings.contactFormsUrl;
