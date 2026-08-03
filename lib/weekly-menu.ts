import type { Ingredient } from "./recipes";

export const WEEKLY_MENU_VERSION = 1 as const;
export const WEEKLY_MENU_STORAGE_PREFIX = "smakfamiljen.weekly-menu.v1";

export type WeeklyMenuDay = {
  date: string;
  recipeId: string | null;
  servings: number;
  note?: string;
};

export type WeeklyMenu = {
  version: typeof WEEKLY_MENU_VERSION;
  weekStart: string;
  days: WeeklyMenuDay[];
};

export type ScalingRule = "linear" | "conservative" | "fixed";
export type IngredientCategory =
  | "frukt-och-gront"
  | "kött-fisk"
  | "mejeri"
  | "torrvaror"
  | "kryddor"
  | "frysvaror"
  | "ovrigt";

export type ShoppingIngredient = Ingredient & {
  id: string;
  normalizedName: string;
  category: IngredientCategory;
  scalable: boolean;
  scalingRule: ScalingRule;
  optional: boolean;
};

const dayNames = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];

export function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string) {
  return new Date(`${value}T12:00:00`);
}

export function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function getStartOfWeek(date: Date) {
  const result = new Date(date);
  result.setHours(12, 0, 0, 0);
  const distanceFromMonday = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - distanceFromMonday);
  return result;
}

export function getWeekDates(weekStart: string) {
  const monday = parseISODate(weekStart);
  return dayNames.map((dayName, index) => ({
    dayName,
    date: toISODate(addDays(monday, index)),
  }));
}

export function createEmptyWeeklyMenu(weekStart: string): WeeklyMenu {
  return {
    version: WEEKLY_MENU_VERSION,
    weekStart,
    days: getWeekDates(weekStart).map(({ date }) => ({ date, recipeId: null, servings: 6, note: "" })),
  };
}

export function getISOWeekNumber(date: Date) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function formatWeekRange(weekStart: string) {
  const start = parseISODate(weekStart);
  const end = addDays(start, 6);
  const month = new Intl.DateTimeFormat("sv-SE", { month: "long" });
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${month.format(end)} ${end.getFullYear()}`;
  }
  return `${start.getDate()} ${month.format(start)}–${end.getDate()} ${month.format(end)} ${end.getFullYear()}`;
}

export function formatMenuDate(value: string) {
  return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short" }).format(parseISODate(value)).replace(".", "");
}

function storageKey(weekStart: string) {
  return `${WEEKLY_MENU_STORAGE_PREFIX}:${weekStart}`;
}

export function loadWeeklyMenu(weekStart: string): WeeklyMenu {
  if (typeof window === "undefined") return createEmptyWeeklyMenu(weekStart);
  try {
    const raw = window.localStorage.getItem(storageKey(weekStart));
    if (!raw) return createEmptyWeeklyMenu(weekStart);
    const parsed = JSON.parse(raw) as WeeklyMenu;
    if (parsed.version !== WEEKLY_MENU_VERSION || parsed.weekStart !== weekStart || parsed.days.length !== 7) {
      return createEmptyWeeklyMenu(weekStart);
    }
    return parsed;
  } catch {
    return createEmptyWeeklyMenu(weekStart);
  }
}

export function saveWeeklyMenu(menu: WeeklyMenu) {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey(menu.weekStart), JSON.stringify(menu));
}

export function clearWeeklyMenu(weekStart: string) {
  if (typeof window !== "undefined") window.localStorage.removeItem(storageKey(weekStart));
  return createEmptyWeeklyMenu(weekStart);
}

export function scaleIngredientQuantity(quantity: number, baseServings: number, selectedServings: number, scalingRule: ScalingRule) {
  if (scalingRule === "fixed") return quantity;
  const ratio = selectedServings / baseServings;
  if (scalingRule === "conservative") return quantity * Math.pow(ratio, 0.65);
  return quantity * ratio;
}

export function getIngredientScalingRule(ingredient: Ingredient): ScalingRule {
  const value = ingredient.name.toLowerCase();
  if (ingredient.amount === null || ingredient.unit.includes("servering") || ingredient.unit === "valfritt") return "fixed";
  if (/salt|peppar|curry|gurkmeja|spiskummin|timjan|oregano|basilika|paprikapulver|olja/.test(value)) return "conservative";
  return "linear";
}

export function formatScaledQuantity(quantity: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 2 }).format(Math.round(quantity * 100) / 100);
}

export function prepareShoppingIngredient(ingredient: Ingredient, index: number): ShoppingIngredient {
  const normalizedName = ingredient.name.toLowerCase().replace(/\([^)]*\)/g, "").trim();
  const value = normalizedName;
  let category: IngredientCategory = "ovrigt";
  if (/lök|vitlök|morot|palsternack|zucchini|broccoli|spenat|citron|gurka|tomat|sallad|potatis/.test(value)) category = "frukt-och-gront";
  else if (/kyckling|lax|nötfärs|skinka/.test(value)) category = "kött-fisk";
  else if (/mjölk|yoghurt|grädde|parmesan|ost|ägg/.test(value)) category = "mejeri";
  else if (/pasta|ris|linser|mjöl|havre|bulgur|matkorn/.test(value)) category = "torrvaror";
  else if (/salt|peppar|curry|gurkmeja|spiskummin|timjan|oregano|basilika|paprikapulver|dill/.test(value)) category = "kryddor";
  else if (/fryst/.test(value)) category = "frysvaror";
  const scalingRule = getIngredientScalingRule(ingredient);
  return {
    ...ingredient,
    id: `${normalizedName.replace(/[^a-z0-9åäö]+/g, "-").replace(/^-|-$/g, "")}-${index}`,
    normalizedName,
    category,
    scalable: ingredient.amount !== null && scalingRule !== "fixed",
    scalingRule,
    optional: ingredient.unit === "valfritt" || ingredient.unit === "vid behov",
  };
}
