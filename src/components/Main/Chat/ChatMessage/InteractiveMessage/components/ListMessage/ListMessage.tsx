import React, { useState } from 'react';
import FormatListBulletedIcon from '@src/components/icons/FormatListBulleted';
import KeyboardArrowDownIcon from '@src/components/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@src/components/icons/KeyboardArrowUp';
import PrintMessage from '@src/components/PrintMessage';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
import InteractiveMessageButton from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageButton';
import InteractiveMessageText from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageText';

// The sections, and the options within each
const listClassName = 'm-0 flex w-full list-none flex-col gap-1.25 p-0';

const ListMessage: React.FC<InteractiveMessageProps> = ({ interactive }) => {
	const [isExpanded, setExpanded] = useState(false);

	const { header, body, footer, action } = interactive ?? {};
	const sections = action?.sections;
	// The options stay collapsed behind the button as on WhatsApp; when there
	// is no button label yet (while composing) display them directly instead
	const isSectionsVisible = !action?.button || isExpanded;

	return (
		<div className="flex flex-col gap-1.25">
			<InteractiveMessageText
				header={header}
				body={body}
				footer={footer}
				footerClassName="mb-1.25"
			/>

			{action?.button && (
				<InteractiveMessageButton
					onClick={() => setExpanded((prevState) => !prevState)}
				>
					<FormatListBulletedIcon />
					{action.button}
					{isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
				</InteractiveMessageButton>
			)}

			{isSectionsVisible && sections && Array.isArray(sections) && (
				<div className="flex flex-col">
					<ul className={listClassName}>
						{sections.map(({ title, rows }, sectionIndex) => (
							<li key={sectionIndex}>
								<h3 className="m-0 border-b border-[#ccc] text-[1em]">
									{title}
								</h3>
								<ul className={listClassName}>
									{rows.map(
										(
											{
												title,
												description,
											}: {
												id: string;
												title: string;
												description: string;
											},
											rowIndex: number
										) => (
											<li key={rowIndex}>
												<p>{title}</p>
												<p className="m-0 text-[0.8em] opacity-50">
													{description}
												</p>
											</li>
										)
									)}
								</ul>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default ListMessage;
