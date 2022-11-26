class Dialog {

  el;
	static shown = 0;

  constructor(sel) {
    this.el = document.querySelector(sel);
  }

	static async hideall(except) {
		const dialogs = document.querySelectorAll(".dialog");
		for(const e of dialogs) {
			if(except && e.id == except) continue;
			if(e.style.display == "") await new Dialog("#" + e.id).hide();
		}
	}

  show() {
		if(this.el.style.display == "") return;
		console.trace("Show", this.el.id);
    this.el.style.display = "";
    document.getElementById("darken").style.display = "";
		Dialog.shown++;
    return this;
  }

  disappear() {
		if(this.el.style.display == "none") return;
		console.trace("Disappear", this.el.id);
    this.el.style.display = "none";
    document.getElementById("darken").style.display = "none";
		Dialog.shown--;
    return this;
  }

  async hide() {
		if(this.el.style.display == "none") return;
		console.trace("Hide", this.el.id);
    this.el.classList.remove("dialog");
    this.el.classList.add("dialogOut");
    document.getElementById("darken").id = "darkenOut";
    await new Promise(resolve => setTimeout(resolve, 500));
    document.getElementById("darkenOut").style.display = "none";
    document.getElementById("darkenOut").id = "darken";
    this.el.style.display = "none";
    this.el.classList.add("dialog");
    this.el.classList.remove("dialogOut");
		Dialog.shown--;
    return this;
  }

  hideButton(sel) {
    document.querySelector(sel).addEventListener("click", () => this.hide());
    return this;
  }

	get isShown() {
		return this.el.style.display == "";
	}

}