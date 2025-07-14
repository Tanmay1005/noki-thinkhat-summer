# Noki Ed Project

## Project Overview

Noki Ed is a React-based web application that utilizes modern frontend technologies and practices. The project implements a responsive design with a sidebar navigation, theme toggling functionality, and is set up for easy expansion with additional features.

## Tech Stack

- React (with Create React App)
- Redux (using Redux Toolkit for state management)
- Material-UI (for UI components and theming)
- SCSS (for custom styling)
- React Router (for navigation)

## Getting Started

### Prerequisites

- Node.js (v20.16.0)
- npm (v10.8.1)

### Installation

1. Clone the repository:
   ```
   git clone <custom_bitbucket_url_for_user>
   cd noki-ed
   ```

2. Install dependencies:
   ```
   npm install
   ```

   Note: If you encounter any errors during installation, try deleting the `node_modules` folder and `package-lock.json` file, then run `npm install` again.

3. Set up environment variables:
   Create a `.env.dev` file in the root directory with the following content:
   ```
   PORT=
   REACT_APP_API_URL=
   REACT_APP_AIDA_SERVICE_URL=
   REACT_APP_NOKI_ED_BASE_SERVICE_URL=
   REACT_APP_SERVICE_REGION=
   NODE_ENV=
   ```

### Running the Application

To start the development server:

```
npm start
```

The application will be available at `http://localhost:5000`.

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App (use with caution)

## Project Structure

```
public/
src/
  adapters/
  assets/
    case_images/
    station_images/
  components/
    DashboardWidgets/
    ModuleHubComponents/
    ReusableComponents/
    SpeechComponents/
    StudentDashboard/
    StudentTask/
  firebase-setup/
  helpers/
  hooks/
  pages/
    Student/
  redux/
    slices/
  styles/
.husky/
  _/
biome.json
package.json
package-lock.json
README.md
.biome.log
.env.dev
.gitignore
.log
```

## Key Features

1. Redux State Management
2. Theming (Light/Dark mode)
3. Responsive Layout
4. Environment Configuration
5. Routing with React Router

## Development Guidelines

1. Follow the established project structure when adding new features
2. Use Redux slices for managing complex state
3. Utilize Material-UI components and theming system for consistent UI
4. Write SCSS in the `App.scss` file, using variables and mixins from the `styles` folder
5. Keep environment-specific configurations in the appropriate `.env` files
6. Ensure responsive design is maintained across all new components and pages

## Learn More

To learn more about the technologies used in this project:

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Material-UI](https://material-ui.com/)
- [React Router](https://reactrouter.com/)

## Troubleshooting

If you encounter any issues while setting up or running the project, please check the [Create React App Troubleshooting Guide](https://facebook.github.io/create-react-app/docs/troubleshooting) or open an issue in the project repository.