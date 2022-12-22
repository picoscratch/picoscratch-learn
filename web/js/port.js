import { nextTask, taskIndex } from './script.js';

const { SerialPort } = require('serialport')
const { autoDetect } = require("@serialport/bindings-cpp")
let picoport;
export let port;
let connectDialogShown = false;

window.addEventListener("beforeunload", () => {
	port.close();
})

export function connectPort() {
	if(port && port.isOpen) return;
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
			setTimeout(async () => {
				await new Dialog("#connect-pico-dialog").hide();
			}, 500);
		}
		picoport = picoport.path;
		port = new SerialPort({
			path: picoport,
			baudRate: 115200,
		});
		port.on('readable', async function () {
			const data = port.read().toString()
			document.querySelector("#console").innerText += data;
			document.querySelector("#console").scrollTop = document.querySelector("#console").scrollHeight;
			document.dispatchEvent(new CustomEvent("portdata", {detail: data}))
		})
		port.on("error", () => {
			connectPort();
		})
		port.on("close", () => {
			connectPort();
		})
		port.on("open", () => {
			console.log("open");
			if(taskIndex == -1 && !connectDialogShown) nextTask();
		})
	});
}

export function writePort(text) {
	return new Promise(async (resolve) => {
		// await sleep(100);
		port.write(text, (err) => {
			if(err) console.error(err);
			resolve();
		})
	})
}