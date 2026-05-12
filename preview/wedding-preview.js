import { render } from "../templates/wedding.js";

const mount = document.querySelector("#app");
const response = await fetch("../contracts/wedding.json");
const data = await response.json();

mount.innerHTML = render(data);
