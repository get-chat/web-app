import React, { useState } from 'react';
import Recipient from '@src/api/models/interfaces/Recipient';
import styles from './RecipientItem.module.css';
import CustomAvatar from '@src/components/CustomAvatar';
import { ListItemButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Props {
	data: Recipient;
	verifyPhoneNumber: (phoneNumber: string, data: Recipient) => void;
}

const RecipientItem: React.FC<Props> = ({ data, verifyPhoneNumber }) => {
	const [isPhoneNumbersVisible, setPhoneNumbersVisible] = useState(false);

	const { t } = useTranslation();

	const handleClick = () => {
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
		verifyPhoneNumber(phoneNumber ?? '', data);
	};

	return (
		<div className={styles.wrapper}>
			<ListItemButton className={styles.listItem} onClick={handleClick}>
				<div className={styles.container}>
					<div className={styles.avatarWrapper}>
						<CustomAvatar src={data.avatar} generateBgColorBy={data.name}>
							{data.initials}
						</CustomAvatar>
					</div>
					<div className={styles.info}>
						<div className={styles.name}>{data.name}</div>
						<div className={styles.phoneNumber}>
							{data.phoneNumbers[0]?.phoneNumber}
						</div>
					</div>
				</div>
			</ListItemButton>

			{isPhoneNumbersVisible && (
				<div className={styles.phoneNumbers}>
					<div>{t('Choose a phone number')}</div>
					{Object.entries(data.phoneNumbers).map((phoneNumber) => (
						<div
							key={phoneNumber[0]}
							className={styles.choice}
							onClick={() => goToChat(phoneNumber[1].phoneNumber)}
						>
							{phoneNumber[1].phoneNumber}
							{phoneNumber[1].phoneNumber}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default RecipientItem;
