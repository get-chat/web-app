// Loads the Google Maps JavaScript API on demand and caches the result,
// so the script is injected only once no matter how often it is requested.
const CALLBACK_NAME = '__onGoogleMapsLoaded';

let googleMapsPromise: Promise<any> | undefined;

export const loadGoogleMaps = (apiKey: string): Promise<any> => {
	if (window.google?.maps?.importLibrary) {
		return Promise.resolve(window.google.maps);
	}

	if (!googleMapsPromise) {
		googleMapsPromise = new Promise((resolve, reject) => {
			(window as any)[CALLBACK_NAME] = () => {
				delete (window as any)[CALLBACK_NAME];
				resolve(window.google.maps);
			};

			const script = document.createElement('script');
			script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
				apiKey
			)}&loading=async&callback=${CALLBACK_NAME}`;
			script.async = true;
			script.onerror = () => {
				// Allow retrying on a later attempt
				googleMapsPromise = undefined;
				delete (window as any)[CALLBACK_NAME];
				reject(new Error('Google Maps script could not be loaded.'));
			};
			document.head.appendChild(script);
		});
	}

	return googleMapsPromise;
};
