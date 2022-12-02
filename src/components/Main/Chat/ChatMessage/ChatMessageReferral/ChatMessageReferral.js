import React from 'react';
import ReviewsIcon from '@mui/icons-material/Reviews';
import { useTranslation } from 'react-i18next';
import styles from './ChatMessageReferral.module.css';
import ChatMessageImage from '../ChatMessageImage';
import ChatMessageVideo from '../ChatMessageVideo';
import PrintMessage from '../../../../PrintMessage';

const ChatMessageReferral = ({ data }) => {
	const { t } = useTranslation();

	const referral = data.referral;

	const goToSourceURL = () => {
		console.log(referral.source_url);
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<ReviewsIcon className={styles.headerIcon} />
				{t('Message via ' + referral.source_type)}
				<br />
			</div>

			<div className={styles.referralContainer}>
				<div>
					{referral.image && (
						<ChatMessageImage
							className={styles.referralMedia}
							data={referral}
							source={data.generateReferralImageLink()}
							onPreview={goToSourceURL}
						/>
					)}

					{referral.video && (
						<ChatMessageVideo
							data={data}
							source={data.generateReferralVideoLink()}
							onPreview={goToSourceURL}
						/>
					)}
				</div>
				<div className={styles.referralBody} onClick={goToSourceURL}>
					<h4>
						<PrintMessage message={referral.headline} />
					</h4>
					<div className={styles.referralTextBody}>
						<PrintMessage message={referral.body} />
					</div>
					<div className={styles.referralSourceURL}>{referral.source_url}</div>
				</div>
			</div>
		</div>
	);
};

export default ChatMessageReferral;
