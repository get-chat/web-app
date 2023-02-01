import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ButtonBase } from '@mui/material';

import styles from './ContactsMessage.module.css';
import { prepareWaId } from '@src/helpers/PhoneNumberHelper';
import CustomAvatar from '@src/components/CustomAvatar';
import ChatIcon from '@mui/icons-material/Chat';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { generateAvatarColor } from '@src/helpers/AvatarHelper';

const ContactsMessage = ({ data }) => {
	const navigate = useNavigate();
	const { contacts } = data?.payload || data?.resendPayload;

	const handleClick = (targetWaId) => {
		const waId = prepareWaId(targetWaId);
		navigate(`/main/chat/${waId}`);
	};

	return (
		<div className={styles.root}>
			{contacts?.map((contact, contactIndex) => (
				<div key={contactIndex} className={styles.item}>
					<div className={styles.header}>
						<>
							<CustomAvatar
								className={styles.avatar}
								style={{
									backgroundColor: generateAvatarColor(
										contact.name.formatted_name
									),
								}}
							>
								{generateInitialsHelper(contact.name.formatted_name)}
							</CustomAvatar>
							<div key={contactIndex} className={styles.name}>
								{contact.name.formatted_name}
							</div>
						</>
					</div>
					<div className={styles.footer}>
						{contact.phones?.map((phoneObj, phoneObjIndex) => (
							<>
								<ButtonBase
									key={phoneObjIndex}
									className={styles.messageButton}
									onClick={() => handleClick(phoneObj.wa_id)}
								>
									<ChatIcon className={styles.messageButtonIcon} />
									<div className={styles.phoneNumberContainer}>
										{phoneObj?.type && (
											<div className={styles.phoneNumberType}>
												{phoneObj.type}
											</div>
										)}
										<div className={styles.phoneNumber}>
											{phoneObj.phone ?? phoneObj.wa_id}
										</div>
									</div>
								</ButtonBase>
								<ButtonBase
									key={phoneObjIndex}
									className={styles.messageButton}
									onClick={() => handleClick(phoneObj.wa_id)}
								>
									<ChatIcon className={styles.messageButtonIcon} />
									<div className={styles.phoneNumberContainer}>
										{phoneObj?.type && (
											<div className={styles.phoneNumberType}>
												{phoneObj.type}
											</div>
										)}
										<div className={styles.phoneNumber}>
											{phoneObj.phone ?? phoneObj.wa_id}
										</div>
									</div>
								</ButtonBase>
							</>
						))}
					</div>
				</div>
			))}
		</div>
	);
};

export default ContactsMessage;
