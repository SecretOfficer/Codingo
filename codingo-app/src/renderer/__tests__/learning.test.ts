import { describe, expect, it } from 'vitest'
import { progressPercent, runPractice, unlockedLessonIds } from '../learning'

describe('learning progression', () => {
  it('unlocks only the next lesson after a completion', () => {
    expect(unlockedLessonIds(['variables'])).toEqual(['variables', 'numbers'])
  })

  it('calculates level progress from completed lessons', () => {
    expect(progressPercent(['variables', 'numbers'])).toBe(40)
  })

  it('runs Level 1 assignments and arithmetic locally', () => {
    expect(runPractice('crates_a = 8\ncrates_b = 5\nprint(crates_a + crates_b)', '13')).toEqual({ ok: true, output: '13' })
  })

  it('returns useful feedback when output is missing', () => {
    expect(runPractice('value = "42"', '42')).toMatchObject({ ok: false, message: expect.stringContaining('Nothing was printed') })
  })

  it('requires a number rather than a numeric-looking string for the types lesson', () => {
    expect(runPractice('value = "42"\nprint(value)', '42', 'number-output')).toMatchObject({ ok: false, message: expect.stringContaining('still text') })
    expect(runPractice('value = "42"\nprint(int(value))', '42', 'number-output')).toEqual({ ok: true, output: '42' })
  })
})
