import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { binaryToBase64 } from '../helpers/ImageHelper';
import { isEmptyString } from '../helpers/Helpers';
import { EMPTY_IMAGE_BASE64 } from '../Constants';

const Image = ({ src, alt, className, onClick }) => {
	const [data, setData] = useState('');
	const [mime, setMime] = useState('');

	useEffect(() => {
		axios
			.get(src, {
				responseType: 'arraybuffer',
			})
			.then((res) => {
				const mimetype = res.headers['content-type'];
				const base64 = binaryToBase64(res.data);

				setData(base64);
				setMime(mimetype);
			});
	}, []);

	const getSrc = () => {
		return !isEmptyString(data) && !isEmptyString(mime) !== undefined
			? `data:${mime};base64,${data}`
			: EMPTY_IMAGE_BASE64;
	};

	return (
		<img src={getSrc()} alt={alt} className={className} onClick={onClick} />
	);
};

export default Image;
