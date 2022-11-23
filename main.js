const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const { readFileSync, writeFileSync } = require("fs");
const path = require("path");
require('@electron/remote/main').initialize()
const Store = require('electron-store');

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

	if(!store.has("title")) win.loadFile("web/setup.html");
	else win.loadFile("web/editor.html");

	win.webContents.openDevTools();
}

app.whenReady().then(() => {
	start();
})