const TZ = 'Asia/Kolkata';

export interface Dated {
  data: { date: Date; endDate?: Date };
}

const istParts = (d: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(d)
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return { y: parts.year, m: parts.month, d: parts.day };
};

const istDateString = (d: Date): string => {
  const { y, m, d: day } = istParts(d);
  return `${y}-${m}-${day}`;
};

export function todayIST(now: Date = new Date()): string {
  return istDateString(now);
}

export function isUpcoming(e: Dated, now: Date = new Date()): boolean {
  return istDateString(e.data.endDate ?? e.data.date) >= todayIST(now);
}

export function splitEvents<T extends Dated>(events: T[], now: Date = new Date()): { upcoming: T[]; past: T[] } {
  const byDate = (a: T, b: T) => a.data.date.getTime() - b.data.date.getTime();
  const upcoming = events.filter((e) => isUpcoming(e, now)).sort(byDate);
  const past = events.filter((e) => !isUpcoming(e, now)).sort((a, b) => byDate(b, a));
  return { upcoming, past };
}

export function semesterOf(date: Date): { key: string; label: string } {
  const { y, m } = istParts(date);
  const even = Number(m) <= 6;
  return { key: `${y}-${even ? 'even' : 'odd'}`, label: `${even ? 'Even' : 'Odd'} Sem ${y}` };
}

export function groupBySemester<T extends Dated>(past: T[]): { key: string; label: string; events: T[] }[] {
  const groups = new Map<string, { key: string; label: string; events: T[] }>();
  for (const e of past) {
    const s = semesterOf(e.data.date);
    if (!groups.has(s.key)) groups.set(s.key, { ...s, events: [] });
    groups.get(s.key)!.events.push(e);
  }
  // key format YYYY-even|odd: within a year odd (Jul–Dec) is newer than even (Jan–Jun), and 'odd' > 'even' lexically
  return [...groups.values()].sort((a, b) => (a.key < b.key ? 1 : -1));
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function formatEventDate(date: Date): string {
  const { y, m, d } = istParts(date);
  return `${d} ${MONTHS[Number(m) - 1]} ${y}`;
}
