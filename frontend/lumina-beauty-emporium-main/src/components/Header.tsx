import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Search, User, Menu, X, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { cartCount, getCart } from "@/lib/cart";
import { CATEGORIES } from "@/lib/categories";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const update = () => setCount(cartCount(getCart()));
    update();
    window.addEventListener("lumina-cart-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("lumina-cart-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/", search: { q: q.trim() || undefined, cat: undefined, sub: undefined } as never });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-display font-bold text-gradient-gold">Lumina</span>
          <span className="text-sm font-medium tracking-widest text-muted-foreground">BEAUTY</span>
        </Link>

        <form onSubmit={submit} className="ml-4 hidden flex-1 max-w-md md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar produtos…"
              className="w-full rounded-full border border-border bg-secondary/40 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary/60 focus:bg-background focus:shadow-soft"
            />
          </div>
        </form>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map((c) => (
            <Link
              key={c}
              to="/"
              search={{ cat: c } as never}
              className="rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
            >
              {c}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-4">

          {/* Carrinho — oculto para admin */}
          {!isAdmin && (
            <Link
              to="/cart"
              aria-label="Carrinho"
              className="relative rounded-full p-2.5 text-foreground transition-colors hover:bg-secondary"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground shadow-soft">
                  {count}
                </span>
              )}
            </Link>
          )}

          {user ? (
            isAdmin ? (
              <Link
                to="/admin"
                className="hidden items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/20 sm:inline-flex"
              >
                <LayoutDashboard className="h-4 w-4" />
                Painel Admin
              </Link>
            ) : (
              <Link
                to="/minha-conta"
                className="hidden items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/20 sm:inline-flex"
              >
                <User className="h-4 w-4" />
                Minha conta
              </Link>
            )
          ) : (
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-secondary sm:inline-flex"
            >
              <User className="h-4 w-4" />
              Entrar
            </Link>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-full p-2.5 lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <form onSubmit={submit} className="mb-3 md:hidden">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar produtos…"
                className="w-full rounded-full border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:border-primary/60"
              />
            </form>
            <div className="flex flex-col gap-1">
              {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map((c) => (
                <Link
                  key={c}
                  to="/"
                  search={{ cat: c } as never}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                >
                  {c}
                </Link>
              ))}
              {user ? (
                isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary sm:hidden"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Painel Admin
                  </Link>
                ) : (
                  <Link
                    to="/minha-conta"
                    onClick={() => setOpen(false)}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary sm:hidden"
                  >
                    <User className="h-4 w-4" /> Minha conta
                  </Link>
                )
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium sm:hidden"
                >
                  <User className="h-4 w-4" /> Entrar / Cadastrar
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
