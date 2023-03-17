import { setCurrentLevel } from "../task/level.js";
import { ws } from "../task/server.js";
import { currentSection } from "./sections.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const btnCompleteTemplate = $("#btnComplete");
const btnStartTemplate = $("#btnStart");
const btnLockedTemplate = $("#btnLocked");

let gi = 0;
const DISTANCE = 130;
const ANIMATIONDURATION = 50;
const RIGHT = 500;
const ADDTOP = 30;

function createButton(template, locked, info) {
	const mi = gi;
	const e = document.createElement("div");
  e.classList.add("levelpath-button");
	e.style.marginLeft = "calc(" + RIGHT / 2 + "px - 40px)";
  $("#levelpath-levels").appendChild(e);
  e.appendChild(template.cloneNode(true));
  e.querySelector("svg").style.display = "";
  e.querySelector("svg").id = "";
  if(gi % 2 == 0) {
    e.style.right = RIGHT + "px";
		// e.style.left = RIGHT + "px";
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
			// document.querySelector("#start-btn").setAttribute("data-level", mi);
			ws.send(JSON.stringify({type: "task", level: mi, section: currentSection}));
			setCurrentLevel(mi);
		})

		console.log("Add info");
		const infoContainer = document.createElement("div");
		infoContainer.classList.add("levelpath-button");
		infoContainer.style.textAlign = "center";
		infoContainer.style.marginLeft = "calc(" + RIGHT / 2 + "px - 40px)";
		$("#levelpath-levels").appendChild(infoContainer);
		if(!(mi % 2 == 0)) {
			infoContainer.style.right = RIGHT + "px";
			// e.style.left = RIGHT + "px";
		}
		infoContainer.style.top = "calc(" + (mi * DISTANCE + ADDTOP) + "px + 5px)";
		const infoName = document.createElement("h2");
		infoName.innerText = info.name;
		infoName.style.margin = "0";
		infoContainer.appendChild(infoName);
		const infoDesc = document.createElement("p");
		infoDesc.innerText = info.desc;
		infoDesc.style.margin = "0";
		infoContainer.appendChild(infoDesc);
	}
  
  gi++;

	return e;
}

export function createButtons(complete, locked, done, infos) {
	while(document.querySelector("#levelpath-levels").firstChild) {
		document.querySelector("#levelpath-levels").firstChild.remove();
	}
	gi = 0;
	let start;
	for(let i = 0; i < complete; i++) {
		const btn = createButton(btnCompleteTemplate, false, infos[i]);
		if(done) start = btn;
	}
	if(!done) start = createButton(btnStartTemplate, false, infos[complete]);
	for(let i = 0; i < locked; i++) {
		createButton(btnLockedTemplate, true);
	}
	requestAnimationFrame(() => {
		start.scrollIntoView({behavior: "smooth", block: "center"});
	})
}

// document.addEventListener("click", (e) => {
// 	if(e.target.classList.contains("levelpath-button") || e.target.parentElement?.classList.contains("levelpath-button") || e.target.parentElement?.parentElement?.classList.contains("levelpath-button") || e.target.parentElement?.parentElement?.parentElement?.classList.contains("levelpath-button")) return;
// 	if(e.target.id == "startWindow" || e.target.parentElement?.id == "startWindow") return;
// 	document.querySelector("#start-btn").removeAttribute("data-level");
// 	$("#startWindow").animate([
// 		{
// 			transform: $("#startWindow").style.transform + " scale(1)"
// 		},
// 		{
// 			transform: $("#startWindow").style.transform + " scale(0)"
// 		}
// 	], {
// 		duration: 150,
// 		fill: "forwards"
// 	})
// 	setTimeout(() => {
// 		$("#startWindow").style.display = "none";
// 	}, 150);
// })