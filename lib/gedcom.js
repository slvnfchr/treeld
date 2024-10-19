// Tags
export const HEADER = 'HEAD'; // a header record to provide basic information about a GEDCOM file
export const VERSION = 'VERS';
export const TRAILER = 'TRLR'; // a trailer record to signal the end of a GEDCOM file
export const CONCATENATION = 'CONC'; // a concatenation record to support long line values
export const CONTINUATION = 'CONT'; // a continuation record to support newlines

// Top-level records
export const FAMILY = 'FAM';
export const INDIVIDUAL = 'INDI';
export const MULTIMEDIA = 'OBJE';
export const NOTE = 'NOTE';
export const REPOSITORY = 'REPO';
export const SOURCE = 'SOUR';
export const SUBMITTER = 'SUBM';

// Other records
export const ADDRESS = 'ADDR';
export const ASSOCIATION = 'ASSO';
export const CHANGE_DATE = 'CHAN';
export const CREATION_DATE = 'CREA';
export const DATE = 'DATE';
export const EVENT = 'EVEN';
export const FACT = 'FACT';
export const NAME = 'NAME';
export const PLACE = 'PLAC';

// Object chunks (file line) properties
export const LEVEL = 'level';
export const XREF = 'xref';
export const TAG = 'tag';
export const VALUE = 'value';
