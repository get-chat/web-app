import React, { memo } from 'react';
import { Trans } from 'react-i18next';
import { Message } from '@src/types/messages';

interface Props {
	data: Message;
}

const OrderMessage: React.FC<Props> = ({ data }) => {
	const { catalog_id, text, product_items } = data.waba_payload?.order;

	return (
		<>
			<div className="mb-1.25">
				<Trans
					values={{
						postProcess: 'sprintf',
						sprintf: [catalog_id],
					}}
				>
					<b>Catalog ID</b>: %s
				</Trans>
			</div>

			<ul className="m-0 mb-1.25 list-none rounded-[2px] bg-[#f7f6ef] p-1 [&>li+li]:mt-1 [&>li+li]:border-t [&>li+li]:border-[#ebebeb] [&>li+li]:pt-1">
				{product_items.map(
					// @ts-ignore
					({ product_retailer_id, item_price, quantity, currency }) => (
						<li key={product_retailer_id}>
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
										sprintf: [Number(quantity)],
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
									<b>Price</b>: %s %s
								</Trans>
							</div>
						</li>
					)
				)}
			</ul>
			<p>{text}</p>
		</>
	);
};

export default memo(OrderMessage);
