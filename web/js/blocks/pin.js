export const pinToolbox = `<category name="Pin" id="pin" colour="#4C97FF" secondaryColour="#3373CC">
<block type="pin_on" id="pin_on">
	<value name="PIN">
		<shadow type="math_number">
			<field name="NUM">0</field>
		</shadow>
	</value>
</block>
<block type="pin_off" id="pin_off">
	<value name="PIN">
		<shadow type="math_number">
			<field name="NUM">0</field>
		</shadow>
	</value>
</block>
<block type="pin_read" id="pin_read">
	<value name="PIN">
		<shadow type="math_number">
			<field name="NUM">0</field>
		</shadow>
	</value>
</block>
<block type="internalled" id="internalled"></block>
</category>`;

export function defineBlocks() {
	Blockly.Msg.TURN_PIN_OFF = "Turn pin %1 off";
	Blockly.ScratchMsgs.locales["en"].TURN_PIN_OFF = "Turn pin %1 off";
	Blockly.ScratchMsgs.locales["de"].TURN_PIN_OFF = "Schalte Pin %1 aus";
	Blockly.Blocks["pin_off"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.TURN_PIN_OFF,
				"args0": [
					{
						"type": "input_value",
						"name": "PIN"
					},
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_motion", "shape_statement", "scratch_extension"]
			})
		}
	};

	Blockly.Msg.TURN_PIN_ON = "Turn pin %1 on";
	Blockly.ScratchMsgs.locales["en"].TURN_PIN_ON = "Turn pin %1 on";
	Blockly.ScratchMsgs.locales["de"].TURN_PIN_ON = "Schalte Pin %1 an";
	Blockly.Blocks["pin_on"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.TURN_PIN_ON,
				"args0": [
					{
						"type": "input_value",
						"name": "PIN"
					},
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_motion", "shape_statement", "scratch_extension"]
			})
		}
	};

	// NOTE: Reading needs pull up/down option using a dropdown!!
	Blockly.Msg.READ_PIN = "Read pin %1 value with pull %2";
	Blockly.Msg.NONE = "no";
	Blockly.ScratchMsgs.locales["en"].READ_PIN = "Read pin %1 value with %2 resistor";
	Blockly.ScratchMsgs.locales["en"].NONE = "no";
	Blockly.ScratchMsgs.locales["de"].READ_PIN = "Lese Pin %1 Wert mit %2 Widerstand";
	Blockly.ScratchMsgs.locales["de"].NONE = "keinem";
	Blockly.Blocks["pin_read"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.READ_PIN,
				"args0": [
					{
						"type": "input_value",
						"name": "PIN"
					},
					{
						"type": "field_dropdown",
						"name": "PULL",
						"options": [
							["%{BKY_NONE}", "NONE"],
							["pull up", "UP"],
							["pull down", "DOWN"]
						]
					}
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_motion", "output_boolean", "scratch_extension"]
			})
		}
	};

	Blockly.Msg.INTERNAL_LED = "Internal LED";
	Blockly.ScratchMsgs.locales["en"].INTERNAL_LED = "Internal LED";
	Blockly.ScratchMsgs.locales["de"].INTERNAL_LED = "Interne LED";
	Blockly.Blocks["internalled"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.INTERNAL_LED,
				"category": Blockly.Categories.more,
				"extensions": ["colours_motion", "output_number", "scratch_extension"]
			})
		}
	};
}