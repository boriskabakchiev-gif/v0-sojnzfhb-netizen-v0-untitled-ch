// Fixed list of material categories used in the Снабдяване (Supply) section.
export const MATERIAL_CATEGORIES = [
  "Етикети",
  "Седящи пликове",
  "Фолио",
  "Кашони",
  "Вакуум пликове",
  "Буркан",
  "Бутилка",
] as const

export type MaterialCategory = (typeof MATERIAL_CATEGORIES)[number]

// The 5 fixed recipe slots on each production product.
// key -> matches the DB columns <key>_material_id / <key>_qty
export const RECIPE_SLOTS = [
  { key: "label1", label: "Етикет 1" },
  { key: "label2", label: "Етикет 2" },
  { key: "sticker", label: "Стикер" },
  { key: "packaging", label: "Опаковка" },
  { key: "box", label: "Кашон" },
] as const

export type RecipeSlotKey = (typeof RECIPE_SLOTS)[number]["key"]
