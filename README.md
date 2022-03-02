# get.chat Web App

get.chat Web App

## Before Start

You must configure `REACT_APP_BASE_URL` (Base URL) variable.
This variable is defined in `package.json` (scripts -> start) and `.env` files.
`REACT_APP_BASE_URL` should be set to `/api/v1/` to use same address as get.chat Web App runs on.
You can define a custom backend URL for development (not for build) by defining it in `package.json` (scripts -> start).

## Environment Variables

Please see .env.example file for example values.

`REACT_APP_TITLE`: Application (page) title.

`REACT_APP_BASE_URL`: API base URL.

`REACT_APP_SENTRY_DSN`: Sentry data source name (DSN).

`REACT_APP_MANIFEST_URL`: manifest.json URL. This file provides information about the application.

`REACT_APP_FAVICON_URL`: Page favicon URL.

`REACT_APP_LOGO_512_URL`: 512x512 PNG icon used for mobile devices.

`REACT_APP_LOGO_192_URL`: 192x192 PNG icon used for mobile devices.

`REACT_APP_LOGO_URL`: Application logo URL.

`REACT_APP_LOGO_BLACK_URL`: Black and white version of application logo (used inside the loading screen).

## Sentry

This project uses Sentry for error tracking.

### Change Sentry DSN Key

If you forked this project and want to keep Sentry integration enabled, please make sure to use your own Sentry DSN key.
In order to do this, please go to `.env` file and replace the value of `REACT_APP_SENTRY_DSN` environment variable.

### Disable Sentry

In order to disable Sentry integration, you can either remove or comment out `Sentry.init` method inside `index.js`.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
