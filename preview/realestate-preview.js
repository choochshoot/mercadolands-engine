import { render } from "../templates/realestate.js";

const mount = document.querySelector("#app");
const response = await fetch("../contracts/realestate.json");
const data = await response.json();

mount.innerHTML = render(data);
