import React, { ReactNode } from 'react';
import { Alert } from '@src/components/ui/alert';

interface Props {
	children: ReactNode | ReactNode[];
}

/** A compact warning pill, sized to its text, shown in place of content */
const MissingContent: React.FC<Props> = ({ children }) => {
	return (
		<Alert
			severity="warning"
			variant="filled"
			className="w-max px-2 py-0.5 font-medium"
		>
			{children}
		</Alert>
	);
};

export default MissingContent;
