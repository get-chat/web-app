export const csvToArray = (file, callback) => {
	const fileReader = new FileReader();

	fileReader.onload = function (event) {
		const string = event.target.result;

		//const csvHeader = string.slice(0, string.indexOf('\n')).split(',');
		const csvRows = string.slice(string.indexOf('\n') + 1).split('\n');

		const result = [];

		csvRows.map((i) => {
			const values = i.split(',');
			result.push(values);
		});

		callback?.(result);
	};

	fileReader.readAsText(file);
};
