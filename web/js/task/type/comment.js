import { blockTags, workspace } from "../../workspace.js";
import { nextTask, taskIndex } from "../level.js";

export function init(task) {
	workspace.getBlockById(blockTags[task.instructions[taskIndex].blockTag]).setCommentText(task.instructions[taskIndex].content);
	nextTask();
}