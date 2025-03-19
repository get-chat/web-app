import { AxiosError, CancelToken } from 'axios';

interface APICallProps {
	cancelToken?: CancelToken;
	onSuccess?: (response: any) => void;
	onError?: (error: AxiosError) => void;
}

export default APICallProps;
