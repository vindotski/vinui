// The dev-only setup check: silent in tests, warns once when Uniwind can't resolve
// vinui's theme (not configured / theme missing), silent when it can. It judges after a
// delay, because on web the stylesheet can load after the first render.
import { act, renderHook } from "@testing-library/react-native"
import * as React from "react"

const resolve = (style: Record<string, unknown>) =>
  (require("uniwind").useResolveClassNames as jest.Mock).mockReturnValue(style)

describe("vinui engine check", () => {
  const env = process.env
  beforeEach(() => {
    // A fresh engine module (its once-per-session state), sharing Testing Library's React.
    jest.resetModules()
    jest.doMock("react", () => React)
    jest.useFakeTimers()
    process.env = { ...env }
  })
  afterEach(() => {
    jest.useRealTimers()
  })
  afterAll(() => {
    process.env = env
  })
  const settle = () => act(() => jest.runAllTimers())
  const asApp = () => {
    process.env.NODE_ENV = "development"
    delete process.env.JEST_WORKER_ID
  }

  test("is silent in a test environment", async () => {
    resolve({})
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
    const { useEngineCheck } = require("@/lib/vinui-engine")
    await renderHook(() => useEngineCheck())
    await settle()
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
    await settle()
    await renderHook(() => useEngineCheck())
    await settle()
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
    await settle()
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  test("is silent when the theme resolves after the first render (web loads CSS late)", async () => {
    asApp()
    const mock = resolve({})
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
    const { useEngineCheck } = require("@/lib/vinui-engine")
    const { rerender } = await renderHook(() => useEngineCheck())
    mock.mockReturnValue({ backgroundColor: "#ffffff" })
    await rerender({})
    await settle()
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
    await settle()
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
