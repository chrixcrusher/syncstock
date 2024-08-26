import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, FormControl, InputLabel, Select, MenuItem,
    CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import useAuthAxios from '../../../hooks/useAuthAxios';
import { useAuth } from '../../../context/AuthProvider';



const TransferForm = ({ open, transfer, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        from_location: '',
        to_location: '',
        item: '',
        quantity: '',
        date: '',
        sku: '',
        product_code: '',
        supplier_name: '',
        additional_description: '',
        price: '',
        expiration_date: ''
    });

    const [loading, setLoading] = useState(true);
    const [fromLocations, setFromLocations] = useState([]);
    const [toLocations, setToLocations] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    const api = useAuthAxios();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchFormChoices();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (transfer) {
            setFormData({
                from_location: transfer.from_location,
                to_location: transfer.to_location,
                item: transfer.item,
                quantity: transfer.quantity,
                date: transfer.date.split('T')[0],
                sku: transfer.sku || '',
                product_code: transfer.product_code || '',
                supplier_name: transfer.supplier_name || '',
                additional_description: transfer.additional_description || '',
                price: transfer.price || '',
                expiration_date: transfer.expiration_date ? transfer.expiration_date.split('T')[0] : ''
            });
            setSelectedItem(transfer.item);  // Set the selected item for SKU and product_code
        }
    }, [transfer]);


    const fetchFormChoices = async () => {
        try {
            setLoading(true);
            const response = await api.get('filters/');
            setFromLocations(response.data.from_locations || []);
            setToLocations(response.data.to_locations || []);
            // Deduplicate items by item_name
            const items = response.data.items || [];
            const uniqueItems = items.reduce((acc, item) => {
                if (!acc.some(existingItem => existingItem.item_name === item.item_name)) {
                    acc.push(item);
                }
                return acc;
            }, []);

            setItems(uniqueItems);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching form choices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));

        if (name === 'item') {
            const selectedItem = items.find(item => item.id === value);
            setSelectedItem(selectedItem);
            setFormData(prevState => ({
                ...prevState,
                sku: selectedItem ? selectedItem.sku : '',
                product_code: selectedItem ? selectedItem.product_code : '',
                category: selectedItem ? selectedItem.category : ''
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (transfer) {
                await api.put(`stock-transfers/${transfer.id}/`, formData);
            } else {
                await api.post('stock-transfers/', formData);
            }
            onSave(); // Trigger the onSave callback
            onClose(); // Close the dialog after saving
        } catch (error) {
            console.error('Error saving transfer:', error);
            alert('Sorry, there was a problem in processing your transacation.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>{transfer ? 'Edit Transfer' : 'Add Transfer'}</DialogTitle>
            <DialogContent>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <form onSubmit={handleSubmit}>

                        {/* <TextField
                            name="user"
                            value={formData.user}
                            onChange={handleChange}
                            label="User"
                            fullWidth
                            margin="normal"
                            disabled
                        /> */}

                        <FormControl fullWidth margin="normal">
                            <InputLabel>From Location</InputLabel>
                            <Select
                                name="from_location"
                                value={formData.from_location}
                                onChange={handleChange}
                                label="From Location"
                                required
                            >
                                <MenuItem value="">Select Location</MenuItem>
                                {fromLocations.map((location) => (
                                    <MenuItem key={location.id} value={location.id}>
                                        {location.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>To Location</InputLabel>
                            <Select
                                name="to_location"
                                value={formData.to_location}
                                onChange={handleChange}
                                label="To Location"
                                required
                            >
                                <MenuItem value="">Select Location</MenuItem>
                                {toLocations.map((location) => (
                                    <MenuItem key={location.id} value={location.id}>
                                        {location.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Item</InputLabel>
                            <Select
                                name="item"
                                value={formData.item}
                                onChange={handleChange}
                                label="Item"
                                required
                            >
                                <MenuItem value="">Select Item</MenuItem>
                                {items.map((item) => (
                                    <MenuItem key={item.id} value={item.id}>
                                        {item.item_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            name="quantity"
                            label="Quantity"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                        />

                        <TextField
                            name="sku"
                            label="SKU"
                            fullWidth
                            margin="normal"
                            value={formData.sku}
                            InputProps={{
                                readOnly: true,
                            }}
                        />

                        <TextField
                            name="product_code"
                            label="Product Code"
                            fullWidth
                            margin="normal"
                            value={formData.product_code}
                            InputProps={{
                                readOnly: true,
                            }}
                        />

                        <TextField
                            name="supplier_name"
                            label="Supplier Name"
                            fullWidth
                            margin="normal"
                            value={formData.supplier_name}
                            onChange={handleChange}
                        />

                        <TextField
                            name="additional_description"
                            label="Additional Description"
                            fullWidth
                            margin="normal"
                            value={formData.additional_description}
                            onChange={handleChange}
                        />

                        <TextField
                            name="price"
                            label="Price"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={formData.price}
                            onChange={handleChange}
                        />

                        <TextField
                            name="date"
                            label="Transfer Date"
                            type="date"
                            fullWidth
                            margin="normal"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <TextField
                            name="expiration_date"
                            label="Expiration Date"
                            type="date"
                            fullWidth
                            margin="normal"
                            value={formData.expiration_date}
                            onChange={handleChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </form>
                )}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={handleSubmit} color="primary">{transfer ? 'Save' : 'Transfer'}</Button>
                <Button variant="outlined" onClick={onClose} color="secondary">Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};

export default TransferForm;
