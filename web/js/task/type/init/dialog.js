import { wsServer } from "../../server.js";
import { taskIndex } from "../../level.js";

export function init(task) {
	document.querySelector("#custom-dialog-title").innerHTML = task.instructions[taskIndex].title;
	document.querySelector("#custom-dialog-text").innerHTML = task.instructions[taskIndex].text.replaceAll("PICOSCRATCHSERVER", wsServer.replaceAll("ws://", "http://"));
	document.querySelector("#custom-dialog-button").innerHTML = task.instructions[taskIndex].closeButton;
	new Dialog("#custom-dialog").show();
}