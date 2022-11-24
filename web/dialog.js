class Dialog {

  el;
	static shown = 0;

  constructor(sel) {
    this.el = document.querySelector(sel);
  }

  show() {
		if(this.el.style.display == "") return;
    this.el.style.display = "";
    document.getElementById("darken").style.display = "";
		Dialog.shown++;
    return this;
  }

  disappear() {
		if(this.el.style.display == "none") return;
    this.el.style.display = "none";
    document.getElementById("darken").style.display = "none";
		Dialog.shown--;
    return this;
  }

  async hide() {
		if(this.el.style.display == "none") return;
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

}