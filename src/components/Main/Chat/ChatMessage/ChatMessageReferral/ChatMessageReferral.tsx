import React from 'react';
import { useTranslation } from 'react-i18next';
import ChatMessageImage from '../ChatMessageImage';
import ChatMessageVideo from '../ChatMessageVideo';
import PrintMessage from '../../../../PrintMessage';
import { SimpleTooltip } from '@src/components/ui/tooltip';
import { ATTACHMENT_TYPE_IMAGE, ATTACHMENT_TYPE_VIDEO } from '@src/Constants';
import { Message } from '@src/types/messages';
import {
	generateReferralImageLink,
	generateReferralVideoLink,
} from '@src/helpers/MessageHelper';
import ReviewsIcon from '@src/components/icons/Reviews';

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
			<div
				className="mb-1.25 block cursor-pointer text-[length:x-small] text-ink/60"
				onClick={goToSourceURL}
			>
				<ReviewsIcon className="mr-1.25 size-[0.6em]! text-ink/40!" />
				{t('Message via ' + (referral.source_type ?? 'referral'))}
				<br />
			</div>

			<div className="-mx-1.5 -mt-px mb-[4px] overflow-hidden rounded-[6px] bg-ink/10">
				<div>
					{(referral.image || referral.image_url) && (
						<ChatMessageImage
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
				<div className="cursor-pointer px-2.5 py-1.25" onClick={goToSourceURL}>
					<SimpleTooltip
						title={referral.source_id}
						side="top"
						align="start"
						disableHoverableContent
					>
						<h4>
							<PrintMessage message={referral.headline} linkify={true} />
						</h4>
					</SimpleTooltip>
					<div className="text-[12px] [&_.emoji-mart-emoji]:size-3">
						<PrintMessage message={referral.body} linkify={true} />
					</div>
					<div className="text-[12px] text-ink/60">{referral.source_url}</div>
				</div>
			</div>
		</div>
	);
};

export default ChatMessageReferral;
