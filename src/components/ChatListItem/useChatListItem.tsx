// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment/moment';
import { getDroppedFiles } from '@src/helpers/FileHelper';
import PubSub from 'pubsub-js';
import {
	CHAT_LIST_TAB_CASE_ALL,
	CHAT_LIST_TAB_CASE_GROUP,
	CHAT_LIST_TAB_CASE_ME,
	EVENT_TOPIC_DROPPED_FILES,
} from '@src/Constants';
import { useTranslation } from 'react-i18next';

const useChatListItem = ({ props }) => {
	const data = props.chatData;

	const [isSelected, setSelected] = useState(false);
	const [isExpired, setExpired] = useState(props.chatData.isExpired);
	const [timeLeft, setTimeLeft] = useState();
	const [remainingSeconds, setRemainingSeconds] = useState(0);
	const [isCheckedMissingContact, setCheckedMissingContact] = useState(false);

	const isDisabled = useMemo(() => {
		return isExpired && props.bulkSendPayload?.type !== 'template';
	}, [isExpired, props.bulkSendPayload]);

	const { waId } = useParams();

	const navigate = useNavigate();

	const { t } = useTranslation();

	useEffect(() => {
		setSelected(props.selectedChats.includes(data.waId));
	}, [props.selectedChats]);

	const isUserAssignmentChipVisible = () => {
		if (props.tabCase === CHAT_LIST_TAB_CASE_ALL) {
			if (data.assignedToUser) {
				return true;
			}

			return !data.assignedGroup;
		}

		if (props.tabCase === CHAT_LIST_TAB_CASE_ME) {
			if (!data.assignedGroup) {
				return true;
			}
		}

		if (props.tabCase === CHAT_LIST_TAB_CASE_GROUP) {
			if (data.assignedToUser) {
				return true;
			}
		}

		return false;
	};

	const isGroupAssignmentChipVisible = () => {
		if (
			props.tabCase === CHAT_LIST_TAB_CASE_ALL &&
			!data.assignedToUser &&
			data.assignedGroup
		) {
			return true;
		}

		if (props.tabCase === CHAT_LIST_TAB_CASE_ME) {
			if (data.assignedGroup) {
				return true;
			}
		}

		if (props.tabCase === CHAT_LIST_TAB_CASE_GROUP) {
			if (!data.assignedToUser) {
				return true;
			}
		}

		return false;
	};

	const generateTagNames = () => {
		const generatedTagNames = [];
		data.tags?.forEach((tag) => {
			generatedTagNames.push(tag.name);
		});
		return generatedTagNames.join(', ');
	};

	useEffect(() => {
		if (
			!isCheckedMissingContact &&
			data.waId &&
			!props.contactProvidersData[data.waId]
		) {
			setCheckedMissingContact(true);
			props.retrieveContactData(data.waId);
		}
	}, [isCheckedMissingContact, props.contactProvidersData]);

	useEffect(() => {
		function calculateRemaining() {
			const momentDate = moment.unix(data.lastReceivedMessageTimestamp);
			momentDate.add(1, 'day');
			const curDate = moment(new Date());
			const hours = momentDate.diff(curDate, 'hours');
			const seconds = momentDate.diff(curDate, 'seconds');

			setRemainingSeconds(seconds);

			if (hours > 0) {
				setTimeLeft(t('%dh', hours));
			} else {
				const minutes = momentDate.diff(curDate, 'minutes');
				if (minutes > 1) {
					setTimeLeft(t('%dm', minutes));
				} else {
					if (seconds > 1) {
						setTimeLeft(t('%dm', minutes));
					} else {
						// Expired
						setExpired(true);
					}
				}
			}
		}

		setExpired(data.isExpired);

		// Initial
		calculateRemaining();

		let intervalId;
		if (!isExpired) {
			intervalId = setInterval(() => {
				calculateRemaining();
			}, 30000);
		}

		return () => {
			clearInterval(intervalId);
		};
	}, [isExpired, data.isExpired, data.lastMessageTimestamp]);

	const handleDroppedFiles = (event) => {
		if (isExpired) {
			event.preventDefault();
			return;
		}

		// Preparing dropped files
		const files = getDroppedFiles(event);

		// Switching to related chat
		navigate(`/main/chat/${data.waId}`);

		// Sending files via eventbus
		PubSub.publish(EVENT_TOPIC_DROPPED_FILES, files);
	};

	const handleClick = () => {
		if (props.isSelectionModeEnabled) {
			if (isDisabled) return;

			let newSelectedState = !isSelected;

			props.setSelectedChats((prevState) => {
				if (newSelectedState) {
					if (!prevState.includes(data.waId)) {
						prevState.push(data.waId);
					}
				} else {
					prevState = prevState.filter((arrayItem) => arrayItem !== data.waId);
				}

				return [...prevState];
			});
		} else {
			navigate(`/main/chat/${data.waId}`);
		}
	};

	const hasFailedMessages = () => {
		let result = false;
		props.pendingMessages.forEach((pendingMessage) => {
			if (
				pendingMessage.requestBody?.wa_id === data.waId &&
				pendingMessage.isFailed === true
			)
				result = true;
		});

		return result;
	};

	return {
		data,
		waId,
		isExpired,
		timeLeft,
		remainingSeconds,
		isUserAssignmentChipVisible,
		isGroupAssignmentChipVisible,
		isSelected,
		handleClick,
		handleDroppedFiles,
		generateTagNames,
		isDisabled,
		hasFailedMessages,
	};
};

export default useChatListItem;
