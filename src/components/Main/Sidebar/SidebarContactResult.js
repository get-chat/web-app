import React from 'react';
import '../../../styles/SidebarContactResult.css';
import { Link } from 'react-router-dom';
import { Avatar } from '@material-ui/core';
import { generateAvatarColor } from '../../../helpers/AvatarHelper';
import { useTranslation } from 'react-i18next';

function SidebarContactResult(props) {
	const { t, i18n } = useTranslation();

	const data = props.contactData;

	return (
		<Link>
			<div id={data.waId}>
				<Avatar
					style={{
						backgroundColor: generateAvatarColor(props.chatData.name),
					}}
				>
					{props.chatData.initials}
				</Avatar>
				<div className="sidebarContactResult__info">
					<h2>{props.chatData.name}</h2>
					<p className="sidebarContactResult__info__status">{t('Status')}</p>
				</div>
			</div>
		</Link>
	);
}

export default SidebarContactResult;
