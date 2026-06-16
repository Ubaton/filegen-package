// Per-template modules are loaded on demand so only the selected template
// is parsed and held in memory instead of all templates at once.
const LOADERS = {
  "e-commerce":   () => import("./templates/e-commerce.js").then((m) => m.default["e-commerce"]),
  "blog-post":    () => import("./templates/blog-post.js").then((m) => m.default["blog-post"]),
  "tech-website": () => import("./templates/tech-website.js").then((m) => m.default["tech-website"]),
};

export async function getStructure(name) {
  const loader = LOADERS[name];
  if (!loader) return null;
  return loader();
}