type Year = `${number}${number}${number}${number}`;
type Month = `${number}${number}`;
type Day = `${number}${number}`;
type Hours = `${number}${number}`;
type Minutes = `${number}${number}`;
type Seconds = `${number}${number}`;
type Milliseconds = `${number}${number}${number}`;

type DateISODate = `${Year}-${Month}-${Day}`;

type DateISOTime = `${Hours}:${Minutes}:${Seconds}.${Milliseconds}`;

export type DateISO = `${DateISODate}T${DateISOTime}Z`;

export const converter: Function;

const map: Map<string, Function>;
export default map;
