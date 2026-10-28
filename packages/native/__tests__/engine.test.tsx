// The dev-only setup check: silent in tests, warns once when Uniwind can't resolve
// vinui's theme (not configured / theme missing), silent when it can.
import { renderHook } from "@testing-library/react-native"

const resolve = (style: Record<string, unknown>) =>
  (require("uniwind").useResolveClassNames as jest.Mock).mockReturnValue(style)

describe("vinui engine check", () => {
  const env = process.env
  beforeEach(() => {
    jest.resetModules()
    process.env = { ...env }
  })
  afterAll(() => {
    process.env = env
  })
  const asApp = () => {
    process.env.NODE_ENV = "development"
    delete process.env.JEST_WORKER_ID
  }

  test("is silent in a test environment", async () => {
    resolve({})
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
    const { useEngineCheck } = require("@/lib/vinui-engine")
    await renderHook(() => useEngineCheck())
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  test("warns exactly once per session when vinui's theme doesn't resolve", async () => {
    asApp()
    resolve({})
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
    const { useEngineCheck } = require("@/lib/vinui-engine")
    await renderHook(() => useEngineCheck())
    await renderHook(() => useEngineCheck())
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0][0])).toContain("Uniwind isn't configured")
    warn.mockRestore()
  })

  test("is silent when the theme resolves (Uniwind configured)", async () => {
    asApp()
    resolve({ backgroundColor: "#ffffff" })
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
    const { useEngineCheck } = require("@/lib/vinui-engine")
    await renderHook(() => useEngineCheck())
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  test("disableEngineCheck() turns it off", async () => {
    asApp()
    resolve({})
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
    const engine = require("@/lib/vinui-engine")
    engine.disableEngineCheck()
    await renderHook(() => engine.useEngineCheck())
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
