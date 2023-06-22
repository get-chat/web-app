// @ts-nocheck
import PermissionsModel from './PermissionsModel';
import GroupModel from '@src/api/models/GroupModel';

class UserModel {
	public id?: Number;
	public username?: string;
	public isAdmin: boolean;
	public groups: GroupModel[];
	public profile: any;
	public permissions: PermissionsModel;

	constructor(data) {
		if (!data) return;

		this.id = data.id;
		this.username = data.username;
		this.firstName = data.first_name;
		this.lastName = data.last_name;
		this.groups = data.groups?.map((rawGroup) => new GroupModel(rawGroup));
		this.permissions = new PermissionsModel(data.permissions);
		this.profile = data.profile;
		this.role = data?.profile?.role;
		this.isAdmin = this.role === 'admin';
	}

	prepareUserLabel = () => {
		let label = '';
		if (this.firstName) {
			label = this.firstName;
		}

		if (this.lastName) {
			if (label) {
				label += ' ';
			}

			label += this.lastName;
		}

		if (label) {
			label += ` (${this.username})`;
		} else {
			label = this.username;
		}

		return label;
	};

	isInGroup(groupId) {
		let inGroup = false;

		this.groups?.forEach((groupItem) => {
			if (groupItem?.id === groupId) {
				inGroup = true;
			}
		});

		return inGroup;
	}

	isBot() {
		if (this.groups) {
			for (let i = 0; i < this.groups.length; i++) {
				const group = this.groups[i];
				if (group.name === 'App integration') {
					return true;
				}
			}
		}

		return false;
	}
}

export default UserModel;
