import React from 'react';
import { Button } from '@src/components/ui/button';
import { cn } from '@src/lib/utils';

interface Props extends React.ComponentProps<typeof Button> {
	tone?: 'send' | 'delete';
}

/**
 * The round icon button next to a quick reply or template in the panels
 * above the chat footer. MUI's small IconButton (5px padding) around a 20px
 * icon: a 30px circle, 40px on mobile where App.css gave every IconButton
 * 10px of padding.
 */
const MessageActionButton: React.FC<Props> = ({
	tone = 'send',
	className,
	...props
}) => (
	<Button
		variant="ghost"
		color="neutral"
		size="icon-sm"
		className={cn(
			'size-7.5 self-center rounded-full max-md:size-10 [&_.app-icon]:size-5!',
			tone === 'delete'
				? '[&_.app-icon]:text-(--color-secondary)!'
				: '[&_.app-icon]:text-chat-icon-dark!',
			className
		)}
		{...props}
	/>
);

export default MessageActionButton;
