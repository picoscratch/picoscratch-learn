const fs = require("fs");
const path = require("path");
import { toXml, workspace } from "./workspace.js";
import * as COMPONENTS from "./run/components.js";
import * as CONTROL from "./run/control.js";
import * as DATA from "./run/data.js";
import * as DEBUG from "./run/debug.js";
import * as OPERATOR from "./run/operator.js";
import * as PROCEDURES from "./run/procedures.js";

const parseXML = require("xml2js").parseStringPromise;
export let finalCode = "";
let imports = [];
export let indent = "";
export let usedVars = [];
let helperFuncs = {};
export let picoW = true;

export function addFinalCode(text) {
	finalCode += text;
}

let BLOCKS = {}
let CONDITIONS = {}
let NUMBERS = {}
let STRINGS = {}

function addCode(f) {
	if(f.BLOCKS) BLOCKS = {...BLOCKS, ...f.BLOCKS};
	if(f.CONDITIONS) CONDITIONS = {...CONDITIONS, ...f.CONDITIONS};
	if(f.NUMBERS) NUMBERS = {...NUMBERS, ...f.NUMBERS};
	if(f.STRINGS) STRINGS = {...STRINGS, ...f.STRINGS};
}

// fs.readdirSync(path.join("web", "js", "run")).forEach(async (f) => {
// 	addCode(await import("./" + path.join("run", f)));
// });
addCode(COMPONENTS);
addCode(CONTROL);
addCode(DATA);
addCode(DEBUG);
addCode(OPERATOR);
addCode(PROCEDURES);

export async function addImport(lib) {
	if(!imports.includes(lib)) imports.push(lib);
}

export function pushIndent() {
	indent += "\t";
}

export function popIndent() {
	indent = indent.substring(1);
}

export async function addFunction(key, val) {
	if(!Object.keys(helperFuncs).includes(key)) helperFuncs[key] = val;
}

export async function makeCode(isW) {
	picoW = isW;
	indent = "";
	finalCode = "";
	const res = await parseXML(toXml());
	if(res.xml.variables[0] != "") {
		console.log("VARS", res.xml.variables[0].variable);
		res.xml.variables[0].variable.filter(v => v.$.type == "").forEach(v => {
			finalCode += v._ + " = \"\"\r\n"
		})
		res.xml.variables[0].variable.filter(v => v.$.type == "list").forEach(v => {
			finalCode += v._ + " = []\r\n"
		})
	}
	const order = { "event_whenflagclicked": 100, "procedures_definition": 1, default: 10000 }
	// console.log(res.xml.block);
	for(const hat of res.xml.block.sort((a, b) => {
		return (order[a.$.type] || order.default) - (order[b.$.type] || order.default);
	})) {
		// console.log(hat);
		if(hat.$.type == "event_whenflagclicked") {
			// workspace.glowStack(hat.$.id, true);
			usedVars = [];
			finalCode += await runBlock(hat.next);
			// workspace.glowStack(hat.$.id, false);
		} else if(hat.$.type == "procedures_definition") {
			console.log("CB!", hat);
			finalCode += indent + "def " + hat.statement[0].shadow[0].mutation[0].$.proccode.split(" ")[0] + "(";
			if(hat.statement[0].shadow[0].value) {
				finalCode += hat.statement[0].shadow[0].value.map(v => v.shadow[0].field[0]._).join(", ");
			}
			finalCode += "):\r\n"
			indent += "\t";
			usedVars = [];
			// res.xml.variables[0].variable.forEach(v => {
			// 	finalCode += indent + "global " + v._ + "\r\n"
			// })
			if(hat.next) {
				let code = await runBlock(hat.next);
				usedVars.forEach(v => {
					finalCode += indent + "global " + v + "\r\n";
				});
				finalCode += code;
			}
			else finalCode += indent + "pass\r\n";
			indent = indent.substring(1);
		}
	}
	finalCode = imports.map(lib => "import " + lib + "\r\n").join("") + finalCode;
	finalCode = Object.values(helperFuncs).map(func => func + "\r\n").join("") + finalCode;
	imports = [];
	indent = "";
	usedVars = [];
	helperFuncs = {};
	return finalCode;
}

export async function runBlock(hat) {
	let finalBlockCode = "";
	let block = hat;
	while(block != null) {
		const blk = block[0] ? block[0]["block"][0] : block;
		workspace.glowBlock(blk.$.id, true);
		if(!BLOCKS[blk.$.type]) {
			report(blk.$.id, "Can't compile this block: No code");
		} else {
			const block = BLOCKS[blk.$.type];
			if(block.import) {
				for(const im of block.import) { addImport(im); }
			}
			const result = await block.code(blk, finalBlockCode);
			if(result != null) {
				if(typeof result == "string") finalBlockCode += indent + result + "\r\n";
				else if(typeof result == "object") {
					if(result.code) finalBlockCode += indent + result.code + "\r\n";
					if(result.finalBlockCode) finalBlockCode = result.finalBlockCode;
				}
			}
		}
		workspace.glowBlock(blk.$.id, false);
		block = blk.next;
	}
	return finalBlockCode;
}

export async function solveCondition(blk) {
	workspace.glowBlock(blk.$.id, true);
	if(!CONDITIONS[blk.$.type]) {
		report(blk.$.id, "Can't compile this block: No code");
	} else {
		const condition = CONDITIONS[blk.$.type];
		if(condition.import) {
			for(const im of condition.import) { addImport(im); }
		}
		const result = await condition.code(blk);
		if(result != null) {
			return result;
		}
	}
	workspace.glowBlock(blk.$.id, false);
}

export async function solveNumber(val) {
	if(!val.block && !val.field) return parseFloat(val.shadow[0].field[0]._);
	const blk = val.block[0];
	workspace.glowBlock(blk.$.id, true);
	if(!NUMBERS[blk.$.type]) {
		// report(blk.$.id, "Can't compile this block: No code");
		return null;
	} else {
		const number = NUMBERS[blk.$.type];
		if(number.import) {
			for(const im of number.import) { addImport(im); }
		}
		const result = await number.code(blk);
		if(result != null) {
			return result;
		}
	}
	workspace.glowBlock(blk.$.id, false);
}

export async function solveString(val) {
	if(!val.block) return val.shadow[0].field[0]._ == undefined ? "\"\"" : "\"" + val.shadow[0].field[0]._ + "\"";
	const blk = val.block[0];
	workspace.glowBlock(blk.$.id, true);
	if(STRINGS[blk.$.type]) {
		const string = STRINGS[blk.$.type];
		if(string.import) {
			for(const im of string.import) { addImport(im); }
		}
		const result = await string.code(blk);
		if(result != null) {
			return result;
		}
	}
	workspace.glowBlock(blk.$.id, false);
	const num = await solveNumber(val);
	return num == undefined ? "" : "str(" + num + ")";
}