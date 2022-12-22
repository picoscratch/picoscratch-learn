const ipcRenderer = require("electron/renderer").ipcRenderer;
const ReconnectingWebSocket = require("reconnecting-websocket");
import { setLang, translate, tryGetLanguage } from "./lang.js";
import { createButtons } from "./levelpath/buttons.js";
import { connectPort, port, writePort } from "./port.js";
import { makeCode } from "./run.js";
import { fromXml, toXml, taskXML, setTaskXML, startXML, createWorkspace, workspace } from "./workspace.js";
const langs = require("./lang.json");
import { setupUpdater } from "./updater.js";

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
	ws.send("done " + currentLevel + " " + answeredqs + " " + correctqs);
	answeredqs = 0;
	correctqs = 0;
	// ws.send("task");
	document.querySelector("#greenflag").disabled = true;
	document.querySelector("#reset").style.display = "";
	document.querySelector("#next").style.display = "none";
	document.querySelector("#pythontab").style.width = "100%";
	document.querySelector("#pythontab").style.display = "none";
	document.querySelector("#code-in-py").style.display = "none";
	await writePort("\r\x03")
	// allowUnload = false;
}

let autoBlockGlow;

export function nextTask() {
	if(taskIndex == -1) {
		connectPort();
	}
	if(autoBlockGlow) clearTimeout(autoBlockGlow);
	if(task.instructions[taskIndex] && task.instructions[taskIndex].block) {
		workspace.glowStack(task.instructions[taskIndex].block, false);
	}
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
	if(task.instructions[taskIndex].block) {
		autoBlockGlow = setTimeout(() => {
			workspace.glowStack(task.instructions[taskIndex].block, true);
			new Audio("appear.wav").play();
		}, 1000*60*2); // 2 minutes
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
}

export function renderLeaderboard(el) {
	while(el.firstChild) {
		el.removeChild(el.lastChild);
	}
	document.querySelector("#playername").innerText = capitalizeWords(document.querySelector("#name").value.trim().split(" ")).join(" ");
	document.querySelector("#xp").innerText = leaderboard.find(p => p.name == capitalizeWords(document.querySelector("#name").value.trim().split(" ")).join(" ")).xp + " XP";
	const achievements = leaderboard.find(p => p.name == capitalizeWords(document.querySelector("#name").value.trim().split(" ")).join(" ")).achievements;
	for(const a of document.querySelectorAll(".achievement")) {
		a.style.display = "none";
	}
	for(const a of achievements) {
		if(document.querySelector("#achievement-" + a)) document.querySelector("#achievement-" + a).style.display = "flex";
	}
	for(let i = 0; i < 10; i++) {
		if(!leaderboard[i]) break;
		console.log(el);
		const player = leaderboard[i];
		const div = document.createElement("div");
		div.classList.add("leaderboard-player");
		el.appendChild(div);
		if((i + 1) < 4) {
			if(i == 0) {
				div.innerHTML = `<svg width="41" height="42" viewBox="0 0 41 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.31177 18.4663H31.876V38.4086C31.876 39.844 30.4566 40.8481 29.1031 40.3701L20.0939 37.1888L11.0847 40.3701C9.73119 40.8481 8.31177 39.844 8.31177 38.4086V18.4663Z" fill="#FFC800"/><circle cx="20.0943" cy="20.0941" r="14.4004" transform="rotate(35.6401 20.0943 20.0941)" fill="#FFD900"/><path d="M11.7032 31.7972C18.1667 36.4314 27.1631 34.9486 31.7973 28.4851L8.39111 11.7031C3.75689 18.1666 5.23977 27.163 11.7032 31.7972Z" fill="#FEEA66"/><path d="M18.945 24.776C18.945 25.604 19.467 26.108 20.205 26.108C20.925 26.108 21.465 25.604 21.465 24.776V15.182C21.465 14.264 20.925 13.652 20.061 13.652C19.485 13.652 18.999 13.886 18.531 14.21L16.605 15.542C16.173 15.83 15.975 16.226 15.975 16.604C15.975 17.216 16.443 17.666 17.019 17.666C17.271 17.666 17.541 17.594 17.775 17.432L18.909 16.658H18.945V24.776Z" fill="#FF9600"/><circle cx="20.0943" cy="20.0941" r="12.9004" transform="rotate(35.6401 20.0943 20.0941)" stroke="#FFC800" stroke-width="3"/></svg>`;
			} else if(i == 1) {
				div.innerHTML = `<svg width="41" height="42" viewBox="0 0 41 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.31201 18.4663H31.8763V38.4086C31.8763 39.844 30.4569 40.8481 29.1033 40.3701L20.0941 37.1888L11.085 40.3701C9.73144 40.8481 8.31201 39.844 8.31201 38.4086V18.4663Z" fill="#AAC1D4"/><circle cx="20.0943" cy="20.0941" r="14.4004" transform="rotate(35.6401 20.0943 20.0941)" fill="#C2D1DD"/><path d="M11.7032 31.7972C18.1667 36.4314 27.1631 34.9486 31.7973 28.4851L8.39111 11.7031C3.75689 18.1666 5.23977 27.163 11.7032 31.7972Z" fill="#D6E4EF"/><path d="M16.0073 24.92C16.0073 25.55 16.4573 26 17.1773 26H22.7933C23.5313 26 23.9453 25.568 23.9453 24.938C23.9453 24.29 23.5313 23.858 22.7933 23.858H19.3553V23.822L22.5773 20.024C23.3333 19.124 23.8193 18.224 23.8193 17.054C23.8193 15.074 22.3793 13.562 20.0573 13.562C17.8793 13.562 16.5113 14.786 16.2413 16.1C16.2233 16.208 16.2053 16.316 16.2053 16.406C16.2053 17.072 16.6913 17.522 17.3393 17.522C17.8433 17.522 18.2213 17.234 18.4733 16.712C18.7973 16.046 19.2473 15.686 19.9493 15.686C20.8133 15.686 21.2993 16.28 21.2993 17.09C21.2993 17.72 21.0473 18.224 20.5793 18.782L16.7633 23.354C16.2053 24.02 16.0073 24.398 16.0073 24.92Z" fill="#849FB5"/><circle cx="20.0946" cy="20.0941" r="12.9004" transform="rotate(35.6401 20.0946 20.0941)" stroke="#AAC1D4" stroke-width="3"/></svg>`;
			} else if(i == 2) {
				div.innerHTML = `<svg width="41" height="42" viewBox="0 0 41 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.31152 19.4663H31.8758V38.4086C31.8758 39.844 30.4564 40.8481 29.1029 40.3701L20.0937 37.1888L11.0845 40.3701C9.73095 40.8481 8.31152 39.844 8.31152 38.4086V19.4663Z" fill="#D7975D"/><circle cx="20.0941" cy="20.0941" r="14.4004" transform="rotate(35.6401 20.0941 20.0941)" fill="#E5AE7C"/><path d="M11.703 31.7972C18.1664 36.4314 27.1628 34.9486 31.7971 28.4851L8.39087 11.7031C3.75665 18.1666 5.23953 27.163 11.703 31.7972Z" fill="#F7BE8B"/><path d="M16.4038 24.326C16.9258 25.514 18.2218 26.198 19.9858 26.198C22.2898 26.198 23.9818 24.686 23.9818 22.454C23.9818 20.852 23.1358 19.862 22.3798 19.502V19.466C23.2618 18.89 23.7478 17.99 23.7478 16.946C23.7478 14.984 22.3618 13.562 19.9678 13.562C18.2038 13.562 16.9798 14.372 16.5298 15.398C16.4398 15.614 16.3858 15.83 16.3858 16.028C16.3858 16.676 16.8538 17.144 17.5018 17.144C17.9518 17.144 18.3838 16.892 18.6178 16.424C18.7978 16.046 19.1398 15.686 19.8598 15.686C20.6878 15.686 21.2278 16.262 21.2278 17.126C21.2278 18.062 20.6518 18.638 19.8418 18.638H19.7158C19.0678 18.638 18.6178 19.07 18.6178 19.7C18.6178 20.33 19.0678 20.762 19.7158 20.762H19.8418C20.7238 20.762 21.4618 21.41 21.4618 22.472C21.4618 23.408 20.8858 24.074 19.9498 24.074C19.3198 24.074 18.8518 23.786 18.5638 23.318C18.2758 22.85 17.8618 22.598 17.4118 22.598C16.7098 22.598 16.2778 23.084 16.2778 23.714C16.2778 23.912 16.3138 24.128 16.4038 24.326Z" fill="#CD7900"/><circle cx="20.0941" cy="20.0941" r="12.9004" transform="rotate(35.6401 20.0941 20.0941)" stroke="#D7975D" stroke-width="3"/></svg>`;
			}
		} else {
			if(i == 9) div.innerHTML = `<h1 class="leaderboard-place leaderboard-place-last">${i + 1}</h1>`;
			else div.innerHTML = `<h1 class="leaderboard-place">${i + 1}</h1>`;
		}
		const name = document.createElement("h2");
		name.classList.add("leaderboard-name");
		name.innerText = player.name;
		if(player.name == capitalizeWords(document.querySelector("#name").value.trim().split(" ")).join(" ")) {
			div.style.backgroundColor = "#2e2e2e";
		}
		div.appendChild(name);
		const xp = document.createElement("h2");
		xp.classList.add("leaderboard-xp");
		xp.innerText = player.xp + " XP";
		div.appendChild(xp);
	}
	// const tr = document.createElement("tr");
	// [translate("place"), translate("name"), translate("level"), translate("quizpercentage")].forEach(s => {
	// 	const td = document.createElement("td");
	// 	td.innerText = s;
	// 	tr.appendChild(td);
	// })
	// el.appendChild(tr);
	// for(let i = 0; i < 10; i++) {
	// 	if(!leaderboard[i]) break;
	// 	const player = leaderboard[i];
	// 	const tr = document.createElement("tr");
	// 	if(player.name == capitalizeWords(document.querySelector("#name").value.trim().split(" ")).join(" ")) {
	// 		tr.style.backgroundColor = "#1d1d1d";
	// 	}
	// 	const place = document.createElement("td");
	// 	place.innerText = i + 1;
	// 	tr.appendChild(place);
	// 	const name = document.createElement("td");
	// 	name.innerText = player.name;
	// 	tr.appendChild(name);
	// 	const level = document.createElement("td");
	// 	level.innerText = player.level;
	// 	tr.appendChild(level);
	// 	const percentage = document.createElement("td");
	// 	percentage.innerText = player.percentage;
	// 	tr.appendChild(percentage);
	// 	el.appendChild(tr);
	// }
}

export function capitalizeWords(arr) {
  return arr.map(element => {
    return element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
  });
}

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
	taskIndex = -1;
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
	taskIndex = -1;
	answeredqs = 0;
	correctqs = 0;
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
	taskIndex = -1;
	answeredqs = 0;
	correctqs = 0;
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
	ws.send("task " + (parseInt(document.querySelector("#start-btn").getAttribute("data-level")) + 1));
	currentLevel = parseInt(document.querySelector("#start-btn").getAttribute("data-level")) + 1;
})
document.querySelector("#submit-name").addEventListener("click", async () => {
	// await new Dialog("#log-in-dialog").hide();
	new Dialog("#loading-dialog").show();
	const server = ipcRenderer.sendSync("config.get", "server");
	wsServer = server;
	ws = new ReconnectingWebSocket(server);
	// ws.addEventListener("open", () => {
	// })
	ws.addEventListener("message", async (data) => {
		const msg = data.data.toString();
		console.log("MESSAGE: " + msg);
		if(msg.startsWith("task ")) {
			task = JSON.parse(msg.split("task ", 2)[1]);
			taskIndex = -1;
			// ws.send("leaderboard");
			// await new Dialog("#leaderboard-dialog").show();
			document.querySelector("#taskname").innerText = task.name;
			document.querySelector("#levelpath").style.display = "none";
			document.querySelector("#editor").style.display = "";
			createWorkspace();
			if(task.noclear) {
				// if(toXml().trim().replaceAll("\n", "").replaceAll("\r", "").replaceAll("  ", "") == startXML.trim().replaceAll("\n", "").replaceAll("\r", "").replaceAll("  ", "")) {
				// }
				varTags = task.varTags
				blockTags = task.blockTags
				fromXml(task.startxml);
				setTaskXML(toXml())
			} else {
				fromXml(startXML);
				setTaskXML(startXML)
				blockTags = {};
				varTags = {};
			}
			nextTask();
		} else if(msg.startsWith("finished")) {
			await new Dialog("#loading-dialog").hide();
		} else if(msg.startsWith("leaderboard ")) {
			leaderboard = JSON.parse(msg.split("leaderboard ", 2)[1]);
			renderLeaderboards();
		} else if(msg == "notrunning") {
			await new Dialog("#loading-dialog").hide();
			new Dialog("#waiting-for-teacher-dialog").show();
		} else if(msg == "end") {
			// await new Dialog("#leaderboard-dialog").hide();
			await new Dialog("#custom-dialog").hide();
			new Dialog("#end-dialog").show();
		} else if(msg == "start") {
			await new Dialog("#waiting-for-teacher-dialog").hide();
			await new Dialog("#end-dialog").hide();
			if(document.querySelector("#start-btn").hasAttribute("data-level")) {
				ws.send("task " + (parseInt(document.querySelector("#start-btn").getAttribute("data-level")) + 1))
				currentLevel = parseInt(document.querySelector("#start-btn").getAttribute("data-level")) + 1;
			}
		} else if(msg == "kick") {
			await Dialog.hideall();
			new Dialog("#kick-dialog").show();
		} else if(msg.startsWith("levelpath ")) {
			await new Dialog("#loading-dialog").hide();
			document.querySelector("#levelpath").style.display = "";
			createButtons(msg.split(" ")[1], msg.split(" ")[2], msg.split(" ")[3] == "1");
		} else if(msg.startsWith("info ")) {
			const info = JSON.parse(msg.split("info ", 2)[1]);
			document.querySelector("#startWindow h1").innerText = info.name;
			document.querySelector("#startWindow p").innerHTML = info.desc;
		} else if(msg.startsWith("school ")) {
			document.querySelector("#school").innerHTML = msg.split("school ", 2)[1];
			document.querySelector("#login").style.display = "none";
			ws.send("identify " + document.querySelector("#name").value);
			document.querySelector("#status").innerText = translate("loading-tasks");
		}
	})
	ws.addEventListener("error", (e) => {
		if(!new Dialog("#loading-dialog").isShown) new Dialog("#loading-dialog").show();
		document.querySelector("#status").innerText = translate("connecting-to-server") + " (" + ws.retryCount + ")";
	})
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