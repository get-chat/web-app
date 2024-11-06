import PrintMessage from '@src/components/PrintMessage';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
	data?: any;
}

const NfmReply: React.FC<Props> = ({ data }) => {
	const response = JSON.parse(data?.response_json ?? {});
	const { t } = useTranslation();

	return (
		<>
			{data && (
				<>
					{data.body && (
						<h5>
							<PrintMessage linkify message={data.body} />
						</h5>
					)}

					{response && (
						<ul style={{ paddingLeft: 15 }}>
							<li>
								{t('Name:')} {response.name}
							</li>
							<li>
								{t('Order number:')} {response.orderNumber}
							</li>
							<li>
								{t('Topic radio:')} {response.topicRadio}
							</li>
							<li>
								{t('Description:')} {response.description}
							</li>
							<li>
								{t('Flow token:')} {response.flow_token}
							</li>
						</ul>
					)}
				</>
			)}
		</>
	);
};

export default NfmReply;
