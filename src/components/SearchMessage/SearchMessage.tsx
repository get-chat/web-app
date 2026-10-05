import React, { useEffect, useRef, useState } from 'react';
import PubSub from 'pubsub-js';
import { useParams } from 'react-router-dom';
import { isMobileOnly } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@src/store/hooks';
import { setSearchMessagesVisible } from '@src/store/reducers/UIReducer';
import ChatMessageList from '@src/interfaces/ChatMessageList';
import { Message } from '@src/types/messages';
import { fetchMessages } from '@src/api/messagesApi';
import { prepareMessageList } from '@src/helpers/MessageHelper';
import { EVENT_TOPIC_GO_TO_MSG_ID } from '@src/Constants';
import SearchBar from '@src/components/SearchBar';
import SearchMessageResult from '@src/components/SearchMessageResult/SearchMessageResult';
import { PanelTransitionProps } from '@src/styles/panelTransitions';
import SidePanel from '@src/components/SidePanel';

export type Props = {
	initialKeyword: string;
	setInitialKeyword: (_keyword: string) => void;
} & PanelTransitionProps;

const SearchMessage: React.FC<Props> = ({
	initialKeyword,
	setInitialKeyword,
	isExiting,
	onAnimationEnd,
}) => {
	const dispatch = useAppDispatch();

	const { t } = useTranslation();

	const [results, setResults] = useState<ChatMessageList>({});
	const [keyword, setKeyword] = useState('');
	const [isLoading, setLoading] = useState(false);

	const timer = useRef<NodeJS.Timeout>();

	const { waId } = useParams();

	useEffect(() => {
		const handleKey = (event: KeyboardEvent) => {
			// Escape
			if (event.key === 'Escape') {
				close();
				event.stopPropagation();
			}
		};

		document.addEventListener('keydown', handleKey);

		return () => {
			document.removeEventListener('keydown', handleKey);

			// Clear initial keyword for next session
			setInitialKeyword('');
		};
	}, []);

	useEffect(() => {
		setResults({});
	}, [waId]);

	useEffect(() => {
		timer.current = setTimeout(() => {
			search();
		}, 500);

		return () => {
			clearTimeout(timer.current);
		};
	}, [keyword]);

	useEffect(() => {
		if (initialKeyword) {
			setKeyword(initialKeyword);
		}
	}, [initialKeyword]);

	const close = () => {
		dispatch(setSearchMessagesVisible(false));
	};

	const abortControllerRef = useRef<AbortController | null>(null);

	const search = async () => {
		// Check if there are any previous pending requests
		if (abortControllerRef.current) {
			abortControllerRef.current.abort(
				'Operation canceled due to new request.'
			);
		}

		// Generate an abort controller
		abortControllerRef.current = new AbortController();

		if (keyword.trim().length === 0) {
			setResults({});
			return false;
		}

		setLoading(true);

		try {
			const data = await fetchMessages(
				{
					wa_id: waId,
					search: keyword,
					limit: 30,
				},
				abortControllerRef.current?.signal
			);
			const preparedMessages = prepareMessageList(data.results);
			setResults(preparedMessages);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const goToMessage = (data: Message) => {
		PubSub.publish(EVENT_TOPIC_GO_TO_MSG_ID, data);

		if (isMobileOnly) {
			close();
		}
	};

	return (
		<SidePanel
			title={t('Search For Messages')}
			titleClassName="text-[16px]"
			onClose={close}
			isExiting={isExiting}
			onAnimationEnd={onAnimationEnd}
		>
			<SearchBar value={keyword} onChange={setKeyword} isLoading={isLoading} />

			<div className="relative flex flex-1 flex-col overflow-y-auto bg-white">
				{Object.entries(results).map((message) => (
					<SearchMessageResult
						key={message[0]}
						messageData={message[1]}
						keyword={keyword}
						onClick={goToMessage}
						displaySender={false}
					/>
				))}
			</div>
		</SidePanel>
	);
};

export default SearchMessage;
