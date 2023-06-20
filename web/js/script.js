const ipcRenderer = require("electron/renderer").ipcRenderer;
import { setLang, tryGetLanguage } from "./lang.js";
import { connectPort, port, writePort } from "./port.js";
import { makeCode } from "./run.js";
import { correctPoints, createWorkspace, fromXml, setCorrectPoints, startXML, taskXML, toXml, workspace } from "./workspace.js";
const langs = require("./lang.json");
import { setupUpdater } from "./updater.js";
import { taskIndex, setTaskIndex, currentLevel, setCurrentLevel, task, answeredqs, correctqs, setAnsweredQs, setCorrectQs, nextTask, setVerifying, verifying } from "./task/level.js";
import { checkSchoolcode, connectServer, HTTP_PROTOCOL, SERVER, ws, wsServer, WS_PROTOCOL } from "./task/server.js";
import { $, sleep } from "./util.js";
import { initIdleDetector } from "./task/idle.js";
import { PSNotification } from "./notification.js";
import { currentSection, setCurrentSection } from "./levelpath/sections.js";
import { resetData } from "./consolechart.js";
const { readFileSync, existsSync, unlinkSync, writeFileSync } = require("node:fs");
const { app, shell } = require("@electron/remote")
const { join } = require("node:path");

let picoW = true;

setLang("en");
tryGetLanguage();
setupUpdater();
await initIdleDetector();

export const editor = new Quill("#reading-container", {
	theme: "bubble",
	readOnly: true
});

$("#version").innerText = ipcRenderer.sendSync("version");
$("#version").addEventListener("click", () => {
	new Dialog("#changelog-dialog").show();
	new Dialog("#changelog-dialog").hideButton("#changelog-hide");
})

new Dialog("#no-registration-dialog").hideButton("#no-registration-hide");

$("#greenflag").addEventListener("click", async () => {
	await run();
	await sleep(3000);
	$("#next").disabled = false;
	document.querySelector("#next").animate([{ transform: "scale(1.5)" }, { transform: "scale(1)" }], { duration: 300 })
})
$("#stop").addEventListener("click", async () => {
	await writePort("\r\x03")
})
$("#console_input").addEventListener("keypress", async (e) => {
	if(e.key == "Enter") {
		await writePort($("#console_input").value + "\r\n")
		$("#console_input").value = "";
	}
})
$("#save").addEventListener("click", async () => {
	ipcRenderer.send("save", toXml());
})
$("#load").addEventListener("click", async () => {
	const v = ipcRenderer.sendSync("load");
	if(v != null) fromXml(v);
})
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
	// ws.send("done " + currentLevel + " " + answeredqs + " " + correctqs);
	$("#next").disabled = true;
	if(task.verification.type == "code") {
		await writePort("\r\x03") // Cancel running code
		await sleep(300);
		setVerifying(true);
		await writePort("\r\x05")
		await writePort(task.verification.code);
		await writePort("\r\x04");
		let i = 0;
		while(i < 10) {
			if(!verifying) {
				break;
			}
			await sleep(500);
			i++;
		}
		if(verifying) {
			// Timeout
			setVerifying(false);
			showCustomNotif("Kann nicht verifizieren. Stelle sicher, dass du alles richtig gesteckt hast.");
			return;
		}
		console.log("Verified");
	}
	document.querySelector("#next").animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 1000, easing: "ease-in-out" })
	ws.send(JSON.stringify({type: "done", level: currentLevel, answeredqs, correctqs, section: currentSection}));
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
	resetData();
	$("#stop").style.display = "none";
	$("#save").style.display = "none";
	$("#load").style.display = "none";
	$("#reset").style.display = "";
	$("#task").style.display = "";
	$("#editor-name").style.display = "";
})
$("#playground").addEventListener("click", async () => {
	$("#levelpath").style.display = "none";
	const buttons = ["#greenflag", "#stop", "#save", "#load", "#reset", "#back", "#wiring", "#fix"];
	for(let i = 0; i < buttons.length; i++) {
		document.querySelector(buttons[i]).style.transform = "translateY(-150%)";
		document.querySelector(buttons[i]).animate([
			{
				transform: "translateY(-150%)"
			},
			{
				transform: "translateY(0)"
			}
		], {
			duration: 500,
			easing: "ease-in-out",
			delay: i * 100,
			fill: "forwards"
		});
	}
	$("#editor").style.display = "";
	createWorkspace();
	fromXml(startXML);
	$("#greenflag").disabled = false;
	$("#stop").style.display = "";
	$("#save").style.display = "";
	$("#load").style.display = "";
	$("#reset").style.display = "none";
	$("#task").style.display = "none";
	$("#editor-name").style.display = "none";
	$("#wiring").style.display = "none";
	connectPort();
	setTaskIndex(-2);
});
$("#reading-back").addEventListener("click", async () => {
	$("#reading").style.display = "none";
	$("#levelpath").style.display = "";
})
$("#reading-next").addEventListener("click", async () => {
	$("#reading").style.display = "none";
	$("#levelpath").style.display = "";
	ws.send(JSON.stringify({type: "done", level: currentLevel, answeredqs, correctqs, section: currentSection}));
	party.confetti(document.querySelector("#levelpath"), { count: "90", spread: "10" })
})
$("#pico").addEventListener("click", () => {
	$("#pico-w").style.backgroundColor = "";
	$("#pico").style.backgroundColor = "#0e0e0e";
	$("#pico svg path").style.fill = "#40C340";
	for(let i = 0; i < 4; i++) {
		$("#pico-w" + i + " path").style.fill = "#FFFFFF";
	}
	picoW = false;
})
$("#pico-w").addEventListener("click", () => {
	$("#pico").style.backgroundColor = "";
	$("#pico-w").style.backgroundColor = "#0e0e0e";
	$("#pico svg path").style.fill = "#FFFFFF";
	for(let i = 0; i < 4; i++) {
		$("#pico-w" + i + " path").style.fill = "#40C340";
	}
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
$("#pico-dialog-w").addEventListener("click", () => {
	$("#pico-w").click();
	new Dialog("#pico-dialog").hide();
})
$("#pico-dialog-normal").addEventListener("click", () => {
	$("#pico").click();
	new Dialog("#pico-dialog").hide();
})
$("#start-btn").addEventListener("click", async () => {
	$("#play-btn-svg").style.display = "none";
	$("#level-loader").style.display = "";
	// ws.send("task " + (parseInt($("#start-btn").getAttribute("data-level")) + 1));
	ws.send(JSON.stringify({type: "task", level: parseInt($("#start-btn").getAttribute("data-level")) + 1}));
	setCurrentLevel(parseInt($("#start-btn").getAttribute("data-level")) + 1);
})
$("#close-debug").addEventListener("click", () => {
	new PSNotification("#debug-window").hide();
})
async function showCustomNotif(text) {
	$("#custom-notification-text").innerText = text;
	new PSNotification("#custom-notification").show();
	await sleep(3000);
	new PSNotification("#custom-notification").hide();
}
$("#refresh-workspace").addEventListener("click", () => {
	workspace.refreshToolboxSelection_();
	showCustomNotif("Refreshed workspace toolbox");
})
$("#reload-workspace").addEventListener("click", () => {
	const xml = toXml();
	while($("#blocklyDiv").firstChild) {
		$("#blocklyDiv").firstChild.remove();
	}
	createWorkspace();
	fromXml(xml);
	showCustomNotif("Reloaded workspace");
})
$("#serial-connect").addEventListener("click", async () => {
	connectPort();
	showCustomNotif("[Confirmed]");
})
$("#serial-disconnect").addEventListener("click", async () => {
	port.close();
	showCustomNotif("Closed port");
})
$("#pico-reset").addEventListener("click", async () => {
	// Ctrl-D
	await writePort("\x04");
	showCustomNotif("Sent reset signal");
})
$("#pico-interrupt").addEventListener("click", async () => {
	// Ctrl-C
	await writePort("\x03");
	showCustomNotif("Sent interrupt signal");
})
$("#reload-with-psess").addEventListener("click", async () => {
	savePsess();
	location.reload();
});
document.addEventListener("keydown", async (e) => {
	// Ctrl+Shift+R
	if(e.ctrlKey && e.shiftKey && e.key === "R") {
		savePsess();
		location.reload();
	}
	// Ctrl+Shift+L
	if(e.ctrlKey && e.shiftKey && e.key === "L") {
		location.reload();
	}
});

function savePsess() {
	if($("#save").style.display === "none") {
		const psess = {
			name: $("#name").value,
			section: currentSection,
			level: currentLevel,
			answeredqs,
			correctqs,
			picoW,
			workspace: toXml(),
			taskIndex,
			isInEditor: $("#editor").style.display !== "none",
			isInReading: $("#reading").style.display !== "none",
			isInLevelPath: $("#levelpath").style.display !== "none",
			isInPlayground: false
		};
		writeFileSync(join(app.getPath("userData"), "psess.json"), JSON.stringify(psess));
	} else if($("#save").style.display === "") {
		const psess = {
			name: $("#name").value,
			picoW,
			workspace: toXml(),
			isInEditor: $("#editor").style.display !== "none",
			isInReading: $("#reading").style.display !== "none",
			isInLevelPath: $("#levelpath").style.display !== "none",
			isInPlayground: true
		};
		writeFileSync(join(app.getPath("userData"), "psess.json"), JSON.stringify(psess));
	}
}

$("#save-psess").addEventListener("click", () => {
	savePsess();
	showCustomNotif("Saved psess in userData");
});
$("#re-request-verification").addEventListener("click", async () => {
	$("#next").disabled = false;
	$("#next").click();
	showCustomNotif("Re-requested verification");
});
$("#open-ps-folder").addEventListener("click", async () => {
	shell.openPath(app.getPath("userData"));
	showCustomNotif("Opened userData folder");
});
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
		ws.send(JSON.stringify({ type: "room", uuid: ipcRenderer.sendSync("config.get", "room") }));
		new Dialog("#pico-dialog").show();
	});
} else {
	$("#login").style.display = "flex";
	new Dialog("#pico-dialog").show();
	connectServer(ipcRenderer.sendSync("config.get", "schoolcode"));
}

if(existsSync(join(app.getPath("userData"), "psess.json"))) {
	new PSNotification("#psess-notification").show();
	new Dialog("#pico-dialog").hide();

	const psess = JSON.parse(readFileSync(join(app.getPath("userData"), "psess.json")));
	console.log(psess);

	await new Promise(resolve => setTimeout(resolve, 1000));

	$("#name").value = psess.name;
	ws.send(JSON.stringify({ type: "login", name: psess.name }))
	await new Promise(resolve => setTimeout(resolve, 1000));
	if(!psess.isInPlayground) {
		setCurrentSection(psess.section);
		setCurrentLevel(psess.level);
		ws.send(JSON.stringify({ type: "task", level: currentLevel, section: currentSection }));
		await new Promise(resolve => setTimeout(resolve, 1000));
		// if(psess.isInEditor) {
		// 	$("#editor").style.display = "";
		// 	$("#levelpath").style.display = "none";
		// 	$("#reading").style.display = "none";
		// } else if(psess.isInReading) {
		// 	$("#editor").style.display = "none";
		// 	$("#levelpath").style.display = "none";
		// 	$("#reading").style.display = "";
		// } else if(psess.isInLevelPath) {
		// 	$("#editor").style.display = "none";
		// 	$("#levelpath").style.display = "";
		// 	$("#reading").style.display = "none";
		// }
		// answeredqs = psess.answeredqs;
		// correctqs = psess.correctqs;
		setAnsweredQs(psess.answeredqs);
		setCorrectQs(psess.correctqs);
		fromXml(psess.workspace);
		setTaskIndex(psess.taskIndex - 1);
		nextTask();
	}
	picoW = psess.picoW;
	if(psess.isInPlayground) {
		$("#levelpath").style.display = "none";
		$("#editor").style.display = "";
		createWorkspace();
		fromXml(psess.workspace);
		$("#greenflag").disabled = false;
		$("#stop").style.display = "";
		$("#save").style.display = "";
		$("#load").style.display = "";
		$("#reset").style.display = "none";
		$("#task").style.display = "none";
		$("#editor-name").style.display = "none";
		$("#wiring").style.display = "none";
		setTaskIndex(-2);
	}
	await new Promise(resolve => setTimeout(resolve, 1000));
	new Dialog("#wiring-begin-dialog").hide();
	new Dialog("#custom-dialog").hide();
	new Dialog("#quiz-dialog").hide();
	connectPort();

	unlinkSync(join(app.getPath("userData"), "psess.json"));

	new PSNotification("#psess-notification").hide();
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

ipcRenderer.on("debug", async () => {
	new PSNotification("#debug-window").show();
})

if(ipcRenderer.sendSync("isDemo")) {
	$("#pico-dialog-w").click();
}