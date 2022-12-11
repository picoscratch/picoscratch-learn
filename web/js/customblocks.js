let newBlockWorkspace = null;
let newBlock = null;
let newBlockCallback = null;

export function setupCustomBlocks() {}

Blockly.Procedures.externalProcedureDefCallback = function (mutation, cb) {
	new Dialog("#new-block-dialog").show();
	newBlockWorkspace = Blockly.inject("newBlockWorkspace", { media: "media/" });
	document.querySelector("#newBlockWorkspace .blocklyFlyout").remove();
	document.querySelector("#newBlockWorkspace .blocklyFlyoutScrollbar").remove();
	document.querySelector("#newBlockWorkspace .blocklyToolboxDiv").remove();
	newBlockWorkspace.addChangeListener(function(e) {
		if(newBlock) {
			newBlock.onChangeFn();
		}
	});
	newBlockCallback = cb;
	newBlockWorkspace.clear();
	newBlock = newBlockWorkspace.newBlock('procedures_declaration');
	newBlock.domToMutation(mutation);
	newBlock.initSvg();
	newBlock.render(false);
}

document.querySelector("#cancelBlockCreation").addEventListener("click", cancelBlockCreation);
document.querySelector("#addBlockInput").addEventListener("click", addTextNumber);
document.querySelector("#createBlock").addEventListener("click", applyMutation);

function applyMutation() {
	for(const id of newBlock.argumentIds_) {
		newBlock.getInputTargetBlock(id).inputList[0].fieldRow[0].setText(newBlock.getInputTargetBlock(id).inputList[0].fieldRow[0].getText().replaceAll(" ", ""));
	}
	newBlock.getField().setText(newBlock.getField().getText().replaceAll(" ", ""));
	newBlock.onChangeFn();
	var mutation = newBlock.mutationToDom(/* opt_generateShadows */ true)
	console.log(mutation);
	newBlockCallback(mutation);
	newBlockCallback = null;
	newBlock = null;
	newBlockWorkspace.clear();
	while(document.querySelector("#newBlockWorkspace").firstChild) {
		document.querySelector("#newBlockWorkspace").firstChild.remove();
	}
	workspace.refreshToolboxSelection_()
	new Dialog("#new-block-dialog").hide();
}

// function addLabel() {
// 	newBlock.addLabelExternal();
// }

// function addBoolean() {
// 	newBlock.addBooleanExternal();
// }

function addTextNumber() {
	newBlock.addStringNumberExternal();
}

function cancelBlockCreation() {
	newBlockCallback = null;
	newBlock = null;
	while(document.querySelector("#newBlockWorkspace").firstChild) {
		document.querySelector("#newBlockWorkspace").firstChild.remove();
	}
	workspace.refreshToolboxSelection_()
	new Dialog("#new-block-dialog").hide();
}