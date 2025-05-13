import React, { useMemo } from 'react';
import * as Styled from './CustomAvatar.styles';
import { generateAvatarColor } from '@src/helpers/AvatarHelper';

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

	const isLight = !Boolean(style?.backgroundColor ?? bgColor);

	return (
		<Styled.StyledAvatar
			className={className}
			$isLight={isLight}
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
		</Styled.StyledAvatar>
	);
};

export default CustomAvatar;
