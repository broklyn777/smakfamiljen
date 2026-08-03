import tomatoPasta from "../content/recipes/krämig-tomatpasta.json";
import salmon from "../content/recipes/lax-pa-platen.json";
import pancakes from "../content/recipes/bananpannkakor.json";

export type HealthClass = "Ofta" | "Ibland" | "Mer sällan";
export type Ingredient = { name: string; amount: number; unit: string };
export type Recipe = { slug: string; title: string; description: string; category: string; difficulty: string; timeMinutes: number; health: HealthClass; servings: number; image: string; tags: string[]; ingredients: Ingredient[]; steps: string[] };
export const recipes: Recipe[] = [tomatoPasta, salmon, pancakes] as Recipe[];
export function getRecipe(slug: string) { return recipes.find((recipe) => recipe.slug === slug); }
