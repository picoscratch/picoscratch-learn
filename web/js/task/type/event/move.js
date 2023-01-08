import { blockTags } from "../../../workspace.js";

export function event(e, INSTRUCTION) {
	if(!(e instanceof Blockly.Events.EndBlockDrag)) return false;
	if(e.blockId != blockTags[INSTRUCTION.fromBlockTag]) return false;
	if(e.newParentId != blockTags[INSTRUCTION.toBlockTag]) return false;
	return true;
}