import React from 'react';
import { Button, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { ListRow, ListSection } from '@src/types/messages';
import { isEmptyString } from '@src/helpers/Helpers';
import * as Styled from './ListSectionsEditor.styles';

// Limits imposed by the WhatsApp Business API for interactive list messages
export const MAX_LIST_ROWS = 10;
const SECTION_TITLE_MAX_LENGTH = 24;
const ROW_TITLE_MAX_LENGTH = 24;
const ROW_DESCRIPTION_MAX_LENGTH = 72;

interface Props {
	sections: ListSection[];
	onChange: (sections: ListSection[]) => void;
	isShowErrors: boolean;
}

const ListSectionsEditor: React.FC<Props> = ({
	sections,
	onChange,
	isShowErrors,
}) => {
	const { t } = useTranslation();

	const totalRowCount = sections.reduce(
		(total, section) => total + section.rows.length,
		0
	);
	// Section titles are only mandatory when there are multiple sections
	const isSectionTitleRequired = sections.length > 1;

	const emptyRow = (): ListRow => ({ id: '', title: '', description: '' });

	const replaceSection = (index: number, section: ListSection) =>
		onChange(sections.map((item, i) => (i === index ? section : item)));

	const replaceRow = (sectionIndex: number, rowIndex: number, row: ListRow) =>
		replaceSection(sectionIndex, {
			...sections[sectionIndex],
			rows: sections[sectionIndex].rows.map((item, i) =>
				i === rowIndex ? row : item
			),
		});

	return (
		<Styled.Container>
			{sections.map((section, sectionIndex) => (
				<Styled.Section key={sectionIndex}>
					<Styled.SectionHeader>
						<TextField
							variant="standard"
							size="small"
							fullWidth
							label={t('Section title')}
							value={section.title ?? ''}
							required={isSectionTitleRequired}
							error={
								isShowErrors &&
								isSectionTitleRequired &&
								isEmptyString(section.title ?? '')
							}
							inputProps={{ maxLength: SECTION_TITLE_MAX_LENGTH }}
							onChange={(e) =>
								replaceSection(sectionIndex, {
									...section,
									title: e.target.value,
								})
							}
						/>
						{sections.length > 1 && (
							<IconButton
								size="small"
								aria-label={t('Remove section')}
								onClick={() =>
									onChange(sections.filter((_, i) => i !== sectionIndex))
								}
							>
								<CloseIcon fontSize="small" />
							</IconButton>
						)}
					</Styled.SectionHeader>

					{section.rows.map((row, rowIndex) => (
						<Styled.Row key={rowIndex}>
							<TextField
								variant="standard"
								size="small"
								fullWidth
								label={t('Option title')}
								value={row.title}
								required
								error={isShowErrors && isEmptyString(row.title)}
								inputProps={{ maxLength: ROW_TITLE_MAX_LENGTH }}
								onChange={(e) =>
									replaceRow(sectionIndex, rowIndex, {
										...row,
										title: e.target.value,
									})
								}
							/>
							<TextField
								variant="standard"
								size="small"
								fullWidth
								label={t('Option description')}
								value={row.description ?? ''}
								inputProps={{ maxLength: ROW_DESCRIPTION_MAX_LENGTH }}
								onChange={(e) =>
									replaceRow(sectionIndex, rowIndex, {
										...row,
										description: e.target.value,
									})
								}
							/>
							<IconButton
								size="small"
								aria-label={t('Remove option')}
								// Keep at least one option; remove the section instead
								disabled={section.rows.length === 1}
								onClick={() =>
									replaceSection(sectionIndex, {
										...section,
										rows: section.rows.filter((_, i) => i !== rowIndex),
									})
								}
							>
								<CloseIcon fontSize="small" />
							</IconButton>
						</Styled.Row>
					))}

					<Button
						size="small"
						startIcon={<AddIcon />}
						disabled={totalRowCount >= MAX_LIST_ROWS}
						onClick={() =>
							replaceSection(sectionIndex, {
								...section,
								rows: [...section.rows, emptyRow()],
							})
						}
					>
						{t('Add option')}
					</Button>
				</Styled.Section>
			))}

			<Button
				size="small"
				startIcon={<AddIcon />}
				disabled={totalRowCount >= MAX_LIST_ROWS}
				onClick={() =>
					onChange([...sections, { title: '', rows: [emptyRow()] }])
				}
			>
				{t('Add section')}
			</Button>
		</Styled.Container>
	);
};

export default ListSectionsEditor;
