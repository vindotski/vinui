// The docs serve the web export under /native-preview (EXPO_BASE_URL, set by
// apps/docs/scripts/native-preview.ts); everything else serves it at the root.
module.exports = ({ config }) => ({
  ...config,
  experiments: { ...config.experiments, ...(process.env.EXPO_BASE_URL && { baseUrl: process.env.EXPO_BASE_URL }) },
})
