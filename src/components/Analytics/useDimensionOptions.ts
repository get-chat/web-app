import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';
import { AnalyticsFilterId } from '@src/types/analytics';

export type Dimension = 'user' | 'group' | 'tag';

export interface DimensionOption {
	id: AnalyticsFilterId;
	label: string;
	/** A tag's colour */
	color?: string;
}

/** The agents, groups and tags to filter by, each ending with its "none" */
const useDimensionOptions = () => {
	const { t } = useTranslation();
	const users = useAppSelector((state) => state.users.value);
	const groups = useAppSelector((state) => state.groups.value);
	const tags = useAppSelector((state) => state.tags.value);

	const options = useMemo<Record<Dimension, DimensionOption[]>>(() => {
		const byLabel = (a: DimensionOption, b: DimensionOption) =>
			a.label.localeCompare(b.label);

		return {
			user: [
				...Object.values(users)
					// App integrations (API, Sendouts...) are not agents
					.filter((user) => user.profile?.role !== 'app')
					.map((user) => ({
						id: user.id,
						label:
							[user.first_name, user.last_name].filter(Boolean).join(' ') ||
							user.username,
					}))
					.sort(byLabel),
				{ id: 'none', label: t('Unassigned') },
			],
			group: [
				...Object.values(groups)
					.map((group) => ({ id: group.id, label: group.name }))
					.sort(byLabel),
				{ id: 'none', label: t('No group') },
			],
			tag: [
				...tags
					.map((tag) => ({
						id: tag.id,
						label: tag.name,
						color: tag.web_inbox_color,
					}))
					.sort(byLabel),
				{ id: 'none', label: t('Untagged') },
			],
		};
	}, [users, groups, tags, t]);

	/** The API returns null for unassigned or untagged rows */
	const getOption = useCallback(
		(dimension: Dimension, id: number | string | null): DimensionOption =>
			options[dimension].find((option) => option.id === (id ?? 'none')) ?? {
				id: id as number,
				label: t('Unknown'),
			},
		[options, t]
	);

	return { options, getOption };
};

export default useDimensionOptions;
