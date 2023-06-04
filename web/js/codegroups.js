export let currentGroup = null;

export function setGroup(group) {
	currentGroup = group;
}

export function createCodeGroup() {
	ws.send(JSON.stringify({type: "startGroup"}));
}

export function joinCodeGroup(group) {
	ws.send(JSON.stringify({type: "joinGroup", group: group}));
	currentGroup = group;
}

export function leaveCodeGroup() {
	ws.send(JSON.stringify({type: "leaveGroup"}));
	currentGroup = null;
}

export function syncCodeGroup() {
	ws.send(JSON.stringify({type: "syncGroup"}));
}