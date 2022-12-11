import { runBlock, solveCondition, solveNumber, solveString, addFinalCode, indent, usedVars, picoW, pushIndent, popIndent } from "../run.js";

export const BLOCKS = {
	components_ledon: {
		import: ["machine"],
		code: async (blk) => {
			return "machine.Pin(" + await solveNumber(blk.value[0]) + ", machine.Pin.OUT).on()"
		}
	},
	components_ledoff: {
		import: ["machine"],
		code: async (blk) => {
			return "machine.Pin(" + await solveNumber(blk.value[0]) + ", machine.Pin.OUT).off()"
		}
	},
	components_internalledon: {
		import: ["machine"],
		code: async () => {
			return "machine.Pin(" + (picoW ? "'LED'" : "25, machine.Pin.OUT") + ").on()";
		}
	},
	components_internalledoff: {
		import: ["machine"],
		code: async () => {
			return "machine.Pin(" + (picoW ? "'LED'" : "25, machine.Pin.OUT") + ").off()";
		}
	},
	components_setledbrightness: {
		import: ["machine"],
		code: async (blk) => {
			return "machine.PWM(machine.Pin(" + await solveNumber(blk.value[0]) + ")).duty_u16(" + await solveNumber(blk.value[1]) + " * " + await solveNumber(blk.value[1]) + ")";
		}
	},
	components_rgbled: {
		import: ["machine"],
		code: async (blk) => {
			const rgb = hexToRgb(blk.value[3].shadow[0].field[0]._);
			if(rgb == null) return null;
			return ["machine.PWM(machine.Pin(" + await solveNumber(blk.value[0]) + ")).duty_u16(" + rgb.r + " * " + rgb.r + ")",
							"machine.PWM(machine.Pin(" + await solveNumber(blk.value[1]) + ")).duty_u16(" + rgb.g + " * " + rgb.g + ")",
							"machine.PWM(machine.Pin(" + await solveNumber(blk.value[2]) + ")).duty_u16(" + rgb.b + " * " + rgb.b + ")"];
		}
	},
}

export const CONDITIONS = {
	components_ledstatus: {
		import: ["machine"],
		code: async (blk) => {
			return "machine.Pin(" + await solveNumber(blk.value[0]) + ", machine.Pin.OUT).value() == 1"
		}
	},
	components_internalledstatus: {
		import: ["machine"],
		code: async (blk) => {
			return "machine.Pin(\"LED\").value() == 1"
		}
	},
	components_buttonstatus: {
		import: ["machine"],
		code: async (blk) => {
			return "machine.Pin(" + await solveNumber(blk.value[0]) + ", machine.Pin.IN, machine.Pin.PULL_DOWN).value() == 1"
		}
	},
	components_pir: {
		import: ["machine"],
		code: async (blk) => {
			return "int(round(machine.ADC(machine.Pin(" + await solveNumber(blk.value[0]) + ")).read_u16() / 65535 * 255, 0)) > 10"
		}
	}
}

export const NUMBERS = {
	components_ledbrightness: {
		import: ["machine"],
		code: async (blk) => {
			return "machine.PWM(machine.Pin(" + await solveNumber(blk.value[0]) + ")).duty_u16() / 255"
		}
	},
	components_potentiometer: {
		import: ["machine"],
		code: async (blk) => {
			return "int(round(machine.ADC(machine.Pin(" + await solveNumber(blk.value[0]) + ")).read_u16() / 65535 * 255, 0))"
		}
	},
	components_photoresistor: {
		import: ["machine"],
		code: async (blk) => {return NUMBERS.components_potentiometer.code(blk);}
	},
	components_ultrasonic: {
		import: ["machine", "time"],
		code: async (blk) => {
			addFunction("ultrasonic", `def ultra(triggerpin, echopin):
	trigger = machine.Pin(triggerpin, machine.Pin.OUT)
	echo = machine.Pin(echopin, machine.Pin.IN)
	trigger.low()
	time.sleep_us(2)
	trigger.high()
	time.sleep_us(100)
	trigger.low()
	while echo.value() == 0:
		signaloff = time.ticks_us()
	while echo.value() == 1:
		signalon = time.ticks_us()
	timepassed = signalon - signaloff
	distance = int((timepassed * 0.0343) / 2)
	return distance`)
			return "ultra(" + await solveNumber(blk.value[0]) + ", " + await solveNumber(blk.value[1]) + ")";
		}
	}
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}