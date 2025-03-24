import React from 'react';

import styles from './ListMessage.module.css';
import PrintMessage from '@src/components/PrintMessage';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';

const ListMessage: React.FC<InteractiveMessageProps> = ({ interactive }) => {
	const { header, body, footer, action } = interactive ?? {};
	const sections = action?.sections;

	return (
		<div className={styles.message}>
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

			{sections && Array.isArray(sections) && (
				<div className={styles.actions}>
					<ul className={styles.list}>
						{sections.map(({ title, rows }) => (
							<li key={title}>
								<h3 className={styles.title}>{title}</h3>
								<ul className={styles.list}>
									{rows.map(
										({
											id,
											title,
											description,
										}: {
											id: string;
											title: string;
											description: string;
										}) => (
											<li key={id}>
												<p>{title}</p>
												<p className={styles.description}>{description}</p>
											</li>
										)
									)}
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
