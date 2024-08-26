import formatDate from '../../utils/formatDate';

const transferConfig = {
  apiEndpoint: 'aggregated-stock-adjusments/',
  chartTitle: 'Stock Transfer Analytics',
  filtersConfig: {
    start_date: '',
    end_date: '',
    category: '',
    location: '',
    item_name: ''
  },
  hiddenFields: ['location', 'adjustment_type'],
  mappedData: (item, group_by) => ({
    date: formatDate(item.trunc_date, group_by),  // Format date based on group_by
    total_quantity: item.total_quantity,
  })
};

export default transferConfig;
