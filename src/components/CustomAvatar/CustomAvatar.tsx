import React, { useMemo } from 'react';
import { Avatar } from '@mui/material';

import styles from './CustomAvatar.module.css';
import classNames from 'classnames/bind';
import { generateAvatarColor } from '@src/helpers/AvatarHelper';

const cx = classNames.bind(styles);

interface Props {
	className?: string;
	src?: string;
	style?: any;
	generateBgColorBy?: string;
	alt?: string;
	ref?: React.MutableRefObject<any>;
	onClick?: () => void;
	children?: any;
}

const CustomAvatar: React.FC<Props> = ({
	className,
	src,
	style,
	generateBgColorBy,
	alt,
	ref,
	onClick,
	children,
}) => {
	const bgColor = useMemo(() => {
		return !src && generateBgColorBy
			? generateAvatarColor(generateBgColorBy)
			: undefined;
	}, [generateBgColorBy, src]);

	return (
		<Avatar
			className={cx({
				customAvatar: true,
				[className ?? '']: true,
				light: !Boolean(style?.backgroundColor ?? bgColor),
			})}
			src={src}
			style={{
				...style,
				backgroundColor: bgColor ?? style?.backgroundColor,
			}}
			alt={alt}
			onClick={onClick}
			ref={ref}
		>
			{children}
		</Avatar>
	);
};

export default CustomAvatar;
