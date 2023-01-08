import { varTags } from "../../../workspace.js";

export function event(e, INSTRUCTION) {
	if(!(e instanceof Blockly.Events.VarDelete)) return false;
	if(e.varId != varTags[INSTRUCTION.targetVarTag]) return false;
	return true;
}