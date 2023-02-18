import React from 'react';
import '../../../styles/SidebarContactResult.css';
import { Link } from 'react-router-dom';
import { generateAvatarColor } from '@src/helpers/AvatarHelper';
import { useTranslation } from 'react-i18next';
import CustomAvatar from '@src/components/CustomAvatar';

function SidebarContactResult(props) {
	const { t } = useTranslation();

	const data = props.contactData;

	return (
		<Link>
			<div id={data.waId}>
				<CustomAvatar
					style={{
						backgroundColor: generateAvatarColor(props.chatData.name),
					}}
				>
					{props.chatData.initials}
				</CustomAvatar>
				<div className="sidebarContactResult__info">
					<h2>{props.chatData.name}</h2>
					<p className="sidebarContactResult__info__status">{t('Status')}</p>
				</div>
			</div>
		</Link>
	);
}

export default SidebarContactResult;
