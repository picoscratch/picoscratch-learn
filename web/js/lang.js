import { setLocale } from "./workspace.js";

const langs = require("./lang.json");

let lang;

function updateLanguages() {
	document.querySelectorAll("[data-lang]").forEach(e => {
		e.innerText = langs[lang][e.getAttribute("data-lang")];
	})
	document.querySelectorAll("[data-lang-placeholder]").forEach(e => {
		e.placeholder = langs[lang][e.getAttribute("data-lang-placeholder")];
	})
}

export function setLang(toLang) {
	lang = toLang;
	updateLanguages();
	setLocale(lang);
}