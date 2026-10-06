import React from 'react';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';
import { PanelTransitionProps } from '@src/styles/panelTransitions';
import { Button } from '@src/components/ui/button';
import ProfilePanel, {
	ProfileSection,
	ProfileSectionHeader,
	profileTextClass,
} from '@src/components/ProfilePanel';

interface Props extends PanelTransitionProps {
	onHide: () => void;
	setChangePasswordDialogVisible: (isVisible: boolean) => void;
}

const UserProfile: React.FC<Props> = ({
	onHide,
	setChangePasswordDialogVisible,
	isExiting,
	onAnimationEnd,
}) => {
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const { isReadOnly } = useAppSelector((state) => state.UI);

	const { t } = useTranslation();

	return (
		<ProfilePanel
			title={t('Profile')}
			onHide={onHide}
			isExiting={isExiting}
			onAnimationEnd={onAnimationEnd}
		>
			<ProfileSection>
				{currentUser && (
					<div>
						<ProfileSectionHeader title={t('Personal Profile')} />

						<div className="flex flex-col items-center justify-center">
							<CustomAvatar
								className="size-50 text-[5rem]/none"
								src={
									currentUser?.profile?.large_avatar ??
									currentUser?.profile?.avatar
								}
								generateBgColorBy={currentUser.username}
							>
								{generateInitialsHelper(currentUser.username)}
							</CustomAvatar>
						</div>

						<div className="mt-3.75 flex flex-col items-center gap-1.25">
							<h3 className="text-center font-normal">
								{currentUser.username}
							</h3>
							<span className={profileTextClass}>
								{currentUser.first_name + ' ' + currentUser.last_name}
							</span>
						</div>

						{!isReadOnly && (
							<div className="mt-2.5 flex justify-center">
								<Button
									variant="ghost"
									color="secondary"
									onClick={() => setChangePasswordDialogVisible(true)}
								>
									{t('Change password')}
								</Button>
							</div>
						)}
					</div>
				)}
			</ProfileSection>
		</ProfilePanel>
	);
};

export default UserProfile;
