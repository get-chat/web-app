import React, { useState } from 'react';
import Image from '../../../Image';
import { messageMediaClassName } from './messageBubble';
import { cn } from '@src/lib/utils';
import { useTranslation } from 'react-i18next';
import MissingContent from '@src/components/Main/Chat/ChatMessage/MissingContent';

interface Props {
	className?: string;
	source: string;
	data: any;
	onPreview?: () => void;
}

const ChatMessageImage: React.FC<Props> = ({
	className,
	source,
	data,
	onPreview,
}) => {
	const [isAvailable, setIsAvailable] = useState(true);

	const { t } = useTranslation();

	const onError = () => {
		setIsAvailable(false);
	};

	if (!isAvailable) {
		return (
			<div style={{ marginTop: '5px' }}>
				<MissingContent>
					{t("This image isn't available anymore.")}
				</MissingContent>
			</div>
		);
	}

	return (
		<Image
			className={cn(messageMediaClassName, className)}
			src={source}
			alt={data.caption}
			onClick={onPreview}
			onError={onError}
		/>
	);
};

export default ChatMessageImage;
