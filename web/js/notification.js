import { $ } from "./util.js";

export class PSNotification {
	constructor(sel) {
		this.el = $(sel);
	}

	show() {
		this.el.style.display = "";
	}

	async hide() {
		if(!this.isShown) return;
		this.el.classList.add("notificationOut");
		await new Promise((resolve) => setTimeout(resolve, 1000));
		this.el.classList.remove("notificationOut");
		this.el.style.display = "none";
	}

	get isShown() {
		return this.el.style.display != "none";
	}
}