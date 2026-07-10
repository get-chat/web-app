import {
	addPlus,
	isIndianPhoneNumber,
	isPhoneNumber,
	prepareWaId,
} from '@src/helpers/PhoneNumberHelper';

describe('PhoneNumberHelper', () => {
	describe('isPhoneNumber', () => {
		it('recognizes plain and "+"-prefixed phone numbers', () => {
			expect(isPhoneNumber('905383192532')).toBe(true);
			expect(isPhoneNumber('+905383192532')).toBe(true);
		});

		it('rejects BSUIDs (dotted / alphanumeric identifiers)', () => {
			expect(isPhoneNumber('US.123456789012345678')).toBe(false);
			expect(isPhoneNumber('TR.3926429744323742')).toBe(false);
			expect(isPhoneNumber('US.ENT.123abc')).toBe(false);
		});

		it('rejects empty / nullish input', () => {
			expect(isPhoneNumber('')).toBe(false);
			expect(isPhoneNumber(null)).toBe(false);
			expect(isPhoneNumber(undefined)).toBe(false);
		});
	});

	describe('prepareWaId', () => {
		it('strips formatting from phone numbers down to digits', () => {
			expect(prepareWaId('+90 538 319 25 32')).toBe('905383192532');
			expect(prepareWaId('(905) 383-19253')).toBe('90538319253');
		});

		it('returns BSUIDs untouched (does not strip dots/letters)', () => {
			expect(prepareWaId('US.123456789012345678')).toBe(
				'US.123456789012345678'
			);
			expect(prepareWaId('US.ENT.123abc')).toBe('US.ENT.123abc');
		});

		it('trims surrounding whitespace', () => {
			expect(prepareWaId('  US.123  ')).toBe('US.123');
		});

		it('passes through nullish input', () => {
			expect(prepareWaId(undefined)).toBeUndefined();
			expect(prepareWaId(null)).toBeUndefined();
		});
	});

	describe('isIndianPhoneNumber', () => {
		it('recognizes Indian (+91) phone numbers', () => {
			expect(isIndianPhoneNumber('919876543210')).toBe(true);
			expect(isIndianPhoneNumber('+919876543210')).toBe(true);
		});

		it('rejects phone numbers from other countries', () => {
			expect(isIndianPhoneNumber('905383192532')).toBe(false);
			// +1 (US) number containing 91 later in the number
			expect(isIndianPhoneNumber('19155550123')).toBe(false);
		});

		it('rejects BSUIDs and nullish input', () => {
			expect(isIndianPhoneNumber('IN.123456789012345678')).toBe(false);
			expect(isIndianPhoneNumber(undefined)).toBe(false);
			expect(isIndianPhoneNumber(null)).toBe(false);
		});
	});

	describe('addPlus', () => {
		it('prepends "+" to bare phone numbers', () => {
			expect(addPlus('905383192532')).toBe('+905383192532');
		});

		it('does not double up an existing "+"', () => {
			expect(addPlus('+905383192532')).toBe('+905383192532');
		});

		it('never prefixes a BSUID with "+"', () => {
			expect(addPlus('US.123456789012345678')).toBe('US.123456789012345678');
			expect(addPlus('US.ENT.123abc')).toBe('US.ENT.123abc');
		});

		it('passes through nullish input', () => {
			expect(addPlus(undefined)).toBeUndefined();
			expect(addPlus(null)).toBeNull();
		});
	});
});
