import { formatWeekRange, getISOWeekNumber, parseISODate } from "../../lib/weekly-menu";

type Props = { weekStart: string; onPrevious: () => void; onNext: () => void; onToday: () => void };

export function WeekNavigation({ weekStart, onPrevious, onNext, onToday }: Props) {
  return <div className="wm-week-nav"><button onClick={onPrevious} aria-label="Föregående vecka">←</button><div><p>Vecka {getISOWeekNumber(parseISODate(weekStart))}</p><h1>{formatWeekRange(weekStart)}</h1></div><button onClick={onNext} aria-label="Nästa vecka">→</button><button className="wm-today" onClick={onToday}>Denna vecka</button></div>;
}
