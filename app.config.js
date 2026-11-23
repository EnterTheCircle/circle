// Dynamic Expo config. GitHub Pages uses /circle; Render static site uses /.
const appJson = require('./app.json');

const raw = process.env.EXPO_BASE_URL;
/** @type {string | undefined} */
let baseUrl = '/circle';
if (raw === '/' || raw === '') baseUrl = undefined;
else if (raw !== undefined) baseUrl = raw;

const experiments = {
  ...appJson.expo.experiments,
  typedRoutes: true,
};
if (baseUrl) experiments.baseUrl = baseUrl;
else delete experiments.baseUrl;

module.exports = {
  expo: {
    ...appJson.expo,
    experiments,
  },
};
