import { addData } from "./consolechart.js";
import { isInTask, nextTask, setVerifying, taskIndex, verifying } from "./task/level.js";
import { $, sleep } from "./util.js";
const { MicroPythonDevice } = require("micropython-ctl-cont");
const fs = require("fs");

const { SerialPort } = require('serialport')
const { autoDetect } = require("@serialport/bindings-cpp")
let picoport;
export let port = new MicroPythonDevice();
let connectDialogShown = false;
let test;
let testInterval;
window.SerialPort = SerialPort;
window.port = port;

window.addEventListener("beforeunload", (e) => {
	if(port) port.disconnect();
})

$("#pico-test-success").addEventListener("click", async () => {
	test = true;
});

export function connectPort() {
	if(port && port.isOpen) return;
	console.log("Checking");
	autoDetect().list().then(async ports => {
		picoport = ports.find(p => p.manufacturer == "MicroPython" || p.manufacturer == "Microsoft");
		if(!picoport) {
			connectDialogShown = true;
			new Dialog("#connect-pico-dialog").show();
			if(document.querySelector("#connect-pico-obj").contentDocument.querySelector("#usb-connected")) document.querySelector("#connect-pico-obj").contentDocument.querySelector("#usb-connected").id = "usb";
			setTimeout(connectPort, 1000);
			return;
		}
		if(connectDialogShown) {
			connectDialogShown = false;
			document.querySelector("#connect-pico-obj").contentDocument.querySelector("#usb").id = "usb-connected";
		}
		picoport = picoport.path;
		console.log("Port: " + picoport)
		// port = new SerialPort({
		// 	path: picoport,
		// 	baudRate: 115200,
		// });
		port.onTerminalData = async function (data) {
			// const data = port.read().toString()
			document.querySelector("#console").innerText += data;
			document.querySelector("#console").scrollTop = document.querySelector("#console").scrollHeight;
			document.dispatchEvent(new CustomEvent("portdata", {detail: data}))

			// if(data.includes("PicoScratch connection test")) {
			// 	test = true;
			// 	if(taskIndex == -1 && !connectDialogShown) nextTask();
			// 	setTimeout(async () => {
			// 		await new Dialog("#connect-pico-dialog").hide();
			// 	}, 500);
			// }

			// Check if the data can be parsed as a float
			if(!isNaN(parseFloat(data))) {
				addData(parseFloat(data));
				console.log("Data: " + parseFloat(data));
			}

			// if(verifying) {
			// 	if(data.includes("True")) {
			// 		setVerifying(false);
			// 	}
			// }
		};
		// port.on("error", async (err) => {
		// 	console.error(err);
		// 	if(!isInTask) return;
		// 	if(!$("#connect-pico-obj").contentDocument) {
		// 		new Dialog("#connect-pico-dialog").show();
		// 		await sleep(500);
		// 		document.querySelector("#connect-pico-obj").contentDocument.querySelector("#usb").id = "usb-connected";
		// 	}
		// 	$("#connect-pico-obj").contentDocument.querySelector("#error").style.fill = "#F55050";
		// 	$("#connect-pico-porterror").style.display = "";
		// 	$("#connect-pico-porterror").innerText = "Computer sagt nein: " + err.message;
		// 	await sleep(3000);
		// 	$("#connect-pico-obj").contentDocument.querySelector("#error").style.fill = "none";
		// 	$("#connect-pico-porterror").style.display = "none";
		// 	connectPort();
		// })
		port.onclose = () => {
			//if(!isInTask) return;
			if($("#editor").style.display == "none") return;
			if($("#connect-pico-obj").contentDocument) $("#connect-pico-obj").contentDocument.querySelector("#error").style.fill = "none";
			$("#connect-pico-error").style.display = "none";
			if(testInterval) clearTimeout(testInterval);
			connectPort();
		};
		// port.on("open", async () => {
		// 	console.log("open", taskIndex, connectDialogShown);
		// 	if(taskIndex == -1 && !connectDialogShown) {
		// 		if(!new Dialog("#wiring-dialog").shown || !new Dialog("#wiring-begin-dialog").shown) nextTask();
		// 	}
			// Test pico
			// console.log("Testing pico");
			// await writePort("\r\x05")
			// await writePort("print('PicoScratch connection test')\r")
			// await writePort("\r\x04");

			// testInterval = setTimeout(async () => {
			// 	if(test) return;
			// 	console.log("Didn't succeed test");
			// 	// try to reset pico
			// 	await writePort("\x04");
			// 	await sleep(500);
			// 	await writePort("\r\x05")
			// 	await writePort("print('PicoScratch connection test')\r")
			// 	await writePort("\r\x04");

			// 	testInterval = setTimeout(async () => {
			// 		if(test) return;
			// 		console.log("Still not respondig to test, giving up");
			// 		// alert("Pico did not respond. Please try again.\nThe cable you are using might not be a data cable.\nTry plugging it into a different USB port, or try a different cable.\nIf the issue persists, please restart the program.");
			// 		if(!$("#connect-pico-obj").contentDocument) {
			// 			new Dialog("#connect-pico-dialog").show();
			// 			await sleep(500);
			// 			document.querySelector("#connect-pico-obj").contentDocument.querySelector("#usb").id = "usb-connected";
			// 		}
			// 		$("#connect-pico-obj").contentDocument.querySelector("#error").style.fill = "#F55050";
			// 		$("#connect-pico-error").style.display = "";
			// 		await sleep(20000);
			// 		testInterval = undefined;
			// 		port.close();
			// 		$("#connect-pico-obj").contentDocument.querySelector("#error").style.fill = "none";
			// 		$("#connect-pico-error").style.display = "none";
			// 	}, 2000);
			// }, 2000);
		// })
		await port.connectSerial(picoport);
		console.log("open", taskIndex, connectDialogShown);
		if(taskIndex == -1 && !connectDialogShown) {
			if(!new Dialog("#wiring-dialog").shown || !new Dialog("#wiring-begin-dialog").shown) nextTask();
		}
		await port.runScript("print('Dein Pico funktioniert!')\r", { broadcastOutputAsTerminalData: true });
		const boardInfo = await port.getBoardInfo();
		console.log(boardInfo);
		if(boardInfo.machine.includes("Pico W")) {
			$("#pico-w").click();
		} else if(boardInfo.machine.includes("Pico")) {
			$("#pico").click();
		}
		await new Dialog("#connect-pico-dialog").hide();
	});
}

export function writePort(text) {
	return new Promise(async (resolve) => {
		// await sleep(100);
		// port.write(text, (err) => {
			// if(err) console.error(err);
			// resolve();
		// })
		await port.sendData(text);
	})
}
