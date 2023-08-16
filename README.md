	[![](https://img.shields.io/gitlab/pipeline-status/get.chat/web-app.svg?branch=master)](https://gitlab.com/get.chat/web-app/-/pipelines/)

# get.chat Web App

## Prerequisites

[Node.js](https://nodejs.org/) (LTS recommended)

Use the [PNPM](https://pnpm.io/) instead of ~~NPM~~

## Configuration options

Before you run it, you must create the `config.json` file in `public` folder if it doesn't exist. Please see the `public/config.json.tmpl` template file.

```json
{
	"API_BASE_URL": "${APP_API_BASE_URL}",
	"APP_SENTRY_DSN": "${APP_SENTRY_DSN}",
	"APP_ENV_NAME": "${APP_ENV_NAME}",
	"APP_SENTRY_TAG_CLIENT": "${APP_SENTRY_TAG_CLIENT}",
	"APP_NOTIFICATIONS_LIMIT_PER_MINUTE": "${APP_NOTIFICATIONS_LIMIT_PER_MINUTE}",
	"APP_GOOGLE_MAPS_API_KEY": "${APP_GOOGLE_MAPS_API_KEY}",
	"APP_MAX_BULK_DIRECT_RECIPIENTS": "${APP_MAX_BULK_DIRECT_RECIPIENTS}",
	"APP_MAX_BULK_TAG_RECIPIENTS": "${APP_MAX_BULK_TAG_RECIPIENTS}",
	"APP_IS_READ_ONLY": "${APP_IS_READ_ONLY}"
}

```

### API Base URL

Specify the Rest API URL as the value of `API_BASE_URL` inside the config.

`API_BASE_URL` should be set to `/api/v1/` to use same address as get.chat Web App runs on.


### Sentry
Sentry is a developer-first error tracking and performance monitoring platform that helps developers see what actually matters, solve quicker, and learn continuously about their applications.
#### Change Sentry DSN Key

If you forked this project and want to keep Sentry integration enabled, please make sure to use your own Sentry DSN key (https://docs.sentry.io/product/sentry-basics/dsn-explainer/).
In order to do this, please go to `public/config.json` file and replace the value of `APP_SENTRY_DSN` variable.

#### Disable Sentry

In order to disable Sentry integration, you can either remove or comment out `Sentry.init` method inside `src/config/sentry.ts`.

```diff
// ***IMPORTS***
// Init storage type
initStorageType();

// Load external config and render App
axios
	.get(`/config.json`)
	.then((response) => {
		const config = response.data;

		// It is needed for ChatMessageModel
		window.config = config;

 		// Init Sentry
+		// if (!isLocalHost()) {
+		// 	Sentry.init({
+		// 		debug: true,
+		// 		dsn: config.APP_SENTRY_DSN,
+		// 		release: packageJson.version,
+		// 		integrations: [new Integrations.BrowserTracing()],
+		// 		tracesSampleRate: 0.01,
+		// 		beforeSend(event, hint) {
+               // 			// Check if it is an exception, and if so, show the report dialog
+		// 			if (event.exception) {
+		// 				Sentry.showReportDialog({ eventId: event.event_id });
+		// 			}
+		// 			return event;
+		// 		},
+		// 	});
+		// }
-		if (!isLocalHost()) {
-			Sentry.init({
-				debug: true,
-				dsn: config.APP_SENTRY_DSN,
-				release: packageJson.version,
-				integrations: [new Integrations.BrowserTracing()],
-				tracesSampleRate: 0.01,
-				beforeSend(event, hint) {
-					// Check if it is an exception, and if so, show the report dialog
-					if (event.exception) {
-						Sentry.showReportDialog({ eventId: event.event_id });
-					}
-					return event;
-				},
-			});
-		}
```

### Google Maps

In order to display Google Maps Embed API in location messages, you need to provide a `Google Maps API key` in `public/config.json` for `APP_GOOGLE_MAPS_API_KEY`.


## Environment variables

`REACT_APP_TITLE`: Application (page) title.

`REACT_APP_MANIFEST_URL`: manifest.json URL. This file provides information about the application.

`REACT_APP_FAVICON_URL`: Page favicon URL.

`REACT_APP_LOGO_512_URL`: 512x512 PNG icon used for mobile devices.

`REACT_APP_LOGO_192_URL`: 192x192 PNG icon used for mobile devices.

`REACT_APP_LOGO_URL`: Application logo URL.

`REACT_APP_LOGO_BLACK_URL`: Black and white version of application logo (used inside the loading screen).

`SENTRY_AUTH_TOKEN`: This token is used for uploading source maps to Sentry automatically.

## How to add translations of a new language

- Find the ISO 639-1 code of the language you will be adding. For example `es` for Spanish.
You can find the full list of languages codes in 639-1 at https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes

- Create a new folder in `/src/locales/` with the language code as its name.

- Copy the main PO file `/src/locales/en/translation.po` into the new language directory and add the translations.

- Run the following command by changing `en` to the new language code:
`lang="en";i18next-conv --compatibilityJSON v4 -l $lang -s ./src/locales/${lang}/translation.po -t ./src/locales/${lang}/translation.json`

- Open `/src/i18n.js` and add the new language to `resources` object in `init` options by importing the JSON translation output.

## Available Scripts

In the project directory, you can run:

### `lang="en";i18next-conv --compatibilityJSON v4 -l $lang -s ./src/locales/${lang}/translation.po -t ./src/locales/${lang}/translation.json`

Converts the PO file to a JSON file. **Do not forget to specify the target language.**

### `pnpm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `pnpm test`

Runs Tests

### `pnpm build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `pnpm lint:staged`

It is used for a pre-commit hook, most likely you will not need it

### `pnpm lint:prettier`

Check all files and output the result of the check to the console

### `pnpm lint:prettier:fix`

Check all files and auto fix all of them


## Testing

To run tests run the command `pnpm test`

## Using docker image

You can find ready to use docker images in [GitLab Container Registry](https://gitlab.com/get.chat/web-app/container_registry).

To run the app from provided image you will need some environment variables. For simplicity we will use dedicated env
file. Create your env file from this template and save it as `docker.env`:

```
APP_API_BASE_URL=<path-to-inbox-api>
APP_SENTRY_DSN=<sentry-dsn>
APP_ENV_NAME=
APP_SENTRY_TAG_CLIENT=get.chat Inbox Frontend
APP_NOTIFICATIONS_LIMIT_PER_MINUTE=8
APP_GOOGLE_MAPS_API_KEY=<google-maps-key>
APP_MAX_BULK_DIRECT_RECIPIENTS=1000
APP_MAX_BULK_TAG_RECIPIENTS=10000
APP_IS_READ_ONLY=
```

To start application and expose it on `localhost:8080`, run:

```bash
docker run --rm --env-file=docker.env -p 127.0.0.1:8080:80 registry.gitlab.com/get.chat/wab-app:latest
```

### Building docker image

Building JS application is not yet dockerized. Before you proceed, be sure that you ran `pnpm build` and application's
files are in `build` directory.

To build docker image from pre-build application, run following command:

```bash
docker build -t inbox-frontend:local -f docker/Dockerfile.prebuild .
```
