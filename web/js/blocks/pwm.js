export const pwmToolbox = `<category name="PWM" id="pwm" colour="#9966FF" secondaryColour="#774DCB">
<block type="pwm_duty" id="pwm_duty">
	<value name="PIN">
		<shadow type="math_number">
			<field name="NUM">0</field>
		</shadow>
	</value>
	<value name="DUTY">
		<shadow type="math_number">
			<field name="NUM">65535</field>
		</shadow>
	</value>
</block>
<block type="pwm_duty_255" id="pwm_duty_255">
	<value name="PIN">
		<shadow type="math_number">
			<field name="NUM">0</field>
		</shadow>
	</value>
	<value name="DUTY">
		<shadow type="math_number">
			<field name="NUM">255</field>
		</shadow>
	</value>
</block>
<block type="pwm_freq" id="pwm_freq">
	<value name="PIN">
		<shadow type="math_number">
			<field name="NUM">0</field>
		</shadow>
	</value>
	<value name="FREQ">
		<shadow type="math_number">
			<field name="NUM">1907</field>
		</shadow>
	</value>
</block>
<block type="get_pwm_duty" id="get_pwm_duty">
	<value name="PIN">
		<shadow type="math_number">
			<field name="NUM">0</field>
		</shadow>
	</value>
</block>
<block type="get_pwm_duty_255" id="get_pwm_duty_255">
	<value name="PIN">
		<shadow type="math_number">
			<field name="NUM">0</field>
		</shadow>
	</value>
</block>
<block type="get_pwm_freq" id="get_pwm_freq">
	<value name="PIN">
		<shadow type="math_number">
			<field name="NUM">0</field>
		</shadow>
	</value>
</block>
</category>`;

export function defineBlocks() {
	Blockly.Msg.PWM_DUTY = "Set pin %1 duty cycle to %2";
	Blockly.ScratchMsgs.locales["en"].PWM_DUTY = "Set pin %1 duty cycle to %2";
	Blockly.ScratchMsgs.locales["de"].PWM_DUTY = "Setze Pin %1 Tastverhältnis auf %2";
	Blockly.Blocks["pwm_duty"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.PWM_DUTY,
				"args0": [
					{
						"type": "input_value",
						"name": "PIN"
					},
					{
						"type": "input_value",
						"name": "DUTY"
					}
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "shape_statement", "scratch_extension"]
			})
		}
	};

	Blockly.Msg.PWM_DUTY_255 = "Set pin %1 duty cycle (-> 255) to %2";
	Blockly.ScratchMsgs.locales["en"].PWM_DUTY_255 = "Set pin %1 duty cycle (-> 255) to %2";
	Blockly.ScratchMsgs.locales["de"].PWM_DUTY_255 = "Setze Pin %1 Tastverhältnis (-> 255) auf %2";
	Blockly.Blocks["pwm_duty_255"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.PWM_DUTY_255,
				"args0": [
					{
						"type": "input_value",
						"name": "PIN"
					},
					{
						"type": "input_value",
						"name": "DUTY"
					}
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "shape_statement", "scratch_extension"]
			})
		}
	};

	Blockly.Msg.PWM_FREQ = "Set pin %1 frequency to %2 Hz";
	Blockly.ScratchMsgs.locales["en"].PWM_FREQ = "Set pin %1 frequency to %2 Hz";
	Blockly.ScratchMsgs.locales["de"].PWM_FREQ = "Setze Pin %1 Frequenz auf %2 Hz";

	Blockly.Blocks["pwm_freq"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.PWM_FREQ,
				"args0": [
					{
						"type": "input_value",
						"name": "PIN"
					},
					{
						"type": "input_value",
						"name": "FREQ"
					}
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_looks", "shape_statement", "scratch_extension"]
			})
		}
	};

	Blockly.Msg.GET_PWM_DUTY = "pin %1 duty cycle";
	Blockly.ScratchMsgs.locales["en"].GET_PWM_DUTY = "pin %1 duty cycle";
	Blockly.ScratchMsgs.locales["de"].GET_PWM_DUTY = "Pin %1 Tastverhältnis";

	Blockly.Blocks["get_pwm_duty"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.GET_PWM_DUTY,
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

	Blockly.Msg.GET_PWM_DUTY_255 = "pin %1 duty cycle (-> 255)";
	Blockly.ScratchMsgs.locales["en"].GET_PWM_DUTY_255 = "pin %1 duty cycle (-> 255)";
	Blockly.ScratchMsgs.locales["de"].GET_PWM_DUTY_255 = "Pin %1 Tastverhältnis (-> 255)";

	Blockly.Blocks["get_pwm_duty_255"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.GET_PWM_DUTY_255,
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

	Blockly.Msg.GET_PWM_FREQ = "pin %1 frequency";
	Blockly.ScratchMsgs.locales["en"].GET_PWM_FREQ = "pin %1 frequency";
	Blockly.ScratchMsgs.locales["de"].GET_PWM_FREQ = "Pin %1 Frequenz";

	Blockly.Blocks["get_pwm_freq"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.GET_PWM_FREQ,
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
}