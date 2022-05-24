import React from "react";

import styles from "./ProductMessage.module.css";

const ProductMessage = ({ header, body, footer, action }) => {
    return (
        <>
            <div className={styles.actions}>
                {action.sections ? (
                    <ul className={styles.list}>
                        {action.sections.map((section, idx) => (
                            <li className={styles.item} key={idx}>
                                <div>{section.title}</div>
                                <ul className={styles.list}>
                                    {section.product_items.map(
                                        ({ product_retailer_id }) => (
                                            <li key={product_retailer_id}>
                                                <b>Product retailer ID:</b>
                                                {product_retailer_id}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <>
                        <div>
                            <b>Catalog ID</b>: {action.catalog_id}
                        </div>
                        <div>
                            <b>Product retailer ID</b>:{" "}
                            {action.product_retailer_id}
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
