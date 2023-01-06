import { blockTags, workspace } from "../../../workspace.js";

export function event(e, INSTRUCTION) {
	if(!(e instanceof Blockly.Events.EndBlockDrag)) return;
	console.log("Regular event: ", e, INSTRUCTION);
	if(!workspace.getBlockById(e.blockId)) return;
	if(workspace.getBlockById(e.blockId).type == "event_whenflagclicked") return;
	if(INSTRUCTION.block && workspace.getBlockById(e.blockId).type !== INSTRUCTION.block) {
		console.log(INSTRUCTION.block + " wanted but " + workspace.getBlockById(e.blockId).type + " given");
		return false;
	}
	if(INSTRUCTION.previousBlock && workspace.getBlockById(e.blockId).getPreviousBlock().type !== INSTRUCTION.previousBlock) {
		console.log(INSTRUCTION.previousBlock + " wanted as previous block but " + workspace.getBlockById(e.blockId).getPreviousBlock().type + " given");
		return false;
	}
	if(INSTRUCTION.parentBlock && workspace.getBlockById(e.blockId).getParent().type !== INSTRUCTION.parentBlock) {
		console.log(INSTRUCTION.parentBlock + " wanted as parent block but " + workspace.getBlockById(e.blockId).getParent().type + " given");
		return false;
	}
	if(INSTRUCTION.parentTag && blockTags[INSTRUCTION.parentTag] != workspace.getBlockById(e.blockId).getParent().id) {
		console.log(blockTags[INSTRUCTION.parentTag] + " wanted as parent tag but " + workspace.getBlockById(e.blockId).getParent().id + " given");
		return false;
	}
	if(INSTRUCTION.previousTag && blockTags[INSTRUCTION.previousTag] != workspace.getBlockById(e.blockId).getPreviousBlock().id) {
		console.log(blockTags[INSTRUCTION.previousTag] + " wanted as previous tag but " + workspace.getBlockById(e.blockId).getPreviousBlock().id + " given");
		return false;
	}
	if(INSTRUCTION.parentStack) {
		if(!workspace.getBlockById(e.blockId).getParent().getInputTargetBlock(INSTRUCTION.parentStack)) {
			return false;
		} else {
			if(workspace.getBlockById(e.blockId).getParent().getInputTargetBlock(INSTRUCTION.parentStack).id != e.blockId) {
				return false;
			}
		}
	}
	return true;
}