const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const { readFileSync, writeFileSync } = require("fs");
const path = require("path");
const isPackaged = require("electron-is-packaged").isPackaged;
require('@electron/remote/main').initialize()
const { autoUpdater } = require("electron-updater");

let win;

Menu.setApplicationMenu(null)

app.whenReady().then(() => {
	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
			contextIsolation: false
		},
		kiosk: false,
		icon: path.join(__dirname, "picoscratch.ico")
	})
	require('@electron/remote/main').enable(win.webContents)

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

	win.maximize();

	win.loadFile("web/editor.html");

	if(!isPackaged) win.webContents.openDevTools();

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