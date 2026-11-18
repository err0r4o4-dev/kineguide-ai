import {
  BreakReminderEngine,
  DEFAULT_BREAK_INTERVAL_MINUTES,
  MIN_BREAK_INTERVAL_MINUTES,
  MAX_BREAK_INTERVAL_MINUTES
} from './breakReminderEngine'

describe('BreakReminderEngine', () => {
  let engine: BreakReminderEngine

  beforeEach(() => {
    engine = new BreakReminderEngine()
  })

  it('initializes with default interval and enabled status', () => {
    expect(engine.getIntervalMinutes()).toBe(DEFAULT_BREAK_INTERVAL_MINUTES)
    expect(engine.isEnabled()).toBe(true)
    expect(engine.isDue()).toBe(false)
  })

  it('clamps configured intervals within valid bounds', () => {
    engine.setIntervalMinutes(5) // Below minimum
    expect(engine.getIntervalMinutes()).toBe(MIN_BREAK_INTERVAL_MINUTES)

    engine.setIntervalMinutes(120) // Above maximum
    expect(engine.getIntervalMinutes()).toBe(MAX_BREAK_INTERVAL_MINUTES)

    engine.setIntervalMinutes(30)
    expect(engine.getIntervalMinutes()).toBe(30)
  })

  it('triggers due state when active session time reaches configured interval', () => {
    engine.setIntervalMinutes(20) // 1200 seconds

    // Advance 1199 seconds
    engine.update(1199)
    expect(engine.isDue()).toBe(false)

    // Advance to 1200 seconds
    engine.update(1200)
    expect(engine.isDue()).toBe(true)
  })

  it('does not trigger reminder if disabled by user', () => {
    engine.setEnabled(false)
    engine.setIntervalMinutes(20)

    engine.update(1500)
    expect(engine.isDue()).toBe(false)
  })

  it('supports snoozing reminder for a configurable duration', () => {
    engine.setIntervalMinutes(20)
    engine.update(1200)
    expect(engine.isDue()).toBe(true)

    // Snooze for 5 minutes (300 seconds)
    engine.snooze(5)
    expect(engine.isDue()).toBe(false)

    // Advance 200 seconds (still snoozed)
    engine.update(1400)
    expect(engine.isDue()).toBe(false)

    // Advance past snooze window (1200 + 300 = 1500s)
    engine.update(1501)
    expect(engine.isDue()).toBe(true)
  })

  it('acknowledges break and resets interval for next cycle', () => {
    engine.setIntervalMinutes(20)
    engine.update(1200)
    expect(engine.isDue()).toBe(true)

    engine.acknowledge()
    expect(engine.isDue()).toBe(false)

    // Next break due at 1200 + 1200 = 2400 seconds
    engine.update(2000)
    expect(engine.isDue()).toBe(false)

    engine.update(2400)
    expect(engine.isDue()).toBe(true)
  })

  it('resets cleanly when session ends or resets', () => {
    engine.setIntervalMinutes(20)
    engine.update(1200)
    expect(engine.isDue()).toBe(true)

    engine.reset()
    expect(engine.isDue()).toBe(false)
    expect(engine.getActiveSeconds()).toBe(0)
  })
})
