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
import SearchMessageBubble from './SearchMessageBubble';
import MessageDateIndicator from '@src/components/Main/Chat/MessageDateIndicator';
import { getMessageTimestamp } from '@src/helpers/MessageHelper';
import moment from 'moment';
import { PanelTransitionProps } from '@src/styles/panelTransitions';
import SidePanel from '@src/components/SidePanel';

export type Props = {
	initialKeyword: string;
	setInitialKeyword: (_keyword: string) => void;
	contactProvidersData?: { [key: string]: any };
} & PanelTransitionProps;

const SearchMessage: React.FC<Props> = ({
	initialKeyword,
	setInitialKeyword,
	contactProvidersData,
	isExiting,
	onAnimationEnd,
}) => {
	const dispatch = useAppDispatch();

	const { t } = useTranslation();

	const [results, setResults] = useState<ChatMessageList>({});
	const [keyword, setKeyword] = useState('');
	const [isLoading, setLoading] = useState(false);
	// The keyword the current results are for
	const [searchedKeyword, setSearchedKeyword] = useState('');

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
			setSearchedKeyword('');
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
			setSearchedKeyword(keyword);
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

	const messages = Object.values(results);
	const hasNoResults =
		!isLoading &&
		messages.length === 0 &&
		keyword.trim().length > 0 &&
		searchedKeyword === keyword;

	// A small note on the wallpaper, like the chat's date chips
	const note = (text: string) => (
		<div className="m-auto rounded-[15px] bg-white/65 px-3 py-1.5 text-center text-[12px] font-semibold text-chat-icon shadow-[0_4px_5px_-6px_rgb(185,152,136)] backdrop-blur-[8px]">
			{text}
		</div>
	);

	return (
		<SidePanel
			title={t('Search For Messages')}
			titleClassName="text-[16px]"
			// The chat's look: its wallpaper throughout, and a header tinted
			// like the chat header next to it
			className="bg-chat-bg bg-(image:--chat-bg-image) bg-repeat"
			headerClassName="bg-[#6843301f] [&_svg]:text-chat-icon!"
			onClose={close}
			isExiting={isExiting}
			onAnimationEnd={onAnimationEnd}
		>
			{/* On the wallpaper, shaped like the chat's message box */}
			<SearchBar
				value={keyword}
				onChange={setKeyword}
				isLoading={isLoading}
				autoFocus
				className="flex-none bg-transparent px-3 pt-3 pb-1"
				fieldClassName="h-10 rounded-[12px] bg-white shadow-[var(--shadow-sm),0_0_0_1px_rgba(94,56,38,0.06)]"
			/>

			{/* Results drawn like the chat: its wallpaper, bubbles and dates */}
			<div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-3">
				{keyword.trim().length === 0 &&
					note(t('Search for messages in this chat'))}
				{hasNoResults && note(t('No results'))}

				{messages.map((message, index) => {
					const day = moment
						.unix(getMessageTimestamp(message) ?? 0)
						.format('YYYY-MM-DD');
					const previous = messages[index - 1];
					const isNewDay =
						!previous ||
						moment
							.unix(getMessageTimestamp(previous) ?? 0)
							.format('YYYY-MM-DD') !== day;

					return (
						<React.Fragment key={message.id}>
							{isNewDay && (
								<MessageDateIndicator
									className="mx-0 mt-2 mb-3"
									timestamp={getMessageTimestamp(message)}
								/>
							)}
							<SearchMessageBubble
								message={message}
								keyword={searchedKeyword}
								onClick={goToMessage}
								contactProvidersData={contactProvidersData}
							/>
						</React.Fragment>
					);
				})}
			</div>
		</SidePanel>
	);
};

export default SearchMessage;
