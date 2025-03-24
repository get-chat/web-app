import React from 'react';
import { Trans } from 'react-i18next';

import styles from './ProductMessage.module.css';
import PrintMessage from '@src/components/PrintMessage';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';

const ProductMessage: React.FC<InteractiveMessageProps> = ({ interactive }) => {
	const { header, body, footer, action } = interactive ?? {};

	if (!action) {
		return null;
	}

	return (
		<>
			<div className={styles.actions}>
				{action.sections ? (
					<ul className={styles.list}>
						{action.sections.map((section, idx) => (
							<li className={styles.item} key={idx}>
								<div>{section.title}</div>
								{section.product_items && (
									<ul className={styles.list}>
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
			{header && (
				<div className={styles.header}>
					<PrintMessage linkify message={header.text} />
				</div>
			)}
			{body && (
				<div className={styles.body}>
					<PrintMessage linkify message={body.text} />
				</div>
			)}
			{footer && (
				<div className={styles.footer}>
					<PrintMessage linkify message={footer.text} />
				</div>
			)}
		</>
	);
};

export default React.memo(ProductMessage);
