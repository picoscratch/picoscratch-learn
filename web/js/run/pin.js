import { picoW, solveNumber } from "../run.js"

export const BLOCKS = {
	pin_on: {
		import: ["machine"],
		code: async (blk) => {
			return "machine.Pin(" + await solveNumber(blk.value[0]) + ", machine.Pin.OUT).on()"
		}
	},
	pin_off: {
		import: ["machine"],
		code: async (blk) => {
			return "machine.Pin(" + await solveNumber(blk.value[0]) + ", machine.Pin.OUT).off()"
		}
	}
}

export const CONDITIONS = {
	pin_read: {
		import: ["machine"],
		code: async (blk) => {
			const pull = blk.field[0]._;
			return `machine.Pin(${await solveNumber(blk.value[0])}, machine.Pin.IN${pull != "NONE" ? (", " + (pull == "UP" ? "machine.Pin.PULL_UP" : "machine.Pin.PULL_DOWN")) : ""}).value() == 1`
		}
	}
}

export const NUMBERS = {
	internalled: {
		code: async (blk) => {
			return picoW ? `"LED"` : "25"
		}
	}
}