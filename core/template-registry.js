const templateLoaders = {
  creator: () => import("../templates/creator.js?v=20260702-vanessa-assets-v5"),
  wedding: () => import("../templates/wedding.js?v=20260702-vanessa-assets-v5"),
  pizza: () => import("../templates/pizza.js?v=20260702-vanessa-assets-v5"),
  business: () => import("../templates/business.js?v=20260702-vanessa-assets-v5"),
  realestate: () => import("../templates/realestate.js?v=20260702-vanessa-assets-v5"),
  dermatology: () => import("../templates/dermatology.js?v=20260702-vanessa-assets-v5")
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
