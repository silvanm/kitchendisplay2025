# Kitchen Display 2025

This repository contains the source code for the Kitchen Display 2025 project, a real-time information dashboard built with modern web technologies.

## Project Overview

The Kitchen Display is a real-time dashboard designed for kitchen environments, displaying:
- Real-time clock and date
- Weather information (from Netatmo)
- Weather forecasts (from Kachelmann)
- Water temperatures for local swimming spots
- Live power consumption
- CO₂ levels with color-coded alerts
- A photo slideshow from a Google Photos service

The project is built using Next.js, TypeScript, and Tailwind CSS, with Firebase/Firestore for authentication token storage.

## Current Status: Core Features Complete

All primary features outlined in the initial specifications are complete and functional. This includes:
- Secure Netatmo authentication with OAuth2
- Live data integration for all information panels
- Dynamic background color alerts for CO₂, power, and rain
- A touch-activated "detailed view" for certain panels
- A live photo slideshow

For a detailed breakdown of completed tasks, see the [progress file](progress.md).

## Getting Started

The application code is located in the `/kitchen-display` directory.

### 1. Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Access to the Firebase project (`onyx-outpost-122619`)
- `firebase-tools` CLI (for deploying Firestore rules)

### 2. Installation
Navigate to the application directory and install the dependencies:
```bash
cd kitchen-display
npm install
```

### 3. Environment Configuration
Create a `.env.local` file inside the `/kitchen-display` directory. Copy the contents from `build-instructions/config-template.env` and fill in the required API keys and secrets:
- `NETATMO_CLIENT_ID`
- `NETATMO_CLIENT_SECRET`
- `SHELLY_AUTH_KEY`
- `KACHELMANN_API_KEY`

### 4. Running the Development Server
Once the environment is configured, you can start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000` (or the next available port).

### 5. Firestore Rules
The application requires specific security rules to be deployed to Firestore to manage Netatmo tokens.
```bash
# From within the /kitchen-display directory
firebase deploy --only firestore:rules
```

## Project Structure
- **/build-instructions**: Contains the original project specifications, API details, and assets.
- **/kitchen-display**: The main Next.js application source code.
- **progress.md**: A detailed log of the project's implementation progress. 