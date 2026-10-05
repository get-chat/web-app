import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContactProviderHeader from '@src/components/ContactProviderHeader';
import CustomAvatar from '@src/components/CustomAvatar';
import { Checkbox } from '@src/components/ui/checkbox';
import { Recipient } from '@src/types/persons';
import { useIsUserActionsRestricted } from '@src/hooks/useIsUserActionsRestricted';

interface Props {
	data: Recipient;
	verifyPhoneNumber?: (phoneNumber: string, data: Recipient) => void;
	isSelectionModeEnabled?: boolean;
	isSelected?: boolean;
	onSelect?: (recipient: Recipient) => void;
}

const RecipientItem: React.FC<Props> = ({
	data,
	verifyPhoneNumber,
	isSelectionModeEnabled = false,
	isSelected = false,
	onSelect,
}) => {
	const [isPhoneNumbersVisible, setPhoneNumbersVisible] = useState(false);
	const { t } = useTranslation();
	const isUserActionsRestricted = useIsUserActionsRestricted();

	const handleClick = () => {
		if (isSelectionModeEnabled) {
			onSelect?.(data);
			return;
		}

		if (data.phone_numbers && data.phone_numbers.length > 0) {
			if (data.phone_numbers.length === 1) {
				const phoneNumber = data.phone_numbers[0].phone_number;
				goToChat(phoneNumber);
			} else {
				setPhoneNumbersVisible((prevState) => !prevState);
			}
		} else {
			window.displayCustomError('This contact has no phone number.');
		}
	};

	const goToChat = (phoneNumber?: string) => {
		verifyPhoneNumber?.(phoneNumber ?? '', data);
	};

	return (
		<div className="bg-white">
			{/* A div, not a button: the selection checkbox inside is a button */}
			<div
				role="button"
				className="relative m-0 flex min-w-0 cursor-pointer items-center p-0 text-left outline-none! transition-[background-color] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-black/4 focus-visible:bg-black/12"
				tabIndex={0}
				onClick={handleClick}
				onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
					// Only for the row itself, the checkbox handles its own keys
					if (
						event.target === event.currentTarget &&
						(event.key === 'Enter' || event.key === ' ')
					) {
						event.preventDefault();
						handleClick();
					}
				}}
			>
				<div className="flex flex-1 cursor-pointer items-center px-3.75 py-2.5">
					{isSelectionModeEnabled && (
						// The margins keep the room MUI's padded checkbox took
						<Checkbox className="mx-3" checked={isSelected} color="primary" />
					)}

					<div className="relative">
						<CustomAvatar
							className="size-12.5 self-baseline"
							src={data.avatar}
							generateBgColorBy={data.name}
						>
							{data.initials}
						</CustomAvatar>

						{data.provider !== undefined && (
							<ContactProviderHeader type={data.provider} />
						)}
					</div>

					<div className="ml-3.75 flex flex-1 flex-col">
						<div className="text-[14px] font-semibold">{data.name}</div>

						{!(data.phone_numbers?.length > 0) && (
							<div className="text-[12px] text-ink/40">
								{t('There is no phone number')}
							</div>
						)}
						{data.phone_numbers?.length > 0 && !isUserActionsRestricted && (
							<div className="text-[14px] text-primary">
								{data.phone_numbers[0]?.phone_number}
							</div>
						)}
					</div>
				</div>
			</div>

			{!isSelectionModeEnabled && isPhoneNumbersVisible && (
				<div className="bg-(--color-primary-transparent) px-3.75 py-2.5">
					<div className="text-[12px] text-primary">
						{t('Choose a phone number')}
					</div>
					{!isUserActionsRestricted &&
						data.phone_numbers?.map((phoneNumber, index) => (
							<div
								className="mt-1.25 mr-2.5 inline-block cursor-pointer rounded-[15px] bg-white px-2.5 py-1.25 text-[14px] text-primary shadow-[0_4px_5px_-6px_rgba(0,0,45,0.4)] transition-shadow duration-300 ease-[ease] hover:shadow-[0_4px_10px_-6px_rgba(0,0,45,0.4)]"
								key={index}
								onClick={() => goToChat(phoneNumber.phone_number)}
							>
								{phoneNumber.phone_number}
							</div>
						))}
				</div>
			)}
		</div>
	);
};

export default RecipientItem;
