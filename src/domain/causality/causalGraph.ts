import type { CausalScenario } from './types'

export function validateCausalScenario(
  scenario: CausalScenario,
): readonly string[] {
  const errors: string[] = []
  const ids = new Set<string>()

  if (scenario.steps.length === 0) {
    errors.push('scenario must contain at least one step')
  }

  for (const [index, step] of scenario.steps.entries()) {
    if (ids.has(step.id)) {
      errors.push(`duplicate step id: ${step.id}`)
    }
    ids.add(step.id)

    if (step.activeObjectIds.length === 0) {
      errors.push(`step ${step.id} must activate at least one object`)
    }

    for (const cause of step.causes) {
      if (!ids.has(cause)) {
        errors.push(`step ${step.id} has unavailable cause: ${cause}`)
      }
    }

    if (index === 0 && step.causes.length > 0) {
      errors.push(`first step ${step.id} cannot have causes`)
    }
  }

  return errors
}
