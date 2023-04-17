export let leaderboard = [];

export function setLeaderboard(newLeaderboard) { leaderboard = newLeaderboard; }

export function renderLeaderboards() {
	renderLeaderboard(document.querySelector("#leaderboard"));
}

export function renderLeaderboard(el) {
	while(el.firstChild) {
		el.removeChild(el.lastChild);
	}
	document.querySelector("#playername span").innerText = capitalizeWords(document.querySelector("#name").value.trim().split(" ")).join(" ");
	document.querySelector("#playername img").src = "https://api.dicebear.com/6.x/thumbs/svg?seed=" + capitalizeWords(document.querySelector("#name").value.trim().split(" ")).join(" ");
	document.querySelector("#editor-name span").innerText = capitalizeWords(document.querySelector("#name").value.trim().split(" ")).join(" ");
	document.querySelector("#editor-name img").src = "https://api.dicebear.com/6.x/thumbs/svg?seed=" + capitalizeWords(document.querySelector("#name").value.trim().split(" ")).join(" ");
	const myUser = leaderboard.find(p => p.name == capitalizeWords(document.querySelector("#name").value.trim().split(" ")).join(" "));
	if(myUser) {
		document.querySelector("#xp").innerText = myUser.xp + " XP";
		const achievements = leaderboard.find(p => p.name == capitalizeWords(document.querySelector("#name").value.trim().split(" ")).join(" ")).achievements;
		for(const a of document.querySelectorAll(".achievement")) {
			a.style.display = "none";
		}
		for(const a of achievements) {
			if(document.querySelector("#achievement-" + a)) document.querySelector("#achievement-" + a).style.display = "flex";
		}
	} else {
		console.log("Cant find myself on leaderboard!");
		alert("Das hier sollte nie passieren.");
	}
	for(let i = 0; i < 10; i++) {
		if(!leaderboard[i]) break;
		console.log(el);
		const player = leaderboard[i];
		const div = document.createElement("div");
		div.classList.add("leaderboard-player");
		el.appendChild(div);
		if((i + 1) < 4) {
			if(i == 0) {
				div.innerHTML = `<svg width="41" height="42" viewBox="0 0 41 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.31177 18.4663H31.876V38.4086C31.876 39.844 30.4566 40.8481 29.1031 40.3701L20.0939 37.1888L11.0847 40.3701C9.73119 40.8481 8.31177 39.844 8.31177 38.4086V18.4663Z" fill="#FFC800"/><circle cx="20.0943" cy="20.0941" r="14.4004" transform="rotate(35.6401 20.0943 20.0941)" fill="#FFD900"/><path d="M11.7032 31.7972C18.1667 36.4314 27.1631 34.9486 31.7973 28.4851L8.39111 11.7031C3.75689 18.1666 5.23977 27.163 11.7032 31.7972Z" fill="#FEEA66"/><path d="M18.945 24.776C18.945 25.604 19.467 26.108 20.205 26.108C20.925 26.108 21.465 25.604 21.465 24.776V15.182C21.465 14.264 20.925 13.652 20.061 13.652C19.485 13.652 18.999 13.886 18.531 14.21L16.605 15.542C16.173 15.83 15.975 16.226 15.975 16.604C15.975 17.216 16.443 17.666 17.019 17.666C17.271 17.666 17.541 17.594 17.775 17.432L18.909 16.658H18.945V24.776Z" fill="#FF9600"/><circle cx="20.0943" cy="20.0941" r="12.9004" transform="rotate(35.6401 20.0943 20.0941)" stroke="#FFC800" stroke-width="3"/></svg>`;
			} else if(i == 1) {
				div.innerHTML = `<svg width="41" height="42" viewBox="0 0 41 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.31201 18.4663H31.8763V38.4086C31.8763 39.844 30.4569 40.8481 29.1033 40.3701L20.0941 37.1888L11.085 40.3701C9.73144 40.8481 8.31201 39.844 8.31201 38.4086V18.4663Z" fill="#AAC1D4"/><circle cx="20.0943" cy="20.0941" r="14.4004" transform="rotate(35.6401 20.0943 20.0941)" fill="#C2D1DD"/><path d="M11.7032 31.7972C18.1667 36.4314 27.1631 34.9486 31.7973 28.4851L8.39111 11.7031C3.75689 18.1666 5.23977 27.163 11.7032 31.7972Z" fill="#D6E4EF"/><path d="M16.0073 24.92C16.0073 25.55 16.4573 26 17.1773 26H22.7933C23.5313 26 23.9453 25.568 23.9453 24.938C23.9453 24.29 23.5313 23.858 22.7933 23.858H19.3553V23.822L22.5773 20.024C23.3333 19.124 23.8193 18.224 23.8193 17.054C23.8193 15.074 22.3793 13.562 20.0573 13.562C17.8793 13.562 16.5113 14.786 16.2413 16.1C16.2233 16.208 16.2053 16.316 16.2053 16.406C16.2053 17.072 16.6913 17.522 17.3393 17.522C17.8433 17.522 18.2213 17.234 18.4733 16.712C18.7973 16.046 19.2473 15.686 19.9493 15.686C20.8133 15.686 21.2993 16.28 21.2993 17.09C21.2993 17.72 21.0473 18.224 20.5793 18.782L16.7633 23.354C16.2053 24.02 16.0073 24.398 16.0073 24.92Z" fill="#849FB5"/><circle cx="20.0946" cy="20.0941" r="12.9004" transform="rotate(35.6401 20.0946 20.0941)" stroke="#AAC1D4" stroke-width="3"/></svg>`;
			} else if(i == 2) {
				div.innerHTML = `<svg width="41" height="42" viewBox="0 0 41 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.31152 19.4663H31.8758V38.4086C31.8758 39.844 30.4564 40.8481 29.1029 40.3701L20.0937 37.1888L11.0845 40.3701C9.73095 40.8481 8.31152 39.844 8.31152 38.4086V19.4663Z" fill="#D7975D"/><circle cx="20.0941" cy="20.0941" r="14.4004" transform="rotate(35.6401 20.0941 20.0941)" fill="#E5AE7C"/><path d="M11.703 31.7972C18.1664 36.4314 27.1628 34.9486 31.7971 28.4851L8.39087 11.7031C3.75665 18.1666 5.23953 27.163 11.703 31.7972Z" fill="#F7BE8B"/><path d="M16.4038 24.326C16.9258 25.514 18.2218 26.198 19.9858 26.198C22.2898 26.198 23.9818 24.686 23.9818 22.454C23.9818 20.852 23.1358 19.862 22.3798 19.502V19.466C23.2618 18.89 23.7478 17.99 23.7478 16.946C23.7478 14.984 22.3618 13.562 19.9678 13.562C18.2038 13.562 16.9798 14.372 16.5298 15.398C16.4398 15.614 16.3858 15.83 16.3858 16.028C16.3858 16.676 16.8538 17.144 17.5018 17.144C17.9518 17.144 18.3838 16.892 18.6178 16.424C18.7978 16.046 19.1398 15.686 19.8598 15.686C20.6878 15.686 21.2278 16.262 21.2278 17.126C21.2278 18.062 20.6518 18.638 19.8418 18.638H19.7158C19.0678 18.638 18.6178 19.07 18.6178 19.7C18.6178 20.33 19.0678 20.762 19.7158 20.762H19.8418C20.7238 20.762 21.4618 21.41 21.4618 22.472C21.4618 23.408 20.8858 24.074 19.9498 24.074C19.3198 24.074 18.8518 23.786 18.5638 23.318C18.2758 22.85 17.8618 22.598 17.4118 22.598C16.7098 22.598 16.2778 23.084 16.2778 23.714C16.2778 23.912 16.3138 24.128 16.4038 24.326Z" fill="#CD7900"/><circle cx="20.0941" cy="20.0941" r="12.9004" transform="rotate(35.6401 20.0941 20.0941)" stroke="#D7975D" stroke-width="3"/></svg>`;
			}
		} else {
			if(i == 9) div.innerHTML = `<h1 class="leaderboard-place leaderboard-place-last">${i + 1}</h1>`;
			else div.innerHTML = `<h1 class="leaderboard-place">${i + 1}</h1>`;
		}
		const avatar = document.createElement("img");
		avatar.src = "https://api.dicebear.com/6.x/thumbs/svg?seed=" + player.name;
		avatar.style.width = "40px";
		avatar.style.height = "40px";
		avatar.style.borderRadius = "100%";
		avatar.style.marginRight = "5px";
		div.appendChild(avatar);

		const name = document.createElement("h2");
		name.classList.add("leaderboard-name");
		name.innerText = player.name;
		if(player.name == capitalizeWords(document.querySelector("#name").value.trim().split(" ")).join(" ")) {
			div.style.backgroundColor = "#2e2e2e";
		}
		div.appendChild(name);
		const xp = document.createElement("h2");
		xp.classList.add("leaderboard-xp");
		xp.innerText = player.xp + " XP";
		div.appendChild(xp);
	}
	// const tr = document.createElement("tr");
	// [translate("place"), translate("name"), translate("level"), translate("quizpercentage")].forEach(s => {
	// 	const td = document.createElement("td");
	// 	td.innerText = s;
	// 	tr.appendChild(td);
	// })
	// el.appendChild(tr);
	// for(let i = 0; i < 10; i++) {
	// 	if(!leaderboard[i]) break;
	// 	const player = leaderboard[i];
	// 	const tr = document.createElement("tr");
	// 	if(player.name == capitalizeWords(document.querySelector("#name").value.trim().split(" ")).join(" ")) {
	// 		tr.style.backgroundColor = "#1d1d1d";
	// 	}
	// 	const place = document.createElement("td");
	// 	place.innerText = i + 1;
	// 	tr.appendChild(place);
	// 	const name = document.createElement("td");
	// 	name.innerText = player.name;
	// 	tr.appendChild(name);
	// 	const level = document.createElement("td");
	// 	level.innerText = player.level;
	// 	tr.appendChild(level);
	// 	const percentage = document.createElement("td");
	// 	percentage.innerText = player.percentage;
	// 	tr.appendChild(percentage);
	// 	el.appendChild(tr);
	// }
}

export function capitalizeWords(arr) {
  return arr.map(element => {
    return element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
  });
}

const tagsToReplace = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\r\n": "<br>",
};

function replaceTag(tag) {
	return tagsToReplace[tag] || tag;
}