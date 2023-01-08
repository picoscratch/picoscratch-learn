const ipcRenderer = require("electron/renderer").ipcRenderer;
const ReconnectingWebSocket = require("reconnecting-websocket");
import { translate } from "../lang.js";
import { createButtons } from "../levelpath/buttons.js";
import { correctPoints, createWorkspace, fromXml, setBlockTags, setTaskXML, setVarTags, startXML, toXml } from "../workspace.js";
import { renderLeaderboards, setLeaderboard } from "./leaderboard.js";
import { nextTask, setCurrentLevel, setTask, setTaskIndex, task } from "./level.js";

export let wsServer;
export let ws;

export function setWSServer(newServer) { wsServer = newServer; }
export function setWS(newWS) { ws = newWS; }

export function connectServer() {
	const server = ipcRenderer.sendSync("config.get", "server");
	wsServer = server;
	ws = new ReconnectingWebSocket(server);
	ws.addEventListener("message", async (data) => {
		const msg = data.data.toString();
		console.log("MESSAGE: " + msg);
		if(msg.startsWith("task ")) {
			setTask(JSON.parse(msg.split("task ", 2)[1]));
			setTaskIndex(-1);
			document.querySelector("#taskname").innerText = task.name;
			document.querySelector("#levelpath").style.display = "none";
			document.querySelector("#editor").style.display = "";
			document.querySelector("#level-loader").style.display = "none";
			document.querySelector("#play-btn-svg").style.display = "";
			createWorkspace();
			if(task.noclear) {
				setVarTags(task.varTags)
				setBlockTags(task.blockTags)
				fromXml(task.startxml);
				setTaskXML(toXml())
			} else {
				fromXml(startXML);
				setTaskXML(startXML)
				setBlockTags({});
				setVarTags({});
			}
			correctPoints.push(toXml());
			nextTask();
		} else if(msg.startsWith("finished")) {
			await new Dialog("#loading-dialog").hide();
		} else if(msg.startsWith("leaderboard ")) {
			setLeaderboard(JSON.parse(msg.split("leaderboard ", 2)[1]));
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
				setCurrentLevel(parseInt(document.querySelector("#start-btn").getAttribute("data-level")) + 1);
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
}