export const csvToObj = (
	file: Blob,
	callback: ({}: { header: string[]; data: { [key: string]: string }[] }) => any
) => {
	const fileReader = new FileReader();

	fileReader.onload = function (event) {
		const string = event.target?.result?.toString();

		if (string) {
			const csvHeader = string.slice(0, string.indexOf('\n')).split(',');
			const csvRows = string.slice(string.indexOf('\n') + 1).split('\n');

			const rows = csvRows.filter(Boolean).map((i) => {
				const values = i.split(',');
				return csvHeader.reduce(
					(object: { [key: string]: string }, header, index) => {
						object[header] = values[index];
						return object;
					},
					{}
				);
			});

			callback?.({
				header: csvHeader,
				data: rows,
			});
		}
	};

	fileReader.readAsText(file);
};
