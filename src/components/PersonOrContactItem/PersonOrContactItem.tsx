import React from 'react';

interface Props {
	data: {};
	onClick: () => void;
}

const PersonOrContactItem: React.FC<Props> = ({ data, onClick }) => {
	return <div onClick={onClick}>{JSON.stringify(data)}</div>;
};

export default PersonOrContactItem;
