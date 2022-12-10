import { setLocale } from "./workspace.js";

const ipcRenderer = require("electron/renderer").ipcRenderer;

const langs = require("./lang.json");

let lang;

new Dialog("#language-dialog").show();

document.querySelector("#tab-language").addEventListener("change", () => {
	document.querySelector("#lang-selector").value = document.querySelector("#tab-language").value;
	langSelectorCallback();
})
document.querySelector("#lang-selector").addEventListener("change", () => {
	document.querySelector("#tab-language").value = document.querySelector("#lang-selector").value;
	langSelectorCallback();
})

export function tryGetLanguage() {
	if(!ipcRenderer.sendSync("config.has", "lang")) return;
	const language = ipcRenderer.sendSync("config.get", "lang");
	setLang(language);
	document.querySelector("#tab-language").value = language;
	document.querySelector("#lang-selector").value = language;
}

function langSelectorCallback() {
	setLocale(document.querySelector("#tab-language").value);
	lang = document.querySelector("#tab-language").value;
	updateLanguages();
}

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

export function getLang() {
	return lang;
}

export function translate(key) {
	return langs[lang][key];
}