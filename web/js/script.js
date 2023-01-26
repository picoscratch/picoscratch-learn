const ipcRenderer = require("electron/renderer").ipcRenderer;
import { setLang, tryGetLanguage } from "./lang.js";
import { writePort } from "./port.js";
import { makeCode } from "./run.js";
import { correctPoints, createWorkspace, fromXml, setCorrectPoints, taskXML, toXml, workspace } from "./workspace.js";
const langs = require("./lang.json");
import { setupUpdater } from "./updater.js";
import { taskIndex, setTaskIndex, currentLevel, setCurrentLevel, task, answeredqs, correctqs, setAnsweredQs, setCorrectQs, nextTask } from "./task/level.js";
import { checkSchoolcode, connectServer, HTTP_PROTOCOL, SERVER, ws, wsServer, WS_PROTOCOL } from "./task/server.js";
import { $, sleep } from "./util.js";

let picoW = true;

setLang("en");
tryGetLanguage();
setupUpdater();

$("#version").innerText = ipcRenderer.sendSync("version");

$("#greenflag").addEventListener("click", async () => {
	await run();
})
// $("#stop").addEventListener("click", async () => {
// 	await writePort("\r\x03")
// })
$("#console_input").addEventListener("keypress", async (e) => {
	if(e.key == "Enter") {
		await writePort($("#console_input").value + "\r\n")
		$("#console_input").value = "";
	}
})
// $("#save").addEventListener("click", async () => {
// 	ipcRenderer.send("save", toXml());
// })
// $("#load").addEventListener("click", async () => {
// 	const v = ipcRenderer.sendSync("load");
// 	if(v != null) fromXml(v);
// })
$("#reset").addEventListener("click", async () => {
	fromXml(taskXML);
	setTaskIndex(-1);
	setAnsweredQs(0);
	setCorrectQs(0);
	setCorrectPoints([]);
	correctPoints.push(toXml());
	nextTask();
})
$("#next").addEventListener("click", async () => {
	// allowUnload = true;
	//console.log("index.html#level-complete_" + currentLevel + "_" + playername + "_" + playerscore);
	//location.href = "#" + (currentLevel + 1) + "_" + playername + "_" + playerscore;
	//location.reload();
	// await loadNextLevel();
	$("#editor").style.display = "none";
	$("#levelpath").style.display = "";
	while($("#blocklyDiv").firstChild) {
		$("#blocklyDiv").firstChild.remove();
	}
	$("#greenflag").disabled = true;
	$("#reset").style.display = "";
	$("#next").style.display = "none";
	$("#pythontab").style.width = "100%";
	$("#pythontab").style.display = "none";
	$("#code-in-py").style.display = "none";
	await writePort("\r\x03")
	// ws.send("done " + currentLevel + " " + answeredqs + " " + correctqs);
	ws.send(JSON.stringify({type: "done", level: currentLevel, answeredqs, correctqs}));
	setTaskIndex(-1);
	setAnsweredQs(0);
	setCorrectQs(0);
	setCorrectPoints([]);
})
$("#tab-scratch").addEventListener("click", async () => {
	$("#pythontab").style.display = "none";
	$("#blocklyDiv").style.display = "";
	$("#tab-scratch").classList.add("selected");
	$("#tab-python").classList.remove("selected");
})

export async function updatePythonTab() {
	$("#pythontab").getElementsByTagName("code")[0].textContent = await makeCode();
	hljs.highlightElement($("#pythontab").getElementsByTagName("code")[0]);
}

$("#tab-python").addEventListener("click", async () => {
	await updatePythonTab();
	$("#blocklyDiv").style.display = "none";
	$("#pythontab").style.display = "flex";
	$("#tab-scratch").classList.remove("selected");
	$("#tab-python").classList.add("selected");
})
$("#back").addEventListener("click", async () => {
	$("#editor").style.display = "none";
	$("#levelpath").style.display = "";
	while($("#blocklyDiv").firstChild) {
		$("#blocklyDiv").firstChild.remove();
	}
	$("#greenflag").disabled = true;
	$("#reset").style.display = "";
	$("#next").style.display = "none";
	$("#pythontab").style.width = "100%";
	$("#pythontab").style.display = "none";
	$("#code-in-py").style.display = "none";
	await writePort("\r\x03")
	setTaskIndex(-1);
	setAnsweredQs(0);
	setCorrectQs(0);
})
$("#pico").addEventListener("click", () => {
	$("#pico-w").style.backgroundColor = "";
	$("#pico").style.backgroundColor = "#0e0e0e";
	picoW = false;
})
$("#pico-w").addEventListener("click", () => {
	$("#pico").style.backgroundColor = "";
	$("#pico-w").style.backgroundColor = "#0e0e0e";
	picoW = true;
	$("#pico-w3").style.display = "none";
	$("#pico-w0").style.display = "";
	setTimeout(() => {
		$("#pico-w0").style.display = "none";
		$("#pico-w1").style.display = "";
		setTimeout(() => {
			$("#pico-w1").style.display = "none";
			$("#pico-w2").style.display = "";
			setTimeout(() => {
				$("#pico-w2").style.display = "none";
				$("#pico-w3").style.display = "";
			}, 80);
		}, 80);
	}, 80);
})
$("#start-btn").addEventListener("click", async () => {
	$("#play-btn-svg").style.display = "none";
	$("#level-loader").style.display = "";
	// ws.send("task " + (parseInt($("#start-btn").getAttribute("data-level")) + 1));
	ws.send(JSON.stringify({type: "task", level: parseInt($("#start-btn").getAttribute("data-level")) + 1}));
	setCurrentLevel(parseInt($("#start-btn").getAttribute("data-level")) + 1);
})
$("#fix").addEventListener("click", () => {
	workspace.refreshToolboxSelection_();
})
$("#fix").addEventListener("doubleclick", () => {
	const xml = toXml();
	while($("#blocklyDiv").firstChild) {
		$("#blocklyDiv").firstChild.remove();
	}
	createWorkspace();
	fromXml(xml);
})
$("#submit-name").addEventListener("click", async () => {
	// await new Dialog("#log-in-dialog").hide();
	// new Dialog("#loading-dialog").show();
	// connectServer();
	ws.send(JSON.stringify({type: "login", name: $("#name").value}));
})
// $("#exit-leaderboard").addEventListener("click", async () => {
// 	// await new Dialog("#leaderboard-dialog").hide();
// 	// connectPort();
// 	nextTask();
// })
// $("#select-language").addEventListener("click", async () => {
// 	await new Dialog("#language-dialog").hide();
// 	new Dialog("#log-in-dialog").show();
// })
$("#custom-dialog-button").addEventListener("click", async () => {
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
		$("#quiz-answer-" + (answer + 1)).classList.add("btn-red");
		$("#quiz-answer-" + (task.instructions[taskIndex].correct + 1)).classList.add("btn-green");
		$("#quiz-answer-1").disabled = true;
		$("#quiz-answer-2").disabled = true;
		$("#quiz-answer-3").disabled = true;
		$("#quiz-answer-4").disabled = true;
		setTimeout(async () => {
			$("#quiz-answer-1").disabled = false;
			$("#quiz-answer-2").disabled = false;
			$("#quiz-answer-3").disabled = false;
			$("#quiz-answer-4").disabled = false;
			await new Dialog("#quiz-dialog").hide();
			nextTask();
		}, 3000);
	}
}
$("#quiz-answer-1").addEventListener("click", async () => {
	quizAnswerCallback(0);
})
$("#quiz-answer-2").addEventListener("click", async () => {
	quizAnswerCallback(1);
})
$("#quiz-answer-3").addEventListener("click", async () => {
	quizAnswerCallback(2);
})
$("#quiz-answer-4").addEventListener("click", async () => {
	quizAnswerCallback(3);
})
$("#kick-dialog-button").addEventListener("click", async () => {
	location.reload();
})
$("#no-course-yet-close").addEventListener("click", async () => {
	await new Dialog("#no-course-yet-dialog").hide();
})
$("#wiring-close").addEventListener("click", async () => {
	await new Dialog("#wiring-dialog").hide();
})
$("#wiring-begin-close").addEventListener("click", async () => {
	await new Dialog("#wiring-begin-dialog").hide();
	nextTask();
})
$("#wiring").addEventListener("click", async () => {
	new Dialog("#wiring-dialog").show();
})
if(!ipcRenderer.sendSync("config.has", "schoolcode")) {
	$("#setup").style.display = "flex";
	$("#schoolcode-input input").addEventListener("keyup", async (e) => {
		if(e.target.value.length == e.target.maxLength) {
			const check = await checkSchoolcode(e.target.value);
			if(!check) {
				$("#schoolcode-input input").value = "";
				$("#schoolcode-input input").focus();
				return;
			}
			setLang(check.lang);
			connectServer(e.target.value);
			$("#schoolcode-input").classList.add("goAway");
			await sleep(1500);
			$("#schoolcode-input").style.display = "none";
			$("#schoolcode-input").classList.remove("goAway");
			$("#room-input").style.display = "flex";
		}
	})
	$("#setup-finish").addEventListener("click", async () => {
		$("#setup-process").classList.remove("comeIn");
		$("#setup-process").classList.add("goAway");
		ipcRenderer.send("config.set", "schoolcode", $("#schoolcode-input input").value)
		ipcRenderer.send("config.set", "room", $("#rooms .selected").getAttribute("data-room"));
		await sleep(1500);
		$("#setup").style.display = "none";
		$("#login").style.display = "flex";
	});
} else {
	$("#login").style.display = "flex";
	connectServer(ipcRenderer.sendSync("config.get", "schoolcode"));
}

async function run() {
	await writePort("\r\x05")
	await writePort(await makeCode(picoW));
	await writePort("\r\x04");
	$("#console").innerText = "";
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
	$("#devmode-notification").style.display = "";
	setTimeout(() => {
		$("#devmode-notification").classList.add("notificationOut");
	}, 2000);
	setTimeout(() => {
		$("#devmode-notification").classList.remove("notificationOut");
		$("#devmode-notification").style.display = "none";
	}, 3000);
})

ipcRenderer.on("support", async (event) => {
	const data = { config: ipcRenderer.sendSync("config.json"), version: ipcRenderer.sendSync("version"), platform: process.platform, arch: process.arch, release: process.release, server: { http_protocol: HTTP_PROTOCOL, ws_protocol: WS_PROTOCOL, server: SERVER } };
	const id = await fetch(HTTP_PROTOCOL + "://" + SERVER + "/api/support", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({data})
	}).then(res => res.json())
	alert("Required information has been sent to the support.\nYour Support ID is " + id.id + ".\nPlease tell this ID to the support team.")
})