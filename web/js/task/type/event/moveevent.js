import { blockTags } from "../../../workspace.js";

export function event(e, INSTRUCTION) {
	if(!(e instanceof Blockly.Events.Move)) return;
	if(INSTRUCTION.input) {
		if(e.newInputName != INSTRUCTION.input) return;
	}
	if(INSTRUCTION.parentTag) {
		if(e.newParentId != blockTags[INSTRUCTION.parentTag]) return;
	}
	return true;
}