import Add from '@mui/icons-material/Add';
import Button from '@mui/material/Button';

const AddUnitButton = ({ onClick }) => {
    return (
        <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={onClick}
            sx={{ height: '45px' }}
        >
            Add
        </Button>
    );
};

export default AddUnitButton;