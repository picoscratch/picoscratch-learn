import { runBlock, solveCondition, solveNumber, solveString, addFinalCode, indent, usedVars, picoW, pushIndent, popIndent } from "../run.js";

export const BLOCKS = {
	procedures_call: {
		code: async (blk, finalBlockCode) => {
			finalBlockCode += indent + blk.mutation[0].$.proccode.split(" ")[0] + "(";
			if(blk.value) {
				finalBlockCode += (await Promise.all(blk.value.map(async v => {
					let val = await solveString(v);
					if(!isNaN(val.substring(1, val.length - 1))) val = parseFloat(val.substring(1, val.length - 1));
					return val;
				}))).join(", ");
			}
			finalBlockCode += ")\r\n";
			return { finalBlockCode };
		}
	},
	procedures_return: {
		code: async (blk) => {
			return "return";
		}
	}
}

export const NUMBERS = {
	argument_reporter_string_number: {
		code: async (blk) => {
			return blk.field[0]._;
		}
	}
}

export const STRINGS = {
	argument_reporter_string_number: {
		code: async (blk) => {
			return blk.field[0]._;
		}
	}
}