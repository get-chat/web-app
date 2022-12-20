import React from 'react';
import { Avatar } from '@mui/material';

import styles from './CustomAvatar.module.css';

const CustomAvatar = ({ className, src, style, alt, ref, children }) => {
	return (
		<Avatar
			className={className + (style?.backgroundColor ? '' : ' ' + styles.light)}
			src={src}
			style={style}
			alt={alt}
			ref={ref}
		>
			{children}
		</Avatar>
	);
};

export default CustomAvatar;
