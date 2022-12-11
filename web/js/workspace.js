const prompt = require("electron-prompt");
export let workspace = null;

const startXML = `<xml xmlns="http://www.w3.org/1999/xhtml">
<variables></variables>
<block type="event_whenflagclicked" id="{!5G[{H3qE2[NMQ;pK)W" x="300" y="400"></block>
</xml>`

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

fromXml(startXML);

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
	var xml = Blockly.Xml.textToDom(input);
	workspace.clear();
	Blockly.Xml.domToWorkspace(xml, workspace);
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