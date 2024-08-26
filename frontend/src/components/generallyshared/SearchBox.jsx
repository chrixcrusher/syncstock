// components/SearchBox.js

import React from 'react';
import { Box, Button, TextField } from '@mui/material';

const SearchBox = ({ searchTerm, onSearchChange, onSearch }) => {
    return (
        <Box display="flex" alignItems="center" flexGrow={1}>
            <TextField
                variant="outlined"
                label="Search"
                value={searchTerm}
                onChange={onSearchChange}
                sx={{ flexGrow: 0, maxWidth: '500px', minWidth: '320px', height: '52px' }}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={onSearch}
                sx={{ height: '45px', ml: 2, mr: 2 }}
            >
                Search
            </Button>
        </Box>
    );
};

export default SearchBox;
