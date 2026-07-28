import styled from 'styled-components';
import { TextField } from '@mui/material';

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

export const CountryTrigger = styled(TextField)`
	width: 100%;

	.MuiInputBase-root,
	.MuiInputBase-input {
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

	.MuiSvgIcon-root {
		color: rgba(0, 0, 0, 0.54);
	}
`;

export const NationalNumberField = styled(TextField)`
	flex: 1;
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

// Fixed header of the dropdown — sits above the scrollable options.
export const SearchHeader = styled.div`
	padding: 10px 12px;
	flex-shrink: 0;

	.searchBar__search {
		padding: 0;
	}
`;

// Only the options list scrolls; the rounded Paper clips its scrollbar.
export const OptionsScroller = styled.div`
	max-height: 320px;
	overflow-y: auto;
`;

export const NoResults = styled.div`
	padding: 8px 16px;
	color: rgba(0, 0, 0, 0.55);
`;
