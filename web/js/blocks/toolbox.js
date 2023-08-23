import { adcToolbox } from "./adc.js";
import { componentsToolbox } from "./components.js";
import { debugToolbox } from "./debug.js";
import { pinToolbox } from "./pin.js";
import { pwmToolbox } from "./pwm.js";

const BEFORE_CATEGORIES = {
	pin: pinToolbox,
	pwm: pwmToolbox,
	adc: adcToolbox
}

const AFTER_CATEGORIES = {
	components: componentsToolbox,
	debug: debugToolbox
}

export function defineToolbox() {
	Blockly.Blocks.defaultToolbox = `<xml id="toolbox-categories" style="display: none">`;
	for(const cat in BEFORE_CATEGORIES) {
		Blockly.Blocks.defaultToolbox += `${BEFORE_CATEGORIES[cat]}`;
	}
	Blockly.Blocks.defaultToolbox += `${defaultToolboxItems}`;
	for(const cat in AFTER_CATEGORIES) {
		Blockly.Blocks.defaultToolbox += `${AFTER_CATEGORIES[cat]}`;
	}
	Blockly.Blocks.defaultToolbox += `</xml>`;
}

// TODO: wait ms, wait ns
export const defaultToolboxItems = `<category name="%{BKY_CATEGORY_EVENTS}" id="events" colour="#FFD500" secondaryColour="#CC9900">
	<block type="event_whenflagclicked" id="event_whenflagclicked"></block>
</category>

<category name="%{BKY_CATEGORY_CONTROL}" id="control" colour="#FFAB19" secondaryColour="#CF8B17">
	<block type="control_wait" id="control_wait">
		<value name="DURATION">
			<shadow type="math_positive_number">
				<field name="NUM">1</field>
			</shadow>
		</value>
	</block>
	<block type="control_wait_ms" id="control_wait_ms">
		<value name="DURATION">
			<shadow type="math_positive_number">
				<field name="NUM">1</field>
			</shadow>
		</value>
	</block>
	<block type="control_wait_us" id="control_wait_us">
		<value name="DURATION">
			<shadow type="math_positive_number">
				<field name="NUM">1</field>
			</shadow>
		</value>
	</block>
	<block type="control_repeat" id="control_repeat">
		<value name="TIMES">
			<shadow type="math_whole_number">
				<field name="NUM">10</field>
			</shadow>
		</value>
	</block>
	<block type="control_forever" id="control_forever"></block>
	<block type="control_if" id="control_if"></block>
	<block type="control_if_else" id="control_if_else"></block>
	<block type="control_wait_until" id="control_wait_until"></block>
	<block type="control_repeat_until" id="control_repeat_until"></block>
	<block type="control_stop" id="control_stop"></block>
</category>

<category name="%{BKY_CATEGORY_OPERATORS}" id="operators" colour="#40BF4A" secondaryColour="#389438">
	<block type="operator_add" id="operator_add">
		<value name="NUM1">
			<shadow type="math_number">
				<field name="NUM"></field>
			</shadow>
		</value>
		<value name="NUM2">
			<shadow type="math_number">
				<field name="NUM"></field>
			</shadow>
		</value>
	</block>
	<block type="operator_subtract" id="operator_subtract">
		<value name="NUM1">
			<shadow type="math_number">
				<field name="NUM"></field>
			</shadow>
		</value>
		<value name="NUM2">
			<shadow type="math_number">
				<field name="NUM"></field>
			</shadow>
		</value>
	</block>
	<block type="operator_multiply" id="operator_multiply">
		<value name="NUM1">
			<shadow type="math_number">
				<field name="NUM"></field>
			</shadow>
		</value>
		<value name="NUM2">
			<shadow type="math_number">
				<field name="NUM"></field>
			</shadow>
		</value>
	</block>
	<block type="operator_divide" id="operator_divide">
		<value name="NUM1">
			<shadow type="math_number">
				<field name="NUM"></field>
			</shadow>
		</value>
		<value name="NUM2">
			<shadow type="math_number">
				<field name="NUM"></field>
			</shadow>
		</value>
	</block>
	<block type="operator_random" id="operator_random">
		<value name="FROM">
			<shadow type="math_number">
				<field name="NUM">1</field>
			</shadow>
		</value>
		<value name="TO">
			<shadow type="math_number">
				<field name="NUM">10</field>
			</shadow>
		</value>
	</block>
	<block type="operator_lt" id="operator_lt">
		<value name="OPERAND1">
			<shadow type="text">
				<field name="TEXT"></field>
			</shadow>
		</value>
		<value name="OPERAND2">
			<shadow type="text">
				<field name="TEXT"></field>
			</shadow>
		</value>
	</block>
	<block type="operator_equals" id="operator_equals">
		<value name="OPERAND1">
			<shadow type="text">
				<field name="TEXT"></field>
			</shadow>
		</value>
		<value name="OPERAND2">
			<shadow type="text">
				<field name="TEXT"></field>
			</shadow>
		</value>
	</block>
	<block type="operator_gt" id="operator_gt">
		<value name="OPERAND1">
			<shadow type="text">
				<field name="TEXT"></field>
			</shadow>
		</value>
		<value name="OPERAND2">
			<shadow type="text">
				<field name="TEXT"></field>
			</shadow>
		</value>
	</block>
	<block type="operator_and" id="operator_and"></block>
	<block type="operator_or" id="operator_or"></block>
	<block type="operator_not" id="operator_not"></block>
	<block type="operator_join" id="operator_join">
		<value name="STRING1">
			<shadow type="text">
				<field name="TEXT">hello</field>
			</shadow>
		</value>
		<value name="STRING2">
			<shadow type="text">
				<field name="TEXT">world</field>
			</shadow>
		</value>
	</block>
	<block type="operator_letter_of" id="operator_letter_of">
		<value name="LETTER">
			<shadow type="math_whole_number">
				<field name="NUM">1</field>
			</shadow>
		</value>
		<value name="STRING">
			<shadow type="text">
				<field name="TEXT">world</field>
			</shadow>
		</value>
	</block>
	<block type="operator_length" id="operator_length">
		<value name="STRING">
			<shadow type="text">
				<field name="TEXT">world</field>
			</shadow>
		</value>
	</block>
	<block type="operator_contains" id="operator_contains">
		<value name="STRING1">
			<shadow type="text">
				<field name="TEXT">hello</field>
			</shadow>
		</value>
		<value name="STRING2">
			<shadow type="text">
				<field name="TEXT">world</field>
			</shadow>
		</value>
	</block>
	<block type="operator_mod" id="operator_mod">
		<value name="NUM1">
			<shadow type="math_number">
				<field name="NUM"></field>
			</shadow>
		</value>
		<value name="NUM2">
			<shadow type="math_number">
				<field name="NUM"></field>
			</shadow>
		</value>
	</block>
	<block type="operator_round" id="operator_round">
		<value name="NUM">
			<shadow type="math_number">
				<field name="NUM"></field>
			</shadow>
		</value>
	</block>
	<block type="operator_mathop" id="operator_mathop">
		<value name="NUM">
			<shadow type="math_number">
				<field name="NUM"></field>
			</shadow>
		</value>
	</block>
</category>
<category name="%{BKY_CATEGORY_VARIABLES}" id="data" colour="#FF8C1A" secondaryColour="#DB6E00" custom="VARIABLE">
</category>
<category name="%{BKY_CATEGORY_MYBLOCKS}" id="more" colour="#FF6680" secondaryColour="#FF4D6A" custom="PROCEDURE">
</category>
`;