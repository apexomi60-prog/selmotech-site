# Instructions Claude — selmotech-site

Ce fichier définit les règles obligatoires pour toute modification de ce dépôt.

---

## Règle #1 — Bilinguisme FR/EN : éléments avec HTML interne

Certains éléments contiennent du HTML interne (`<br>`, `<em>`, etc.) dans leur contenu.
Ces éléments **ne doivent jamais** avoir d'attributs `data-fr` ou `data-en`.

**Raison :** les balises HTML dans les valeurs d'attributs ne sont pas échappées et peuvent
être tronquées par le parseur HTML, rendant le texte traduit incomplet ou corrompu.

**Éléments concernés actuellement :**
- `<h1 id="hero-headline">` — titre principal du hero
- `<p id="big-tagline">` — phrase signature dans la section tagline

**Règle :** leur traduction est gérée **exclusivement** via `getElementById` dans `toggleLang()`,
**après** la boucle `querySelectorAll('[data-fr]')`.

```js
// À la FIN de toggleLang(), après la boucle querySelectorAll
document.getElementById('hero-headline').innerHTML = lang === 'en'
  ? 'Others give you numbers.<br><em>Ordo gives you decisions.</em>'
  : 'Les autres donnent des chiffres.<br><em>Ordo donne des décisions.</em>';

document.getElementById('big-tagline').innerHTML = lang === 'en'
  ? '"Others give you numbers.<br><em>Ordo gives you decisions.</em>"'
  : '"Les autres donnent des chiffres.<br><em>Ordo donne des décisions.</em>"';
```

---

## Règle #2 — Bilinguisme FR/EN : éléments texte simple

Pour tout élément dont le contenu est du texte pur (sans balises HTML), utiliser
les attributs `data-fr` et `data-en` directement sur l'élément.

```html
<p data-fr="Texte en français" data-en="Text in English">Texte en français</p>
```

La boucle `querySelectorAll('[data-fr]')` dans `toggleLang()` gère ces éléments automatiquement.

**Balises supportées par la boucle :** `A`, `BUTTON`, `DIV`, `P`, `SPAN`, `H2`, `H3`, `H4`, `LI`

> **Important :** `H1` n'est **pas** dans la liste. Ne jamais mettre `data-fr`/`data-en`
> sur un `<h1>` — utiliser la règle #1 à la place.

---

## Règle #3 — Ajout d'un nouvel élément bilingue

Avant d'ajouter un élément traduit, poser ces deux questions :

1. **Le contenu contient-il des balises HTML (`<br>`, `<em>`, `<strong>`, etc.) ?**
   - Oui → Règle #1 : pas de `data-fr`/`data-en`, gérer via `getElementById` à la fin de `toggleLang()`
   - Non → Règle #2 : ajouter `data-fr` et `data-en` sur l'élément

2. **La balise de l'élément est-elle dans le whitelist de la boucle ?**
   - Oui (`A`, `BUTTON`, `DIV`, `P`, `SPAN`, `H2`, `H3`, `H4`, `LI`) → Règle #2 fonctionne
   - Non → Règle #1 obligatoire

---

## Règle #4 — Structure de toggleLang()

La fonction `toggleLang()` dans `index.html` doit toujours respecter cet ordre :

```
1. Basculer la variable `lang`
2. Mettre à jour le bouton de langue
3. Mettre à jour l'attribut `lang` du document
4. Mettre à jour le titre de la page
5. Boucle querySelectorAll('[data-fr]') — éléments texte simple
6. Boucle querySelectorAll('[data-placeholder-*]') — placeholders
7. getElementById pour hero-headline et big-tagline — EN DERNIER
8. Appel afficherTemoignages()
```

Ne jamais placer les `getElementById` de hero-headline ou big-tagline **avant** la boucle
`querySelectorAll`, sinon leurs valeurs seraient écrasées.

---

## Règle #5 — Encodage

Tous les fichiers HTML de ce dépôt utilisent l'encodage **UTF-8**.
Ne jamais sauvegarder en latin-1 ou windows-1252.
Vérifier que `<meta charset="UTF-8">` est présent dans chaque fichier HTML.

---

## Récapitulatif rapide

| Situation | Action |
|---|---|
| Texte pur, balise dans le whitelist | `data-fr` / `data-en` sur l'élément |
| Texte avec HTML (`<br>`, `<em>`...) | `getElementById` à la fin de `toggleLang()` |
| `<h1>` de n'importe quel type | Toujours `getElementById`, jamais `data-fr`/`data-en` |
| Nouvel élément hors whitelist | Ajouter au whitelist OU utiliser `getElementById` |
