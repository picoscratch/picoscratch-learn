const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const { readFileSync, writeFileSync } = require("fs");
require('@electron/remote/main').initialize()

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
		kiosk: false
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

	win.loadFile("web/index.html");

	win.webContents.openDevTools();
})