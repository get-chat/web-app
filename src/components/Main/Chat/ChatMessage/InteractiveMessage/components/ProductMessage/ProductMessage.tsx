import React, { memo } from 'react';
import { Trans } from 'react-i18next';
import PrintMessage from '@src/components/PrintMessage';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
import InteractiveMessageText from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageText';

// Sections, and the products within each, 5px apart
const listClassName = 'm-0 list-none p-0 [&>li+li]:mt-1.25';

const ProductMessage: React.FC<InteractiveMessageProps> = ({ interactive }) => {
	const { header, body, footer, action } = interactive ?? {};

	if (!action) {
		return null;
	}

	return (
		<>
			<div className="mb-1.25 flex flex-col justify-center gap-1.25 border-b border-[#ccc] pb-1.25">
				{action.sections ? (
					<ul className={listClassName}>
						{action.sections.map((section, idx) => (
							<li key={idx}>
								<div>{section.title}</div>
								{section.product_items && (
									<ul className={listClassName}>
										{section.product_items.map(
											({
												product_retailer_id,
											}: {
												product_retailer_id: string;
											}) => (
												<li key={product_retailer_id}>
													<Trans
														values={{
															postProcess: 'sprintf',
															sprintf: [product_retailer_id],
														}}
													>
														<b>Product retailer ID</b>: %s
													</Trans>
												</li>
											)
										)}
									</ul>
								)}
							</li>
						))}
					</ul>
				) : (
					<>
						<div>
							<Trans
								values={{
									postProcess: 'sprintf',
									sprintf: [action.catalog_id],
								}}
							>
								<b>Catalog ID</b>: %s
							</Trans>
						</div>
						<div>
							<Trans
								values={{
									postProcess: 'sprintf',
									sprintf: [action.product_retailer_id],
								}}
							>
								<b>Product retailer ID</b>: %s
							</Trans>
						</div>
					</>
				)}
			</div>
			<InteractiveMessageText
				header={header}
				body={body}
				footer={footer}
				headerClassName="font-normal"
			/>
		</>
	);
};

export default memo(ProductMessage);
