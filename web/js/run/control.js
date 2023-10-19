import { runBlock, solveCondition, solveNumber, solveString, addFinalCode, indent, usedVars, picoW, pushIndent, popIndent } from "../run.js";

export const BLOCKS = {
	control_wait: {
		import: ["time"],
		code: async (blk) => {
			return "time.sleep(" + await solveNumber(blk.value[0]) + ")";
		}
	},
	control_wait_ms: {
		import: ["time"],
		code: async (blk) => {
			return "time.sleep_ms(" + await solveNumber(blk.value[0]) + ")";
		}
	},
	control_wait_us: {
		import: ["time"],
		code: async (blk) => {
			return "time.sleep_us(" + await solveNumber(blk.value[0]) + ")";
		}
	},
	control_repeat: {
		code: async (blk, finalBlockCode) => {
			const amount = await solveNumber(blk.value[0]);
			finalBlockCode += indent + "for i in range(" + amount + "):\r\n";
			pushIndent();
			if(blk.statement) {
				finalBlockCode += await runBlock(blk.statement[0].block[0]);
			} else {
				finalBlockCode += indent + "pass\r\n";
			}
			popIndent();
			return { finalBlockCode };
		}
	},
	control_forever: {
		code: async (blk, finalBlockCode) => {
			finalBlockCode += indent + "while True:\r\n";
			pushIndent();
			if(blk.statement) {
				finalBlockCode += await runBlock(blk.statement[0].block[0]);
			} else {
				finalBlockCode += indent + "pass\r\n";
			}
			popIndent();
			return { finalBlockCode };
		}
	},
	control_if: {
		code: async (blk, finalBlockCode) => {
			finalBlockCode += indent + "if " + await solveCondition(blk.value[0].block[0]) + ":\r\n";
			pushIndent();
			if(blk.statement) {
				finalBlockCode += await runBlock(blk.statement[0].block[0]);
			} else {
				finalBlockCode += indent + "pass\r\n";
			}
			popIndent();
			return { finalBlockCode };
		}
	},
	control_if_else: {
		code: async (blk, finalBlockCode) => {
			finalBlockCode += indent + "if " + await solveCondition(blk.value[0].block[0]) + ":\r\n";
			pushIndent();
			if(blk.statement) {
				finalBlockCode += await runBlock(blk.statement[0].block[0]);
			} else {
				finalBlockCode += indent + "pass\r\n";
			}
			popIndent();
			finalBlockCode += indent + "else:\r\n";
			pushIndent();
			if(blk.statement) {
				finalBlockCode += await runBlock(blk.statement[1].block[0]);
			} else {
				finalBlockCode += indent + "pass\r\n";
			}
			popIndent();
			return { finalBlockCode };
		}
	},
	control_break: {
		code: async (blk) => {
			return "break";
		}
	}
}