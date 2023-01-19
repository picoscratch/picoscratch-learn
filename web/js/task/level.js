import { connectPort, writePort } from "../port.js";
import { ws, wsServer } from "../task/server.js";
import { workspace } from "../workspace.js";
import { autoBlockGlow } from "./type/init/regular.js";
import { init as initComment } from "./type/init/comment.js"
import { init as initDialog } from "./type/init/dialog.js"
import { init as initQuiz } from "./type/init/quiz.js"
import { init as initRegular } from "./type/init/regular.js"
import { updatePythonTab } from "../script.js";

export let taskIndex = -1;
export let currentLevel = 1;
export let task;
export let answeredqs = 0;
export let correctqs = 0;

export function setTaskIndex(newIndex) { taskIndex = newIndex; }
export function setCurrentLevel(newLevel) { currentLevel = newLevel; }
export function setTask(newTask) { task = newTask; }
export function setAnsweredQs(newAnsweredQs) { answeredqs = newAnsweredQs; }
export function setCorrectQs(newCorrectQs) { correctqs = newCorrectQs; }

/**
 * @deprecated
 */
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
	// await new Dialog("#loading-dialog").show()
	// ws.send("done " + currentLevel + " " + answeredqs + " " + correctqs);
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

export function nextTask() {
	if(taskIndex == -1) {
		connectPort();
	}
	if(autoBlockGlow) clearTimeout(autoBlockGlow);
	if(task.instructions[taskIndex] && task.instructions[taskIndex].block) {
		if(workspace.getBlockById(task.instructions[taskIndex].block)) workspace.glowStack(task.instructions[taskIndex].block, false);
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
	switch(task.instructions[taskIndex].type) {
		case "comment":
			initComment(task);
			break;
		case "dialog":
			initDialog(task);
			break;
		case "quiz":
			initQuiz(task);
			break;
		default:
			initRegular(task);
			break;
	}
}