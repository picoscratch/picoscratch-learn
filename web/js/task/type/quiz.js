import { taskIndex } from "../level.js";

export function init(task) {
	document.querySelector("#quiz-question").innerHTML = task.instructions[taskIndex].question;
	document.querySelector("#quiz-answer-1").innerHTML = task.instructions[taskIndex].answers[0];
	document.querySelector("#quiz-answer-2").innerHTML = task.instructions[taskIndex].answers[1];
	document.querySelector("#quiz-answer-3").innerHTML = task.instructions[taskIndex].answers[2];
	document.querySelector("#quiz-answer-4").innerHTML = task.instructions[taskIndex].answers[3];
	document.querySelector("#quiz-answer-1").classList.remove("btn-green");
	document.querySelector("#quiz-answer-1").classList.remove("btn-red");
	document.querySelector("#quiz-answer-2").classList.remove("btn-green");
	document.querySelector("#quiz-answer-2").classList.remove("btn-red");
	document.querySelector("#quiz-answer-3").classList.remove("btn-green");
	document.querySelector("#quiz-answer-3").classList.remove("btn-red");
	document.querySelector("#quiz-answer-4").classList.remove("btn-green");
	document.querySelector("#quiz-answer-4").classList.remove("btn-red");
	new Dialog("#quiz-dialog").show();
}