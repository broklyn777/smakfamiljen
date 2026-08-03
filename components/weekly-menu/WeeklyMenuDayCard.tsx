import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "../../lib/recipes";
import { formatMenuDate, type WeeklyMenuDay } from "../../lib/weekly-menu";
import { HealthBadge } from "./HealthBadge";

type Props = {
  dayName: string;
  day: WeeklyMenuDay;
  recipe?: Recipe;
  duplicate: boolean;
  onChoose: () => void;
  onRemove: () => void;
  onServings: (servings: number) => void;
  onNote: (note: string) => void;
};

export function WeeklyMenuDayCard({ dayName, day, recipe, duplicate, onChoose, onRemove, onServings, onNote }: Props) {
  return (
    <article className={`wm-day-card ${recipe ? "has-recipe" : "is-empty"}`}>
      <header>
        <div><p>{dayName}</p><time dateTime={day.date}>{formatMenuDate(day.date)}</time></div>
        {duplicate ? <span className="wm-duplicate" title="Receptet förekommer flera gånger denna vecka">Valt igen</span> : null}
      </header>
      {recipe ? <>
        <div className="wm-day-image"><Image src={recipe.image} alt={recipe.title} fill sizes="(max-width: 700px) 90vw, 28vw" /></div>
        <div className="wm-day-copy">
          <HealthBadge health={recipe.health} />
          <h2>{recipe.title}</h2>
          <p>{recipe.timeMinutes} min</p>
          <label className="wm-servings"><span>Portioner</span><input type="number" min="1" max="24" value={day.servings} onChange={(event) => onServings(Math.max(1, Math.min(24, Number(event.target.value) || 1)))} /></label>
          <label className="wm-note" data-note={day.note ?? ""}><span>Anteckning</span><input value={day.note ?? ""} onChange={(event) => onNote(event.target.value)} placeholder="T.ex. träning 18.00" /></label>
          <div className="wm-day-actions"><Link href={`/recipes/${recipe.slug}?portioner=${day.servings}`}>Öppna recept</Link><button onClick={onChoose}>Byt</button><button onClick={onRemove}>Ta bort</button></div>
        </div>
      </> : <button type="button" className="wm-empty-content" onClick={onChoose} aria-label={`Välj recept för ${dayName}`}><span aria-hidden="true">+</span><h2>Ingen maträtt vald</h2></button>}
    </article>
  );
}
