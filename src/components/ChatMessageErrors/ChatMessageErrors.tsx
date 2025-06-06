import Linkify from 'linkify-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Message } from '@src/types/messages';
import { canRetry } from '@src/helpers/MessageHelper';
import * as Styled from './ChatMessageErrors.styles';

interface Props {
	data: Message;
	retryMessage?: (message: Message) => void;
}

const ChatMessageErrors: React.FC<Props> = ({ data, retryMessage }) => {
	const { t } = useTranslation();

	return (
		<>
			{data.waba_payload?.errors &&
				data.waba_payload.errors.map((error, index) => (
					<Styled.Container key={index}>
						{error.recommendation && (
							<Styled.Recommendation>
								<Linkify options={{ target: '_blank' }}>
									{t(error.recommendation)}
								</Linkify>
							</Styled.Recommendation>
						)}

						<Styled.Error>
							<h5>{t('Details')}</h5>
							<Styled.ErrorTitle>
								{t(error.title ?? 'Error')}{' '}
								<Styled.Code>
									{error.code && t('(Code: %d)', error.code)}
								</Styled.Code>
							</Styled.ErrorTitle>
							<Styled.ErrorDetails>
								{error.details && t(error.details)}
							</Styled.ErrorDetails>
							{error.href && (
								<Styled.ErrorLink>
									<a href={error.href} target="_blank">
										{t('Click here for more information.')}
									</a>
								</Styled.ErrorLink>
							)}
						</Styled.Error>

						{data.from_us &&
							data.is_failed &&
							canRetry(data) &&
							retryMessage && (
								<Styled.RetryButton
									color="inherit"
									fullWidth
									size="small"
									variant="outlined"
									onClick={() => retryMessage?.(data)}
								>
									{t('Retry')}
								</Styled.RetryButton>
							)}
					</Styled.Container>
				))}
		</>
	);
};

export default ChatMessageErrors;
