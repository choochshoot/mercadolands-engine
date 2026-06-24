const templateLoaders = {
  creator: () => import("../templates/creator.js?v=20260624-treatment-cards"),
  wedding: () => import("../templates/wedding.js?v=20260624-treatment-cards"),
  pizza: () => import("../templates/pizza.js?v=20260624-treatment-cards"),
  business: () => import("../templates/business.js?v=20260624-treatment-cards"),
  realestate: () => import("../templates/realestate.js?v=20260624-treatment-cards"),
  dermatology: () => import("../templates/dermatology.js?v=20260624-treatment-cards")
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
