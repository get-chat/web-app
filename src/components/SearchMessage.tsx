import React, { useEffect, useRef, useState } from 'react';
import '../styles/SearchMessage.css';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PubSub from 'pubsub-js';
import {
	EVENT_TOPIC_GO_TO_MSG_ID,
	EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY,
} from '../Constants';
import SearchBar from './SearchBar';
import { useParams } from 'react-router-dom';
import ChatMessageModel from '../api/models/ChatMessageModel';
import SearchMessageResult from './SearchMessageResult';
import { isMobileOnly } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { ApplicationContext } from '../contexts/ApplicationContext';
import { generateCancelToken } from '../helpers/ApiHelper';
import { AxiosError, AxiosResponse, CancelTokenSource } from 'axios';
import ChatMessagesResponse from '@src/api/responses/ChatMessagesResponse';

function SearchMessage() {
	// @ts-ignore
	const { apiService } = React.useContext(ApplicationContext);

	const { t } = useTranslation();

	const [results, setResults] = useState({});
	const [keyword, setKeyword] = useState('');
	const [isLoading, setLoading] = useState(false);

	const { waId } = useParams();

	useEffect(() => {
		setResults({});
	}, [waId]);

	const hideSearchMessages = () => {
		PubSub.publish(EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY, false);
	};

	let cancelTokenSourceRef = useRef<CancelTokenSource | undefined>();

	const search = async (_keyword: string) => {
		setKeyword(_keyword);

		// Check if there are any previous pending requests
		if (cancelTokenSourceRef.current) {
			cancelTokenSourceRef.current.cancel(
				'Operation canceled due to new request.'
			);
		}

		// Generate a token
		cancelTokenSourceRef.current = generateCancelToken();

		if (_keyword.trim().length === 0) {
			setResults({});
			return false;
		}

		setLoading(true);

		apiService.searchMessagesCall(
			waId,
			_keyword,
			30,
			cancelTokenSourceRef.current.token,
			(response: AxiosResponse) => {
				const chatMessagesResponse = new ChatMessagesResponse(response.data);
				setResults(chatMessagesResponse.messages);
				setLoading(false);
			},
			(error: AxiosError) => {
				console.log(error);
				setLoading(false);
			}
		);
	};

	const goToMessage = (data: ChatMessageModel) => {
		PubSub.publish(EVENT_TOPIC_GO_TO_MSG_ID, data);

		if (isMobileOnly) {
			hideSearchMessages();
		}
	};

	return (
		<div className="searchMessage">
			<div className="searchMessage__header">
				<IconButton onClick={hideSearchMessages} size="large">
					<CloseIcon />
				</IconButton>

				<h3>{t('Search For Messages')}</h3>
			</div>

			<SearchBar onChange={search} isLoading={isLoading} />

			<div className="searchMessage__body">
				{Object.entries(results).map((message) => (
					<SearchMessageResult
						key={message[0]}
						waId={waId}
						messageData={message[1]}
						keyword={keyword}
						onClick={goToMessage}
					/>
				))}
			</div>
		</div>
	);
}

export default SearchMessage;
