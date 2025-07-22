export const BLANK_SPACE = "\u00A0";


export function clamp(value: number, lo: number, hi: number) {
  if (value < lo) {
    return lo;
  }
  return value > hi ? hi : value;
} 

export function sumArray(numbers: number[]): number {
  return numbers.reduce((acc, curr) => acc + curr, 0);
}

export function addCommaToNumber(num: number | null): string {
  if (num == null) return '';
  let str = num.toString();
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(str))
    str = str.replace(pattern, "$1,$2");
  return str;
}

export function yearToYearAndMonth(
  years: number | null,
  returnArray?: boolean,
  withDays?: boolean
): string | Array<string> {
  if (years == null) return '';

  const totalDays = years * 365;
  const wholeYears = Math.floor(totalDays / 365);
  const remainingDaysAfterYears = totalDays - (wholeYears * 365);

  const wholeMonths = Math.floor(remainingDaysAfterYears / (365 / 12));
  const remainingDays = Math.round(remainingDaysAfterYears - (wholeMonths * (365 / 12)));

  const yearLabel = wholeYears === 1 ? "year" : "years";
  const monthLabel = wholeMonths === 1 ? "month" : "months";
  const dayLabel = remainingDays === 1 ? "day" : "days";

  const parts: string[] = [];

  if (wholeYears > 0) parts.push(`${wholeYears} ${yearLabel}`);
  if (wholeMonths > 0) parts.push(`${wholeMonths} ${monthLabel}`);
  if (withDays && remainingDays > 0) parts.push(`${remainingDays} ${dayLabel}`);

  if (parts.length === 0) return withDays ? `0 ${dayLabel}` : '0 months';

  return returnArray ? parts : parts.join(', ');
}

// x being percent in decimal form
export function withinXPercent(a: number, b:number, x:number) {
  const diff = Math.abs(a - b);
  const avg = (a + b) / 2;
  return (diff / avg) <= x;
}


// function csvJSON(text, quoteChar = '"', delimiter = ',') {
//     var rows=text.split("\n");
//     var headers=rows[0].split(",");
//
//     const regex = new RegExp(`\\s*(${quoteChar})?(.*?)\\1\\s*(?:${delimiter}|$)`, 'gs');
//   
//     const match = line => [...line.matchAll(regex)]
//       .map(m => m[2]) 
//       .slice(0, -1); 
//   
//     var lines = text.split('\n');
//     const heads = headers ?? match(lines.shift());
//     lines = lines.slice(1);
//     
//     return lines.map(line => {
//       return match(line).reduce((acc, cur, i) => {
//         // replace blank matches with `null`
//         const val = cur.length <= 0 ? null : Number(cur) || cur;
//         const key = heads[i] ?? `{i}`;
//         return { ...acc, [key]: val };
//       }, {});
//     });
//   }
