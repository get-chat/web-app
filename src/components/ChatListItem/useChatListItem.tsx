import { DragEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment/moment';
import { getDroppedFiles } from '@src/helpers/FileHelper';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_DROPPED_FILES } from '@src/Constants';
import { useTranslation } from 'react-i18next';
import ChatModel from '@src/api/models/ChatModel';

const useChatListItem = ({ props }: { props: any }) => {
	const data: ChatModel = props.chatData;

	const [isSelected, setSelected] = useState(false);
	const [isExpired, setExpired] = useState(props.chatData.isExpired);
	const [timeLeft, setTimeLeft] = useState<string>();
	const [remainingSeconds, setRemainingSeconds] = useState(0);

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
		if (!props.filterAssignedToMe && !props.filterAssignedGroupId) {
			if (data.assignedToUser) {
				return true;
			}

			return !data.assignedGroup;
		}

		if (props.filterAssignedToMe) {
			if (!data.assignedGroup) {
				return true;
			}
		}

		if (props.filterAssignedGroupId && data.assignedToUser) {
			return true;
		}

		if (props.assignedGroup) {
			if (data.assignedToUser) {
				return true;
			}
		}

		return false;
	};

	const isGroupAssignmentChipVisible = useCallback(() => {
		if (
			!props.filterAssignedToMe &&
			!props.filterAssignedGroupId &&
			!data.assignedToUser &&
			data.assignedGroup
		) {
			return true;
		}

		if (props.filterAssignedToMe) {
			if (data.assignedGroup) {
				return true;
			}
		}

		if (props.filterAssignedGroupId) {
			if (!data.assignedToUser) {
				return true;
			}
		}

		return false;
	}, [
		props.filterAssignedToMe,
		props.filterAssignedGroupId,
		props.assignedToUser,
		props.assignedGroup,
	]);

	const generateTagNames = useCallback(() => {
		const generatedTagNames: string[] = [];
		data.tags?.forEach((tag) => {
			generatedTagNames.push(tag.name);
		});
		return generatedTagNames.join(', ');
	}, [data.tags]);

	useEffect(() => {
		async function calculateRemaining() {
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

		let intervalId: NodeJS.Timer;
		if (!isExpired) {
			intervalId = setInterval(() => {
				calculateRemaining();
			}, 30000);
		}

		return () => {
			clearInterval(intervalId);
		};
	}, [isExpired, data.isExpired, data.lastMessageTimestamp]);

	const handleDroppedFiles = (event: DragEvent) => {
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

			props.setSelectedChats((prevState: string[]) => {
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

	const hasFailedMessages = useCallback(() => {
		let result = false;
		props.pendingMessages.forEach((pendingMessage: any) => {
			if (
				pendingMessage.requestBody?.wa_id === data.waId &&
				pendingMessage.isFailed === true
			)
				result = true;
		});

		return result;
	}, [data.waId, props.pendingMessages]);

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
