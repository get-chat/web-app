import React from "react";
import { Trans } from "react-i18next";

import styles from "./OrderMessage.module.css";

const OrderMessage = ({ data }) => {
    const { catalog_id, text, product_items } = data.payload.order;

    return (
        <>
            <div className={styles.title}>
                <Trans
                    values={{
                        postProcess: "sprintf",
                        sprintf: [catalog_id],
                    }}
                >
                    <b>Catalog ID</b>: %s
                </Trans>
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
                                <Trans
                                    values={{
                                        postProcess: "sprintf",
                                        sprintf: [product_retailer_id],
                                    }}
                                >
                                    <b>Product retailer ID</b>: %s
                                </Trans>
                            </div>
                            <div>
                                <Trans
                                    values={{
                                        postProcess: "sprintf",
                                        sprintf: [quantity],
                                    }}
                                >
                                    <b>Quantity</b>: %d
                                </Trans>
                            </div>
                            <div>
                                <Trans
                                    values={{
                                        postProcess: "sprintf",
                                        sprintf: [item_price, currency],
                                    }}
                                >
                                    <b>Price</b>: %d %s
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

export default React.memo(OrderMessage);
