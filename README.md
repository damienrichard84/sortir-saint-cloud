# Sortir à Saint-Cloud

Application web installable qui recense les événements de Saint-Cloud.

- `index.html` : source de la page et des données.
- `build.mjs` : génère `site/`, le dossier publié, avec les fichiers d'agenda.
- `scripts/icons.js` : régénère les icônes dans `site/icons/` après le build.
- `netlify.toml` : indique à Netlify de publier `site/`.

Mise à jour : modifier `index.html`, lancer `node build.mjs`, puis `node scripts/icons.js`, et pousser sur `main`.
