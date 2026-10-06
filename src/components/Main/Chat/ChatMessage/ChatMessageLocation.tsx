import React, { useContext } from 'react';
import ShareIcon from '@src/components/icons/Share';
import OpenInNewIcon from '@src/components/icons/OpenInNew';
import { useTranslation } from 'react-i18next';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { Message } from '@src/types/messages';
import { messageMediaClassName } from './messageBubble';
import { cn } from '@src/lib/utils';
import { Button } from '@src/components/ui/button';

// Chat.css sizes these icons in em, which would grow with the icon's own
// font size; `!` to keep MUI's small-button icon size
const actionButton = '[&_svg]:size-[15px]!';

interface Props {
	data: Message;
}

const ChatMessageLocation: React.FC<Props> = ({ data }) => {
	const config = useContext(AppConfigContext);
	const { t } = useTranslation();

	const location = data.waba_payload?.location;
	const coordinates = `${location?.latitude},${location?.longitude}`;
	const mapEmbedURL = `https://www.google.com/maps/embed/v1/place?key=${config?.APP_GOOGLE_MAPS_API_KEY}&q=${coordinates}`;
	const mapURL = `https://www.google.com/maps/place/${coordinates}`;

	const share = async () => {
		if (navigator.share) {
			try {
				await navigator.share({ url: mapURL });
			} catch (e: any) {
				if (e.toString().includes('AbortError')) {
					console.log('Ignored AbortError.');
				} else {
					window.displayCustomError(e.toString());
				}
			}
		} else if (navigator.clipboard) {
			await navigator.clipboard.writeText(mapURL);
			window.displaySuccess('Copied!');
		} else {
			console.log('HTTPS is required for this feature!');
		}
	};

	return (
		<div className="flex flex-col">
			<iframe
				className={messageMediaClassName}
				width="250"
				height="150"
				loading="lazy"
				allowFullScreen
				referrerPolicy="no-referrer-when-downgrade"
				src={mapEmbedURL}
			/>

			{location?.name && (
				<div className="mt-1.25 font-semibold">{location.name}</div>
			)}
			{location?.address && (
				<div className="mb-2.5 text-[12px] text-ink/50">{location.address}</div>
			)}
			{location?.url && (
				<a
					className="mb-2.5 max-w-[250px] truncate text-[12px] text-primary! hover:underline"
					href={location.url}
					target="_blank"
					rel="noopener noreferrer"
				>
					{location.url}
				</a>
			)}

			<div className="flex justify-center gap-2">
				<Button
					asChild
					variant="ghost"
					color="primary"
					size="sm"
					// The icon follows the label's colour
					className={cn(actionButton, '[&_.app-icon]:text-inherit!')}
				>
					<a href={mapURL} target="_blank" rel="noopener noreferrer">
						<OpenInNewIcon />
						{t('Open')}
					</a>
				</Button>

				<Button
					variant="outline"
					color="primary"
					size="sm"
					className={cn(
						actionButton,
						'self-center justify-self-center [&_.app-icon]:text-primary!'
					)}
					onClick={share}
				>
					<ShareIcon />
					{t('Share')}
				</Button>
			</div>
		</div>
	);
};

export default ChatMessageLocation;
