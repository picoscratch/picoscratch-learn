import { varTags, workspace } from "../../../workspace.js";

export function event(e, INSTRUCTION) {
	console.log("varblock, e type: ", e instanceof Blockly.Events.EndBlockDrag);
	if(!(e instanceof Blockly.Events.EndBlockDrag)) return undefined;
	if(workspace.getBlockById(e.blockId).type != "data_variable") {
		console.log("varblock, not a variable");
		return false;
	}	
	if(varTags[INSTRUCTION.varTag] != workspace.getBlockById(e.blockId).getVars()[0]) {
		console.log("varblock, not the var wanted")
		return false;
	}
	console.log("varblock, allow")
	return true;
}