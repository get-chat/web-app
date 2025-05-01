import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContactProviderHeader from '@src/components/ContactProviderHeader';
import * as Styled from './RecipientItem.styles';
import { Recipient } from '@src/types/persons';

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

		if (data.phone_numbers && data.phone_numbers.length > 0) {
			if (data.phone_numbers.length === 1) {
				const phoneNumber = data.phone_numbers[0].phone_number;
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

						{data.phone_numbers?.length > 0 ? (
							<Styled.PhoneNumber>
								{data.phone_numbers[0]?.phone_number}
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
					{data.phone_numbers?.map((phoneNumber, index) => (
						<Styled.Choice
							key={index}
							onClick={() => goToChat(phoneNumber.phone_number)}
						>
							{phoneNumber.phone_number}
						</Styled.Choice>
					))}
				</Styled.PhoneNumbersContainer>
			)}
		</Styled.Wrapper>
	);
};

export default RecipientItem;
