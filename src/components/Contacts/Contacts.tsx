import React from 'react';
import useContacts from '@src/components/Contacts/useContacts';
import SearchBar from '@src/components/SearchBar/SearchBar';
import RecipientItem from '@src/components/RecipientItem';
import { CircularProgress } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import * as Styled from './Contacts.styles';
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

			<Styled.ContactsBody>
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
					<Styled.BodyLoading>
						<CircularProgress color="inherit" />
					</Styled.BodyLoading>
				)}

				{!isLoading && keyword?.length > 0 && unifiedList.length === 0 && (
					<Styled.BodyHint>
						<Trans
							values={{
								postProcess: 'sprintf',
								sprintf: [keyword],
							}}
						>
							No persons or contacts found for{' '}
							<span className="searchOccurrence">%s</span>
						</Trans>
					</Styled.BodyHint>
				)}
			</Styled.ContactsBody>
		</>
	);
};

export default Contacts;
