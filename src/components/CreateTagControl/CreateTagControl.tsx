import React, {
	KeyboardEvent,
	ReactNode,
	useEffect,
	useRef,
	useState,
} from 'react';
import * as Styled from './CreateTagControl.styles';
import { CircularProgress, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { Tag } from '@src/types/tags';

export const TAG_COLOR_PALETTE = [
	'#E53935',
	'#FB8C00',
	'#FDD835',
	'#43A047',
	'#00ACC1',
	'#1E88E5',
	'#5E35B1',
	'#D81B60',
	'#6D4C41',
	'#757575',
];

interface Props {
	doCreateTag: (name: string, color: string) => Promise<Tag>;
	// Rendered while the form is collapsed; call openForm to reveal the form.
	trigger: (openForm: () => void) => ReactNode;
	// The MUI Menu hijacks keydown for typeahead navigation; stop it there.
	stopMenuKeyDownPropagation?: boolean;
}

// forwardRef so the component can safely be a direct child of a MUI Menu,
// whose MenuList may clone children and pass a ref for focus management.
const CreateTagControl = React.forwardRef<HTMLDivElement, Props>(
	({ doCreateTag, trigger, stopMenuKeyDownPropagation }, ref) => {
		const { t } = useTranslation();

		const [isCreating, setCreating] = useState(false);
		const [name, setName] = useState('');
		const [color, setColor] = useState(TAG_COLOR_PALETTE[0]);
		const [isSaving, setSaving] = useState(false);
		const inputRef = useRef<HTMLInputElement>(null);

		useEffect(() => {
			if (isCreating) {
				inputRef.current?.focus();
			}
		}, [isCreating]);

		const reset = () => {
			setCreating(false);
			setName('');
			setColor(TAG_COLOR_PALETTE[0]);
			setSaving(false);
		};

		const handleCreate = async () => {
			const trimmedName = name.trim();
			if (!trimmedName || isSaving) return;

			setSaving(true);
			try {
				await doCreateTag(trimmedName, color);
				reset();
			} catch (error) {
				console.error(error);
				setSaving(false);
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (stopMenuKeyDownPropagation) {
				event.stopPropagation();
			}
			if (event.key === 'Enter') {
				event.preventDefault();
				handleCreate();
			} else if (event.key === 'Escape') {
				event.preventDefault();
				reset();
			}
		};

		if (!isCreating) {
			return <>{trigger(() => setCreating(true))}</>;
		}

		return (
			<Styled.CreateTagForm
				ref={ref}
				onKeyDown={
					stopMenuKeyDownPropagation
						? (event) => event.stopPropagation()
						: undefined
				}
			>
				<Styled.CreateTagInputRow>
					<TextField
						inputRef={inputRef}
						value={name}
						onChange={(event) => setName(event.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={t('Tag name')}
						size="small"
						variant="standard"
						fullWidth
						disabled={isSaving}
					/>
					<IconButton
						size="small"
						color="primary"
						onClick={handleCreate}
						disabled={!name.trim() || isSaving}
						aria-label={t('Create tag')}
					>
						{isSaving ? (
							<CircularProgress size={16} />
						) : (
							<AddIcon fontSize="small" />
						)}
					</IconButton>
				</Styled.CreateTagInputRow>
				<Styled.ColorSwatchRow>
					{TAG_COLOR_PALETTE.map((swatch) => (
						<Styled.ColorSwatch
							key={swatch}
							type="button"
							$color={swatch}
							$isSelected={swatch === color}
							onClick={() => setColor(swatch)}
							aria-label={swatch}
						/>
					))}
				</Styled.ColorSwatchRow>
			</Styled.CreateTagForm>
		);
	}
);

CreateTagControl.displayName = 'CreateTagControl';

export default CreateTagControl;
