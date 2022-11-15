'use strict';

const parseXML = require("xml2js").parseStringPromise;
const { SerialPort } = require('serialport')
const { autoDetect } = require("@serialport/bindings-cpp")
const prompt = require("electron-prompt");
const ipcRenderer = require("electron/renderer").ipcRenderer;
const fs = require("fs");

const TASKS = JSON.parse(fs.readFileSync("tasks.json", { encoding: "utf-8" }));
let taskIndex = -1;
// TODO: show error message using my dialog lib
if(location.hash == "") location.href = "";
if(isNaN(location.hash.substring(1).split("_")[0])) location.href = "index.html";
let currentLevel = parseInt(location.hash.substring(1).split("_")[0]);
const playername = location.hash.substring(1).split("_")[1];
const playerscore = location.hash.substring(1).split("_")[2];

function nextTask() {
	taskIndex++;
	if(taskIndex >= TASKS[currentLevel].instructions.length) {
		document.querySelector("#instruction").innerText = "Super! Jetzt drück die grüne Flagge!";
		document.querySelector("#greenflag").disabled = false;
		document.querySelector("#reset").style.display = "none";
		document.querySelector("#next").style.display = "";
		updatePythonTab();
		document.querySelector("#pythontab").style.width = "40%";
		document.querySelector("#pythontab").style.display = "flex";
		document.querySelector("#code-in-py").style.display = "";
		return;
	}
	document.querySelector("#instruction").innerText = TASKS[currentLevel].instructions[taskIndex].text;
	document.querySelector("#instruction").animate([{
		fontSize: "1.1rem"
	},
	{
		fontSize: "1.3rem"
	},
	{
		fontSize: "1.1rem"
	}],
	{
		duration: 500
	})
}

let picoport;
let port;
autoDetect().list().then(async ports => {
	picoport = ports.find(p => p.manufacturer == "MicroPython").path;
	port = new SerialPort({
		path: picoport,
		baudRate: 115200,
	});
	port.on('readable', async function () {
		const data = port.read().toString()
		document.querySelector("#console").innerText += data;
		document.querySelector("#console").scrollTop = document.querySelector("#console").scrollHeight;
		document.dispatchEvent(new CustomEvent("portdata", {detail: data}))
	})
});

window.addEventListener("beforeunload", async () => {
	await writePort("\r\x03")
	port.close();
})

let workspace = null;
let soundsEnabled = true;
let running = false;

const startXML = `<xml xmlns="http://www.w3.org/1999/xhtml">
<variables></variables>
<block type="event_whenflagclicked" id="{!5G[{H3qE2[NMQ;pK)W" x="300" y="400"></block>
</xml>`

function start() {
	document.querySelector("#taskname").innerText = TASKS[currentLevel].name;
	nextTask();

	soundsEnabled = true;

	// Setup blocks
	// Parse the URL arguments.
	var match = location.search.match(/dir=([^&]+)/);
	// var rtl = match && match[1] == 'rtl';
	// document.forms.options.elements.dir.selectedIndex = Number(rtl);
	var toolbox = getToolboxElement();
	// document.forms.options.elements.toolbox.selectedIndex =
	// 	toolbox ? 1: 0;

	match = location.search.match(/side=([^&]+)/);

	var side = match ? match[1] : 'start';

	// document.forms.options.elements.side.value = side;

	match = location.search.match(/locale=([^&]+)/);
	var locale = match ? match[1] : 'en';
	Blockly.ScratchMsgs.setLocale(locale);
	// document.forms.options.elements.locale.value = locale;

	// Create main workspace.
	workspace = Blockly.inject('blocklyDiv', {
		comments: true,
		disable: false,
		collapse: false,
		media: 'media/',
		readOnly: false,
		rtl: false,
		scrollbars: true,
		toolbox: toolbox,
		toolboxPosition: side == 'top' || side == 'start' ? 'start' : 'end',
		horizontalLayout: side == 'top' || side == 'bottom',
		trashcan: false,
		sounds: soundsEnabled,
		zoom: {
			controls: true,
			wheel: true,
			startScale: 0.75,
			maxScale: 4,
			minScale: 0.25,
			scaleSpeed: 1.1
		},
		colours: {
			fieldShadow: 'rgba(255, 255, 255, 0.3)',
			dragShadowOpacity: 0.6
		}
	});

	workspace.addChangeListener((e) => {
		if(e instanceof Blockly.Events.Create || e instanceof Blockly.Events.Delete || e instanceof Blockly.Events.Change || e instanceof Blockly.Events.Move || e instanceof Blockly.Events.VarDelete || e instanceof Blockly.Events.VarRename) {
			if(running) cancel = true;
		}
		if(e instanceof Blockly.Events.EndBlockDrag) {
			if(!workspace.getBlockById(e.blockId)) return;
			if(workspace.getBlockById(e.blockId).startHat_) return;
			if(workspace.getBlockById(e.blockId).type == TASKS[currentLevel].instructions[taskIndex].block &&
				workspace.getBlockById(e.blockId).getPreviousBlock().type == TASKS[currentLevel].instructions[taskIndex].previousBlock) {
					nextTask();
			} else {
				workspace.getBlockById(e.blockId).dispose(true);
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
		}
	})

	fromXml(startXML);

	document.querySelector("#greenflag").addEventListener("click", async () => {
		await run();
	})
	// document.querySelector("#stop").addEventListener("click", async () => {
	// 	await writePort("\r\x03")
	// })
	document.querySelector("#console_input").addEventListener("keypress", async (e) => {
		if(e.key == "Enter") {
			await writePort(document.querySelector("#console_input").value + "\r\n")
			document.querySelector("#console_input").value = "";
		}
	})
	// document.querySelector("#save").addEventListener("click", async () => {
	// 	ipcRenderer.send("save", toXml());
	// })
	// document.querySelector("#load").addEventListener("click", async () => {
	// 	const v = ipcRenderer.sendSync("load");
	// 	if(v != null) fromXml(v);
	// })
	document.querySelector("#reset").addEventListener("click", async () => {
		fromXml(startXML);
		taskIndex = -1;
		nextTask();
	})
	document.querySelector("#next").addEventListener("click", async () => {
		location.href = "index.html#level-complete_" + currentLevel + "_" + playername + "_" + playerscore;
	})
	document.querySelector("#tab-scratch").addEventListener("click", async () => {
		document.querySelector("#pythontab").style.display = "none";
		document.querySelector("#blocklyDiv").style.display = "";
		document.querySelector("#tab-scratch").classList.add("selected");
		document.querySelector("#tab-python").classList.remove("selected");
	})
	document.querySelector("#tab-python").addEventListener("click", async () => {
		await updatePythonTab();
		document.querySelector("#blocklyDiv").style.display = "none";
		document.querySelector("#pythontab").style.display = "flex";
		document.querySelector("#tab-scratch").classList.remove("selected");
		document.querySelector("#tab-python").classList.add("selected");
	})
	document.querySelector("#tab-language").addEventListener("change", async () => {
		setLocale(document.querySelector("#tab-language").value);
	})

	Blockly.prompt = (msg, defaultValue, callback) => {
		prompt({
			title: "PicoScratch",
			label: msg,
			value: defaultValue
		}).then(res => {
			callback(res);
		})
	}

	const lang = ipcRenderer.sendSync("config.get", "lang");
	setLocale(lang);
	document.querySelector("#tab-language").value = lang;

}

async function updatePythonTab() {
	await makeCode();
	document.querySelector("#pythontab").getElementsByTagName("code")[0].textContent = imports.map(l => { return "import " + l + " # Importiert die Bibliothek \"" + l + "\"\n"; }).join("") + finalCode;
	hljs.highlightElement(document.querySelector("#pythontab").getElementsByTagName("code")[0]);
}

function getToolboxElement() {
	return document.getElementById('toolbox-categories');
}

function toXml() {
	// var output = document.getElementById('importExport');
	var xml = Blockly.Xml.workspaceToDom(workspace);
	xml = Blockly.Xml.domToPrettyText(xml);
	return xml;
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function writePort(text) {
	return new Promise(async (resolve) => {
		// await sleep(100);
		port.write(text, (err) => {
			if(err) console.error(err);
			resolve();
		})
	})
}

function readPortReponse() {
	return new Promise(async (resolve) => {
		const handler = (data) => {
			resolve(data.detail.split("\n")[0]);
			removeEventListener("portdata", handler);
		};
		document.addEventListener("portdata", handler);
	})
}

let cancel = false;
// let vars = [];
// let lists = [];
let finalCode = "";
let imports = [];
let indent = "";

async function addImport(lib) {
	if(!imports.includes(lib)) imports.push(lib);
}

async function run() {
	await makeCode();
	await writePort("\r\x05")
	for(const lib of imports) {
		await writePort("import " + lib + "\r\n");
	}
	await writePort(finalCode);
	await writePort("\r\x04");
	document.querySelector("#console").innerText = "";
}

async function makeCode() {
	indent = "";
	finalCode = "";
	const res = await parseXML(toXml());
	// vars = [];
	// lists = [];
	if(res.xml.variables[0] != "") {
		res.xml.variables.filter(v => v.variable[0].$.type == "").forEach(v => {
			finalCode += v.variable[0]._ + " = \"\"\r\n"
		})
		res.xml.variables.filter(v => v.variable[0].$.type == "list").forEach(v => {
			finalCode += v.variable[0]._ + " = []\r\n"
		})
		// vars = res.xml.variables.filter(v => v.variable[0].$.type == "").map(v => {
		// 	return { name: v.variable[0]._, value: "" };
		// });
		// lists = res.xml.variables.filter(v => v.variable[0].$.type == "list").map(v => {
		// 	return { name: v.variable[0]._, value: [] };
		// });
	}
	for(const hat of res.xml.block) {
		console.log(hat);
		if(hat.$.type == "event_whenflagclicked") {
			// workspace.glowStack(hat.$.id, true);
			await runBlock(hat.next);
			// workspace.glowStack(hat.$.id, false);
		}
	}
}

async function runBlock(hat) {
	let block = hat;
	while(block != null) {
		if(cancel) return;
		const blk = block[0] ? block[0]["block"][0] : block;
		// workspace.glowBlock(blk.$.id, true);
		switch (blk.$.type) {
			case "pico_ledon":
				// await writePort("machine.Pin(" + await solveNumber(blk.value[0]) + ", machine.Pin.OUT).on()\r\n");
				addImport("machine");
				finalCode += indent + "machine.Pin(" + await solveNumber(blk.value[0]) + ", machine.Pin.OUT).on() # Führt die Funktion \"on\" aus beim Pin " + await solveNumber(blk.value[0]) + " von der Bibliothek \"machine\"\r\n"
				break;
			case "pico_ledoff":
				// await writePort("machine.Pin(" + await solveNumber(blk.value[0]) + ", machine.Pin.OUT).off()\r\n");
				addImport("machine");
				finalCode += indent + "machine.Pin(" + await solveNumber(blk.value[0]) + ", machine.Pin.OUT).off() # Führt die Funktion \"off\" aus beim Pin " + await solveNumber(blk.value[0]) + " von der Bibliothek \"machine\"\r\n"
				break;
			case "pico_internalledon":
				// await writePort("machine.Pin('LED').on()\r\n"); //! TODO: Check or ask if regular pico to use pin 25!!!!
				addImport("machine");
				finalCode += indent + "machine.Pin('LED').on() # Führt die Funktion \"on\" aus beim Pin der internen LED von der Bibliothek \"machine\"\r\n";
				break;
			case "pico_internalledoff":
				// await writePort("machine.Pin('LED').off()\r\n");
				addImport("machine");
				finalCode += indent + "machine.Pin('LED').off() # Führt die Funktion \"on\" aus beim Pin der internen LED von der Bibliothek \"machine\"\r\n";
				break;
			case "control_wait":
				// await sleep(blk.value[0].shadow[0].field[0]._ * 1000);
				addImport("time");
				finalCode += indent + "time.sleep(" + await solveNumber(blk.value[0]) + ") # Führt die Funktion \"sleep\" von der Bibliothek \"time\" aus und wartet " + await solveNumber(blk.value[0]) + " Sekunden\r\n";
				break;
			case "control_repeat":
				const amount = await solveNumber(blk.value[0]);
				finalCode += indent + "for i in range(" + amount + "): # Wiederholt alles drunter " + amount + " mal\r\n"
				indent += "\t";
				// console.log(amount, blk.value[0]);
				// console.log(blk);
				if(blk.statement) {
					// for(let i = 0; i < amount; i++) {
					await runBlock(blk.statement[0].block[0]);
					// }
				}
				indent = indent.substring(1);
				break;
			case "control_forever":
				finalCode += indent + "while True: # Wiederholt alles drunter für immer\r\n";
				indent += "\t";
				if(blk.statement) {
					// while(!cancel) {
					await runBlock(blk.statement[0].block[0]);
					// }
				}
				indent = indent.substring(1);
				break;
			case "control_if": {
				// const conditionBlock = blk.value[0].block[0];
				// const value = await solveCondition(conditionBlock);
				// if(value && blk.statement) {
				// 	await runBlock(blk.statement[0].block[0]);
				// }
				finalCode += indent + "if " + await solveCondition(blk.value[0].block[0]) + ": # Alles hier drunter wird nur ausgeführt wenn die Bedingung wahr ist\r\n";
				indent += "\t";
				if(blk.statement) {
					await runBlock(blk.statement[0].block[0]);
				}
				indent = indent.substring(1);
				break;
			}
			case "control_if_else": {
				// const conditionBlock = blk.value[0].block[0];
				// const value = await solveCondition(conditionBlock);
				// if(value && blk.statement) {
				// 	await runBlock(blk.statement[0].block[0]);
				// } else {
				// 	await runBlock(blk.statement[1].block[0]);
				// }
				finalCode += indent + "if " + await solveCondition(blk.value[0].block[0]) + ": # Alles hier drunter wird nur ausgeführt wenn die Bedingung wahr ist\r\n";
				indent += "\t";
				if(blk.statement) {
					await runBlock(blk.statement[0].block[0]);
				} else {
					finalCode += indent + "pass\r\n"
				}
				indent = indent.substring(1);
				finalCode += indent + "else: # Alles hier drunter wird nur ausgeführt wenn die Bedingung falsch ist\r\n"
				indent += "\t";
				if(blk.statement) {
					await runBlock(blk.statement[1].block[0]);
				} else {
					finalCode += indent + "pass\r\n"
				}
				indent = indent.substring(1);
				break;
			}
			case "debug_print":
				// await writePort("print(\"" + await solveString(blk.value[0]) + "\")\r\n")
				finalCode += indent + "print(" + await solveString(blk.value[0]) + ") # Gibt etwas in der Konsole aus\r\n";
				break;
			case "data_setvariableto":
				// vars.find(v => v.name == blk.field[0]._).value = await solveString(blk.value[0]);
				let val = await solveString(blk.value[0]);
				if(!isNaN(val.substring(1, val.length - 1))) val = parseInt(val.substring(1, val.length - 1));
				finalCode += indent + blk.field[0]._ + " = " + val + " # Setzt die Variable " + blk.field[0]._ + " zu " + val + "\r\n";
				break;
			case "data_changevariableby":
				// let val = parseInt(vars.find(v => v.name == blk.field[0]._).value);
				// console.log(val, typeof val);
				// console.log(typeof await solveNumber(blk.value[0]), await solveNumber(blk.value[0]));
				// console.log(val + await solveNumber(blk.value[0]));
				// val = val + await solveNumber(blk.value[0]);
				// vars.find(v => v.name == blk.field[0]._).value = val + "";
				finalCode += indent + blk.field[0]._ + " += " + await solveNumber(blk.value[0]) + " # Ändert den Wert der Variable " + blk.field[0]._ + " um " + val + "\r\n";
				break;
			case "data_addtolist":
				// lists.find(v => v.name == blk.field[0]._).value.push(await solveString(blk.value[0]))
				finalCode += indent + blk.field[0]._ + ".append(" + await solveString(blk.value[0]) + ") # Fügt " + await solveString(blk.value[0]) + " zur Liste " + blk.field[0]._ + " hinzu\r\n";
				break;
			case "data_deleteoflist":
				// lists.find(v => v.name == blk.field[0]._).value.splice(await solveNumber(blk.value[0]) - 1, 1);
				finalCode += indent + blk.field[0]._ + ".pop(" + await solveNumber(blk.value[0]) + ") # Entfernt ein Element von der Liste " + blk.field[0]._ + "\r\n";
				break;
			case "data_deletealloflist":
				// lists.find(v => v.name == blk.field[0]._).value = [];
				finalCode += indent + blk.field[0]._ + " = [] # Leert die Liste " + blk.field[0]._ + "\r\n";
				break;
			case "data_insertatlist":
				// lists.find(v => v.name == blk.field[0]._).value.splice(await solveNumber(blk.value[1]) - 1, 0, await solveString(blk.value[0]));
				finalCode += indent + blk.field[0]._ + ".insert(" + await solveNumber(blk.value[1]) + ", " + await solveString(blk.value[0]) + ") # Fügt " + await solveString(blk.value[0]) + " zur Liste " + blk.field[0]._ + " an stelle " + await solveNumber(blk.value[1]) + " zu\r\n";
				break;
			case "data_replaceitemoflist":
				// lists.find(v => v.name == blk.field[0]._).value.splice(await solveNumber(blk.value[0]) - 1, 1, await solveString(blk.value[1]));
				finalCode += indent + blk.field[0]._ + ".pop(" + await solveNumber(blk.value[0]) + ") # Entfernt ein Element von der Liste " + blk.field[0]._ + "\r\n";
				finalCode += indent + blk.field[0]._ + ".insert(" + await solveNumber(blk.value[0]) + ", " + await solveString(blk.value[1]) + ") # Fügt " + await solveString(blk.value[0]) + " zur Liste " + blk.field[0]._ + " an stelle " + await solveNumber(blk.value[1]) + " zu\r\n";
				break;
			case "debug_python":
				finalCode += indent + blk.value[0].shadow[0].field[0]._ + "# Führt Python Code aus\r\n";
				break;
			case "pico_setledbrightness":
				finalCode += indent + "machine.PWM(machine.Pin(" + await solveNumber(blk.value[0]) + ")).duty_u16(" + await solveNumber(blk.value[1]) + " * " + await solveNumber(blk.value[1]) + ") # Setzt die Helligkeit der LED auf Pin " + await solveNumber(blk.value[0]) + " zu " + await solveNumber(blk.value[1]) + "\r\n"
				break;
		}
		// workspace.glowBlock(blk.$.id, false);
		block = blk.next;
	}
}

async function solveCondition(conditionBlock) {
	switch(conditionBlock.$.type) {
		case "operator_equals": {
			// const v1 = conditionBlock.value[0].shadow[0].field[0]._;
			// const v2 = conditionBlock.value[1].shadow[0].field[0]._;
			// return v1 == v2;
			return conditionBlock.value[0].shadow[0].field[0]._ + " == " + conditionBlock.value[1].shadow[0].field[0]._;
		}
		case "operator_and": {
			// const v1 = await solveCondition(conditionBlock.value[0].block[0]);
			// const v2 = await solveCondition(conditionBlock.value[1].block[0]);
			// return v1 && v2;
			return await solveCondition(conditionBlock.value[0].block[0]) + " && " + await solveCondition(conditionBlock.value[1].block[0]);
		}
		case "operator_or": {
			// const v1 = await solveCondition(conditionBlock.value[0].block[0]);
			// const v2 = await solveCondition(conditionBlock.value[1].block[0]);
			// return v1 || v2;
			return await solveCondition(conditionBlock.value[0].block[0]) + " || " + await solveCondition(conditionBlock.value[1].block[0]);
		}
		case "operator_not": {
			// const v1 = await solveCondition(conditionBlock.value[0].block[0]);
			// return !v1;
			return "!" + await solveCondition(conditionBlock.value[0].block[0])
		}
		case "operator_contains": {
			// const v1 = conditionBlock.value[0].shadow[0].field[0]._;
			// const v2 = conditionBlock.value[1].shadow[0].field[0]._;
			// return v1.includes(v2);
			return conditionBlock.value[1].shadow[0].field[0]._ + " in " + conditionBlock.value[0].shadow[0].field[0]._;
		}
		case "data_listcontainsitem": {
			// return lists.find(v => v.name == conditionBlock.field[0]._).value.includes(await solveString(conditionBlock.value[0]));
			return await solveString(conditionBlock.value[0]) + " in " + conditionBlock.field[0]._;
		}
		case "pico_ledstatus":
			// await writePort("machine.Pin(" + await solveNumber(conditionBlock.value[0]) + ", machine.Pin.OUT).value()")
			// await writePort("\r\n");
			// await readPortReponse();
			// return await readPortReponse() == 1;
			return "machine.Pin(" + await solveNumber(conditionBlock.value[0]) + ", machine.Pin.OUT).value() == 1"
		case "pico_internalledstatus":
			// await writePort("machine.Pin('LED').value()")
			// await writePort("\r\n");
			// await readPortReponse();
			// return await readPortReponse() == 1;
			return "machine.Pin(\"LED\").value() == 1"
		case "pico_buttonstatus":
			return "machine.Pin(" + await solveNumber(conditionBlock.value[0]) + ", machine.Pin.IN, machine.Pin.PULL_DOWN).value() == 1"
	}
	return false;
}

async function solveNumber(val) {
	if(!val.block && !val.field) return parseFloat(val.shadow[0].field[0]._);
	const blk = val.block[0];
	switch(blk.$.type) {
		case "operator_add":
			// return parseInt(await solveNumber(blk.value[0])) + parseInt(await solveNumber(blk.value[1]));
			return await solveNumber(blk.value[0]) + " + " + await solveNumber(blk.value[1]);
		case "operator_subtract":
			// return parseInt(await solveNumber(blk.value[0])) - parseInt(await solveNumber(blk.value[1]));
			return await solveNumber(blk.value[0]) + " - " + await solveNumber(blk.value[1]);
		case "operator_multiply":
			// return parseInt(await solveNumber(blk.value[0])) * parseInt(await solveNumber(blk.value[1]));
			return await solveNumber(blk.value[0]) + " * " + await solveNumber(blk.value[1]);
		case "operator_divide":
			// return parseInt(await solveNumber(blk.value[0])) / parseInt(await solveNumber(blk.value[1]));
			return await solveNumber(blk.value[0]) + " / " + await solveNumber(blk.value[1]);
		case "operator_random":
			// return parseInt(randomNumber(parseInt(await solveNumber(blk.value[0])), parseInt(await solveNumber(blk.value[1]))));
			addImport("random");
			return "random.randrange(" + await solveNumber(blk.value[0]) + ", " + await solveNumber(blk.value[1]) + ")"
		case "data_variable":
			// const val = vars.find(v => v.name == blk.field[0]._) ? vars.find(v => v.name == blk.field[0]._).value : 0;
			// console.log(val, typeof val, parseInt(val), typeof parseInt(val));
			// return parseInt(val);
			return blk.field[0]._;
		case "data_listcontents":
			// return parseInt(lists.find(v => v.name == blk.field[0]._).value.join(""))
			return blk.field[0]._;
		case "data_itemnumoflist":
			// const arg = await solveString(blk.value[0])
			// return lists.find(v => v.name == blk.field[0]._).value.findIndex(i => i == arg) + 1;
			return blk.field[0]._ + ".index(\"" + await solveString(blk.value[0]) + "\")";
		case "data_lengthoflist":
			// return lists.find(v => v.name == blk.field[0]._).value.length;
			return "len(" + blk.field[0]._ + ")";
		case "pico_ledbrightness":
			return "machine.PWM(machine.Pin(" + await solveNumber(blk.value[0]) + ")).duty_u16() / 255"
	}
}

async function solveString(val) {
	if(!val.block) return val.shadow[0].field[0]._ == undefined ? "\"\"" : "\"" + val.shadow[0].field[0]._ + "\"";
	const blk = val.block[0];
	switch(blk.$.type) {
		case "operator_join":
			// return await solveString(blk.value[0]) + await solveString(blk.value[1]);
			return await solveString(blk.value[0]) + " + " + await solveString(blk.value[1]);
		case "operator_letter_of":
			// return (await solveString(blk.value[1])).split("")[await solveNumber(blk.value[0]) - 1]
			return "\"" + await solveString(blk.value[1]) + "\"[" + await solveNumber(blk.value[0]) + "]"
		case "operator_length":
			// return (await solveString(blk.value[0])).length;
			return "len(" + await solveString(blk.value[0]) + "\")";
		case "data_variable":
			// return vars.find(v => v.name == blk.field[0]._) ? vars.find(v => v.name == blk.field[0]._).value : "";
			return blk.field[0]._;
		case "data_listcontents":
			// return lists.find(v => v.name == blk.field[0]._).value.join(" ")
			return blk.field[0]._;
		case "data_itemoflist":
			// return lists.find(v => v.name == blk.field[0]._).value[await solveNumber(blk.value[0]) - 1];
			return blk.field[0]._ + "[" + await solveNumber(blk.value[0]) + "]";
		case "debug_read_console":
			return "input(" + await solveString(blk.value[0]) + ")"
	}
	const num = await solveNumber(val);
	return num == undefined ? "" : num;
}

// function randomNumber(min, max) { 
// 	return Math.random() * (max - min) + min;
// }

function fromXml(input) {
	var xml = Blockly.Xml.textToDom(input);
	workspace.clear();
	Blockly.Xml.domToWorkspace(xml, workspace);
	taChange();
}

function toCode(lang) {
	var output = document.getElementById('importExport');
	output.value = Blockly[lang].workspaceToCode(workspace);
	taChange();
}

// Disable the "Import from XML" button if the XML is invalid.
// Preserve text between page reloads.
function taChange() {
	// var textarea = document.getElementById('importExport');
	// if (sessionStorage) {
	// 	sessionStorage.setItem('textarea', textarea.value);
	// }
	// var valid = true;
	// try {
	// 	Blockly.Xml.textToDom(textarea.value);
	// } catch (e) {
	// 	valid = false;
	// }
	// document.getElementById('import').disabled = !valid;
}

function logEvents(state) {
	var checkbox = document.getElementById('logCheck');
	checkbox.checked = state;
	if (sessionStorage) {
		sessionStorage.setItem('logEvents', state ? 'checked' : '');
	}
	if (state) {
		workspace.addChangeListener(logger);
	} else {
		workspace.removeChangeListener(logger);
	}
}

function logFlyoutEvents(state) {
	var checkbox = document.getElementById('logFlyoutCheck');
	checkbox.checked = state;
	if (sessionStorage) {
		sessionStorage.setItem('logFlyoutEvents', state ? 'checked' : '');
	}
	var flyoutWorkspace = (workspace.flyout_) ? workspace.flyout_.workspace_ :
		workspace.toolbox_.flyout_.workspace_;
	if (state) {
		flyoutWorkspace.addChangeListener(logger);
	} else {
		flyoutWorkspace.removeChangeListener(logger);
	}
}

function logger(e) {
	console.log(e);
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

var equalsXml = [
	'  <shadow type="operator_equals">',
	'    <value name="OPERAND1">',
	'     <shadow type="text">',
	'      <field name="TEXT">foo</field>',
	'     </shadow>',
	'    </value>',
	'    <value name="OPERAND2">',
	'      <shadow type="operator_equals"></shadow>',
	'    </value>',
	'  </shadow>'
].join('\n');

function reportDemo() {
	if (Blockly.selected) {
		workspace.reportValue(
			Blockly.selected.id,
			document.getElementById('reportValue').value
		);
	}
}

function setLocale(locale) {
	workspace.getFlyout().setRecyclingEnabled(false);
	var xml = Blockly.Xml.workspaceToDom(workspace);
	Blockly.ScratchMsgs.setLocale(locale);
	Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, workspace);
	workspace.getFlyout().setRecyclingEnabled(true);
}