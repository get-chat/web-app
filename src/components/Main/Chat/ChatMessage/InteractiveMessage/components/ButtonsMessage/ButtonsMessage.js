import React from 'react';
import { Button } from '@material-ui/core';

import styles from './ButtonsMessage.module.css';

const ButtonsMessage = ({ header, body, footer, action }) => {
    return (
        <>
            {header && <div className={styles.header}>{header.text}</div>}
            {body && <div className={styles.body}>{body.text}</div>}
            {footer && <div className={styles.footer}>{footer.text}</div>}
            {action?.buttons && (
                <div className={styles.actions}>
                    {action?.buttons.map(({ reply }) => (
                        <Button
                            key={reply.id}
                            color="primary"
                            fullWidth
                            disabled
                        >
                            {reply.title}
                        </Button>
                    ))}
                </div>
            )}
        </>
    );
};

export default ButtonsMessage;
