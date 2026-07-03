const templateLoaders = {
  creator: () => import("../templates/creator.js?v=20260703-category-ux-v2"),
  wedding: () => import("../templates/wedding.js?v=20260703-category-ux-v2"),
  pizza: () => import("../templates/pizza.js?v=20260703-category-ux-v2"),
  business: () => import("../templates/business.js?v=20260703-category-ux-v2"),
  realestate: () => import("../templates/realestate.js?v=20260703-category-ux-v2"),
  dermatology: () => import("../templates/dermatology.js?v=20260703-category-ux-v2")
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
