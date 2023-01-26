const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const { readFileSync, writeFileSync } = require("fs");
const path = require("path");
const isPackaged = require("electron-is-packaged").isPackaged;
require('@electron/remote/main').initialize()
const { autoUpdater } = require("electron-updater");
const Store = require("electron-store");

const store = new Store();

let win;

Menu.setApplicationMenu(null)

function start() {
	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
			contextIsolation: false,
			nodeIntegrationInSubFrames: true,
		},
		// kiosk: true,
		icon: path.join(__dirname, "picoscratch.ico")
	})
	require('@electron/remote/main').enable(win.webContents)

	ipcMain.on("config.set", (e, key, value) => {
		store.set(key, value);
	})
	ipcMain.on("config.get", (e, key) => {
		e.returnValue = store.get(key);
	})
	ipcMain.on("config.has", (e, key) => {
		e.returnValue = store.has(key);
	})
	ipcMain.on("config.del", (e, key) => {
		store.delete(key);
	})
	ipcMain.on("config.json", (e, key) => {
		e.returnValue = store.store;
	})
	ipcMain.on("version", (e) => {
		e.returnValue = app.getVersion();
	})
	ipcMain.on("save", (e, xml) => {
		const path = dialog.showSaveDialogSync(win, { title: "Projekt speichern...", defaultPath: "project.xml", filters: [{ name: "PicoScratch Projekte", extensions: ["xml"] }] });
		if(path) {
			writeFileSync(path, xml);
		}
	})
	ipcMain.on("load", (e) => {
		const path = dialog.showOpenDialogSync(win, { title: "Projekt laden...", filters: [{ name: "PicoScratch Projekte", extensions: ["xml"] }], properties: ["openFile"] });
		if(path) {
			e.returnValue = readFileSync(path[0], { encoding: "utf-8" });
		}
		e.returnValue = null;
	})
	ipcMain.on("close", (e) => {
		win.close();
		start();
	})
	const STARTCODE = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a", "enter"];
	let code = [...STARTCODE];
	win.webContents.on("before-input-event", (e, input) => {
		if(input.type == "keyUp") return;
		if(!input.shift) return;
    if(input.key.toLowerCase() == code[0]) {
			code.shift();
			if(code.length == 0) {
				win.webContents.toggleDevTools();
				win.webContents.send("devmode");
				code = [...STARTCODE];
			}
    } else {
			code = [...STARTCODE];
		}
  })
	const SUPPORTCODE = ["s", "u", "p", "p", "o", "r", "t", "enter"];
	let supcode = [...SUPPORTCODE];
	win.webContents.on("before-input-event", (e, input) => {
		if(input.type == "keyUp") return;
		if(input.key.toLowerCase() == supcode[0]) {
			supcode.shift();
			if(supcode.length == 0) {
				win.webContents.send("support");
				supcode = [...SUPPORTCODE];
			}
		} else {
			supcode = [...SUPPORTCODE];
		}
	})

	win.maximize();

	if(!store.has("title")) win.loadFile("web/setup.html");
	else win.loadFile("web/editor.html");

	if(!isPackaged) win.webContents.openDevTools();
}

app.whenReady().then(() => {
	start();

	if(store.has("channel")) {
		autoUpdater.channel = store.get("channel");
	} else {
		autoUpdater.channel = "latest";
	}

	autoUpdater.checkForUpdates();
})

autoUpdater.on("update-available", (info) => {
	console.log("update-available event", info);
	win.webContents.send("update", info);
})

autoUpdater.on("download-progress", (progress) => {
	console.log("download-progress", progress);
	win.webContents.send("updateProgress", progress);
})

autoUpdater.on("update-downloaded", (info) => {
	autoUpdater.quitAndInstall();
})