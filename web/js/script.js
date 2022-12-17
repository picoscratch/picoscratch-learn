const ipcRenderer = require("electron/renderer").ipcRenderer;
import { setLang } from "./lang.js";
import { connectPort, writePort } from "./port.js";
import { makeCode } from "./run.js";
import { fromXml, toXml } from "./workspace.js";
import { setupUpdater } from "./updater.js";

let picoW = true;
connectPort();

setLang("en");
setupUpdater();

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
	setLang(document.querySelector("#tab-language").value);
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

ipcRenderer.on("devmode", (event) => {
	console.log("%cPicoScratch DevMode", "font-size: 2rem");
	console.log("%cIf you have no idea what this is, close this menu using the X in the top right corner!", "color: red; font-size: 1.2rem");
	console.groupCollapsed("%cUseful:", "color: lightblue; font-size: 1.1rem");
	console.log("%cconst ipc = require(\"electron\").ipcRenderer %cImport ipc to communicate with main process", "font-size: 1rem; padding: 5px; background-color: #1d1d1d; color: white; border-radius: 10px;", "padding-left: 5px; font-style: italic; font-size: 1rem;");
	console.log("%cipc.send(\"config.set\", \"channel\", \"beta\") %cSet the update channel to beta, can use latest (default), beta and alpha", "font-size: 1rem; padding: 5px; background-color: #1d1d1d; color: white; border-radius: 10px;", "padding-left: 5px; font-style: italic; font-size: 1rem;");
	console.log("%cipc.send(\"config.has\", \"channel\") %cCheck if a channel entry exists", "font-size: 1rem; padding: 5px; background-color: #1d1d1d; color: white; border-radius: 10px;", "padding-left: 5px; font-style: italic; font-size: 1rem;");
	console.log("%cipc.send(\"config.get\", \"channel\") %cGet the current value of channel", "font-size: 1rem; padding: 5px; background-color: #1d1d1d; color: white; border-radius: 10px;", "padding-left: 5px; font-style: italic; font-size: 1rem;");
	console.groupEnd();
	document.querySelector("#devmode-notification").style.display = "";
	setTimeout(() => {
		document.querySelector("#devmode-notification").classList.add("notificationOut");
	}, 2000);
	setTimeout(() => {
		document.querySelector("#devmode-notification").classList.remove("notificationOut");
		document.querySelector("#devmode-notification").style.display = "none";
	}, 3000);
})