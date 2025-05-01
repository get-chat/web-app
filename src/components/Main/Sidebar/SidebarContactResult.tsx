import React from 'react';
import '../../../styles/SidebarContactResult.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CustomAvatar from '@src/components/CustomAvatar';
import { Chat } from '@src/types/chats';
import { getChatContactName } from '@src/helpers/ChatHelper';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { Person } from '@src/types/persons';

interface Props {
	contactData: Person | undefined;
	chatData?: Chat;
}

const SidebarContactResult: React.FC<Props> = ({ contactData, chatData }) => {
	const { t } = useTranslation();

	return (
		<Link to={''}>
			<div id={contactData?.wa_id}>
				<CustomAvatar generateBgColorBy={getChatContactName(chatData)}>
					{generateInitialsHelper(getChatContactName(chatData))}
				</CustomAvatar>
				<div className="sidebarContactResult__info">
					<h2>{getChatContactName(chatData)}</h2>
					<p className="sidebarContactResult__info__status">{t('Status')}</p>
				</div>
			</div>
		</Link>
	);
};

export default SidebarContactResult;
