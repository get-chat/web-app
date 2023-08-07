import React from 'react';
import { Button } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import ChatMessageModel from '@src/api/models/ChatMessageModel';

interface Props {
	data: ChatMessageModel;
}

const ChatMessageLocation: React.FC<Props> = ({ data }) => {
	const config = React.useContext(AppConfigContext);

	const mapEmbedURL = `https://www.google.com/maps/embed/v1/place?key=${config?.APP_GOOGLE_MAPS_API_KEY}&&q=${data.location?.latitude},${data.location?.longitude}&q=`;
	const mapURL = `https://www.google.com/maps/place/${data.location?.latitude},${data.location?.longitude}`;

	const share = async () => {
		if (navigator.share) {
			try {
				await navigator.share({ url: mapURL });
			} catch (e: any) {
				if (e.toString().includes('AbortError')) {
					console.log('Ignored AbortError.');
				} else {
					// @ts-ignore
					window.displayCustomError(e.toString());
				}
			}
		} else if (navigator.clipboard) {
			await navigator.clipboard.writeText(mapURL);
			// @ts-ignore
			window.displaySuccess('Copied!');
		} else {
			console.log('HTTPS is required for this feature!');
		}
	};

	return (
		<div className="chat__location">
			<iframe
				className="chat__location__iframe"
				width="250"
				height="150"
				loading="lazy"
				allowFullScreen
				referrerPolicy="no-referrer-when-downgrade"
				src={mapEmbedURL}
			/>

			{data.location && (
				<>
					{data.location.name && (
						<div className="chat__message__location__name">
							{data.location.name}
						</div>
					)}
					{data.location.address && (
						<div className="chat__message__location__address">
							{data.location.address}
						</div>
					)}
				</>
			)}

			<Button
				className="chat__message__location__share"
				color="primary"
				variant="outlined"
				size="small"
				disableElevation
				startIcon={<ShareIcon />}
				onClick={share}
			>
				Share
			</Button>
		</div>
	);
};

export default ChatMessageLocation;
