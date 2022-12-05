import React from 'react';
import { Trans } from 'react-i18next';

import styles from './ProductMessage.module.css';

const ProductMessage = ({ header, body, footer, action }) => {
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
										{section.product_items.map(({ product_retailer_id }) => (
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
										))}
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
			{header && <div className={styles.header}>{header.text}</div>}
			{body && <div className={styles.body}>{body.text}</div>}
			{footer && <div className={styles.footer}>{footer.text}</div>}
		</>
	);
};

export default React.memo(ProductMessage);
