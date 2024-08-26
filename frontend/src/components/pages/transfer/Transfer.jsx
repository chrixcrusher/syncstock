import React, { useState, useEffect } from 'react';
import useAuthAxios from '../../../hooks/useAuthAxios';
import {
    Box, Button, TextField, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, Pagination, Stack, Paper, CircularProgress,
    Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { Add } from '@mui/icons-material';
import TransferForm from './TransferForm';
import { useAuth } from '../../../context/AuthProvider';

import GeneralFilter from '../../generallyshared/GeneralFilter';
import SearchBox from '../../generallyshared/SearchBox';
import ConfirmationDialog from '../../generallyshared/ConfirmationDialog';
import VisibilityToggleButton from '../../generallyshared/VisibilityToggleButton';
import AddUnitButton from '../../generallyshared/AddUnitButton';

const Transfer = () => {
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ start_date: '', end_date: '', category: '', from_location: '', to_location: '' });
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingTransfer, setEditingTransfer] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isFilterVisible, setIsFilterVisible] = useState(false); // Control filter visibility

    const { isAuthenticated } = useAuth();
    const api = useAuthAxios();

    useEffect(() => {
        if (isAuthenticated) {
            fetchTransfers();
        }
    }, [filters, search, page, isAuthenticated]);

    const fetchTransfers = async () => {
        try {
            setLoading(true);
            const response = await api.get('stock-transfers/', {
                params: {
                    page,
                    search: search,
                    ...(filters.category && { category: filters.category }),
                    ...(filters.from_location && { from_location: filters.from_location }),
                    ...(filters.to_location && { to_location: filters.to_location }),
                    ...(filters.start_date && { start_date: filters.start_date }),
                    ...(filters.end_date && { end_date: filters.end_date }),
                }
            });
            setTransfers(response.data.results);
            const pageSize = 10;
            const count = parseInt(response.data.count, 10);
            setTotalPages(Math.ceil(count / pageSize));
        } catch (error) {
            console.error('Error fetching transfers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    

    const handleSearchChange = (event) => { setSearch(event.target.value);
        };

    const handleSearch = () => {
        fetchTransfers();
    };


    const handleAddTransfer = () => {
        setEditingTransfer(null);
        setShowForm(true);
    };

    const handleEditTransfer = (transfer) => {
        setEditingTransfer(transfer);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingTransfer(null);
    };

    const handleOpenDeleteDialog = (id) => {
        setDeleteId(id);
        setOpenDeleteDialog(true);
    };

    const handleCloseDelete = () => {
        setOpenDeleteDialog(false);
        setDeleteId(null);
    };

    const handleConfirmDelete = async () => {
        try {
            await api.delete(`stock-transfers/${deleteId}/`);
            fetchTransfers();
        } catch (error) {
            console.error('Error deleting transfer:', error);
        } finally {
            setOpenDeleteDialog(false);
            setDeleteId(null);
        }
    };

    const handleFilterVisibilityToggle = () => {
        setIsFilterVisible(prev => !prev);
    };

    if (!isAuthenticated) {
        return <div style={{ textAlign: 'center' }}>You are not authenticated. Please log in.</div>;
    }

    return (
        <>
            <Typography variant="h4" gutterBottom>Stock Location Transfer</Typography>

            {/* Search, Filter, and Add Item Button */}
            <Box display="flex" justifyContent="space-between" sx= {{ alignItems: "center", mb: 2 }} >
                <Box display="flex" alignItems="center" gap={1}>
                    <SearchBox searchTerm={search} onSearchChange={handleSearchChange} onSearch={handleSearch} />
                    <VisibilityToggleButton
                        onClick={handleFilterVisibilityToggle} 
                        isFilterVisible={isFilterVisible}
                    />
                </Box>
                <AddUnitButton onClick={handleAddTransfer} />

            </Box>
            <Box display="flex" alignItems="center" justifyContent="center">
                {isFilterVisible && (
                    <GeneralFilter 
                        filters={filters} 
                        setFilters={setFilters} 
                        hiddenFields={['from_location', 'to_location', 'item_name']}
                        visible={isFilterVisible}
                    />
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
                            <TableCell>Quantity</TableCell>
                            <TableCell>SKU</TableCell>
                            <TableCell>Origin</TableCell>
                            <TableCell>Destination</TableCell>
                            <TableCell align="right" sx={{ paddingRight: '95px' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : transfers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    <Alert severity="info">No transfers found</Alert>
                                </TableCell>
                            </TableRow>
                        ) : (transfers.map((transfer) => (
                            <TableRow key={transfer.id}>
                                <TableCell>{transfer.date}</TableCell>
                                <TableCell>{transfer.category_name}</TableCell>
                                <TableCell>{transfer.product_code}</TableCell>
                                <TableCell>{transfer.item_name}</TableCell>
                                <TableCell>{transfer.quantity}</TableCell>
                                <TableCell>{transfer.sku}</TableCell>
                                <TableCell>{transfer.from_location_name}</TableCell>
                                <TableCell>{transfer.to_location_name}</TableCell>
                                <TableCell>
                                    <Button color="primary" onClick={() => handleEditTransfer(transfer)}>
                                        Edit
                                    </Button>
                                    <Button color="error" onClick={() => handleOpenDeleteDialog(transfer.id)} sx={{ ml: 1 }}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Stack spacing={2} sx={{ mt: 2 }} alignItems="center">
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Stack>

            {showForm && (
                <TransferForm
                    open={showForm}
                    transfer={editingTransfer}
                    onClose={handleCloseForm}
                    onSave={fetchTransfers}
                />
            )}


            <ConfirmationDialog
                open={openDeleteDialog}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this adjustment?<br /><small style='font-style: italic;'>This data will be permanently lost upon deletion.</small>"
            />

        </>
    );
};

export default Transfer;
