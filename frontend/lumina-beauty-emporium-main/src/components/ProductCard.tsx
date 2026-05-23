import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";
import { resolveImage } from "@/lib/product-images";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  subcategory: string;
  image_url: string | null;
  stock?: number;
};

export function ProductCard({ product }: { product: Product }) {
  const img = resolveImage(product.image_url);
  const outOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAdd = () => {
    if (outOfStock) return;
    addToCart({ id: product.id, name: product.name, price: product.price, image_url: img });
    toast.success(`${product.name} adicionado ao carrinho`);
  };

  return (
    <article className={`group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all ${outOfStock ? "opacity-70" : "hover:-translate-y-1 hover:shadow-elegant"}`}>
      <div className="relative aspect-square overflow-hidden bg-blush/40">
        <img
          src={img}
          alt={product.name}
          loading="lazy"
          width={800}
          height={800}
          className={`h-full w-full object-cover transition-transform duration-700 ${outOfStock ? "grayscale" : "group-hover:scale-105"}`}
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">
          {product.subcategory}
        </span>
        {outOfStock && (
          <span className="absolute right-3 top-3 rounded-full bg-foreground/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-background backdrop-blur">
            Indisponível
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">{product.category}</p>
        <h3 className="mt-1 font-display text-lg leading-snug">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        )}
        <div className="mt-auto pt-4 flex items-end justify-between gap-3">
          <span className="font-display text-xl font-semibold">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-soft transition-all ${outOfStock ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:scale-105"}`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {outOfStock ? "Indisponível" : "Adicionar"}
          </button>
        </div>
      </div>
    </article>
  );
}