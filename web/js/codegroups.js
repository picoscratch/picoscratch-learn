import { ws } from "./task/server.js";

export let currentGroup = null;

export function setGroup(group) {
	currentGroup = group;
}

export function createCodeGroup() {
	ws.send(JSON.stringify({type: "startGroup"}));
}

export function joinCodeGroup(group) {
	ws.send(JSON.stringify({type: "joinGroup", group: group}));
}

export function leaveCodeGroup() {
	ws.send(JSON.stringify({type: "leaveGroup", group: currentGroup.code}));
	currentGroup = null;
}

export function syncCodeGroup() {
	ws.send(JSON.stringify({type: "syncGroup"}));
}