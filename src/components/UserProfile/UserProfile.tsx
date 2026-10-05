import React from 'react';
import { ArrowBack } from '@src/components/icons';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';
import * as Styled from '../Main/Sidebar/BusinessProfile/BusinessProfile.styles';
import { PanelTransitionProps } from '@src/styles/panelTransitions';
import { Button } from '@src/components/ui/button';

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
		<Styled.BusinessProfileContainer
			$isExiting={isExiting}
			onAnimationEnd={onAnimationEnd}
		>
			<Styled.Header>
				<Button variant="ghost" color="neutral" size="icon-xl" onClick={onHide}>
					<ArrowBack />
				</Button>

				<h3>{t('Profile')}</h3>
			</Styled.Header>

			<Styled.Body>
				<Styled.Section>
					{currentUser && (
						<div>
							<Styled.SectionHeader>
								<h5>{t('Personal Profile')}</h5>
							</Styled.SectionHeader>

							<Styled.AvatarContainer>
								<CustomAvatar
									src={
										currentUser?.profile?.large_avatar ??
										currentUser?.profile?.avatar
									}
									generateBgColorBy={currentUser.username}
								>
									{generateInitialsHelper(currentUser.username)}
								</CustomAvatar>
							</Styled.AvatarContainer>

							<Styled.UsernameContainer>
								<h3>{currentUser.username}</h3>
								<span>
									{currentUser.first_name + ' ' + currentUser.last_name}
								</span>
							</Styled.UsernameContainer>

							{!isReadOnly && (
								<Styled.ChangePasswordContainer>
									<Button
										variant="ghost"
										color="secondary"
										onClick={() => setChangePasswordDialogVisible(true)}
									>
										{t('Change password')}
									</Button>
								</Styled.ChangePasswordContainer>
							)}
						</div>
					)}
				</Styled.Section>
			</Styled.Body>
		</Styled.BusinessProfileContainer>
	);
};

export default UserProfile;
