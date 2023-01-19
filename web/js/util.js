export const $ = document.querySelector.bind(document);
export const $$ = document.querySelectorAll.bind(document);
export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}