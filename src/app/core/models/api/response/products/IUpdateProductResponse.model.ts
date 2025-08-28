export interface IUpdateProductResponse {
	message: string;
	data: {
		name: string;
		description: string;
		logo: string;
		date_release: string;
		date_revision: string;
	};
}
