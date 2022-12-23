import { workspace } from "../../../workspace.js";

export function event(e, INSTRUCTION) {
	if(!e instanceof Blockly.Events.EndBlockDrag) return false;
	if(workspace.getBlockById(e.blockId).type != "procedures_call") {
		return false;
	}
	return true;
}