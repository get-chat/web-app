import React from 'react';
import { Button, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';
import * as Styled from '../Main/Sidebar/BusinessProfile/BusinessProfile.styles';

interface Props {
	onHide: () => void;
	setChangePasswordDialogVisible: (isVisible: boolean) => void;
}

const UserProfile: React.FC<Props> = ({
	onHide,
	setChangePasswordDialogVisible,
}) => {
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const { isReadOnly } = useAppSelector((state) => state.UI);

	const { t } = useTranslation();

	return (
		<Styled.BusinessProfileContainer>
			<Styled.Header>
				<IconButton onClick={onHide} size="large">
					<ArrowBack />
				</IconButton>

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

							<h3>{currentUser.username}</h3>
							<span>
								{currentUser.first_name + ' ' + currentUser.last_name}
							</span>

							{!isReadOnly && (
								<Styled.ChangePasswordContainer>
									<Button
										onClick={() => setChangePasswordDialogVisible(true)}
										color="secondary"
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
