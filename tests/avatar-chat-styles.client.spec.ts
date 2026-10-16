/**
 * Stylesheet invariants.
 *
 * The transcript decoration is a page-global sheet that reaches into another
 * package's rows, so the properties that make it safe are mechanical: it is
 * gated on the root marker, it keys off data attributes rather than the host's
 * hashed class names, it uses theme tokens rather than literal colours, and it
 * never changes a row's box so the shipped row geometry survives.
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const sheet = readFileSync(new URL('../src/client/avatar-chat.css', import.meta.url), 'utf8')
const sectionSheet = readFileSync(new URL('../src/client/AvatarChatSection.module.css', import.meta.url), 'utf8')

interface Rule {
  readonly selector: string
  readonly body: string
}

/** Split a sheet into whole rules with comments removed and whitespace folded. */
function rules(css: string): readonly Rule[] {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('}')
    .map((chunk) => {
      const [selector = '', ...rest] = chunk.split('{')
      return { selector: selector.trim().replace(/\s+/g, ' '), body: rest.join('{').trim() }
    })
    .filter(rule => rule.selector !== '' && rule.body !== '')
}

/** The selectors of one rule, split on the top-level commas. */
function selectors(selector: string): readonly string[] {
  return selector.split(',').map(part => part.trim().replace(/\s+/g, ' '))
}

/** Every custom property a sheet reads. */
function readVariables(css: string): readonly string[] {
  return [...css.matchAll(/var\((--[a-z0-9-]+)/g)].map(match => match[1]!)
}

const chatRules = rules(sheet)

describe('avatar-chat.css', () => {
  it('is gated on the root marker the plugin writes', () => {
    expect(chatRules.length).toBeGreaterThan(0)
    for (const rule of chatRules) {
      for (const part of selectors(rule.selector)) {
        expect(part.startsWith('html[data-dsh-avatar-chat')).toBe(true)
      }
    }
  })

  it('keys off data attributes instead of the host class names', () => {
    for (const rule of chatRules) {
      for (const part of selectors(rule.selector)) {
        expect(part.replace(/\[[^\]]*\]/g, '')).not.toContain('.')
      }
    }
  })

  it('never changes a transcript row box', () => {
    for (const rule of chatRules) {
      expect(rule.body).not.toMatch(/(?:^|;)\s*display\s*:/)
      expect(rule.body).not.toMatch(/(?:^|;)\s*margin\s*:/)
    }
  })

  it('reserves room on the side each avatar is painted', () => {
    const reserved = chatRules.filter(rule => rule.selector.includes("[data-dsh-avatar-chat-user='on']"))
    const assistant = chatRules.filter(rule => rule.selector.includes("[data-dsh-avatar-chat-assistant='on']"))

    expect(reserved.some(rule => rule.selector.includes("[data-chat-flow-kind='user']")))
      .toBe(true)
    expect(reserved.some(rule => rule.selector.includes("[data-chat-flow-kind='steering']")))
      .toBe(true)
    expect(assistant.some(rule => rule.selector.includes("[data-chat-flow-kind='assistant-step']")))
      .toBe(true)
    expect(assistant.some(rule => rule.selector.includes("data-chat-group-part='reasoning'")))
      .toBe(true)
  })

  it('skips rows the transcript left empty', () => {
    const reserving = chatRules.filter(rule => rule.body.includes('padding-'))

    expect(reserving).not.toHaveLength(0)
    for (const rule of reserving) {
      for (const part of selectors(rule.selector)) {
        expect(part).toContain(":not(:has(> [data-slot='conversation.chat.node']:empty))")
      }
    }
  })

  it('draws the disc only while a side is enabled', () => {
    const disc = chatRules.filter(rule => rule.body.includes('corner-shape: round'))

    expect(disc).toHaveLength(1)
    const parts = selectors(disc[0]!.selector)
    expect(parts.some(part => part.includes("[data-dsh-avatar-chat-user='on']"))).toBe(true)
    expect(parts.some(part => part.includes("[data-dsh-avatar-chat-assistant='on']"))).toBe(true)
    expect(disc[0]!.body).toContain("content: ''")
    expect(disc[0]!.body).toContain('position: absolute')
  })

  it('rounds every full-radius declaration', () => {
    for (const rule of [...chatRules, ...rules(sectionSheet)]) {
      if (!rule.body.includes('border-radius: 50%')) continue
      expect(rule.body).toContain('corner-shape: round')
    }
  })

  it('uses theme tokens rather than literal colours', () => {
    expect(sheet).not.toMatch(/#[0-9a-fA-F]{3}|\brgba?\(|\bhsla?\(/)
    expect(sectionSheet).not.toMatch(/#[0-9a-fA-F]{3}|\brgba?\(|\bhsla?\(/)
  })

  it('reads only tokens and its own variables', () => {
    for (const variable of readVariables(sheet)) {
      expect(variable.startsWith('--dsw-') || variable.startsWith('--dsh-avatar-chat-')).toBe(true)
    }
  })

  it('substitutes theme tokens in custom properties where the theme declares them', () => {
    // The theme declares its alias tokens on `body`. A custom property that
    // substitutes one from any other element is invalid at computed-value
    // time and silently resolves to nothing, which makes the avatar render
    // without a picture. Ordinary declarations are exempt: they resolve on
    // the element that uses them, which already inherits the tokens.
    const substituting = chatRules.filter(rule => rule.body
      .split(';')
      .some(declaration => declaration.trim().startsWith('--') && declaration.includes('var(--dsw-')))
    expect(substituting.length).toBeGreaterThan(0)
    for (const rule of substituting) {
      for (const part of selectors(rule.selector)) {
        expect(part).toContain(' body')
      }
    }
  })
})

describe('AvatarChatSection.module.css', () => {
  it('reads only design-system tokens and this feature variables', () => {
    for (const variable of readVariables(sectionSheet)) {
      expect(variable.startsWith('--dsw-') || variable.startsWith('--dsh-avatar-chat-')).toBe(true)
    }
  })

  it('previews both sides from the same variables the transcript paints from', () => {
    expect(sectionSheet).toContain(".preview[data-side='user']")
    expect(sectionSheet).toContain(".preview[data-side='assistant']")
    expect(sectionSheet).toContain('var(--dsh-avatar-chat-user-art')
    expect(sectionSheet).toContain('var(--dsh-avatar-chat-assistant-art')
  })
})
