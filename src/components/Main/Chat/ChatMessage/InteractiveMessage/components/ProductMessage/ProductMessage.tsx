import React from 'react';
import { Trans } from 'react-i18next';
import PrintMessage from '@src/components/PrintMessage';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
import {
	Actions,
	Header,
	Body,
	Footer,
	List,
	Item,
} from './ProductMessage.styles';

const ProductMessage: React.FC<InteractiveMessageProps> = ({ interactive }) => {
	const { header, body, footer, action } = interactive ?? {};

	if (!action) {
		return null;
	}

	return (
		<>
			<Actions>
				{action.sections ? (
					<List>
						{action.sections.map((section, idx) => (
							<Item key={idx}>
								<div>{section.title}</div>
								{section.product_items && (
									<List>
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
									</List>
								)}
							</Item>
						))}
					</List>
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
			</Actions>
			{header && (
				<Header>
					<PrintMessage linkify message={header.text} />
				</Header>
			)}
			{body && (
				<Body>
					<PrintMessage linkify message={body.text} />
				</Body>
			)}
			{footer && (
				<Footer>
					<PrintMessage linkify message={footer.text} />
				</Footer>
			)}
		</>
	);
};

export default React.memo(ProductMessage);
