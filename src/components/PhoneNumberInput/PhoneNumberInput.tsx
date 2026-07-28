import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	InputAdornment,
	MenuItem,
	MenuList,
	Popover,
	TextField,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTranslation } from 'react-i18next';
import {
	CountryCode,
	getCountries,
	getCountryCallingCode,
	isValidPhoneNumber,
	parsePhoneNumberFromString,
} from 'libphonenumber-js';
import { getFlagEmoji } from '@src/helpers/PhoneNumberHelper';
import SearchBar from '@src/components/SearchBar/SearchBar';
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

// Temporarily require only a non-empty number instead of a fully valid one.
// Flip to `true` to re-enable strict libphonenumber validation (the logic below
// is kept intact).
const STRICT_PHONE_VALIDATION = false;

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
	const countryAnchorRef = useRef<HTMLDivElement>(null);

	// Only toggles visibility. The search is cleared after the close animation
	// finishes (Popover onExited) so the list doesn't visibly re-expand while the
	// menu is animating out.
	const closeMenu = () => setMenuOpen(false);

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

	const filteredOptions = useMemo(
		() => options.filter((option) => optionMatches(option, search)),
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
		// Reaching here already means a country + non-empty digits, so the "empty
		// check" is satisfied; strict validation is applied only when enabled.
		const isValid = STRICT_PHONE_VALIDATION ? isValidPhoneNumber(value) : true;
		onChangeRef.current(value, isValid);
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

	// Prebuild the rows so opening the menu doesn't rebuild ~245 elements each
	// render. Ripple is disabled to keep mounting the list light (the biggest
	// cost when the menu opens/closes).
	const optionItems = useMemo(
		() =>
			filteredOptions.map((option) => (
				<MenuItem
					key={option.country}
					selected={option.country === country}
					disableRipple
					onClick={() => {
						handleCountryChange(option.country);
						closeMenu();
					}}
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
		// handleCountryChange / closeMenu only call state setters, so their
		// captured closures stay valid across renders.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[filteredOptions, country]
	);

	return (
		<Styled.Row>
			<Styled.CountryControl ref={countryAnchorRef}>
				<Styled.CountryTrigger
					variant="standard"
					label={t('Code')}
					InputLabelProps={{ shrink: true }}
					value={selectedOption ? `+${selectedOption.callingCode}` : ''}
					onClick={() => setMenuOpen(true)}
					InputProps={{
						readOnly: true,
						startAdornment: selectedOption ? (
							<InputAdornment position="start">
								<span className="PhoneNumberInput__flag">
									{getFlagEmoji(selectedOption.country)}
								</span>
							</InputAdornment>
						) : null,
						endAdornment: (
							<InputAdornment position="end">
								<ArrowDropDownIcon />
							</InputAdornment>
						),
					}}
				/>
			</Styled.CountryControl>

			<Popover
				open={isMenuOpen}
				anchorEl={countryAnchorRef.current}
				onClose={closeMenu}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: 'left' }}
				elevation={3}
				disableScrollLock
				TransitionProps={{ onExited: () => setSearch('') }}
				// The Paper clips its rounded corners; the search stays fixed at the
				// top while only the options list below scrolls.
				PaperProps={{ sx: { width: 320, overflow: 'hidden' } }}
			>
				<Styled.SearchHeader>
					<SearchBar
						value={search}
						onChange={setSearch}
						placeholder={t('Search country')}
						autoFocus
					/>
				</Styled.SearchHeader>

				<Styled.OptionsScroller>
					<MenuList autoFocusItem={false} disablePadding>
						{optionItems}

						{filteredOptions.length === 0 && (
							<Styled.NoResults>{t('No results')}</Styled.NoResults>
						)}
					</MenuList>
				</Styled.OptionsScroller>
			</Popover>

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
