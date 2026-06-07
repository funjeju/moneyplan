import { toMonthlyAmount } from '@/lib/utils/index'
import type { CreditCard, ResponsibilityItem } from '@/lib/types'

export interface BenefitAchievement {
  benefitId: string
  description: string
  required: number
  achieved: number
  rate: number
  estimatedDiscount: number
  remaining: number
  isAchieved: boolean
}

export function calculateBenefitAchievement(
  card: CreditCard,
  items: ResponsibilityItem[]
): BenefitAchievement[] {
  const cardItems = items.filter(i => i.paymentCardId === card.id && i.status === 'active')

  return card.benefits
    .filter(b => b.isActive)
    .map(benefit => {
      const relevantItems = benefit.applicableCategories?.length
        ? cardItems.filter(i => benefit.applicableCategories!.includes(i.category as any))
        : cardItems

      const achieved = relevantItems.reduce((sum, i) => sum + toMonthlyAmount(i), 0)
      const required = benefit.conditionAmount ?? 0
      const rate = required > 0 ? Math.min(achieved / required, 1) : 1

      const estimatedDiscount = rate >= 1
        ? benefit.discountAmount ?? Math.min(
            Math.floor(achieved * (benefit.discountRate ?? 0)),
            benefit.discountCap ?? Infinity
          )
        : 0

      return {
        benefitId: benefit.id,
        description: benefit.description,
        required,
        achieved,
        rate,
        estimatedDiscount,
        remaining: Math.max(0, required - achieved),
        isAchieved: rate >= 1,
      }
    })
}

export function getTotalExpectedSavings(
  cards: CreditCard[],
  items: ResponsibilityItem[]
): number {
  return cards.reduce((total, card) => {
    const achievements = calculateBenefitAchievement(card, items)
    return total + achievements.reduce((s, a) => s + a.estimatedDiscount, 0)
  }, 0)
}
