import tomatoPasta from "../content/recipes/krämig-tomatpasta.json";
import salmon from "../content/recipes/lax-pa-platen.json";
import pancakes from "../content/recipes/bananpannkakor.json";
import lentilCurry from "../content/recipes/indisk-linsgryta-med-spenat.json";
import chickenStew from "../content/recipes/kycklinggryta-med-rotfrukter.json";
import meatSauce from "../content/recipes/kottfarssas-med-extra-gronsaker.json";
import chickenPasta from "../content/recipes/kramig-kycklingpasta-med-artor.json";
import ovenPancake from "../content/recipes/ugnspannkaka-med-skinka-och-gronsaker.json";

export type HealthClass = "Ofta" | "Ibland" | "Mer sällan";
export type Ingredient = { name: string; amount: number | null; unit: string; group?: string };
export type Recipe = { slug: string; title: string; description: string; category: string; difficulty: string; timeMinutes: number; health: HealthClass; servings: number; image: string; tags: string[]; healthReason?: string; ingredients: Ingredient[]; steps: string[] };
export const recipes: Recipe[] = [lentilCurry, salmon, chickenStew, meatSauce, chickenPasta, ovenPancake, tomatoPasta, pancakes] as Recipe[];
export function getRecipe(slug: string) { return recipes.find((recipe) => recipe.slug === slug); }
