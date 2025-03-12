import { useEffect, useState } from 'react';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { clone } from '@src/helpers/ObjectHelper';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_POST_CHAT_MESSAGE_STATUS_CHANGE } from '@src/Constants';
import { setState } from '@src/store/reducers/UIReducer';

interface Props {
	initialMessage: ChatMessageModel | undefined;
}

const useMessageStatuses = ({ initialMessage }: Props) => {
	const [message, setMessage] = useState<ChatMessageModel | undefined>();

	const templates = useAppSelector((state) => state.templates.value);

	const dispatch = useAppDispatch();
	const close = () => dispatch(setState({ isMessageStatusesVisible: false }));

	useEffect(() => {
		setMessage(initialMessage);
	}, [initialMessage]);

	useEffect(() => {
		const onPostMessageStatusChange = function (
			msg: string,
			data: ChatMessageModel
		) {
			if (data && message?.id === data.id) {
				setMessage(clone(data) as ChatMessageModel);
			}
		};

		const postChatMessageStatusChangeEventToken = PubSub.subscribe(
			EVENT_TOPIC_POST_CHAT_MESSAGE_STATUS_CHANGE,
			onPostMessageStatusChange
		);

		return () => {
			PubSub.unsubscribe(postChatMessageStatusChangeEventToken);
		};
	}, [message]);

	return {
		message,
		templates,
		close,
	};
};

export default useMessageStatuses;
