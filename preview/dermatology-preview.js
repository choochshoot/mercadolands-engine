import { render } from "../templates/dermatology.js";

const mount = document.querySelector("#app");
const response = await fetch("../contracts/dermatology.json");
const data = await response.json();

mount.innerHTML = render(data);
