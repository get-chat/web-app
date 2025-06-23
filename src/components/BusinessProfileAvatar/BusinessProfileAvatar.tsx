import React from 'react';
import CustomAvatar from '@src/components/CustomAvatar';

interface Props {
	className?: string;
	onClick?: () => void;
	profilePhoto: string | undefined;
}

const BusinessProfileAvatar: React.FC<Props> = ({
	className,
	onClick,
	profilePhoto,
}) => {
	return (
		<CustomAvatar
			className={className}
			src={profilePhoto ? 'data:image/png;base64,' + profilePhoto : undefined}
			onClick={onClick}
		/>
	);
};

export default BusinessProfileAvatar;
