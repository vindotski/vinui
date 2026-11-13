/**
 * Native engine harness: renders vinui's live CSS on the iOS simulator and/or the
 * Android emulator with a given engine + version, collects the resolved style of
 * every case in light / dark / system themes, and diffs against the baseline.
 *
 *   pnpm spike:native-engine [--engine uniwind|nativewind5] [--version x.y.z]
 *                            [--platform ios|android|both] [--update-baseline]
 *
 * See docs/decisions/0005-native-styling-engine.md. Not part of builds or `pnpm test`.
 */
import { execFileSync, spawn } from "node:child_process"
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

import { buttonSizeValues, buttonVariantValues, selectTriggerSizeValues } from "../../packages/core/src/index.ts"
import { UNIWIND_VERSION, uniwindTheme } from "../../packages/registry/src/engines/uniwind.ts"
import { theme as nativewindTheme } from "./engines/nativewind5/theme.ts"

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, "../..")
const tailwindSrc = join(root, "packages/tailwind/src")

const { values: args } = parseArgs({
  options: {
    engine: { type: "string", default: "uniwind" },
    version: { type: "string" },
    platform: { type: "string", default: "both" },
    "update-baseline": { type: "boolean", default: false },
  },
})
const engine = args.engine as "uniwind" | "nativewind5"
const version = args.version ?? (engine === "uniwind" ? UNIWIND_VERSION : "5.0.0-rc.0")
const platforms = args.platform === "both" ? ["ios", "android"] : [args.platform as string]

const IOS_DEVICE = "iPhone 17 Pro"
const ANDROID_AVD = "vinui_api36"
const ANDROID_HOME = process.env.ANDROID_HOME ?? join(homedir(), "Library/Android/sdk")
const adb = join(ANDROID_HOME, "platform-tools/adb")

const run = (cmd: string, argv: string[], cwd = root) =>
  execFileSync(cmd, argv, { cwd, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" })
const tryRun = (cmd: string, argv: string[], cwd = root) => {
  try {
    return run(cmd, argv, cwd)
  } catch {
    return ""
  }
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Cases: token utilities + every shipped @utility + variant/size combos from core. */
function cases() {
  const utilities = readdirSync(join(tailwindSrc, "components"))
    .filter((f) => f.endsWith(".css"))
    .flatMap((f) => [...readFileSync(join(tailwindSrc, "components", f), "utf8").matchAll(/@utility ([\w-]+)/g)].map((m) => m[1]))
  const tokens = ["bg-background", "bg-primary", "text-foreground", "text-muted-foreground", "rounded-md", "rounded-lg", "border border-border"]
  const combos = [
    ...buttonVariantValues.filter((v) => v !== "default").flatMap((v) => [`btn btn-${v}`, `btn-label btn-${v}`]),
    ...buttonSizeValues.filter((s) => s !== "default").flatMap((s) => [`btn btn-${s}`, `btn-label btn-${s}`]),
    ...selectTriggerSizeValues.filter((s) => s !== "default").map((s) => `select-trigger select-trigger-${s}`),
  ]
  return [...new Set([...tokens, ...utilities, ...combos])]
}

/** Creates (once) and refreshes the Expo app for this engine + version. */
async function prepareApp() {
  const work = join(here, ".work", `${engine}-${version}`)
  const setup = JSON.parse(readFileSync(join(here, "engines", engine, "setup.json"), "utf8"))
  if (!existsSync(join(work, "package.json"))) {
    mkdirSync(dirname(work), { recursive: true })
    console.log(`▸ creating Expo app in ${work}`)
    run("npx", ["--yes", "create-expo-app@latest", work, "--template", "blank-typescript", "--yes"])
    const sub = (xs: string[] = []) => xs.map((x) => x.replace("{version}", version))
    run("npm", ["install", "--save-exact", ...sub(setup.npm)], work)
    if (setup.npmDev) run("npm", ["install", "--save-dev", "--save-exact", ...sub(setup.npmDev)], work)
    if (setup.expo?.length) run("npx", ["expo", "install", ...setup.expo], work)
    if (setup.overrides) {
      const pkg = JSON.parse(readFileSync(join(work, "package.json"), "utf8"))
      pkg.overrides = setup.overrides
      writeFileSync(join(work, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`)
      run("npm", ["install"], work)
    }
    for (const [name, content] of Object.entries(setup.files ?? {})) writeFileSync(join(work, name), content as string)
    const appJson = JSON.parse(readFileSync(join(work, "app.json"), "utf8"))
    appJson.expo.userInterfaceStyle = "automatic" // the template's "light" blocks system dark mode
    writeFileSync(join(work, "app.json"), `${JSON.stringify(appJson, null, 2)}\n`)
  }
  // Always refresh the inputs from the live sources.
  cpSync(join(here, "app/App.tsx"), join(work, "App.tsx"))
  for (const f of ["engine.tsx", "global.css", "metro.config.js"]) cpSync(join(here, "engines", engine, f), join(work, f))
  mkdirSync(join(work, "vinui"), { recursive: true })
  const themeFile = join(tailwindSrc, "theme.css")
  writeFileSync(join(work, "vinui/theme.css"), engine === "uniwind" ? await uniwindTheme(themeFile) : await nativewindTheme(themeFile))
  const components = readdirSync(join(tailwindSrc, "components")).filter((f) => f.endsWith(".css")).sort()
  writeFileSync(join(work, "vinui/components.css"), components.map((f) => readFileSync(join(tailwindSrc, "components", f), "utf8")).join("\n"))
  writeFileSync(join(work, "cases.json"), JSON.stringify(cases(), null, 2))
  return work
}

async function prepareDevice(platform: string) {
  if (platform === "ios") {
    tryRun("xcrun", ["simctl", "boot", IOS_DEVICE])
    run("xcrun", ["simctl", "ui", IOS_DEVICE, "appearance", "dark"])
    tryRun("xcrun", ["simctl", "terminate", IOS_DEVICE, "host.exp.Exponent"])
    return
  }
  if (!tryRun(adb, ["devices"]).includes("emulator-")) {
    console.log(`▸ booting ${ANDROID_AVD}`)
    spawn(join(ANDROID_HOME, "emulator/emulator"), ["-avd", ANDROID_AVD, "-no-window", "-no-audio", "-no-boot-anim", "-no-snapshot-save"], { detached: true, stdio: "ignore" }).unref()
    run(adb, ["wait-for-device"])
    while (tryRun(adb, ["shell", "getprop", "sys.boot_completed"]).trim() !== "1") await sleep(2000)
  }
  run(adb, ["shell", "cmd", "uimode", "night", "yes"])
  tryRun(adb, ["shell", "am", "force-stop", "host.exp.exponent"])
}

/** Starts Metro for the platform, waits for HARNESS DONE, returns phase → case → style. */
async function collect(work: string, platform: string) {
  const metro = spawn("npx", ["expo", "start", `--${platform}`, "--port", "8081"], { cwd: work, env: { ...process.env, CI: "1" }, detached: true })
  let log = ""
  metro.stdout.on("data", (d) => (log += d))
  metro.stderr.on("data", (d) => (log += d))
  const deadline = Date.now() + 6 * 60_000
  while (!log.includes("HARNESS DONE") && Date.now() < deadline) await sleep(1000)
  try {
    process.kill(-metro.pid!)
  } catch {}
  if (!log.includes("HARNESS DONE")) throw new Error(`${platform}: timed out waiting for the app.\n${log.slice(-2000)}`)
  const result: Record<string, Record<string, unknown>> = {}
  for (const m of log.matchAll(/HARNESS PROBE (\w+)\|(.+?) => (\{.*\})/g)) {
    const style = JSON.parse(m[3], (_k, v) => (typeof v === "number" ? Math.round(v * 1000) / 1000 : v))
    ;(result[m[1]] ??= {})[m[2]] = style
  }
  return result
}

function diff(base: Record<string, Record<string, unknown>>, now: Record<string, Record<string, unknown>>) {
  const lines: string[] = []
  for (const phase of new Set([...Object.keys(base), ...Object.keys(now)])) {
    const a = base[phase] ?? {}, b = now[phase] ?? {}
    for (const c of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const x = JSON.stringify(a[c]), y = JSON.stringify(b[c])
      if (x !== y) lines.push(`  ${phase} | ${c}\n    baseline ${x ?? "(missing)"}\n    now      ${y ?? "(missing)"}`)
    }
  }
  return lines
}

const work = await prepareApp()
let failed = false
for (const platform of platforms) {
  await prepareDevice(platform)
  console.log(`▸ ${engine}@${version} on ${platform}`)
  const styles = await collect(work, platform)
  const report = { engine, version, platform, device: platform === "ios" ? IOS_DEVICE : ANDROID_AVD, styles }
  writeFileSync(join(work, `results.${platform}.json`), `${JSON.stringify(report, null, 2)}\n`)
  const baselineFile = join(here, "baseline", `${engine}.${platform}.json`)
  if (args["update-baseline"]) {
    writeFileSync(baselineFile, `${JSON.stringify(report, null, 2)}\n`)
    console.log(`  baseline written: ${baselineFile}`)
    continue
  }
  if (!existsSync(baselineFile)) {
    console.log(`  no baseline yet (${baselineFile}); run with --update-baseline`)
    continue
  }
  const base = JSON.parse(readFileSync(baselineFile, "utf8"))
  const lines = diff(base.styles, styles)
  console.log(lines.length ? `  ${lines.length} difference(s) vs baseline (${base.engine}@${base.version}):\n${lines.join("\n")}` : `  matches baseline (${base.engine}@${base.version})`)
  failed ||= lines.length > 0
}
process.exit(failed ? 1 : 0)
