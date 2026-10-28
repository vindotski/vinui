// Native engine harness app: resolves every case's className to a style object
// and logs it, for each theme phase. Generated inputs: ./cases.json, ./vinui/*.css.
import "./global.css"

import * as React from "react"
import { ScrollView, StyleSheet, Text } from "react-native"

import cases from "./cases.json"
import { ENGINE, Probe, setTheme } from "./engine"

// light/dark are set manually; "system" follows the device, which the runner sets to dark.
const PHASES = ["light", "dark", "system"] as const
type Phase = (typeof PHASES)[number]

export function ProbeImpl({ style, label }: { style?: unknown; label: string }) {
  const flat = StyleSheet.flatten(style as never) ?? {}
  React.useEffect(() => {
    console.log(`HARNESS PROBE ${label} => ${JSON.stringify(flat)}`)
  }, [label])
  return null
}

export default function App() {
  const [phase, setPhase] = React.useState<Phase>("light")
  // Probes mount only once the phase's theme is applied: child effects run before
  // the parent's, so mounting them together would log the previous theme.
  const [applied, setApplied] = React.useState<Phase | null>(null)
  React.useEffect(() => {
    setTheme(phase)
    setApplied(phase)
    console.log(`HARNESS ${ENGINE} PHASE ${phase}`)
    const next = PHASES[PHASES.indexOf(phase) + 1]
    const t = setTimeout(() => (next ? setPhase(next) : console.log("HARNESS DONE")), 2500)
    return () => clearTimeout(t)
  }, [phase])

  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
      <Text>
        {ENGINE} · {phase} · {cases.length} cases
      </Text>
      {applied === phase &&
        cases.map((c) => <Probe key={`${phase}|${c}`} className={c} label={`${phase}|${c}`} />)}
    </ScrollView>
  )
}
