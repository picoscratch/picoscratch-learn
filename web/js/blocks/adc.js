export const adcToolbox = `<category name="ADC" id="adc" colour="#D65CD6" secondaryColour="#BD42BD">
<block type="adc_read" id="adc_read">
	<value name="PIN">
		<shadow type="math_number">
			<field name="NUM">28</field>
		</shadow>
	</value>
</block>
<block type="adc_read_255" id="adc_read_255">
	<value name="PIN">
		<shadow type="math_number">
			<field name="NUM">28</field>
		</shadow>
	</value>
</block>
<block type="adc_volt" id="adc_volt">
	<value name="PIN">
		<shadow type="math_number">
			<field name="NUM">28</field>
		</shadow>
	</value>
</block>
</category>`;

export function defineBlocks() {
	Blockly.Msg.ADC_READ = "pin %1 analog value";
	Blockly.ScratchMsgs.locales["en"].ADC_READ = "pin %1 analog value";
	Blockly.ScratchMsgs.locales["de"].ADC_READ = "Pin %1 Analogwert";

	Blockly.Blocks["adc_read"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.ADC_READ,
				"args0": [
					{
						"type": "input_value",
						"name": "PIN"
					}
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_sounds", "output_number", "scratch_extension"]
			})
		}
	};

	Blockly.Msg.ADC_READ_255 = "pin %1 analog value (-> 255)";
	Blockly.ScratchMsgs.locales["en"].ADC_READ_255 = "pin %1 analog value (-> 255)";
	Blockly.ScratchMsgs.locales["de"].ADC_READ_255 = "Pin %1 Analogwert (-> 255)";

	Blockly.Blocks["adc_read_255"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.ADC_READ_255,
				"args0": [
					{
						"type": "input_value",
						"name": "PIN"
					}
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_sounds", "output_number", "scratch_extension"]
			})
		}
	};

	Blockly.Msg.ADC_VOLT = "pin %1 analog volts";
	Blockly.ScratchMsgs.locales["en"].ADC_VOLT = "pin %1 analog volts";
	Blockly.ScratchMsgs.locales["de"].ADC_VOLT = "Pin %1 Analog Volt";

	Blockly.Blocks["adc_volt"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.ADC_VOLT,
				"args0": [
					{
						"type": "input_value",
						"name": "PIN"
					}
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_sounds", "output_number", "scratch_extension"]
			})
		}
	};
}