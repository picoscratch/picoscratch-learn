const prompt = require("electron-prompt");
const ipcRenderer = require("electron/renderer").ipcRenderer;
import { setLang, translate, tryGetLanguage } from "./lang.js";
import { connectPort, writePort } from "./port.js";
import { makeCode } from "./run.js";
import { fromXml, toXml, taskXML, setTaskXML, startXML } from "./workspace.js";
const langs = require("./lang.json");

let picoW = true;
export let leaderboard = [];

export let taskIndex = -1;
export let currentLevel = 1;
export let wsServer;
export let ws;
export let task;
export let blockTags = {};
export let varTags = {};
export let answeredqs = 0;
export let correctqs = 0;

export function setTaskIndex(newIndex) { taskIndex = newIndex; }
export function setCurrentLevel(newLevel) { currentLevel = newLevel; }
export function setWSServer(newServer) { wsServer = newServer; }
export function setWS(newWS) { ws = newWS; }
export function setTask(newTask) { task = newTask; }
export function setBlockTags(newBlockTags) { blockTags = newBlockTags; }
export function setVarTags(newVarTags) { varTags = newVarTags; }
export function setAnsweredQs(newAnsweredQs) { answeredqs = newAnsweredQs; }
export function setCorrectQs(newCorrectQs) { correctqs = newCorrectQs; }
export function setLeaderboard(newLeaderboard) { leaderboard = newLeaderboard; }

export async function loadNextLevel() {
	currentLevel++;
	taskIndex = -1;
	// if(!TASKS[currentLevel]) {
	// 	allowUnload = true;
	// 	ipcRenderer.send("close");
	// 	return;
	// }
	// document.querySelector("#taskname").innerText = task.name;
	// nextTask();
	await new Dialog("#loading-dialog").show()
	ws.send("done " + answeredqs + " " + correctqs);
	answeredqs = 0;
	correctqs = 0;
	ws.send("task");
	document.querySelector("#greenflag").disabled = true;
	document.querySelector("#reset").style.display = "";
	document.querySelector("#next").style.display = "none";
	document.querySelector("#pythontab").style.width = "100%";
	document.querySelector("#pythontab").style.display = "none";
	document.querySelector("#code-in-py").style.display = "none";
	await writePort("\r\x03")
	// allowUnload = false;
}

export function nextTask() {
	taskIndex++;
	if(taskIndex >= task.instructions.length) {
		document.querySelector("#instruction").innerText = "Super! Jetzt drück die grüne Flagge!";
		document.querySelector("#greenflag").disabled = false;
		document.querySelector("#reset").style.display = "none";
		document.querySelector("#next").style.display = "";
		updatePythonTab();
		document.querySelector("#pythontab").style.width = "40%";
		document.querySelector("#pythontab").style.display = "flex";
		document.querySelector("#code-in-py").style.display = "";
		return;
	}
	if(task.instructions[taskIndex].type == "comment") {
		workspace.getBlockById(blockTags[task.instructions[taskIndex].blockTag]).setCommentText(task.instructions[taskIndex].content);
		nextTask();
		return;
	}
	if(task.instructions[taskIndex].type == "dialog") {
		document.querySelector("#custom-dialog-title").innerHTML = task.instructions[taskIndex].title;
		document.querySelector("#custom-dialog-text").innerHTML = task.instructions[taskIndex].text.replaceAll("PICOSCRATCHSERVER", wsServer.replaceAll("ws://", "http://"));
		document.querySelector("#custom-dialog-button").innerHTML = task.instructions[taskIndex].closeButton;
		new Dialog("#custom-dialog").show();
		return;
	}
	if(task.instructions[taskIndex].type == "quiz") {
		document.querySelector("#quiz-question").innerHTML = task.instructions[taskIndex].question;
		document.querySelector("#quiz-answer-1").innerHTML = task.instructions[taskIndex].answers[0];
		document.querySelector("#quiz-answer-2").innerHTML = task.instructions[taskIndex].answers[1];
		document.querySelector("#quiz-answer-3").innerHTML = task.instructions[taskIndex].answers[2];
		document.querySelector("#quiz-answer-4").innerHTML = task.instructions[taskIndex].answers[3];
		document.querySelector("#quiz-answer-1").classList.remove("btn-green");
		document.querySelector("#quiz-answer-1").classList.remove("btn-red");
		document.querySelector("#quiz-answer-2").classList.remove("btn-green");
		document.querySelector("#quiz-answer-2").classList.remove("btn-red");
		document.querySelector("#quiz-answer-3").classList.remove("btn-green");
		document.querySelector("#quiz-answer-3").classList.remove("btn-red");
		document.querySelector("#quiz-answer-4").classList.remove("btn-green");
		document.querySelector("#quiz-answer-4").classList.remove("btn-red");
		new Dialog("#quiz-dialog").show();
		return;
	}
	document.querySelector("#instruction").innerText = task.instructions[taskIndex].text;
	document.querySelector("#instruction").animate([{
		fontSize: "1.1rem"
	},
	{
		fontSize: "1.3rem"
	},
	{
		fontSize: "1.1rem"
	}],
	{
		duration: 500
	})
}

export function renderLeaderboards() {
	renderLeaderboard(document.querySelector("#leaderboard"));
	renderLeaderboard(document.querySelector("#leaderboard2"));
}

export function renderLeaderboard(el) {
	while(el.firstChild) {
		el.removeChild(el.lastChild);
	}
	const tr = document.createElement("tr");
	[translate("place"), translate("name"), translate("level"), translate("quizpercentage")].forEach(s => {
		const td = document.createElement("td");
		td.innerText = s;
		tr.appendChild(td);
	})
	el.appendChild(tr);
	for(let i = 0; i < 10; i++) {
		if(!leaderboard[i]) break;
		const player = leaderboard[i];
		const tr = document.createElement("tr");
		if(player.name == capitalizeWords(document.querySelector("#name").value.trim().split(" ")).join(" ")) {
			tr.style.backgroundColor = "#1d1d1d";
		}
		const place = document.createElement("td");
		place.innerText = i + 1;
		tr.appendChild(place);
		const name = document.createElement("td");
		name.innerText = player.name;
		tr.appendChild(name);
		const level = document.createElement("td");
		level.innerText = player.level;
		tr.appendChild(level);
		const percentage = document.createElement("td");
		percentage.innerText = player.percentage;
		tr.appendChild(percentage);
		el.appendChild(tr);
	}
}

export function capitalizeWords(arr) {
  return arr.map(element => {
    return element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
  });
}

setLang("en");
tryGetLanguage();

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
	taskIndex = -1;
	nextTask();
})
document.querySelector("#next").addEventListener("click", async () => {
	// allowUnload = true;
	//console.log("index.html#level-complete_" + currentLevel + "_" + playername + "_" + playerscore);
	//location.href = "#" + (currentLevel + 1) + "_" + playername + "_" + playerscore;
	//location.reload();
	await loadNextLevel();
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

async function updatePythonTab() {
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
document.querySelector("#submit-name").addEventListener("click", async () => {
	await new Dialog("#log-in-dialog").hide();
	await new Dialog("#loading-dialog").show();
	const server = ipcRenderer.sendSync("config.get", "server");
	wsServer = server;
	ws = new WebSocket(server);
	ws.addEventListener("open", () => {
		ws.send("identify " + document.querySelector("#name").value);
		document.querySelector("#status").innerText = translate("loading-task");
		ws.send("task");
	})
	ws.addEventListener("message", async (data) => {
		const msg = data.data.toString();
		console.log("MESSAGE: " + msg);
		if(msg.startsWith("task ")) {
			task = JSON.parse(msg.split("task ", 2)[1]);
			taskIndex = -1;
			if(task.noclear) {
				if(toXml().trim().replaceAll("\n", "").replaceAll("\r", "").replaceAll("  ", "") == startXML.trim().replaceAll("\n", "").replaceAll("\r", "").replaceAll("  ", "")) {
					fromXml(task.startxml);
					varTags = task.varTags
					blockTags = task.blockTags
				}
				setTaskXML(toXml())
			} else {
				fromXml(startXML);
				setTaskXML(startXML)
				blockTags = {};
				varTags = {};
			}
			await new Dialog("#loading-dialog").hide();
			ws.send("leaderboard");
			await new Dialog("#leaderboard-dialog").show();
			document.querySelector("#taskname").innerText = task.name;
		} else if(msg.startsWith("finished")) {
			await new Dialog("#loading-dialog").hide();
			new Dialog("#done-dialog").show();
		} else if(msg.startsWith("leaderboard ")) {
			leaderboard = JSON.parse(msg.split("leaderboard ", 2)[1]);
			renderLeaderboards();
		} else if(msg == "notrunning") {
			await new Dialog("#loading-dialog").hide();
			new Dialog("#waiting-for-teacher-dialog").show();
		} else if(msg == "end") {
			await new Dialog("#leaderboard-dialog").hide();
			await new Dialog("#done-dialog").hide();
			await new Dialog("#custom-dialog").hide();
			new Dialog("#end-dialog").show();
		} else if(msg == "start") {
			await new Dialog("#waiting-for-teacher-dialog").hide();
			await new Dialog("#end-dialog").hide();
			new Dialog("#loading-dialog").show();
			ws.send("task");
		} else if(msg.startsWith("update ")) {
			leaderboard = JSON.parse(msg.split("update ", 2)[1]);
			renderLeaderboards();
		} else if(msg == "kick") {
			await Dialog.hideall();
			new Dialog("#kick-dialog").show();
		}
	})
})
document.querySelector("#exit-leaderboard").addEventListener("click", async () => {
	await new Dialog("#leaderboard-dialog").hide();
	connectPort();
	nextTask();
})
document.querySelector("#select-language").addEventListener("click", async () => {
	await new Dialog("#language-dialog").hide();
	new Dialog("#log-in-dialog").show();
})
document.querySelector("#custom-dialog-button").addEventListener("click", async () => {
	await new Dialog("#custom-dialog").hide();
	nextTask();
})
async function quizAnswerCallback(answer) {
	answeredqs++;
	if(task.instructions[taskIndex].correct == answer) {
		correctqs++;
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