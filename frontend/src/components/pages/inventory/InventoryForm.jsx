// src/components/inventory-sub/InventoryForm.jsx

import React, { useState, useEffect } from 'react';
import useAuthAxios from '../../../hooks/useAuthAxios';
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, InputLabel, FormControl, CircularProgress, Typography } from '@mui/material';
import useCompanyData from '../../../hooks/useCompanyData';

const InventoryForm = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        item_name: '',
        sku: '',
        product_code: '',
        supplier_name: '',
        additional_description: '',
        quantity: '',
        price: '',
        inventory_date: '',
        expiration_date: '',
        category: '',
        location: ''
    });

    const api = useAuthAxios();

    const { categories, locations, loading, error } = useCompanyData();

    useEffect(() => {
        if (item) {
            setFormData({
                ...item,
                inventory_date: item.inventory_date.split('T')[0],
                expiration_date: item.expiration_date ? item.expiration_date.split('T')[0] : ''
            });
        }
    }, [item]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = `inventory-items/${item ? `${item.id}/` : ''}`;
            const method = item ? 'put' : 'post';
            await api({ method, url, data: formData });
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving item:', error);
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">Error loading data</Typography>;

    return (
        <Dialog open={true} onClose={onClose}>
            <DialogTitle>{item ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <TextField
                        name="item_name"
                        label="Item Name"
                        value={formData.item_name}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        name="sku"
                        label="SKU"
                        value={formData.sku}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        name="product_code"
                        label="Product Code"
                        value={formData.product_code}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        name="supplier_name"
                        label="Supplier Name"
                        value={formData.supplier_name}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        name="additional_description"
                        label="Additional Description"
                        value={formData.additional_description}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        name="quantity"
                        label="Quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        name="price"
                        label="Price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        name="inventory_date"
                        label="Inventory Date"
                        type="date"
                        value={formData.inventory_date}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                    />
                    <TextField
                        name="expiration_date"
                        label="Expiration Date"
                        type="date"
                        value={formData.expiration_date}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Category</InputLabel>
                        <Select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            variant="outlined"
                            label="Category"
                        >
                            {Array.isArray(categories) ? (
                                categories.map(cat => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No categories available</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Location</InputLabel>
                        <Select
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            variant="outlined"
                            label="Location"
                        >
                            {Array.isArray(locations) ? (
                                locations.map(loc => (
                                    <MenuItem key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No locations available</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    <DialogActions>
                        <Button type="submit" color="primary" variant="contained">
                            Save
                        </Button>
                        <Button onClick={onClose} color="secondary" variant="outlined">
                            Cancel
                        </Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default InventoryForm;
