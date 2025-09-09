export const dictionaries = {
  fr: {
    siteTitle: "FossilShop - Paléontologie & Fossiles",
    siteDescription:
      "Découvrez notre collection de fossiles authentiques et explorez l'univers fascinant de la paléontologie",
    footerCopyright: "Tous droits réservés.",
    nav_home: "Accueil",
    nav_fossils: "Fossiles",
    nav_blog: "Blog",
    nav_dashboard: "Dashboard",
    nav_signin: "Connexion",
    nav_signup: "S'inscrire",
  },
  en: {
    siteTitle: "FossilShop - Paleontology & Fossils",
    siteDescription:
      "Discover our collection of authentic fossils and explore the fascinating world of paleontology.",
    footerCopyright: "All rights reserved.",
    nav_home: "Home",
    nav_fossils: "Fossils",
    nav_blog: "Blog",
    nav_dashboard: "Dashboard",
    nav_signin: "Sign in",
    nav_signup: "Sign up",
  },
};

export function getDictionary(locale: "fr" | "en") {
  return dictionaries[locale];
}
