import React from 'react';
import { Avatar } from '@mui/material';

import styles from './CustomAvatar.module.css';

const CustomAvatar = ({
	className,
	src,
	style,
	alt,
	ref,
	onClick,
	children,
}) => {
	return (
		<Avatar
			className={className + (style?.backgroundColor ? '' : ' ' + styles.light)}
			src={src}
			style={style}
			alt={alt}
			onClick={onClick}
			ref={ref}
		>
			{children}
		</Avatar>
	);
};

export default CustomAvatar;
