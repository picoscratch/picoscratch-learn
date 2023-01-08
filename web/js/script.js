const ipcRenderer = require("electron/renderer").ipcRenderer;
import { setLang, tryGetLanguage } from "./lang.js";
import { writePort } from "./port.js";
import { makeCode } from "./run.js";
import { correctPoints, createWorkspace, fromXml, setCorrectPoints, taskXML, toXml } from "./workspace.js";
const langs = require("./lang.json");
import { setupUpdater } from "./updater.js";
import { taskIndex, setTaskIndex, currentLevel, setCurrentLevel, task, answeredqs, correctqs, setAnsweredQs, setCorrectQs, nextTask } from "./task/level.js";
import { connectServer, ws, wsServer } from "./task/server.js";

let picoW = true;

setLang("en");
tryGetLanguage();
setupUpdater();

document.querySelector("#greenflag").addEventListener("click", async () => {
	await run();
})
// document.querySelector("#stop").addEventListener("click", async () => {
// 	await writePort("\r\x03")
// })
document.querySelector("#console_input").addEventListener("keypress", async (e) => {
	if(e.key == "Enter") {
		await writePort(document.querySelector("#console_input").value + "\r\n")
		document.querySelector("#console_input").value = "";
	}
})
// document.querySelector("#save").addEventListener("click", async () => {
// 	ipcRenderer.send("save", toXml());
// })
// document.querySelector("#load").addEventListener("click", async () => {
// 	const v = ipcRenderer.sendSync("load");
// 	if(v != null) fromXml(v);
// })
document.querySelector("#reset").addEventListener("click", async () => {
	fromXml(taskXML);
	setTaskIndex(-1);
	setAnsweredQs(0);
	setCorrectQs(0);
	setCorrectPoints([]);
	correctPoints.push(toXml());
	nextTask();
})
document.querySelector("#next").addEventListener("click", async () => {
	// allowUnload = true;
	//console.log("index.html#level-complete_" + currentLevel + "_" + playername + "_" + playerscore);
	//location.href = "#" + (currentLevel + 1) + "_" + playername + "_" + playerscore;
	//location.reload();
	// await loadNextLevel();
	document.querySelector("#editor").style.display = "none";
	document.querySelector("#levelpath").style.display = "";
	while(document.querySelector("#blocklyDiv").firstChild) {
		document.querySelector("#blocklyDiv").firstChild.remove();
	}
	document.querySelector("#greenflag").disabled = true;
	document.querySelector("#reset").style.display = "";
	document.querySelector("#next").style.display = "none";
	document.querySelector("#pythontab").style.width = "100%";
	document.querySelector("#pythontab").style.display = "none";
	document.querySelector("#code-in-py").style.display = "none";
	await writePort("\r\x03")
	ws.send("done " + currentLevel + " " + answeredqs + " " + correctqs);
	setTaskIndex(-1);
	setAnsweredQs(0);
	setCorrectQs(0);
	setCorrectPoints([]);
})
document.querySelector("#tab-scratch").addEventListener("click", async () => {
	document.querySelector("#pythontab").style.display = "none";
	document.querySelector("#blocklyDiv").style.display = "";
	document.querySelector("#tab-scratch").classList.add("selected");
	document.querySelector("#tab-python").classList.remove("selected");
})

export async function updatePythonTab() {
	document.querySelector("#pythontab").getElementsByTagName("code")[0].textContent = await makeCode();
	hljs.highlightElement(document.querySelector("#pythontab").getElementsByTagName("code")[0]);
}

document.querySelector("#tab-python").addEventListener("click", async () => {
	await updatePythonTab();
	document.querySelector("#blocklyDiv").style.display = "none";
	document.querySelector("#pythontab").style.display = "flex";
	document.querySelector("#tab-scratch").classList.remove("selected");
	document.querySelector("#tab-python").classList.add("selected");
})
document.querySelector("#back").addEventListener("click", async () => {
	document.querySelector("#editor").style.display = "none";
	document.querySelector("#levelpath").style.display = "";
	while(document.querySelector("#blocklyDiv").firstChild) {
		document.querySelector("#blocklyDiv").firstChild.remove();
	}
	document.querySelector("#greenflag").disabled = true;
	document.querySelector("#reset").style.display = "";
	document.querySelector("#next").style.display = "none";
	document.querySelector("#pythontab").style.width = "100%";
	document.querySelector("#pythontab").style.display = "none";
	document.querySelector("#code-in-py").style.display = "none";
	await writePort("\r\x03")
	setTaskIndex(-1);
	setAnsweredQs(0);
	setCorrectQs(0);
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
document.querySelector("#start-btn").addEventListener("click", async () => {
	document.querySelector("#play-btn-svg").style.display = "none";
	document.querySelector("#level-loader").style.display = "";
	ws.send("task " + (parseInt(document.querySelector("#start-btn").getAttribute("data-level")) + 1));
	setCurrentLevel(parseInt(document.querySelector("#start-btn").getAttribute("data-level")) + 1);
})
document.querySelector("#fix").addEventListener("click", () => {
	const xml = toXml();
	while(document.querySelector("#blocklyDiv").firstChild) {
		document.querySelector("#blocklyDiv").firstChild.remove();
	}
	createWorkspace();
	fromXml(xml);
})
document.querySelector("#submit-name").addEventListener("click", async () => {
	// await new Dialog("#log-in-dialog").hide();
	new Dialog("#loading-dialog").show();
	connectServer();
})
// document.querySelector("#exit-leaderboard").addEventListener("click", async () => {
// 	// await new Dialog("#leaderboard-dialog").hide();
// 	// connectPort();
// 	nextTask();
// })
// document.querySelector("#select-language").addEventListener("click", async () => {
// 	await new Dialog("#language-dialog").hide();
// 	new Dialog("#log-in-dialog").show();
// })
document.querySelector("#custom-dialog-button").addEventListener("click", async () => {
	await new Dialog("#custom-dialog").hide();
	nextTask();
})
async function quizAnswerCallback(answer) {
	setAnsweredQs(answeredqs + 1);
	if(task.instructions[taskIndex].correct == answer) {
		setCorrectQs(correctqs + 1);
		await new Dialog("#quiz-dialog").hide();
		nextTask();
	} else {
		document.querySelector("#quiz-answer-" + (answer + 1)).classList.add("btn-red");
		document.querySelector("#quiz-answer-" + (task.instructions[taskIndex].correct + 1)).classList.add("btn-green");
		document.querySelector("#quiz-answer-1").disabled = true;
		document.querySelector("#quiz-answer-2").disabled = true;
		document.querySelector("#quiz-answer-3").disabled = true;
		document.querySelector("#quiz-answer-4").disabled = true;
		setTimeout(async () => {
			document.querySelector("#quiz-answer-1").disabled = false;
			document.querySelector("#quiz-answer-2").disabled = false;
			document.querySelector("#quiz-answer-3").disabled = false;
			document.querySelector("#quiz-answer-4").disabled = false;
			await new Dialog("#quiz-dialog").hide();
			nextTask();
		}, 3000);
	}
}
document.querySelector("#quiz-answer-1").addEventListener("click", async () => {
	quizAnswerCallback(0);
})
document.querySelector("#quiz-answer-2").addEventListener("click", async () => {
	quizAnswerCallback(1);
})
document.querySelector("#quiz-answer-3").addEventListener("click", async () => {
	quizAnswerCallback(2);
})
document.querySelector("#quiz-answer-4").addEventListener("click", async () => {
	quizAnswerCallback(3);
})
document.querySelector("#kick-dialog-button").addEventListener("click", async () => {
	location.reload();
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