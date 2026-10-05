import Linkify from 'linkify-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Message } from '@src/types/messages';
import { canRetry } from '@src/helpers/MessageHelper';
import { Button } from '@src/components/ui/button';

interface Props {
	data: Message;
	retryMessage?: (message: Message) => void;
}

const ChatMessageErrors: React.FC<Props> = ({ data, retryMessage }) => {
	const { t } = useTranslation();

	return (
		<>
			{data.waba_payload?.errors &&
				data.waba_payload.errors.map((error, index) => {
					const details =
						error.details ?? error.error_data?.details ?? error.message;
					return (
						// Links take the colour of the text around them
						<div
							key={index}
							className="rounded-[10px] bg-[#ffbdbd] p-2.5 text-[#953434] [&_a]:font-semibold [&_a]:underline"
						>
							{error.recommendation && (
								<div className="mb-1.5 text-destructive-dark">
									<Linkify options={{ target: '_blank' }}>
										{t(error.recommendation)}
									</Linkify>
								</div>
							)}

							<div>
								<h5>{t('Details')}</h5>
								<div className="text-[13px]">
									{t(error.title ?? error.type ?? 'Error')}{' '}
									<span className="font-light">
										{error.code && t('(Code: %d)', Number(error.code))}
									</span>
								</div>
								<div className="text-[12px]">{details && t(details)}</div>
								{error.href && (
									<div className="text-[13px]">
										<a href={error.href} target="_blank">
											{t('Click here for more information.')}
										</a>
									</div>
								)}
							</div>

							{data.from_us &&
								data.is_failed &&
								canRetry(data) &&
								retryMessage && (
									<Button
										variant="outline"
										color="neutral"
										size="sm"
										// MUI's color="inherit": paint with the text colour
										className="mt-2.5 w-full [--btn:currentColor]"
										onClick={() => retryMessage?.(data)}
									>
										{t('Retry')}
									</Button>
								)}
						</div>
					);
				})}
		</>
	);
};

export default ChatMessageErrors;
