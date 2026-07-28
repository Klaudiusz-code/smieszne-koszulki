/** Small JSON boundary validators. Objects are projected onto the declared contract. */
export interface Schema<T> { parse(value: unknown): T }
export type Infer<S> = S extends Schema<infer T> ? T : never;
function invalid(): never { throw new Error("Invalid API contract"); }
export const string: Schema<string> = { parse: (v) => typeof v === "string" ? v : invalid() };
export const number: Schema<number> = { parse: (v) => typeof v === "number" && Number.isFinite(v) ? v : invalid() };
export const boolean: Schema<boolean> = { parse: (v) => typeof v === "boolean" ? v : invalid() };
export function nullable<T>(schema: Schema<T>): Schema<T | null> { return { parse: (v) => v === null ? null : schema.parse(v) }; }
export function optional<T>(schema: Schema<T>): Schema<T | undefined> { return { parse: (v) => v === undefined ? undefined : schema.parse(v) }; }
export function array<T>(schema: Schema<T>, max = 1000): Schema<T[]> { return { parse(v) { if (!Array.isArray(v) || v.length > max) return invalid(); return v.map((item) => schema.parse(item)); } }; }
type ObjectOutput<S extends Record<string, Schema<unknown>>> =
  { [K in keyof S as undefined extends Infer<S[K]> ? never : K]: Infer<S[K]> } &
  { [K in keyof S as undefined extends Infer<S[K]> ? K : never]?: Infer<S[K]> };
export function object<S extends Record<string, Schema<unknown>>>(shape: S): Schema<ObjectOutput<S>> {
  return { parse(v) {
    if (!v || typeof v !== "object" || Array.isArray(v)) return invalid();
    const input = v as Record<string, unknown>;
    return Object.fromEntries(Object.entries(shape).map(([key, schema]) => [key, schema.parse(input[key])])) as ObjectOutput<S>;
  } };
}
export function oneOf<const T extends readonly string[]>(values: T): Schema<T[number]> { return { parse(v) { return typeof v === "string" && values.includes(v) ? v : invalid(); } }; }
export function refine<T>(schema: Schema<T>, accepts: (v: T) => boolean): Schema<T> { return { parse(v) { const value = schema.parse(v); return accepts(value) ? value : invalid(); } }; }
export const text = (max = 255, min = 0) => refine(string, (v) => v.length >= min && v.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v));
export const integer = (min = 0, max = Number.MAX_SAFE_INTEGER) => refine(number, (v) => Number.isSafeInteger(v) && v >= min && v <= max);
export function record<T>(schema: Schema<T>): Schema<Record<string, T>> { return { parse(v) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return invalid();
  return Object.fromEntries(Object.entries(v).map(([key, value]) => [key, schema.parse(value)]));
} }; }
