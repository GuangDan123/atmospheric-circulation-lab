import { expect, test } from '@playwright/test'
import { completeStudentLearning } from './studentLearningFlow'

test('completes prediction, drawing, variable experiment, explanation and local record lifecycle', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await completeStudentLearning(page)
  expect(errors).toEqual([])
})
