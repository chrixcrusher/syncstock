import React, { useState, useEffect } from 'react';
import {
    Container, TextField, Button, IconButton, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Typography, Box, MenuItem, Select, CircularProgress, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { Add, Edit, Delete, List, ViewModule } from '@mui/icons-material';
import useAuthAxios from '../../../hooks/useAuthAxios';
import { useAuth } from '../../../context/AuthProvider';
import CategoryCardView from './CategoryCardView'; // Ensure this path is correct

import ConfirmationDialog from '../../generallyshared/ConfirmationDialog';
import SearchBox from '../../generallyshared/SearchBox';
import AddUnitButton from '../../generallyshared/AddUnitButton';

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [order, setOrder] = useState('asc');
    const [view, setView] = useState('list'); // State for view type (list or card)
    const [currentCategory, setCurrentCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null); // State for image file
    const [open, setOpen] = useState(false);
    
    const [deleteId, setDeleteId] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    
    const api = useAuthAxios();
    const { isAuthenticated } = useAuth();

    // Fetch categories on component mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchCategories();
        }
    }, []);

    // Fetch categories from API
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get('categories/');
            setCategories(response.data.results);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };



    // Update filtered categories based on search term
    useEffect(() => {
        const filtered = categories.filter(category =>
            category.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredCategories(filtered);
    }, [search, categories]);

    const handleSearchChange = (e) => setSearch(e.target.value);

    const handleSearch = () => {
        fetchCategories();
    };

    // Order function
    const handleOrder = () => {
        const ordered = [...filteredCategories].sort((a, b) =>
            order === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name)
        );
        setFilteredCategories(ordered);
        setOrder(order === 'asc' ? 'desc' : 'asc');
    };

    // Handle open form for adding or editing
    const handleClickOpen = (category = {}) => {
        setCurrentCategory(category);
        setOpen(true);
        setImageFile(null); // Clear file input on open
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentCategory({});
        setImageFile(null); // Clear file input on close
    };

    // Handle image file change
    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    // Handle form submission
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const url = currentCategory.id
                ? `categories/${currentCategory.id}/`
                : 'categories/';
            const method = currentCategory.id ? 'put' : 'post';
            
            // Prepare form data
            const formData = new FormData();
            formData.append('name', currentCategory.name);
            formData.append('description', currentCategory.description);
            if (imageFile) {
                formData.append('category_image', imageFile);
            }

            await api({ method, url, data: formData, headers: { 'Content-Type': 'multipart/form-data' } });
            fetchCategories();
            handleClose();
        } catch (error) {
            console.error('Error saving category:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDelete = (category) => {
        setDeleteId(category);
        setOpenDeleteDialog(true);
    };


    // Handle deletion of category
    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            await api.delete(`categories/${deleteId.id}/`);
            fetchCategories();
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting category:', error);
        } finally {
            setLoading(false);
        }
    };



    const handleCancelDelete = () => {
        setOpenDeleteDialog(false);
        setDeleteId(null);
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Category Management
            </Typography>

            <Box display="flex" justifyContent="space-between" sx= {{ alignItems: "center", mb: 4.5 }} >
                {/* Search and Filters Section */}
                <Box display="flex" alignitems="center" gap={1}>
                    {/* Search Section */}                   
                        <SearchBox  searchTerm={search} onSearchChange={handleSearchChange} onSearch={handleSearch} />
                        {/* Filter Section */}
                        <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            sx={{ height: '52px' }}
                            onClick={handleOrder}>
                            Order: {order === 'asc' ? 'Z-A' : 'A-Z'}
                        </Button>
                        {/* View Section */}
                        <Select
                            value={view}
                            onChange={(e) => setView(e.target.value)}
                            displayEmpty
                            sx={{ height: '52px', ml: 2, mr: 2 }}
                            size="small"
                        >
                            <MenuItem value="list">
                                <List /> List View
                            </MenuItem>
                            <MenuItem value="card">
                                <ViewModule /> Card View
                            </MenuItem>
                        </Select>
                </Box>
                <AddUnitButton onClick={handleClickOpen} />   
            </Box>
            <Box display="flex" alignItems="center" justifyContent="center"></Box>

            {loading ? (
                <CircularProgress />
            ) : filteredCategories.length === 0 ? (
                <Alert severity="info">No results found</Alert>
            ) : view === 'list' ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                {/* <TableCell>Image</TableCell> New column for image */}
                                <TableCell align="right" sx={{ paddingRight: '60px' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCategories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>{category.description}</TableCell>
                                    <TableCell align="right">
                                        <Button color="primary" onClick={() => handleClickOpen(category)}>
                                            Edit
                                        </Button>
                                        <Button color="error" onClick={() => handleOpenDelete(category)}>
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <CategoryCardView
                    categories={filteredCategories}
                    onEdit={(category) => handleClickOpen(category)}
                />
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{currentCategory.id ? 'Edit Category' : 'Add Category'}</DialogTitle>
                <DialogContent>
                    {/* Center the content of the dialog */}
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        {/* Display the image at the top center */}
                        {currentCategory.category_image && (
                            <img
                                src={currentCategory.category_image}
                                alt="Category"
                                style={{ width: 100, height: 'auto', display: 'block', margin: '0 auto' }}
                            />
                        )}
                    </div>
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Name"
                        value={currentCategory.name || ''}
                        onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Description"
                        value={currentCategory.description || ''}
                        onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ marginTop: 16 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={handleSubmit} color="primary">
                        {currentCategory.id ? 'Save' : 'Add Category'}
                    </Button>
                    <Button variant="outlined" onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reusable Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={openDeleteDialog}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this adjustment?<br />
                        <small style='font-style: italic;'>This data will be permanently lost upon deletion.</small>" 
            />
        </Container>
    );
};

export default Category;
