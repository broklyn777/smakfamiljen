"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { recipes, type HealthClass, type Recipe } from "../../lib/recipes";
import { HealthBadge } from "./HealthBadge";

type Props = { open: boolean; onClose: () => void; onSelect: (recipe: Recipe) => void };
const healthFilters: Array<"Alla" | HealthClass> = ["Alla", "Ofta", "Ibland", "Mer sällan"];

export function RecipePicker({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [health, setHealth] = useState<"Alla" | HealthClass>("Alla");
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    const shouldFocusSearch = window.matchMedia("(min-width: 621px)").matches;
    const focusTimer = shouldFocusSearch ? window.setTimeout(() => inputRef.current?.focus(), 0) : null;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      if (focusTimer !== null) window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      previousFocus.current?.focus();
    };
  }, [open, onClose]);

  const matches = useMemo(() => recipes.filter((recipe) => {
    const text = `${recipe.title} ${recipe.tags.join(" ")}`.toLowerCase();
    return (!query.trim() || text.includes(query.toLowerCase().trim())) && (health === "Alla" || recipe.health === health);
  }), [health, query]);

  if (!open) return null;
  return <div className="wm-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="wm-picker" role="dialog" aria-modal="true" aria-labelledby="recipe-picker-title"><header><div><p className="kicker">Veckans middagar</p><h2 id="recipe-picker-title">Välj ett recept</h2></div><button className="wm-close" onClick={onClose} aria-label="Stäng receptväljaren">×</button></header><div className="wm-picker-tools"><label><span>⌕</span><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sök på receptnamn" aria-label="Sök recept" /></label><select value={health} onChange={(event) => setHealth(event.target.value as "Alla" | HealthClass)} aria-label="Filtrera på nyttighetsklass">{healthFilters.map((item) => <option key={item}>{item}</option>)}</select></div><div className="wm-picker-grid">{matches.map((recipe) => <button key={recipe.slug} className="wm-picker-card" onClick={() => { onSelect(recipe); onClose(); }}><span className="wm-picker-image"><Image src={recipe.image} alt="" fill sizes="120px" /></span><span className="wm-picker-copy"><strong>{recipe.title}</strong><span>{recipe.timeMinutes} min · {recipe.servings} portioner</span><HealthBadge health={recipe.health} /></span></button>)}</div>{matches.length === 0 ? <p className="wm-picker-empty">Inga recept matchar sökningen.</p> : null}</section></div>;
}
