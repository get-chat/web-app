import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	FormControl,
	InputLabel,
	ListSubheader,
	MenuItem,
	Select,
	SelectChangeEvent,
	TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
	CountryCode,
	getCountries,
	getCountryCallingCode,
	isValidPhoneNumber,
	parsePhoneNumberFromString,
} from 'libphonenumber-js';
import { getFlagEmoji } from '@src/helpers/PhoneNumberHelper';
import * as Styled from './PhoneNumberInput.styles';

interface CountryOption {
	country: CountryCode;
	callingCode: string;
	name: string;
}

interface Props {
	// ISO country used as the initial selection (e.g. derived from the inbox's
	// own number). Applied once it becomes available if the user hasn't picked one.
	defaultCountry?: CountryCode;
	// Emits the resolved E.164 number (e.g. "+905383192532", empty while blank)
	// and whether it is a valid phone number.
	onChange: (value: string, isValid: boolean) => void;
	onEnter?: () => void;
	autoFocus?: boolean;
	// When true, shows the "invalid phone number" hint. Controlled by the parent
	// so the error only appears on submit, not while typing.
	error?: boolean;
}

const buildCountryOptions = (locale: string): CountryOption[] => {
	let displayNames: Intl.DisplayNames | undefined;
	try {
		displayNames = new Intl.DisplayNames([locale], { type: 'region' });
	} catch {
		displayNames = undefined;
	}

	return getCountries()
		.map((country) => {
			let name = country as string;
			try {
				name = displayNames?.of(country) || country;
			} catch {
				name = country;
			}
			return {
				country,
				callingCode: getCountryCallingCode(country),
				name,
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));
};

// Lower-cases and strips diacritics so "tur" / "turkiye" matches "Türkiye".
const normalizeText = (value: string): string =>
	value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();

// Matches an option by name (diacritic-insensitive), dial code, or ISO code.
const optionMatches = (option: CountryOption, search: string): boolean => {
	const raw = search.trim().replace(/^\+/, '');
	if (!raw) return true;
	const query = normalizeText(raw);
	return (
		normalizeText(option.name).includes(query) ||
		option.callingCode.includes(raw) ||
		option.country.toLowerCase().includes(query)
	);
};

const PhoneNumberInput: React.FC<Props> = ({
	defaultCountry,
	onChange,
	onEnter,
	autoFocus,
	error,
}) => {
	const { t, i18n } = useTranslation();

	const options = useMemo(
		() => buildCountryOptions(i18n.language),
		[i18n.language]
	);

	const [country, setCountry] = useState<CountryCode | undefined>(
		defaultCountry
	);
	const [nationalNumber, setNationalNumber] = useState('');
	const [search, setSearch] = useState('');
	const [isMenuOpen, setMenuOpen] = useState(false);
	const userSelectedCountryRef = useRef(false);

	// Apply the default country once it becomes available (the inbox number is
	// loaded asynchronously), unless the user has already picked one.
	useEffect(() => {
		if (defaultCountry && !userSelectedCountryRef.current) {
			setCountry(defaultCountry);
		}
	}, [defaultCountry]);

	// Keep onChange in a ref so the emit effect isn't re-run by an unstable
	// parent callback.
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	const selectedOption = useMemo(
		() => options.find((option) => option.country === country) ?? undefined,
		[options, country]
	);

	const visibleCount = useMemo(
		() => options.filter((option) => optionMatches(option, search)).length,
		[options, search]
	);

	// The full country list is built only while the menu is open, so typing in the
	// phone-number field (menu closed) never pays the cost of rendering ~245 items.
	const menuItems = useMemo(
		() =>
			options.map((option) => (
				<MenuItem
					key={option.country}
					value={option.country}
					sx={{ display: optionMatches(option, search) ? 'flex' : 'none' }}
				>
					<Styled.Option>
						<span className="PhoneNumberInput__flag">
							{getFlagEmoji(option.country)}
						</span>
						<span className="PhoneNumberInput__name">{option.name}</span>
						<span className="PhoneNumberInput__code">
							+{option.callingCode}
						</span>
					</Styled.Option>
				</MenuItem>
			)),
		[options, search]
	);

	// Emit the resolved E.164 number and its validity whenever the inputs change.
	useEffect(() => {
		const digits = nationalNumber.replace(/\D/g, '');
		if (!country || !digits) {
			onChangeRef.current('', false);
			return;
		}
		const value = `+${getCountryCallingCode(country)}${digits}`;
		onChangeRef.current(value, isValidPhoneNumber(value));
	}, [country, nationalNumber]);

	// Keep the national part as plain digits — no as-you-type spacing.
	const toNationalDigits = (value: string) => value.replace(/\D/g, '');

	const handleNationalChange = (raw: string) => {
		const trimmed = raw.trim();

		// Explicit international form typed: "+..." or "00...".
		if (/^(\+|00)/.test(trimmed)) {
			const parsed = parsePhoneNumberFromString(trimmed.replace(/^00/, '+'));
			if (parsed?.country) {
				applyDetected(parsed.country, parsed.nationalNumber);
				return;
			}
		}

		const digits = trimmed.replace(/\D/g, '');
		const previousDigits = nationalNumber.replace(/\D/g, '');

		// A jump of more than one digit means a paste (or autofill), not typing.
		// Only then do we look for an embedded country code, so single-keystroke
		// typing is never disturbed.
		const isBulkInsert = digits.length - previousDigits.length > 1;
		if (isBulkInsert) {
			const detected = detectFromDigits(digits);
			if (
				detected &&
				(detected.country !== country || detected.national !== digits)
			) {
				applyDetected(detected.country, detected.national);
				return;
			}
		}

		// Plain typing stays a national number under the selected country.
		setNationalNumber(digits);
	};

	const handleCountryChange = (nextCountry: CountryCode) => {
		userSelectedCountryRef.current = true;
		setCountry(nextCountry);
	};

	// Resolves a pasted bare-digit string to a { country, national } pair. A full
	// number that includes a country code parses as a valid international number
	// (e.g. "905383192532" -> TR + "5383192532"), so that is tried first. A bare
	// national number parses as invalid international, so it falls back to the
	// currently selected country (e.g. TR + "5383192532").
	const detectFromDigits = (
		digits: string
	): { country: CountryCode; national: string } | null => {
		if (!digits) return null;
		const international = parsePhoneNumberFromString(`+${digits}`);
		if (international?.country && international.isValid()) {
			return {
				country: international.country,
				national: international.nationalNumber,
			};
		}
		if (
			country &&
			isValidPhoneNumber(`+${getCountryCallingCode(country)}${digits}`)
		) {
			return { country, national: digits };
		}
		return null;
	};

	const applyDetected = (nextCountry: CountryCode, national: string) => {
		userSelectedCountryRef.current = true;
		setCountry(nextCountry);
		setNationalNumber(toNationalDigits(national));
	};

	return (
		<Styled.Row>
			<Styled.CountryControl variant="standard">
				<InputLabel id="phone-country-label" shrink>
					{t('Code')}
				</InputLabel>
				<Select
					labelId="phone-country-label"
					value={country ?? ''}
					displayEmpty
					open={isMenuOpen}
					onOpen={() => setMenuOpen(true)}
					onChange={(event: SelectChangeEvent) =>
						handleCountryChange(event.target.value as CountryCode)
					}
					onClose={() => {
						setMenuOpen(false);
						setSearch('');
					}}
					renderValue={() =>
						selectedOption ? (
							<Styled.SelectedValue>
								<span className="PhoneNumberInput__flag">
									{getFlagEmoji(selectedOption.country)}
								</span>
								+{selectedOption.callingCode}
							</Styled.SelectedValue>
						) : (
							''
						)
					}
					MenuProps={{
						autoFocus: false,
						elevation: 3,
						anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
						transformOrigin: { vertical: 'top', horizontal: 'left' },
						PaperProps: { sx: { maxHeight: 360, width: 320 } },
					}}
				>
					<Styled.SearchBox disableSticky>
						<TextField
							size="small"
							autoFocus
							fullWidth
							variant="outlined"
							placeholder={t('Search country')}
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							onClick={(event) => event.stopPropagation()}
							onKeyDown={(event) => {
								// Let the Select close on Escape, but keep typing (incl. space)
								// inside the search field instead of triggering type-ahead.
								if (event.key !== 'Escape') {
									event.stopPropagation();
								}
							}}
						/>
					</Styled.SearchBox>

					{/* When closed, render only the selected value as a hidden item so the
					    Select's value stays in range without paying for ~245 items. */}
					{isMenuOpen
						? menuItems
						: selectedOption && (
								<MenuItem
									value={selectedOption.country}
									sx={{ display: 'none' }}
								/>
						  )}

					{isMenuOpen && visibleCount === 0 && (
						<Styled.NoResults>{t('No results')}</Styled.NoResults>
					)}
				</Select>
			</Styled.CountryControl>

			<Styled.NationalNumberField
				variant="standard"
				label={t('Phone number')}
				value={nationalNumber}
				autoFocus={autoFocus}
				error={!!error}
				helperText={error ? t('Enter a valid phone number') : undefined}
				onChange={(event) => handleNationalChange(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						onEnter?.();
					}
				}}
			/>
		</Styled.Row>
	);
};

export default PhoneNumberInput;
