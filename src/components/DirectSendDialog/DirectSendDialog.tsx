import React from 'react';
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
import { Alert } from '@src/components/ui/alert';
import CheckIcon from '@src/components/icons/Check';
import CloseIcon from '@src/components/icons/Close';

interface Props {
	open: boolean;
	onCancel: () => void;
	onContinue: () => void;
}

const ALLOWED = [
	'Order, delivery and booking updates',
	'Payment, account and security notices',
	'Answers to something the customer asked for',
];

const NOT_ALLOWED = [
	'Offers, discounts and promotions',
	'Newsletters and announcements',
	'Asking the customer to buy or come back',
];

/**
 * Explains utility messages (Direct Send) once, before the composer first
 * switches to them: Meta reviews their content, and promotional messages
 * get Direct Send suspended for the whole inbox.
 */
const DirectSendDialog: React.FC<Props> = ({ open, onCancel, onContinue }) => {
	const { t } = useTranslation();

	const renderList = (items: string[], isAllowed: boolean) => (
		<div className="flex-1 rounded-[12px] bg-ink/[0.03] p-3.75">
			<div className="mb-2 text-[12px] font-semibold text-ink/75">
				{isAllowed ? t('Utility') : t('Not utility')}
			</div>
			<ul className="flex flex-col gap-1.5">
				{items.map((item) => (
					<li key={item} className="flex items-start gap-2 text-[13px]">
						{isAllowed ? (
							<CheckIcon className="mt-px size-4! shrink-0 text-success!" />
						) : (
							<CloseIcon className="mt-px size-4! shrink-0 text-destructive!" />
						)}
						<span>{t(item)}</span>
					</li>
				))}
			</ul>
		</div>
	);

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t('Send a utility message')}</DialogTitle>
				</DialogHeader>

				<DialogBody className="flex flex-col gap-3.75">
					<DialogDescription>
						{t(
							'The customer care window is closed, but you can still send a utility message: an update about something the customer did or asked for. No template is needed, WhatsApp creates one from your text.'
						)}
					</DialogDescription>

					<div className="flex gap-2.5 max-md:flex-col">
						{renderList(ALLOWED, true)}
						{renderList(NOT_ALLOWED, false)}
					</div>

					<Alert severity="warning">
						{t(
							'WhatsApp reviews utility messages. Promotional content can get them suspended for this whole inbox. Each one is billed at the utility rate.'
						)}
					</Alert>
				</DialogBody>

				<DialogFooter>
					<Button variant="ghost" color="secondary" onClick={onCancel}>
						{t('Cancel')}
					</Button>
					<Button
						variant="ghost"
						color="primary"
						onClick={onContinue}
						data-test-id="direct-send-continue-button"
					>
						{t('Continue')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DirectSendDialog;
