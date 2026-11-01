import { describe, test, expect } from 'vitest';
import { todayIST, isUpcoming, splitEvents, semesterOf, groupBySemester, formatEventDate } from './events';

const ev = (d: string, end?: string) => ({ data: { date: new Date(d), endDate: end ? new Date(end) : undefined } });
const dates = (xs: { data: { date: Date } }[]) => xs.map((x) => x.data.date.toISOString().slice(0, 10));
const NOW = new Date('2026-11-14T20:00:00Z'); // 15 Nov 2026, 01:30 IST

describe('todayIST', () => {
  test('uses Asia/Kolkata, not UTC', () => expect(todayIST(NOW)).toBe('2026-11-15'));
});

describe('isUpcoming', () => {
  test('event dated today IST is upcoming even when UTC is still yesterday', () =>
    expect(isUpcoming(ev('2026-11-15'), NOW)).toBe(true));
  test('yesterday is past', () => expect(isUpcoming(ev('2026-11-14'), NOW)).toBe(false));
  test('multi-day event still running is upcoming', () =>
    expect(isUpcoming(ev('2026-11-13', '2026-11-16'), NOW)).toBe(true));
  test('multi-day event that ended is past', () =>
    expect(isUpcoming(ev('2026-11-10', '2026-11-12'), NOW)).toBe(false));
});

describe('splitEvents', () => {
  test('sorts upcoming ascending and past descending', () => {
    const { upcoming, past } = splitEvents(
      [ev('2026-12-06'), ev('2026-01-10'), ev('2026-11-20'), ev('2026-08-01')],
      NOW,
    );
    expect(dates(upcoming)).toEqual(['2026-11-20', '2026-12-06']);
    expect(dates(past)).toEqual(['2026-08-01', '2026-01-10']);
  });
  test('no future events gives an empty upcoming list', () =>
    expect(splitEvents([ev('2025-01-01')], NOW).upcoming).toEqual([]));
});

describe('semesterOf', () => {
  test('June is Even', () => expect(semesterOf(new Date('2026-06-30'))).toEqual({ key: '2026-even', label: 'Even Sem 2026' }));
  test('July is Odd', () => expect(semesterOf(new Date('2026-07-01'))).toEqual({ key: '2026-odd', label: 'Odd Sem 2026' }));
  test('31 Dec 23:00 UTC is already January in IST', () =>
    expect(semesterOf(new Date('2026-12-31T23:00:00Z'))).toEqual({ key: '2027-even', label: 'Even Sem 2027' }));
});

describe('groupBySemester', () => {
  test('orders newest semester first and keeps input order inside', () => {
    const groups = groupBySemester([ev('2026-09-02'), ev('2026-08-01'), ev('2026-03-05'), ev('2025-10-01')]);
    expect(groups.map((g) => g.label)).toEqual(['Odd Sem 2026', 'Even Sem 2026', 'Odd Sem 2025']);
    expect(dates(groups[0].events)).toEqual(['2026-09-02', '2026-08-01']);
  });
});

describe('formatEventDate', () => {
  test('formats as DD MON YYYY uppercase', () => expect(formatEventDate(new Date('2026-11-15'))).toBe('15 NOV 2026'));
  test('pads single-digit days', () => expect(formatEventDate(new Date('2026-12-06'))).toBe('06 DEC 2026'));
});
