"use strict";
const stockSW = "./sw.js";

/**
 * List of hostnames that are allowed to run serviceworkers on http://
 */
const swAllowedHostnames = ["localhost", "127.0.0.1"];

/**
 * Global util
 * Used in 404.html and index.html
 */
async function registerSW() {
	if (!navigator.serviceWorker) {
		if (
			location.protocol !== "https:" &&
			!swAllowedHostnames.includes(location.hostname)
		)
			throw new Error("Service workers cannot be registered without https.");

		throw new Error("Your browser doesn't support service workers.");
	}

	const registration = await navigator.serviceWorker.register(stockSW);
	if (registration.waiting) {
		registration.waiting.postMessage({ type: "SKIP_WAITING" });
	}
	await navigator.serviceWorker.ready;

	if (!navigator.serviceWorker.controller) {
		await new Promise((resolve) => {
			let settled = false;
			const finish = () => {
				if (settled) return;
				settled = true;
				navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
				resolve();
			};
			const onControllerChange = () => finish();
			navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
			setTimeout(finish, 1500);
		});
	}

	return registration;
}

if (typeof window !== "undefined") {
	window.registerSW = registerSW;
}
