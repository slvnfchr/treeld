/**
 * Textual property variation module
 * @see https://github.com/buda-base/owl-schema/blob/master/lang-tags.md
 * @see https://tools.ietf.org/html/bcp47
 * @module
 */

/**
 * @function addVariation
 * @param {import("../context").ObjectLD} obj
 * @param {string} property
 * @param {Record<string,string>} variation Property variation
 * @private
 */

const addVariation = (obj, property, variation) => {
	obj.context.add({ [property]: { '@language': '@container' } });
	if (typeof obj[property] === 'string') obj[property] = { '@none': obj[property] };
	obj[property] = { ...obj[property], ...variation };
};

/**
 * Predefined phonetisation methods
 * @instance
 */

export const PHONETISATION = {
	hangul: 'ko-Hang',
	kana: 'ja-Hrkt',
};

/**
 * @function addPhonetisation
 * @param {import("../context").ObjectLD} obj
 * @param {string} property
 * @param {Record<string,string>} phonetisation Phonetisation method and value
 * @instance
 */

export const addPhonetisation = (obj, property, phonetisation) => {
	const [name, value] = Object.entries(phonetisation)[0];
	addVariation(obj, property, { [PHONETISATION[name] || 'und']: value });
};

/**
 * Predefined romanisation methods
 * @instance
 */

export const ROMANISATION = {
	pinyin: 'zh-Latn-pinyin',
	hepburn: 'ja-Latn-hepburn',
	wadegiles: 'zh-Latn-wadegile',
};

/**
 * @function addRomanisation
 * @param {import("../context").ObjectLD} obj
 * @param {string} property
 * @param {Record<string,string>} romanisation Romanisation method and value
 * @instance
 */

export const addRomanisation = (obj, property, romanisation) => {
	const [name, value] = Object.entries(romanisation)[0];
	addVariation(obj, property, { [ROMANISATION[name] || 'und-Latn']: value });
};
