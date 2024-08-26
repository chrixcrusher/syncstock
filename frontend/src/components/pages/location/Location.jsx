import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, IconButton, Dialog, DialogContentText, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
 Paper, Typography, Box, Link, Tooltip, CircularProgress, Alert } from '@mui/material';
import { Add, Edit, Delete, LocationOn } from '@mui/icons-material';
import useAuthAxios from '../../../hooks/useAuthAxios';
import ConfirmationDialog from '../../generallyshared/ConfirmationDialog';
import SearchBox from '../../generallyshared/SearchBox';
import AddUnitButton from '../../generallyshared/AddUnitButton';

const Location = () => {
    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [search, setSearch] = useState('');
    const [order, setOrder] = useState('asc');
    const [open, setOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState({});
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [loading, setLoading] = useState(true);

    const api = useAuthAxios();

    // Function to fetch locations from the API
    const fetchLocations = async () => {
        setLoading(true); // Set loading to true before fetching
        try {
            const response = await api.get('locations/');
            setLocations(response.data.results); // Use results
        } catch (error) {
            console.error('Error fetching locations:', error);
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };

    // Fetch locations on component mount
    useEffect(() => {
        fetchLocations();
    }, []);

    // Update filtered locations based on search term
    useEffect(() => {
        const filtered = locations.filter(location =>
            location.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredLocations(filtered);
    }, [search, locations]);

    const handleSearchChange = (e) => setSearch(e.target.value);

    const handleSearch = () => {
        fetchLocations();
    };

    // Order function
    const handleOrder = () => {
        const ordered = [...filteredLocations].sort((a, b) =>
            order === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name)
        );
        setFilteredLocations(ordered);
        setOrder(order === 'asc' ? 'desc' : 'asc');
    };

    // Handle open form for adding or editing
    const handleClickOpen = (location = {}) => {
        setCurrentLocation(location);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentLocation({});
    };

    // Handle form submission
    const handleSubmit = async () => {
        setLoading(true); // Set loading to true before saving
        try {
            const url = currentLocation.id
                ? `locations/${currentLocation.id}/`
                : 'locations/';
            const method = currentLocation.id ? 'put' : 'post';
            await api({ method, url, data: currentLocation });
            fetchLocations(); // Fetch locations after adding/updating
            handleClose();
        } catch (error) {
            console.error('Error saving location:', error);
        } finally {
            setLoading(false); // Set loading to false after saving
        }
    };

    // Handle deletion of location
    const handleConfirmDelete = async () => {
        setLoading(true); // Set loading to true before deleting
        try {
            await api.delete(`locations/${deleteId.id}/`);
            fetchLocations(); // Fetch locations after deletion
            setOpenDeleteDialog(false);
            setDeleteId(null);
        } catch (error) {
            console.error('Error deleting location:', error);
        } finally {
            setLoading(false); // Set loading to false after deleting
        }
    };

    const handleOpenDeleteDialog = (location) => {
        setDeleteId(location);
        setOpenDeleteDialog(true);
    };

    const handleCloseDelete = () => {
        setOpenDeleteDialog(false);
        setDeleteId(null);
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Location Management
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
                </Box>
                <Box display="flex" alignItems="center" justifyContent="flex-end" >
                    <AddUnitButton onClick={handleClickOpen} />
                </Box>    
            </Box>
            <Box display="flex" alignItems="center" justifyContent="center"></Box>



            {loading ? (
                <CircularProgress />
            ) : filteredLocations.length === 0 ? (
                <Alert severity="info">No results found</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><LocationOn /></TableCell>
                                <TableCell>Location Name</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Person-in-Charge</TableCell>
                                <TableCell align='right' sx={{ paddingRight: '60px' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredLocations.map((location) => (
                                <TableRow key={location.id}>
                                    <TableCell>
                                        <Tooltip title="View on Google Maps">
                                            <Link href={location.google_maps_url} target="_blank" rel="noopener">
                                                <LocationOn />
                                            </Link>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>{location.name}</TableCell>
                                    <TableCell>{location.address}</TableCell>
                                    <TableCell>{location.person_in_charge}</TableCell>
                                    <TableCell align="right">
                                        <Button color="primary" onClick={() => handleClickOpen(location)}>
                                            Edit
                                        </Button>
                                        <Button color="error" onClick={() => handleOpenDeleteDialog(location)}>
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{currentLocation.id ? 'Edit Location' : 'Add Location'}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Name"
                        value={currentLocation.name || ''}
                        onChange={(e) => setCurrentLocation({ ...currentLocation, name: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Address"
                        value={currentLocation.address || ''}
                        onChange={(e) => setCurrentLocation({ ...currentLocation, address: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Description"
                        value={currentLocation.description || ''}
                        onChange={(e) => setCurrentLocation({ ...currentLocation, description: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Person-in-Charge"
                        value={currentLocation.person_in_charge || ''}
                        onChange={(e) => setCurrentLocation({ ...currentLocation, person_in_charge: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Google Maps URL"
                        value={currentLocation.google_maps_url || ''}
                        onChange={(e) => setCurrentLocation({ ...currentLocation, google_maps_url: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {currentLocation.id ? 'Update' : 'Add Location'}
                    </Button>
                    <Button onClick={handleClose} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            
            <ConfirmationDialog
                open={openDeleteDialog}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this adjustment?<br /><small style='font-style: italic;'>This data will be permanently lost upon deletion.</small>"
            />


        </Container>
    );
};

export default Location;
