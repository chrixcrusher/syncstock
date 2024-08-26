const currentInventoryConfig = {
  apiEndpoint: 'total-current-inventory/',
  chartTitle: 'Current Inventory Analytics',
  filtersConfig: {
    category: '',
    location: '',
    item_name: ''
  },
  hiddenFields: ['from_location', 'to_location', 'adjustment_type', 'start_date', 'end_date'],
  mappedData: (item) => ({
      item_name: item.item_name,
      total_quantity: item.total_current_inventory
  })
};

export default currentInventoryConfig;
