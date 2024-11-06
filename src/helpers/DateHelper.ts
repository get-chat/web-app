import moment from 'moment';

const getUnixTimestamp = () => {
	return new Date().getTime() / 1000;
};

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

const formatDate = (date?: Date) => {
	return date ? moment(date).format('yyyy-MM-DD') : undefined;
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

const convertDateToUnixTimestamp = (date: Date) => {
	return Math.floor(date.getTime() / 1000);
};

export {
	getUnixTimestamp,
	getPastHoursByTimestamp,
	isSameDay,
	formatDate,
	formatDateRangeFilters,
	convertDateToUnixTimestamp,
};
