import React, { useEffect, useRef, useState } from 'react';
import * as Styled from './SearchMessage.styles';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PubSub from 'pubsub-js';
import { useParams } from 'react-router-dom';
import { isMobileOnly } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { CancelTokenSource } from 'axios';
import { useAppDispatch } from '@src/store/hooks';
import { setSearchMessagesVisible } from '@src/store/reducers/UIReducer';
import ChatMessageList from '@src/interfaces/ChatMessageList';
import { Message } from '@src/types/messages';
import { fetchMessages } from '@src/api/messagesApi';
import { prepareMessageList } from '@src/helpers/MessageHelper';
import { generateCancelToken } from '@src/helpers/ApiHelper';
import { EVENT_TOPIC_GO_TO_MSG_ID } from '@src/Constants';
import SearchBar from '@src/components/SearchBar';
import SearchMessageResult from '@src/components/SearchMessageResult/SearchMessageResult';

export type Props = {
	initialKeyword: string;
	setInitialKeyword: (_keyword: string) => void;
};

const SearchMessage: React.FC<Props> = ({
	initialKeyword,
	setInitialKeyword,
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

	let cancelTokenSourceRef = useRef<CancelTokenSource | undefined>();

	const search = async () => {
		// Check if there are any previous pending requests
		if (cancelTokenSourceRef.current) {
			cancelTokenSourceRef.current.cancel(
				'Operation canceled due to new request.'
			);
		}

		// Generate a token
		cancelTokenSourceRef.current = generateCancelToken();

		if (keyword.trim().length === 0) {
			setResults({});
			return false;
		}

		setLoading(true);

		try {
			// TODO: Make request cancellable
			const data = await fetchMessages({
				wa_id: waId,
				search: keyword,
				limit: 30,
			});
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
		<Styled.SearchMessageContainer>
			<Styled.Header>
				<IconButton onClick={close} size="large">
					<CloseIcon />
				</IconButton>

				<h3>{t('Search For Messages')}</h3>
			</Styled.Header>

			<SearchBar value={keyword} onChange={setKeyword} isLoading={isLoading} />

			<Styled.Body>
				{Object.entries(results).map((message) => (
					<SearchMessageResult
						key={message[0]}
						messageData={message[1]}
						keyword={keyword}
						onClick={goToMessage}
						displaySender={false}
					/>
				))}
			</Styled.Body>
		</Styled.SearchMessageContainer>
	);
};

export default SearchMessage;
