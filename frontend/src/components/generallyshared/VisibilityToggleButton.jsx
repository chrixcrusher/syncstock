import React from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const VisibilityToggleButton = ({  onClick, isFilterVisible }) => {
    return (
        <Button
            variant="outlined"
            color="primary"
            onClick={onClick}
            sx={{ height: '45px' }}
            >
            {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
        </Button>
   );
}

export default VisibilityToggleButton;