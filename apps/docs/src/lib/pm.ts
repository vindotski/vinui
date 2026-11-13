/** One command per package manager, for the docs' remembered switcher (<PmCommand>). */
export const packageManagers = ["npm", "pnpm", "yarn", "bun"] as const
export type PackageManager = (typeof packageManagers)[number]
export type Commands = Record<PackageManager, string>

const each = (command: (pm: PackageManager) => string) =>
  Object.fromEntries(packageManagers.map((pm) => [pm, command(pm)])) as Commands

/** Run a package without installing it: `npx shadcn@latest …`. */
export const dlx = (args: string) =>
  each((pm) => `${{ npm: "npx", pnpm: "pnpm dlx", yarn: "yarn dlx", bun: "bunx --bun" }[pm]} ${args}`)

/** Add dependencies. */
export const add = (packages: string, { dev = false } = {}) =>
  each((pm) => {
    const flags = dev ? " -D" : ""
    return `${pm === "npm" ? "npm install" : `${pm} add`}${flags} ${packages}`
  })

/** Scaffold a project with a `create-*` package: `npm create vite@latest my-app -- --template …`. */
export const create = (name: string, dir: string, flags: string) =>
  each((pm) => (pm === "npm" ? `npm create ${name}@latest ${dir} -- ${flags}` : `${pm} create ${name} ${dir} ${flags}`))

/** Run a package.json script. */
export const run = (script: string) => each((pm) => (pm === "npm" || pm === "bun" ? `${pm} run ${script}` : `${pm} ${script}`))

/** Append the same line (e.g. `cd my-app`) to every command. */
export const followedBy = (commands: Commands, line: string) => each((pm) => `${commands[pm]}\n${line}`)
