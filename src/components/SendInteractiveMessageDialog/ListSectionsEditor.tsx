import React, { useId } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { ListRow, ListSection } from '@src/types/messages';
import { isEmptyString } from '@src/helpers/Helpers';
import { Button } from '@src/components/ui/button';
import { Field, FieldLabel } from '@src/components/ui/field';
import { Input } from '@src/components/ui/input';
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

	const idPrefix = useId();

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
			{sections.map((section, sectionIndex) => {
				const sectionTitleId = `${idPrefix}-section-${sectionIndex}`;
				const isSectionTitleInvalid =
					isShowErrors &&
					isSectionTitleRequired &&
					isEmptyString(section.title ?? '');

				return (
					<Styled.Section key={sectionIndex}>
						<Styled.SectionHeader>
							<Field
								data-invalid={isSectionTitleInvalid || undefined}
								className="gap-1"
							>
								<FieldLabel htmlFor={sectionTitleId}>
									{t('Section title')}
									{isSectionTitleRequired && ' *'}
								</FieldLabel>
								<Input
									id={sectionTitleId}
									variant="underline"
									size="sm"
									value={section.title ?? ''}
									required={isSectionTitleRequired}
									aria-invalid={isSectionTitleInvalid || undefined}
									maxLength={SECTION_TITLE_MAX_LENGTH}
									onChange={(e) =>
										replaceSection(sectionIndex, {
											...section,
											title: e.target.value,
										})
									}
								/>
							</Field>
							{sections.length > 1 && (
								<Button
									variant="ghost"
									color="neutral"
									size="icon-sm"
									aria-label={t('Remove section')}
									onClick={() =>
										onChange(sections.filter((_, i) => i !== sectionIndex))
									}
								>
									<CloseIcon fontSize="small" />
								</Button>
							)}
						</Styled.SectionHeader>

						{section.rows.map((row, rowIndex) => {
							const rowId = `${idPrefix}-section-${sectionIndex}-row-${rowIndex}`;
							const isRowTitleInvalid =
								isShowErrors && isEmptyString(row.title);

							return (
								<Styled.Row key={rowIndex}>
									<Field
										data-invalid={isRowTitleInvalid || undefined}
										className="gap-1"
									>
										<FieldLabel htmlFor={`${rowId}-title`}>
											{t('Option title')} *
										</FieldLabel>
										<Input
											id={`${rowId}-title`}
											variant="underline"
											size="sm"
											value={row.title}
											required
											aria-invalid={isRowTitleInvalid || undefined}
											maxLength={ROW_TITLE_MAX_LENGTH}
											onChange={(e) =>
												replaceRow(sectionIndex, rowIndex, {
													...row,
													title: e.target.value,
												})
											}
										/>
									</Field>
									<Field className="gap-1">
										<FieldLabel htmlFor={`${rowId}-description`}>
											{t('Option description')}
										</FieldLabel>
										<Input
											id={`${rowId}-description`}
											variant="underline"
											size="sm"
											value={row.description ?? ''}
											maxLength={ROW_DESCRIPTION_MAX_LENGTH}
											onChange={(e) =>
												replaceRow(sectionIndex, rowIndex, {
													...row,
													description: e.target.value,
												})
											}
										/>
									</Field>
									<Button
										variant="ghost"
										color="neutral"
										size="icon-sm"
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
									</Button>
								</Styled.Row>
							);
						})}

						<Button
							variant="ghost"
							color="primary"
							size="sm"
							disabled={totalRowCount >= MAX_LIST_ROWS}
							onClick={() =>
								replaceSection(sectionIndex, {
									...section,
									rows: [...section.rows, emptyRow()],
								})
							}
						>
							<AddIcon fontSize="small" />
							{t('Add option')}
						</Button>
					</Styled.Section>
				);
			})}

			<Button
				variant="ghost"
				color="primary"
				size="sm"
				disabled={totalRowCount >= MAX_LIST_ROWS}
				onClick={() =>
					onChange([...sections, { title: '', rows: [emptyRow()] }])
				}
			>
				<AddIcon fontSize="small" />
				{t('Add section')}
			</Button>
		</Styled.Container>
	);
};

export default ListSectionsEditor;
