import { Product, ProductCategory } from "./types";

export const categories: ProductCategory[] = [
  {
    id: "cat-1",
    name: "Koszulki",
    slug: "koszulki",
    description: "Męskie, damskie i unisex – klasyczne kroje, trwałe nadruki.",
    image: { sourceUrl: "/koszulka1.jpg", altText: "Koszulki" },
    count: 12,
  },
  {
    id: "cat-2",
    name: "Bluzy",
    slug: "bluzy",
    description: "Ciepłe bluzy z kapturem i bez, idealne na chłodniejsze dni.",
    image: { sourceUrl: "/koszulka3.jpg", altText: "Bluzy" },
    count: 6,
  },
  {
    id: "cat-3",
    name: "Kubki",
    slug: "kubki",
    description: "Ceramika premium 330ml, nadruk odporny na zmywarkę.",
    image: { sourceUrl: "/kubek1.jpg", altText: "Kubki" },
    count: 8,
  },
  {
    id: "cat-4",
    name: "Gadżety",
    slug: "gadzety",
    description: "Plakaty, breloki i inne drobne upominki z nadrukiem.",
    image: { sourceUrl: "/koszulka2.jpg", altText: "Gadżety" },
    count: 10,
  },
];

export const products: Product[] = [
  {
    id: "prod-1",
    name: "T-Shirt Classic – Czarny",
    slug: "t-shirt-classic-czarny",
    description:
      "<p>Klasyczna koszulka z nadrukiem. 100% bawełna ringspun, gramatura 180 g/m². Miękka, oddychająca, idealna na co dzień.</p><p>Nadruk wykonywany techniką DTG – trwały, nie blaknie po praniu.</p>",
    image: { sourceUrl: "/koszulka1.jpg", altText: "T-Shirt Classic Czarny" },
    galleryImages: [
      { sourceUrl: "/koszulka1.jpg", altText: "T-Shirt przód" },
      { sourceUrl: "/koszulka2.jpg", altText: "T-Shirt tył" },
    ],
    category: categories[0],
    price: "49.99",
    regularPrice: "49.99",
    salePrice: null,
    onSale: false,
    inStock: true,
    attributes: [
      { name: "Rozmiar", options: ["S", "M", "L", "XL", "XXL"] },
      { name: "Kolor", options: ["Czarny", "Biały", "Szary"] },
    ],
  },
  {
    id: "prod-2",
    name: "T-Shirt V-Neck – Granatowy",
    slug: "t-shirt-vneck-granatowy",
    description:
      "<p>Koszulka z dekoltem w serek. Lekko rozszerzony krój, miękkie wykończenie brzegów.</p><p>Dostępna w rozmiarach S–XL.</p>",
    image: { sourceUrl: "/koszulka2.jpg", altText: "V-Neck Granatowy" },
    galleryImages: [{ sourceUrl: "/koszulka2.jpg", altText: "V-Neck przód" }],
    category: categories[0],
    price: "54.99",
    regularPrice: "54.99",
    salePrice: null,
    onSale: false,
    inStock: true,
    attributes: [
      { name: "Rozmiar", options: ["S", "M", "L", "XL"] },
      { name: "Kolor", options: ["Granatowy", "Biały"] },
    ],
  },
  {
    id: "prod-3",
    name: "Hoodie Heavy – Oliwka",
    slug: "hoodie-heavy-oliwka",
    description:
      "<p>Ciężka bluza z kapturem. Bawełna/poliester 280 g/m². Wnętrze brushed – grube, ciepłe i przyjemne w dotyku.</p><p>Kaptur regulowany sznurkami, kieszeń kangur.</p>",
    image: { sourceUrl: "/koszulka3.jpg", altText: "Hoodie Heavy Oliwka" },
    galleryImages: [{ sourceUrl: "/koszulka3.jpg", altText: "Hoodie przód" }],
    category: categories[1],
    price: "129.99",
    regularPrice: "149.99",
    salePrice: "129.99",
    onSale: true,
    inStock: true,
    attributes: [
      { name: "Rozmiar", options: ["M", "L", "XL", "XXL"] },
      { name: "Kolor", options: ["Oliwka", "Czarny", "Szary melange"] },
    ],
  },
  {
    id: "prod-4",
    name: "Kubek Premium – Śmieszny Napis",
    slug: "kubek-premium-smieszny-napis",
    description:
      "<p>Ceramiczny kubek 330 ml. Nadruk sublimacyjny – odporny na zmywarkę i mikrofalówkę.</p><p>Idealny na prezent albo do biura.</p>",
    image: { sourceUrl: "/kubek1.jpg", altText: "Kubek Premium" },
    galleryImages: [{ sourceUrl: "/kubek1.jpg", altText: "Kubek przód" }],
    category: categories[2],
    price: "29.99",
    regularPrice: "29.99",
    salePrice: null,
    onSale: false,
    inStock: true,
    attributes: [{ name: "Pojemność", options: ["330 ml"] }],
  },
  {
    id: "prod-5",
    name: "T-Shirt Classic – Biały",
    slug: "t-shirt-classic-bialy",
    description:
      "<p>Jasna wersja klasyka. Biały, czysty nadruk – kontrastowy i wyrazisty.</p>",
    image: { sourceUrl: "/koszulka1.jpg", altText: "T-Shirt Classic Biały" },
    galleryImages: [{ sourceUrl: "/koszulka1.jpg", altText: "T-Shirt biały" }],
    category: categories[0],
    price: "49.99",
    regularPrice: "49.99",
    salePrice: null,
    onSale: false,
    inStock: true,
    attributes: [
      { name: "Rozmiar", options: ["S", "M", "L", "XL", "XXL"] },
      { name: "Kolor", options: ["Biały", "Czarny"] },
    ],
  },
  {
    id: "prod-6",
    name: "Hoodie Zip – Czarny",
    slug: "hoodie-zip-czarny",
    description:
      "<p>Bluza zip z kapturem. Zamek YKK, ściągacze przy mankietach i dole. Gramatura 260 g/m².</p>",
    image: { sourceUrl: "/koszulka3.jpg", altText: "Hoodie Zip Czarny" },
    galleryImages: [{ sourceUrl: "/koszulka3.jpg", altText: "Hoodie zip" }],
    category: categories[1],
    price: "139.99",
    regularPrice: "139.99",
    salePrice: null,
    onSale: false,
    inStock: true,
    attributes: [{ name: "Rozmiar", options: ["M", "L", "XL", "XXL"] }],
  },
  {
    id: "prod-7",
    name: "Brelok – Śmieszna Buźka",
    slug: "brelok-smieszna-buzka",
    description:
      "<p>Akrylowy brelok z nadrukiem dwustronnym. Rozmiar ok. 5×5 cm, karabińczyk ze stali nierdzewnej.</p>",
    image: { sourceUrl: "/kubek1.jpg", altText: "Brelok" },
    galleryImages: [{ sourceUrl: "/kubek1.jpg", altText: "Brelok" }],
    category: categories[3],
    price: "19.99",
    regularPrice: "19.99",
    salePrice: null,
    onSale: false,
    inStock: true,
    attributes: [],
  },
  {
    id: "prod-8",
    name: "Kubek Duży – 450ml",
    slug: "kubek-duzy-450ml",
    description:
      "<p>Większy kubek 450 ml. Grubsza ścianka, wygodny uchwyt. Nadruk na całym obwodzie.</p>",
    image: { sourceUrl: "/kubek1.jpg", altText: "Kubek 450ml" },
    galleryImages: [{ sourceUrl: "/kubek1.jpg", altText: "Kubek duży" }],
    category: categories[2],
    price: "34.99",
    regularPrice: "39.99",
    salePrice: "34.99",
    onSale: true,
    inStock: true,
    attributes: [{ name: "Pojemność", options: ["450 ml"] }],
  },
];


export function getProductsByCategory(slug: string): Product[] {
  return products.filter((p) => p.category.slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCategoryBySlug(slug: string): ProductCategory | undefined {
  return categories.find((c) => c.slug === slug);
}
