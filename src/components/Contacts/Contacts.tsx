import React from 'react';
import useContacts from '@src/components/Contacts/useContacts';
import SearchBar from '@src/components/SearchBar';
import RecipientItem from '@src/components/RecipientItem';
import Recipient from '@src/api/models/interfaces/Recipient';
import { CircularProgress } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

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
		<div>
			<SearchBar
				value={keyword}
				onChange={setKeyword}
				isLoading={isLoading}
				placeholder={t('Search for contacts')}
			/>

			<div className="contacts__body">
				{!isLoading && unifiedList.length === 0 && noContactsContent ? (
					<>{noContactsContent}</>
				) : (
					<>
						{unifiedList.map((item, index) => (
							<RecipientItem
								key={index}
								data={item}
								verifyPhoneNumber={(phoneNumber: string, data: Recipient) =>
									verifyContact?.(phoneNumber, data)
								}
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
					<div className="contacts__body__loading">
						<CircularProgress color="inherit" />
					</div>
				)}

				{!isLoading && keyword?.length > 0 && unifiedList.length === 0 && (
					<span className="contacts__body__hint">
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
		</div>
	);
};

export default Contacts;
