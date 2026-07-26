import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="text-xs text-gray-400 font-medium mb-8">
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span>/</span>
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-black transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
