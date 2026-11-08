import { describe, expect, it } from 'vitest'

import i18n from './i18n'

function collectCopy(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectCopy)
  }
  return []
}

describe('sitting terminology', () => {
  it.each(['th', 'en'])(
    'uses sitting-specific copy in %s without renaming translation keys',
    (language) => {
      const resources = i18n.getResourceBundle(
        language,
        'translation'
      ) as unknown
      const copy = collectCopy(resources)

      expect(copy.length).toBeGreaterThan(100)
      expect(copy.filter((text) => /ท่าทาง|posture/i.test(text))).toEqual([])
      expect(
        i18n.exists('sound.speech.posture.goodAlignment', { lng: language })
      ).toBe(true)
    }
  )

  it.each([
    ['th', 'ระบบติดตามการนั่ง', 'สถิติการนั่ง'],
    ['en', 'Sitting Monitoring', 'Sitting Analytics']
  ])(
    'names the product and analytics consistently in %s',
    (language, brand, analytics) => {
      expect(i18n.t('common.brandSubtitle', { lng: language })).toBe(brand)
      expect(i18n.t('progress.title', { lng: language })).toBe(analytics)
    }
  )

  it.each([
    [
      'th',
      'ระบบยังไม่ตรวจจับการนั่งหรือยืนอัตโนมัติ',
      'ไม่ใช่เวลาที่ประเมินท่านั่งได้ทั้งหมด',
      'ไม่ยืนยันว่ากำลังนั่งหรือท่านั่งถูกต้อง'
    ],
    [
      'en',
      'Automatic sitting and standing detection and durations are unavailable.',
      'not the total time for which seated alignment could be assessed',
      'does not confirm that the user is seated or that seated alignment is correct'
    ]
  ])(
    'preserves measurement limitations in %s',
    (language, detection, duration, assessment) => {
      expect(
        i18n.t('session.classificationUnavailable', { lng: language })
      ).toContain(detection)
      expect(i18n.t('history.scope', { lng: language })).toContain(duration)
      expect(
        i18n.t('session.technicalSessionBody', { lng: language })
      ).toContain(assessment)
      expect(
        i18n.t('sound.speech.posture.goodAlignment', { lng: language })
      ).toBe('ท่านั่งกลับมาใกล้เคียงท่านั่งอ้างอิงแล้ว')
    }
  )
})
