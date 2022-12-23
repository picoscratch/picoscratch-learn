export function event(e, INSTRUCTION) {
	if(!e instanceof Blockly.Events.VarCreate) return false;
	if(e.varType != INSTRUCTION.vartype) return false;
	return true;
}