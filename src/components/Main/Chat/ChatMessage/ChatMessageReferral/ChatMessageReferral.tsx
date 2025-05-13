import React from 'react';
import { useTranslation } from 'react-i18next';
import ChatMessageImage from '../ChatMessageImage';
import ChatMessageVideo from '../ChatMessageVideo';
import PrintMessage from '../../../../PrintMessage';
import { Tooltip } from '@mui/material';
import { ATTACHMENT_TYPE_IMAGE, ATTACHMENT_TYPE_VIDEO } from '@src/Constants';
import { Message } from '@src/types/messages';
import {
	generateReferralImageLink,
	generateReferralVideoLink,
} from '@src/helpers/MessageHelper';
import * as Styled from './ChatMessageReferral.styles';

interface Props {
	data: Message;
	onPreview: (type: string, source: string) => void;
	onOptionsClick: (e: React.MouseEvent) => void;
}

const ChatMessageReferral: React.FC<Props> = ({
	data,
	onPreview,
	onOptionsClick,
}) => {
	const { t } = useTranslation();

	const referral = data.waba_payload?.referral;

	const goToSourceURL = () => {
		window.open(referral.source_url, '_blank')?.focus();
	};

	return (
		<div>
			<Styled.Header onClick={goToSourceURL}>
				<Styled.HeaderIcon />
				{t('Message via ' + (referral.source_type ?? 'referral'))}
				<br />
			</Styled.Header>

			<Styled.ReferralContainer>
				<div>
					{(referral.image || referral.image_url) && (
						<ChatMessageImage
							className={Styled.ReferralMedia}
							data={referral}
							source={generateReferralImageLink(data)}
							onPreview={() =>
								onPreview(
									ATTACHMENT_TYPE_IMAGE,
									generateReferralImageLink(data)
								)
							}
						/>
					)}

					{(referral.video || referral.video_url) && (
						<ChatMessageVideo
							source={generateReferralVideoLink(data)}
							onPreview={() =>
								onPreview(
									ATTACHMENT_TYPE_VIDEO,
									generateReferralVideoLink(data)
								)
							}
							onOptionsClick={onOptionsClick}
						/>
					)}
				</div>
				<Styled.ReferralBody onClick={goToSourceURL}>
					<Tooltip
						title={referral.source_id}
						placement="top-start"
						disableInteractive
					>
						<h4>
							<PrintMessage message={referral.headline} linkify={true} />
						</h4>
					</Tooltip>
					<Styled.ReferralTextBody>
						<PrintMessage message={referral.body} linkify={true} />
					</Styled.ReferralTextBody>
					<Styled.ReferralSourceURL>
						{referral.source_url}
					</Styled.ReferralSourceURL>
				</Styled.ReferralBody>
			</Styled.ReferralContainer>
		</div>
	);
};

export default ChatMessageReferral;
