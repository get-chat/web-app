import React from 'react';
import TouchAppIcon from '@src/components/icons/TouchApp';
import ReceiptLongIcon from '@src/components/icons/ReceiptLong';
import { isDirectSendMessage } from '@src/helpers/MessageHelper';
import { useTranslation } from 'react-i18next';
import ButtonsMessage from './components/ButtonsMessage';
import ListMessage from './components/ListMessage';
import ProductMessage from './components/ProductMessage';
import LocationOnIcon from '@src/components/icons/LocationOn';
import PrintMessage from '@src/components/PrintMessage';
import CtaUrlMessage from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/CtaUrlMessage/CtaUrlMessage';
import AddressMessage from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/AddressMessage';
import FlowMessage from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/FlowMessage';
import NfmReply from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/NfmReply';
import CatalogMessage from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/CatalogMessage';
import CarouselMessage from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/CarouselMessage';
import InteractiveMessageButton from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageButton';
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
	carousel = 'carousel',
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
			<div className="mb-1.25 flex items-center gap-1.25 text-[length:x-small] text-ink/60">
				{isDirectSendMessage(data) ? (
					<>
						<ReceiptLongIcon className="size-[0.6em]! text-ink/40!" />{' '}
						{t('Utility message')}
					</>
				) : (
					<>
						<TouchAppIcon className="size-[0.6em]! text-ink/40!" />{' '}
						{t('Interactive message')}
					</>
				)}
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

			{type === InteractiveMessageTypes.carousel && (
				<CarouselMessage interactive={interactive} />
			)}

			{type === InteractiveMessageTypes.location_request_message && (
				<>
					{body && (
						<div className="font-normal">
							<PrintMessage linkify message={body.text} />
						</div>
					)}
					{action?.name === 'send_location' && (
						<InteractiveMessageButton disabled>
							<LocationOnIcon />
							Send location
						</InteractiveMessageButton>
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
