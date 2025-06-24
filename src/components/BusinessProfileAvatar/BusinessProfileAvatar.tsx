import React from 'react';
import CustomAvatar from '@src/components/CustomAvatar';
import * as Styled from './BusinessProfileAvatar.styles';
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
		<Styled.Container>
			<CustomAvatar
				className={className}
				src={profilePhoto ? 'data:image/png;base64,' + profilePhoto : undefined}
				onClick={onClick}
			/>
			{(isRefreshingSettings || isUploadingProfilePhoto) && (
				<Styled.StyledCircularProgress size={40} />
			)}
		</Styled.Container>
	);
};

export default BusinessProfileAvatar;
