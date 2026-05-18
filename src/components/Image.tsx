import React from 'react';
import { isEmptyString } from '../helpers/Helpers';
import { EMPTY_IMAGE_BASE64 } from '../Constants';

interface Props {
	src?: string | undefined;
	alt?: string;
	className?: string;
	style?: any;
	height?: number;
	width?: number;
	onClick?: () => void;
	onError?: () => void;
	_ref?: any;
}

const Image: React.FC<Props> = ({
	src,
	alt,
	className,
	style,
	height,
	width,
	onClick,
	onError,
	_ref,
}) => {
	const resolvedSrc = !isEmptyString(src) ? src : EMPTY_IMAGE_BASE64;

	return (
		<img
			ref={_ref}
			src={resolvedSrc}
			alt={alt}
			className={className}
			style={style}
			height={height}
			width={width}
			onClick={onClick}
			onError={onError}
		/>
	);
};

export default Image;
