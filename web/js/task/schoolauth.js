import { translate } from "../lang.js";
import { $ } from "../util.js";

export function populateRoomButtons(rooms) {
	console.log(rooms);
	$("#rooms").innerHTML = "";
	if(rooms.length == 0) {
		$("#rooms").innerHTML = "<p>" + translate("no-rooms") + "</p>";
		return;
	}
	for(const room of rooms) {
		const btn = document.createElement("button");
		btn.innerText = room.name;
		btn.setAttribute("data-room", room.uuid);
		btn.addEventListener("click", async () => {
			for(const button of $("#rooms").children) {
				button.classList.remove("selected");
			}
			btn.classList.add("selected");
			document.querySelector("#setup-finish").classList.add("comeIn");
			document.querySelector("#setup-finish").style.opacity = "";
			document.querySelector("#setup-finish").style.pointerEvents = "";
			document.querySelector("#room-input").classList.remove("comeIn");
		});
		$("#rooms").appendChild(btn);
	}
}