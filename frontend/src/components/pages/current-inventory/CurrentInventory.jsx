import React, { useState, useEffect } from 'react';
import useAuthAxios from '../../../hooks/useAuthAxios';
import { Box, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Pagination, Stack, Paper, CircularProgress, Alert } from '@mui/material';

import GeneralFilter from '../../generallyshared/GeneralFilter';
import SearchBox from '../../generallyshared/SearchBox';
import ConfirmationDialog from '../../generallyshared/ConfirmationDialog';
import VisibilityToggleButton from '../../generallyshared/VisibilityToggleButton';


const CurrentInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', location: '' });
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showZeroStock, setShowZeroStock] = useState(false); // State to toggle visibility of zero-stock items
  const [isFilterVisible, setIsFilterVisible] = useState(false); // Control filter visibility


  const api = useAuthAxios(); // Ensure this instance is configured properly

  useEffect(() => {
    fetchItems();
  }, [search, filters, sortOrder, page]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('total-current-inventory/', {
        params: {
          page,
          ...(filters.category && { category: filters.category }),
          ...(filters.location && { location: filters.location }),
          ...(search && { search }),
          ordering: sortOrder === 'asc' ? 'total_current_inventory' : '-total_current_inventory',
        }
      });
      setItems(response.data.results);
      const pageSize = 10; // Adjust this value to your known page size
      const count = parseInt(response.data.count, 10);
      setTotalPages(Math.ceil(count / pageSize));
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => setSearch(e.target.value);

  const handleSearch = () => {
    fetchItems();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const handleZeroStockToggle = () => {
    setShowZeroStock(prevShowZeroStock => !prevShowZeroStock);
  };

  // Filter items based on showZeroStock state
  const filteredItems = showZeroStock
    ? items
    : items.filter(item => item.total_current_inventory > 0);

  const handleFilterVisibilityToggle = () => {
    setIsFilterVisible(prev => !prev);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Total Current Inventory</Typography>

      <Box display="flex" justifyContent="space-between" sx= {{ alignItems: "center", mb: 2 }} >
          <Box display="flex" alignItems="center" gap={1}>
              <SearchBox searchTerm={search} onSearchChange={handleSearchChange} onSearch={handleSearch} />
              <VisibilityToggleButton
                  onClick={handleFilterVisibilityToggle} 
                  isFilterVisible={isFilterVisible}
              />
          </Box>
        <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="outlined"
              onClick={handleSortOrderToggle}
              color="primary"
              sx={{ height: '45px' }}
            >
              Sort by Quantity: {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleZeroStockToggle}
              color="primary"
              sx={{ height: '45px' }}
            >
              {showZeroStock ? 'Hide Zero Stock' : 'Show Zero Stock'}
            </Button>
          </Box>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="center">
          {isFilterVisible && (
              <GeneralFilter 
                  filters={filters} 
                  setFilters={setFilters} 
                  hiddenFields={['from_location', 'to_location', 'adjustment_type', 'item_name', 'start_date', 'end_date']}
                  visible={isFilterVisible}
              />
          )}
      </Box>

      {/* Inventory Items Display */}
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Product Code</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Total Quantity</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="info">No results found</Alert>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.category_name}</TableCell>
                  <TableCell>{item.item_name}</TableCell>
                  <TableCell>{item.product_code}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.total_current_inventory}</TableCell>
                  <TableCell>{item.location_name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Stack spacing={2} alignItems="center" style={{ marginTop: '20px' }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Stack>
    </div>
  );
};

export default CurrentInventory;
