export const CATEGORIES = {
  Acessórios: ["colares", "brincos", "anéis"],
  Beleza: ["pele", "olhos", "boca", "pincéis"],
  Skincare: ["limpeza", "hidratação", "máscaras faciais", "sérum", "protetor solar"],
} as const;

export type CategoryName = keyof typeof CATEGORIES;
