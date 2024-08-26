import React, { useState, useEffect } from 'react';
import useAuthAxios from '../../../hooks/useAuthAxios';
import {
    Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Pagination, Stack, Paper, CircularProgress, Alert
} from '@mui/material';
import { Add } from '@mui/icons-material';
import AdjustmentForm from './AdjustmentForm';
import { useAuth } from '../../../context/AuthProvider';

import GeneralFilter from '../../generallyshared/GeneralFilter';
import SearchBox from '../../generallyshared/SearchBox';
import ConfirmationDialog from '../../generallyshared/ConfirmationDialog';
import VisibilityToggleButton from '../../generallyshared/VisibilityToggleButton';
import AddUnitButton from '../../generallyshared/AddUnitButton';



const Adjustment = () => {
    const [adjustments, setAdjustments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ start_date: '', end_date: '', adjustment_type: '', location: '', item: '' });
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingAdjustment, setEditingAdjustment] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteId, setDeleteId] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false); // Control filter visibility

    const { isAuthenticated } = useAuth();
    const api = useAuthAxios();

    useEffect(() => {
        if (isAuthenticated) {
            fetchAdjustments();
        }
    }, [filters, search, page, isAuthenticated]);

    const fetchAdjustments = async () => {
        try {
            setLoading(true);
            const response = await api.get('stock-adjustments/', {
                params: {
                    page,
                    search: search,
                    ...(filters.adjustment_type && { adjustment_type: filters.adjustment_type }),
                    ...(filters.location && { location: filters.location }),
                    ...(filters.item && { item: filters.item }),
                    ...(filters.start_date && { start_date: filters.start_date }),
                    ...(filters.end_date && { end_date: filters.end_date }),
                }
            });
            setAdjustments(response.data.results);
            const pageSize = 10;
            const count = parseInt(response.data.count, 10);
            setTotalPages(Math.ceil(count / pageSize));
        } catch (error) {
            console.error('Error fetching adjustments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleAddAdjustment = () => {
        setEditingAdjustment(null);
        setShowForm(true);
    };

    const handleEditAdjustment = (adjustment) => {
        setEditingAdjustment(adjustment);
        setShowForm(true);
    };

    // Opens the delete confirmation dialog
    const handleOpenDeleteDialog = (id) => {
        setDeleteId(id);
        setOpenDeleteDialog(true);
    };

    // Confirms the deletion of an adjustment
    const handleConfirmDelete = async () => {
        try {
            await api.delete(`stock-adjustments/${deleteId}/`);
            fetchAdjustments();
        } catch (error) {
            console.error('Error deleting adjustment:', error);
        } finally {
            setOpenDeleteDialog(false);
            setDeleteId(null);
        }
    };

    // Cancels the deletion action and closes the dialog
    const handleCancelDelete = () => {
        setOpenDeleteDialog(false);
        setDeleteId(null);
    };

    const handleSearchChange = (e) => setSearch(e.target.value);

    const handleSearch = () => {
        fetchAdjustments();
    };

    const handleFilterVisibilityToggle = () => {
        setIsFilterVisible(prev => !prev);
    };

    if (!isAuthenticated) {
        return <p>You must be logged in to view this page.</p>;
    }

    return (
        <div>
            <Typography variant="h4" gutterBottom>Stock Adjustments</Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                {/* Search and Filters Section */}
                <Box display="flex" alignItems="center">
                    {/* Search Section */}
                    <SearchBox searchTerm={search} onSearchChange={handleSearchChange} onSearch={handleSearch} />
                    <VisibilityToggleButton
                        onClick={handleFilterVisibilityToggle} 
                        isFilterVisible={isFilterVisible}
                    />
                </Box>
                <AddUnitButton onClick={handleAddAdjustment} />
            </Box>
            <Box display="flex" alignItems="center" justifyContent="center">
                {isFilterVisible && (
                    <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                        <GeneralFilter 
                            filters={filters} 
                            setFilters={setFilters} 
                            hiddenFields={['from_location', 'to_location', 'adjustment_type', 'item_name']}
                            visible={isFilterVisible}
                        />
                    </Box>
                )}
            </Box>

            

            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Product Code</TableCell>
                            <TableCell>Item Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>SKU</TableCell>
                            <TableCell>Location Name</TableCell>
                            <TableCell align="right" sx={{ paddingRight: '110px' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : adjustments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    <Alert severity="info">No adjustments found</Alert>
                                </TableCell>
                            </TableRow>
                        ) : (
                            adjustments.map(adjustment => (
                                <TableRow key={adjustment.id}>
                                    <TableCell>{new Date(adjustment.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{adjustment.category_name}</TableCell>
                                    <TableCell>{adjustment.product_code}</TableCell>
                                    <TableCell>{adjustment.item_name || 'N/A'}</TableCell>
                                    <TableCell>{adjustment.adjustment_type}</TableCell>
                                    <TableCell>{adjustment.quantity}</TableCell>
                                    <TableCell>{adjustment.sku}</TableCell>
                                    <TableCell>{adjustment.location_name || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleEditAdjustment(adjustment)}>Edit</Button>
                                        <Button onClick={() => handleOpenDeleteDialog(adjustment.id)} color="error">Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Stack spacing={2} alignItems="center" style={{ marginTop: '20px' }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Stack>

            {showForm && (
                <AdjustmentForm
                    adjustment={editingAdjustment}
                    onClose={() => setShowForm(false)}
                    onSave={fetchAdjustments}
                />
            )}

            {/* Reusable Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={openDeleteDialog}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this adjustment?<br />
                        <small style='font-style: italic;'>This data will be permanently lost upon deletion.</small>"
            />
        </div>
    );
};

export default Adjustment;
