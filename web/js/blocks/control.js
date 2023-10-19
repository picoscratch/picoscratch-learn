export function defineBlocks() {
	Blockly.Msg.WAIT_MS = "wait %1 milliseconds";
	Blockly.ScratchMsgs.locales["en"].WAIT_MS = "wait %1 milliseconds";
	Blockly.ScratchMsgs.locales["de"].WAIT_MS = "warte %1 Millisekunden";
	Blockly.Blocks["control_wait_ms"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.WAIT_MS,
				"args0": [
					{
						"type": "input_value",
						"name": "DURATION"
					}
				],
				"category": Blockly.Categories.control,
				"extensions": ["colours_control", "shape_statement"]
			})
		}
	}

	
	Blockly.Msg.WAIT_US = "wait %1 microseconds";
	Blockly.ScratchMsgs.locales["en"].WAIT_US = "wait %1 microseconds";
	Blockly.ScratchMsgs.locales["de"].WAIT_US = "warte %1 Mikrosekunden";
	Blockly.Blocks["control_wait_us"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.WAIT_US,
				"args0": [
					{
						"type": "input_value",
						"name": "DURATION"
					}
				],
				"category": Blockly.Categories.control,
				"extensions": ["colours_control", "shape_statement"]
			})
		}
	}

	Blockly.Msg.BREAK = "break";
	Blockly.ScratchMsgs.locales["en"].BREAK = "break";
	Blockly.ScratchMsgs.locales["de"].BREAK = "abbrechen";
	Blockly.Blocks["control_break"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.BREAK,
				"category": Blockly.Categories.control,
				"extensions": ["colours_control", "shape_statement"]
			})
		}
	}
}