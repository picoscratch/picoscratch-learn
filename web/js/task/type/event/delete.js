import { blockTags, workspace } from "../../../workspace.js";

export function event(e, INSTRUCTION) {
	if(!e instanceof Blockly.Events.Delete) return false;
	if(!e.ids.find((e) => e == blockTags[INSTRUCTION.targetBlockTag])) {
		return false;
	}
	return true;
}