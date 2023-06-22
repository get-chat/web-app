import PermissionsModel from './PermissionsModel';
import GroupModel from '@src/api/models/GroupModel';
import { getUserPreferences } from '@src/helpers/StorageHelper';

class UserModel {
	public id?: number;
	public username?: string;
	public isAdmin: boolean;
	public groups: GroupModel[];
	public profile: any;
	public permissions: PermissionsModel;
	public firstName?: string;
	public lastName?: string;
	public role: string | null;

	constructor(data: any) {
		this.id = data.id;
		this.username = data.username;
		this.firstName = data.first_name;
		this.lastName = data.last_name;
		this.groups = data.groups?.map((rawGroup: any) => new GroupModel(rawGroup));
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
			label = this.username ?? '';
		}

		return label;
	};

	isInGroup(groupId: number) {
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

	getPreferences() {
		return getUserPreferences()?.[this.id?.toString() ?? ''];
	}
}

export default UserModel;
