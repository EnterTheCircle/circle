// Dynamic Expo config.
// Default = site root (Render). Set EXPO_BASE_URL=/circle only for GitHub Pages builds.
const appJson = require('./app.json');

const raw = process.env.EXPO_BASE_URL;
const experiments = {
  ...appJson.expo.experiments,
  typedRoutes: true,
};

if (raw && raw !== '/' ) {
  experiments.baseUrl = raw.replace(/\/$/, '') || undefined;
} else {
  delete experiments.baseUrl;
}

module.exports = {
  expo: {
    ...appJson.expo,
    experiments,
  },
};
