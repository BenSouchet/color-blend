let COLOR1;
let COLOR2;
let STEP = 6;
let COLOR1_INPUT;
let COLOR1_INPUT_INVALID_MSG;
let COLOR2_INPUT;
let COLOR2_INPUT_INVALID_MSG;
let STEP_INPUT;
let STEP_INPUT_INVALID_MSG;
let RGB_BLENDING_CONTAINER;
let HSV_BLENDING_CONTAINER;
let HSL_BLENDING_CONTAINER;

function _mod(n, m) {
    // source : https://stackoverflow.com/a/17323608/10797718
    return ((n % m) + m) % m;
}

function _round(num, p) {
    // source : https://stackoverflow.com/a/12830454/10797718
    if (p === 0) {
        return Number(Math.round(num));
    }
    return +(Number(num).toFixed(p));
}

/**
 * Check if the input string is a valid hexadecimal color code and return it.
 * @param {string} str String that should normally be an hexadecimal color code.
 * @returns The properly formatted hexadecimal color code else null.
 */
function str2hex(str) {
    if (!str) {
        return null;
    }
    str = str.trim();
    if (!str || str.length < 3 || str.length > 9) {
        return null;
    }
    if (str.charAt(0) === '#') {
        str = str.substring(1);
    }
    const match = str.match(/^\#?[a-f0-9]{8}$|^[a-f0-9]{6}$|^[a-f0-9]{3}$/i);
    if (!match) {
		return null;
    }
    let color_str = match[0];
    // Ignore transparency
    if (color_str.length === 8) {
        color_str = color_str.slice(0, -2);
    }

    return color_str;
}

/**
 * Convert an hex color code (string) to a RGB array.
 * @param {string} hex String that should normally be an hexadecimal color code.
 * @returns An array of three integers that represent a RGB color.
 */
function hex2rgb(hex) {
    // source : https://github.com/Qix-/color-convert/blob/8dfdbbc6b46fa6a305bf394d942cc1b08e23fca5/conversions.js#L625
    const match = hex.toString(16).match(/[a-f0-9]{8}|[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}
    let color_str = match[0];
    // Transparency is ignored
    if (color_str.length === 8) {
        color_str = color_str.slice(0, -2);
    }
    // Convert short hex code to normal length
	if (color_str.length === 3) {
		color_str = color_str.split('').map(char => {
			return char + char;
		}).join('');
	}
	const integer_clr = parseInt(color_str, 16);
	return [(integer_clr >> 16) & 0xFF, (integer_clr >> 8) & 0xFF, integer_clr & 0xFF];
}

/**
 * Convert RGB array to hexadecimal color code (string)
 * @param {array} rgb Array of three integers, representing a RGB color.
 * @returns Hexadecimal color code as an string of 6 characters.
 */
function rgb2hex(rgb) {
    // source : https://github.com/Qix-/color-convert/blob/8dfdbbc6b46fa6a305bf394d942cc1b08e23fca5/conversions.js#L616
    const integer_clr = ((rgb[0] & 0xFF) << 16)+ ((rgb[1] & 0xFF) << 8) + (rgb[2] & 0xFF);
	const string = integer_clr.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
}

/**
 * Convert RGB array to HSV array
 * @param {array} rgb Array of three integers, representing a RGB color.
 * @param {integer} precision Number of decimal place for the HSV floats.
 * @returns HSV array [0-360, 0-100, 0-100].
 */
function rgb2hsv(rgb, precision = 2) {
    // source : https://gist.github.com/mjackson/5311256#file-color-conversion-algorithms-js-L84
    // source : https://github.com/python/cpython/blob/ee18df425209cfa4f394b57220177c168fc3a1da/Lib/colorsys.py#L125
    const [r, g, b] = rgb;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const v = _round((max * 100) / 0xff, precision);
    if (min === max) {
        return [.0, .0, v];
    }
    const d = max - min;// delta
    const s = _round((d / max) * 100, precision);
    let h;
    if (max === r) {
        // Between yellow & magenta
        h = (g - b) / d;
    } else if (max === g) {
        // Between cyan & yellow
        h = (b - r) / d + 2.0;
    } else {
        // Between magenta & cyan
        h = (r - g) / d + 4.0;
    }
    return [_round(_mod(h * 60, 360), precision), s, v];
}

/**
 * Convert HSV array to RGB array
 * @param {array} hsv Array representing an HSV color [0-360, 0-100, 0-100].
 * @returns Array of three integers, representing a RGB color.
 */
function hsv2rgb(hsv) {
    // source : https://github.com/Qix-/color-convert/blob/8dfdbbc6b46fa6a305bf394d942cc1b08e23fca5/conversions.js#L308
    // source : https://github.com/python/cpython/blob/ee18df425209cfa4f394b57220177c168fc3a1da/Lib/colorsys.py#L144
    const h = hsv[0] / 60;
    const s = hsv[1] / 100;
    const v = Math.round(hsv[2] * 2.55);
    if (s <= Number.EPSILON) {
        return [v, v, v];
    }
    let i = Math.floor(h);
    const f = h - i;
    const p = Math.round(v * (1.0 - s));
	const q = Math.round(v * (1.0 - (s * f)));
	const t = Math.round(v * (1.0 - (s * (1.0 - f))));
    i = _mod(i, 6);
    switch (i) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
    }
    // Cannot get here
    return [0, 0, 0];
}

function hsv2hex(hsv) {
    return rgb2hex(hsv2rgb(hsv));
}

function hex2hsv(hex) {
    return rgb2hsv(hex2rgb(hex));
}

/**
 * Convert RGB array to HSL array
 * @param {array} rgb  Array of three integers, representing a RGB color.
 * @param {integer} precision Number of decimal place for the HSV floats.
 * @returns HSL array [0-360, 0-100, 0-100].
 */
function rgb2hsl(rgb, precision = 2) {
    // source : https://gist.github.com/mjackson/5311256?permalink_comment_id=3346748#gistcomment-3346748
    // source : https://github.com/Qix-/color-convert/blob/8dfdbbc6b46fa6a305bf394d942cc1b08e23fca5/conversions.js#L55
    // source : https://github.com/python/cpython/blob/ee18df425209cfa4f394b57220177c168fc3a1da/Lib/colorsys.py#L75
    const [r, g, b] = rgb;
	const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const l = _round((max + min) / ((0xff * 2) / 100), precision);
    if (max === min) {
        return [.0, .0, l];// achromatic
    }
    const d = max - min;// delta
    const s = _round((d / (l > 50 ? 0xff * 2 - max - min : max + min)) * 100, precision);
    let h;
    if (max === r) {
        // Between yellow & magenta
        h = (g - b) / d;
    } else if (max === g) {
        // Between cyan & yellow
        h = (b - r) / d + 2.0;
    } else {
        // Between magenta & cyan
        h = (r - g) / d + 4.0;
    }
    return [_round(_mod(h * 60, 360), precision), s, l];
}

function _hue2comp(m1, m2, hue) {
    // source : https://github.com/python/cpython/blob/ee18df425209cfa4f394b57220177c168fc3a1da/Lib/colorsys.py#L109
    hue = _mod(hue, 360);
    if (hue < 60) {
        return Math.round((m1 + (m2 - m1) * hue / 60) * 2.55);
    } else if (hue < 180) {
        return Math.round(m2 * 2.55);
    } else if (hue < 240) {
        return Math.round((m1 + (m2 - m1) * (240 - hue) / 60) * 2.55);
    }
    return Math.round(m1 * 2.55);
}

/**
 * Convert an HSL color array to a RGB color array
 * @param {array} hsl Array representing an HSL color [0-360, 0-100, 0-100].
 * @returns Array of three integers, representing a RGB color.
 */
function hsl2rgb(hsl) {
    // source : https://github.com/python/cpython/blob/ee18df425209cfa4f394b57220177c168fc3a1da/Lib/colorsys.py#L99
    const [h, s, l] = hsl;
    if (s === 0) {
        const v = Math.round(l * 2.55);
        return [v, v, v];
    }
    const m2 = l <= 50 ? l * (100 + s) / 100 : l + s - ((l * s) / 100);
    const m1 = (2 * l - m2);

    return [_hue2comp(m1, m2, h + 120), _hue2comp(m1, m2, h), _hue2comp(m1, m2, h - 120)];
}

function hsl2hex(hsl) {
    return rgb2hex(hsl2rgb(hsl));
}

function hex2hsl(hex) {
    return rgb2hsl(hex2rgb(hex));
}

function _randSatAndVal() {
    const SAT_MIN = 30;
    const SAT_MAX = 101;
    const VAL_MAX = 96;

    const sat = _round(Math.random() * (SAT_MAX - SAT_MIN) + SAT_MIN, 2);
    let VAL_MIN = 30;
    if (sat < 0.6) {
        VAL_MIN = 60;
    }
    const val = _round(Math.random() * (VAL_MAX - VAL_MIN) + VAL_MIN, 2);

    return [sat, val];
}

function randomDefaultColors() {
    const golden_ratio = 0.618033988749895;
    const rand = Math.random() * 360 | 0;
    // Color 1 (HSV)
    const color1_hue = _round(_mod(rand * golden_ratio, 360), 2);
    const [color1_sat, color1_val] = _randSatAndVal();

    // Color 2 (HSV)
    // Hue is complementary of color 1
    const color2_hue = _round(_mod(color1_hue + 180.0, 360), 2);
    const [color2_sat, color2_val] = _randSatAndVal();

    return [hsv2hex([color1_hue, color1_sat, color1_val]),
            hsv2hex([color2_hue, color2_sat, color2_val])];
}

function _setInputValues(color1, color2, step) {
    COLOR1_INPUT.value = '#' + color1;
    COLOR2_INPUT.value = '#' + color2;
    STEP_INPUT.value = Number(step);
}

function _isInputsValid(color1, color2, step) {
    // Invalidate input(s)
    if (!color1) {
        COLOR1_INPUT.setCustomValidity('Invalid Hex Color Code.');
        COLOR1_INPUT_INVALID_MSG.classList.remove('not-visible');
    } else {
        COLOR1_INPUT.setCustomValidity('');
        COLOR1_INPUT_INVALID_MSG.classList.add('not-visible');
    }
    if (!color2) {
        COLOR2_INPUT.setCustomValidity('Invalid Hex Color Code.');
        COLOR2_INPUT_INVALID_MSG.classList.remove('not-visible');
    } else {
        COLOR2_INPUT.setCustomValidity('');
        COLOR2_INPUT_INVALID_MSG.classList.add('not-visible');
    }
    if (!step || step === 0) {
        STEP_INPUT.setCustomValidity('Value must be at least 1.');
        STEP_INPUT_INVALID_MSG.classList.remove('not-visible');
    } else {
        STEP_INPUT.setCustomValidity('');
        STEP_INPUT_INVALID_MSG.classList.add('not-visible');
    }

    // Check if we abort
    if (!color1 || !color2 || !step || step === 0) {
        // One of the parameters are falsy, abort!
        return false;
    }

    return true;
}

function _getBlendingColors(color1, color2, step, fromHex, toHex, precision = 2) {
    let result = [color1];

    const c1 = fromHex(color1);
    const c2 = fromHex(color2);
    const step_count = parseInt(step) + 1;

    const step_a = (c2[0] - c1[0]) / step_count;
    const step_b = (c2[1] - c1[1]) / step_count;
    const step_c = (c2[2] - c1[2]) / step_count;

    for (let i = 1; i < step_count; i++) {
        let cn = [...c1];
        cn[0] = _round(cn[0] + (step_a * i), precision);
        cn[1] = _round(cn[1] + (step_b * i), precision);
        cn[2] = _round(cn[2] + (step_c * i), precision);

        result.push(toHex(cn));
    }
    result.push(color2);
    return result;
}

function _updateContainerContent(container, colors) {
    html_str = "";

    for (const color of colors) {
        html_str += '<div class="blend-color"><div class="color-preview" style="color: #' +
                    color + '"></div><span class="color-hex-code">#' + color + '</span></div>';
    }
    container.innerHTML = html_str;
}

function generateOutput(color1_str, color2_str, step) {
    c1 = str2hex(color1_str);
    c2 = str2hex(color2_str);

    if (!_isInputsValid(c1, c2, step)) {
        return false;
    }

    // Params are good, update them
    _setInputValues(c1, c2, step);

    // Compute blending colors
    const rgb_colors = _getBlendingColors(c1, c2, step, hex2rgb, rgb2hex, precision = 0);
    const hsv_colors = _getBlendingColors(c1, c2, step, hex2hsv, hsv2hex);
    const hsl_colors = _getBlendingColors(c1, c2, step, hex2hsl, hsl2hex);

    // Update inner HTML of containers
    _updateContainerContent(RGB_BLENDING_CONTAINER, rgb_colors);
    _updateContainerContent(HSV_BLENDING_CONTAINER, hsv_colors);
    _updateContainerContent(HSL_BLENDING_CONTAINER, hsl_colors);
}

function _removeForbiddenCharacters(str) {
    return str.replace(/[^#a-f0-9]+/gi, '');
}

function initWebsite() {
    // Retrieve DOM objects
    COLOR1_INPUT = document.getElementById('color-1-hex');
    COLOR2_INPUT = document.getElementById('color-2-hex');
    STEP_INPUT = document.getElementById('step-num');
    if (!COLOR1_INPUT || !COLOR2_INPUT || !STEP_INPUT) {
        // One of the inputs cannot be retrieve, abort!
        return false;
    }
    COLOR1_INPUT_INVALID_MSG = document.getElementById('color-1-invalid-msg');
    COLOR2_INPUT_INVALID_MSG = document.getElementById('color-2-invalid-msg');
    STEP_INPUT_INVALID_MSG = document.getElementById('step-invalid-msg');
    if (!COLOR1_INPUT_INVALID_MSG || !COLOR2_INPUT_INVALID_MSG || !STEP_INPUT_INVALID_MSG) {
        // One of the invalid msg HTML tag cannot be retrieve, abort!
        return false;
    }
    RGB_BLENDING_CONTAINER = document.getElementById('rgb-blending-container');
    HSV_BLENDING_CONTAINER = document.getElementById('hsv-blending-container');
    HSL_BLENDING_CONTAINER = document.getElementById('hsl-blending-container');

    // Random colors
    [COLOR1, COLOR2] = randomDefaultColors();

    // Parse url parameters if exists
    const query_string = window.location.search;
    if (query_string) {
        const url_params = new URLSearchParams(query_string);
        // Check if color1 exists and is a valid hex color
        if (url_params.has('color1')) {
            const valid_hex_code = str2hex(url_params.get('color1'));
            if (valid_hex_code) {
                COLOR1 = valid_hex_code;
            }
        }
        // Check if color2 exists and is a valid hex color
        if (url_params.has('color2')) {
            const valid_hex_code = str2hex(url_params.get('color2'));
            if (valid_hex_code) {
                COLOR2 = valid_hex_code;
            }
        }
        // Check if step param exists and is a valid integer
        if (url_params.has('step')) {
            const param_step = Number(urlParams.get('step'));
            if (Number.isInteger(param_step) && param_step > 0) {
                STEP = param_step;
            }
        }
    }

    COLOR1_INPUT.addEventListener('input', function (evt) {
        COLOR1_INPUT.value = _removeForbiddenCharacters(COLOR1_INPUT.value);
        generateOutput(COLOR1_INPUT.value, COLOR2_INPUT.value, STEP_INPUT.value);
    });
    STEP_INPUT.addEventListener('input', function (evt) {
        generateOutput(COLOR1_INPUT.value, COLOR2_INPUT.value, STEP_INPUT.value);
    });
    COLOR2_INPUT.addEventListener('input', function (evt) {
        COLOR2_INPUT.value = _removeForbiddenCharacters(COLOR2_INPUT.value);
        generateOutput(COLOR1_INPUT.value, COLOR2_INPUT.value, STEP_INPUT.value);
    });

    // Set values in inputs
    _setInputValues(COLOR1, COLOR2, STEP);

    // First generate
    generateOutput(COLOR1_INPUT.value, COLOR2_INPUT.value, STEP_INPUT.value);
}

if (document.readyState !== 'loading') {
    initWebsite();
} else {
    document.addEventListener("DOMContentLoaded", function (event) {
        initWebsite();
    });
}
