import React from 'react';
import RecipientInterface from '@src/api/models/interfaces/RecipientInterface';
import style from './RecipientItem.module.css';

interface Props {
	data: RecipientInterface;
	onClick: (data: any) => void;
}

const RecipientItem: React.FC<Props> = ({ data, onClick }) => {
	return <div onClick={onClick}>{data.name}</div>;
};

export default RecipientItem;
