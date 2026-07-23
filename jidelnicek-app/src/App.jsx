import React, { useState, useMemo, useEffect } from "react";

/* ===========================================================
   0) ODHAD DIETNÍCH ŠTÍTKŮ Z NÁZVU RECEPTU
      Cookidoo veřejně (bez přihlášení) nezobrazuje oficiální
      alergenové/dietní štítky, takže je odvozujeme z klíčových
      slov v názvu receptu. Je to spolehlivé vodítko pro běžné
      plánování, ale NENÍ to ověřené složení — u celiakie, těžké
      laktózové intolerance nebo alergie vždy zkontroluj skutečné
      ingredience přímo na cookidoo.cz.
   =========================================================== */
function normalizeText(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const MEAT_FISH_WORDS = ["kure","kurec","krut","hovez","veprov","losos","treska","krevet","musle","candat","tunak","pangas","klobas","sunk","slanin","kotlet","stehno","panenka","zavitk","biftek","koft","frikase","gulas","svickova","rizek","nuget","terina","stew","rybi","ryba","mortadel"];
const DAIRY_WORDS = ["jogurt","syr","tvaroh","smetan","mlek","maslo","mozzarell","parmazan","feta","ricott","cottage","kefir","camembert","niva","mascarpone","hermelin"];
const EGG_OR_QUICHE_WORDS = ["vejce","vejci","vajec","omelet","frittat","quiche","smazenk"];
const GLUTEN_WORDS = ["chleb","houska","houstic","bulk","rohlik","pecivo","kolac","buchty","palacink","testovin","knedlik","nudl","gnocchi","quiche","vanocka","bageta","toust","mafin","muffin","loupak","spald","strudl","smazenk","plack"];
const STARCH_WORDS = ["ryz","rizot","brambor","kuskus","quinoa"].concat(GLUTEN_WORDS);

function hasWord(norm, list) {
  return list.some((w) => norm.includes(w));
}

function classifyDiet(name) {
  const norm = normalizeText(name);
  const explicitVegan = norm.includes("vegansk");
  const hasMeatFish = hasWord(norm, MEAT_FISH_WORDS);
  const hasDairy = hasWord(norm, DAIRY_WORDS) && !explicitVegan;
  const hasEgg = hasWord(norm, EGG_OR_QUICHE_WORDS) && !explicitVegan;
  const hasHoney = (/\bmed\b/.test(norm) || norm.includes("medov")) && !explicitVegan;
  const hasGluten = hasWord(norm, GLUTEN_WORDS);
  const hasStarch = hasWord(norm, STARCH_WORDS);

  const tags = [];
  if (explicitVegan || (!hasMeatFish && !hasDairy && !hasEgg && !hasHoney)) tags.push("vegan");
  if (!hasDairy) tags.push("bezlaktozove");
  if (!hasGluten) tags.push("bezlepkove");
  if (!hasStarch) tags.push("lowcarb");
  return tags;
}

const DIET_META = {
  vegan: { label: "Veganské", icon: "🌱" },
  bezlepkove: { label: "Bezlepkové", icon: "🌾" },
  bezlaktozove: { label: "Bezlaktózové", icon: "🥛" },
  lowcarb: { label: "Low carb", icon: "🥩" },
};

/* ===========================================================
   1) OVĚŘENÉ RECEPTY — reálné konkrétní recepty a odkazy
      dohledané přímo na cookidoo.cz (přímý proklik na recept)
   =========================================================== */
const CURATED = [
  // SNÍDANĚ
  { id: "s1", cat: "snidane", name: "Ovesná kaše se skořicí", kcal: 320, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r73547" },
  { id: "s2", cat: "snidane", name: "Ovesná kaše s ovocem", kcal: 300, icon: "🍓", url: "https://cookidoo.cz/recipes/recipe/cs/r73425" },
  { id: "s3", cat: "snidane", name: "Jablečná ovesná kaše", kcal: 300, icon: "🍎", url: "https://cookidoo.cz/recipes/recipe/cs/r133742" },
  { id: "s4", cat: "snidane", name: "Vločková kaše", kcal: 280, icon: "🥄", url: "https://cookidoo.cz/recipes/recipe/cs/r87338" },
  { id: "s5", cat: "snidane", name: "Ovocný dezert s bílým jogurtem a domácí granolou", kcal: 629, icon: "🍇", url: "https://cookidoo.cz/recipes/recipe/cs/r177499" },
  { id: "s6", cat: "snidane", name: "Banánový jogurt", kcal: 395, icon: "🍌", url: "https://cookidoo.cz/recipes/recipe/cs/r73426" },
  { id: "s7", cat: "snidane", name: "Toust s avokádem a vejcem Benedikt", kcal: 420, icon: "🥑", url: "https://cookidoo.cz/recipes/recipe/cs/r548454" },
  { id: "s8", cat: "snidane", name: "Španělská bramborová omeleta", kcal: 481, icon: "🍳", url: "https://cookidoo.cz/recipes/recipe/cs/r70468" },
  { id: "s9", cat: "snidane", name: "Pletenec se skořicí a datlemi", kcal: 410, icon: "🥐", url: "https://cookidoo.cz/recipes/recipe/cs/r122387" },
  { id: "s10", cat: "snidane", name: "High protein vanilkový mousse s chia semínky", kcal: 280, icon: "🍮", url: "https://cookidoo.cz/recipes/recipe/cs/r907894" },
  { id: "s11", cat: "snidane", name: "High protein borůvkové muffiny, vařené v páře", kcal: 240, icon: "🧁", url: "https://cookidoo.cz/recipes/recipe/cs/r907893" },
  { id: "s12", cat: "snidane", name: "Snídaně s lososem a avokádem", kcal: 450, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r587867" },
  { id: "s13", cat: "snidane", name: "High protein kuličky s tahini a arašídovým máslem", kcal: 220, icon: "🍪", url: "https://cookidoo.cz/recipes/recipe/cs/r907890" },
  { id: "s14", cat: "snidane", name: "Čokoládové palačinky", kcal: 391, icon: "🥞", url: "https://cookidoo.cz/recipes/recipe/cs/r73428" },
  { id: "s15", cat: "snidane", name: "Nadýchané americké palačinky", kcal: 210, icon: "🥞", url: "https://cookidoo.cz/recipes/recipe/cs/r177504" },
  { id: "s16", cat: "snidane", name: "Americké palačinky (Pancakes)", kcal: 131, icon: "🥞", url: "https://cookidoo.cz/recipes/recipe/cs/r88410" },
  { id: "s17", cat: "snidane", name: "Fermentovaná ovesná kaše", kcal: 280, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r133828" },
  { id: "s18", cat: "snidane", name: "Ovesná kaše s hruškami vařenými v páře", kcal: 322, icon: "🍐", url: "https://cookidoo.cz/recipes/recipe/cs/r343444" },
  { id: "s19", cat: "snidane", name: "Ovesná kaše přes noc s lískovými oříšky, jogurtem a mandarinkami", kcal: 340, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r915749" },
  { id: "s20", cat: "snidane", name: "Rýžová kaše", kcal: 300, icon: "🍚", url: "https://cookidoo.cz/recipes/recipe/cs/r73432" },
  { id: "s21", cat: "snidane", name: "Křupavé müsli se sušeným ovocem", kcal: 420, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r122389" },
  { id: "s22", cat: "snidane", name: "Máslové houstičky", kcal: 356, icon: "🥐", url: "https://cookidoo.cz/recipes/recipe/cs/r73433" },
  { id: "s23", cat: "snidane", name: "Smaženka", kcal: 345, icon: "🍳", url: "https://cookidoo.cz/recipes/recipe/cs/r251729" },
  { id: "s24", cat: "snidane", name: "Jablečná tvarohová pěna", kcal: 210, icon: "🍎", url: "https://cookidoo.cz/recipes/recipe/cs/r87140" },
  { id: "s25", cat: "snidane", name: "Fit tvarohová pěna", kcal: 180, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r120616" },
  { id: "s26", cat: "snidane", name: "Tvarohový krém - Termix", kcal: 230, icon: "🍮", url: "https://cookidoo.cz/recipes/recipe/cs/r52479" },
  { id: "s27", cat: "snidane", name: "Ovocná dobrota se sýrem cottage", kcal: 190, icon: "🍓", url: "https://cookidoo.cz/recipes/recipe/cs/r87147" },
  { id: "s28", cat: "snidane", name: "Nadýchaná omeleta s krabími tyčinkami", kcal: 250, icon: "🍳", url: "https://cookidoo.cz/recipes/recipe/cs/r69978" },
  { id: "s29", cat: "snidane", name: "Cuketová omeleta s našlehanými bílky", kcal: 180, icon: "🥒", url: "https://cookidoo.cz/recipes/recipe/cs/r809701" },
  { id: "s30", cat: "snidane", name: "Omeleta s parmazánem", kcal: 260, icon: "🧀", url: "https://cookidoo.cz/recipes/recipe/cs/r63178" },
  { id: "s31", cat: "snidane", name: "Pražská omeleta", kcal: 280, icon: "🍳", url: "https://cookidoo.cz/recipes/recipe/cs/r343566" },
  { id: "s32", cat: "snidane", name: "Obláčková pečená vejce", kcal: 200, icon: "🥚", url: "https://cookidoo.cz/recipes/recipe/cs/r900273" },
  { id: "s33", cat: "snidane", name: "Domácí bulky", kcal: 157, icon: "🥖", url: "https://cookidoo.cz/recipes/recipe/cs/r87116" },
  { id: "s34", cat: "snidane", name: "Loupáky s mákem", kcal: 251, icon: "🥐", url: "https://cookidoo.cz/recipes/recipe/cs/r73429" },
  { id: "s35", cat: "snidane", name: "Vrstvený chléb s bazalkovým pestem", kcal: 367, icon: "🍞", url: "https://cookidoo.cz/recipes/recipe/cs/r667070" },
  { id: "s36", cat: "snidane", name: "Coffee Protein Recovery Shake", kcal: 393, icon: "☕", url: "https://cookidoo.cz/recipes/recipe/cs/r332734" },
  { id: "s37", cat: "snidane", name: "Domácí proteinový chlebík", kcal: 220, icon: "🍞", url: "https://cookidoo.cz/recipes/recipe/cs/r347159" },
  { id: "s38", cat: "snidane", name: "Palačinky s tvarohem", kcal: 320, icon: "🥞", url: "https://cookidoo.cz/recipes/recipe/cs/r52523" },
  { id: "s39", cat: "snidane", name: "Palačinky (Crêpes)", kcal: 280, icon: "🥞", url: "https://cookidoo.cz/recipes/recipe/cs/r54963" },
  { id: "s40", cat: "snidane", name: "Banánové lívance s malinami", kcal: 260, icon: "🍌", url: "https://cookidoo.cz/recipes/recipe/cs/r347156" },
  { id: "s41", cat: "snidane", name: "Celozrnné croissanty", kcal: 244, icon: "🥐", url: "https://cookidoo.cz/recipes/recipe/cs/r805591" },
  { id: "s42", cat: "snidane", name: "Jáhlová kaše s jablky a hruškami", kcal: 381, icon: "🍎", url: "https://cookidoo.cz/recipes/recipe/cs/r908166" },
  { id: "s43", cat: "snidane", name: "Jáhlová kaše s domácím arašídovým máslem", kcal: 300, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r133952" },
  { id: "s44", cat: "snidane", name: "Jáhlovo-maková kaše", kcal: 310, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r346630" },
  { id: "s45", cat: "snidane", name: "Quinoová kaše s kokosem a praženými mandlemi", kcal: 340, icon: "🥥", url: "https://cookidoo.cz/recipes/recipe/cs/r145260" },

  // OBĚD
  { id: "o1", cat: "obed", name: "Kuřecí prsa v jogurtové omáčce s bramborami", kcal: 375, icon: "🍗", url: "https://cookidoo.cz/recipes/recipe/cs/r67384" },
  { id: "o2", cat: "obed", name: "Kuře po asijsku s rýží a zeleninou", kcal: 560, icon: "🍚", url: "https://cookidoo.cz/recipes/recipe/cs/r113021" },
  { id: "o3", cat: "obed", name: "Hovězí guláš s kulatými houskovými knedlíky", kcal: 554, icon: "🍲", url: "https://cookidoo.cz/recipes/recipe/cs/r134686" },
  { id: "o4", cat: "obed", name: "Klasický maďarský guláš", kcal: 420, icon: "🥘", url: "https://cookidoo.cz/recipes/recipe/cs/r134656" },
  { id: "o5", cat: "obed", name: "Losos s bramborami, brokolicí a koprovou omáčkou", kcal: 520, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r815752" },
  { id: "o6", cat: "obed", name: "Losos se zeleninou a kuskusem", kcal: 393, icon: "🥗", url: "https://cookidoo.cz/recipes/recipe/cs/r154943" },
  { id: "o7", cat: "obed", name: "Krůtí špíz s rýží a zeleninovou omáčkou", kcal: 480, icon: "🍢", url: "https://cookidoo.cz/recipes/recipe/cs/r69952" },
  { id: "o8", cat: "obed", name: "Kuřecí se zeleninou, rýží a teriyaki omáčkou v páře", kcal: 540, icon: "🥦", url: "https://cookidoo.cz/recipes/recipe/cs/r302491" },
  { id: "o9", cat: "obed", name: "Kuřecí stew s kroupami", kcal: 480, icon: "🍲", url: "https://cookidoo.cz/recipes/recipe/cs/r798670" },
  { id: "o10", cat: "obed", name: "Lososovo-hořčičná omáčka s koprem na těstoviny", kcal: 560, icon: "🍝", url: "https://cookidoo.cz/recipes/recipe/cs/r178111" },
  { id: "o11", cat: "obed", name: "Kuřecí salát se špaldou", kcal: 430, icon: "🥗", url: "https://cookidoo.cz/recipes/recipe/cs/r759521" },
  { id: "o12", cat: "obed", name: "Hovězí kofty s fetou", kcal: 470, icon: "🧆", url: "https://cookidoo.cz/recipes/recipe/cs/r659069" },
  { id: "o13", cat: "obed", name: "Losos s pórkem a bylinkami", kcal: 410, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r91956" },
  { id: "o14", cat: "obed", name: "Mleté hovězí maso s paprikou a bramborami", kcal: 520, icon: "🥘", url: "https://cookidoo.cz/recipes/recipe/cs/r142952" },
  { id: "o15", cat: "obed", name: "Žlutá rýže s kuřetem", kcal: 600, icon: "🍛", url: "https://cookidoo.cz/recipes/recipe/cs/r115309" },
  { id: "o16", cat: "obed", name: "Kuřecí kousky s paprikami a rýží", kcal: 502, icon: "🍚", url: "https://cookidoo.cz/recipes/recipe/cs/r496504" },
  { id: "o17", cat: "obed", name: "Kuřecí kousky s rýží, omáčkou a zeleninou na páře", kcal: 668, icon: "🍚", url: "https://cookidoo.cz/recipes/recipe/cs/r932733" },
  { id: "o18", cat: "obed", name: "Kuřecí kousky s mandlemi a rýží", kcal: 574, icon: "🍚", url: "https://cookidoo.cz/recipes/recipe/cs/r67383" },
  { id: "o19", cat: "obed", name: "Sladkokyselé kuře s rýží", kcal: 585, icon: "🍚", url: "https://cookidoo.cz/recipes/recipe/cs/r129452" },
  { id: "o20", cat: "obed", name: "Kuřecí ragú se špenátovou rýží", kcal: 767, icon: "🍛", url: "https://cookidoo.cz/recipes/recipe/cs/r115310" },
  { id: "o21", cat: "obed", name: "Kotleta s hříbky a rýží", kcal: 896, icon: "🍖", url: "https://cookidoo.cz/recipes/recipe/cs/r67389" },
  { id: "o22", cat: "obed", name: "Lečo", kcal: 635, icon: "🫑", url: "https://cookidoo.cz/recipes/recipe/cs/r777735" },
  { id: "o23", cat: "obed", name: "Rizoto s paprikami a tuňákem", kcal: 524, icon: "🍚", url: "https://cookidoo.cz/recipes/recipe/cs/r139565" },
  { id: "o24", cat: "obed", name: "Rajčatové rizoto s kuřecími prsy plněnými citrónem a ricottou", kcal: 569, icon: "🍅", url: "https://cookidoo.cz/recipes/recipe/cs/r244776" },
  { id: "o25", cat: "obed", name: "Rizoto s uzeným sýrem", kcal: 631, icon: "🧀", url: "https://cookidoo.cz/recipes/recipe/cs/r139561" },
  { id: "o26", cat: "obed", name: "Rizoto se zeleninou a mletým masem", kcal: 778, icon: "🍚", url: "https://cookidoo.cz/recipes/recipe/cs/r67376" },
  { id: "o27", cat: "obed", name: "Smetanové rizoto s modrým sýrem a ořechy", kcal: 453, icon: "🧀", url: "https://cookidoo.cz/recipes/recipe/cs/r81194" },
  { id: "o28", cat: "obed", name: "Houbové rizoto", kcal: 559, icon: "🍄", url: "https://cookidoo.cz/recipes/recipe/cs/r771384" },
  { id: "o29", cat: "obed", name: "Ratatouille s těstovinami - z jednoho hrnce", kcal: 444, icon: "🍝", url: "https://cookidoo.cz/recipes/recipe/cs/r604743" },
  { id: "o30", cat: "obed", name: "Rizoto s parmazánem", kcal: 480, icon: "🧀", url: "https://cookidoo.cz/recipes/recipe/cs/r55042" },
  { id: "o31", cat: "obed", name: "Fazole gigantes v rajčatové omáčce", kcal: 276, icon: "🫘", url: "https://cookidoo.cz/recipes/recipe/cs/r748331" },
  { id: "o32", cat: "obed", name: "Quinoa salát s cizrnou a mangovou salsou", kcal: 380, icon: "🥗", url: "https://cookidoo.cz/recipes/recipe/cs/r145261" },
  { id: "o33", cat: "obed", name: "Zapečené brambory s lososem a koprem", kcal: 611, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r695896" },
  { id: "o34", cat: "obed", name: "Kuřecí plátky na středomořský způsob s bramborovo-květákovou kaší", kcal: 367, icon: "🍗", url: "https://cookidoo.cz/recipes/recipe/cs/r364995" },
  { id: "o35", cat: "obed", name: "Okurkový salát s mortadellou", kcal: 220, icon: "🥒", url: "https://cookidoo.cz/recipes/recipe/cs/r606697" },
  { id: "o36", cat: "obed", name: "Vepřová panenka s omáčkou z červeného vína", kcal: 250, icon: "🍷", url: "https://cookidoo.cz/recipes/recipe/cs/r151406" },
  { id: "o37", cat: "obed", name: "Kuřecí frikasé se zeleninovou směsí", kcal: 417, icon: "🍗", url: "https://cookidoo.cz/recipes/recipe/cs/r91842" },
  { id: "o38", cat: "obed", name: "Krůtí kuličky se špenátem", kcal: 315, icon: "🍃", url: "https://cookidoo.cz/recipes/recipe/cs/r132314" },
  { id: "o39", cat: "obed", name: "Vepřové závitky s rýží", kcal: 558, icon: "🍚", url: "https://cookidoo.cz/recipes/recipe/cs/r67387" },
  { id: "o40", cat: "obed", name: "Gulášová polévka", kcal: 246, icon: "🍲", url: "https://cookidoo.cz/recipes/recipe/cs/r52546" },
  { id: "o41", cat: "obed", name: "Jemný segedínský guláš s knedlíkem", kcal: 915, icon: "🥘", url: "https://cookidoo.cz/recipes/recipe/cs/r134693" },
  { id: "o42", cat: "obed", name: "Kuře a lá svíčková s knedlíkem", kcal: 987, icon: "🍛", url: "https://cookidoo.cz/recipes/recipe/cs/r58108" },
  { id: "o43", cat: "obed", name: "Holandský řízek s bramborovo-brokolicovým pyré", kcal: 944, icon: "🍗", url: "https://cookidoo.cz/recipes/recipe/cs/r123123" },
  { id: "o44", cat: "obed", name: "Plněné papriky s rajskou omáčkou", kcal: 717, icon: "🫑", url: "https://cookidoo.cz/recipes/recipe/cs/r52508" },
  { id: "o45", cat: "obed", name: "Masové kuličky s rajskou omáčkou", kcal: 359, icon: "🍅", url: "https://cookidoo.cz/recipes/recipe/cs/r55041" },
  { id: "o46", cat: "obed", name: "Kuřecí nugety s okurkovým dipem", kcal: 380, icon: "🍗", url: "https://cookidoo.cz/recipes/recipe/cs/r91831" },
  { id: "o47", cat: "obed", name: "Treska v alobalu s mrkvovými nudlemi", kcal: 357, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r69944" },
  { id: "o48", cat: "obed", name: "Treska s bramborovo-dýňovou krustou a vinnou omáčkou", kcal: 355, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r608418" },
  { id: "o49", cat: "obed", name: "Gnocchi s lososem a hráškem", kcal: 917, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r133977" },
  { id: "o50", cat: "obed", name: "Losos v balíčku se sušenými rajčaty a kuskusem", kcal: 460, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r132024" },
  { id: "o51", cat: "obed", name: "Treska se zeleninou a rýží vařená v páře", kcal: 380, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r73540" },
  { id: "o52", cat: "obed", name: "Ryba po řecku", kcal: 340, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r52561" },
  { id: "o53", cat: "obed", name: "Krevetová polévka s chorizem a bramborami", kcal: 490, icon: "🍤", url: "https://cookidoo.cz/recipes/recipe/cs/r752527" },
  { id: "o54", cat: "obed", name: "Sicilský krevetový salát", kcal: 187, icon: "🍤", url: "https://cookidoo.cz/recipes/recipe/cs/r151279" },
  { id: "o55", cat: "obed", name: "Rizoto s mořskými plody a chorizem", kcal: 377, icon: "🦐", url: "https://cookidoo.cz/recipes/recipe/cs/r151396" },
  { id: "o56", cat: "obed", name: "Teplý kuřecí salát se sýrem", kcal: 380, icon: "🥗", url: "https://cookidoo.cz/recipes/recipe/cs/r70403" },
  { id: "o57", cat: "obed", name: "Caesar salát s kuřecím masem", kcal: 420, icon: "🥗", url: "https://cookidoo.cz/recipes/recipe/cs/r615607" },
  { id: "o58", cat: "obed", name: "Zeleninové kari s rýží", kcal: 411, icon: "🍛", url: "https://cookidoo.cz/recipes/recipe/cs/r120613" },
  { id: "o59", cat: "obed", name: "Zelenina s kokosovým mlékem a kari s rýží", kcal: 416, icon: "🥥", url: "https://cookidoo.cz/recipes/recipe/cs/r97932" },
  { id: "o60", cat: "obed", name: "Falafel", kcal: 380, icon: "🧆", url: "https://cookidoo.cz/recipes/recipe/cs/r76808" },
  { id: "o61", cat: "obed", name: "Pomalu vařený krémový dahl s pečeným květákem", kcal: 603, icon: "🍛", url: "https://cookidoo.cz/recipes/recipe/cs/r544687" },
  { id: "o62", cat: "obed", name: "Pad thai", kcal: 406, icon: "🍜", url: "https://cookidoo.cz/recipes/recipe/cs/r918138" },
  { id: "o63", cat: "obed", name: "Thajské nudle s červeným kari a paprikami", kcal: 420, icon: "🌶️", url: "https://cookidoo.cz/recipes/recipe/cs/r142068" },
  { id: "o64", cat: "obed", name: "Buddha bowl s kuřecím masem", kcal: 800, icon: "🥙", url: "https://cookidoo.cz/recipes/recipe/cs/r786698" },
  { id: "o65", cat: "obed", name: "Kari nudle s vepřovým masem", kcal: 456, icon: "🍜", url: "https://cookidoo.cz/recipes/recipe/cs/r496241" },
  { id: "o66", cat: "obed", name: "Tagliatelle s hříbky a karamelizovanými rajčaty", kcal: 843, icon: "🍝", url: "https://cookidoo.cz/recipes/recipe/cs/r325139" },
  { id: "o67", cat: "obed", name: "Salát z nových brambor s uzeným pstruhem", kcal: 643, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r133728" },
  { id: "o68", cat: "obed", name: "Kuřecí kousky s teplým bramborovým salátem", kcal: 473, icon: "🥔", url: "https://cookidoo.cz/recipes/recipe/cs/r151397" },
  { id: "o69", cat: "obed", name: "Pekingské kuře", kcal: 434, icon: "🍗", url: "https://cookidoo.cz/recipes/recipe/cs/r105688" },
  { id: "o70", cat: "obed", name: "Grilované vepřové špízy s kurkumou", kcal: 127, icon: "🍢", url: "https://cookidoo.cz/recipes/recipe/cs/r150775" },
  { id: "o71", cat: "obed", name: "Zeleninový salát s kuřecími prsy a hořčičným dresinkem", kcal: 361, icon: "🥗", url: "https://cookidoo.cz/recipes/recipe/cs/r234911" },
  { id: "o72", cat: "obed", name: "Kuřecí chilli salát s citrusy", kcal: 320, icon: "🌶️", url: "https://cookidoo.cz/recipes/recipe/cs/r70404" },
  { id: "o73", cat: "obed", name: "Salát s trhaným kuřecím masem, batáty a brusinkovým dresinkem", kcal: 420, icon: "🍠", url: "https://cookidoo.cz/recipes/recipe/cs/r143490" },
  { id: "o74", cat: "obed", name: "Marocká kuřecí stehna", kcal: 480, icon: "🍗", url: "https://cookidoo.cz/recipes/recipe/cs/r757967" },
  { id: "o75", cat: "obed", name: "Šťavnatý kořeněný jehněčí guláš s kumquatem", kcal: 639, icon: "🍲", url: "https://cookidoo.cz/recipes/recipe/cs/r513475" },
  { id: "o76", cat: "obed", name: "Kachna s vaječnými nudlemi a zeleninou", kcal: 486, icon: "🦆", url: "https://cookidoo.cz/recipes/recipe/cs/r67391" },
  { id: "o77", cat: "obed", name: "Kachna 5 vůní s houbami, asijskou zeleninou a rýží", kcal: 550, icon: "🦆", url: "https://cookidoo.cz/recipes/recipe/cs/r151404" },
  { id: "o78", cat: "obed", name: "Treska v páře s italskou rajčatovou omáčkou a dušenými bramborami", kcal: 380, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r775903" },
  { id: "o79", cat: "obed", name: "Losos s krémovou koprovou omáčkou a basmati rýží", kcal: 520, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r132023" },
  { id: "o80", cat: "obed", name: "Krůtí plátky na houbách", kcal: 307, icon: "🍄", url: "https://cookidoo.cz/recipes/recipe/cs/r144166" },
  { id: "o81", cat: "obed", name: "Krůtí stehno se slaninou a bramborami", kcal: 381, icon: "🍗", url: "https://cookidoo.cz/recipes/recipe/cs/r98612" },
  { id: "o82", cat: "obed", name: "Pomalu vařené krémové krůtí s houbami", kcal: 574, icon: "🍄", url: "https://cookidoo.cz/recipes/recipe/cs/r623525" },
  { id: "o83", cat: "obed", name: "Kuřecí špízy s kmínovou rýží a teplým zeleninovým salátem", kcal: 431, icon: "🍢", url: "https://cookidoo.cz/recipes/recipe/cs/r151400" },
  { id: "o84", cat: "obed", name: "Horní kuřecí stehna pečená na zelí", kcal: 689, icon: "🍗", url: "https://cookidoo.cz/recipes/recipe/cs/r902162" },
  { id: "o85", cat: "obed", name: "Boloňské špagety", kcal: 796, icon: "🍝", url: "https://cookidoo.cz/recipes/recipe/cs/r70511" },
  { id: "o86", cat: "obed", name: "Těstoviny á la Carbonara pro dva", kcal: 626, icon: "🍝", url: "https://cookidoo.cz/recipes/recipe/cs/r116719" },
  { id: "o87", cat: "obed", name: "Langoše", kcal: 214, icon: "🫓", url: "https://cookidoo.cz/recipes/recipe/cs/r80408" },
  { id: "o88", cat: "obed", name: "Špagety Carbonara", kcal: 650, icon: "🍝", url: "https://cookidoo.cz/recipes/recipe/cs/r130855" },
  { id: "o89", cat: "obed", name: "Hovězí steaky v papilotě", kcal: 450, icon: "🥩", url: "https://cookidoo.cz/recipes/recipe/cs/r91967" },
  { id: "o90", cat: "obed", name: "Thajský nudlový salát s hovězím masem", kcal: 380, icon: "🥗", url: "https://cookidoo.cz/recipes/recipe/cs/r78350" },
  { id: "o91", cat: "obed", name: "Fazolový burger (veganský)", kcal: 320, icon: "🍔", url: "https://cookidoo.cz/recipes/recipe/cs/r126156" },
  { id: "o92", cat: "obed", name: "Špagety s rajčaty a slaninou", kcal: 550, icon: "🍝", url: "https://cookidoo.cz/recipes/recipe/cs/r121276" },
  { id: "o93", cat: "obed", name: "Penne se slaninou a zeleninou", kcal: 480, icon: "🍝", url: "https://cookidoo.cz/recipes/recipe/cs/r625136" },
  { id: "o94", cat: "obed", name: "Restované kuřecí proužky se slaninou", kcal: 320, icon: "🍗", url: "https://cookidoo.cz/recipes/recipe/cs/r543932" },
  { id: "o95", cat: "obed", name: "Ryba s bramborami a rajčatovou omáčkou", kcal: 380, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r55023" },
  { id: "o96", cat: "obed", name: "Ryba s bylinkovo-sýrovou krustou, bramborami a květákem", kcal: 400, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r147531" },
  { id: "o97", cat: "obed", name: "Vepřové maso na česneku se zeleninou a bramborami", kcal: 480, icon: "🧄", url: "https://cookidoo.cz/recipes/recipe/cs/r67388" },
  { id: "o98", cat: "obed", name: "Marinované filety z bílé ryby s omáčkou chermoula a kuskusovým salátem", kcal: 420, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r170888" },
  { id: "o99", cat: "obed", name: "Vejce na páře á la flamenca", kcal: 377, icon: "🥚", url: "https://cookidoo.cz/recipes/recipe/cs/r116718" },

  // VEČEŘE
  { id: "v1", cat: "vecere", name: "Losos s bramborovou kaší", kcal: 221, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r87071" },
  { id: "v2", cat: "vecere", name: "Krémová zeleninová polévka", kcal: 90, icon: "🍵", url: "https://cookidoo.cz/recipes/recipe/cs/r55011" },
  { id: "v3", cat: "vecere", name: "Bílá zelná polévka se šťouchanými brambory", kcal: 192, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r72362" },
  { id: "v4", cat: "vecere", name: "Zeleninová polévka s těstovinami", kcal: 160, icon: "🍝", url: "https://cookidoo.cz/recipes/recipe/cs/r418225" },
  { id: "v5", cat: "vecere", name: "Čočková polévka s rajčaty", kcal: 254, icon: "🍅", url: "https://cookidoo.cz/recipes/recipe/cs/r86542" },
  { id: "v6", cat: "vecere", name: "Krémová polévka z červené čočky", kcal: 272, icon: "🥕", url: "https://cookidoo.cz/recipes/recipe/cs/r785604" },
  { id: "v7", cat: "vecere", name: "Bramborová kaše s medvědím česnekem a hořčičným máslem", kcal: 498, icon: "🧈", url: "https://cookidoo.cz/recipes/recipe/cs/r725086" },
  { id: "v8", cat: "vecere", name: "Bramborovo-dýňová kaše", kcal: 312, icon: "🎃", url: "https://cookidoo.cz/recipes/recipe/cs/r265473" },
  { id: "v9", cat: "vecere", name: "Čočková polévka", kcal: 240, icon: "🍲", url: "https://cookidoo.cz/recipes/recipe/cs/r52548" },
  { id: "v10", cat: "vecere", name: "Česneková polévka", kcal: 150, icon: "🧄", url: "https://cookidoo.cz/recipes/recipe/cs/r770141" },
  { id: "v11", cat: "vecere", name: "Cuketová krémová polévka", kcal: 130, icon: "🥒", url: "https://cookidoo.cz/recipes/recipe/cs/r55010" },
  { id: "v12", cat: "vecere", name: "Pomalu vařená kuřecí polévka pho", kcal: 320, icon: "🍜", url: "https://cookidoo.cz/recipes/recipe/cs/r543944" },
  { id: "v13", cat: "vecere", name: "Polévka z bílých fazolí", kcal: 210, icon: "🍲", url: "https://cookidoo.cz/recipes/recipe/cs/r136078" },
  { id: "v14", cat: "vecere", name: "Polévka z červené řepy", kcal: 140, icon: "🍠", url: "https://cookidoo.cz/recipes/recipe/cs/r72369" },
  { id: "v15", cat: "vecere", name: "Zeleninová polévka s kuřecími prsy a vejci", kcal: 280, icon: "🥚", url: "https://cookidoo.cz/recipes/recipe/cs/r63077" },
  { id: "v16", cat: "vecere", name: "Polévka z ředkvičkových listů", kcal: 110, icon: "🥬", url: "https://cookidoo.cz/recipes/recipe/cs/r336921" },
  { id: "v17", cat: "vecere", name: "Zelňačka", kcal: 161, icon: "🥬", url: "https://cookidoo.cz/recipes/recipe/cs/r777702" },
  { id: "v18", cat: "vecere", name: "Frittata s batáty, cuketou a kozím sýrem", kcal: 330, icon: "🍳", url: "https://cookidoo.cz/recipes/recipe/cs/r142064" },
  { id: "v19", cat: "vecere", name: "Polévka Tom Yum", kcal: 90, icon: "🍜", url: "https://cookidoo.cz/recipes/recipe/cs/r150774" },
  { id: "v20", cat: "vecere", name: "Celerová polévka se zakysanou smetanou", kcal: 140, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r98089" },
  { id: "v21", cat: "vecere", name: "Salát s mangem, červenou čekankou a quinoou", kcal: 334, icon: "🥗", url: "https://cookidoo.cz/recipes/recipe/cs/r154938" },
  { id: "v22", cat: "vecere", name: "Okurkový salát", kcal: 60, icon: "🥒", url: "https://cookidoo.cz/recipes/recipe/cs/r52531" },
  { id: "v23", cat: "vecere", name: "Šopský salát", kcal: 180, icon: "🍅", url: "https://cookidoo.cz/recipes/recipe/cs/r52530" },
  { id: "v24", cat: "vecere", name: "Kuřecí kari salát", kcal: 320, icon: "🍛", url: "https://cookidoo.cz/recipes/recipe/cs/r78351" },
  { id: "v25", cat: "vecere", name: "Kuřecí salát s těstovinami", kcal: 420, icon: "🍝", url: "https://cookidoo.cz/recipes/recipe/cs/r78347" },
  { id: "v26", cat: "vecere", name: "Čočka na kyselo", kcal: 220, icon: "🍲", url: "https://cookidoo.cz/recipes/recipe/cs/r52527" },
  { id: "v27", cat: "vecere", name: "Zapečené brambory s kysaným zelím a uzeným masem", kcal: 491, icon: "🥘", url: "https://cookidoo.cz/recipes/recipe/cs/r117478" },
  { id: "v28", cat: "vecere", name: "Brokolice s bramborami a sýrovou omáčkou", kcal: 430, icon: "🥦", url: "https://cookidoo.cz/recipes/recipe/cs/r52528" },
  { id: "v29", cat: "vecere", name: "Smetanové brambory se špenátem", kcal: 444, icon: "🥔", url: "https://cookidoo.cz/recipes/recipe/cs/r97922" },
  { id: "v30", cat: "vecere", name: "Gratinovaný květák", kcal: 305, icon: "🥬", url: "https://cookidoo.cz/recipes/recipe/cs/r55008" },
  { id: "v31", cat: "vecere", name: "Čočkový salát", kcal: 280, icon: "🥗", url: "https://cookidoo.cz/recipes/recipe/cs/r764054" },
  { id: "v32", cat: "vecere", name: "Čočkový salát s rajčaty a fetou", kcal: 340, icon: "🍅", url: "https://cookidoo.cz/recipes/recipe/cs/r615606" },
  { id: "v33", cat: "vecere", name: "Okurkový salát s koprem a dresinkem ze zakysané smetany", kcal: 90, icon: "🥒", url: "https://cookidoo.cz/recipes/recipe/cs/r786695" },
  { id: "v34", cat: "vecere", name: "Mrkvové karbanátky se sezamem", kcal: 169, icon: "🥕", url: "https://cookidoo.cz/recipes/recipe/cs/r87133" },
  { id: "v35", cat: "vecere", name: "Zeleninové placky z plechu", kcal: 146, icon: "🥬", url: "https://cookidoo.cz/recipes/recipe/cs/r341537" },
  { id: "v36", cat: "vecere", name: "Fazolový salát s quinoou a sýrem", kcal: 148, icon: "🫘", url: "https://cookidoo.cz/recipes/recipe/cs/r119786" },
  { id: "v37", cat: "vecere", name: "Křehký koláč s tuňákem, čerstvým sýrem a rajčaty", kcal: 279, icon: "🥧", url: "https://cookidoo.cz/recipes/recipe/cs/r91889" },
  { id: "v38", cat: "vecere", name: "Čočkové biftečky s mrkví", kcal: 441, icon: "🥕", url: "https://cookidoo.cz/recipes/recipe/cs/r76803" },
  { id: "v39", cat: "vecere", name: "Noky s kyselým zelím", kcal: 476, icon: "🥟", url: "https://cookidoo.cz/recipes/recipe/cs/r364996" },
  { id: "v40", cat: "vecere", name: "Dýňová polévka se smetanou", kcal: 101, icon: "🎃", url: "https://cookidoo.cz/recipes/recipe/cs/r594505" },
  { id: "v41", cat: "vecere", name: "Vánoční houbová polévka s nudlemi", kcal: 135, icon: "🍄", url: "https://cookidoo.cz/recipes/recipe/cs/r594501" },
  { id: "v42", cat: "vecere", name: "Čočkovo-dýňová polévka", kcal: 329, icon: "🎃", url: "https://cookidoo.cz/recipes/recipe/cs/r263673" },
  { id: "v43", cat: "vecere", name: "Dýňová polévka", kcal: 150, icon: "🎃", url: "https://cookidoo.cz/recipes/recipe/cs/r82858" },
  { id: "v44", cat: "vecere", name: "Dýňová polévka s kokosovým mlékem a mozarellou", kcal: 220, icon: "🥥", url: "https://cookidoo.cz/recipes/recipe/cs/r764051" },
  { id: "v45", cat: "vecere", name: "Lišková polévka", kcal: 160, icon: "🍄", url: "https://cookidoo.cz/recipes/recipe/cs/r91873" },
  { id: "v46", cat: "vecere", name: "Listové těsto plněné špenátem a sýrem", kcal: 148, icon: "🥬", url: "https://cookidoo.cz/recipes/recipe/cs/r87125" },
  { id: "v47", cat: "vecere", name: "Zapečené brambory se žampióny a sýrem camembert", kcal: 211, icon: "🍄", url: "https://cookidoo.cz/recipes/recipe/cs/r695897" },
  { id: "v48", cat: "vecere", name: "Špenátový salát s ředkvičkami a zakysanou smetanou", kcal: 154, icon: "🥗", url: "https://cookidoo.cz/recipes/recipe/cs/r234908" },
  { id: "v49", cat: "vecere", name: "Žampióny plněné listovým špenátem", kcal: 128, icon: "🍄", url: "https://cookidoo.cz/recipes/recipe/cs/r436126" },
  { id: "v50", cat: "vecere", name: "Špenátový quiche se žampióny", kcal: 255, icon: "🥧", url: "https://cookidoo.cz/recipes/recipe/cs/r761197" },
  { id: "v51", cat: "vecere", name: "Soté se žampiony, cuketou a sušenou šunkou", kcal: 151, icon: "🍄", url: "https://cookidoo.cz/recipes/recipe/cs/r120818" },
  { id: "v52", cat: "vecere", name: "Variace na vlašský salát", kcal: 350, icon: "🥗", url: "https://cookidoo.cz/recipes/recipe/cs/r70155" },
  { id: "v53", cat: "vecere", name: "Kari s lilkem, špenátem a čočkou", kcal: 175, icon: "🍛", url: "https://cookidoo.cz/recipes/recipe/cs/r142065" },
  { id: "v54", cat: "vecere", name: "Čočková polévka s rajčaty", kcal: 254, icon: "🍅", url: "https://cookidoo.cz/recipes/recipe/cs/r86542" },
  { id: "v55", cat: "vecere", name: "Minestrone", kcal: 264, icon: "🍲", url: "https://cookidoo.cz/recipes/recipe/cs/r770116" },
  { id: "v56", cat: "vecere", name: "Zeleninovo-bramborový salát s kuřecím masem a bylinkovou smetanou", kcal: 192, icon: "🥗", url: "https://cookidoo.cz/recipes/recipe/cs/r151278" },
  { id: "v57", cat: "vecere", name: "Miso-jogurtový bramborový salát", kcal: 209, icon: "🥔", url: "https://cookidoo.cz/recipes/recipe/cs/r900277" },
  { id: "v58", cat: "vecere", name: "Bramborový salát s červenou řepou", kcal: 470, icon: "🍠", url: "https://cookidoo.cz/recipes/recipe/cs/r82206" },
  { id: "v59", cat: "vecere", name: "Bavorský bramborový salát", kcal: 230, icon: "🥔", url: "https://cookidoo.cz/recipes/recipe/cs/r118200" },
  { id: "v60", cat: "vecere", name: "Plněné nové brambory s rozmarýnem", kcal: 209, icon: "🥔", url: "https://cookidoo.cz/recipes/recipe/cs/r177825" },
  { id: "v61", cat: "vecere", name: "Boršč aneb červená polévka", kcal: 180, icon: "🍠", url: "https://cookidoo.cz/recipes/recipe/cs/r709328" },
  { id: "v62", cat: "vecere", name: "Bílá zelná polévka se šťouchanými brambory", kcal: 220, icon: "🥬", url: "https://cookidoo.cz/recipes/recipe/cs/r72362" },
  { id: "v63", cat: "vecere", name: "Dršťková polévka", kcal: 200, icon: "🍲", url: "https://cookidoo.cz/recipes/recipe/cs/r122401" },
  { id: "v64", cat: "vecere", name: "Dušená treska s tymiánem a citrónem", kcal: 320, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r146434" },
  { id: "v65", cat: "vecere", name: "Treska s cibulovo-balzamikovým přelivem", kcal: 300, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r144139" },
  { id: "v66", cat: "vecere", name: "Gratinovaná treska se špenátem s mrkvovo-cuketovou omáčkou", kcal: 350, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r721042" },
  { id: "v67", cat: "vecere", name: "Jemná celerová polévka s ovesnými vločkami", kcal: 190, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r116085" },
  { id: "v68", cat: "vecere", name: "Celerovo-bramborová polévka s bylinkovými knedlíčky", kcal: 240, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r364990" },
  { id: "v69", cat: "vecere", name: "Cuketový krém s modrým sýrem", kcal: 210, icon: "🥒", url: "https://cookidoo.cz/recipes/recipe/cs/r249363" },
  { id: "v70", cat: "vecere", name: "Pórkový krém", kcal: 180, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r782827" },
  { id: "v71", cat: "vecere", name: "Polévka z červené řepy s bylinkovými knedlíčky", kcal: 230, icon: "🍠", url: "https://cookidoo.cz/recipes/recipe/cs/r151389" },
  { id: "v72", cat: "vecere", name: "Polévka z kopřiv", kcal: 150, icon: "🌿", url: "https://cookidoo.cz/recipes/recipe/cs/r726743" },
  { id: "v73", cat: "vecere", name: "Polévka z batátů s rybími kousky", kcal: 280, icon: "🐟", url: "https://cookidoo.cz/recipes/recipe/cs/r127896" },
  { id: "v74", cat: "vecere", name: "Vegetariánské karbanátky", kcal: 210, icon: "🥕", url: "https://cookidoo.cz/recipes/recipe/cs/r908850" },
  { id: "v75", cat: "vecere", name: "Cizrnové karbanátky", kcal: 220, icon: "🫘", url: "https://cookidoo.cz/recipes/recipe/cs/r76807" },
  { id: "v76", cat: "vecere", name: "Kapustové karbanátky", kcal: 190, icon: "🥬", url: "https://cookidoo.cz/recipes/recipe/cs/r70174" },
  { id: "v77", cat: "vecere", name: "Fazolové placičky", kcal: 200, icon: "🫘", url: "https://cookidoo.cz/recipes/recipe/cs/r76799" },

  // SVAČINY
  { id: "sv1", cat: "svacina", name: "Jahodovo-jogurtové smoothie s chia semínky", kcal: 87, icon: "🍓", url: "https://cookidoo.cz/recipes/recipe/cs/r177507" },
  { id: "sv2", cat: "svacina", name: "Kokosový jogurt (veganský)", kcal: 190, icon: "🥥", url: "https://cookidoo.cz/recipes/recipe/cs/r539672" },
  { id: "sv3", cat: "svacina", name: "Studená okurková polévka s bílým jogurtem a avokádem", kcal: 191, icon: "🥒", url: "https://cookidoo.cz/recipes/recipe/cs/r177503" },
  { id: "sv4", cat: "svacina", name: "Veganská pěna s banány a avokádem", kcal: 267, icon: "🍌", url: "https://cookidoo.cz/recipes/recipe/cs/r761186" },
  { id: "sv5", cat: "svacina", name: "Domácí jogurt zalitý horkým ovocem", kcal: 191, icon: "🫐", url: "https://cookidoo.cz/recipes/recipe/cs/r122393" },
  { id: "sv6", cat: "svacina", name: "Bramborová kaše (malá porce)", kcal: 200, icon: "🥔", url: "https://cookidoo.cz/recipes/recipe/cs/r770148" },
  { id: "sv7", cat: "svacina", name: "Ovčí jogurt", kcal: 150, icon: "🐑", url: "https://cookidoo.cz/recipes/recipe/cs/r539668" },
  { id: "sv8", cat: "svacina", name: "Bílý a kokosový jogurt", kcal: 180, icon: "🥥", url: "https://cookidoo.cz/recipes/recipe/cs/r6875" },
  { id: "sv9", cat: "svacina", name: "Zeleninové smoothie", kcal: 120, icon: "🥬", url: "https://cookidoo.cz/recipes/recipe/cs/r91854" },
  { id: "sv10", cat: "svacina", name: "Kozí jogurt", kcal: 140, icon: "🐐", url: "https://cookidoo.cz/recipes/recipe/cs/r539669" },
  { id: "sv11", cat: "svacina", name: "Borůvkový jogurt", kcal: 130, icon: "🫐", url: "https://cookidoo.cz/recipes/recipe/cs/r539667" },
  { id: "sv12", cat: "svacina", name: "Řecký jogurt", kcal: 150, icon: "🥛", url: "https://cookidoo.cz/recipes/recipe/cs/r539670" },
  { id: "sv13", cat: "svacina", name: "Ovocný pohár s jogurtem", kcal: 418, icon: "🍨", url: "https://cookidoo.cz/recipes/recipe/cs/r73424" },
  { id: "sv14", cat: "svacina", name: "Tvarohová pomazánka s koprem", kcal: 220, icon: "🧀", url: "https://cookidoo.cz/recipes/recipe/cs/r52557" },
  { id: "sv15", cat: "svacina", name: "Česnekovo sýrová pomazánka", kcal: 240, icon: "🧄", url: "https://cookidoo.cz/recipes/recipe/cs/r52644" },
  { id: "sv16", cat: "svacina", name: "Avokádová pomazánka", kcal: 210, icon: "🥑", url: "https://cookidoo.cz/recipes/recipe/cs/r67020" },
  { id: "sv17", cat: "svacina", name: "Cizrnová pomazánka", kcal: 200, icon: "🫘", url: "https://cookidoo.cz/recipes/recipe/cs/r87099" },
  { id: "sv18", cat: "svacina", name: "Liptovská pomazánka", kcal: 230, icon: "🧀", url: "https://cookidoo.cz/recipes/recipe/cs/r69983" },
  { id: "sv19", cat: "svacina", name: "Energetické tyčinky plné ovoce a ořechů", kcal: 214, icon: "🥜", url: "https://cookidoo.cz/recipes/recipe/cs/r317152" },
  { id: "sv20", cat: "svacina", name: "Sladce pikantní ořechy", kcal: 250, icon: "🥜", url: "https://cookidoo.cz/recipes/recipe/cs/r126317" },
  { id: "sv21", cat: "svacina", name: "Pečené ořechy na sladko", kcal: 260, icon: "🌰", url: "https://cookidoo.cz/recipes/recipe/cs/r81187" },
  { id: "sv22", cat: "svacina", name: "Energy džus", kcal: 110, icon: "🧃", url: "https://cookidoo.cz/recipes/recipe/cs/r91865" },
  { id: "sv23", cat: "svacina", name: "Hermelínová pěna", kcal: 240, icon: "🧀", url: "https://cookidoo.cz/recipes/recipe/cs/r52559" },
  { id: "sv24", cat: "svacina", name: "Čokoládová pěna", kcal: 250, icon: "🍫", url: "https://cookidoo.cz/recipes/recipe/cs/r6863" },
  { id: "sv25", cat: "svacina", name: "Ovocné pyré", kcal: 90, icon: "🍑", url: "https://cookidoo.cz/recipes/recipe/cs/r82716" },
  { id: "sv26", cat: "svacina", name: "Jogurtový dip", kcal: 120, icon: "🥛", url: "https://cookidoo.cz/recipes/recipe/cs/r87130" },
  { id: "sv27", cat: "svacina", name: "Banánovo-jablečný koktejl", kcal: 158, icon: "🍌", url: "https://cookidoo.cz/recipes/recipe/cs/r73539" },
  { id: "sv28", cat: "svacina", name: "Jablečný džus s lávovým efektem", kcal: 119, icon: "🍎", url: "https://cookidoo.cz/recipes/recipe/cs/r91864" },
  { id: "sv29", cat: "svacina", name: "Hruškové smoothie s kiwi a limetkou", kcal: 113, icon: "🍐", url: "https://cookidoo.cz/recipes/recipe/cs/r91866" },
  { id: "sv30", cat: "svacina", name: "Salát z bílého zelí, mrkve a jablka", kcal: 103, icon: "🥕", url: "https://cookidoo.cz/recipes/recipe/cs/r140090" },
  { id: "sv31", cat: "svacina", name: "Zeleninové chipsy pečené v troubě", kcal: 130, icon: "🥔", url: "https://cookidoo.cz/recipes/recipe/cs/r805600" },
  { id: "sv32", cat: "svacina", name: "Máslové sušenky", kcal: 73, icon: "🍪", url: "https://cookidoo.cz/recipes/recipe/cs/r770153" },
  { id: "sv33", cat: "svacina", name: "Topinamburové chipsy", kcal: 140, icon: "🥔", url: "https://cookidoo.cz/recipes/recipe/cs/r361015" },
  { id: "sv34", cat: "svacina", name: "Švestková granola (bez cukru)", kcal: 320, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r541260" },
  { id: "sv35", cat: "svacina", name: "Základní granola", kcal: 350, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r541256" },
  { id: "sv36", cat: "svacina", name: "Low Carb Granola", kcal: 220, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r795074" },
  { id: "sv37", cat: "svacina", name: "Zeleninovo ovocný salát", kcal: 100, icon: "🥗", url: "https://cookidoo.cz/recipes/recipe/cs/r54985" },
  { id: "sv38", cat: "svacina", name: "Jahodový koktejl", kcal: 130, icon: "🍓", url: "https://cookidoo.cz/recipes/recipe/cs/r55005" },
  { id: "sv39", cat: "svacina", name: "Citrusové smoothie s jahodami", kcal: 76, icon: "🍓", url: "https://cookidoo.cz/recipes/recipe/cs/r91863" },
  { id: "sv40", cat: "svacina", name: "Müsli tyčinky se sušenými třešněmi a oříšky", kcal: 200, icon: "🥜", url: "https://cookidoo.cz/recipes/recipe/cs/r754511" },
  { id: "sv41", cat: "svacina", name: "Müsli tyčinky se skořicí", kcal: 190, icon: "🥣", url: "https://cookidoo.cz/recipes/recipe/cs/r251797" },
  { id: "sv42", cat: "svacina", name: "Müsli tyčinky pro sportovní slečinky", kcal: 210, icon: "🥜", url: "https://cookidoo.cz/recipes/recipe/cs/r365266" },
  { id: "sv43", cat: "svacina", name: "Brusinkové kuličky s kešu a mandlemi", kcal: 180, icon: "🍒", url: "https://cookidoo.cz/recipes/recipe/cs/r797676" },
  { id: "sv44", cat: "svacina", name: "Sýrové tyčinky", kcal: 220, icon: "🧀", url: "https://cookidoo.cz/recipes/recipe/cs/r52570" },
  { id: "sv45", cat: "svacina", name: "Brynzové tyčinky", kcal: 230, icon: "🧀", url: "https://cookidoo.cz/recipes/recipe/cs/r567526" },
  { id: "sv46", cat: "svacina", name: "Jablečné cereální tyčinky s arašídy", kcal: 200, icon: "🍎", url: "https://cookidoo.cz/recipes/recipe/cs/r754518" },
].map((r) => ({ ...r, verified: true, custom: false, diet: classifyDiet(r.name) }));

/* ===========================================================
   2) ROZŠÍŘENÁ DATABÁZE — realistické kombinace jídel v duchu
      Cookidoo receptů. Cookidoo nemá veřejné API ani ke stažení
      celou databázi 7000 receptů (velká část je navíc jen pro
      předplatitele), takže tahle část odkazuje na VYHLEDÁVÁNÍ
      daného názvu přímo na cookidoo.cz místo na konkrétní recept.
   =========================================================== */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleDeterministic(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateForCategory({ cat, bases, extras, count, kcalMin, kcalMax, idPrefix, icons, seed }) {
  const rand = mulberry32(seed);
  const combos = [];
  for (const b of bases) {
    for (const e of extras) combos.push(`${b} ${e}`);
  }
  const picked = shuffleDeterministic(combos, rand).slice(0, count);
  return picked.map((name, i) => ({
    id: `${idPrefix}${i}`,
    cat,
    name,
    kcal: Math.round(kcalMin + rand() * (kcalMax - kcalMin)),
    icon: icons[i % icons.length],
    url: `https://cookidoo.cz/search/cs-CZ?q=${encodeURIComponent(name)}`,
    verified: false,
    custom: false,
    diet: classifyDiet(name),
  }));
}

const GENERATED_SNIDANE = generateForCategory({
  cat: "snidane",
  bases: ["Ovesná kaše", "Jogurtová mísa", "Smoothie bowl", "Toast", "Míchaná vejce", "Palačinky", "Lívance", "Tvarohová pomazánka", "Chia pudink", "Müsli s jogurtem", "Vaječná omeleta", "Celozrnná kaše", "Pohanková kaše", "Quinoa kaše", "Vaflové plátky"],
  extras: ["s jahodami", "s borůvkami", "s banánem", "s medem", "se skořicí", "s ořechy", "s mákem", "s hořkou čokoládou", "s jablkem", "s hruškou", "s malinami", "s kokosem", "s mandlemi", "s vanilkou", "s karamelem", "s meruňkami", "se švestkami", "s fíky", "s domácí granolou", "s arašídovým máslem"],
  count: 100,
  kcalMin: 260,
  kcalMax: 560,
  idPrefix: "gs",
  icons: ["🥣", "🍓", "🍌", "🥑", "🍳", "🥞", "🫐", "🍇"],
  seed: 1001,
});

const GENERATED_OBED = generateForCategory({
  cat: "obed",
  bases: ["Kuřecí prsa", "Krůtí maso", "Hovězí maso", "Vepřová panenka", "Losos", "Treska", "Tofu", "Cizrnové kari", "Čočkové ragú", "Krevety", "Mleté hovězí", "Kuřecí stehna"],
  extras: ["na másle s bramborami", "se zeleninou a rýží", "v omáčce s houskovým knedlíkem", "s kuskusem a zeleninou", "zapečené se sýrem", "na grilu se salátem", "dušené se zeleninou", "s celozrnnými těstovinami", "v kari omáčce s jasmínovou rýží", "pečené s batáty", "na paprice s knedlíkem", "s quinoou a grilovanou zeleninou", "v jogurtové omáčce s bramborami", "s brokolicí a bramborovou kaší"],
  count: 100,
  kcalMin: 420,
  kcalMax: 780,
  idPrefix: "go",
  icons: ["🍗", "🍚", "🍲", "🥘", "🐟", "🥗", "🍢", "🥦", "🍛"],
  seed: 2002,
});

const GENERATED_VECERE = generateForCategory({
  cat: "vecere",
  bases: ["Zeleninová polévka", "Krémová polévka", "Zelný salát", "Zapečená zelenina", "Lehké rizoto", "Zeleninová quiche", "Bylinková omeleta", "Zeleninové karbanátky", "Špenátový salát", "Cuketové placičky", "Dýňová polévka", "Čočková polévka", "Rajčatová polévka", "Bramborová kaše"],
  extras: ["s cizrnou", "s tofu", "s kuřecím masem", "se sýrem", "s vejcem natvrdo", "s houbami", "s pečeným česnekem", "s čerstvými bylinkami", "se slaninou", "s krutony", "s parmezánem", "s avokádem", "s krevetami", "s praženými ořechy"],
  count: 100,
  kcalMin: 180,
  kcalMax: 560,
  idPrefix: "gv",
  icons: ["🍵", "🥣", "🍅", "🥕", "🧈", "🎃", "🍝", "🥗"],
  seed: 3003,
});

const GENERATED_SVACINA = generateForCategory({
  cat: "svacina",
  bases: ["Bílý jogurt", "Ovocno-jogurtové smoothie", "Ovocný talíř", "Celozrnný toust", "Tvarohová pomazánka", "Domácí proteinová tyčinka", "Ořechová směs", "Zeleninové hranolky", "Kefír", "Müsli tyčinka", "Chia pudink", "Sýrová mísa"],
  extras: ["s medem", "s čerstvým ovocem", "s vlašskými ořechy", "s domácí müsli", "s avokádem", "s domácím hummusem", "se skořicí", "s pečenou granolou", "s banánem", "s jahodami", "s kokosovými lupínky", "s makadamovými oříšky", "s pistáciemi", "s borůvkami"],
  count: 100,
  kcalMin: 90,
  kcalMax: 320,
  idPrefix: "gsv",
  icons: ["🍓", "🥥", "🫐", "🥒", "🥨", "🍌", "🥛", "🧀"],
  seed: 4004,
});

const RECIPES = [...CURATED, ...GENERATED_SNIDANE, ...GENERATED_OBED, ...GENERATED_VECERE, ...GENERATED_SVACINA];
const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

const CATEGORY_ICON = { snidane: "🥣", obed: "🍽️", vecere: "🌙", svacina: "🍎" };
const CATEGORY_LABEL = { snidane: "Snídaně", obed: "Oběd", vecere: "Večeře", svacina: "Svačina" };

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
const CUSTOM_KEY = "jidelnicek_vlastni_recepty";

function toNum(v, fallback) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function bmr({ gender, age, weight, height }) {
  const base = 10 * toNum(weight, 0) + 6.25 * toNum(height, 0) - 5 * toNum(age, 0);
  return gender === "muz" ? base + 5 : base - 161;
}

function pickThree(pool, cat, target, offset) {
  const filtered = pool.filter((r) => r.cat === cat);
  const sorted = [...filtered].sort((a, b) => {
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    return Math.abs(a.kcal - target) - Math.abs(b.kcal - target);
  });
  const n = sorted.length;
  if (n === 0) return [];
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
        <button type="button" className="stepperBtn" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>−</button>
        <span className="stepperValue">{value}</span>
        <button type="button" className="stepperBtn" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
      </div>
    </div>
  );
}

function AddRecipeForm({ onAdd }) {
  const [name, setName] = useState("");
  const [cat, setCat] = useState("snidane");
  const [kcal, setKcal] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim()) return setError("Zadej název receptu.");
    if (!kcal || Number(kcal) <= 0) return setError("Zadej platnou kalorickou hodnotu.");
    if (!url.trim().startsWith("http")) return setError("Vlož platný odkaz na recept (začínající https://).");
    setError("");
    onAdd({
      id: `custom-${Date.now()}`,
      cat,
      name: name.trim(),
      kcal: Math.round(Number(kcal)),
      icon: "⭐",
      url: url.trim(),
      verified: true,
      custom: true,
      diet: classifyDiet(name.trim()),
    });
    setName("");
    setKcal("");
    setUrl("");
  };

  return (
    <div className="addForm">
      <div className="field">
        <label className="label">Kategorie jídla</label>
        <div className="toggleRow">
          {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
            <button key={key} type="button" className={`toggleBtn ${cat === key ? "active" : ""}`} onClick={() => setCat(key)}>
              {CATEGORY_ICON[key]} {label}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label className="label">Název receptu</label>
        <input className="input textInput" value={name} onChange={(e) => setName(e.target.value)} placeholder="např. Dýňové rizoto s parmezánem" />
      </div>
      <div className="formGrid">
        <NumberField label="Kalorie" value={kcal} min={0} max={3000} suffix="kcal" onChange={setKcal} />
        <div className="field">
          <label className="label">Odkaz na Cookidoo</label>
          <input className="input textInput" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://cookidoo.cz/recipes/recipe/cs/..." />
        </div>
      </div>
      {error && <div className="errorText">{error}</div>}
      <button className="primaryBtn" type="button" onClick={submit}>
        Přidat recept ＋
      </button>
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
  const [customRecipes, setCustomRecipes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dietFilter, setDietFilter] = useState([]);

  const toggleDietFilter = (tag) =>
    setDietFilter((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  useEffect(() => {
    try {
      const savedFav = localStorage.getItem(FAVORITES_KEY);
      if (savedFav) setFavorites(JSON.parse(savedFav));
      const savedCustom = localStorage.getItem(CUSTOM_KEY);
      if (savedCustom) setCustomRecipes(JSON.parse(savedCustom));
    } catch {
      /* ignore */
    }
  }, []);

  const fullPool = useMemo(() => [...RECIPES, ...customRecipes], [customRecipes]);
  const filteredPool = useMemo(() => {
    if (dietFilter.length === 0) return fullPool;
    return fullPool.filter((r) => dietFilter.every((t) => r.diet?.includes(t)));
  }, [fullPool, dietFilter]);
  const poolById = useMemo(() => Object.fromEntries(fullPool.map((r) => [r.id, r])), [fullPool]);

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

  const addCustomRecipe = (recipe) => {
    setCustomRecipes((prev) => {
      const next = [...prev, recipe];
      try {
        localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    setShowAddForm(false);
  };

  const removeCustomRecipe = (id) => {
    setCustomRecipes((prev) => {
      const next = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    setFavorites((prev) => prev.filter((f) => f !== id));
  };

  const results = useMemo(() => {
    const base = bmr(form);
    const tdee = base * ACTIVITY[form.activity].factor;
    return { bmr: Math.round(base), tdee: Math.round(tdee) };
  }, [form.gender, form.age, form.weight, form.height, form.activity]);

  const slots = form.mealsPerDay === 3 ? PLAN_3 : PLAN_5;

  const multiDayPlan = useMemo(() => {
    const days = [];
    for (let d = 0; d < form.days; d++) {
      const daySlots = slots.map((slot) => {
        const key = `day${d}-${slot.key}`;
        const target = Math.round(results.tdee * slot.share);
        const manualOffset = offsets[key] || 0;
        let options = pickThree(filteredPool, slot.cat, target, d + manualOffset);
        let filterMissed = false;
        if (options.length === 0 && dietFilter.length > 0) {
          options = pickThree(fullPool, slot.cat, target, d + manualOffset);
          filterMissed = true;
        }
        return { ...slot, key, target, options, filterMissed };
      });
      days.push({ dayIndex: d, slots: daySlots });
    }
    return days;
  }, [form.days, form.mealsPerDay, results.tdee, offsets, slots, filteredPool, fullPool, dietFilter]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const selectOption = (slotKey, recipeId) => setSelections((s) => ({ ...s, [slotKey]: recipeId }));
  const reshuffleSlot = (slotKey) => setOffsets((o) => ({ ...o, [slotKey]: (o[slotKey] || 0) + 3 }));

  const dayTotal = (daySlots) =>
    daySlots.reduce((sum, slot) => {
      const chosenId = selections[slot.key] ?? slot.options[0]?.id;
      const recipe = slot.options.find((r) => r.id === chosenId);
      return sum + (recipe ? recipe.kcal : 0);
    }, 0);

  const favoriteRecipes = favorites.map((id) => poolById[id]).filter(Boolean);

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
            jídelníček z více než 400 jídel v duchu Cookidoo na tolik dní,
            kolik potřebuješ. Kdykoliv si můžeš přidat i vlastní recept
            z Cookidoo.
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
                  <button key={o.v} onClick={() => update("gender", o.v)} className={`toggleBtn ${form.gender === o.v ? "active" : ""}`}>
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
                  <button key={key} onClick={() => update("activity", key)} className={`activityBtn ${form.activity === key ? "active" : ""}`}>
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
                  <button key={n} onClick={() => update("mealsPerDay", n)} className={`toggleBtn ${form.mealsPerDay === n ? "active" : ""}`}>
                    {n} jídla
                  </button>
                ))}
              </div>
            </div>

            <div className="fullRow">
              <Stepper label="Počet dní jídelníčku" value={form.days} min={1} max={7} onChange={(v) => update("days", v)} />
            </div>

            <div className="field fullRow">
              <label className="label">Dietní omezení (nepovinné)</label>
              <div className="toggleRow">
                {Object.entries(DIET_META).map(([key, meta]) => (
                  <button
                    key={key}
                    type="button"
                    className={`toggleBtn ${dietFilter.includes(key) ? "active" : ""}`}
                    onClick={() => toggleDietFilter(key)}
                  >
                    {meta.icon} {meta.label}
                  </button>
                ))}
              </div>
              {dietFilter.length > 0 && (
                <p className="dietDisclaimer">
                  ⚠️ Štítky jsou odhad podle názvu receptu, ne ověřené složení. U celiakie, těžké
                  laktózové intolerance nebo alergie si vždy zkontroluj skutečné ingredience přímo
                  na cookidoo.cz.
                </p>
              )}
            </div>
          </div>

          <button className="primaryBtn" onClick={() => setShowPlan(true)}>
            Spočítat a sestavit jídelníček ✨
          </button>
        </section>

        {/* ---- PŘIDAT VLASTNÍ RECEPT ---- */}
        <section className="card">
          <div className="cardHeadRow" style={{ justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="stamp">＋</span>
              <h2 className="cardTitle">Vlastní recepty</h2>
            </div>
            <button className="linkBtn" onClick={() => setShowAddForm((s) => !s)}>
              {showAddForm ? "Zavřít" : "Přidat recept z Cookidoo"}
            </button>
          </div>

          {showAddForm && <AddRecipeForm onAdd={addCustomRecipe} />}

          {customRecipes.length > 0 && (
            <div className="optionsGrid" style={{ marginTop: showAddForm ? 20 : 0 }}>
              {customRecipes.map((r) => (
                <div key={r.id} className="option">
                  <div className="optionTop">
                    <span className="optionIcon">{r.icon}</span>
                    <button className="heartBtn" onClick={() => removeCustomRecipe(r.id)} title="Odebrat recept">
                      🗑️
                    </button>
                  </div>
                  <div className="optionName">{r.name}</div>
                  <div className="optionMeta">
                    <span className="optionKcal">{r.kcal} kcal</span>
                    <span className="optionPortion">{CATEGORY_LABEL[r.cat]}</span>
                  </div>
                  <a href={r.url} target="_blank" rel="noreferrer" className="cookidooLink">
                    Otevřít recept na Cookidoo ↗
                  </a>
                </div>
              ))}
            </div>
          )}
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
                      <button className="heartBtn active" onClick={() => toggleFavorite(r.id)}>♥</button>
                    </div>
                    <div className="optionName">{r.name}</div>
                    <div className="optionMeta">
                      <span className="optionKcal">{r.kcal} kcal</span>
                      {!r.verified && <span className="optionPortion">🔍 vyhledávání</span>}
                    </div>
                    <a href={r.url} target="_blank" rel="noreferrer" className="cookidooLink">
                      {r.verified ? "Otevřít recept na Cookidoo ↗" : "Hledat na Cookidoo ↗"}
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
                      <div key={slot.key} className="mealCard" style={{ animationDelay: `${idx * 60}ms` }}>
                        <div className="mealCardNotch" />
                        <div className="mealHead">
                          <span className="mealEmoji">{slot.icon}</span>
                          <div style={{ flex: 1 }}>
                            <h3 className="mealTitle">{slot.label}</h3>
                            <span className="mealTarget">cíl ≈ {slot.target} kcal</span>
                          </div>
                          <button className="shuffleBtn" onClick={() => reshuffleSlot(slot.key)} title="Nelíbí se ti tahle nabídka? Zamíchej jiné varianty.">
                            🔀 Jiné varianty
                          </button>
                        </div>

                        {slot.filterMissed && (
                          <p className="filterMissedNote">
                            ⚠️ Pro zvolený dietní filtr nebylo dost receptů v této kategorii, takže
                            je tu i pár nefiltrovaných možností.
                          </p>
                        )}

                        <div className="optionsGrid">
                          {slot.options.map((r) => {
                            const active = chosenId === r.id;
                            const isFav = favorites.includes(r.id);
                            return (
                              <div key={r.id} className={`option ${active ? "active" : ""}`} onClick={() => selectOption(slot.key, r.id)}>
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
                                {r.diet && r.diet.length > 0 && (
                                  <div className="dietBadges">
                                    {r.diet.map((t) => (
                                      <span key={t} className="dietBadge">{DIET_META[t].icon} {DIET_META[t].label}</span>
                                    ))}
                                  </div>
                                )}
                                <div className="optionMeta">
                                  <span className="optionKcal">{r.kcal} kcal</span>
                                  <span className="optionPortion">{portionNote(r.kcal, slot.target)}</span>
                                </div>
                                <a
                                  href={r.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="cookidooLink"
                                >
                                  {r.verified ? "Otevřít recept na Cookidoo ↗" : "Hledat na Cookidoo ↗"}
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
        Výpočet dle Mifflin–St Jeor rovnice. Databáze obsahuje přes 400 jídel
        napříč kategoriemi. Recepty označené odkazem "Otevřít recept" jsou
        ověřené konkrétní recepty na cookidoo.cz nebo tvoje vlastní přidané
        recepty; recepty s odkazem "Hledat" jsou realistické kombinace jídel,
        u kterých odkaz vede na vyhledávání daného názvu na Cookidoo (Cookidoo
        nemá veřejné API ani neumožňuje stažení celé databáze receptů).
        Oblíbené i vlastní recepty se ukládají jen v tomto prohlížeči na tomto
        zařízení.
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

.page { min-height: 100vh; background: var(--paper); font-family: 'Inter', sans-serif; color: var(--ink); padding-bottom: 48px; }

.header { position: relative; overflow: hidden; background: linear-gradient(180deg, #E9EFE0 0%, var(--paper) 100%); border-bottom: 1px solid var(--line); }
.blob { position: absolute; border-radius: 50%; filter: blur(50px); opacity: 0.35; pointer-events: none; }
.blob1 { width: 260px; height: 260px; background: var(--saffron); top: -110px; right: -60px; }
.blob2 { width: 220px; height: 220px; background: var(--herb-light); bottom: -120px; left: -60px; }

.headerInner { position: relative; max-width: 760px; margin: 0 auto; padding: 52px 24px 36px; }
.eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--herb); font-weight: 600; }
.title { font-family: 'Fraunces', serif; font-size: 44px; font-weight: 700; margin: 10px 0 14px; color: var(--ink); letter-spacing: -0.5px; }
.subtitle { font-size: 15px; line-height: 1.65; color: var(--muted); max-width: 560px; }

.main { max-width: 760px; margin: 0 auto; padding: 32px 24px; display: flex; flex-direction: column; gap: 24px; }

.card { background: var(--card); border: 1px solid var(--line); border-radius: 20px; padding: 28px; box-shadow: 0 8px 30px rgba(30, 42, 34, 0.06); }
.cardHeadRow { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
.stamp {
  font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 700; color: #fff;
  background: linear-gradient(135deg, var(--herb), var(--herb-light)); border-radius: 50%;
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cardTitle { font-family: 'Fraunces', serif; font-size: 23px; font-weight: 600; margin: 0; }

.linkBtn { border: none; background: none; color: var(--herb); font-weight: 700; font-size: 13px; cursor: pointer; text-decoration: underline; }

.formGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.fullRow { grid-column: 1 / -1; }
.label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--muted); }

.numWrap { position: relative; display: flex; align-items: center; }
.input {
  width: 100%; border: 1.5px solid var(--line); border-radius: 10px; padding: 11px 44px 11px 14px;
  font-size: 16px; font-family: 'IBM Plex Mono', monospace; font-weight: 600; background: #fff; color: var(--ink);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.textInput { padding: 11px 14px; font-family: 'Inter', sans-serif; font-weight: 500; font-size: 14px; }
.input:focus { outline: none; border-color: var(--herb); box-shadow: 0 0 0 3px rgba(58, 90, 67, 0.12); }
.suffix { position: absolute; right: 14px; font-size: 13px; color: var(--muted); font-weight: 500; pointer-events: none; }

.stepper { display: flex; align-items: center; gap: 16px; border: 1.5px solid var(--line); border-radius: 10px; padding: 8px 16px; width: fit-content; }
.stepperBtn { width: 30px; height: 30px; border-radius: 8px; border: 1.5px solid var(--line); background: #fff; color: var(--herb); font-size: 16px; font-weight: 700; cursor: pointer; }
.stepperBtn:disabled { opacity: 0.35; cursor: not-allowed; }
.stepperValue { font-family: 'IBM Plex Mono', monospace; font-size: 17px; font-weight: 700; min-width: 20px; text-align: center; }

.toggleRow { display: flex; gap: 8px; flex-wrap: wrap; }
.toggleBtn { flex: 1 1 auto; padding: 11px 14px; font-size: 14px; font-weight: 600; border: 1.5px solid var(--line); border-radius: 10px; background: #fff; color: var(--ink); cursor: pointer; transition: all 0.15s; }
.toggleBtn:hover { border-color: var(--herb-light); transform: translateY(-1px); }
.toggleBtn.active { background: linear-gradient(135deg, var(--herb), var(--herb-light)); border-color: var(--herb); color: #fff; box-shadow: 0 4px 12px rgba(58, 90, 67, 0.25); }

.activityBtn { flex: 1 1 200px; display: flex; align-items: flex-start; gap: 10px; padding: 13px 14px; font-size: 14px; text-align: left; border: 1.5px solid var(--line); border-radius: 12px; background: #fff; color: var(--ink); cursor: pointer; transition: all 0.15s; }
.activityBtn:hover { border-color: var(--herb-light); transform: translateY(-1px); }
.activityBtn.active { background: rgba(58, 90, 67, 0.07); border-color: var(--herb); box-shadow: 0 4px 12px rgba(58, 90, 67, 0.12); }
.activityIcon { font-size: 20px; line-height: 1; }
.activityLabel { display: block; font-weight: 700; }
.activityDesc { display: block; font-size: 12px; font-weight: 400; color: var(--muted); margin-top: 2px; }

.primaryBtn {
  margin-top: 26px; width: 100%; padding: 15px 20px; font-size: 15px; font-weight: 700; letter-spacing: 0.3px; color: #fff;
  background: linear-gradient(135deg, var(--tomato), #D9683F); border: none; border-radius: 12px; cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 6px 18px rgba(193, 80, 46, 0.3);
}
.primaryBtn:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(193, 80, 46, 0.35); }
.primaryBtn:active { transform: translateY(0); }

.addForm { display: flex; flex-direction: column; gap: 16px; padding-top: 4px; }
.errorText { color: var(--tomato); font-size: 13px; font-weight: 600; }
.dietDisclaimer { font-size: 11.5px; color: var(--muted); line-height: 1.5; margin-top: 8px; background: rgba(228,166,59,0.1); border-radius: 10px; padding: 8px 10px; }
.dietBadges { display: flex; flex-wrap: wrap; gap: 4px; margin: 2px 0; }
.dietBadge { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px; background: rgba(58,90,67,0.09); color: var(--herb); white-space: nowrap; }
.filterMissedNote { font-size: 11px; color: var(--tomato); font-weight: 600; margin-bottom: 8px; }

.resultCard { background: linear-gradient(135deg, var(--ink), #2A3B2E); border-radius: 20px; padding: 26px 28px; color: #FDFCF7; animation: fadeUp 0.4s ease both; }
.resultRow { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.resultDivider { width: 1px; align-self: stretch; background: rgba(255,255,255,0.15); }
.resultLabel { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; margin-bottom: 5px; }
.resultValue { font-family: 'IBM Plex Mono', monospace; font-size: 20px; font-weight: 700; }
.resultValueBig { font-family: 'IBM Plex Mono', monospace; font-size: 32px; font-weight: 700; color: var(--saffron); }

.dayBlock { display: flex; flex-direction: column; gap: 14px; }
.dayHeadRow { display: flex; align-items: baseline; justify-content: space-between; padding: 0 4px; }
.dayTitle { font-family: 'Fraunces', serif; font-size: 24px; font-weight: 700; margin: 0; }
.dayTotal { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: var(--muted); }

.timeline { display: flex; flex-direction: column; gap: 18px; }

.mealCard { position: relative; background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 22px 24px 24px; box-shadow: 0 6px 24px rgba(30, 42, 34, 0.05); animation: fadeUp 0.45s ease both; }
.mealCardNotch { position: absolute; top: -1px; left: 26px; width: 44px; height: 9px; background: var(--paper); border-left: 1px solid var(--line); border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); border-radius: 0 0 8px 8px; }
.mealHead { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.mealEmoji { font-size: 26px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(228, 166, 59, 0.15); border-radius: 12px; flex-shrink: 0; }
.mealTitle { font-family: 'Fraunces', serif; font-size: 19px; font-weight: 600; margin: 0; }
.mealTarget { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--muted); }

.shuffleBtn { border: 1.5px solid var(--line); background: #fff; color: var(--herb); font-size: 12px; font-weight: 700; padding: 8px 12px; border-radius: 10px; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
.shuffleBtn:hover { border-color: var(--herb-light); background: rgba(58,90,67,0.06); }

.optionsGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
.option { position: relative; border: 1.5px solid var(--line); border-radius: 14px; padding: 14px; cursor: pointer; display: flex; flex-direction: column; gap: 8px; background: #fff; transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s; }
.option:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(30,42,34,0.08); border-color: var(--herb-light); }
.option.active { border-color: var(--herb); background: rgba(58, 90, 67, 0.06); box-shadow: 0 0 0 1.5px var(--herb) inset; }
.optionTop { display: flex; align-items: center; justify-content: space-between; }
.optionIcon { font-size: 20px; }
.checkMark { width: 18px; height: 18px; background: var(--herb); color: #fff; border-radius: 50%; font-size: 11px; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.heartBtn { border: none; background: none; cursor: pointer; font-size: 16px; color: var(--line); line-height: 1; padding: 2px; transition: color 0.15s, transform 0.15s; }
.heartBtn:hover { transform: scale(1.15); }
.heartBtn.active { color: var(--tomato); }
.optionName { font-size: 14px; font-weight: 700; line-height: 1.35; }
.optionMeta { display: flex; justify-content: space-between; align-items: center; }
.optionKcal { font-family: 'IBM Plex Mono', monospace; font-size: 13px; font-weight: 700; color: var(--herb); }
.optionPortion { font-size: 11px; color: var(--muted); }
.cookidooLink { font-size: 12px; font-weight: 700; color: var(--tomato); text-decoration: none; margin-top: 2px; transition: opacity 0.15s; }
.cookidooLink:hover { opacity: 0.7; text-decoration: underline; }

.footer { max-width: 760px; margin: 24px auto 0; padding: 0 24px; font-size: 12px; color: var(--muted); line-height: 1.6; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 520px) {
  .title { font-size: 34px; }
  .formGrid { grid-template-columns: 1fr; }
  .mealHead { flex-wrap: wrap; }
  .shuffleBtn { margin-left: 58px; }
}
`;
