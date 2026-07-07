# CV — Gauthier Bonhomme

## 📁 Structure des fichiers

```
mon-cv/
├── index.html              ← CV principal (modifier ici pour changer le texte)
├── python.html             ← Page projet GymLocator
├── fonderie.html           ← Compte rendu fonderie
├── usinage.html            ← Compte rendu usinage
├── abaqus.html             ← Compte rendu Abaqus
├── escalade.html           ← Album escalade
├── ski.html                ← Album ski
├── alpinisme.html          ← Album alpinisme
├── trail.html              ← Album ultra trail
├── kitesurf.html           ← Album kite surf
├── gymlocator.html         ← Application GymLocator (ne pas modifier)
├── images/
│   ├── escalade/           ← Photos escalade (cover.jpg, photo_1.jpg, thumb_1.jpg...)
│   ├── ski/
│   ├── alpinisme/
│   ├── trail/
│   └── kitesurf/
└── projets/
    ├── fonderie/           ← Pages du rapport (page_1.jpg à page_17.jpg)
    ├── usinage/            ← Pages du rapport (page_1.jpg à page_15.jpg)
    └── abaqus/             ← Pages du rapport (page_1.jpg à page_13.jpg)
```

---

## ✏️ Modifier le texte du CV

1. Ouvre `index.html` sur GitHub (clique sur le fichier → icône crayon ✏️)
2. Les sections sont commentées, cherche par exemple :
   - `<!-- EXPÉRIENCES -->` pour modifier les expériences
   - `<!-- FORMATION -->` pour la formation
   - `<!-- COMPÉTENCES -->` pour les compétences
3. Modifie le texte entre les balises HTML
4. Clique **"Commit changes"** → mis en ligne en 1 minute

---

## 📸 Ajouter une photo dans une galerie sport

1. Ouvre le dossier `images/escalade/` (ou autre sport)
2. Clique **"Add file"** → **"Upload files"**
3. Nomme ta photo `photo_3.jpg` (suite de la numérotation)
4. Crée aussi une version réduite nommée `thumb_3.jpg` (même photo, taille réduite)
5. **"Commit changes"**
6. Ouvre `escalade.html`, ajoute la ligne suivante dans la grille :
   ```html
   <div class="gc" onclick="showOverlay(2)">
     <img class="gc-thumb" src="images/escalade/thumb_3.jpg" loading="lazy">
     <img class="gc-full" src="images/escalade/photo_3.jpg" style="display:none" loading="lazy">
   </div>
   ```

---

## 🚀 Déploiement GitHub Pages

1. Crée un repo nommé `gauthier-bonhomme.github.io`
2. Upload tous les fichiers de ce dossier
3. Settings → Pages → Source: main branch → Save
4. Site disponible sur https://gauthier-bonhomme.github.io

---

## 🌐 Nom de domaine personnalisé (gauthierbonhomme.fr)

1. Achète le domaine sur OVH (~7€/an)
2. Settings → Pages → Custom domain → `gauthierbonhomme.fr`
3. DNS OVH → Zone DNS → Ajouter 4 entrées A :
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
4. Attendre 24h

---

*Gauthier Bonhomme — Arts et Métiers Aix-en-Provence*
