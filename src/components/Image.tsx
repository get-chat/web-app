// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { binaryToBase64 } from '../helpers/ImageHelper';
import { isEmptyString } from '../helpers/Helpers';
import { EMPTY_IMAGE_BASE64 } from '../Constants';
import { generateCancelToken } from '../helpers/ApiHelper';

const Image = ({
	src,
	alt,
	className,
	style,
	height,
	width,
	onClick,
	_ref,
}) => {
	const [data, setData] = useState('');
	const [mime, setMime] = useState('');

	const cancelTokenSourceRef = useRef();

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
			});

		return () => {
			// Cancelling ongoing requests
			cancelTokenSourceRef.current.cancel();
		};
	}, [src]);

	const getSrc = () => {
		return !isEmptyString(data) && !isEmptyString(mime) !== undefined
			? `data:${mime};base64,${data}`
			: EMPTY_IMAGE_BASE64;
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
