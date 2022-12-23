import { workspace } from "../../../workspace.js";

export function event(e, INSTRUCTION) {
	if(!e instanceof Blockly.Events.Create) return false;
	if(workspace.getBlockById(e.blockId).type != "procedures_definition") {
		return false;
	}
	if(workspace.getBlockById(e.blockId).childBlocks_[0].procCode_.split("").filter((e) => e == '%').length != INSTRUCTION.args) {
		return false;
	}
	return true;
}