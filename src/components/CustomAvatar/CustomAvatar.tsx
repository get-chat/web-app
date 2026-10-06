import React, { useMemo } from 'react';
import PersonIcon from '@src/components/icons/Person';
import { generateAvatarColor } from '@src/helpers/AvatarHelper';
import { Avatar, AvatarFallback, AvatarImage } from '@src/components/ui/avatar';
import { cn } from '@src/lib/utils';

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

	// Like MUI's Avatar, fall back to a person icon only when there are no
	// children at all; an empty string counts as content and would render
	// a blank circle instead. String initials without a single letter are
	// dropped too: phone-number-only contacts yield "+" or a digit, which
	// is not a meaningful initial. \p{L} accepts letters of any script.
	const content =
		typeof children === 'string' && !/\p{L}/u.test(children)
			? undefined
			: children;

	const isLight = !Boolean(style?.backgroundColor ?? bgColor);

	// MUI's Avatar showed the first letter of `alt` when the image failed and
	// there were no children; otherwise its person icon, at 75% of the avatar
	const fallback =
		content ?? (src && alt ? alt[0] : <PersonIcon className="size-[75%]!" />);

	return (
		<Avatar
			className={cn(
				'items-center justify-center bg-[#e0e2e8] text-[1.25rem] leading-none font-semibold text-white',
				// Grey initials on the light default background; on a colour,
				// white icons
				isLight ? 'text-[#6e7383]!' : '[&_.app-icon]:text-white!',
				className
			)}
			style={{
				...style,
				backgroundColor: bgColor ?? style?.backgroundColor,
			}}
			onClick={onClick}
			ref={ref}
		>
			{src && <AvatarImage src={src} alt={alt} />}
			<AvatarFallback className="bg-transparent text-inherit">
				{fallback}
			</AvatarFallback>
		</Avatar>
	);
};

export default CustomAvatar;
