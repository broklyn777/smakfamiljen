"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { recipes, type HealthClass, type Recipe } from "../lib/recipes";

const categories = ["Alla", "Middag", "Snabbt", "Vegetariskt", "Frukost"];
const healthOptions: Array<"Alla" | HealthClass> = ["Alla", "Ofta", "Ibland", "Mer sällan"];

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipes/${recipe.slug}`} className="recipe-card group">
      <div className="card-image">
        <Image src={recipe.image} alt={recipe.title} fill sizes="(max-width: 760px) 92vw, (max-width: 1180px) 45vw, 30vw" />
        <span className={`health-pill health-${recipe.health.toLowerCase().replace(" ", "-")}`}>{recipe.health}</span>
        <span className="time-pill">{recipe.timeMinutes} min</span>
      </div>
      <div className="card-copy">
        <p className="eyebrow">{recipe.category} · {recipe.difficulty}</p>
        <h3>{recipe.title}</h3>
        <p className="muted">{recipe.description}</p>
        <span className="card-link">Se receptet <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Alla");
  const [health, setHealth] = useState<"Alla" | HealthClass>("Alla");
  const [maxTime, setMaxTime] = useState("Alla tider");

  const filteredRecipes = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return recipes.filter((recipe) => {
      const matchesQuery = !normalized || [recipe.title, recipe.description, recipe.category, ...recipe.tags].join(" ").toLowerCase().includes(normalized);
      const matchesCategory = category === "Alla" || recipe.category === category;
      const matchesHealth = health === "Alla" || recipe.health === health;
      const matchesTime = maxTime === "Alla tider" || (maxTime === "Under 30 min" ? recipe.timeMinutes < 30 : recipe.timeMinutes >= 30);
      return matchesQuery && matchesCategory && matchesHealth && matchesTime;
    });
  }, [category, health, maxTime, query]);

  return (
    <main>
      <header className="site-header">
        <Link href="/" className="brand"><span className="brand-mark">S</span><span>Smakfamiljen</span></Link>
        <nav className="nav-links" aria-label="Huvudnavigation"><a href="#recept">Alla recept</a><Link href="/veckomeny">Veckomeny</Link><a href="#om">Om Smakfamiljen</a></nav>
        <Link href="/veckomeny" className="mobile-week-link"><span aria-hidden="true">▦</span> Veckomeny</Link>
        <button className="saved-button" aria-label="Sparade recept"><span>♡</span><span className="saved-label">Sparade recept</span></button>
      </header>

      <section className="hero-shell">
        <div className="hero-copy">
          <p className="kicker">Vardagsmat för riktiga familjer</p>
          <h1>Gott nog att längta till.</h1>
          <p className="hero-text">En samling trygga, enkla recept för dagar som går fort — och måltider som får ta lite längre tid.</p>
          <a className="primary-button" href="#recept">Hitta ett recept <span>↓</span></a>
          <div className="hero-note"><span className="note-icon">✦</span><span><strong>Utvalt av oss</strong><br />Testat i vanliga kök, älskat av små och stora.</span></div>
        </div>
        <div className="hero-art"><Image src="/recipes/family-food.webp" alt="Tre hemlagade familjemåltider" fill priority sizes="(max-width: 760px) 100vw, 52vw" /><div className="art-caption">Laga något fint<br /><em>ikväll.</em></div></div>
      </section>

      <section className="catalog" id="recept">
        <div className="section-heading"><div><p className="kicker">Välj efter dagen</p><h2>Vad är du sugen på?</h2></div><p className="result-count">{filteredRecipes.length} recept att utforska</p></div>
        <div className="search-row"><label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sök på rätt, råvara eller känsla" aria-label="Sök recept" /></label><div className="category-tabs" role="tablist" aria-label="Kategorier">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
        <div className="filter-row"><span className="filter-label">Filtrera</span><select value={health} onChange={(event) => setHealth(event.target.value as "Alla" | HealthClass)} aria-label="Nyttighetsklass">{healthOptions.map((item) => <option key={item} value={item}>{item === "Alla" ? "Alla nyttighetsklasser" : item}</option>)}</select><select value={maxTime} onChange={(event) => setMaxTime(event.target.value)} aria-label="Tillagningstid"><option>Alla tider</option><option>Under 30 min</option><option>30 min eller mer</option></select><span className="filter-explainer">Nyttighetsklass handlar om hur ofta rätten passar i vardagen.</span></div>
        {filteredRecipes.length > 0 ? <div className="recipe-grid">{filteredRecipes.map((recipe) => <RecipeCard key={recipe.slug} recipe={recipe} />)}</div> : <div className="empty-state"><span>🥕</span><h3>Inga recept hittades</h3><p>Prova ett annat ord eller ta bort något filter.</p></div>}
      </section>

      <section className="family-note" id="om"><div className="family-note-mark">♥</div><div><p className="kicker">Smakfamiljens filosofi</p><h2>Mat som gör vardagen lite mjukare.</h2><p>Här finns inga pekpinnar och inga perfekta veckor. Bara recept som går att laga, variera och samlas kring.</p></div><div className="note-stat"><strong>03</strong><span>enkla nyttighetsklasser<br />för en snällare vardag</span></div></section>
      <footer><span>© 2026 Smakfamiljen</span><span>Recept utan stress.</span><span>Byggt för att växa med familjen.</span></footer>
    </main>
  );
}
