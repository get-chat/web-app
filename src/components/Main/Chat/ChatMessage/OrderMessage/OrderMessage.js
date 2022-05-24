import React from "react";

import styles from "./OrderMessage.module.css";

const OrderMessage = ({ data }) => {
    const { catalog_id, text, product_items } = data.payload.order;

    return (
        <>
            <div className={styles.title}>
                <b>Catalog ID:</b> {catalog_id}
            </div>

            <ul className={styles.list}>
                {product_items.map(
                    ({
                        product_retailer_id,
                        item_price,
                        quantity,
                        currency,
                    }) => (
                        <li key={product_retailer_id} className={styles.item}>
                            <div>
                                <b>Product retailer ID:</b>{" "}
                                {product_retailer_id}
                            </div>
                            <div>
                                <b>Quantity:</b> {quantity}
                            </div>
                            <div>
                                <b>Price:</b> {item_price} {currency}
                            </div>
                        </li>
                    )
                )}
            </ul>
            <p>{text}</p>
        </>
    );
};

export default React.memo(OrderMessage);
