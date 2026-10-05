import {
	forwardRef,
	KeyboardEvent,
	ReactNode,
	useEffect,
	useRef,
	useState,
} from 'react';
import AddIcon from '@src/components/icons/Add';
import { useTranslation } from 'react-i18next';
import { Tag } from '@src/types/tags';
import { Button } from '@src/components/ui/button';
import { Input } from '@src/components/ui/input';
import { Spinner } from '@src/components/ui/spinner';
import { cn } from '@src/lib/utils';

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
	// A dropdown menu uses keydown for typeahead and arrow-key navigation;
	// stop it there when the form is inside one.
	stopMenuKeyDownPropagation?: boolean;
}

const CreateTagControl = forwardRef<HTMLDivElement, Props>(
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
			<div
				ref={ref}
				className="flex min-w-60 flex-col gap-2 px-3 pt-1.5 pb-2.5"
				// Lets a menu around the form tell that a key was pressed in it
				data-slot="create-tag-form"
				onKeyDown={
					stopMenuKeyDownPropagation
						? (event: KeyboardEvent) => event.stopPropagation()
						: undefined
				}
			>
				<div className="flex items-center gap-1.5">
					<Input
						ref={inputRef}
						value={name}
						onChange={(event) => setName(event.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={t('Tag name')}
						size="sm"
						disabled={isSaving}
					/>
					<Button
						variant="ghost"
						color="primary"
						size="icon-sm"
						onClick={handleCreate}
						disabled={!name.trim() || isSaving}
						aria-label={t('Create tag')}
					>
						{isSaving ? (
							<Spinner size={16} className="text-primary" />
						) : (
							<AddIcon fontSize="small" />
						)}
					</Button>
				</div>
				<div className="flex flex-wrap items-center gap-1.5">
					{TAG_COLOR_PALETTE.map((swatch) => (
						<button
							key={swatch}
							type="button"
							className={cn(
								'size-5 cursor-pointer rounded-full border-2 p-0 shadow-[0_0_0_1px_rgba(0,0,0,0.15)] transition-transform duration-100 ease-in-out hover:scale-110',
								swatch === color ? 'border-foreground' : 'border-transparent'
							)}
							style={{ backgroundColor: swatch }}
							onClick={() => setColor(swatch)}
							aria-label={swatch}
						/>
					))}
				</div>
			</div>
		);
	}
);

CreateTagControl.displayName = 'CreateTagControl';

export default CreateTagControl;
