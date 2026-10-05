import React from 'react';
import CustomAvatar from '@src/components/CustomAvatar';
import { Spinner } from '@src/components/ui/spinner';
import { useAppSelector } from '@src/store/hooks';

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
	const { isUploadingProfilePhoto, isRefreshingSettings } = useAppSelector(
		(state) => state.UI
	);

	return (
		<div className="relative flex items-center justify-center">
			<CustomAvatar
				className={className}
				src={profilePhoto ? 'data:image/png;base64,' + profilePhoto : undefined}
				onClick={onClick}
			/>
			{(isRefreshingSettings || isUploadingProfilePhoto) && (
				<Spinner
					size={40}
					className="pointer-events-none absolute text-primary"
				/>
			)}
		</div>
	);
};

export default BusinessProfileAvatar;
