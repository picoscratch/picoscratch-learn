import { solveNumber } from "../run.js"

export const BLOCKS = {
	pwm_duty: {
		import: ["machine"],
		code: async (blk) => {
			return `machine.PWM(machine.Pin(${await solveNumber(blk.value[0])})).duty_u16(${await solveNumber(blk.value[1])})`;
		}
	},
	pwm_duty_255: {
		import: ["machine"],
		code: async (blk) => {
			return `machine.PWM(machine.Pin(${await solveNumber(blk.value[0])})).duty_u16(${await solveNumber(blk.value[1])} * ${await solveNumber(blk.value[1])})`;
		}
	},
	pwm_freq: {
		import: ["machine"],
		code: async (blk) => {
			return `machine.PWM(machine.Pin(${await solveNumber(blk.value[0])})).freq(${await solveNumber(blk.value[1])})`;
		}
	}
}

export const NUMBERS = {
	get_pwm_duty: {
		import: ["machine"],
		code: async (blk) => {
			return `machine.PWM(machine.Pin(${await solveNumber(blk.value[0])})).duty_u16()`;
		}
	},
	get_pwm_duty_255: {
		import: ["machine", "math"],
		code: async (blk) => {
			return `int(round(math.sqrt(machine.PWM(machine.Pin(${await solveNumber(blk.value[0])})).duty_u16()), 0))`;
		}
	},
	get_pwm_freq: {
		import: ["machine"],
		code: async (blk) => {
			return `machine.PWM(machine.Pin(${await solveNumber(blk.value[0])})).freq()`;
		}
	}
}