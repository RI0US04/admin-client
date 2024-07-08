# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.


## Directory Structure

<details>
<summary><strong>.vscode</strong> - Click to expand/collapse</summary>

- `settings.json`: Editor settings for consistent development environment.

</details>

<details>
<summary><strong>src</strong> - Click to expand/collapse</summary>

- **lib**: Utility libraries and helper functions.
- **components**: Reusable UI components.
  - **appBar**: Application header component.
  - **chat**: Chat-related components.
  - **logTable**: Component for displaying logs.
  - **modals**: Modal dialogs used throughout the application.
- **cookies**: Cookie management utilities.
  - `sessionCookie.js`: Utility for managing session cookies.
  - `usernameCookie.js`: Utility for managing username cookies.
- **services**: Backend services integration.
  - **adminManagement**: Services related to admin management.
  - **authentication**: Services for user authentication.
  - **chat**: Services related to chat functionality.
  - **csrfTokenFetcher**: Utility for fetching CSRF tokens.
  - **emailVerification**: Services for email verification.
  - **passwordReset**: Services for password reset functionality.
  - **settings**: Services for user settings management.
  - **token**: Services for token management.
  - **userManagement**: Services related to user management.
  - `getLogs.js`: Service for retrieving application logs.
- **store**: State management store (if applicable).
  - `themePreference.js`: Store for managing user theme preferences.
- **routes**: Application routes and page components.
  - **change-email**: Page component for changing email.
  - **confirm-password-reset**: Page component for confirming password reset.
  - **disable-totp**: Page component for disabling TOTP (Two-Factor Authentication).
  - **home**: Main application homepage component.
  - **login**: Login page component.
  - **logs**: Page component for displaying application logs.
  - **manage-admins**: Page component for managing administrators.
  - **manage-users**: Page component for managing users.
  - **newtoken**: Page component for generating new tokens.
  - **register-admin**: Page component for registering new administrators.
  - **register**: Registration page component.
  - **reset-password**: Page component for resetting password.
  - **settings**: Settings page components.
  - **setup-totp**: Page component for setting up TOTP.
  - **app.d.ts**: TypeScript declarations for the application.

</details>

<details>
<summary><strong>static</strong> - Click to expand/collapse</summary>

- **fonts**: Font files used in the application.
  - Font files listed here (e.g., AbrilFatface.ttf, PlayfairDisplay-Italic.ttf).

</details>

<details>
<summary><strong>tests</strong> - Click to expand/collapse</summary>

- `test.js`: Main test file for the application.

</details>

<details>
<summary><strong>Root Files and Configuration</strong> - Click to expand/collapse</summary>

- **.env.example**: Example environment variable configuration file.
- **.eslintignore, .eslintrc.cjs**: ESLint configuration files.
- **.gitignore, .npmrc**: Git and npm configuration files.
- **.prettierignore, .prettierrc**: Prettier configuration files.
- **LICENSE**: License information for the repository.
- **README.md**: This file, providing an overview of the repository structure and contents.
- **docker-compose.yml**: Docker Compose configuration file (if applicable).
- **jsconfig.json, package-lock.json, package.json**: JavaScript and npm configuration files.
- **playwright.config.js, postcss.config.cjs, svelte.config.js, tailwind.config.js, vite.config.js**: Additional configuration files for tools and frameworks used in the project.

</details>
