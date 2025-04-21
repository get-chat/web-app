import React, { useState } from 'react';
import Recipient from '@src/interfaces/Recipient';
import { useTranslation } from 'react-i18next';
import ContactProviderHeader from '@src/components/ContactProviderHeader';
import * as Styled from './RecipientItem.styles';

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

	const handleClick = () => {
		if (isSelectionModeEnabled) {
			onSelect?.(data);
			return;
		}

		if (data.phoneNumbers && data.phoneNumbers.length > 0) {
			if (data.phoneNumbers.length === 1) {
				const phoneNumber = data.phoneNumbers[0].phoneNumber;
				goToChat(phoneNumber);
			} else {
				setPhoneNumbersVisible((prevState) => !prevState);
			}
		} else {
			// @ts-ignore
			window.displayCustomError('This contact has no phone number.');
		}
	};

	const goToChat = (phoneNumber?: string) => {
		verifyPhoneNumber?.(phoneNumber ?? '', data);
	};

	return (
		<Styled.Wrapper>
			<Styled.StyledListItemButton onClick={handleClick}>
				<Styled.Container>
					{isSelectionModeEnabled && (
						<Styled.SelectionCheckbox checked={isSelected} color="primary" />
					)}

					<Styled.AvatarWrapper>
						<Styled.StyledCustomAvatar
							src={data.avatar}
							generateBgColorBy={data.name}
						>
							{data.initials}
						</Styled.StyledCustomAvatar>

						{data.provider !== undefined && (
							<ContactProviderHeader type={data.provider} />
						)}
					</Styled.AvatarWrapper>

					<Styled.Info>
						<Styled.Name>{data.name}</Styled.Name>

						{data.phoneNumbers?.length > 0 ? (
							<Styled.PhoneNumber>
								{data.phoneNumbers[0]?.phoneNumber}
							</Styled.PhoneNumber>
						) : (
							<Styled.MissingPhoneNumber>
								{t('There is no phone number')}
							</Styled.MissingPhoneNumber>
						)}
					</Styled.Info>
				</Styled.Container>
			</Styled.StyledListItemButton>

			{!isSelectionModeEnabled && isPhoneNumbersVisible && (
				<Styled.PhoneNumbersContainer>
					<Styled.PhoneNumbersTitle>
						{t('Choose a phone number')}
					</Styled.PhoneNumbersTitle>
					{data.phoneNumbers?.map((phoneNumber, index) => (
						<Styled.Choice
							key={index}
							onClick={() => goToChat(phoneNumber.phoneNumber)}
						>
							{phoneNumber.phoneNumber}
						</Styled.Choice>
					))}
				</Styled.PhoneNumbersContainer>
			)}
		</Styled.Wrapper>
	);
};

export default RecipientItem;
