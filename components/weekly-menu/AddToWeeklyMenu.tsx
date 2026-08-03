"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { recipes } from "../../lib/recipes";
import {
  addDays,
  formatMenuDate,
  formatWeekRange,
  getISOWeekNumber,
  getStartOfWeek,
  getWeekDates,
  loadWeeklyMenu,
  parseISODate,
  saveWeeklyMenu,
  toISODate,
  type WeeklyMenu,
} from "../../lib/weekly-menu";
import styles from "./AddToWeeklyMenu.module.css";
import promptStyles from "./AddToWeeklyMenuPrompt.module.css";

type Props = {
  recipeSlug: string;
  recipeTitle: string;
  servings: number;
};

function currentWeekStart() {
  return toISODate(getStartOfWeek(new Date()));
}

export function AddToWeeklyMenu({ recipeSlug, recipeTitle, servings }: Props) {
  const [open, setOpen] = useState(false);
  const [weekStart, setWeekStart] = useState(currentWeekStart);
  const [menu, setMenu] = useState<WeeklyMenu | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [pendingReplacement, setPendingReplacement] = useState<{ index: number; existingTitle: string } | null>(null);
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  function showPlanner() {
    if (!open) setMenu(loadWeeklyMenu(weekStart));
    setOpen((current) => !current);
    setConfirmation("");
    setPendingReplacement(null);
  }

  function changeWeek(dayDelta: number) {
    const nextWeekStart = toISODate(addDays(parseISODate(weekStart), dayDelta));
    setWeekStart(nextWeekStart);
    setMenu(loadWeeklyMenu(nextWeekStart));
    setConfirmation("");
    setPendingReplacement(null);
  }

  function goToCurrentWeek() {
    const nextWeekStart = currentWeekStart();
    setWeekStart(nextWeekStart);
    setMenu(loadWeeklyMenu(nextWeekStart));
    setConfirmation("");
    setPendingReplacement(null);
  }

  function chooseDay(index: number) {
    const currentMenu = menu ?? loadWeeklyMenu(weekStart);
    const currentDay = currentMenu.days[index];
    const existingRecipe = recipes.find((recipe) => recipe.slug === currentDay.recipeId);

    if (existingRecipe && existingRecipe.slug !== recipeSlug) {
      setPendingReplacement({ index, existingTitle: existingRecipe.title });
      setConfirmation("");
      return;
    }

    addRecipeToDay(index, currentMenu);
  }

  function addRecipeToDay(index: number, currentMenu = menu ?? loadWeeklyMenu(weekStart)) {
    const nextMenu: WeeklyMenu = {
      ...currentMenu,
      days: currentMenu.days.map((day, dayIndex) => dayIndex === index
        ? { ...day, recipeId: recipeSlug, servings }
        : day),
    };
    saveWeeklyMenu(nextMenu);
    setMenu(nextMenu);
    setPendingReplacement(null);
    setConfirmation(`${recipeTitle} är tillagd på ${weekDates[index].dayName.toLowerCase()} ${formatMenuDate(weekDates[index].date)}.`);
  }

  return (
    <section className={styles.planner} aria-labelledby="weekly-menu-planner-title">
      <div className={styles.intro}>
        <div>
          <p className="kicker">Planera direkt</p>
          <h2 id="weekly-menu-planner-title">Passar den här rätten i veckan?</h2>
        </div>
        <button type="button" className={styles.toggle} onClick={showPlanner} aria-expanded={open} aria-controls="weekly-menu-days">
          <span aria-hidden="true">＋</span>{open ? "Stäng dagval" : "Lägg till i veckomenyn"}
        </button>
      </div>

      {open ? (
        <div id="weekly-menu-days" className={styles.panel}>
          <div className={styles.weekNavigation}>
            <button type="button" onClick={() => changeWeek(-7)} aria-label="Föregående vecka">←</button>
            <div>
              <p>Vecka {getISOWeekNumber(parseISODate(weekStart))}</p>
              <strong>{formatWeekRange(weekStart)}</strong>
            </div>
            <button type="button" onClick={() => changeWeek(7)} aria-label="Nästa vecka">→</button>
          </div>
          {weekStart !== currentWeekStart() ? <button type="button" className={styles.currentWeek} onClick={goToCurrentWeek}>Till denna vecka</button> : null}

          <div className={styles.dayGrid}>
            {weekDates.map(({ dayName, date }, index) => {
              const selectedRecipe = recipes.find((recipe) => recipe.slug === menu?.days[index]?.recipeId);
              const isCurrentRecipe = selectedRecipe?.slug === recipeSlug;
              return (
                <button
                  type="button"
                  key={date}
                  className={`${styles.day} ${selectedRecipe ? styles.occupied : ""} ${isCurrentRecipe ? styles.selected : ""}`}
                  onClick={() => chooseDay(index)}
                  aria-label={`${dayName} ${formatMenuDate(date)}${selectedRecipe ? `, ${selectedRecipe.title}` : ", ledig"}`}
                >
                  <span>{dayName.slice(0, 3)}</span>
                  <strong>{formatMenuDate(date)}</strong>
                  <small>{isCurrentRecipe ? "Redan vald" : selectedRecipe?.title ?? "Ledig"}</small>
                </button>
              );
            })}
          </div>

          {pendingReplacement ? (
            <div className={promptStyles.replacePrompt} role="alert">
              <p><strong>{weekDates[pendingReplacement.index].dayName}</strong> har redan {pendingReplacement.existingTitle}. Vill du ersätta den med {recipeTitle}?</p>
              <div>
                <button type="button" onClick={() => addRecipeToDay(pendingReplacement.index)}>Ja, ersätt</button>
                <button type="button" onClick={() => setPendingReplacement(null)}>Behåll</button>
              </div>
            </div>
          ) : null}

          <div className={styles.feedback} aria-live="polite">
            {confirmation ? <><span>✓ {confirmation}</span><Link href="/veckomeny">Visa veckomenyn →</Link></> : <span>Välj den dag då du vill laga rätten.</span>}
          </div>
        </div>
      ) : null}
    </section>
  );
}
