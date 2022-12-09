import { runBlock, solveCondition, solveNumber, solveString, addFinalCode, indent, usedVars, picoW, pushIndent, popIndent } from "../run.js";

export const BLOCKS = {
	debug_print: {
		code: async (blk) => {
			return "print(" + await solveString(blk.value[0]) + ")";
		}
	},
	debug_python: {
		code: async (blk) => {
			let code = await solveString(blk.value[0]);
			if(code.startsWith("\"") && code.endsWith("\"")) code = code.substring(1, val.length - 1)
			return code;
		}
	}
}

export const STRINGS = {
	debug_read_console: {
		code: async (blk) => {
			return "input(" + await solveString(blk.value[0]) + ")"
		}
	}
}