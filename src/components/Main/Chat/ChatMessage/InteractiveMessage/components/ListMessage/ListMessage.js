import React from 'react';

import styles from './ListMessage.module.css';

const ListMessage = ({ header, body, footer, action }) => {
    const { sections } = action;

    return (
        <div className={styles.message}>
            {header && <div className={styles.header}>{header.text}</div>}
            {body && <div className={styles.body}>{body.text}</div>}
            {footer && <div className={styles.footer}>{footer.text}</div>}

            {sections && (
                <div className={styles.actions}>
                    <ul className={styles.list}>
                        {sections.map(({ title, rows }) => (
                            <li key={title}>
                                <h3 className={styles.title}>{title}</h3>
                                <ul className={styles.list}>
                                    {rows.map(({ id, title, description }) => (
                                        <li key={id}>
                                            <p>{title}</p>
                                            <p className={styles.description}>
                                                {description}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ListMessage;
