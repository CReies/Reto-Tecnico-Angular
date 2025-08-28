export type ColumnType = 'text' | 'image' | 'actions';

export interface ITableColumn {
	key: string;
	label: string;
	type: ColumnType;
}

export interface ITableData {
	columns: ITableColumn[];
	data: Record<string, any>[];
}
