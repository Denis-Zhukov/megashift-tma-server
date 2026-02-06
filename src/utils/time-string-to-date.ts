import { set } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

/**
 * @param timeStr — "HH:mm"
 * @param userTimeZone — IANA‑таймзона, например "Europe/Moscow"
 * @returns Дата в UTC
 */
export function timeStringToUtcDate(
  timeStr: string,
  userTimeZone: string,
): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);

  const zonedDate = set(new Date(1970, 0, 1), {
    hours,
    minutes,
    seconds: 0,
    milliseconds: 0,
  });

  return fromZonedTime(zonedDate, userTimeZone);
}
