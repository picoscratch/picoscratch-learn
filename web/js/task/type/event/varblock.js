import { varTags, workspace } from "../../../workspace.js";

export function event(e, INSTRUCTION) {
	if(!e instanceof Blockly.Events.EndBlockDrag) return false;
	if(workspace.getBlockById(e.blockId).type != "data_variable") {
		return false;
	}	
	if(varTags[INSTRUCTION.varTag] != workspace.getBlockById(e.blockId).getVars()[0]) {
		return false;
	}
	return true;
}