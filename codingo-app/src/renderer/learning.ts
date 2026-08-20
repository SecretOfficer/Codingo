export type LessonStatus = 'complete' | 'available' | 'locked'
export type PracticeResult = { ok: true; output: string } | { ok: false; message: string; output: string }

export type Lesson = {
  id: string
  title: string
  concept: string
  minutes: number
  difficulty: number
  status: LessonStatus
  prompt: string
  starter: string
  expected: string
  validation?: 'output' | 'number-output'
}

export const lessons: Lesson[] = [
  { id: 'variables', title: 'Name the signal', concept: 'Variables', minutes: 6, difficulty: 1, status: 'complete', prompt: 'Create a variable called greeting with the text "Hello, Codingo!", then print it.', starter: 'greeting = "Hello, Codingo!"\nprint(greeting)', expected: 'Hello, Codingo!' },
  { id: 'numbers', title: 'Count the crates', concept: 'Numbers', minutes: 8, difficulty: 2, status: 'available', prompt: 'Store 8 and 5, then print their sum.', starter: 'crates_a = 8\ncrates_b = 5\n# print the total', expected: '13' },
  { id: 'types', title: 'Choose a shape', concept: 'Types', minutes: 7, difficulty: 3, status: 'locked', prompt: 'Turn the string "42" into a number, then print it.', starter: 'value = "42"\nprint(int(value))', expected: '42', validation: 'number-output' },
  { id: 'conditionals', title: 'Open the gate', concept: 'Conditionals', minutes: 10, difficulty: 4, status: 'locked', prompt: 'Print "open" when code is at least 100.', starter: 'code = 100\nif code >= 100:\n    print("open")', expected: 'open' },
  { id: 'loops', title: 'Trace the path', concept: 'Loops', minutes: 12, difficulty: 5, status: 'locked', prompt: 'Print the numbers 1 through 3.', starter: 'for number in range(1, 4):\n    print(number)', expected: '1\n2\n3' }
]

export function unlockedLessonIds(completed: string[]): string[] {
  const known = new Set(completed)
  return lessons.filter((lesson, index) => index === 0 || known.has(lessons[index - 1].id)).map(({ id }) => id)
}

export function progressPercent(completed: string[]): number {
  return Math.round((completed.length / lessons.length) * 100)
}

type Value = number | string

function evaluateExpression(raw: string, variables: Map<string, Value>): Value {
  const expression = raw.trim()
  if (/^[-]?\d+$/.test(expression)) return Number(expression)
  if ((expression.startsWith('"') && expression.endsWith('"')) || (expression.startsWith("'") && expression.endsWith("'"))) return expression.slice(1, -1)
  const conversion = expression.match(/^(int|str)\((.+)\)$/)
  if (conversion) {
    const value = evaluateExpression(conversion[2], variables)
    if (conversion[1] === 'int') {
      const converted = Number(value)
      if (Number.isNaN(converted)) throw new Error('int() needs a numeric value.')
      return converted
    }
    return String(value)
  }
  const addition = expression.match(/^(.+)\s*\+\s*(.+)$/)
  if (addition) {
    const left = evaluateExpression(addition[1], variables)
    const right = evaluateExpression(addition[2], variables)
    return typeof left === 'number' && typeof right === 'number' ? left + right : `${left}${right}`
  }
  const variable = variables.get(expression)
  if (variable === undefined) throw new Error(`I don't recognise ΓÇ£${expression}ΓÇ¥ yet.`)
  return variable
}

/** A deliberately small, offline-only Python subset for Level 1 practice. */
export function runPractice(code: string, expected: string, validation: Lesson['validation'] = 'output'): PracticeResult {
  const variables = new Map<string, Value>()
  const output: Value[] = []
  const lines = code.split(/\r?\n/)

  try {
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const assignment = trimmed.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/)
      if (assignment) { variables.set(assignment[1], evaluateExpression(assignment[2], variables)); continue }
      const print = trimmed.match(/^print\((.+)\)$/)
      if (print) { output.push(evaluateExpression(print[1], variables)); continue }
      const condition = trimmed.match(/^if\s+([A-Za-z_]\w*)\s*>=\s*(-?\d+):$/)
      if (condition) {
        const nested = lines[++index]?.trim().match(/^print\((.+)\)$/)
        if (!nested) throw new Error('Add an indented print() inside your if statement.')
        const value = variables.get(condition[1])
        if (typeof value !== 'number') throw new Error(`ΓÇ£${condition[1]}ΓÇ¥ needs to be a number.`)
        if (value >= Number(condition[2])) output.push(evaluateExpression(nested[1], variables))
        continue
      }
      const loop = trimmed.match(/^for\s+([A-Za-z_]\w*)\s+in\s+range\((\d+),\s*(\d+)\):$/)
      if (loop) {
        const nested = lines[++index]?.trim().match(/^print\((.+)\)$/)
        if (!nested) throw new Error('Add an indented print() inside your loop.')
        for (let value = Number(loop[2]); value < Number(loop[3]); value += 1) {
          variables.set(loop[1], value)
          output.push(evaluateExpression(nested[1], variables))
        }
        continue
      }
      throw new Error(`I can't run ΓÇ£${trimmed}ΓÇ¥ in Level 1 yet.`)
    }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Something went wrong.', output: output.map(String).join('\n') }
  }

  const rendered = output.map(String).join('\n')
  if (rendered === expected && validation === 'number-output' && output.some((value) => typeof value !== 'number')) {
    return { ok: false, message: 'The output looks right, but it is still text. Convert value with int() before printing it.', output: rendered }
  }
  return rendered === expected
    ? { ok: true, output: rendered }
    : { ok: false, message: rendered ? 'Your output does not match the expected result yet.' : 'Nothing was printed yet. Use print() to show your answer.', output: rendered }
}
