import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             "ChronoRelic — RPG du Temps",
    short_name:       "ChronoRelic",
    description:      "Capturez chaque minute du temps comme une relique. Un RPG de collection unique basé sur le temps réel.",
    start_url:        "/play",
    display:          "standalone",
    background_color: "#08081a",
    theme_color:      "#08081a",
    orientation:      "portrait",
    lang:             "fr",
    categories:       ["games", "entertainment"],
    icons: [
      {
        src:   "/icons/icon-192.png",
        sizes: "192x192",
        type:  "image/png",
        purpose: "maskable",
      },
      {
        src:   "/icons/icon-512.png",
        sizes: "512x512",
        type:  "image/png",
        purpose: "any",
      },
    ],
    screenshots: [],
    shortcuts: [
      {
        name:      "Capturer",
        short_name: "Capturer",
        description: "Capturer la minute actuelle",
        url:       "/play",
        icons:     [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name:      "Collection",
        short_name: "Collection",
        description: "Voir votre collection",
        url:       "/collection",
        icons:     [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  }
}
