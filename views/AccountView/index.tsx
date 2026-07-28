import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSeoMetadata } from "@/lib/seo";
import { AccountView } from "./AccountView";

const sections = {
  "": { section: "details", title: "Moje konto", description: "Dane konta klienta Zabawne Koszulki." },
  adresy: { section: "addresses", title: "Adresy", description: "Adresy rozliczeniowe i wysyłkowe klienta Zabawne Koszulki." },
  pliki: { section: "files", title: "Pliki do pobrania", description: "Pliki cyfrowe dostępne na koncie klienta Zabawne Koszulki." },
  zamowienia: { section: "orders", title: "Zamówienia", description: "Historia zamówień klienta Zabawne Koszulki." },
} as const;

type Props = { params: Promise<{ segments: string[] }> };

async function resolveSection({ params }: Props) {
  const { segments } = await params;
  const slug = segments[1] ?? "";
  if (!Object.hasOwn(sections, slug)) notFound();
  return { ...sections[slug as keyof typeof sections], path: slug ? `/konto/${slug}` : "/konto" };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { title, description, path } = await resolveSection(props);
  return createSeoMetadata({ title, description, path, noIndex: true });
}

export default async function Account(props: Props) {
  const { section } = await resolveSection(props);
  return <AccountView section={section} />;
}
