const ipcRenderer = require("electron/renderer").ipcRenderer;
const ReconnectingWebSocket = require("reconnecting-websocket");
import { setLang, translate } from "../lang.js";
import { createButtons } from "../levelpath/buttons.js";
import { PSNotification } from "../notification.js";
import { $ } from "../util.js";
import { correctPoints, createWorkspace, fromXml, setBlockTags, setTaskXML, setVarTags, startXML, toXml } from "../workspace.js";
import { renderLeaderboards, setLeaderboard } from "./leaderboard.js";
import { nextTask, setCurrentLevel, setTask, setTaskIndex, task } from "./level.js";
import { populateRoomButtons } from "./schoolauth.js";

/**
 * @deprecated Build your own with WS_PROTOCOL + "://" + SERVER
 */
export let wsServer;
export let ws;
export const HTTP_PROTOCOL = "https";
export const WS_PROTOCOL = "wss";
export const SERVER = "cfp.is-a.dev/picoscratch/";
// export const HTTP_PROTOCOL = "http";
// export const WS_PROTOCOL = "ws";
// export const SERVER = "localhost:8080";

// export function setWSServer(newServer) { wsServer = newServer; }
export function setWS(newWS) { ws = newWS; }

export async function checkSchoolcode(code) {
	const result = await fetch(HTTP_PROTOCOL + "://" + SERVER + "/api/schoolcode/" + code).then(res => res.json());
	return result.error == null ? result : false;
}

export function connectServer(code) {
	wsServer = WS_PROTOCOL + "://" + SERVER;
	ws = new ReconnectingWebSocket(WS_PROTOCOL + "://" + SERVER);
	ws.addEventListener("open", () => {
		ws.send(JSON.stringify({type: "hi", schoolCode: code, clientType: "student"}));
	})
	ws.addEventListener("message", async (data) => {
		const packet = JSON.parse(data.data.toString());
		if(packet.type == "hi") {
			if(!packet.success) {
				alert("Something isn't right. Please try again later.");
			}
			populateRoomButtons(packet.rooms);
			if(ipcRenderer.sendSync("config.has", "room")) ws.send(JSON.stringify({ type: "room", uuid: ipcRenderer.sendSync("config.get", "room") }));
			$("#school").innerText = packet.schoolname;
			await new Dialog("#loading-dialog").hide();
			await new PSNotification("#connection-lost-notification").hide();
			setLang(packet.lang);
			// if(ipcRenderer.sendSync("config.has", "device")) {
			// 	ws.send(JSON.stringify({type: "deviceIdentify", device: ipcRenderer.sendSync("config.get", "device")}));
			// } else {
			// 	ws.send(JSON.stringify({type: "deviceIdentify", device: null}));
			// }
		} else if(packet.type == "conversationError") {
			alert("Something isn't right. Please try again later.\n" + packet.error);
	// } else if(packet.type == "saveDevice") {
	// 	ipcRenderer.send("config.set", "device", packet.device);
		} else if(packet.type == "room") {
			if(!packet.success) {
				alert("Something isn't right. Please try again later.\n" + packet.error);
				ipcRenderer.send("config.del", "schoolcode");
				ipcRenderer.send("config.del", "room");
				location.reload();
			}
		} else if(packet.type == "login") {
			if(!packet.success) {
				if(packet.error == "Teacher has not set a course yet") {
					new Dialog("#no-course-yet-dialog").show();
					return;
				}
				alert("Something isn't right. Please try again later.\n" + packet.error);
				return;
			}
			$("#login").style.display = "none";
			$("#levelpath").style.display = "";
		} else if(packet.type == "levelpath") {
			createButtons(packet.done, packet.locked, packet.isDone);
		} else if(packet.type == "leaderboard") {
			console.log(packet.leaderboard);
			setLeaderboard(packet.leaderboard);
			renderLeaderboards();
		} else if(packet.type == "info") {
			document.querySelector("#startWindow h1").innerText = packet.name;
			document.querySelector("#startWindow p").innerHTML = packet.desc;
		} else if(packet.type == "task") {
			if(!packet.success) {
				if(packet.error == "Course is not running") {
					new Dialog("#waiting-for-teacher-dialog").show();
					return;
				}
				alert("Something isn't right. Please try again later.\n" + packet.error);
				console.log(packet);
				return;
			}
			setTask(packet.task);
			setTaskIndex(-1);
			document.querySelector("#taskname").innerText = packet.task.name;
			document.querySelector("#levelpath").style.display = "none";
			document.querySelector("#editor").style.display = "";
			document.querySelector("#level-loader").style.display = "none";
			document.querySelector("#play-btn-svg").style.display = "";
			createWorkspace();
			if(packet.task.noclear) {
				setVarTags(packet.task.varTags)
				setBlockTags(packet.task.blockTags)
				fromXml(packet.task.startxml);
				setTaskXML(toXml())
			} else {
				fromXml(startXML);
				setTaskXML(startXML)
				setBlockTags({});
				setVarTags({});
			}
			correctPoints.push(toXml());
			if(packet.task.wiring) {
				$("#wiring").style.display = "";
				$("#wiring-begin-image").src = HTTP_PROTOCOL + "://" + SERVER + "/img/" + packet.task.wiring;
				$("#wiring-image").src = HTTP_PROTOCOL + "://" + SERVER + "/img/" + packet.task.wiring;
				new Dialog("#wiring-begin-dialog").show();
			} else {
				$("#wiring").style.display = "none";
				nextTask();
			}
		} else if(packet.type == "kick") {
			await Dialog.hideall();
			new Dialog("#kick-dialog").show();
		}
	})
	ws.addEventListener("error", () => {
		// if(!new Dialog("#loading-dialog").isShown) new Dialog("#loading-dialog").show();
		// document.querySelector("#status").innerText = translate("connecting-to-server") + " (" + (ws.retryCount + 1) + ")";
		new PSNotification("#connection-lost-notification").show();
	})
	// const server = ipcRenderer.sendSync("config.get", "server");
	// wsServer = server;
	// ws = new ReconnectingWebSocket(server);
	// ws.addEventListener("message", async (data) => {
	// 	const msg = data.data.toString();
	// 	console.log("MESSAGE: " + msg);
	// 	if(msg.startsWith("task ")) {
	// 		setTask(JSON.parse(msg.split("task ", 2)[1]));
	// 		setTaskIndex(-1);
	// 		document.querySelector("#taskname").innerText = task.name;
	// 		document.querySelector("#levelpath").style.display = "none";
	// 		document.querySelector("#editor").style.display = "";
	// 		document.querySelector("#level-loader").style.display = "none";
	// 		document.querySelector("#play-btn-svg").style.display = "";
	// 		createWorkspace();
	// 		if(task.noclear) {
	// 			setVarTags(task.varTags)
	// 			setBlockTags(task.blockTags)
	// 			fromXml(task.startxml);
	// 			setTaskXML(toXml())
	// 		} else {
	// 			fromXml(startXML);
	// 			setTaskXML(startXML)
	// 			setBlockTags({});
	// 			setVarTags({});
	// 		}
	// 		correctPoints.push(toXml());
	// 		nextTask();
	// 	} else if(msg.startsWith("finished")) {
	// 		await new Dialog("#loading-dialog").hide();
	// 	} else if(msg.startsWith("leaderboard ")) {
	// 		setLeaderboard(JSON.parse(msg.split("leaderboard ", 2)[1]));
	// 		renderLeaderboards();
	// 	} else if(msg == "notrunning") {
	// 		await new Dialog("#loading-dialog").hide();
	// 		new Dialog("#waiting-for-teacher-dialog").show();
	// 	} else if(msg == "end") {
	// 		// await new Dialog("#leaderboard-dialog").hide();
	// 		await new Dialog("#custom-dialog").hide();
	// 		new Dialog("#end-dialog").show();
	// 	} else if(msg == "start") {
	// 		await new Dialog("#waiting-for-teacher-dialog").hide();
	// 		await new Dialog("#end-dialog").hide();
	// 		if(document.querySelector("#start-btn").hasAttribute("data-level")) {
	// 			ws.send("task " + (parseInt(document.querySelector("#start-btn").getAttribute("data-level")) + 1))
	// 			setCurrentLevel(parseInt(document.querySelector("#start-btn").getAttribute("data-level")) + 1);
	// 		}
	// 	} else if(msg == "kick") {
	// 		await Dialog.hideall();
	// 		new Dialog("#kick-dialog").show();
	// 	} else if(msg.startsWith("levelpath ")) {
	// 		await new Dialog("#loading-dialog").hide();
	// 		document.querySelector("#levelpath").style.display = "";
	// 		createButtons(msg.split(" ")[1], msg.split(" ")[2], msg.split(" ")[3] == "1");
	// 	} else if(msg.startsWith("info ")) {
	// 		const info = JSON.parse(msg.split("info ", 2)[1]);
	// 		document.querySelector("#startWindow h1").innerText = info.name;
	// 		document.querySelector("#startWindow p").innerHTML = info.desc;
	// 	} else if(msg.startsWith("school ")) {
	// 		document.querySelector("#school").innerHTML = msg.split("school ", 2)[1];
	// 		document.querySelector("#login").style.display = "none";
	// 		ws.send("identify " + document.querySelector("#name").value);
	// 		document.querySelector("#status").innerText = translate("loading-tasks");
	// 	}
	// })
	// ws.addEventListener("error", (e) => {
	// 	if(!new Dialog("#loading-dialog").isShown) new Dialog("#loading-dialog").show();
	// 	document.querySelector("#status").innerText = translate("connecting-to-server") + " (" + ws.retryCount + ")";
	// })
}