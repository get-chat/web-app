import * as React from 'react';
import { cn } from '@src/lib/utils';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
	/** 24px by default; "small" is 20px, "large" 35px, "inherit" the font size */
	fontSize?: 'inherit' | 'small' | 'medium' | 'large';
	/** Accessible name; without it the icon is hidden from screen readers */
	titleAccess?: string;
}

export type IconComponent = React.FC<IconProps>;

/**
 * Builds an icon component from Material Symbols path data (24px grid drawn on
 * a 960 unit viewBox). Sizing and colour come from the `app-icon` classes in
 * the base layer of src/styles/tailwind.css: 1em square, 24px font size,
 * grey, `fill: currentColor`.
 */
export function createIcon(paths: string[], name: string): IconComponent {
	const Icon: IconComponent = ({
		fontSize = 'medium',
		titleAccess,
		className,
		...props
	}) => (
		<svg
			className={cn(
				'app-icon',
				fontSize !== 'medium' && `app-icon--${fontSize}`,
				className
			)}
			viewBox="0 -960 960 960"
			focusable="false"
			aria-hidden={titleAccess ? undefined : true}
			role={titleAccess ? 'img' : undefined}
			data-testid={`${name}Icon`}
			{...props}
		>
			{paths.map((d) => (
				<path key={d} d={d} />
			))}
			{titleAccess && <title>{titleAccess}</title>}
		</svg>
	);
	Icon.displayName = `${name}Icon`;

	return Icon;
}
