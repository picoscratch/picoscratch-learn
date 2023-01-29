import { ws } from "./server.js";

export async function initIdleDetector() {
	try {
		const controller = new AbortController();
		const signal = controller.signal;
	
		const idleDetector = new IdleDetector();
		let lastIdle = false;
		idleDetector.addEventListener('change', () => {
			const userState = idleDetector.userState;
			const screenState = idleDetector.screenState;
			console.log(`Idle change: ${userState}, ${screenState}.`);
			const isIdle = (userState == "idle") || (screenState == "locked");
			if(isIdle != lastIdle) {
				lastIdle = isIdle;
				if(isIdle) {
					console.log("User went idle.");
					ws.send(JSON.stringify({ type: "idleStateChange", idle: true }));
				} else {
					console.log("User is active.");
					ws.send(JSON.stringify({ type: "idleStateChange", idle: false }));
				}
			}
		});
	
		await idleDetector.start({
			threshold: 60000,
			signal
		});
		console.log("IdleDetector started.");
	} catch (err) {
		alert("Can't initialize IdleDetector.", err.message)
	}
}