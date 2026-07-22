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

	// MUI Avatar falls back to its person icon only when it receives no
	// children at all; an empty string counts as content and would render
	// a blank circle instead. String initials without a single letter are
	// dropped too: phone-number-only contacts yield "+" or a digit, which
	// is not a meaningful initial. \p{L} accepts letters of any script.
	const content =
		typeof children === 'string' && !/\p{L}/u.test(children)
			? undefined
			: children;

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
			{content}
		</Styled.StyledAvatar>
	);
};

export default CustomAvatar;
