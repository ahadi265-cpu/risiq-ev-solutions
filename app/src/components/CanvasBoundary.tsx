import { Component, type ReactNode } from 'react'

/**
 * Catches a failed WebGL context (hardware acceleration off, WebGL blocked by a
 * privacy setting or policy, an old GPU) so the hero degrades to its plain
 * backdrop. Without it the renderer's error propagates to the root and React
 * unmounts the entire page — a white screen, not a missing effect.
 */
export class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: unknown) { console.warn('Hero canvas disabled:', error instanceof Error ? error.message : error) }
  render() { return this.state.failed ? null : this.props.children }
}
