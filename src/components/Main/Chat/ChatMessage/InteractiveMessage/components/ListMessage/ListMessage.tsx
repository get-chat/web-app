import React from 'react';
import { Button } from '@mui/material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import PrintMessage from '@src/components/PrintMessage';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
import * as Styled from './ListMessage.styles';

const ListMessage: React.FC<InteractiveMessageProps> = ({ interactive }) => {
	const { header, body, footer, action } = interactive ?? {};
	const sections = action?.sections;

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
				<Button
					variant="text"
					fullWidth
					startIcon={<FormatListBulletedIcon />}
					disabled
				>
					{action.button}
				</Button>
			)}

			{sections && Array.isArray(sections) && (
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
