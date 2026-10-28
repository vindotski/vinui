/** Public base URL of the built registry (`<url>/react/*.json`, `<url>/vue/*.json`). */
export const REGISTRY_URL = (process.env.VINUI_REGISTRY_URL ?? "http://localhost:4321/r").replace(
  /\/$/,
  "",
)
