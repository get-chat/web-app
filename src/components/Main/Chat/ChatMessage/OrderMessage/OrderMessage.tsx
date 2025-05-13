import React from 'react';
import { Trans } from 'react-i18next';
import { Title, List, Item } from './OrderMessage.styles';
import { Message } from '@src/types/messages';

interface Props {
	data: Message;
}

const OrderMessage: React.FC<Props> = ({ data }) => {
	const { catalog_id, text, product_items } = data.waba_payload?.order;

	return (
		<>
			<Title>
				<Trans
					values={{
						postProcess: 'sprintf',
						sprintf: [catalog_id],
					}}
				>
					<b>Catalog ID</b>: %s
				</Trans>
			</Title>

			<List>
				{product_items.map(
					// @ts-ignore
					({ product_retailer_id, item_price, quantity, currency }) => (
						<Item key={product_retailer_id}>
							<div>
								<Trans
									values={{
										postProcess: 'sprintf',
										sprintf: [product_retailer_id],
									}}
								>
									<b>Product retailer ID</b>: %s
								</Trans>
							</div>
							<div>
								<Trans
									values={{
										postProcess: 'sprintf',
										sprintf: [quantity],
									}}
								>
									<b>Quantity</b>: %d
								</Trans>
							</div>
							<div>
								<Trans
									values={{
										postProcess: 'sprintf',
										sprintf: [item_price, currency],
									}}
								>
									<b>Price</b>: %d %s
								</Trans>
							</div>
						</Item>
					)
				)}
			</List>
			<p>{text}</p>
		</>
	);
};

export default React.memo(OrderMessage);
