// components/Inventory.js

import React, { useState, useEffect } from 'react';
import useAuthAxios from '../../../hooks/useAuthAxios';
import InventoryForm from './InventoryForm';
import {
    Box, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, Pagination, Stack, Paper, CircularProgress, Alert
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { TuneIcon } from '@mui/icons-material/Tune';
import { useAuth } from '../../../context/AuthProvider';

import GeneralFilter from '../../generallyshared/GeneralFilter';
import SearchBox from '../../generallyshared/SearchBox';
import ConfirmationDialog from '../../generallyshared/ConfirmationDialog';
import VisibilityToggleButton from '../../generallyshared/VisibilityToggleButton';
import AddUnitButton from '../../generallyshared/AddUnitButton';


const Inventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [filters, setFilters] = useState({ 
        start_date: '', end_date: '', category: '', location: '' });
    const [isFilterVisible, setIsFilterVisible] = useState(false); // Control filter visibility

    const { isAuthenticated } = useAuth();
    const api = useAuthAxios();

    useEffect(() => {
        if (isAuthenticated) {
            fetchItems();
        }
    }, [search, filters, page, isAuthenticated]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await api.get('inventory-items/', {
                params: {
                    page,
                    ...(filters.location && { location: filters.location }),
                    ...(filters.category && { category: filters.category }),
                    ...(filters.start_date && { start_date: filters.start_date }),
                    ...(filters.end_date && { end_date: filters.end_date }),
                    ...(search && { search })
                }
            });
            setItems(response.data.results);
            const pageSize = 10;
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

    const handleAddItem = () => {
        setEditingItem(null);
        setShowForm(true);
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleOpenDelete = (id) => {
        setDeleteId(id);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await api.delete(`inventory-items/${deleteId}/`);
            fetchItems();
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const handleCloseDelete = () => {
        setOpenDeleteDialog(false);
        setDeleteId(null);
    };

    const handleFilterVisibilityToggle = () => {
        setIsFilterVisible(prev => !prev);
    };

    if (!isAuthenticated) {
        return <p>You must be logged in to view this page.</p>;
    }

    return (
        <div>
            <Typography variant="h4" gutterBottom>Inventory</Typography>

            {/* Search, Filter, and Add Item Button */}
            <Box display="flex" justifyContent="space-between" sx= {{ alignItems: "center", mb: 2 }} >
                <Box display="flex" alignItems="center" gap={1}>
                    <SearchBox searchTerm={search} onSearchChange={handleSearchChange} onSearch={handleSearch} />
                    <VisibilityToggleButton
                        onClick={handleFilterVisibilityToggle} 
                        isFilterVisible={isFilterVisible}
                    />
                </Box>
                <AddUnitButton onClick={handleAddItem} />

            </Box>
            <Box display="flex" alignItems="center" justifyContent="center">
                {isFilterVisible && (
                    <GeneralFilter 
                        filters={filters} 
                        setFilters={setFilters} 
                        hiddenFields={['from_location', 'to_location', 'adjustment_type', 'item_name']}
                        visible={isFilterVisible}
                    />
                )}
            </Box>

            {/* Inventory Items Display */}
            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Product Code</TableCell>
                            <TableCell>Item Name</TableCell>
                            <TableCell>Supplier Name</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>SKU</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell align="right" sx={{ paddingRight: '90px' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center">
                                    <Alert severity="info">No results found</Alert>
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.inventory_date}</TableCell>
                                    <TableCell>{item.category ? item.category_name : 'N/A'}</TableCell>
                                    <TableCell>{item.product_code}</TableCell>
                                    <TableCell>{item.item_name}</TableCell>
                                    <TableCell>{item.supplier_name}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.sku}</TableCell>
                                    <TableCell>{item.location ? item.location_name : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleEditItem(item)}>Edit</Button>
                                        <Button onClick={() => handleOpenDelete(item.id)} color="error">Delete</Button>
                                    </TableCell>
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

            {/* Inventory Form */}
            {showForm && (
                <InventoryForm
                    item={editingItem}
                    onClose={() => setShowForm(false)}
                    onSave={fetchItems}
                />
            )}

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={openDeleteDialog}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this item?<br /><small style='font-style: italic;'>This data will be permanently lost upon deletion.</small>"
            />
        </div>
    );
};

export default Inventory;
