import React from 'react';

const BoldText = ({ data: { text } }) => {
	return <span className="bold" dangerouslySetInnerHTML={{ __html: text }} />;
};

export default BoldText;
