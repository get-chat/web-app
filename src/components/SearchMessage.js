import React, { useEffect, useRef, useState } from 'react';
import '../styles/SearchMessage.css';
import { IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
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

function SearchMessage(props) {
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

	let cancelTokenSourceRef = useRef();

	const search = async (_keyword) => {
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
			(response) => {
				const preparedMessages = {};
				response.data.results.forEach((message) => {
					const prepared = new ChatMessageModel(message);
					preparedMessages[prepared.id] = prepared;
				});
				setResults(preparedMessages);
				setLoading(false);
			},
			(error) => {
				setLoading(false);
			}
		);
	};

	const goToMessage = (data) => {
		PubSub.publish(EVENT_TOPIC_GO_TO_MSG_ID, data);

		if (isMobileOnly) {
			hideSearchMessages();
		}
	};

	return (
		<div className="searchMessage">
			<div className="searchMessage__header">
				<IconButton onClick={hideSearchMessages}>
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
						onClick={(chatMessage) => goToMessage(chatMessage)}
					/>
				))}
			</div>
		</div>
	);
}

export default SearchMessage;
