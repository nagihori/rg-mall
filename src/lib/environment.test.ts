import { describe, expect, it } from 'vitest'
import { detectEnvironment } from './environment'

describe('detectEnvironment', () => {
  it('detects production', () => expect(detectEnvironment({ vercelEnv: 'production', gitRef: 'alive' })).toBe('production'))
  it('detects the fixed staging preview by branch', () => expect(detectEnvironment({ vercelEnv: 'preview', gitRef: 'staging' })).toBe('staging'))
  it('treats other previews and local as development', () => {
    expect(detectEnvironment({ vercelEnv: 'preview', gitRef: 'feature/x' })).toBe('development')
    expect(detectEnvironment({})).toBe('development')
  })
})
