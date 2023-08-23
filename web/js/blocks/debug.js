export const debugToolbox = `<category name="Debug" id="debug" colour="#29beb8" secondaryColour="#29ebe8" 
iconURI="./media/extensions/wedo2-block-icon.svg" showStatusButton="false">
<block type="debug_print" id="debug_print">
	<value name="VALUE">
		<shadow type="text">
			<field name="TEXT">Hello World</field>
		</shadow>
	</value>
</block>
<block type="debug_read_console" id="debug_read_console">
	<value name="REQ">
		<shadow type="text">
			<field name="TEXT"></field>
		</shadow>
	</value>
</block>
<block type="debug_python" id="debug_python">
	<value name="CODE">
		<shadow type="text">
			<field name="TEXT">print("Hello World!")</field>
		</shadow>
	</value>
</block>
</category>`;

export function defineBlocks() {
	Blockly.Blocks["debug_read_console"] = {
		/**
		 * @this Blockly.Block
		 */
		init: function() {
			this.jsonInit({
				"message0": Blockly.Msg.READ_CONSOLE,
				"args0": [
					{
						"type": "input_value",
						"name": "REQ"
					},
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_more", "output_string", "scratch_extension"]
			});
		}
	};
	Blockly.Blocks["debug_python"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.PYTHON,
				"args0": [
					{
						"type": "input_value",
						"name": "CODE"
					},
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_more", "shape_statement", "scratch_extension"]
			})
		}
	};
	Blockly.Blocks["debug_print"] = {
		init() {
			this.jsonInit({
				"message0": Blockly.Msg.PRINT,
				"args0": [
					{
						"type": "input_value",
						"name": "VALUE"
					},
				],
				"category": Blockly.Categories.more,
				"extensions": ["colours_more", "shape_statement", "scratch_extension"]
			})
		}
	};
}