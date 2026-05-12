const templateLoaders = {
  creator: () => import("../templates/creator.js"),
  wedding: () => import("../templates/wedding.js"),
  pizza: () => import("../templates/pizza.js"),
  business: () => import("../templates/business.js")
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

