import React, { useId } from 'react';
import AddIcon from '@src/components/icons/Add';
import CloseIcon from '@src/components/icons/Close';
import { useTranslation } from 'react-i18next';
import { ListRow, ListSection } from '@src/types/messages';
import { isEmptyString } from '@src/helpers/Helpers';
import { Button } from '@src/components/ui/button';
import { Field, FieldLabel } from '@src/components/ui/field';
import { Input } from '@src/components/ui/input';
import {
	editorCardClassName,
	editorClassName,
	editorRowClassName,
} from './editorClassNames';

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
		<div className={editorClassName}>
			{sections.map((section, sectionIndex) => {
				const sectionTitleId = `${idPrefix}-section-${sectionIndex}`;
				const isSectionTitleInvalid =
					isShowErrors &&
					isSectionTitleRequired &&
					isEmptyString(section.title ?? '');

				return (
					<div className={editorCardClassName} key={sectionIndex}>
						<div className="flex items-end gap-1.25">
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
						</div>

						{section.rows.map((row, rowIndex) => {
							const rowId = `${idPrefix}-section-${sectionIndex}-row-${rowIndex}`;
							const isRowTitleInvalid =
								isShowErrors && isEmptyString(row.title);

							return (
								<div className={editorRowClassName} key={rowIndex}>
									<Field
										data-invalid={isRowTitleInvalid || undefined}
										className="gap-1"
									>
										<FieldLabel htmlFor={`${rowId}-title`}>
											{t('Option title')} *
										</FieldLabel>
										<Input
											id={`${rowId}-title`}
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
								</div>
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
					</div>
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
		</div>
	);
};

export default ListSectionsEditor;
