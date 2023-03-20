// @ts-nocheck
export const csvToObj = (file, callback) => {
	const fileReader = new FileReader();

	fileReader.onload = function (event) {
		const string = event.target.result;

		const csvHeader = string.slice(0, string.indexOf('\n')).split(',');
		const csvRows = string.slice(string.indexOf('\n') + 1).split('\n');

		//const rows = csvRows.map((i) => i.split(','));

		const rows = csvRows
			.filter((i) => i)
			.map((i) => {
				const values = i.split(',');
				return csvHeader.reduce((object, header, index) => {
					object[header] = values[index];
					return object;
				}, {});
			});

		callback?.({
			header: csvHeader,
			data: rows,
		});
	};

	fileReader.readAsText(file);
};
