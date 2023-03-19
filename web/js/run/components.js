import { runBlock, solveCondition, solveNumber, solveString, addFinalCode, indent, usedVars, picoW, pushIndent, popIndent, addFunction } from "../run.js";

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
	components_buzzer_volume: {
		import: ["machine"],
		code: async (blk) => {
			return "machine.PWM(machine.Pin(" + await solveNumber(blk.value[0]) + ")).duty_u16(int(" + await solveNumber(blk.value[1]) + " / 1000 * 10000))";
		}
	},
	components_buzzer_freq: {
		import: ["machine"],
		code: async (blk) => {
			addFunction("buzzer", `tones = {
	"B0": 31,
	"C1": 33,
	"CS1": 35,
	"D1": 37,
	"DS1": 39,
	"E1": 41,
	"F1": 44,
	"FS1": 46,
	"G1": 49,
	"GS1": 52,
	"A1": 55,
	"AS1": 58,
	"B1": 62,
	"C2": 65,
	"CS2": 69,
	"D2": 73,
	"DS2": 78,
	"E2": 82,
	"F2": 87,
	"FS2": 93,
	"G2": 98,
	"GS2": 104,
	"A2": 110,
	"AS2": 117,
	"B2": 123,
	"C3": 131,
	"CS3": 139,
	"D3": 147,
	"DS3": 156,
	"E3": 165,
	"F3": 175,
	"FS3": 185,
	"G3": 196,
	"GS3": 208,
	"A3": 220,
	"AS3": 233,
	"B3": 247,
	"C4": 262,
	"CS4": 277,
	"D4": 294,
	"DS4": 311,
	"E4": 330,
	"F4": 349,
	"FS4": 370,
	"G4": 392,
	"GS4": 415,
	"A4": 440,
	"AS4": 466,
	"B4": 494,
	"C5": 523,
	"CS5": 554,
	"D5": 587,
	"DS5": 622,
	"E5": 659,
	"F5": 698,
	"FS5": 740,
	"G5": 784,
	"GS5": 831,
	"A5": 880,
	"AS5": 932,
	"B5": 988,
	"C6": 1047,
	"CS6": 1109,
	"D6": 1175,
	"DS6": 1245,
	"E6": 1319,
	"F6": 1397,
	"FS6": 1480,
	"G6": 1568,
	"GS6": 1661,
	"A6": 1760,
	"AS6": 1865,
	"B6": 1976,
	"C7": 2093,
	"CS7": 2217,
	"D7": 2349,
	"DS7": 2489,
	"E7": 2637,
	"F7": 2794,
	"FS7": 2960,
	"G7": 3136,
	"GS7": 3322,
	"A7": 3520,
	"AS7": 3729,
	"B7": 3951,
	"C8": 4186,
	"CS8": 4435,
	"D8": 4699,
	"DS8": 4978
}
def buzz(pin, sound):
	buz = machine.PWM(machine.Pin(pin))
	buz.freq(tones[sound])`)
			return "buzz(" + await solveNumber(blk.value[0]) + ", " + await solveString(blk.value[1]) + ")";
		}
	}
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
	},
	components_internaltemp: {
		import: ["machine"],
		code: async (blk) => {
			return "27 - ((machine.ADC(4).read_u16() * (3.3 / (65535))) - 0.706) / 0.001721"
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