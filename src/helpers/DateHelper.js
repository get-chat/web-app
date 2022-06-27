import moment from 'moment';

const getPastHoursByTimestamp = (timestamp) => {
    const momentDate = moment.unix(timestamp);
    const curDate = moment(new Date());
    return curDate.diff(momentDate, 'hours');
};

export { getPastHoursByTimestamp };
