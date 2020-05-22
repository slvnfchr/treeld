
/**
 * Bio vocabulary module
 * @see https://vocab.org/bio/
 */

/**
 * Context URI
 * @const CONTEXT
 * @instance
 */

export const URI = 'http://purl.org/vocab/bio/0.1/';

/**
 * Context usual prefix
 * @const PREFIX
 * @instance
 */

export const PREFIX = 'bio';

/**
 * Object types
 * @const TYPES
 * @instance
 */

export const TYPES = {
	EVENT: 'Event',
	EVENT_GROUP: 'GroupEvent', // A type of event that is principally about one or more agents and their partnership.
	EVENT_INDIVIDUAL: 'IndividualEvent', // A type of event that is principally about a single person, group or organization.
	// Individual event types
	ADOPTION: 'Adoption', // The event of creating of a legal parent/child relationship that does not exist biologically.
	BIRTH: 'Birth', // An birth event associated with a person, group or organization.
	BAPTISM: 'Baptism', // The ceremonial event held to admit a person to membership of a Christian church.
	BAR_MITZVAH: 'BarMitzvah', // The ceremonial event held when a Jewish boy reaches age 13.
	BAS_MITZVAH: 'BasMitzvah', // The ceremonial event held when a Jewish girl reaching age 13, also known as "Bat Mitzvah".
	BURIAL: 'Burial', // The event of interring the remains of a person's body into the ground.
	CREMATION: 'Cremation', // The event of disposing of the remains of a person's body by fire.
	DEATH: 'Death', // The event of a person's life ending.
	EMIGRATION: 'Emigraton', // The event of a person leaving their homeland with the intent of residing elsewhere.
	GRADUATION: 'Graduation', // The event of a person being awarded educational diplomas or degrees.
	NATURALIZATION: 'Naturalization', // "The event of a person obtaining citizenship.
	RETIREMENT: 'Retirement', // The event of a person exiting an occupational relationship with an employer after a qualifying time period.
	// Group event types
	ANNULMENT: 'Annulment', // The event of declaring a marriage void from the beginning as though it never existed.
	DIVORCE: 'Divorce', // The event of legally dissolving a marriage.
	MARRIAGE: 'Marriage', // The event of creating uniting the participants into a new family unit, sometimes accompanied by a formal wedding ceremony.
};
