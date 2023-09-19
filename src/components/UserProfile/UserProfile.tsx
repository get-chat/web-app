import React from 'react';
import { Button, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';

interface Props {
	onHide: () => void;
	setChangePasswordDialogVisible: (isVisible: boolean) => void;
}

const UserProfile: React.FC<Props> = ({
	onHide,
	setChangePasswordDialogVisible,
}) => {
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const { isReadOnly } = useAppSelector((state) => state.UI.value);

	const { t } = useTranslation();

	return (
		<div className="sidebarBusinessProfile">
			<div className="sidebarBusinessProfile__header">
				<IconButton onClick={onHide} size="large">
					<ArrowBack />
				</IconButton>

				<h3>{t('Profile')}</h3>
			</div>

			<div className="sidebarBusinessProfile__body">
				<div className="sidebarBusinessProfile__body__section">
					{currentUser && (
						<div>
							<div className="sidebarBusinessProfile__body__section__header">
								<h5>{t('Personal Profile')}</h5>
							</div>

							<div className="sidebarBusinessProfile__body__avatarContainer">
								<CustomAvatar
									src={
										currentUser?.profile?.large_avatar ??
										currentUser?.profile?.avatar
									}
									generateBgColorBy={currentUser.username}
								>
									{generateInitialsHelper(currentUser.username)}
								</CustomAvatar>
							</div>

							<h3>{currentUser.username}</h3>
							<span>{currentUser.firstName + ' ' + currentUser.lastName}</span>

							{!isReadOnly && (
								<div className="sidebarBusinessProfile__body__changePasswordContainer">
									<Button
										onClick={() => setChangePasswordDialogVisible(true)}
										color="secondary"
									>
										{t('Change password')}
									</Button>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default UserProfile;
