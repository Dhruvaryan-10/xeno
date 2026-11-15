import type { MetadataRoute } from "next";

// Makes the app installable ("Add to Home Screen") on iPhone and Android.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Campaign Copilot",
    short_name: "Copilot",
    description: "Describe who to reach, get the message written, and watch customers respond.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1D1842",
    theme_color: "#1D1842",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
