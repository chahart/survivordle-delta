import { useEffect } from "react";

function setMeta(selector, attr, value, createAttrs) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement(Object.keys(createAttrs)[0] === "href" ? "link" : "meta");
    Object.entries(createAttrs).forEach(([k, v]) => k !== attr && el.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

export default function useSEO({ title, description, canonical, image }) {
  useEffect(() => {
    // Title
    if (title) document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    if (description) metaDesc.setAttribute("content", description);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    if (canonical) link.setAttribute("href", canonical);

    // og:image / twitter:image
    if (image) {
      setMeta('meta[property="og:image"]', "content", image, { property: "og:image" });
      setMeta('meta[name="twitter:image"]', "content", image, { name: "twitter:image" });
    }
  }, [title, description, canonical, image]);
}
