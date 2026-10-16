/**
 * Node-half behavior: the host contributes nothing.
 *
 * The transcript, the settings shell, and localStorage all live in the browser,
 * so the node entry must stay inert. A host that mounted a service here would
 * diverge from what the packaged client bundle expects.
 */
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { apply } from '../src/index.ts'

describe('ui-avatar-chat node plugin', () => {
  it('mounts no host service', async () => {
    const ctx = new Context()

    await ctx.plugin({ apply }).await()

    expect(ctx.get('slots')).toBeUndefined()
    await ctx.fiber.dispose()
  })
})
