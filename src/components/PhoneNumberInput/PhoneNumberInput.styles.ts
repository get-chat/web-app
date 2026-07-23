import styled from 'styled-components';
import { FormControl, ListSubheader, TextField } from '@mui/material';

export const Row = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 12px;
	width: 100%;
`;

export const CountryControl = styled(FormControl)`
	width: 120px;
	flex-shrink: 0;
` as typeof FormControl;

export const NationalNumberField = styled(TextField)`
	flex: 1;
`;

export const SelectedValue = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 6px;
	white-space: nowrap;

	.PhoneNumberInput__flag {
		font-size: 16px;
		line-height: 1;
	}
`;

export const Option = styled.span`
	display: flex;
	align-items: center;
	gap: 10px;
	width: 100%;

	.PhoneNumberInput__flag {
		font-size: 16px;
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

export const SearchBox = styled(ListSubheader)`
	padding: 6px 12px;
	background-color: white;

	.MuiOutlinedInput-input {
		padding: 6px 10px;
		font-size: 0.875rem;
	}
`;

export const NoResults = styled.div`
	padding: 8px 16px;
	color: rgba(0, 0, 0, 0.55);
`;
