import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GroupAddIcon from '@src/components/icons/GroupAdd';
import { SimpleTooltip } from '@src/components/ui/tooltip';
import { cn } from '@src/lib/utils';
import { fetchWhatsAppGroupEligibility } from '@src/api/whatsappGroupsApi';
import { WhatsAppGroupEligibility } from '@src/types/whatsappGroups';
import {
	WHATSAPP_GROUP_MAX_PARTICIPANTS,
	getEligibilityReasonText,
} from '@src/helpers/WhatsAppGroupHelper';
import CreateGroupDialog from './CreateGroupDialog';

interface Props {
	/** The group exists: open its chat */
	onCreated: (waId: string) => void;
	className?: string;
}

/**
 * "Create new group", where new chats are started. Always shown; when the
 * number cannot have groups it is disabled and says why.
 */
const CreateGroupEntry: React.FC<Props> = ({ onCreated, className }) => {
	const { t } = useTranslation();

	const [eligibility, setEligibility] = useState<WhatsAppGroupEligibility>();
	const [isDialogOpen, setDialogOpen] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		fetchWhatsAppGroupEligibility(controller.signal)
			.then(setEligibility)
			.catch((error) => {
				// Unknown: let WhatsApp decide when the group is created
				if (!controller.signal.aborted) {
					console.error(error);
					setEligibility({ eligible: true, reason: null });
				}
			});
		return () => controller.abort();
	}, []);

	const isLoading = eligibility === undefined;
	const isDisabled = isLoading || !eligibility.eligible;
	const reason = eligibility?.eligible
		? undefined
		: getEligibilityReasonText(eligibility?.reason, t) ??
		  (eligibility
				? t('Groups are not available for this number.')
				: undefined);

	return (
		<>
			<SimpleTooltip title={reason} side="bottom" disableHoverableContent>
				{/* The tooltip needs an element that gets hover while disabled */}
				<div
					className={cn(
						'bg-(--color-primary-transparent)',
						isDisabled && 'cursor-not-allowed',
						className
					)}
				>
					<button
						type="button"
						className="relative flex w-full cursor-pointer items-center gap-2.5 border-0 bg-transparent px-3.75 py-3.5 text-left text-[14px] text-primary transition-[background-color] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] outline-none! hover:bg-(--color-primary-transparent-darker) focus-visible:bg-(--color-primary-transparent-darker) disabled:pointer-events-none disabled:opacity-55 [&_.app-icon]:size-[1.1em]! [&_.app-icon]:text-primary!"
						disabled={isDisabled}
						onClick={() => setDialogOpen(true)}
						data-test-id="create-group"
					>
						<GroupAddIcon />
						<span className="flex min-w-0 flex-col">
							<span>{t('Create new group')}</span>
							<span className="text-[12px] text-ink/55">
								{reason ??
									t(
										'Up to %d participants, invited with a link',
										WHATSAPP_GROUP_MAX_PARTICIPANTS
									)}
							</span>
						</span>
					</button>
				</div>
			</SimpleTooltip>

			<CreateGroupDialog
				open={isDialogOpen}
				onClose={() => setDialogOpen(false)}
				onCreated={(waId) => {
					setDialogOpen(false);
					onCreated(waId);
				}}
			/>
		</>
	);
};

export default CreateGroupEntry;
