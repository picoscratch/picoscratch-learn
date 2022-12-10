import { ws } from "../script.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const btnCompleteTemplate = $("#btnComplete");
const btnStartTemplate = $("#btnStart");
const btnLockedTemplate = $("#btnLocked");

let gi = 0;
const DISTANCE = 130;
const ANIMATIONDURATION = 50;
const RIGHT = 300;
const ADDTOP = 30;

function createButton(template, locked) {
	const mi = gi;
	const e = document.createElement("div");
  e.classList.add("levelpath-button");
	e.style.marginLeft = "calc(50% - " + RIGHT / 2 + "px - 40px)";
  $("#levelpath-levels").appendChild(e);
  e.appendChild(template.cloneNode(true));
  e.querySelector("svg").style.display = "";
  e.querySelector("svg").id = "";
  if(gi % 2 == 0) {
    // e.style.right = RIGHT;
		e.style.left = RIGHT + "px";
  }
  e.style.top = gi * DISTANCE + ADDTOP + "px";
  $("#levelpath-levels").style.height = (gi + 1) * DISTANCE + ADDTOP + "px";
  
  e.addEventListener("mousedown", () => {
    const moving = e.querySelectorAll("svg .moving");
    moving.forEach(e => {
			e.animate([
				{
					transform: "translateY(0)"
				},
				{
					transform: "translateY(5px)"
				}
			], {
				duration: ANIMATIONDURATION,
				iterations: 1,
				fill: "forwards"
			})
		});
  })
  e.addEventListener("mouseup", () => {
    const moving = e.querySelectorAll("svg .moving");
    moving.forEach(e => {
			e.animate([
				{
					transform: "translateY(5px)"
				},
				{
					transform: "translateY(0)"
				}
			], {
				duration: ANIMATIONDURATION,
				iterations: 1,
				fill: "forwards"
			})
		});
  })
	if(!locked) {
		e.addEventListener("click", () => {
			document.querySelector("#start-btn").setAttribute("data-level", mi);
			$("#startWindow").style.display = "";
			$("#startWindow").style.top = e.style.top;
			$("#startWindow").style.left = e.style.left;
			$("#startWindow").style.marginLeft = e.style.marginLeft;
			$("#startWindow").style.transform = "translate(-40%, -20%)";
			$("#startWindow").animate([
				{
					transform: $("#startWindow").style.transform + " scale(0)"
				},
				{
					transform: $("#startWindow").style.transform + " scale(1)"
				}
			], {
				duration: 150,
				fill: "forwards"
			})
			ws.send("info " + (mi + 1));
		})
	}
  
  gi++;
}

export function createButtons(complete, locked) {
	while(document.querySelector("#levelpath-levels").firstChild) {
		document.querySelector("#levelpath-levels").firstChild.remove();
	}
	gi = 0;
	for(let i = 0; i < complete; i++) {
		createButton(btnCompleteTemplate);
	}
	createButton(btnStartTemplate);
	for(let i = 0; i < locked; i++) {
		createButton(btnLockedTemplate, true);
	}
}

document.addEventListener("click", (e) => {
	if(e.target.classList.contains("levelpath-button") || e.target.parentElement?.classList.contains("levelpath-button") || e.target.parentElement?.parentElement?.classList.contains("levelpath-button") || e.target.parentElement?.parentElement?.parentElement?.classList.contains("levelpath-button")) return;
	if(e.target.id == "startWindow" || e.target.parentElement?.id == "startWindow") return;
	document.querySelector("#start-btn").removeAttribute("data-level");
	$("#startWindow").animate([
		{
			transform: $("#startWindow").style.transform + " scale(1)"
		},
		{
			transform: $("#startWindow").style.transform + " scale(0)"
		}
	], {
		duration: 150,
		fill: "forwards"
	})
	setTimeout(() => {
		$("#startWindow").style.display = "none";
	}, 150);
})