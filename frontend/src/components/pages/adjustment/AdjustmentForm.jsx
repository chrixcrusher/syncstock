import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Snackbar } from '@mui/material';
import useAuthAxios from '../../../hooks/useAuthAxios';
import { useAuth } from '../../../context/AuthProvider';

const AdjustmentForm = ({ adjustment, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        adjustment_type: '',
        item: '',
        quantity: '',
        date: '',
        reason: '',
        location: '',
        sku: '',
        product_code: ''
    });

    const [loading, setLoading] = useState(true);
    const [locations, setLocations] = useState([]);
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
        if (adjustment) {
            setFormData({
                adjustment_type: adjustment.adjustment_type,
                category: adjustment.category || '',
                item: adjustment.item,
                quantity: adjustment.quantity,
                date: adjustment.date.split('T')[0], // Format date to YYYY-MM-DD
                reason: adjustment.reason,
                location: adjustment.location,
                sku: adjustment.sku || '',
                product_code: adjustment.product_code || ''
            });
            setSelectedItem(adjustment.item);  // Set the selected item for SKU and product_code
        }
    }, [adjustment]);

    const fetchFormChoices = async () => {
        try {
            const response = await api.get('filters/');
            setLocations(response.data.locations || []);

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
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));

        if (name === 'item') {
            const selectedItem = items.find(item => item.id === value);
            setSelectedItem(selectedItem);
            setFormData(prevData => ({
                ...prevData,
                sku: selectedItem ? selectedItem.sku : '',
                product_code: selectedItem ? selectedItem.product_code : '',
                category: selectedItem ? selectedItem.category : ''
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Basic validation
        const { adjustment_type, item, quantity, date, reason, location } = formData;
        if (!adjustment_type || !item || !quantity || !date || !reason || !location) {
            alert('Please fill out all required fields.');
            return;
        }

        try {
            const url = adjustment ? `stock-adjustments/${adjustment.id}/` : 'stock-adjustments/';
            const method = adjustment ? 'put' : 'post';
            const response = await api({ method, url, data: formData });
            // console.log('Success:', response.data);
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving adjustment:', error.response?.data || error.message);
            alert('Sorry, there was a problem in processing your transacation.');
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Dialog open={true} onClose={onClose}>
            <DialogTitle>{adjustment ? 'Edit Stock Adjustment' : 'Add Stock Adjustment'}</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Adjustment Type</InputLabel>
                        <Select
                            name="adjustment_type"
                            value={formData.adjustment_type}
                            onChange={handleChange}
                            variant="outlined"
                            label="Adjustment Type"
                        >
                            <MenuItem value="remove">Remove</MenuItem>
                            <MenuItem value="missing">Missing</MenuItem>
                            <MenuItem value="damage">Damage</MenuItem>
                            <MenuItem value="expired">Expired</MenuItem>
                            <MenuItem value="sold">Sold</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Item</InputLabel>
                        <Select
                            name="item"
                            value={formData.item}
                            onChange={handleChange}
                            variant="outlined"
                            label="Item"
                        >
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
                        value={formData.quantity}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />

                    <TextField
                        name="sku"
                        label="SKU"
                        value={formData.sku}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                            readOnly: true,
                        }}
                    />

                    <TextField
                        name="date"
                        label="Date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                    />

                    <TextField
                        name="reason"
                        label="Reason"
                        value={formData.reason}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Location</InputLabel>
                        <Select
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            variant="outlined"
                            label="Location"
                        >
                            {locations.map((location) => (
                                <MenuItem key={location.id} value={location.id}>
                                    {location.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <DialogActions>
                        <Button type="submit" variant="contained" color="primary">{adjustment ? 'Save' : 'Adjust'}</Button>
                        <Button onClick={onClose}  variant="outlined" color="secondary">Cancel</Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AdjustmentForm;
