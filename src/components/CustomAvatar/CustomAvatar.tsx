import React from 'react';
import { Avatar } from '@mui/material';

import styles from './CustomAvatar.module.css';
import classNames from 'classnames/bind';

interface Props {
	className?: string;
	src?: string;
	style?: any;
	alt?: string;
	ref?: React.MutableRefObject<any>;
	onClick?: () => void;
	children?: any;
}

const cx = classNames.bind(styles);

const CustomAvatar: React.FC<Props> = ({
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
			className={cx({
				[className ?? '']: true,
				light: !Boolean(style?.backgroundColor),
			})}
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
