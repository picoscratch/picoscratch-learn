import { blockTags, workspace } from "../../../workspace.js";

export function event(e, INSTRUCTION) {
	console.log("DEL: ", e);
	if(e instanceof Blockly.Events.EndBlockDrag) {
		const block = workspace.getBlockById(e.blockId);
		if(block != null) return false;
		return;
	}
	if(!(e instanceof Blockly.Events.Delete)) return false;
	if(!e.ids.find((e) => e == blockTags[INSTRUCTION.targetBlockTag])) {
		return false;
	}
	if(INSTRUCTION.bannedBlockTags) {
		if(e.ids.find((e) => INSTRUCTION.bannedBlockTags.includes(Object.keys(blockTags).find((tag) => blockTags[tag] == e)))) {
			return false;
		}
	}
	return true;
}