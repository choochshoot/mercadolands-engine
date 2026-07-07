const templateLoaders = {
  creator: () => import("../templates/creator.js?v=20260706-category-hero-v3"),
  wedding: () => import("../templates/wedding.js?v=20260706-category-hero-v3"),
  pizza: () => import("../templates/pizza.js?v=20260706-category-hero-v3"),
  business: () => import("../templates/business.js?v=20260706-category-hero-v3"),
  realestate: () => import("../templates/realestate.js?v=20260706-category-hero-v3"),
  dermatology: () => import("../templates/dermatology.js?v=20260706-category-hero-v3")
};

export async function getTemplate(templateName) {
  const loader = templateLoaders[templateName] || templateLoaders.creator;
  const template = await loader();

  return {
    key: templateLoaders[templateName] ? templateName : "creator",
    render: template.render
  };
}

export function getAvailableTemplates() {
  return Object.keys(templateLoaders);
}
