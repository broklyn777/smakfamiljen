import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipe, recipes } from "../../../lib/recipes";

export function generateStaticParams() { return recipes.map((recipe) => ({ slug: recipe.slug })); }
export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const recipe = getRecipe(slug); if (!recipe) notFound();
  return <main className="recipe-detail"><header className="site-header"><Link href="/" className="brand"><span className="brand-mark">S</span><span>Smakfamiljen</span></Link><Link href="/" className="back-link">← Till alla recept</Link></header><div className="detail-shell"><div className="detail-image"><Image src={recipe.image} alt={recipe.title} fill priority sizes="(max-width: 850px) 100vw, 52vw" /></div><article className="detail-copy"><p className="kicker">{recipe.category} · {recipe.health}</p><h1>{recipe.title}</h1><p className="detail-intro">{recipe.description}</p><div className="detail-meta"><span><strong>{recipe.timeMinutes}</strong> minuter</span><span><strong>{recipe.servings}</strong> portioner</span><span><strong>{recipe.difficulty}</strong> svårighet</span></div><div className="detail-columns"><div><h2>Ingredienser</h2><ul className="ingredients">{recipe.ingredients.map((item) => <li key={item.name}><span>{item.name}</span><strong>{item.amount} {item.unit}</strong></li>)}</ul></div><div><h2>Gör så här</h2><ol className="steps">{recipe.steps.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol></div></div></article></div></main>;
}
