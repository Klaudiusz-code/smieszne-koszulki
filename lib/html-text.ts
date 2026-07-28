/** Zamienia tekst z encjami i znacznikami HTML na bezpieczny zwykły tekst. */
export function htmlToPlainText(value: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: "\"",
  };

  let decoded = value;

  for (let pass = 0; pass < 2; pass += 1) {
    const next = decoded.replace(
      /&(#(?:x[0-9a-f]+|\d+)|amp|apos|gt|lt|nbsp|quot);/gi,
      (entity, code: string) => {
        if (!code.startsWith("#")) {
          return namedEntities[code.toLowerCase()] ?? entity;
        }

        const hexadecimal = code[1]?.toLowerCase() === "x";
        const codePoint = Number.parseInt(
          code.slice(hexadecimal ? 2 : 1),
          hexadecimal ? 16 : 10,
        );

        if (
          !Number.isInteger(codePoint) ||
          codePoint < 0 ||
          codePoint > 0x10ffff
        ) {
          return entity;
        }

        return String.fromCodePoint(codePoint);
      },
    );

    if (next === decoded) {
      break;
    }

    decoded = next;
  }

  return decoded
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
