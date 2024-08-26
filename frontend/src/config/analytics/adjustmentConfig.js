import formatDate  from '../../utils/formatDate';

const adjustmentConfig = {
  apiEndpoint: 'aggregated-stock-adjusments/',
  chartTitle: 'Stock Adjustment Analytics',
  filtersConfig: {
    start_date: '',
    end_date: '',
    category: '',
    location: '',
    item_name: ''
  },
  hiddenFields: ['from_location', 'to_location'],
  mappedData: (item, group_by) => ({
    date: formatDate(item.trunc_date, group_by),  // Format date based on group_by
    total_quantity: item.total_quantity,
  })
};

export default adjustmentConfig;
