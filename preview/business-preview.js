import { render } from "../templates/business.js";

const mount = document.querySelector("#app");
const response = await fetch("../contracts/business.json");
const data = await response.json();

mount.innerHTML = render(data);
