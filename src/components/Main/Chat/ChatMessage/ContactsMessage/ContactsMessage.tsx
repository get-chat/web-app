import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { prepareWaId } from '@src/helpers/PhoneNumberHelper';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { Message } from '@src/types/messages';
import * as Styled from './ContactsMessage.styles';

interface Props {
	data: Message;
}

const ContactsMessage: React.FC<Props> = ({ data }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const contacts = data?.waba_payload?.contacts;

	const handleClick = (targetWaId: string) => {
		const waId = prepareWaId(targetWaId);
		navigate(`/main/chat/${waId}${location.search}`);
	};

	return (
		<Styled.Root>
			{contacts?.map((contact: any, contactIndex: number) => (
				<Styled.Item key={contactIndex}>
					<Styled.Header>
						<>
							<Styled.Avatar generateBgColorBy={contact.name?.formatted_name}>
								{generateInitialsHelper(contact.name?.formatted_name ?? '')}
							</Styled.Avatar>
							<Styled.Name key={contactIndex}>
								{contact.name?.formatted_name ?? ''}
							</Styled.Name>
						</>
					</Styled.Header>
					<Styled.Footer>
						{contact.phones?.map((phoneObj: any, phoneObjIndex: number) => (
							<Styled.MessageButton
								key={phoneObjIndex}
								onClick={() => handleClick(phoneObj.wa_id)}
							>
								<Styled.MessageButtonIcon />
								<Styled.PhoneNumberContainer>
									{phoneObj?.type && (
										<Styled.PhoneNumberType>
											{phoneObj.type}
										</Styled.PhoneNumberType>
									)}
									<Styled.PhoneNumber>
										{phoneObj.phone ?? phoneObj.wa_id}
									</Styled.PhoneNumber>
								</Styled.PhoneNumberContainer>
							</Styled.MessageButton>
						))}
					</Styled.Footer>
				</Styled.Item>
			))}
		</Styled.Root>
	);
};

export default ContactsMessage;
