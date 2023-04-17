import { ws } from "../task/server.js";
import { $ } from "../util.js";

export let currentSection;

export function setCurrentSection(newSection) {
  currentSection = newSection;
}

export function addSection(section) {
  const sectionDiv = document.createElement("div");
  sectionDiv.classList.add("section");
  const sectionName = document.createElement("h1");
  sectionName.innerText = section.name;
  sectionDiv.appendChild(sectionName);
  const sectionDesc = document.createElement("p");
  sectionDesc.innerText = section.desc;
  sectionDiv.appendChild(sectionDesc);
  const startButton = document.createElement("button");
  startButton.classList.add("btn-green");
  startButton.style.fontSize = "1.5rem";
  startButton.style.display = "flex";
  startButton.style.gap = "5px";
  startButton.style.justifyContent = "center";
  startButton.style.alignItems = "center";
  startButton.innerHTML = `<svg id="play-btn-svg" width="1.5rem" height="1.5rem" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 5.274c0-1.707 1.826-2.792 3.325-1.977l12.362 6.726c1.566.853 1.566 3.101 0 3.953L8.325 20.702C6.826 21.518 5 20.432 5 18.726V5.274Z" fill="#000000"/></svg>
  Start`;
  startButton.addEventListener("click", () => {
    console.log(section.id);
    ws.send(JSON.stringify({ type: "getSection", section: section.id }));
    $("#sections").style.display = "none";
    $("#levelpath-levels").style.display = "";
    $("#section-back").style.display = "";
    $("#section-name").innerText = section.name;
    $("#section-name").style.display = "";
    currentSection = section.id;
  });
  sectionDiv.appendChild(startButton);
  const sectionImg = document.createElement("img");
  sectionImg.src = "learnsections/" + section.img;
  sectionDiv.appendChild(sectionImg);
  $("#sections").appendChild(sectionDiv);
}

export function addLockedSection() {
  const section = document.createElement("div");
  section.classList.add("section");
  const sectionName = document.createElement("h1");
  sectionName.innerText = "???";
  section.appendChild(sectionName);
  const sectionDesc = document.createElement("p");
  sectionDesc.innerText = "Du musst erst den vorherigen Lernabschnitt abschließen!";
  section.appendChild(sectionDesc);
  const startButton = document.createElement("button");
  startButton.classList.add("btn-gray");
  startButton.disabled = true;
  startButton.style.fontSize = "1.5rem";
  startButton.style.display = "flex";
  startButton.style.gap = "5px";
  startButton.style.justifyContent = "center";
  startButton.style.alignItems = "center";
  startButton.innerHTML = `<svg id="play-btn-svg" width="1.5rem" height="1.5rem" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 5.274c0-1.707 1.826-2.792 3.325-1.977l12.362 6.726c1.566.853 1.566 3.101 0 3.953L8.325 20.702C6.826 21.518 5 20.432 5 18.726V5.274Z" fill="#000000"/></svg>
  Start`;
  section.appendChild(startButton);
  $("#sections").appendChild(section);
}

export function addSections(packet) {
  $("#sections").innerHTML = "";
  for(let i = 0; i < packet.total; i++) {
    if(i < packet.sections.length) {
      addSection({...packet.sections[i], id: i});
    } else {
      addLockedSection();
    }
  }
}

$("#section-back").addEventListener("click", () => {
  $("#sections").style.display = "flex";
  $("#levelpath-levels").style.display = "none";
  $("#section-back").style.display = "none";
  $("#section-name").innerText = "";
  $("#section-name").style.display = "none";
});