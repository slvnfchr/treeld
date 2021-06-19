/**
 * Dublin Core Metadata Initiative (DCMI) Type vocabulary module
 * @see http://purl.org/dc/dcmitype/
 */

/**
 * Context URI
 * @const URI
 * @instance
 */

export const URI = 'http://purl.org/dc/dcmitype/';

/**
 * Context usual prefix
 * @const PREFIX
 * @instance
 */

export const PREFIX = 'dcmitype';

/**
 * Object types
 * @const TYPES
 * @instance
 */

export const TYPES = {
	COLLECTION: 'Collection', // An aggregation of resources.
	DATASET: 'Dataset', // Data encoded in a defined structure.
	EVENT: 'Event', // A non-persistent, time-based occurrence.
	IMAGE: 'Image', // A visual representation other than text.
	IMAGE_MOVING: 'MovingImage', // A series of visual representations imparting an impression of motion when shown in succession.
	IMAGE_STILL: 'StillImage', // A static visual representation.
	INTERACTIVE: 'InteractiveResource', // A resource requiring interaction from the user to be understood, executed, or experienced.
	PHYSICAL_OBJECT: 'PhysicalObject', // An inanimate, three-dimensional object or substance.
	SERVICE: 'Service', // A system that provides one or more functions.
	SOFTWARE: 'Software', // A computer program in source or compiled form.
	SOUND: 'Sound', // A resource primarily intended to be heard.
	TEXT: 'Text', // A resource consisting primarily of words for reading.
};
