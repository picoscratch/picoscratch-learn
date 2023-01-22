import { $ } from "../../../util.js";
import { blockTags, varTags, workspace } from "../../../workspace.js";
import { taskIndex } from "../../level.js";

let soundDelay = false;

export function event(e, INSTRUCTION) {
	if(!(e instanceof Blockly.Events.Change)) return false;
	if(e.element != "field") return false;
	if(!INSTRUCTION.targetBlockTag) {
		console.warn("No target block tag set to task index " + taskIndex);
		return false;
	}
	if(!blockTags[INSTRUCTION.targetBlockTag]) {
		console.warn("Block tag " + INSTRUCTION.targetBlockTag + " doesn't exist");
		return false;
	}
	if(workspace.getBlockById(e.blockId).getParent().id != blockTags[INSTRUCTION.targetBlockTag] && e.blockId != blockTags[INSTRUCTION.targetBlockTag]) {
		console.log(workspace.getBlockById(e.blockId).getParent().id + " expected but got " + blockTags[INSTRUCTION.targetBlockTag]);
		return false;
	}
	if(e.name != INSTRUCTION.name) {
		console.log(e.name + " expected but got " + INSTRUCTION.name);
		return false;
	}
	// for(let i = 0; i < wrong.length; i++) { if(hav[i] != wrong[i]) {console.log("OH NO!")} }

	
	// e.newValue == INSTRUCTION.to || 

	if(INSTRUCTION.valueVarTag || INSTRUCTION.valueBlockTag) {
		if((INSTRUCTION.valueVarTag && e.newValue == varTags[INSTRUCTION.valueVarTag]) || (INSTRUCTION.valueBlockTag && e.newValue == blockTags[INSTRUCTION.valueBlockTag])) {
			return true;
		}
	} else {
		if(e.newValue == INSTRUCTION.to) {
			return true;
		}
		for(let i = 0; i < e.newValue.length; i++) {
			if(e.newValue[i] != INSTRUCTION.to[i]) {
				// return false;
				// change the value back
				workspace.getBlockById(e.blockId).setFieldValue(e.oldValue, e.name);
				if($(".blocklyHtmlInput")) $(".blocklyHtmlInput").value = e.oldValue;
				if(!soundDelay) {
					new Audio("wrongkey.wav").play();
					soundDelay = true;
					setTimeout(() => soundDelay = false, 3000);
				}
				return undefined;
			}
		}
	}
	return undefined;
}