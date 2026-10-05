import React from 'react';
import useContacts from '@src/components/Contacts/useContacts';
import SearchBar from '@src/components/SearchBar/SearchBar';
import RecipientItem from '@src/components/RecipientItem';
import { Spinner } from '@src/components/ui/spinner';
import { Trans, useTranslation } from 'react-i18next';
import { Recipient } from '@src/types/persons';

interface Props {
	isSelectionModeEnabled?: boolean;
	onSelect?: (recipient: Recipient) => void;
	selectedContacts?: Recipient[];
	verifyContact?: (phoneNumber: string, data: Recipient) => void;
	isVerifying?: boolean;
	noContactsContent?: JSX.Element;
}

const Contacts: React.FC<Props> = ({
	isSelectionModeEnabled = false,
	onSelect,
	selectedContacts,
	verifyContact,
	isVerifying = false,
	noContactsContent,
}) => {
	const { keyword, setKeyword, isLoading, unifiedList } = useContacts();

	const { t } = useTranslation();

	return (
		<>
			<SearchBar
				value={keyword}
				onChange={setKeyword}
				isLoading={isLoading}
				placeholder={t('Search for contacts')}
			/>

			<div className="relative flex-1 overflow-x-hidden overflow-y-auto">
				{!isLoading && unifiedList.length === 0 && noContactsContent ? (
					<>{noContactsContent}</>
				) : (
					<>
						{unifiedList.map((item, index) => (
							<RecipientItem
								key={index}
								data={item}
								verifyPhoneNumber={(phoneNumber: string, data: Recipient) => {
									verifyContact?.(phoneNumber, data);
								}}
								isSelectionModeEnabled={isSelectionModeEnabled}
								isSelected={Boolean(
									selectedContacts?.find(
										(recipient) => recipient.name === item.name
									)
								)}
								onSelect={onSelect}
							/>
						))}
					</>
				)}

				{isVerifying && (
					<div className="absolute inset-0 flex items-center justify-center bg-white/50 text-primary">
						<Spinner size={40} />
					</div>
				)}

				{!isLoading && keyword?.length > 0 && unifiedList.length === 0 && (
					<span className="block px-3.75 py-2.5 text-[14px] text-ink/60">
						<Trans
							values={{
								postProcess: 'sprintf',
								sprintf: [keyword],
							}}
						>
							No persons or contacts found for{' '}
							<span className="searchOccurrence">%s</span>
						</Trans>
					</span>
				)}
			</div>
		</>
	);
};

export default Contacts;
