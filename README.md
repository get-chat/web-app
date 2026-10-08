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

`REACT_APP_ERROR_HELP_LINK_TEXT`: Text to display as a helpful link when the app fails to load critical resources.

`REACT_APP_ERROR_HELP_LINK_URL`: URL to open when users click the help link shown on loading failure.

`SENTRY_AUTH_TOKEN`: This token is used for uploading source maps to Sentry automatically.

## How to add translations of a new language

- Find the ISO 639-1 code of the language you will be adding. For example `es` for Spanish.
You can find the full list of languages codes in 639-1 at https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes

- Create a new folder in `/src/locales/` with the language code as its name.

- Copy the main PO file `/src/locales/en/translation.po` into the new language directory and add the translations.

- Run the following command by changing `en` to the new language code:
`lang="en";i18next-conv --compatibilityJSON v4 -l $lang -s ./src/locales/${lang}/translation.po -t ./src/locales/${lang}/translation.json`

- Open `/src/i18n.js` and add the new language to `resources` object in `init` options by importing the JSON translation output.

## Styling

Views are styled with [Tailwind CSS](https://tailwindcss.com) v4 and our own [shadcn/ui](https://ui.shadcn.com)-based components. Tailwind is configured in `src/styles/tailwind.css`, which also holds the theme tokens and the app's few global defaults (body font, icons, scrollbars, focus outline) in its base layer. There is no CSS-in-JS and no other global stylesheet besides two third-party overrides.

### Building UI

- **Style components with Tailwind classes** on the elements themselves. Don't add CSS-in-JS or global rules; the base layer is only for defaults that apply to every element of a kind.
- **Use the UI components** in `src/components/ui/` (button, dialog, dropdown-menu, select, input, field, switch, checkbox, badge, tooltip, popover, command, alert, avatar, skeleton, spinner...). They are our own code, styled after the app's original MUI look: change their look there, not with overrides where they are used. Each file's header comment says what it replaces and how its props map from MUI.
- **Variants:** components take `variant` (the shape) and `color` (the hue), e.g. `<Button variant="ghost" color="neutral" size="icon-lg">`. To add a colour or size, add one line to the component's `cva` variants.
- **Combine classes** with `cn()` from `src/lib/utils`. Use `cva` for a component with variants, and extract a small component instead of repeating a long class list.
- **Adding a shadcn component:** run `pnpm dlx shadcn@latest add <name>` (configured by `components.json`), then:
  - check `package.json` and the new file's imports: the CLI has rewritten the `cn` import to a bare `"cn"` and installed an unrelated npm package of that name, and skipped dependencies;
  - replace lucide icons with ours (see Icons);
  - restyle it to match the app's existing components and tokens;
  - give any default svg size the icon exclusion described under Icons.

### Icons

- Icons are [Material Symbols](https://fonts.google.com/icons) (Rounded, filled), generated into `src/components/icons/`. To add one, put its name (e.g. `more_vert`) in `src/components/icons/icons.json`, run `node scripts/generate-icons.mjs` and import it from `@src/components/icons/MoreVert`.
- Every icon is an `svg.app-icon`: 1em square at a 24px font size (`fontSize="small"` is 20px), grey (`#6f7385`), filled with `currentColor`.
- Size and colour an icon with classes on it (`<SendIcon className="size-5 text-primary" />`) or from a parent (`[&_.app-icon]:size-5 [&_.app-icon]:text-white`).
- In a UI component, a default size for svgs must skip app icons, or it will shrink every icon placed inside: write `[&_svg:not(.app-icon):not([class*='size-'])]:size-4`. To size icons relative to the component's text, also set `[font-size:inherit]` on them (an icon's `em` is its own 24px otherwise).

### Theme

Use the theme tokens instead of raw values:

- colours: `primary`, `foreground`, `muted-foreground`, `ink` (the app's navy, used with an opacity such as `text-ink/60`), `gray-light`, `gray-lighter`, `destructive`, `destructive-dark`, `success`/`success-soft`, `warning`/`warning-soft`/`warning-strong`, `chat-bg`, `chat-icon`, `chat-icon-dark`, `selection`, `menu-*`
- shadows: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-menu`
- breakpoints are the app's own: `max-md:` is the single-column phone layout (up to 750px), `max-sm:` a small phone (up to 500px), `2xl:` from 1501px
- spacing uses Tailwind's scale, where 1 step is 4px and fractions are fine (`py-1.25` is 5px)
- arbitrary values (`w-[310px]`) are fine for one-off measurements
- Don't use the `dark:` variant; the app has no dark mode.

### Motion and layering

- **Fading pages and large containers:** use `animate-fade-in` / `animate-fade-out` (opacity only). tw-animate's `animate-in`/`animate-out` also animate `transform`, which makes `position: fixed` content inside (overlays, the loading screen) shrink to the container while the animation runs. They're fine for small elements, e.g. `animate-in zoom-in-95`.
- **Showing and hiding:** for a component that mounts and unmounts with an exit animation, use `useUnmountTransition` (`src/hooks`) with the classes in `src/styles/panelTransitions.ts`. For an element that stays mounted and should grow and shrink (MUI's Zoom), use `zoomTransition(isVisible)` from `src/styles/zoomTransition.ts`. Avoid toggling `hidden` alone: it can't animate out.
- **z-index:** dialogs, menus, popovers and tooltips are portals on `z-[1300]` and above. Elements inside a view should use a small z-index within that view (the chat body's overlays use 5–10). Don't give in-flow elements large values like MUI's 1050: they float over panels and overlays elsewhere in the app.

### Cascade and gotchas

- **Preflight (Tailwind's reset) is off.** The app relies on the browser's defaults for headings, lists, buttons and images, so set sizes and margins explicitly. The UI components get a small reset through their `data-slot` attribute (see `tailwind.css`).
- **Cascade:** utilities beat the base layer, so a class overrides a global default without `!`. Third-party stylesheets (`EmojiPicker.css`, react-date-range's CSS) are unlayered and win over utilities; use the `!` suffix (`size-4!`) only to beat them. A `!` utility even beats their `!important`.
- **`cn()` and keyword values:** `cn()` resolves conflicting classes, but it can't tell some arbitrary values apart: write `text-[length:x-small]`, not `text-[x-small]`, or a text colour after it removes it. Write `text-[11px]/none`, not `leading-none text-[11px]`, when the line height must survive a merge. New theme values that it must know about (like `shadow-menu`) go in `src/lib/utils.ts`.
- **Underscores in arbitrary values and selectors** become spaces: target `.chat__message` as `[&_.chat\_\_message]` in JSX, or better, put the classes on the element itself. Some BEM-like class names (`chat__message`, `chat__message__outer`...) remain as hooks for scripts and tests, not for styling.

## Query Parameters

- `lng`: Changes the language of the page. The value used must be Alpha-2 code. Please see the following directory for currently supported languages: https://github.com/get-chat/web-app/tree/master/src/locales

- `chat_only` or `chatonly`: Hides the sidebar. It is only used to view a single chat. Expected values are `1` and `0`.

- `refresh_token`: Converts the given Refresh Token to Auth Token. See for more information: https://docs.get.chat/wa-integration-api/#tag/Authorization/operation/convertRefreshToken

- `keep_refresh_token`: Option to keep refresh token after use. See for more information: https://docs.get.chat/wa-integration-api/#tag/Authorization/operation/convertRefreshToken

- `integration_api_base_url`: Changes the API base URL for the inbox.

- `cf_<any_chat_filter>`: Filters the chats initially. Any chat filter documented here can be used with `cf_` prefix: https://docs.get.chat/wa-integration-api/#tag/Chats/operation/listChats

- `hide_logo`: Hides get.chat logo during the loading screen. Expected values are `1` and `0`.

- `maximize`: Maximizes the application container by removing margins. Expected values are `1` and `0`.

- `bg_color`: Changes the background color. Expected value is any hexadecimal color without # (pound) sign. Example: `bg_color=ff0000`.

## Embedding

When embedding get.chat Web App inside an `<iframe>`, it's important to configure the `iframe` element with the proper permissions to ensure full functionality.

### Clipboard API Permission

If you're using features that interact with the clipboard—such as copying a message or location—inside an `iframe`, you may encounter the following error:

`Error: NotAllowedError: The Clipboard API has been blocked because of a permissions policy applied to the current document.`

This happens because the **Clipboard API** (e.g., `navigator.clipboard.writeText`) is restricted by default in iframes unless explicitly allowed.

#### ✅ Solution

Add the `allow="clipboard-write"` attribute to the `<iframe>` tag to enable clipboard operations:

```html
<iframe
  src="https://..."
  allow="clipboard-write"
  ...>
</iframe>
```

This permission is required for any clipboard-related features to work inside the iframe context.

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

To run the app from provided image you will need some environment variables. For simplicity, we will use dedicated env
file. Create your env file from this template and save it as `docker.env`:

```
APP_API_BASE_URL=<path-to-inbox-api>
APP_SENTRY_DSN=<sentry-dsn>
APP_ENV_NAME=
APP_SENTRY_TAG_CLIENT=get.chat Inbox Frontend
APP_NOTIFICATIONS_LIMIT_PER_MINUTE=8
APP_GOOGLE_MAPS_API_KEY=<google-maps-key>
APP_IS_READ_ONLY=
```

To start application and expose it on `localhost:8080`, run:

```bash
docker run --rm --env-file=docker.env -p 127.0.0.1:8080:80 registry.gitlab.com/get.chat/wab-app:<app-version>
```

### Building docker image

Building JS application is not yet dockerized. Before you proceed, be sure that you ran `pnpm build` and application's
files are in `build` directory.

To build docker image from pre-build application, run following command:

```bash
docker build -t inbox-frontend:local -f docker/Dockerfile.prebuild .
```
