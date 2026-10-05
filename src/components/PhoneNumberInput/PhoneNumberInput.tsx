import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
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
import { FieldError, FieldLabel } from '@src/components/ui/field';
import { Input } from '@src/components/ui/input';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from '@src/components/ui/input-group';
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from '@src/components/ui/popover';

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

	const id = useId();

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
	const countryInputRef = useRef<HTMLInputElement>(null);

	// Only toggles visibility. The search is cleared when the menu opens again
	// rather than on close, so the list doesn't visibly re-expand while the menu
	// is animating out.
	const closeMenu = () => setMenuOpen(false);

	// Clicking the field while the menu is open closes it, as MUI's backdrop did
	const toggleMenu = () => {
		if (!isMenuOpen) {
			setSearch('');
		}
		setMenuOpen(!isMenuOpen);
	};

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
	// render.
	const optionItems = useMemo(() => {
		// Like MUI's MenuList, only the selected row (or the first one) is in the
		// tab order; the arrow keys move between rows
		const hasSelected = filteredOptions.some(
			(option) => option.country === country
		);

		return filteredOptions.map((option, index) => {
			const isSelected = option.country === country;

			return (
				<Styled.OptionButton
					key={option.country}
					type="button"
					role="option"
					aria-selected={isSelected}
					tabIndex={isSelected || (!hasSelected && index === 0) ? 0 : -1}
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
				</Styled.OptionButton>
			);
		});
		// handleCountryChange / closeMenu only call state setters, so their
		// captured closures stay valid across renders.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filteredOptions, country]);

	// MUI MenuList's keyboard navigation: arrows wrap around, Home/End jump
	const handleOptionsKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		const items = Array.from(
			event.currentTarget.querySelectorAll<HTMLElement>('[role="option"]')
		);
		if (items.length === 0) return;

		const index = items.indexOf(document.activeElement as HTMLElement);
		let nextIndex: number | undefined;

		switch (event.key) {
			case 'ArrowDown':
				nextIndex = (index + 1) % items.length;
				break;
			case 'ArrowUp':
				nextIndex = index <= 0 ? items.length - 1 : index - 1;
				break;
			case 'Home':
				nextIndex = 0;
				break;
			case 'End':
				nextIndex = items.length - 1;
				break;
		}

		if (nextIndex !== undefined) {
			event.preventDefault();
			items[nextIndex].focus();
		}
	};

	return (
		<Styled.Row>
			<Popover
				open={isMenuOpen}
				onOpenChange={(isOpen) => !isOpen && closeMenu()}
			>
				<PopoverAnchor asChild>
					<Styled.CountryControl ref={countryAnchorRef}>
						<Styled.CountryTrigger className="gap-1.5">
							<FieldLabel htmlFor={`${id}-country`}>{t('Code')}</FieldLabel>
							<InputGroup onClick={toggleMenu}>
								{selectedOption && (
									<InputGroupAddon align="inline-start">
										<span className="PhoneNumberInput__flag">
											{getFlagEmoji(selectedOption.country)}
										</span>
									</InputGroupAddon>
								)}
								<InputGroupInput
									ref={countryInputRef}
									id={`${id}-country`}
									value={selectedOption ? `+${selectedOption.callingCode}` : ''}
									readOnly
									aria-haspopup="listbox"
									aria-expanded={isMenuOpen}
								/>
								<InputGroupAddon align="inline-end">
									<ArrowDropDownIcon className="size-6" />
								</InputGroupAddon>
							</InputGroup>
						</Styled.CountryTrigger>
					</Styled.CountryControl>
				</PopoverAnchor>

				<PopoverContent
					side="bottom"
					align="start"
					// The search stays fixed at the top while only the options list
					// below scrolls
					className="flex w-80 flex-col overflow-hidden p-0"
					// The field toggles the menu itself
					onInteractOutside={(event) => {
						if (countryAnchorRef.current?.contains(event.target as Node)) {
							event.preventDefault();
						}
					}}
					// Return focus to the field, unless the user moved it elsewhere
					onCloseAutoFocus={(event) => {
						event.preventDefault();
						if (
							!document.activeElement ||
							document.activeElement === document.body
						) {
							countryInputRef.current?.focus();
						}
					}}
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
						<div
							role="listbox"
							aria-label={t('Code')}
							onKeyDown={handleOptionsKeyDown}
						>
							{optionItems}

							{filteredOptions.length === 0 && (
								<Styled.NoResults>{t('No results')}</Styled.NoResults>
							)}
						</div>
					</Styled.OptionsScroller>
				</PopoverContent>
			</Popover>

			<Styled.NationalNumberField
				className="gap-1.5"
				data-invalid={!!error || undefined}
			>
				<FieldLabel htmlFor={`${id}-national-number`}>
					{t('Phone number')}
				</FieldLabel>
				<Input
					id={`${id}-national-number`}
					value={nationalNumber}
					autoFocus={autoFocus}
					aria-invalid={!!error || undefined}
					onChange={(event) => handleNationalChange(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							onEnter?.();
						}
					}}
				/>
				{error && <FieldError>{t('Enter a valid phone number')}</FieldError>}
			</Styled.NationalNumberField>
		</Styled.Row>
	);
};

export default PhoneNumberInput;
