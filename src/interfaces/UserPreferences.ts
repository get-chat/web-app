import { UserPreference } from '@src/interfaces/UserPreference';

export interface UserPreferences {
	[userId: string]: UserPreference;
}
