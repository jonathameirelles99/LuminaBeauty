import colarRose from "@/assets/products/colar-rose.jpg";
import brincosPerola from "@/assets/products/brincos-perola.jpg";
import anelOuro from "@/assets/products/anel-ouro.jpg";
import basePele from "@/assets/products/base-pele.jpg";
import paletaOlhos from "@/assets/products/paleta-olhos.jpg";
import batomRose from "@/assets/products/batom-rose.jpg";
import pinceis from "@/assets/products/pinceis.jpg";
import limpeza from "@/assets/products/limpeza-facial.jpg";
import hidratante from "@/assets/products/hidratante.jpg";
import mascara from "@/assets/products/mascara-facial.jpg";
import serum from "@/assets/products/serum.jpg";
import protetor from "@/assets/products/protetor-solar.jpg";

const map: Record<string, string> = {
  "colar-rose": colarRose,
  "brincos-perola": brincosPerola,
  "anel-ouro": anelOuro,
  "base-pele": basePele,
  "paleta-olhos": paletaOlhos,
  "batom-rose": batomRose,
  "pinceis": pinceis,
  "limpeza-facial": limpeza,
  "hidratante": hidratante,
  "mascara-facial": mascara,
  "serum": serum,
  "protetor-solar": protetor,
};

export function resolveImage(url: string | null | undefined): string {
  if (!url) return hidratante;

  if (url.startsWith("/uploads")) {
    return `http://localhost:5000${url}`;
  }

  if (/^https?:\/\//.test(url)) {
    return url;
  }

  const match = url.match(/([a-z0-9-]+)\.(jpg|jpeg|png|webp)$/i);

  if (match && map[match[1]]) {
    return map[match[1]];
  }

  return hidratante;
}