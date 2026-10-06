import React from 'react';
import { messageMediaClassName } from './messageBubble';
import { cn } from '@src/lib/utils';
import PlayArrowIcon from '@src/components/icons/PlayArrow';

interface Props {
	source: string;
	onPreview?: () => void;
	onOptionsClick?: (e: React.MouseEvent) => void;
}

const ChatMessageVideo: React.FC<Props> = ({
	source,
	onPreview,
	onOptionsClick,
}) => {
	return (
		<div
			className="relative table w-fit cursor-pointer self-center"
			onClick={onPreview}
			onContextMenu={(e) => {
				onOptionsClick?.(e);
				e.preventDefault();
			}}
		>
			<video
				className={cn(messageMediaClassName, 'bg-[#b5b5b5]')}
				src={source}
				preload="none"
			/>
			<span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50px] bg-ink/40 p-2.5">
				<PlayArrowIcon
					fontSize={'large'}
					style={{ fill: 'white', fontSize: 40 }}
				/>
			</span>
		</div>
	);
};

export default ChatMessageVideo;
