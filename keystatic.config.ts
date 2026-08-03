import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: { kind: "local" },
  collections: {
    recipes: collection({
      label: "Recept",
      slugField: "title",
      path: "content/recipes/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({ name: { label: "Titel", validation: { isRequired: true } } }),
        description: fields.text({ label: "Kort beskrivning", multiline: true }),
        category: fields.select({ label: "Kategori", options: [{ label: "Middag", value: "Middag" }, { label: "Frukost", value: "Frukost" }, { label: "Snabbt", value: "Snabbt" }, { label: "Vegetariskt", value: "Vegetariskt" }], defaultValue: "Middag" }),
        difficulty: fields.text({ label: "Svårighet" }),
        timeMinutes: fields.integer({ label: "Tillagningstid (minuter)" }),
        health: fields.select({ label: "Nyttighetsklass", options: [{ label: "Ofta", value: "Ofta" }, { label: "Ibland", value: "Ibland" }, { label: "Mer sällan", value: "Mer sällan" }], defaultValue: "Ofta" }),
        servings: fields.integer({ label: "Portioner" }),
        image: fields.image({ label: "Bild", directory: "public/recipes", publicPath: "/recipes/" }),
        tags: fields.array(fields.text({ label: "Tagg" }), { label: "Taggar", itemLabel: (props) => props.value }),
        healthReason: fields.text({ label: "Varför passar rätten i vardagen?", multiline: true }),
        ingredients: fields.array(fields.object({ name: fields.text({ label: "Ingrediens" }), amount: fields.number({ label: "Mängd" }), unit: fields.text({ label: "Enhet" }), group: fields.text({ label: "Grupp, exempelvis sås eller till servering" }) }), { label: "Ingredienser", itemLabel: (props) => props.fields.name.value }),
        steps: fields.array(fields.text({ label: "Steg", multiline: true }), { label: "Gör så här", itemLabel: (props) => props.value.slice(0, 40) }),
      },
    }),
  },
});
