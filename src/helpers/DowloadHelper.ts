import axios from 'axios';
import fileDownload from 'js-file-download';
import { mimeToExtension } from '@src/helpers/ImageHelper';
import { generateUniqueID } from '@src/helpers/Helpers';

interface DownloadData {
	source: string;
}

/**
 * The function downloads a file from a given source and saves it with a unique filename.
 * @param {DownloadData} data - DownloadData, which is likely an interface or type defining the
 * properties of an object that contains information needed to download a file. It probably includes a
 * "source" property indicating the URL of the file to be downloaded.
 * @returns If the `source` property of the `data` object is not truthy, nothing is returned.
 * Otherwise, an HTTP GET request is made to the `source` URL using Axios, with the `responseType` set
 * to `'blob'`. If the request is successful, the response data is downloaded as a file with a unique
 * filename generated using the `mimeToExtension` and `generateUnique
 */

export const download = (data: DownloadData) => {
	if (!data.source) return;
	axios
		.get(data.source, {
			responseType: 'blob',
		})
		.then((res) => {
			const extension = mimeToExtension(res.headers['content-type']);
			const fileName = `getchat_${generateUniqueID()}.${extension}`;
			fileDownload(res.data, fileName);
		})
		.catch((error) => {
			console.log(error);
			if (error.response === undefined) {
				window.open(data.source, '_blank');
			}
		});
};
