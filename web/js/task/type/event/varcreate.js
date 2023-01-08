import { varTags } from "../../../workspace.js";

export function event(e, INSTRUCTION) {
	if(!(e instanceof Blockly.Events.VarCreate)) return false;
	if(e.varType != INSTRUCTION.vartype) return false;
	if(INSTRUCTION.varTag) varTags[INSTRUCTION.varTag] = e.varId;
	return true;
}