import * as Styled from './UserListView.styles';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { IconButton, Switch } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { fetchUsers } from '@src/api/usersApi';
import { User, UserList } from '@src/types/users';
import { setState } from '@src/store/reducers/UIReducer';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';

interface Props {
	onHide: () => void;
}

const UserListView: React.FC<Props> = ({ onHide }) => {
	const { t } = useTranslation();

	const [users, setUsers] = useState<UserList>({});

	useEffect(() => {
		listUsers();
	}, []);

	const listUsers = async () => {
		try {
			const data = await fetchUsers(1000);
			const userList: UserList = {};
			data.results.forEach((user: User) => {
				userList[user.id] = user;
			});
			setUsers(userList);
		} catch (error) {
			console.error('Error in listUsers', error);
		}
	};

	return (
		<Styled.Container>
			<Styled.Header>
				<IconButton onClick={onHide} size="large">
					<CloseIcon />
				</IconButton>

				<h3>{t('Users')}</h3>
			</Styled.Header>
			<Styled.Description>
				{t('As an admin, you can change active status of users.')}
			</Styled.Description>
			<Styled.Body>
				{Object.values(users).map((user) => (
					<Styled.UserItem $isAvailable={user.profile.is_available}>
						<Styled.UserMeta>
							<CustomAvatar generateBgColorBy={user.username}>
								{generateInitialsHelper(user.username)}
							</CustomAvatar>
							<div>
								<Styled.UserUsername>{user.username}</Styled.UserUsername>
								<Styled.UserRole>{user.profile.role}</Styled.UserRole>
							</div>
						</Styled.UserMeta>
						<Styled.UserAvailability>
							<div>
								{user.profile.is_available ? t('Active') : t('Inactive')}
							</div>
							<Switch
								color={user.profile.is_available ? 'success' : 'warning'}
								checked={user.profile.is_available}
							/>
						</Styled.UserAvailability>
					</Styled.UserItem>
				))}
			</Styled.Body>
		</Styled.Container>
	);
};

export default UserListView;
