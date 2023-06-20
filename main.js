const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const { readFileSync, writeFileSync, existsSync } = require("fs");
const path = require("path");
const isPackaged = require("electron-is-packaged").isPackaged;
require('@electron/remote/main').initialize()
const { autoUpdater } = require("electron-updater");
const Store = require("electron-store");

const store = new Store();

let win;

Menu.setApplicationMenu(null)

function start() {
	const isDemo = existsSync(path.join(app.getPath("desktop"), "picoscratch-demo.txt"));
	console.log(isDemo);
	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
			contextIsolation: false,
			nodeIntegrationInSubFrames: true,
		},
		kiosk: isDemo,
		fullscreen: isDemo,
		fullScreen: isDemo,
		icon: path.join(__dirname, "picoscratch.ico")
	})
	require('@electron/remote/main').enable(win.webContents)

	if(isDemo) {
		win.on("close", (e) => {
			e.preventDefault();
		})
		app.on("before-quit", (e) => {
			e.preventDefault();
		})
	}

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
	ipcMain.on("isDemo", (e) => {
		e.returnValue = isDemo;
	});
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
	const DEBUGCODE = ["d", "e", "b", "u", "g", "enter"];
	let debugcode = [...DEBUGCODE];
	win.webContents.on("before-input-event", (e, input) => {
		if(input.type == "keyUp") return;
		if(input.key.toLowerCase() == debugcode[0]) {
			debugcode.shift();
			if(debugcode.length == 0) {
				win.webContents.send("debug");
				debugcode = [...DEBUGCODE];
			}
		} else {
			debugcode = [...DEBUGCODE];
		}
	})

	if(!isDemo) win.maximize();

	// if(!store.has("title")) win.loadFile("web/setup.html");
	win.loadFile("web/editor.html");

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
