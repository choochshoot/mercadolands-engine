import { render as renderCreator } from "./creator.js";

export function render(data = {}, context = {}) {
  return renderCreator(data, context);
}

