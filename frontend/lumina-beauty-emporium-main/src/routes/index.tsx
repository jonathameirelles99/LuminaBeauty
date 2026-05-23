import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard, type Product } from "@/components/ProductCard";
import { CATEGORIES, type CategoryName } from "@/lib/categories";
import { api } from "@/lib/api";
import heroImg from "@/assets/hero.jpg";

type Search = { cat?: string; sub?: string; q?: string };

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    cat: typeof s.cat === "string" ? s.cat : undefined,
    sub: typeof s.sub === "string" ? s.sub : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  component: Index,
});

function Index() {
  const { cat, sub, q } = Route.useSearch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getProducts({ category: cat, subcategory: sub, search: q })
      .then((data) => { setProducts(data as Product[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, [cat, sub, q]);

  const filtered = useMemo(() => products, [products]);
  const subs = cat && cat in CATEGORIES ? CATEGORIES[cat as CategoryName] : null;

  return (
    <div className="min-h-screen bg-hero">
      <Header />

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-foreground">
              <Sparkles className="h-3 w-3" /> Coleção 2026
            </span>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Sua beleza,<br /><span className="text-gradient-gold italic">elevada.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
              Curadoria de skincare, maquiagem e acessórios para mulheres que valorizam a delicadeza dos detalhes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/" search={{ cat: "Skincare" } as never} className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:scale-105">
                Explorar Skincare
              </Link>
              <Link to="/" search={{ cat: "Beleza" } as never} className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background/80 px-7 py-3.5 text-sm font-semibold backdrop-blur transition-all hover:border-primary/40">
                Ver Beleza
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-rose/40 blur-3xl" />
            <img src={heroImg} alt="Composição de produtos Lumina Beauty" width={1600} height={1024} className="relative aspect-[5/4] w-full rounded-[2rem] object-cover shadow-elegant" />
          </div>
        </div>
      </section>

      <section id="produtos" className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">{q ? `Buscando "${q}"` : sub ? sub : cat ?? "Produtos em destaque"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? "produto encontrado" : "produtos encontrados"}</p>
          </div>
          {(cat || sub || q) && <Link to="/" search={{} as never} className="text-sm font-medium text-primary hover:underline">Limpar filtros</Link>}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Link to="/" search={{} as never} className={pill(!cat)}>Todos</Link>
          {(Object.keys(CATEGORIES) as CategoryName[]).map((c) => (
            <Link key={c} to="/" search={{ cat: c } as never} className={pill(cat === c)}>{c}</Link>
          ))}
        </div>

        {subs && (
          <div className="mb-8 flex flex-wrap gap-2">
            {subs.map((s) => (
              <Link key={s} to="/" search={{ cat, sub: sub === s ? undefined : s } as never} className={subPill(sub === s)}>{s}</Link>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-blush/60" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
            <p className="text-muted-foreground">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

const pill = (active: boolean) =>
  `rounded-full px-4 py-2 text-sm font-medium transition-all ${active ? "bg-primary text-primary-foreground shadow-soft" : "bg-card border border-border text-foreground/80 hover:border-primary/40"}`;

const subPill = (active: boolean) =>
  `rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${active ? "bg-gold/20 text-gold-foreground border border-gold/40" : "bg-secondary/60 text-muted-foreground border border-transparent hover:text-foreground"}`;
