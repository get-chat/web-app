import React from 'react';
import { Button, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { Button as ReplyButton } from '@src/types/messages';
import { isEmptyString } from '@src/helpers/Helpers';
import * as Styled from './ReplyButtonsEditor.styles';

// Limits imposed by the WhatsApp Business API for reply buttons messages
const MAX_REPLY_BUTTONS = 3;
const BUTTON_TITLE_MAX_LENGTH = 20;

interface Props {
	buttons: ReplyButton[];
	onChange: (buttons: ReplyButton[]) => void;
	isShowErrors: boolean;
}

const ReplyButtonsEditor: React.FC<Props> = ({
	buttons,
	onChange,
	isShowErrors,
}) => {
	const { t } = useTranslation();

	const emptyButton = (): ReplyButton => ({
		type: 'reply',
		reply: { id: '', title: '' },
	});

	return (
		<Styled.Container>
			{buttons.map((button, buttonIndex) => (
				<Styled.Row key={buttonIndex}>
					<TextField
						variant="standard"
						size="small"
						fullWidth
						label={t('Button text')}
						value={button.reply?.title ?? ''}
						required
						error={isShowErrors && isEmptyString(button.reply?.title ?? '')}
						inputProps={{ maxLength: BUTTON_TITLE_MAX_LENGTH }}
						onChange={(e) =>
							onChange(
								buttons.map((item, i) =>
									i === buttonIndex
										? {
												...item,
												reply: { ...item.reply, title: e.target.value },
										  }
										: item
								)
							)
						}
					/>
					<IconButton
						size="small"
						aria-label={t('Remove button')}
						disabled={buttons.length === 1}
						onClick={() =>
							onChange(buttons.filter((_, i) => i !== buttonIndex))
						}
					>
						<CloseIcon fontSize="small" />
					</IconButton>
				</Styled.Row>
			))}

			<Button
				size="small"
				startIcon={<AddIcon />}
				disabled={buttons.length >= MAX_REPLY_BUTTONS}
				onClick={() => onChange([...buttons, emptyButton()])}
			>
				{t('Add button')}
			</Button>
		</Styled.Container>
	);
};

export default ReplyButtonsEditor;
