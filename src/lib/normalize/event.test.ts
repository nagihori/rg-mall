import { describe, expect, it } from 'vitest'
import { normalizeSummary, numberedSlug, slugFromTitle } from './event'
describe('event normalization', () => { it('normalizes summary whitespace', () => expect(normalizeSummary(' a\n  b ')).toBe('a b')); it('numbers duplicate slugs', () => expect(numberedSlug('summer', ['summer', 'summer-2'])).toBe('summer-3')); it('percent-encodes non-latin titles', () => expect(slugFromTitle('夏祭り')).toBe(encodeURIComponent('夏祭り'))) })
