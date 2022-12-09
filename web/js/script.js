const prompt = require("electron-prompt");
const ipcRenderer = require("electron/renderer").ipcRenderer;
import { setLang } from "./lang.js";
import { connectPort, writePort } from "./port.js";
import { makeCode } from "./run.js";
import { fromXml, toXml } from "./workspace.js";

let picoW = true;
connectPort();

setLang("en");

document.querySelector("#greenflag").addEventListener("click", async () => {
	await run();
})
document.querySelector("#stop").addEventListener("click", async () => {
	await writePort("\r\x03")
})
document.querySelector("#console_input").addEventListener("keypress", async (e) => {
	if(e.key == "Enter") {
		await writePort(document.querySelector("#console_input").value + "\r\n")
		document.querySelector("#console_input").value = "";
	}
})
document.querySelector("#save").addEventListener("click", async () => {
	ipcRenderer.send("save", toXml());
})
document.querySelector("#load").addEventListener("click", async () => {
	const v = ipcRenderer.sendSync("load");
	if(v != null) fromXml(v);
})
document.querySelector("#tab-scratch").addEventListener("click", async () => {
	document.querySelector("#pythontab").style.display = "none";
	document.querySelector("#blocklyDiv").style.display = "";
	document.querySelector("#tab-scratch").classList.add("selected");
	document.querySelector("#tab-python").classList.remove("selected");
})

const tagsToReplace = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\r\n": "<br>",
};

function replaceTag(tag) {
	return tagsToReplace[tag] || tag;
}

function escapeHTML(str) {
	return str.replace(/[&<>]/g, replaceTag);
}

document.querySelector("#tab-python").addEventListener("click", async () => {
	document.querySelector("#pythontab").getElementsByTagName("code")[0].innerHTML = escapeHTML(await makeCode(picoW));
	hljs.highlightElement(document.querySelector("#pythontab").getElementsByTagName("code")[0]);
	document.querySelector("#blocklyDiv").style.display = "none";
	document.querySelector("#pythontab").style.display = "";
	document.querySelector("#tab-scratch").classList.remove("selected");
	document.querySelector("#tab-python").classList.add("selected");
})
document.querySelector("#tab-language").addEventListener("change", async () => {
	lang = document.querySelector("#tab-language").value;
	setLang(lang);
})
document.querySelector("#pico").addEventListener("click", () => {
	document.querySelector("#pico-w").style.backgroundColor = "";
	document.querySelector("#pico").style.backgroundColor = "#0e0e0e";
	picoW = false;
})
document.querySelector("#pico-w").addEventListener("click", () => {
	document.querySelector("#pico").style.backgroundColor = "";
	document.querySelector("#pico-w").style.backgroundColor = "#0e0e0e";
	picoW = true;
	document.querySelector("#pico-w3").style.display = "none";
	document.querySelector("#pico-w0").style.display = "";
	setTimeout(() => {
		document.querySelector("#pico-w0").style.display = "none";
		document.querySelector("#pico-w1").style.display = "";
		setTimeout(() => {
			document.querySelector("#pico-w1").style.display = "none";
			document.querySelector("#pico-w2").style.display = "";
			setTimeout(() => {
				document.querySelector("#pico-w2").style.display = "none";
				document.querySelector("#pico-w3").style.display = "";
			}, 80);
		}, 80);
	}, 80);
})

async function run() {
	await writePort("\r\x05")
	await writePort(await makeCode(picoW));
	await writePort("\r\x04");
	document.querySelector("#console").innerText = "";
}