
export const fieldColumns: any[] = [
  { type: 'checkbox', width: 60 },
  { type: 'expand', width: 60, title: '更多' },
  { field: 'id', title: 'id', visible: false },
  {
    field: 'name',
    title: '字段名称',
    minWidth: 150,
    editRender: { autoFocus: 'input' },
  },
  {
    field: 'field',
    title: '字段标识',
    minWidth: 150,
    editRender: { autoFocus: 'input' },
  },
  {
    field: 'show',
    title: '显示',
    width: 70,
    editRender: {},
  },
  {
    field: 'binary',
    title: '二进制',
    width: 80,
    editRender: {},
  },
];
