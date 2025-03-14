import React from 'react';
import ReviewsIcon from '@mui/icons-material/Reviews';
import { useTranslation } from 'react-i18next';
import styles from './ChatMessageReferral.module.css';
import ChatMessageImage from '../ChatMessageImage';
import ChatMessageVideo from '../ChatMessageVideo';
import PrintMessage from '../../../../PrintMessage';
import { Tooltip } from '@mui/material';
import { ATTACHMENT_TYPE_IMAGE, ATTACHMENT_TYPE_VIDEO } from '@src/Constants';
import ChatMessageModel from '@src/api/models/ChatMessageModel';

interface Props {
	data: ChatMessageModel;
	onPreview: (type: string, source: string) => void;
	onOptionsClick: (e: React.MouseEvent) => void;
}

const ChatMessageReferral: React.FC<Props> = ({
	data,
	onPreview,
	onOptionsClick,
}) => {
	const { t } = useTranslation();

	const { referral } = data;

	const goToSourceURL = () => {
		window.open(referral.source_url, '_blank')?.focus();
	};

	return (
		<div>
			<div className={styles.header} onClick={goToSourceURL}>
				<ReviewsIcon className={styles.headerIcon} />
				{t('Message via ' + (referral.source_type ?? 'referral'))}
				<br />
			</div>

			<div className={styles.referralContainer}>
				<div>
					{(referral.image || referral.image_url) && (
						<ChatMessageImage
							className={styles.referralMedia}
							data={referral}
							source={data.generateReferralImageLink()}
							onPreview={() =>
								onPreview(
									ATTACHMENT_TYPE_IMAGE,
									data.generateReferralImageLink()
								)
							}
						/>
					)}

					{(referral.video || referral.video_url) && (
						<ChatMessageVideo
							source={data.generateReferralVideoLink()}
							onPreview={() =>
								onPreview(
									ATTACHMENT_TYPE_VIDEO,
									data.generateReferralVideoLink()
								)
							}
							onOptionsClick={onOptionsClick}
						/>
					)}
				</div>
				<div className={styles.referralBody} onClick={goToSourceURL}>
					<Tooltip
						title={referral.source_id}
						placement="top-start"
						disableInteractive
					>
						<h4>
							<PrintMessage message={referral.headline} linkify={true} />
						</h4>
					</Tooltip>
					<div className={styles.referralTextBody}>
						<PrintMessage message={referral.body} linkify={true} />
					</div>
					<div className={styles.referralSourceURL}>{referral.source_url}</div>
				</div>
			</div>
		</div>
	);
};

export default ChatMessageReferral;
