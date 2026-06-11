// Builds the SPA route for a chat. The identifier is URL-encoded so BSUID ids
// (which contain dots/letters, e.g. "US.123456789012345678") survive routing
// instead of being treated as a static-file request; useParams() decodes it
// symmetrically on read. Centralized here so encoding can't be forgotten at a
// new navigation call site.
export const getChatPath = (waId: string | undefined | null): string =>
	`/main/chat/${encodeURIComponent(waId ?? '')}`;
