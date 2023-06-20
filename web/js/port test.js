import { addData } from "./consolechart.js";
import { nextTask, setVerifying, taskIndex, verifying } from "./task/level.js";
import { $, sleep } from "./util.js";

const PICO_VID = 0x2E8A;
const PICO_PIDS = {
	"boot": 0x0003,
	"picoprobe": 0x0004,
	"micropython": 0x0005,
	"sdk": 0x000A,
	"circuitpython": 0x000B,
}

const { SerialPort } = require('serialport')
const { autoDetect } = require("@serialport/bindings-cpp")
let picoport;
export let port;
let connectDialogShown = false;
let test;
let testInterval;

window.addEventListener("beforeunload", () => {
	if(port) port.close();
})

$("#pico-test-success").addEventListener("click", async () => {
	test = true;
});

class LineBreakTransformer {
  constructor() {
    // A container for holding stream data until a new line.
    this.chunks = "";
  }

  transform(chunk, controller) {
    // Append new chunks to existing chunks.
    this.chunks += chunk;
    // For each line breaks in chunks, send the parsed lines out.
    const lines = this.chunks.split("\r\n");
    this.chunks = lines.pop();
    lines.forEach((line) => controller.enqueue(line));
  }

  flush(controller) {
    // When the stream is closed, flush any remaining chunks out.
    controller.enqueue(this.chunks);
  }
}

export async function connectPort() {
	if(port && port.isOpen) return;
	console.log("Checking");
	try {
		port = await navigator.serial.requestPort({ filters: [{ usbVendorId: PICO_VID, usbProductId: PICO_PIDS["micropython"] }] });
		await port.open({ baudRate: 115200 });
		const textDecoder = new TextDecoderStream();
		const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
		const reader = textDecoder.readable.getReader();

		// Listen to data coming from the serial device.
		while (true) {
			const { value, done } = await reader.read();
			if (done) {
				// Allow the serial port to be closed later.
				reader.releaseLock();
				break;
			}
			// value is a string.
			console.log(value);
		}
	} catch(e) {
		if(e.name == "NotFoundError") {
			connectDialogShown = true;
			new Dialog("#connect-pico-dialog").show();
			if(document.querySelector("#connect-pico-obj").contentDocument.querySelector("#usb-connected")) document.querySelector("#connect-pico-obj").contentDocument.querySelector("#usb-connected").id = "usb";
			setTimeout(connectPort, 1000);
			return;
		}
		// error
		console.error(e);
		if(!$("#connect-pico-obj").contentDocument) {
			new Dialog("#connect-pico-dialog").show();
			await sleep(500);
			document.querySelector("#connect-pico-obj").contentDocument.querySelector("#usb").id = "usb-connected";
		}
		$("#connect-pico-obj").contentDocument.querySelector("#error").style.fill = "#F55050";
		$("#connect-pico-porterror").style.display = "";
		$("#connect-pico-porterror").innerText = e.name;
		await sleep(3000);
		$("#connect-pico-obj").contentDocument.querySelector("#error").style.fill = "none";
		$("#connect-pico-porterror").style.display = "none";
		connectPort();
	}
}

export async function writePort(text) {
	// return new Promise(async (resolve) => {
		// await sleep(100);
		// port.write(text, (err) => {
		// 	if(err) console.error(err);
		// 	resolve();
		// })
	// })
	const writer = port.writable.getWriter();
	const data = new Uint8Array(text.length);
	for(let i = 0; i < text.length; i++) {
		data[i] = text.charCodeAt(i);
	}
	await writer.write(data);
	writer.releaseLock();
}