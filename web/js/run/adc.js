import { solveNumber } from "../run.js"

export const NUMBERS = {
	adc_read: {
		import: ["machine"],
		code: async (blk) => {
			return `machine.ADC(machine.Pin(${await solveNumber(blk.value[0])})).read_u16()`;
		}
	},
	adc_read_255: {
		import: ["machine", "math"],
		code: async (blk) => {
			return `((machine.ADC(machine.Pin(${await solveNumber(blk.value[0])})).read_u16()) / 257)`;
		}
	},
	adc_volt: {
		import: ["machine"],
		code: async (blk) => {
			return `machine.ADC(machine.Pin(${await solveNumber(blk.value[0])})).read_u16() * 3.3 / 65536`;
		}
	}
}