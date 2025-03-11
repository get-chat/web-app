let cachedColors: { [key: string]: string } = {};
export const generateAvatarColor = function (name: string) {
	if (!name) return;
	if (cachedColors[name]) return cachedColors[name];

	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	let colour = '#';
	for (let i = 0; i < 3; i++) {
		const value = (hash >> (i * 8)) & 0xff;
		colour += ('00' + value.toString(16)).substr(-2);
	}
	return colour;
};

/*
function hexToRgb(h) {
    return ['0x' + h[1] + h[2] | 0, '0x' + h[3] + h[4] | 0, '0x' + h[5] + h[6] | 0]
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export const generateAvatarColor = (name) => {
    if (!name) return;
    name = name?.toUpperCase();
    if (cachedColors[name]) return cachedColors[name];

    const colorsArray = {"R": 0, "G": 0, "B": 0};

    [...name].forEach((letter) => {
        const letterColorObject = colorsObject[letter];
        if (letterColorObject) {
            const rgbColor = hexToRgb(letterColorObject.backgroundColor);
            colorsArray["R"] += rgbColor[0];
            colorsArray["G"] += rgbColor[1];
            colorsArray["B"] += rgbColor[2];
        }
    });

    const nameLength = name.length;
    const result = rgbToHex(
        Math.round(colorsArray["R"] / nameLength),
        Math.round(colorsArray["G"] / nameLength),
        Math.round(colorsArray["B"] / nameLength)
    );

    // Cache
    cachedColors[name] = result;

    return result;
}*/
