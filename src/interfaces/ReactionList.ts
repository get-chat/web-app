import ChatMessageModel from '@src/api/models/ChatMessageModel';

interface ReactionList {
	[key: string]: ChatMessageModel[];
}

export default ReactionList;
