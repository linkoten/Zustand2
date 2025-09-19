/\*\*

- # Composants de Carte Géologique
-
- ## ProductMap
-
- Composant de carte principal qui affiche des localités géologiques avec leurs périodes.
-
- ### Props
- - `localities`: Array de localités à afficher
- - `centerLat?`: Latitude du centre de la carte (défaut: 30)
- - `centerLon?`: Longitude du centre de la carte (défaut: -5)
- - `zoom?`: Niveau de zoom initial (défaut: 5)
- - `highlightedLocalityId?`: ID de la localité à mettre en évidence
-
- ### Fonctionnalités
- - Polygones colorés selon les périodes géologiques conventionnelles
- - Markers différenciés (plus grand et rouge pour la localité mise en évidence)
- - Popups informatifs avec détails géologiques
- - Interaction complète (zoom, déplacement, clics)
-
- ## ProductLocationMap
-
- Composant wrapper pour l'affichage d'une localité de produit avec option d'afficher toutes les localités.
-
- ### Props
- - `locality`: Localité principal du produit
- - `className?`: Classes CSS additionnelles
- - `height?`: Hauteur de la carte en pixels (défaut: 200)
- - `showAllLocalities?`: Afficher toutes les localités ou seulement celle du produit (défaut: true)
-
- ### Utilisation recommandée
-
- ```tsx

  ```
- // Pour une page de produit avec toutes les localités visibles
- <ProductLocationMap
- locality={product.locality}
- height={260}
- showAllLocalities={true}
- className="rounded-lg shadow-sm"
- />
-
- // Pour une carte simple avec seulement la localité du produit
- <ProductLocationMap
- locality={product.locality}
- showAllLocalities={false}
- zoom={8}
- />
- ```

  ```
-
- ## Couleurs Géologiques Conventionnelles
-
- Les couleurs utilisées suivent les standards internationaux :
- - CAMBRIEN: #40E0D0 (Bleu turquoise)
- - ORDOVICIEN: #0066CC (Bleu moyen)
- - SILURIEN: #8A2BE2 (Violet pourpre)
- - DEVONIEN: #B22222 (Rouge brique)
- - CARBONIFERE: #228B22 (Vert foncé)
- - PERMIEN: #C71585 (Rose magenta)
- - TRIAS: #CD853F (Brun brique)
- - JURASSIQUE: #808000 (Vert olive)
- - CRETACE: #9AFF9A (Vert clair)
- - PALEOGENE: #FFA500 (Orange)
- - NEOGENE: #FFD700 (Jaune vif)
- - QUATERNAIRE: #D3D3D3 (Gris clair)
-
- ## Actions de Base de Données
-
- ### getLocalitiesForMap()
- Récupère toutes les localités de la base de données pour la carte.
-
- ### getLocalitiesByPeriod(period: GeologicalPeriod)
- Filtre les localités par période géologique.
-
- ### getLocalitiesByRegion(minLat, maxLat, minLon, maxLon)
- Filtre les localités par zone géographique.
  \*/

export {}; // Pour faire de ce fichier un module TypeScript
