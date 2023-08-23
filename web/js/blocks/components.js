export const componentsToolbox = `<category name="Components" id="components" colour="#9966FF" secondaryColour="#774DCB" iconURI="./media/extensions/wedo2-block-icon.svg">
<block type="components_ultrasonic" id="components_ultrasonic">
	<value name="PINT">
		<shadow type="math_number">
			<field name="NUM">0</field>
		</shadow>
	</value>
	<value name="PINE">
		<shadow type="math_number">
			<field name="NUM">1</field>
		</shadow>
	</value>
</block>
<block type="components_internaltemp" id="components_internaltemp"></block>
<block type="components_pir" id="components_pir">
	<value name="PIN">
		<shadow type="math_number">
			<field name="NUM">0</field>
		</shadow>
	</value>
</block>
</category>`;

export function defineBlocks() {
	Blockly.Blocks["components_ledoff"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.TURN_LED_OFF,
				"args0": [
					{
						"type": "field_image",
						"src": Blockly.mainWorkspace.options.pathToMedia + "extensions/led.svg",
						"width": 40,
						"height": 40,
					},
					{
						"type": "field_vertical_separator"
					},
					{
						"type": "input_value",
						"name": "PIN"
					},
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "shape_statement", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["components_ledstatus"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.LED_STATUS,
				"args0": [
					{
						"type": "field_image",
						"src": Blockly.mainWorkspace.options.pathToMedia + "extensions/led.svg",
						"width": 40,
						"height": 40,
					},
					{
						"type": "field_vertical_separator"
					},
					{
						"type": "input_value",
						"name": "PIN"
					},
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "output_boolean", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["components_ledon"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.TURN_LED_ON,
				"args0": [
					{
						"type": "field_image",
						"src": Blockly.mainWorkspace.options.pathToMedia + "extensions/led.svg",
						"width": 40,
						"height": 40,
					},
					{
						"type": "field_vertical_separator"
					},
					{
						"type": "input_value",
						"name": "PIN"
					},
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "shape_statement", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["components_setledbrightness"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.SET_LED_BRIGHTNESS,
				"args0": [
					{
						"type": "field_image",
						"src": Blockly.mainWorkspace.options.pathToMedia + "extensions/led.svg",
						"width": 40,
						"height": 40,
					},
					{
						"type": "field_vertical_separator"
					},
					{
						"type": "input_value",
						"name": "PIN"
					},
					{
						"type": "input_value",
						"name": "BRIGHTNESS"
					},
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "shape_statement", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["components_ledbrightness"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.GET_LED_BRIGHTNESS,
				"args0": [
					{
						"type": "field_image",
						"src": Blockly.mainWorkspace.options.pathToMedia + "extensions/led.svg",
						"width": 40,
						"height": 40,
					},
					{
						"type": "field_vertical_separator"
					},
					{
						"type": "input_value",
						"name": "PIN"
					}
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "output_number", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["components_internalledoff"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.TURN_INTERNAL_LED_OFF,
				"args0": [
					{
						"type": "field_image",
						"src": Blockly.mainWorkspace.options.pathToMedia + "extensions/led.svg",
						"width": 40,
						"height": 40,
					},
					{
						"type": "field_vertical_separator"
					},
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "shape_statement", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["components_internalledstatus"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.INTERNAL_LED_STATUS,
				"args0": [
					{
						"type": "field_image",
						"src": Blockly.mainWorkspace.options.pathToMedia + "extensions/led.svg",
						"width": 40,
						"height": 40,
					},
					{
						"type": "field_vertical_separator"
					},
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "output_boolean", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["components_internalledon"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.TURN_INTERNAL_LED_ON,
				"args0": [
					{
						"type": "field_image",
						"src": Blockly.mainWorkspace.options.pathToMedia + "extensions/led.svg",
						"width": 40,
						"height": 40,
					},
					{
						"type": "field_vertical_separator"
					},
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "shape_statement", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["components_buttonstatus"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.BUTTON_STATUS,
				"args0": [
					{
						"type": "field_image",
						"src": Blockly.mainWorkspace.options.pathToMedia + "extensions/button.svg",
						"width": 40,
						"height": 40,
					},
					{
						"type": "field_vertical_separator"
					},
					{
						"type": "input_value",
						"name": "PIN"
					},
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "output_boolean", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["components_potentiometer"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.POTENTIOMETER,
				"args0": [
					{
						"type": "field_image",
						"src": Blockly.mainWorkspace.options.pathToMedia + "extensions/poti.svg",
						"width": 40,
						"height": 40,
					},
					{
						"type": "field_vertical_separator"
					},
					{
						"type": "input_value",
						"name": "PIN"
					}
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "output_number", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["components_photoresistor"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.PHOTORESISTOR,
				"args0": [
					{
						"type": "input_value",
						"name": "PIN"
					}
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "output_number", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["components_rgb_led"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.RGBLED,
				"args0": [
					{
						"type": "field_image",
						"src": Blockly.mainWorkspace.options.pathToMedia + "extensions/rgb.svg",
						"width": 40,
						"height": 40,
					},
					{
						"type": "field_vertical_separator"
					},
					{
						"type": "input_value",
						"name": "PINR"
					},
					{
						"type": "input_value",
						"name": "PING"
					},
					{
						"type": "input_value",
						"name": "PINB"
					},
					{
						"type": "input_value",
						"name": "COLOR"
					}
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "shape_statement", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["components_ultrasonic"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.ULTRASONIC,
				"args0": [
					{
						"type": "input_value",
						"name": "PINT"
					},
					{
						"type": "input_value",
						"name": "PINE"
					}
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "output_number", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["components_pir"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.PIR_SENSOR,
				"args0": [
					{
						"type": "input_value",
						"name": "PIN"
					}
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "output_boolean", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["components_buzzer_volume"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.BUZZER_VOLUME,
				"args0": [
					{
						"type": "input_value",
						"name": "PIN"
					},
					{
						"type": "input_value",
						"name": "VOLUME"
					}
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "shape_statement", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["components_buzzer_freq"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.BUZZER_FREQ,
				"args0": [
					{
						"type": "input_value",
						"name": "PIN"
					},
					{
						"type": "input_value",
						"name": "NOTE"
					}
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "shape_statement", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["components_internaltemp"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.INTERNAL_TEMP,
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "output_number", "scratch_extension"]
			})
		}
	}
}