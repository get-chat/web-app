import React from 'react';
import '../../../styles/SidebarContactResult.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CustomAvatar from '@src/components/CustomAvatar';
import PersonModel from '@src/api/models/PersonModel';
import ChatModel from '@src/api/models/ChatModel';

interface Props {
	contactData: PersonModel | undefined;
	chatData?: ChatModel;
}

const SidebarContactResult: React.FC<Props> = ({ contactData, chatData }) => {
	const { t } = useTranslation();

	return (
		<Link to={''}>
			<div id={contactData?.waId}>
				<CustomAvatar generateBgColorBy={chatData?.name}>
					{chatData?.initials}
				</CustomAvatar>
				<div className="sidebarContactResult__info">
					<h2>{chatData?.name}</h2>
					<p className="sidebarContactResult__info__status">{t('Status')}</p>
				</div>
			</div>
		</Link>
	);
};

export default SidebarContactResult;
