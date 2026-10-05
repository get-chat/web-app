import styled from 'styled-components';
import { Field } from '@src/components/ui/field';

export const Row = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 12px;
	width: 100%;
`;

export const CountryControl = styled.div`
	width: 120px;
	flex-shrink: 0;
`;

export const CountryTrigger = styled(Field)`
	width: 100%;

	[data-slot='input-group'],
	[data-slot='input-group-addon'],
	input {
		cursor: pointer;
		caret-color: transparent;
	}

	.PhoneNumberInput__flag {
		font-size: 16px;
		line-height: 1;
		/* The input adornment dims its contents (action.active alpha); keep the
		   flag at full color like the options list. */
		color: rgba(0, 0, 0, 0.87);
	}

	.app-icon {
		color: rgba(0, 0, 0, 0.54);
	}
`;

export const NationalNumberField = styled(Field)`
	flex: 1;
	min-width: 0;
`;

export const Option = styled.span`
	display: flex;
	align-items: center;
	gap: 10px;
	width: 100%;

	.PhoneNumberInput__flag {
		font-size: 18px;
		line-height: 1;
	}

	.PhoneNumberInput__name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.PhoneNumberInput__code {
		color: rgba(0, 0, 0, 0.55);
	}
`;

// A row of the countries list, like MUI's MenuItem
export const OptionButton = styled.button`
	display: flex;
	align-items: center;
	width: 100%;
	min-height: 36px;
	padding: 6px 16px;
	border: 0;
	background: transparent;
	font: inherit;
	font-size: 1rem;
	color: inherit;
	text-align: left;
	cursor: pointer;
	outline: none;

	&:hover,
	&:focus-visible {
		background-color: rgba(0, 0, 0, 0.04);
	}

	&[aria-selected='true'] {
		background-color: var(--color-primary-transparent);
	}

	&[aria-selected='true']:hover,
	&[aria-selected='true']:focus-visible {
		background-color: var(--color-primary-transparent-darker);
	}
`;

// Fixed header of the dropdown — sits above the scrollable options.
export const SearchHeader = styled.div`
	padding: 10px 12px;
	flex-shrink: 0;

	.searchBar__search {
		padding: 0;
	}
`;

// Only the options list scrolls; the rounded popover clips its scrollbar.
export const OptionsScroller = styled.div`
	max-height: 320px;
	overflow-y: auto;
`;

export const NoResults = styled.div`
	padding: 8px 16px;
	color: rgba(0, 0, 0, 0.55);
`;
