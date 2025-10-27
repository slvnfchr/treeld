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
export const SHARED_NOTE = 'SNOTE';
export const REPOSITORY = 'REPO';
export const SOURCE = 'SOUR';
export const SUBMITTER = 'SUBM';

// Other records
export const ADDRESS = 'ADDR';
export const ASSOCIATION = 'ASSO';
export const ROLE = 'ROLE';
export const AGE = 'AGE';
export const CHANGE_DATE = 'CHAN';
export const CREATION_DATE = 'CREA';
export const DATE = 'DATE';
export const EVENT = 'EVEN';
export const FACT = 'FACT';
export const NAME = 'NAME';
export const PLACE = 'PLAC';
export const FILE = 'FILE';

/**
 * Adoption enumeration
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#enumset-ADOP
 */
export const ADOPTION = {
	HUSB: 'Adopted by the HUSB of the FAM pointed to by FAMC',
	WIFE: 'Adopted by the WIFE of the FAM pointed to by FAMC',
	BOTH: 'Adopted by both the HUSB and WIFE of the FAM pointed to by FAMC',
};

/**
 * Quality enumeration
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#enumset-QUAY
 */
export const QUALITY = {
	0: 'Unreliable evidence or estimated data',
	1: 'Questionable reliability of evidence (interviews, census, oral genealogies, or potential for bias, such as an autobiography)',
	2: 'Secondary evidence, data officially recorded sometime after the event',
	3: 'Direct and primary evidence used, or by dominance of the evidence',
};

/**
 * Events
 */

export const INDIVIDUAL_EVENT = {
	ADOP: 'Adoption',
	BAPM: 'Baptism',
	BARM: 'Bar Mitzvah',
	BASM: 'Bas Mitzvah',
	BIRT: 'Birth',
	BLES: 'Blessing',
	BURI: 'Depositing remains',
	CENS: 'Census',
	CHR: 'Christening',
	CHRA: 'Adult christening',
	CONF: 'Confirmation',
	CREM: 'Cremation',
	DEAT: 'Death',
	EMIG: 'Emigration',
	FCOM: 'First communion',
	GRAD: 'Graduation',
	IMMI: 'Immigration',
	NATU: 'Naturalization',
	ORDN: 'Ordination',
	PROB: 'Probate',
	RETI: 'Retirement',
	WILL: 'Will',
};

export const FAMILY_EVENT = {
	ANUL: 'Annulment',
	CENS: 'A census event',
	DIV: 'Divorce',
	DIVF: 'Divorce filed',
	ENGA: 'Engagement',
	MARB: 'Marriage bann',
	MARC: 'Marriage contract',
	MARL: 'Marriage license',
	MARR: 'Marriage',
	MARS: 'Marriage settlement',
};

/**
 * Role enumeration
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#enumset-ROLE
 */

export const ROLE_TYPES = {
	CHIL: 'Child',
	CLERGY: 'Religious official',
	FATH: 'Father',
	FRIEND: 'Friend',
	GODP: 'Godparent or related role in other religions',
	HUSB: 'Husband',
	MOTH: 'Mother',
	MULTIPLE: 'A sibling from the same pregnancy',
	NGHBR: 'Neighbor',
	OFFICIATOR: 'Officiator',
	PARENT: 'Parent',
	SPOU: 'Spouse',
	WIFE: 'Wife',
	WITN: 'Witness',
	OTHER: 'Other',
};

/**
 * Medium enumeration
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#enumset-MEDI
 */

export const MEDIUM = {
	AUDIO: 'An audio recording',
	BOOK: 'A bound book',
	CARD: 'A card or file entry',
	ELECTRONIC: 'A digital artifact',
	FICHE: 'Microfiche',
	FILM: 'Microfilm',
	MAGAZINE: 'Printed periodical',
	MANUSCRIPT: 'Written pages',
	MAP: 'Cartographic map',
	NEWSPAPER: 'Printed newspaper',
	PHOTO: 'Photograph',
	TOMBSTONE: 'Burial marker or related memorial',
	VIDEO: 'Motion picture recording',
	OTHER: 'Other',
};

/**
 * Attributes
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#attributes
 */

export const INDIVIDUAL_ATTRIBUTE = {
	CAST: 'Caste',
	DSCR: 'Physical description',
	EDUC: 'Education',
	IDNO: 'Identifying number',
	NATI: 'Nationality',
	NCHI: 'Number of children',
	NMR: 'Number of marriages',
	OCCU: 'Occupation',
	PROP: 'Property',
	RELI: 'Religion',
	RESI: 'Residence',
	SSN: 'Social security number',
	TITL: 'Title',
};

export const FAMILY_ATTRIBUTE = {
	NCHI: 'Number of children',
	RESI: 'Residence',
};

/**
 * Various enumarations
 */

export const RESTRICTION = {
	CONFIDENTIAL: 'Confidential',
	LOCKED: 'Locked',
	PRIVACY: 'Private',
};

export const SEX = {
	M: 'Male',
	F: 'Female',
	X: 'Does not fit the typical definition of only Male or only Female',
	U: 'Unknown',
};
