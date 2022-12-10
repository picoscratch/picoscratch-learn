import { runBlock, solveCondition, solveNumber, solveString, addFinalCode, indent, usedVars, picoW, pushIndent, popIndent } from "../run.js";

export const CONDITIONS = {
	operator_equals: {
		code: async (blk) => {
			let val = await solveString(blk.value[0]);
			if(!isNaN(val.substring(1, val.length - 1))) val = parseFloat(val.substring(1, val.length - 1));
			let val2 = await solveString(blk.value[1]);
			if(!isNaN(val2.substring(1, val2.length - 1))) val2 = parseFloat(val2.substring(1, val2.length - 1));
			return val + " == " + val2;
		}
	},
	operator_and: {
		code: async (blk) => {
			return await solveCondition(blk.value[0].block[0]) + " && " + await solveCondition(blk.value[1].block[0]);
		}
	},
	operator_or: {
		code: async (blk) => {
			return await solveCondition(blk.value[0].block[0]) + " || " + await solveCondition(blk.value[1].block[0]);
		}
	},
	operator_not: {
		code: async (blk) => {
			return "!" + await solveCondition(blk.value[0].block[0])
		}
	},
	operator_contains: {
		code: async (blk) => {
			return blk.value[1].shadow[0].field[0]._ + " in " + blk.value[0].shadow[0].field[0]._;
		}
	}
};

export const NUMBERS = {
	operator_add: {
		code: async (blk) => {
			return await solveNumber(blk.value[0]) + " + " + await solveNumber(blk.value[1]);
		}
	},
	operator_subtract: {
		code: async (blk) => {
			return await solveNumber(blk.value[0]) + " - " + await solveNumber(blk.value[1]);
		}
	},
	operator_multiply: {
		code: async (blk) => {
			return await solveNumber(blk.value[0]) + " * " + await solveNumber(blk.value[1]);
		}
	},
	operator_divide: {
		code: async (blk) => {
			return await solveNumber(blk.value[0]) + " / " + await solveNumber(blk.value[1]);
		}
	},
	operator_random: {
		import: ["random"],
		code: async (blk) => {
			return "random.randrange(" + await solveNumber(blk.value[0]) + ", " + await solveNumber(blk.value[1]) + ")"
		}
	}
}

export const STRINGS = {
	operator_join: {
		code: async (blk) => {
			return await solveString(blk.value[0]) + " + " + await solveString(blk.value[1]);
		}
	},
	operator_letter_of: {
		code: async (blk) => {
			return "\"" + await solveString(blk.value[1]) + "\"[" + await solveNumber(blk.value[0]) + "]"
		}
	},
	operator_length: {
		code: async (blk) => {
			return "len(" + await solveString(blk.value[0]) + "\")";
		}
	}
}