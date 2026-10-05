import React, { useId } from 'react';
import AddIcon from '@src/components/icons/Add';
import CloseIcon from '@src/components/icons/Close';
import { useTranslation } from 'react-i18next';
import { Button as ReplyButton } from '@src/types/messages';
import { isEmptyString } from '@src/helpers/Helpers';
import { Button } from '@src/components/ui/button';
import { Field, FieldLabel } from '@src/components/ui/field';
import { Input } from '@src/components/ui/input';
import { editorClassName, editorRowClassName } from './editorClassNames';

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

	const idPrefix = useId();

	const emptyButton = (): ReplyButton => ({
		type: 'reply',
		reply: { id: '', title: '' },
	});

	return (
		<div className={editorClassName}>
			{buttons.map((button, buttonIndex) => {
				const inputId = `${idPrefix}-button-${buttonIndex}`;
				const isInvalid =
					isShowErrors && isEmptyString(button.reply?.title ?? '');

				return (
					<div className={editorRowClassName} key={buttonIndex}>
						<Field data-invalid={isInvalid || undefined} className="gap-1">
							<FieldLabel htmlFor={inputId}>{t('Button text')} *</FieldLabel>
							<Input
								id={inputId}
								size="sm"
								value={button.reply?.title ?? ''}
								required
								aria-invalid={isInvalid || undefined}
								maxLength={BUTTON_TITLE_MAX_LENGTH}
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
						</Field>
						<Button
							variant="ghost"
							color="neutral"
							size="icon-sm"
							aria-label={t('Remove button')}
							disabled={buttons.length === 1}
							onClick={() =>
								onChange(buttons.filter((_, i) => i !== buttonIndex))
							}
						>
							<CloseIcon fontSize="small" />
						</Button>
					</div>
				);
			})}

			<Button
				variant="ghost"
				color="primary"
				size="sm"
				disabled={buttons.length >= MAX_REPLY_BUTTONS}
				onClick={() => onChange([...buttons, emptyButton()])}
			>
				<AddIcon fontSize="small" />
				{t('Add button')}
			</Button>
		</div>
	);
};

export default ReplyButtonsEditor;
