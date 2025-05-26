import React, { ReactNode } from 'react';
import * as Styled from './MissingContent.styles';

interface Props {
	children: ReactNode | ReactNode[];
}

const MissingContent: React.FC<Props> = ({ children }) => {
	return (
		<Styled.StyledAlert severity="warning" variant="filled">
			{children}
		</Styled.StyledAlert>
	);
};

export default MissingContent;
