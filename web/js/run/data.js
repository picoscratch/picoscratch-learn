import { runBlock, solveCondition, solveNumber, solveString, addFinalCode, indent, usedVars, picoW, pushIndent, popIndent } from "../run.js";

export const BLOCKS = {
	data_setvariableto: {
		code: async (blk) => {
			let val = await solveString(blk.value[0]);
			if(!isNaN(val.substring(1, val.length - 1))) val = parseFloat(val.substring(1, val.length - 1));
			usedVars.push(blk.field[0]._)
			return blk.field[0]._ + " = " + val;
		}
	},
	data_changevariableby: {
		code: async (blk) => {
			usedVars.push(blk.field[0]._)
			return blk.field[0]._ + " += " + await solveNumber(blk.value[0]);
		}
	},
	data_addtolist: {
		code: async (blk) => {
			usedVars.push(blk.field[0]._)
			return blk.field[0]._ + ".append(" + await solveString(blk.value[0]) + ")";
		}
	},
	data_deleteoflist: {
		code: async (blk) => {
			usedVars.push(blk.field[0]._)
			return blk.field[0]._ + ".pop(" + await solveNumber(blk.value[0]) + ")";
		}
	},
	data_deletealloflist: {
		code: async (blk) => {
			usedVars.push(blk.field[0]._)
			return blk.field[0]._ + " = []";
		}
	},
	data_insertatlist: {
		code: async (blk) => {
			usedVars.push(blk.field[0]._)
			return blk.field[0]._ + ".insert(" + await solveNumber(blk.value[1]) + ", " + await solveString(blk.value[0]) + ")";
		}
	},
	data_replaceitemoflist: {
		code: async (blk) => {
			usedVars.push(blk.field[0]._)
			return [blk.field[0]._ + ".pop(" + await solveNumber(blk.value[0]) + ")",
							blk.field[0]._ + ".insert(" + await solveNumber(blk.value[0]) + ", " + await solveString(blk.value[1]) + ")"];
		}
	}
}

export const CONDITIONS = {
	data_listcontainsitem: {
		code: async (blk) => {
			usedVars.push(blk.field[0]._)
			return await solveString(blk.value[0]) + " in " + blk.field[0]._;
		}
	}
}

export const NUMBERS = {
	data_variable: {
		code: async (blk) => {
			usedVars.push(blk.field[0]._)
			return blk.field[0]._;
		}
	},
	data_listcontents: {
		code: async (blk) => {
			usedVars.push(blk.field[0]._)
			return blk.field[0]._;
		}
	},
	data_itemnumoflist: {
		code: async (blk) => {
			usedVars.push(blk.field[0]._)
			return blk.field[0]._ + ".index(\"" + await solveString(blk.value[0]) + "\")";
		}
	},
	data_lengthoflist: {
		code: async (blk) => {
			usedVars.push(blk.field[0]._)
			return "len(" + blk.field[0]._ + ")";
		}
	}
}

export const STRINGS = {
	data_variable: {
		code: async (blk) => {
			usedVars.push(blk.field[0]._)
			return blk.field[0]._;
		}
	},
	data_listcontents: {
		code: async (blk) => {
			usedVars.push(blk.field[0]._)
			return blk.field[0]._;
		}
	},
	data_itemoflist: {
		code: async (blk) => {
			usedVars.push(blk.field[0]._)
			return blk.field[0]._ + "[" + await solveNumber(blk.value[0]) + "]";
		}
	}
}