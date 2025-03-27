import React from 'react';

import TouchAppIcon from '@mui/icons-material/TouchApp';
import { useTranslation } from 'react-i18next';

import ButtonsMessage from './components/ButtonsMessage';
import ListMessage from './components/ListMessage';
import ProductMessage from './components/ProductMessage';

import styles from './InteractiveMessage.module.css';
import { Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PrintMessage from '@src/components/PrintMessage';
import CtaUrlMessage from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/CtaUrlMessage/CtaUrlMessage';
import AddressMessage from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/AddressMessage';
import FlowMessage from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/FlowMessage';
import NfmReply from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/NfmReply';
import CatalogMessage from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/CatalogMessage';
import { Message } from '@src/types/messages';

export enum InteractiveMessageTypes {
	list_reply = 'list_reply',
	button = 'button',
	list = 'list',
	product = 'product',
	product_list = 'product_list',
	location_request_message = 'location_request_message',
	cta_url = 'cta_url',
	address_message = 'address_message',
	flow = 'flow',
	nfm_reply = 'nfm_reply',
	catalog_message = 'catalog_message',
}

interface Props {
	data: Message;
}

const InteractiveMessage: React.FC<Props> = ({ data }) => {
	const { t } = useTranslation();
	const { body, action, type, nfm_reply } =
		data?.waba_payload?.interactive ?? {};
	const interactive = data?.waba_payload?.interactive;

	return (
		<>
			<div className={styles.caption}>
				<TouchAppIcon /> {t('Interactive message')}
			</div>

			{type === InteractiveMessageTypes.list_reply && (
				<div>
					<div>{data.waba_payload?.interactive?.list_reply.title}</div>
					<div style={{ opacity: 0.5, fontSize: '0.8em' }}>
						{data.waba_payload?.interactive?.list_reply.description}
					</div>
				</div>
			)}

			{type === InteractiveMessageTypes.button && (
				<ButtonsMessage interactive={interactive} />
			)}

			{type === InteractiveMessageTypes.list && (
				<ListMessage interactive={interactive} />
			)}

			{(type === InteractiveMessageTypes.product ||
				type === InteractiveMessageTypes.product_list) && (
				<ProductMessage interactive={interactive} />
			)}

			{type === InteractiveMessageTypes.cta_url && (
				<CtaUrlMessage interactive={interactive} />
			)}

			{type === InteractiveMessageTypes.address_message && (
				<AddressMessage interactive={interactive} />
			)}

			{type === InteractiveMessageTypes.address_message && (
				<AddressMessage interactive={interactive} />
			)}

			{type === InteractiveMessageTypes.flow && (
				<FlowMessage interactive={interactive} />
			)}

			{type === InteractiveMessageTypes.catalog_message && (
				<CatalogMessage interactive={interactive} />
			)}

			{type === InteractiveMessageTypes.location_request_message && (
				<>
					{body && (
						<div className={styles.body}>
							<PrintMessage linkify message={body.text} />
						</div>
					)}
					{action?.name === 'send_location' && (
						<Button
							variant="text"
							fullWidth
							startIcon={<LocationOnIcon />}
							disabled
						>
							Send location
						</Button>
					)}
				</>
			)}

			{type === InteractiveMessageTypes.nfm_reply && (
				<NfmReply data={nfm_reply} />
			)}
		</>
	);
};

export default InteractiveMessage;
