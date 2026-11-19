import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@src/components/ui/button';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@src/components/ui/dialog';

interface Props {
	open: boolean;
	title: string;
	description: string;
	confirmLabel: string;
	isDestructive?: boolean;
	onConfirm: () => Promise<unknown> | void;
	onClose: () => void;
}

/** Asks before a group action that cannot be taken back */
const ConfirmDialog: React.FC<Props> = ({
	open,
	title,
	description,
	confirmLabel,
	isDestructive = false,
	onConfirm,
	onClose,
}) => {
	const { t } = useTranslation();
	const [isBusy, setBusy] = useState(false);

	const confirm = async () => {
		setBusy(true);
		try {
			await onConfirm();
		} finally {
			setBusy(false);
			onClose();
		}
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent size="xs">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<DialogDescription className="text-[14px]">
						{description}
					</DialogDescription>
				</DialogBody>
				<DialogFooter>
					<Button variant="ghost" color="neutral" onClick={onClose}>
						{t('Cancel')}
					</Button>
					<Button
						variant="solid"
						color={isDestructive ? 'destructive' : 'primary'}
						loading={isBusy}
						onClick={confirm}
					>
						{confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmDialog;
