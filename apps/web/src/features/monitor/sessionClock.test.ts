import { SessionClock } from './sessionClock'

describe('SessionClock', () => {
  it('counts elapsed monotonic time even when updates are delayed', () => {
    const clock = new SessionClock(0, 0)
    expect(clock.seconds(5500)).toBe(5)
  })

  it('retains fractions across pauses and freezes after finish', () => {
    const clock = new SessionClock(0, 0)
    clock.pause(600)
    clock.resume(3000)
    clock.pause(3600)
    clock.resume(5000)
    expect(clock.seconds(5400)).toBe(1)
    clock.pause(5400)
    expect(clock.seconds(20000)).toBe(1)
  })
})
