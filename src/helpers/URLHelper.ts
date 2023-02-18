export const isLocalHost = () => {
	return ['localhost', '127.0.0.1', '10.0.2.2'].includes(
		window.location.hostname
	);
};

export const getAdminPanelURL = (apiBaseURL) => {
	return apiBaseURL.replace('/api/v1', '/admin');
};
export const getHubURL = (apiBaseURL) => {
	return apiBaseURL.replace('/api/v1', '/hub');
};
export const getBaseURL = () => {
	const windowLocation = window.location;
	return windowLocation.protocol + '//' + windowLocation.host + '/';
};
export const getWebSocketURL = (apiBaseURL) => {
	let baseUrlEnv = apiBaseURL;
	if (
		!baseUrlEnv ||
		baseUrlEnv === '/' ||
		baseUrlEnv === '/api/v1/' ||
		baseUrlEnv === '/api/v2/'
	) {
		const baseURL = getBaseURL();
		return prepareWebsocketURL(baseURL);
	} else {
		return prepareWebsocketURL(baseUrlEnv);
	}
};
const prepareWebsocketURL = (url) => {
	return url
		.replace('https://', 'wss://websockets-')
		.replace('http://', 'wss://websockets-')
		.replace('api/v1/', '')
		.replace('api/v2/', '');
};
