// @ts-nocheck
import React from 'react';

import TouchAppIcon from '@mui/icons-material/TouchApp';
import { useTranslation } from 'react-i18next';

import ButtonsMessage from './components/ButtonsMessage';
import ListMessage from './components/ListMessage';
import ProductMessage from './components/ProductMessage';

import styles from './InteractiveMessage.module.css';

const InteractiveMessage = ({ data }) => {
	const { t } = useTranslation();
	const { header, body, footer, action, type } = data.payload.interactive;

	return (
		<>
			<div className={styles.caption}>
				<TouchAppIcon /> {t('Interactive message')}
			</div>

			{/* TODO: FIXME: i don't know where right place in current architecture, but it works */}
			{data.payload.interactive.type === 'list_reply' && (
				<div>
					<div>{data.payload.interactive.list_reply.title}</div>
					<div style={{ opacity: 0.5, fontSize: '0.8em' }}>
						{data.payload.interactive.list_reply.description}
					</div>
				</div>
			)}

			{type === 'button' && (
				<ButtonsMessage
					header={header}
					body={body}
					footer={footer}
					action={action}
				/>
			)}

			{type === 'list' && (
				<ListMessage
					header={header}
					body={body}
					footer={footer}
					action={action}
				/>
			)}

			{(type === 'product' || type === 'product_list') && (
				<ProductMessage
					header={header}
					body={body}
					footer={footer}
					action={action}
				/>
			)}

			{type === 'location_request_message' && (
				<>
					<div>{body?.text}</div>
				</>
			)}
		</>
	);
};

export default InteractiveMessage;
