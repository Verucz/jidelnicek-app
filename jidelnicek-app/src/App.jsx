import React, { useState, useMemo, useEffect } from "react";

/* ---------------------------------------------------------
   Databáze receptů — reálné recepty a odkazy z cookidoo.cz
   (kalorie u receptů bez zveřejněné nutriční hodnoty jsou
   orientační odhady, přesná data ukáže Cookidoo po přihlášení)
   kategorie: snidane | obed | vecere | svacina
--------------------------------------------------------- */
const RECIPES = [
  // SNÍDANĚ
  { id: "s1", cat: "snidane", name: "Ovesná kaše se skořicí", kcal: 320, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r73547" },
  { id: "s2", cat: "snidane", name: "Ovesná kaše s ovocem", kcal: 300, icon: "🍓", url: "https://cookidoo.cz/recipes/recipe/cs/r73425" },
  { id: "s3", cat: "snidane", name: "Jablečná ovesná kaše", kcal: 300, icon: "🍎", url: "https://cookidoo.cz/recipes/recipe/cs/r133742" },
  { id: "s4", cat: "snidane", name: "Vločková kaše", kcal: 280, icon: "🥄", url: "https://cookidoo.cz/recipes/recipe/cs/r87338" },
  { id: "s5", cat: "snidane", name: "Ovocný dezert s bílým jogurtem a domácí granolou", kcal: 629, icon: "🍇", url: "https://cookidoo.cz/recipes/recipe/cs/r177499" },
  { id: "s6", cat: "snidane", name: "Banánový jogurt", kcal: 395, icon: "🍌", url: "https://cookidoo.cz/recipes/recipe/cs/r73426" },
  { id: "s7", cat: "snidane", name: "Toust s avokádem a vejcem Benedikt", kcal: 420, icon: "🥑", url: "https://cookidoo.cz/recipes/recipe/cs/r548454" },
  { id: "s8", cat: "snidane", name: "Španělská bramborová omeleta", kcal: 481, icon: "🍳", url: "https://cookidoo.cz/recipes/recipe/cs/r70468" },

  // OBĚD
  { id: "o1", cat: "obed", name: "Kuřecí prsa v jogurtové omáčce s bramborami", kcal: 375, icon: "🍗", url: "https://cookidoo.cz/recipes/recipe/cs/r67384" },
  { id: "o2", cat: "obed", name: "Kuře po asijsku s rýží a zeleninou", kcal: 560, icon: "🍚", url: "https://cookidoo.cz/recipes/recipe/cs/r113021" },
  { id: "o3", cat: "obed", name: "Hovězí guláš s kulatými houskovými knedlíky", kcal: 554, icon: "🍲", url: "https://cookidoo.cz/recipes/recipe/cs/r134686" },
  { id: "o4", cat: "obed", name: "Klasický maďarský guláš", kcal: 420, icon: "🥘", url: "https://cookidoo.cz/recipes/recipe/cs/r134656" },
  { id: "o5", cat: "obed", name: "Losos s bramborami, brokolicí a koprovou omáčkou", kcal: 520, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r815752" },
  { id: "o6", cat: "obed", name: "Losos se zeleninou a kuskusem", kcal: 393, icon: "🥗", url: "https://cookidoo.cz/recipes/recipe/cs/r154943" },
  { id: "o7", cat: "obed", name: "Krůtí špíz s rýží a zeleninovou omáčkou", kcal: 480, icon: "🍢", url: "https://cookidoo.cz/recipes/recipe/cs/r69952" },
  { id: "o8", cat: "obed", name: "Kuřecí se zeleninou, rýží a teriyaki omáčkou v páře", kcal: 540, icon: "🥦", url: "https://cookidoo.cz/recipes/recipe/cs/r302491" },

  // VEČEŘE
  { id: "v1", cat: "vecere", name: "Losos s bramborovou kaší", kcal: 221, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r87071" },
  { id: "v2", cat: "vecere", name: "Krémová zeleninová polévka", kcal: 90, icon: "🍵", url: "https://cookidoo.cz/recipes/recipe/cs/r55011" },
  { id: "v3", cat: "vecere", name: "Bílá zelná polévka se šťouchanými brambory", kcal: 192, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r72362" },
  { id: "v4", cat: "vecere", name: "Zeleninová polévka s těstovinami", kcal: 160, icon: "🍝", url: "https://cookidoo.cz/recipes/recipe/cs/r418225" },
  { id: "v5", cat: "vecere", name: "Čočková polévka s rajčaty", kcal: 254, icon: "🍅", url: "https://cookidoo.cz/recipes/recipe/cs/r86542" },
  { id: "v6", cat: "vecere", name: "Krémová polévka z červené čočky", kcal: 272, icon: "🥕", url: "https://cookidoo.cz/recipes/recipe/cs/r785604" },
  { id: "v7", cat: "vecere", name: "Bramborová kaše s medvědím česnekem a hořčičným máslem", kcal: 498, icon: "🧈", url: "https://cookidoo.cz/recipes/recipe/cs/r725086" },
  { id: "v8", cat: "vecere", name: "Bramborovo-dýňová kaše", kcal: 312, icon: "🎃", url: "https://cookidoo.cz/recipes/recipe/cs/r265473" },

  // SVAČINY
  { id: "sv1", cat: "svacina", name: "Jahodovo-jogurtové smoothie s chia semínky", kcal: 87, icon: "🍓", url: "https://cookidoo.cz/recipes/recipe/cs/r177507" },
  { id: "sv2", cat: "svacina", name: "Kokosový jogurt (veganský)", kcal: 190, icon: "🥥", url: "https://cookidoo.cz/recipes/recipe/cs/r539672" },
  { id: "sv3", cat: "svacina", name: "Studená okurková polévka s bílým jogurtem a avokádem", kcal: 191, icon: "🥒", url: "https://cookidoo.cz/recipes/recipe/cs/r177503" },
  { id: "sv4", cat: "svacina", name: "Veganská pěna s banány a avokádem", kcal: 267, icon: "🍌", url: "https://cookidoo.cz/recipes/recipe/cs/r761186" },
  { id: "sv5", cat: "svacina", name: "Domácí jogurt zalitý horkým ovocem", kcal: 191, icon: "🫐", url: "https://cookidoo.cz/recipes/recipe/cs/r122393" },
  { id: "sv6", cat: "svacina", name: "Bramborová kaše (malá porce)", kcal: 200, icon: "🥔", url: "https://cookidoo.cz/recipes/recipe/cs/r770148" },
];

const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

const ACTIVITY = {
  zadna: { label: "Žádná aktivita", desc: "sedavé zaměstnání, minimum pohybu", factor: 1.2, icon: "🛋️" },
  mirna: { label: "Mírná aktivita", desc: "lehký pohyb / sport 1–3× týdně", factor: 1.375, icon: "🚶" },
  velka: { label: "Velká aktivita", desc: "sport 4–6× týdně / fyzická práce", factor: 1.55, icon: "🏃" },
};

const PLAN_3 = [
  { key: "snidane", cat: "snidane", label: "Snídaně", icon: "🌅", share: 0.3 },
  { key: "obed", cat: "obed", label: "Oběd", icon: "☀️", share: 0.4 },
  { key: "vecere", cat: "vecere", label: "Večeře", icon: "🌙", share: 0.3 },
];

const PLAN_5 = [
  { key: "snidane", cat: "snidane", label: "Snídaně", icon: "🌅", share: 0.25 },
  { key: "sv1", cat: "svacina", label: "Dopolední svačina", icon: "🍎", share: 0.1 },
  { key: "obed", cat: "obed", label: "Oběd", icon: "☀️", share: 0.35 },
  { key: "sv2", cat: "svacina", label: "Odpolední svačina", icon: "🥨", share: 0.1 },
  { key: "vecere", cat: "vecere", label: "Večeře", icon: "🌙", share: 0.2 },
];

const FAVORITES_KEY = "jidelnicek_oblibene";

function toNum(v, fallback) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function bmr({ gender, age, weight, height }) {
  const base = 10 * toNum(weight, 0) + 6.25 * toNum(height, 0) - 5 * toNum(age, 0);
  return gender === "muz" ? base + 5 : base - 161;
}

/* Vybere 3 recepty z kategorie nejblíže cílové kalorické hodnotě,
   s možností posunu (offset) — díky tomu má každý den i každé
   "zamíchání" jinou trojici variant, i když se drží stejného cíle. */
function pickThree(cat, target, offset) {
  const pool = RECIPES.filter((r) => r.cat === cat);
  const sorted = [...pool].sort(
    (a, b) => Math.abs(a.kcal - target) - Math.abs(b.kcal - target)
  );
  const n = sorted.length;
  const start = ((offset % n) + n) % n;
  const chosen = [];
  for (let i = 0; i < Math.min(3, n); i++) {
    chosen.push(sorted[(start + i) % n]);
  }
  return chosen;
}

function portionNote(recipeKcal, target) {
  const ratio = target / recipeKcal;
  const rounded = Math.round(ratio * 4) / 4;
  const clamped = Math.min(2, Math.max(0.5, rounded));
  return clamped === 1 ? "odpovídá 1 porci" : `doporučená porce ${clamped}×`;
}

function NumberField({ label, value, onChange, min, max, suffix }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="numWrap">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d]/g, "");
            const stripped = raw.replace(/^0+(?=\d)/, "");
            onChange(stripped);
          }}
          onBlur={(e) => {
            if (e.target.value === "") onChange(String(min));
          }}
          className="input"
        />
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
    </div>
  );
}

function Stepper({ label, value, onChange, min, max }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="stepper">
        <button
          type="button"
          className="stepperBtn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          −
        </button>
        <span className="stepperValue">{value}</span>
        <button
          type="button"
          className="stepperBtn"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState({
    gender: "zena",
    age: "30",
    weight: "65",
    height: "168",
    activity: "mirna",
    mealsPerDay: 3,
    days: 3,
  });
  const [selections, setSelections] = useState({});
  const [offsets, setOffsets] = useState({});
  const [showPlan, setShowPlan] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // Načtení oblíbených receptů z prohlížeče při startu
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      if (saved) setFavorites(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const results = useMemo(() => {
    const base = bmr(form);
    const tdee = base * ACTIVITY[form.activity].factor;
    return { bmr: Math.round(base), tdee: Math.round(tdee) };
  }, [form.gender, form.age, form.weight, form.height, form.activity]);

  const slots = form.mealsPerDay === 3 ? PLAN_3 : PLAN_5;

  // Vícedenní jídelníček — každý den + slot má svůj klíč, offset dne
  // zajišťuje, že se dny přirozeně liší, i než cokoliv ručně zamícháš
  const multiDayPlan = useMemo(() => {
    const days = [];
    for (let d = 0; d < form.days; d++) {
      const daySlots = slots.map((slot) => {
        const key = `day${d}-${slot.key}`;
        const target = Math.round(results.tdee * slot.share);
        const manualOffset = offsets[key] || 0;
        const options = pickThree(slot.cat, target, d + manualOffset);
        return { ...slot, key, target, options };
      });
      days.push({ dayIndex: d, slots: daySlots });
    }
    return days;
  }, [form.days, form.mealsPerDay, results.tdee, offsets, slots]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const selectOption = (slotKey, recipeId) =>
    setSelections((s) => ({ ...s, [slotKey]: recipeId }));
  const reshuffleSlot = (slotKey) =>
    setOffsets((o) => ({ ...o, [slotKey]: (o[slotKey] || 0) + 3 }));

  const dayTotal = (daySlots) =>
    daySlots.reduce((sum, slot) => {
      const chosenId = selections[slot.key] ?? slot.options[0]?.id;
      const recipe = slot.options.find((r) => r.id === chosenId);
      return sum + (recipe ? recipe.kcal : 0);
    }, 0);

  const favoriteRecipes = favorites
    .map((id) => RECIPE_BY_ID[id])
    .filter(Boolean);

  return (
    <div className="page">
      <style>{css}</style>

      <header className="header">
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="headerInner">
          <span className="eyebrow">Kuchyňský deník</span>
          <h1 className="title">Jídelníček na míru</h1>
          <p className="subtitle">
            Zadej pár údajů, spočítáme denní energetický příjem a poskládáme
            jídelníček ze skutečných receptů z Cookidoo na tolik dní, kolik
            potřebuješ. Varianty se dají kdykoli zamíchat a oblíbené recepty
            se ti uloží.
          </p>
        </div>
      </header>

      <main className="main">
        {/* ---- FORMULÁŘ ---- */}
        <section className="card">
          <div className="cardHeadRow">
            <span className="stamp">01</span>
            <h2 className="cardTitle">Tvoje údaje</h2>
          </div>

          <div className="formGrid">
            <div className="field">
              <label className="label">Pohlaví</label>
              <div className="toggleRow">
                {[
                  { v: "zena", t: "👩 Žena" },
                  { v: "muz", t: "👨 Muž" },
                ].map((o) => (
                  <button
                    key={o.v}
                    onClick={() => update("gender", o.v)}
                    className={`toggleBtn ${form.gender === o.v ? "active" : ""}`}
                  >
                    {o.t}
                  </button>
                ))}
              </div>
            </div>

            <NumberField label="Věk" value={form.age} min={10} max={100} suffix="let" onChange={(v) => update("age", v)} />
            <NumberField label="Váha" value={form.weight} min={30} max={250} suffix="kg" onChange={(v) => update("weight", v)} />
            <NumberField label="Výška" value={form.height} min={100} max={230} suffix="cm" onChange={(v) => update("height", v)} />

            <div className="field fullRow">
              <label className="label">Úroveň aktivity</label>
              <div className="toggleRow">
                {Object.entries(ACTIVITY).map(([key, a]) => (
                  <button
                    key={key}
                    onClick={() => update("activity", key)}
                    className={`activityBtn ${form.activity === key ? "active" : ""}`}
                  >
                    <span className="activityIcon">{a.icon}</span>
                    <span>
                      <span className="activityLabel">{a.label}</span>
                      <span className="activityDesc">{a.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field fullRow">
              <label className="label">Počet jídel denně</label>
              <div className="toggleRow">
                {[3, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => update("mealsPerDay", n)}
                    className={`toggleBtn ${form.mealsPerDay === n ? "active" : ""}`}
                  >
                    {n} jídla
                  </button>
                ))}
              </div>
            </div>

            <div className="fullRow">
              <Stepper
                label="Počet dní jídelníčku"
                value={form.days}
                min={1}
                max={7}
                onChange={(v) => update("days", v)}
              />
            </div>
          </div>

          <button className="primaryBtn" onClick={() => setShowPlan(true)}>
            Spočítat a sestavit jídelníček ✨
          </button>
        </section>

        {/* ---- OBLÍBENÉ ---- */}
        {favoriteRecipes.length > 0 && (
          <section className="card">
            <div className="cardHeadRow" style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="stamp">♥</span>
                <h2 className="cardTitle">Oblíbené recepty</h2>
              </div>
              <button className="linkBtn" onClick={() => setShowFavorites((s) => !s)}>
                {showFavorites ? "Skrýt" : `Zobrazit (${favoriteRecipes.length})`}
              </button>
            </div>
            {showFavorites && (
              <div className="optionsGrid">
                {favoriteRecipes.map((r) => (
                  <div key={r.id} className="option">
                    <div className="optionTop">
                      <span className="optionIcon">{r.icon}</span>
                      <button className="heartBtn active" onClick={() => toggleFavorite(r.id)}>
                        ♥
                      </button>
                    </div>
                    <div className="optionName">{r.name}</div>
                    <div className="optionMeta">
                      <span className="optionKcal">{r.kcal} kcal</span>
                    </div>
                    <a href={r.url} target="_blank" rel="noreferrer" className="cookidooLink">
                      Otevřít recept na Cookidoo ↗
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ---- VÝSLEDEK ---- */}
        {showPlan && (
          <>
            <section className="resultCard">
              <div className="resultRow">
                <div>
                  <div className="resultLabel">Klidový metabolismus</div>
                  <div className="resultValue">{results.bmr} kcal</div>
                </div>
                <div className="resultDivider" />
                <div>
                  <div className="resultLabel">Doporučený denní příjem</div>
                  <div className="resultValueBig">{results.tdee} kcal</div>
                </div>
                <div className="resultDivider" />
                <div>
                  <div className="resultLabel">Počet dní</div>
                  <div className="resultValue">{form.days}</div>
                </div>
              </div>
            </section>

            {multiDayPlan.map((day) => (
              <section key={day.dayIndex} className="dayBlock">
                <div className="dayHeadRow">
                  <h2 className="dayTitle">Den {day.dayIndex + 1}</h2>
                  <span className="dayTotal">{dayTotal(day.slots)} kcal celkem</span>
                </div>

                <div className="timeline">
                  {day.slots.map((slot, idx) => {
                    const chosenId = selections[slot.key] ?? slot.options[0]?.id;
                    return (
                      <div
                        key={slot.key}
                        className="mealCard"
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        <div className="mealCardNotch" />
                        <div className="mealHead">
                          <span className="mealEmoji">{slot.icon}</span>
                          <div style={{ flex: 1 }}>
                            <h3 className="mealTitle">{slot.label}</h3>
                            <span className="mealTarget">cíl ≈ {slot.target} kcal</span>
                          </div>
                          <button
                            className="shuffleBtn"
                            onClick={() => reshuffleSlot(slot.key)}
                            title="Nelíbí se ti tahle nabídka? Zamíchej jiné varianty."
                          >
                            🔀 Jiné varianty
                          </button>
                        </div>

                        <div className="optionsGrid">
                          {slot.options.map((r) => {
                            const active = chosenId === r.id;
                            const isFav = favorites.includes(r.id);
                            return (
                              <div
                                key={r.id}
                                className={`option ${active ? "active" : ""}`}
                                onClick={() => selectOption(slot.key, r.id)}
                              >
                                <div className="optionTop">
                                  <span className="optionIcon">{r.icon}</span>
                                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    <button
                                      className={`heartBtn ${isFav ? "active" : ""}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(r.id);
                                      }}
                                      title="Uložit mezi oblíbené"
                                    >
                                      ♥
                                    </button>
                                    {active && <span className="checkMark">✓</span>}
                                  </div>
                                </div>
                                <div className="optionName">{r.name}</div>
                                <div className="optionMeta">
                                  <span className="optionKcal">{r.kcal} kcal</span>
                                  <span className="optionPortion">
                                    {portionNote(r.kcal, slot.target)}
                                  </span>
                                </div>
                                <a
                                  href={r.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="cookidooLink"
                                >
                                  Otevřít recept na Cookidoo ↗
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </>
        )}
      </main>

      <footer className="footer">
        Výpočet dle Mifflin–St Jeor rovnice. Odkazy vedou na konkrétní recepty
        na cookidoo.cz. Přímé API napojení na Cookidoo veřejně neexistuje, proto
        u receptů bez zveřejněné nutriční hodnoty je uvedená kalorická hodnota
        orientační — přesná data uvidíš po přihlášení na Cookidoo. Oblíbené
        recepty se ukládají jen v tomto prohlížeči na tomto zařízení.
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------
   Styly
--------------------------------------------------------- */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

:root {
  --paper: #F1F4EC;
  --card: #FFFFFF;
  --ink: #1E2A22;
  --herb: #3A5A43;
  --herb-light: #5C8368;
  --saffron: #E4A63B;
  --tomato: #C1502E;
  --line: #DEE3D3;
  --muted: #6B7563;
}

* { box-sizing: border-box; }

.page {
  min-height: 100vh;
  background: var(--paper);
  font-family: 'Inter', sans-serif;
  color: var(--ink);
  padding-bottom: 48px;
}

.header {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #E9EFE0 0%, var(--paper) 100%);
  border-bottom: 1px solid var(--line);
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.35;
  pointer-events: none;
}
.blob1 { width: 260px; height: 260px; background: var(--saffron); top: -110px; right: -60px; }
.blob2 { width: 220px; height: 220px; background: var(--herb-light); bottom: -120px; left: -60px; }

.headerInner {
  position: relative;
  max-width: 760px;
  margin: 0 auto;
  padding: 52px 24px 36px;
}
.eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--herb);
  font-weight: 600;
}
.title {
  font-family: 'Fraunces', serif;
  font-size: 44px;
  font-weight: 700;
  margin: 10px 0 14px;
  color: var(--ink);
  letter-spacing: -0.5px;
}
.subtitle {
  font-size: 15px;
  line-height: 1.65;
  color: var(--muted);
  max-width: 560px;
}

.main {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 8px 30px rgba(30, 42, 34, 0.06);
}
.cardHeadRow { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
.stamp {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--herb), var(--herb-light));
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cardTitle { font-family: 'Fraunces', serif; font-size: 23px; font-weight: 600; margin: 0; }

.linkBtn {
  border: none;
  background: none;
  color: var(--herb);
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
}

.formGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.fullRow { grid-column: 1 / -1; }
.label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--muted);
}

.numWrap { position: relative; display: flex; align-items: center; }
.input {
  width: 100%;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  padding: 11px 44px 11px 14px;
  font-size: 16px;
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 600;
  background: #fff;
  color: var(--ink);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.input:focus {
  outline: none;
  border-color: var(--herb);
  box-shadow: 0 0 0 3px rgba(58, 90, 67, 0.12);
}
.suffix {
  position: absolute;
  right: 14px;
  font-size: 13px;
  color: var(--muted);
  font-weight: 500;
  pointer-events: none;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  padding: 8px 16px;
  width: fit-content;
}
.stepperBtn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1.5px solid var(--line);
  background: #fff;
  color: var(--herb);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.stepperBtn:disabled { opacity: 0.35; cursor: not-allowed; }
.stepperValue {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 17px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
}

.toggleRow { display: flex; gap: 8px; flex-wrap: wrap; }
.toggleBtn {
  flex: 1 1 auto;
  padding: 11px 14px;
  font-size: 14px;
  font-weight: 600;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  background: #fff;
  color: var(--ink);
  cursor: pointer;
  transition: all 0.15s;
}
.toggleBtn:hover { border-color: var(--herb-light); transform: translateY(-1px); }
.toggleBtn.active {
  background: linear-gradient(135deg, var(--herb), var(--herb-light));
  border-color: var(--herb);
  color: #fff;
  box-shadow: 0 4px 12px rgba(58, 90, 67, 0.25);
}

.activityBtn {
  flex: 1 1 200px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 14px;
  font-size: 14px;
  text-align: left;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  background: #fff;
  color: var(--ink);
  cursor: pointer;
  transition: all 0.15s;
}
.activityBtn:hover { border-color: var(--herb-light); transform: translateY(-1px); }
.activityBtn.active {
  background: rgba(58, 90, 67, 0.07);
  border-color: var(--herb);
  box-shadow: 0 4px 12px rgba(58, 90, 67, 0.12);
}
.activityIcon { font-size: 20px; line-height: 1; }
.activityLabel { display: block; font-weight: 700; }
.activityDesc { display: block; font-size: 12px; font-weight: 400; color: var(--muted); margin-top: 2px; }

.primaryBtn {
  margin-top: 26px;
  width: 100%;
  padding: 15px 20px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: #fff;
  background: linear-gradient(135deg, var(--tomato), #D9683F);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 6px 18px rgba(193, 80, 46, 0.3);
}
.primaryBtn:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(193, 80, 46, 0.35); }
.primaryBtn:active { transform: translateY(0); }

.resultCard {
  background: linear-gradient(135deg, var(--ink), #2A3B2E);
  border-radius: 20px;
  padding: 26px 28px;
  color: #FDFCF7;
  animation: fadeUp 0.4s ease both;
}
.resultRow { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.resultDivider { width: 1px; align-self: stretch; background: rgba(255,255,255,0.15); }
.resultLabel { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; margin-bottom: 5px; }
.resultValue { font-family: 'IBM Plex Mono', monospace; font-size: 20px; font-weight: 700; }
.resultValueBig { font-family: 'IBM Plex Mono', monospace; font-size: 32px; font-weight: 700; color: var(--saffron); }

.dayBlock { display: flex; flex-direction: column; gap: 14px; }
.dayHeadRow {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 4px;
}
.dayTitle { font-family: 'Fraunces', serif; font-size: 24px; font-weight: 700; margin: 0; }
.dayTotal { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: var(--muted); }

.timeline { display: flex; flex-direction: column; gap: 18px; }

.mealCard {
  position: relative;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 22px 24px 24px;
  box-shadow: 0 6px 24px rgba(30, 42, 34, 0.05);
  animation: fadeUp 0.45s ease both;
}
.mealCardNotch {
  position: absolute;
  top: -1px;
  left: 26px;
  width: 44px;
  height: 9px;
  background: var(--paper);
  border-left: 1px solid var(--line);
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  border-radius: 0 0 8px 8px;
}
.mealHead { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.mealEmoji {
  font-size: 26px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(228, 166, 59, 0.15);
  border-radius: 12px;
  flex-shrink: 0;
}
.mealTitle { font-family: 'Fraunces', serif; font-size: 19px; font-weight: 600; margin: 0; }
.mealTarget { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--muted); }

.shuffleBtn {
  border: 1.5px solid var(--line);
  background: #fff;
  color: var(--herb);
  font-size: 12px;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.shuffleBtn:hover { border-color: var(--herb-light); background: rgba(58,90,67,0.06); }

.optionsGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
.option {
  position: relative;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #fff;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}
.option:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(30,42,34,0.08); border-color: var(--herb-light); }
.option.active { border-color: var(--herb); background: rgba(58, 90, 67, 0.06); box-shadow: 0 0 0 1.5px var(--herb) inset; }
.optionTop { display: flex; align-items: center; justify-content: space-between; }
.optionIcon { font-size: 20px; }
.checkMark {
  width: 18px; height: 18px;
  background: var(--herb);
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
}
.heartBtn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  color: var(--line);
  line-height: 1;
  padding: 2px;
  transition: color 0.15s, transform 0.15s;
}
.heartBtn:hover { transform: scale(1.15); }
.heartBtn.active { color: var(--tomato); }
.optionName { font-size: 14px; font-weight: 700; line-height: 1.35; }
.optionMeta { display: flex; justify-content: space-between; align-items: center; }
.optionKcal { font-family: 'IBM Plex Mono', monospace; font-size: 13px; font-weight: 700; color: var(--herb); }
.optionPortion { font-size: 11px; color: var(--muted); }
.cookidooLink {
  font-size: 12px;
  font-weight: 700;
  color: var(--tomato);
  text-decoration: none;
  margin-top: 2px;
  transition: opacity 0.15s;
}
.cookidooLink:hover { opacity: 0.7; text-decoration: underline; }

.footer {
  max-width: 760px;
  margin: 24px auto 0;
  padding: 0 24px;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.6;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 520px) {
  .title { font-size: 34px; }
  .formGrid { grid-template-columns: 1fr; }
  .mealHead { flex-wrap: wrap; }
  .shuffleBtn { margin-left: 58px; }
}
`;
