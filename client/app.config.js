import "dotenv/config";

export default {
  android: {
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    package: "gamma.apk",
  },
  ios: {
    bundleIdentifier: "com.gamma",
    buildNumber: "1.0.0",
  },
};
