import { blockTags, varTags, workspace } from "../../../workspace.js";
import { taskIndex } from "../../level.js";

export function event(e, INSTRUCTION) {
	if(!(e instanceof Blockly.Events.Change)) return false;
	if(e.element != "field") return false;
	if(!INSTRUCTION.targetBlockTag) {
		console.warn("No target block tag set to task index " + taskIndex);
		return false;
	}
	if(!blockTags[INSTRUCTION.targetBlockTag]) {
		console.warn("Block tag " + INSTRUCTION.targetBlockTag + " doesn't exist");
		return false;
	}
	if(workspace.getBlockById(e.blockId).getParent().id != blockTags[INSTRUCTION.targetBlockTag] && e.blockId != blockTags[INSTRUCTION.targetBlockTag]) {
		console.log(workspace.getBlockById(e.blockId).getParent().id + " expected but got " + blockTags[INSTRUCTION.targetBlockTag]);
		return false;
	}
	if(e.name != INSTRUCTION.name) {
		console.log(e.name + " expected but got " + INSTRUCTION.name);
		return false;
	}
	if(e.newValue == INSTRUCTION.to || (INSTRUCTION.valueVarTag && e.newValue == varTags[INSTRUCTION.valueVarTag]) || (INSTRUCTION.valueBlockTag && e.newValue == blockTags[INSTRUCTION.valueBlockTag])) {
		return true;
	}
	return undefined;
}