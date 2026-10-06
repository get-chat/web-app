// Shared by the panels above the chat footer: templates, quick replies and
// interactive messages

/** The panel's root, under the chat body */
export const footerPanelClassName = 'border-l border-[lightgray] px-2.5 pb-2.5';

/** The rounded, tinted box around the list */
export const footerPanelBoxClassName =
	'overflow-hidden rounded-[10px] bg-[#6843301f]';

/** The scrolling list of items */
export const footerPanelListClassName =
	'max-h-[290px] flex-1 overflow-y-auto p-3.75';

/** A quick reply or template row: its bubble and send/delete buttons */
export const footerPanelItemClassName = 'mb-2.5 flex last:mb-0';

/** The bubble of a quick reply or template */
export const footerPanelBubbleClassName = 'mb-0 self-center';

/** The text when the list is empty */
export const footerPanelEmptyClassName = 'mt-3.75 text-[15px] text-chat-icon';
