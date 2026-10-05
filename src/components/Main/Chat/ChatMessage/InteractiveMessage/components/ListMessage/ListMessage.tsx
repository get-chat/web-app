import React, { useState } from 'react';
import FormatListBulletedIcon from '@src/components/icons/FormatListBulleted';
import KeyboardArrowDownIcon from '@src/components/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@src/components/icons/KeyboardArrowUp';
import PrintMessage from '@src/components/PrintMessage';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
import InteractiveMessageButton from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageButton';
import * as Styled from './ListMessage.styles';

const ListMessage: React.FC<InteractiveMessageProps> = ({ interactive }) => {
	const [isExpanded, setExpanded] = useState(false);

	const { header, body, footer, action } = interactive ?? {};
	const sections = action?.sections;
	// The options stay collapsed behind the button as on WhatsApp; when there
	// is no button label yet (while composing) display them directly instead
	const isSectionsVisible = !action?.button || isExpanded;

	return (
		<Styled.Message>
			{header && (
				<Styled.Header>
					<PrintMessage linkify message={header.text} />
				</Styled.Header>
			)}
			{body && (
				<Styled.Body>
					<PrintMessage linkify message={body.text} />
				</Styled.Body>
			)}
			{footer && (
				<Styled.Footer>
					<PrintMessage linkify message={footer.text} />
				</Styled.Footer>
			)}

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
				<Styled.Actions>
					<Styled.List>
						{sections.map(({ title, rows }, sectionIndex) => (
							<li key={sectionIndex}>
								<Styled.Title>{title}</Styled.Title>
								<Styled.List>
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
												<Styled.Description>{description}</Styled.Description>
											</li>
										)
									)}
								</Styled.List>
							</li>
						))}
					</Styled.List>
				</Styled.Actions>
			)}
		</Styled.Message>
	);
};

export default ListMessage;
