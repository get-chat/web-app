import React from 'react';
import PrintMessage from '@src/components/PrintMessage';
import { Interactive } from '@src/types/messages';
import { cn } from '@src/lib/utils';

interface Props {
	header?: Interactive['header'];
	body?: Interactive['body'];
	footer?: Interactive['footer'];
	headerClassName?: string;
	footerClassName?: string;
}

/** The header, body and footer texts of an interactive message */
const InteractiveMessageText: React.FC<Props> = ({
	header,
	body,
	footer,
	headerClassName,
	footerClassName,
}) => (
	<>
		{header && (
			<div className={cn('font-semibold', headerClassName)}>
				<PrintMessage linkify message={header.text} />
			</div>
		)}
		{body && (
			<div className="font-normal">
				<PrintMessage linkify message={body.text} />
			</div>
		)}
		{footer && (
			<div className={cn('opacity-50', footerClassName)}>
				<PrintMessage linkify message={footer.text} />
			</div>
		)}
	</>
);

export default InteractiveMessageText;
