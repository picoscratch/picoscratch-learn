import { setupCustomBlocks } from "./customblocks.js";
import { event as changeblockEvent } from "./task/type/event/changeblock.js";
import { event as customBlockEvent } from "./task/type/event/customblock.js";
import { event as customBlockArgEvent } from "./task/type/event/customblockarg.js";
import { event as customBlockCallEvent } from "./task/type/event/customblockcall.js";
import { event as deleteEvent } from "./task/type/event/delete.js";
import { event as moveEvent } from "./task/type/event/move.js";
import { event as regularEvent } from "./task/type/event/regular.js";
import { event as varBlockEvent } from "./task/type/event/varblock.js";
import { event as varCreateEvent } from "./task/type/event/varcreate.js";
import { event as varDeleteEvent } from "./task/type/event/vardelete.js";

const prompt = require("electron-prompt");
import { getLang } from "./lang.js";
import { taskIndex, nextTask, task } from "./task/level.js";
export let workspace = null;
export let blockTags = {};
export let varTags = {};

export const startXML = `<xml xmlns="http://www.w3.org/1999/xhtml">
<variables></variables>
<block type="event_whenflagclicked" id="{!5G[{H3qE2[NMQ;pK)W" x="300" y="400"></block>
</xml>`
export let taskXML = startXML;
export let correctPoints = [];

export function setTaskXML(newXML) { taskXML = newXML; }
export function setBlockTags(newBlockTags) { blockTags = newBlockTags; }
export function setVarTags(newVarTags) { varTags = newVarTags; }
export function setCorrectPoints(newCorrectPoints) { correctPoints = newCorrectPoints; }

export function createWorkspace() {
	workspace = Blockly.inject("blocklyDiv", {
		comments: true,
		disable: false,
		collapse: false,
		media: "media/",
		readOnly: false,
		rtl: false,
		scrollbars: true,
		toolbox: getToolboxElement(),
		toolboxPosition: "start",
		horizontalLayout: false,
		trashcan: false,
		sounds: true,
		zoom: {
			controls: true,
			wheel: true,
			startScale: 0.75,
			maxScale: 4,
			minScale: 0.25,
			scaleSpeed: 1.1
		},
		colours: {
			fieldShadow: "rgba(255, 255, 255, 0.3)",
			dragShadowOpacity: 0.6
		}
	});
	
	window.workspace = workspace;
	
	workspace.addChangeListener((e) => {
		console.log(e);
		const INSTRUCTION = task.instructions[taskIndex];
		if(!INSTRUCTION) return;
		let allow = true;
		if(INSTRUCTION.type == "dialog" || INSTRUCTION.type == "quiz" || INSTRUCTION.type == "comment") return;
		if(e instanceof Blockly.Events.CommentCreate || e instanceof Blockly.Events.CommentDelete || e instanceof Blockly.Events.CommentMove || e instanceof Blockly.Events.CommentChange) return;
		if(e instanceof Blockly.Events.Ui) return;
		//if(e instanceof Blockly.Events.Move && !e.oldParentId) return;
		if(e instanceof Blockly.Events.Move) return;
		const regularEventResult = regularEvent(e, INSTRUCTION);
		console.log("regular event result: ", regularEventResult);
		if(regularEventResult !== undefined && !regularEventResult) {
			console.log("Regular event does not allow");
			allow = false;
		} else {
			console.log("Regular event allows");
		}
		let func;
		switch(INSTRUCTION.type) {
			case "changeblock": func = changeblockEvent; break;
			case "customblock": func = customBlockEvent; break;
			case "customblockarg": func = customBlockArgEvent; break;
			case "customblockcall": func = customBlockCallEvent; break;
			case "delete": func = deleteEvent; break;
			case "move": func = moveEvent; break;
			case "varblock": func = varBlockEvent; break;
			case "varcreate": func = varCreateEvent; break;
			case "vardelete": func = varDeleteEvent; break;
		}
		if(func) {
			const funcResult = func(e, INSTRUCTION);
			if(funcResult === undefined) return;
			if(!funcResult) {
				console.log(INSTRUCTION.type, "Event does not allow");
				allow = false;
			} else {
				console.log(INSTRUCTION.type, "Event allows");
			}
		} else if(regularEventResult === undefined) {
			allow = undefined;
		}
		if(allow === undefined) return;
		if(allow) {
			if(INSTRUCTION.blockTag) {
				blockTags[INSTRUCTION.blockTag] = e.blockId;
			}
			correctPoints.push(toXml());
			nextTask();
		} else {
			// workspace.getBlockById(e.blockId).dispose(true, true);
			fromXml(correctPoints.pop());
			correctPoints.push(toXml());
			document.querySelector("#instruction").animate([{
				color: "white",
				fontSize: "1.1rem"
			},
			{
				color: "red",
				fontSize: "1.3rem"
			},
			{
				color: "red",
				fontSize: "1.3rem"
			},
			{
				color: "red",
				fontSize: "1.3rem"
			},
			{
				color: "white",
				fontSize: "1.1rem"
			}],
			{
				duration: 1000
			})
		}
		// if(e instanceof Blockly.Events.EndBlockDrag) {
		// 	// if(!workspace.getBlockById(e.blockId)) return;
		// 	// if(workspace.getBlockById(e.blockId).startHat_) return;
		// 	if(INSTRUCTION.type == "changeblock") allow = false;
		// 	if(INSTRUCTION.type == "varcreate") allow = false;
		// 	if(INSTRUCTION.block && workspace.getBlockById(e.blockId).type !== INSTRUCTION.block) {
		// 		console.log(INSTRUCTION.block + " wanted but " + workspace.getBlockById(e.blockId).type + " given");
		// 		allow = false;
		// 	}
		// 	if(INSTRUCTION.previousBlock && workspace.getBlockById(e.blockId).getPreviousBlock().type !== INSTRUCTION.previousBlock) {
		// 		console.log(INSTRUCTION.previousBlock + " wanted as previous block but " + workspace.getBlockById(e.blockId).getPreviousBlock().type + " given");
		// 		allow = false;
		// 	}
		// 	if(INSTRUCTION.parentBlock && workspace.getBlockById(e.blockId).getParent().type !== INSTRUCTION.parentBlock) {
		// 		console.log(INSTRUCTION.parentBlock + " wanted as parent block but " + workspace.getBlockById(e.blockId).getParent().type + " given");
		// 		allow = false;
		// 	}
		// 	if(INSTRUCTION.parentTag && blockTags[INSTRUCTION.parentTag] != workspace.getBlockById(e.blockId).getParent().id) {
		// 		console.log(blockTags[INSTRUCTION.parentTag] + " wanted as parent tag but " + workspace.getBlockById(e.blockId).getParent().id + " given");
		// 		allow = false;
		// 	}
		// 	if(INSTRUCTION.previousTag && blockTags[INSTRUCTION.previousTag] != workspace.getBlockById(e.blockId).getPreviousBlock().id) {
		// 		console.log(blockTags[INSTRUCTION.previousTag] + " wanted as previous tag but " + workspace.getBlockById(e.blockId).getPreviousBlock().id + " given");
		// 		allow = false;
		// 	}
		// 	if(INSTRUCTION.parentStack) {
		// 		if(!workspace.getBlockById(e.blockId).getParent().getInputTargetBlock(INSTRUCTION.parentStack)) {
		// 			allow = false;
		// 		} else {
		// 			if(workspace.getBlockById(e.blockId).getParent().getInputTargetBlock(INSTRUCTION.parentStack).id != e.blockId) {
		// 				allow = false;
		// 			}
		// 		}
		// 	}
		// 	if(INSTRUCTION.type == "varblock") {
		// 		if(workspace.getBlockById(e.blockId).type != "data_variable") {
		// 			allow = false;
		// 		}	
		// 		if(varTags[INSTRUCTION.varTag] != workspace.getBlockById(e.blockId).getVars()[0]) {
		// 			allow = false;
		// 		}
		// 	}
		// 	if(INSTRUCTION.type == "customblockcall") {
		// 		if(workspace.getBlockById(e.blockId).type != "procedures_call") {
		// 			allow = false;
		// 		}
		// 	}
		// 	if(INSTRUCTION.type == "customblockarg") {
		// 		if(workspace.getBlockById(e.blockId).type != "argument_reporter_string_number") {
		// 			allow = false;
		// 		}
		// 	}
		// 	if(INSTRUCTION.type == "move") {
		// 		if(e.blockId != blockTags[INSTRUCTION.fromBlockTag]) return;
		// 		if(e.newParentId != blockTags[INSTRUCTION.toBlockTag]) return;
		// 		console.log("Passed move test!");
		// 	}
		// 	
		// }
		// if(e instanceof Blockly.Events.Delete) {
		// 	const INSTRUCTION = task.instructions[taskIndex];
		// 	if(INSTRUCTION.type != "delete") return;
		// 	console.log(e.ids.find((e) => e == blockTags[INSTRUCTION.targetBlockTag]), "IDS");
		// 	if(e.ids.find((e) => e == blockTags[INSTRUCTION.targetBlockTag])) {
		// 		correctPoints.push(toXml());
		// 		nextTask();
		// 		console.log("good delete, continuing");
		// 	} else {
		// 		console.log("wrong delete, going back");
		// 		fromXml(correctPoints.pop());
		// 		document.querySelector("#instruction").animate([{
		// 			color: "white",
		// 			fontSize: "1.1rem"
		// 		},
		// 		{
		// 			color: "red",
		// 			fontSize: "1.3rem"
		// 		},
		// 		{
		// 			color: "red",
		// 			fontSize: "1.3rem"
		// 		},
		// 		{
		// 			color: "red",
		// 			fontSize: "1.3rem"
		// 		},
		// 		{
		// 			color: "white",
		// 			fontSize: "1.1rem"
		// 		}],
		// 		{
		// 			duration: 1000
		// 		})
		// 	}
		// }
		// if(e instanceof Blockly.Events.Create) {
		// 	if(!workspace.getBlockById(e.blockId)) return;
		// 	const INSTRUCTION = task.instructions[taskIndex];
		// 	let allow = true;
		// 	if(INSTRUCTION.type != "customblock") return;
		// 	if(workspace.getBlockById(e.blockId).type != "procedures_definition") {
		// 		allow = false;
		// 	}
		// 	if(workspace.getBlockById(e.blockId).childBlocks_[0].procCode_.split("").filter((e) => e == '%').length != INSTRUCTION.args) {
		// 		allow = false;
		// 	}
		// 	if(allow) {
		// 		if(INSTRUCTION.blockTag) {
		// 			blockTags[INSTRUCTION.blockTag] = e.blockId;
		// 		}
		// 		// correctPoints.push(toXml());
		// 		nextTask();
		// 	} else {
		// 		// fromXml(correctPoints.pop());
		// 		workspace.getBlockById(e.blockId).dispose(true, true);
		// 		document.querySelector("#instruction").animate([{
		// 			color: "white",
		// 			fontSize: "1.1rem"
		// 		},
		// 		{
		// 			color: "red",
		// 			fontSize: "1.3rem"
		// 		},
		// 		{
		// 			color: "red",
		// 			fontSize: "1.3rem"
		// 		},
		// 		{
		// 			color: "red",
		// 			fontSize: "1.3rem"
		// 		},
		// 		{
		// 			color: "white",
		// 			fontSize: "1.1rem"
		// 		}],
		// 		{
		// 			duration: 1000
		// 		})
		// 	}
		// }
		// if(e instanceof Blockly.Events.VarDelete) {
		// 	const INSTRUCTION = task.instructions[taskIndex];
		// 	if(INSTRUCTION.type != "vardelete") return;
		// 	let allow = true;
		// 	if(e.varId != varTags[INSTRUCTION.targetVarTag]) allow = false;
		// 	if(allow) {
		// 		correctPoints.push(toXml());
		// 		nextTask();
		// 	} else {
		// 		fromXml(correctPoints.pop());
		// 		document.querySelector("#instruction").animate([{
		// 			color: "white",
		// 			fontSize: "1.1rem"
		// 		},
		// 		{
		// 			color: "red",
		// 			fontSize: "1.3rem"
		// 		},
		// 		{
		// 			color: "red",
		// 			fontSize: "1.3rem"
		// 		},
		// 		{
		// 			color: "red",
		// 			fontSize: "1.3rem"
		// 		},
		// 		{
		// 			color: "white",
		// 			fontSize: "1.1rem"
		// 		}],
		// 		{
		// 			duration: 1000
		// 		})
		// 	}
		// }
		// if(e instanceof Blockly.Events.VarCreate) {
		// 	const INSTRUCTION = task.instructions[taskIndex];
		// 	if(INSTRUCTION.type != "varcreate") return;
		// 	let allow = true;
		// 	if(e.varType != INSTRUCTION.vartype) allow = false;
		// 	if(allow) {
		// 		if(INSTRUCTION.varTag) {
		// 			varTags[INSTRUCTION.varTag] = e.varId;
		// 		}
		// 		correctPoints.push(toXml());
		// 		nextTask();
		// 	} else {
		// 		fromXml(correctPoints.pop());
		// 		document.querySelector("#instruction").animate([{
		// 			color: "white",
		// 			fontSize: "1.1rem"
		// 		},
		// 		{
		// 			color: "red",
		// 			fontSize: "1.3rem"
		// 		},
		// 		{
		// 			color: "red",
		// 			fontSize: "1.3rem"
		// 		},
		// 		{
		// 			color: "red",
		// 			fontSize: "1.3rem"
		// 		},
		// 		{
		// 			color: "white",
		// 			fontSize: "1.1rem"
		// 		}],
		// 		{
		// 			duration: 1000
		// 		})
		// 	}
		// }
		// if(e instanceof Blockly.Events.Change) {
		// 	const INSTRUCTION = task.instructions[taskIndex];
		// 	if(INSTRUCTION.type != "changeblock") return;
		// 	if(e.element != "field") return;
		// 	if(!INSTRUCTION.targetBlockTag) {
		// 		console.warn("No target block tag set to task index " + taskIndex);
		// 		return;
		// 	}
		// 	if(!blockTags[INSTRUCTION.targetBlockTag]) {
		// 		console.warn("Block tag " + INSTRUCTION.targetBlockTag + " doesn't exist");
		// 		return;
		// 	}
		// 	if(workspace.getBlockById(e.blockId).getParent().id != blockTags[INSTRUCTION.targetBlockTag] && e.blockId != blockTags[INSTRUCTION.targetBlockTag]) {
		// 		console.log(workspace.getBlockById(e.blockId).getParent().id + " expected but got " + blockTags[INSTRUCTION.targetBlockTag]);
		// 		return;
		// 	}
		// 	if(e.name != INSTRUCTION.name) {
		// 		console.log(e.name + " expected but got " + INSTRUCTION.name);
		// 		return;
		// 	}
		// 	if(e.newValue == INSTRUCTION.to || (INSTRUCTION.valueVarTag && e.newValue == varTags[INSTRUCTION.valueVarTag]) || (INSTRUCTION.valueBlockTag && e.newValue == blockTags[INSTRUCTION.valueBlockTag])) {
		// 		correctPoints.push(toXml());
		// 		nextTask();
		// 	}
		// }
	})
	
	fromXml(startXML);
	setupCustomBlocks();

	setLocale(getLang());
}

Blockly.prompt = (msg, defaultValue, callback) => {
	prompt({
		title: "PicoScratch",
		label: msg,
		value: defaultValue
	}).then(res => {
		callback(res);
	})
}

function getToolboxElement() {
	return document.getElementById("toolbox-categories");
}

export function toXml() {
	// var output = document.getElementById("importExport");
	var xml = Blockly.Xml.workspaceToDom(workspace);
	xml = Blockly.Xml.domToPrettyText(xml);
	return xml;
}

export function fromXml(input) {
	Blockly.Events.disable()
	var xml = Blockly.Xml.textToDom(input);
	workspace.clear();
	Blockly.Xml.domToWorkspace(xml, workspace);
	Blockly.Events.enable()
}

function glowBlock() {
	if (Blockly.selected) {
		workspace.glowBlock(Blockly.selected.id, true);
	}
}

function unglowBlock() {
	if (Blockly.selected) {
		workspace.glowBlock(Blockly.selected.id, false);
	}
}

function glowStack() {
	if (Blockly.selected) {
		workspace.glowStack(Blockly.selected.id, true);
	}
}

function unglowStack() {
	if (Blockly.selected) {
		workspace.glowStack(Blockly.selected.id, false);
	}
}

function report(block, text) {
	workspace.reportValue(
		block,
		text
	);
}
window.report = report;

export function setLocale(locale) {
	workspace.getFlyout().setRecyclingEnabled(false);
	var xml = Blockly.Xml.workspaceToDom(workspace);
	Blockly.ScratchMsgs.setLocale(locale);
	Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, workspace);
	workspace.getFlyout().setRecyclingEnabled(true);
}