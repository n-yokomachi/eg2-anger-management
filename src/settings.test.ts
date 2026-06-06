import { test, expect } from 'vitest'
import {
  DEFAULT_SETTINGS, defaultLanguageFromCountry, parseSettings, serializeSettings,
  type Settings,
} from './settings'

test('JP系の country は ja, それ以外は en', () => {
  expect(defaultLanguageFromCountry('JP')).toBe('ja')
  expect(defaultLanguageFromCountry('Japan')).toBe('ja')
  expect(defaultLanguageFromCountry('US')).toBe('en')
  expect(defaultLanguageFromCountry('')).toBe('en')
  expect(defaultLanguageFromCountry(undefined)).toBe('en')
})

test('parse/serialize の往復', () => {
  const s: Settings = { language: 'ja', region: 'america', finisher: 'managed' }
  expect(parseSettings(serializeSettings(s), DEFAULT_SETTINGS)).toEqual(s)
})

test('壊れた入力・不正値は fallback', () => {
  expect(parseSettings('not json', DEFAULT_SETTINGS)).toEqual(DEFAULT_SETTINGS)
  expect(parseSettings('', DEFAULT_SETTINGS)).toEqual(DEFAULT_SETTINGS)
  expect(parseSettings('{"region":"mars"}', DEFAULT_SETTINGS).region).toBe(DEFAULT_SETTINGS.region)
  expect(parseSettings('{"finisher":"xx"}', DEFAULT_SETTINGS).finisher).toBe(DEFAULT_SETTINGS.finisher)
})
