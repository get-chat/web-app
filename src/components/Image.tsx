import React, { useEffect, useRef, useState } from 'react';
import axios, { CancelTokenSource } from 'axios';
import { binaryToBase64 } from '../helpers/ImageHelper';
import { isEmptyString } from '../helpers/Helpers';
import { EMPTY_IMAGE_BASE64 } from '../Constants';
import { generateCancelToken } from '../helpers/ApiHelper';

interface Props {
	src: string;
	alt?: string;
	className?: string;
	style?: any;
	height?: number;
	width?: number;
	onClick?: () => void;
	_ref: any;
}

const Image: React.FC<Props> = ({
	src,
	alt,
	className,
	style,
	height,
	width,
	onClick,
	_ref,
}) => {
	const [data, setData] = useState<string>();
	const [mime, setMime] = useState('');
	const [fallbackSrc, setFallbackSrc] = useState<string>();

	const cancelTokenSourceRef = useRef<CancelTokenSource | undefined>();

	useEffect(() => {
		// Generate a token
		cancelTokenSourceRef.current = generateCancelToken();

		axios
			.get(src, {
				responseType: 'arraybuffer',
				cancelToken: cancelTokenSourceRef.current.token,
			})
			.then((res) => {
				const mimetype = res.headers['content-type'];
				const base64 = binaryToBase64(res.data);

				setData(base64);
				setMime(mimetype);
			})
			.catch((error) => {
				console.log(error);
				if (error.response === undefined) {
					setFallbackSrc(src);
				}
			});

		return () => {
			// Cancelling ongoing requests
			cancelTokenSourceRef.current?.cancel();
		};
	}, [src]);

	const getSrc = () => {
		return !isEmptyString(data) && !isEmptyString(mime) !== undefined
			? `data:${mime};base64,${data}`
			: fallbackSrc ?? EMPTY_IMAGE_BASE64;
	};

	return (
		<img
			ref={_ref}
			src={getSrc()}
			alt={alt}
			className={className}
			style={style}
			height={height}
			width={width}
			onClick={onClick}
		/>
	);
};

export default Image;
