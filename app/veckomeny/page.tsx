"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { RecipePicker } from "../../components/weekly-menu/RecipePicker";
import { WeekNavigation } from "../../components/weekly-menu/WeekNavigation";
import { WeeklyMenuDayCard } from "../../components/weekly-menu/WeeklyMenuDayCard";
import { recipes, type Recipe } from "../../lib/recipes";
import { addDays, clearWeeklyMenu, createEmptyWeeklyMenu, getStartOfWeek, getWeekDates, loadWeeklyMenu, parseISODate, saveWeeklyMenu, toISODate, type WeeklyMenu } from "../../lib/weekly-menu";
import "./weekly-menu.css";

function currentWeekStart() { return toISODate(getStartOfWeek(new Date())); }

export default function WeeklyMenuPage() {
  const [weekStart, setWeekStart] = useState(currentWeekStart);
  const [menu, setMenu] = useState<WeeklyMenu>(() => createEmptyWeeklyMenu(currentWeekStart()));
  const [pickerDay, setPickerDay] = useState<number | null>(null);
  const loadedWeek = useRef<string | null>(null);
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loaded = loadWeeklyMenu(weekStart);
      loadedWeek.current = weekStart;
      setMenu(loaded);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [weekStart]);
  useEffect(() => { if (loadedWeek.current === menu.weekStart) saveWeeklyMenu(menu); }, [menu]);

  const recipeCounts = useMemo(() => menu.days.reduce<Record<string, number>>((counts, day) => { if (day.recipeId) counts[day.recipeId] = (counts[day.recipeId] ?? 0) + 1; return counts; }, {}), [menu]);
  const oftenDays = menu.days.filter((day) => recipes.find((recipe) => recipe.slug === day.recipeId)?.health === "Ofta").length;

  function updateDay(index: number, changes: Partial<WeeklyMenu["days"][number]>) {
    setMenu((current) => ({ ...current, days: current.days.map((day, dayIndex) => dayIndex === index ? { ...day, ...changes } : day) }));
  }
  function moveWeek(days: number) { setWeekStart(toISODate(addDays(parseISODate(weekStart), days))); }
  function selectRecipe(recipe: Recipe) { if (pickerDay !== null) updateDay(pickerDay, { recipeId: recipe.slug }); }
  function copyPreviousWeek() {
    const previousStart = toISODate(addDays(parseISODate(weekStart), -7));
    const previous = loadWeeklyMenu(previousStart);
    setMenu({ version: 1, weekStart, days: weekDates.map(({ date }, index) => ({ ...previous.days[index], date })) });
  }
  function randomizeWeek() {
    const shuffled = [...recipes].sort(() => Math.random() - 0.5);
    setMenu({ version: 1, weekStart, days: weekDates.map(({ date }, index) => ({ date, recipeId: shuffled[index % shuffled.length].slug, servings: 6, note: "" })) });
  }
  function resetWeek() {
    if (window.confirm("Vill du rensa hela veckans meny?")) { const empty = clearWeeklyMenu(weekStart); setMenu(empty); }
  }

  return <main className="wm-page"><header className="site-header wm-site-header"><Link href="/" className="brand"><span className="brand-mark">S</span><span>Smakfamiljen</span></Link><nav className="nav-links" aria-label="Huvudnavigation"><Link href="/">Alla recept</Link><Link href="/veckomeny" aria-current="page">Veckomeny</Link></nav><button className="saved-button wm-print-top" onClick={() => window.print()}>Skriv ut</button></header><section className="wm-hero"><div><p className="kicker">Planera tillsammans</p><h1>Veckomeny</h1><p>En enkel överblick för hela familjen — från måndagens middag till söndagens lugn.</p></div><div className="wm-week-score"><strong>{oftenDays}/7</strong><span>dagar i klassen Ofta</span></div></section><section className="wm-content"><WeekNavigation weekStart={weekStart} onPrevious={() => moveWeek(-7)} onNext={() => moveWeek(7)} onToday={() => setWeekStart(currentWeekStart())} /><div className="wm-toolbar"><button onClick={copyPreviousWeek}>Kopiera förra veckan</button><button onClick={randomizeWeek}>Slumpa meny</button><button onClick={resetWeek}>Rensa veckan</button><button className="wm-print-button" onClick={() => window.print()}>Skriv ut veckomeny</button></div><div className="wm-grid">{weekDates.map(({ dayName }, index) => { const day = menu.days[index]; const recipe = recipes.find((item) => item.slug === day?.recipeId); return <WeeklyMenuDayCard key={day?.date ?? index} dayName={dayName} day={day ?? createEmptyWeeklyMenu(weekStart).days[index]} recipe={recipe} duplicate={Boolean(recipe && recipeCounts[recipe.slug] > 1)} onChoose={() => setPickerDay(index)} onRemove={() => updateDay(index, { recipeId: null, servings: 6, note: "" })} onServings={(servings) => updateDay(index, { servings })} onNote={(note) => updateDay(index, { note })} />; })}</div></section><footer><span>© 2026 Smakfamiljen</span><span>Veckan blir lättare när alla vet vad det blir.</span></footer><RecipePicker open={pickerDay !== null} onClose={() => setPickerDay(null)} onSelect={selectRecipe} /></main>;
}
