import React, { useState, useEffect } from 'react';
import { MenuItem, Select, FormControl, InputLabel, TextField, Button } from '@mui/material';
import useAuthAxios from '../../hooks/useAuthAxios';

const GeneralFilter = ({
  filters,
  setFilters,
  hiddenFields = [],
  visible
}) => {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [items, setItems] = useState([]);
  const [fromLocations, setFromLocations] = useState([]);
  const [toLocations, setToLocations] = useState([]);
  const [adjustmentTypes, setAdjustmentTypes] = useState([
    { value: 'remove', label: 'Remove' },
    { value: 'missing', label: 'Missing' },
    { value: 'damage', label: 'Damage' },
    { value: 'expired', label: 'Expired' },
    { value: 'sold', label: 'Sold' },
  ]);

  const api = useAuthAxios();

  useEffect(() => {
    const fetchFilterChoices = async () => {
      try {
        const response = await api.get('filters/');

        // Filter unique items by 'item_name'
        const uniqueItems = Array.from(
          new Map(response.data.items.map(item => [item.item_name, item])).values()
        );

        setCategories(response.data.categories || []);
        setLocations(response.data.locations || []);
        setItems(uniqueItems || []);
        setFromLocations(response.data.from_locations || []);
        setToLocations(response.data.to_locations || []);
      } catch (error) {
        console.error('Error fetching filter choices:', error);
      }
    };

    fetchFilterChoices();
  }, [api]);

  useEffect(() => {
    // Update category when item changes
    const selectedItem = items.find(item => item.item_name === filters.item_name);
    if (selectedItem) {
      setFilters(prev => ({
        ...prev,
        category: selectedItem.category // Assuming item has a 'category' property
      }));
    }
  }, [filters.item_name, items, setFilters]);

  const handleChange = (field) => (event) => {
    setFilters(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleReset = () => {
    setFilters({
      category: '',
      location: '',
      from_location: '',
      to_location: '',
      start_date: '',
      end_date: '',
      item_name: '',
      adjustment_type: ''
    });
  };

  // Prepare filter parameters, excluding hidden fields
  const prepareFilters = () => {
    const appliedFilters = { ...filters };

    if (hiddenFields.length) {
      hiddenFields.forEach(field => {
        delete appliedFilters[field];
      });
    }

    return appliedFilters;
  };

  useEffect(() => {
    const applyFilters = () => {
      const filtersToApply = prepareFilters();
      // Example: fetchDataAndUpdateCharts(filtersToApply);
    };

    applyFilters();
  }, [filters]);

  if (!visible) return null; // Hide the component if not visible

  // Determine if category should be disabled
  const isCategoryDisabled = !!filters.item_name;

  return (
    <div>
      {!hiddenFields.includes('item_name') && (
        <FormControl sx={{ m: 1, minWidth: 105 }} disabled={hiddenFields.includes('item_name')}>
          <InputLabel id="item-label">Item</InputLabel>
          <Select
            labelId="item-label"
            value={filters.item_name || ''}
            onChange={handleChange('item_name')}
            label="Item"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {items.length > 0 ? (
              items.map((item) => (
                <MenuItem key={item.item_name} value={item.item_name}>
                  {item.item_name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No items available</MenuItem>
            )}
          </Select>
        </FormControl>
      )}

      {!hiddenFields.includes('category') && (
        <FormControl sx={{ m: 1, minWidth: 105 }} disabled={isCategoryDisabled}>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            value={filters.category || ''}
            onChange={handleChange('category')}
            label="Category"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {categories.length > 0 ? (
              categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No categories available</MenuItem>
            )}
          </Select>
        </FormControl>
      )}

      {/* Rest of the fields follow... */}

      {!hiddenFields.includes('location') && (
        <FormControl sx={{ m: 1, minWidth: 105 }} disabled={hiddenFields.includes('location')}>
          <InputLabel id="location-label">Location</InputLabel>
          <Select
            labelId="location-label"
            value={filters.location || ''}
            onChange={handleChange('location')}
            label="Location"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {locations.length > 0 ? (
              locations.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No locations available</MenuItem>
            )}
          </Select>
        </FormControl>
      )}

      {!hiddenFields.includes('from_location') && (
        <FormControl sx={{ m: 1, minWidth: 105 }} disabled={hiddenFields.includes('from_location')}>
          <InputLabel id="from-location-label">From Location</InputLabel>
          <Select
            labelId="from-location-label"
            value={filters.from_location || ''}
            onChange={handleChange('from_location')}
            label="From Location"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {fromLocations.length > 0 ? (
              fromLocations.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No from locations available</MenuItem>
            )}
          </Select>
        </FormControl>
      )}

      {!hiddenFields.includes('to_location') && (
        <FormControl sx={{ m: 1, minWidth: 105 }} disabled={hiddenFields.includes('to_location')}>
          <InputLabel id="to-location-label">To Location</InputLabel>
          <Select
            labelId="to-location-label"
            value={filters.to_location || ''}
            onChange={handleChange('to_location')}
            label="To Location"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {toLocations.length > 0 ? (
              toLocations.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No to locations available</MenuItem>
            )}
          </Select>
        </FormControl>
      )}

      {!hiddenFields.includes('adjustment_type') && (
        <FormControl sx={{ m: 1, minWidth: 105 }} disabled={hiddenFields.includes('adjustment_type')}>
          <InputLabel id="adjustment-type-label">Type</InputLabel>
          <Select
            labelId="adjustment-type-label"
            value={filters.adjustment_type || ''}
            onChange={handleChange('adjustment_type')}
            label="Type"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {adjustmentTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {!hiddenFields.includes('start_date') && (
        <TextField
          label="Start Date"
          type="date"
          value={filters.start_date || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          sx={{ m: 1, minWidth: 105 }}
          disabled={hiddenFields.includes('start_date')}
        />
      )}

      {!hiddenFields.includes('end_date') && (
        <TextField
          label="End Date"
          type="date"
          value={filters.end_date || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          sx={{ m: 1, minWidth: 105 }}
          disabled={hiddenFields.includes('end_date')}
        />
      )}

      <Button
        variant="outlined"
        color="secondary"
        onClick={handleReset}
        alignItems="center"
        sx={{ m: 1, height: '52.09px' }}
      >
        Reset
      </Button>
    </div>
  );
};

export default GeneralFilter;
