import React from 'react';
import RecipientInterface from '@src/api/models/interfaces/RecipientInterface';

interface Props {
	data: RecipientInterface;
	onClick: () => void;
}

const RecipientItem: React.FC<Props> = ({ data, onClick }) => {
	return <div onClick={onClick}>{data.name}</div>;
};

export default RecipientItem;
