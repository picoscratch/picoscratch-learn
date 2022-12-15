const ipcRenderer = require("electron").ipcRenderer;

export function setupUpdater() {
	ipcRenderer.on("updateProgress", (event, progress) => {
		document.querySelector("#update-notification").style.display = "";
		console.log("recieved update progress", progress);
		document.querySelector("#updateProgress").innerText = Math.floor(progress.percent) + "% (" + Math.floor(progress.bytesPerSecond/1000000) + " MB/s)";
		setPercentageInstant("#update-ring", progress.percent);
		if(progress.percent == 100) {
			document.querySelector("#update-ring").classList.add("spinner-indeter")
		}
	})
}

function setPercentageInstant(el, p) {
	document.querySelector(el).getElementsByClassName("ring")[0].getElementsByClassName("dynamic")[0].style.strokeDasharray = 275/100*p + "% 275%";
	document.querySelector(el).getElementsByClassName("ring")[0].getElementsByClassName("dynamic")[0].style.strokeDasharray = 275/100*p + "% 275%";
}
window.setPercentageInstant = setPercentageInstant;