import React, { useEffect, useRef, useState } from 'react';
import PauseIcon from '@src/components/icons/Pause';
import PlayArrowIcon from '@src/components/icons/PlayArrow';
import HeadsetIcon from '@src/components/icons/Headphones';
import PubSub from 'pubsub-js';
import {
	EVENT_TOPIC_CHAT_MESSAGE,
	EVENT_TOPIC_UNSUPPORTED_FILE,
} from '@src/Constants';
import { isAudioMimeTypeSupported } from '@src/helpers/FileHelper';
import UnsupportedFileClass from '../../../../UnsupportedFileClass';
import CustomAvatar from '@src/components/CustomAvatar';
import { Message } from '@src/types/messages';
import {
	generateAudioLink,
	generateVoiceLink,
	getMessageMimeType,
	getSenderName,
	hasAnyAudio,
} from '@src/helpers/MessageHelper';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { Button } from '@src/components/ui/button';

interface Props {
	data: Message;
}

const ChatMessageVoice: React.FC<Props> = ({ data }) => {
	const [isPlaying, setPlaying] = useState(false);
	const duration = useRef(null);
	const [progress, setProgress] = useState(0);
	const [currentDuration, setCurrentDuration] = useState('0:00');
	const audio = useRef<HTMLAudioElement>(null);
	const range = useRef(null);

	const onChatMessageEvent = function (msg: string, data: any) {
		if (data === 'pause') {
			pauseVoice();
		}
	};

	const playIconStyles = {
		fontSize: '38px',
	};

	useEffect(() => {
		// Subscribing only if there is voice or audio
		if (hasAnyAudio(data)) {
			const token = PubSub.subscribe(
				EVENT_TOPIC_CHAT_MESSAGE,
				onChatMessageEvent
			);
			return () => {
				PubSub.unsubscribe(token);
			};
		}
	}, []);

	const pauseVoice = () => {
		if (audio.current && range.current && !audio.current.paused) {
			audio.current.pause();
			setPlaying(false);
		}
	};

	const playVoice = () => {
		if (audio.current && range.current) {
			if (!audio.current.paused) {
				audio.current.pause();
				setPlaying(false);
			} else {
				// Pause others
				PubSub.publishSync(EVENT_TOPIC_CHAT_MESSAGE, 'pause');

				if (isAudioMimeTypeSupported(getMessageMimeType(data))) {
					audio.current.play().catch((error) => {
						console.error(error);
					});
					setPlaying(true);
				} else {
					const unsupportedFile = new UnsupportedFileClass({
						name: data.id,
						link: data.waba_payload?.audio?.link ?? generateAudioLink(data),
						mimeType: getMessageMimeType(data),
					});
					PubSub.publish(EVENT_TOPIC_UNSUPPORTED_FILE, unsupportedFile);
				}
			}

			const interval = setInterval(function () {
				if (audio.current && range.current) {
					const duration = audio.current.duration;
					const currentTime = audio.current.currentTime;

					setCurrentDuration(formatDuration(currentTime));

					if (duration) {
						const percentage = (currentTime * 100) / duration;

						if (percentage >= 100) {
							setProgress(0);
							setCurrentDuration(formatDuration(0));
							setPlaying(false);
							clearInterval(interval);
						} else {
							setProgress(percentage);
						}
					}

					if (audio.current?.paused) {
						clearInterval(interval);
					}
				} else {
					// In case component is reloaded
					clearInterval(interval);
				}
			}, 300);
		}
	};

	const formatDuration = (s: number) => {
		s = Math.floor(s);
		return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
	};

	const changeDuration = (value: number) => {
		if (audio.current && range.current && audio.current.duration !== Infinity) {
			setProgress(value);
			const nextCurrentTime = audio.current.duration / value;
			if (nextCurrentTime !== Infinity && !isNaN(nextCurrentTime)) {
				audio.current.currentTime = nextCurrentTime;
			}
		}
	};

	return (
		<div className="-mx-1 flex flex-col">
			<div className="flex items-center">
				{/* MUI's large IconButton with a 6px padding */}
				<Button
					variant="ghost"
					color="neutral"
					size="none"
					className="mr-[5px] rounded-full p-1.5"
					onClick={playVoice}
				>
					{isPlaying ? (
						<PauseIcon style={playIconStyles} />
					) : (
						<PlayArrowIcon style={playIconStyles} />
					)}
				</Button>
				<input
					ref={range}
					dir="ltr"
					type="range"
					className="voice-range box-border block h-[21px] border-none outline-none!"
					min="0"
					max="100"
					value={progress}
					onChange={(e) => changeDuration(parseFloat(e.target.value))}
				/>
				<audio
					ref={audio}
					src={
						data.waba_payload?.voice?.id
							? generateVoiceLink(data)
							: generateAudioLink(data)
					}
					preload="none"
					//onLoadedMetadata={(event) => console.log(event.target.duration)}
				/>

				<CustomAvatar
					generateBgColorBy={
						Boolean(
							data.waba_payload?.voice?.id !== undefined ??
								generateVoiceLink(data) !== undefined
						)
							? getSenderName(data)
							: undefined
					}
					style={{
						backgroundColor: '#ff9a10',
					}}
					className="mr-[4px] ml-3.75 [&_.app-icon]:text-white!"
				>
					{data.waba_payload?.voice?.id !== undefined ? (
						<span>{generateInitialsHelper(getSenderName(data))}</span>
					) : (
						<HeadsetIcon />
					)}
				</CustomAvatar>
			</div>
			<span ref={duration} className="ml-[55px] text-[length:x-small]">
				{currentDuration}
			</span>
		</div>
	);
};

export default ChatMessageVoice;
