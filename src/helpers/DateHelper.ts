import moment from 'moment';

const getPastHoursByTimestamp = (timestamp: number) => {
	const momentDate = moment.unix(timestamp);
	const curDate = moment(new Date());
	return curDate.diff(momentDate, 'hours');
};

const isSameDay = (d1: Date, d2: Date): boolean => {
	return (
		d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate()
	);
};

const formatDateRangeFilters = (
	filterStartDate?: Date,
	filterEndDate?: Date
) => {
	let result = '';
	if (filterStartDate) {
		result = filterStartDate.toLocaleDateString();
	}

	if (filterStartDate && filterEndDate) {
		if (isSameDay(filterStartDate, filterEndDate)) {
			return result;
		}

		result += ' - ' + filterEndDate.toLocaleDateString();
	}

	return result;
};

export { getPastHoursByTimestamp, isSameDay, formatDateRangeFilters };
