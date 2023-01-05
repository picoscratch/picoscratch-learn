import { workspace } from "../../../workspace.js";
import { taskIndex } from "../../level.js";

export let autoBlockGlow;

export function init(task) {
	if(task.instructions[taskIndex].block) {
		if(workspace.getBlockById(task.instructions[taskIndex].block)) {
			autoBlockGlow = setTimeout(() => {
				workspace.glowStack(task.instructions[taskIndex].block, true);
				new Audio("appear.wav").play();
			}, 1000*60*2); // 2 minutes
		}
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