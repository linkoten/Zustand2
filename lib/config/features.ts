// Feature flags — permet de mettre certaines fonctionnalités en "stand-by" (masquage/redirection)
// sans supprimer le code ni les données. Repasser un flag à `true` réactive la feature.

export const FEATURES = {
  /** Section blog (articles, gisements, activités) — pas encore prête pour la production */
  blog: false,
  /** Comparateur de fossiles */
  compare: false,
  /** Encyclopédie des espèces / collection (catalogue d'espèces + gestion admin) */
  collection: false,
  /** Partage public de collection (lien de partage des favoris) */
  collectionShare: false,
  /** Panneau admin newsletter (envoi + gestion des abonnés). L'inscription publique reste active. */
  newsletterAdmin: false,
} as const;
