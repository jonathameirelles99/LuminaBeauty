import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-blush/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold text-gradient-gold">Lumina</span>
            <span className="text-sm font-medium tracking-widest text-muted-foreground">BEAUTY</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Beleza, skincare e acessórios para realçar a sua luz.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Categorias</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" search={{ cat: "Acessórios" } as never} className="hover:text-primary">Acessórios</Link></li>
            <li><Link to="/" search={{ cat: "Beleza" } as never} className="hover:text-primary">Beleza</Link></li>
            <li><Link to="/" search={{ cat: "Skincare" } as never} className="hover:text-primary">Skincare</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Atendimento</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Seg–Sex • 9h às 18h</li>
            <li>contato@luminabeauty.com</li>
            <li>+55 (11) 99999-0000</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Newsletter</h4>
          <p className="text-sm text-muted-foreground">Receba novidades e ofertas exclusivas.</p>
          <form className="mt-3 flex gap-2">
            <input placeholder="Seu e-mail" className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary/60" />
            <button type="button" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">OK</button>
          </form>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Lumina Beauty. Todos os direitos reservados.
      </div>
    </footer>
  );
}
