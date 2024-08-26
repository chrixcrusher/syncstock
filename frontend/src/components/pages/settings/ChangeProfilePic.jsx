import React, { useState, useEffect } from 'react';
import useAuthAxios from '../../../hooks/useAuthAxios';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { styled } from '@mui/system';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Container = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    marginTop: theme.spacing(2),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(15),
    height: theme.spacing(15),
    position: 'relative',
    marginBottom: 2,
}));

const UploadIconButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: '50%',
    left: 47.5,
    padding: 4,
    boxShadow: theme.shadows[1],
    '&:hover': {
        backgroundColor: theme.palette.grey[200],
    },
}));

const DeleteButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

const HiddenInput = styled('input')({
    display: 'none',
});

const ChangeProfilePic = () => {
    const [profilePicture, setProfilePicture] = useState('/default-profile-picture.png');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const api = useAuthAxios();

    useEffect(() => {
        api.get('/profile-picture/')
            .then(response => {
                setProfilePicture(response.data.profile_picture || '/default-profile-picture.png');
            })
            .catch(error => {
                setSnackbarMessage('Failed to load profile picture.');
                setSnackbarOpen(true);
            });
    }, [api]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setLoading(true);
            const formData = new FormData();
            formData.append('profile_picture', file);

            try {
                const response = await api.put('profile-picture/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                setProfilePicture(response.data.profile_picture || '/default-profile-picture.png');
                setSnackbarMessage('Profile picture updated successfully.');
                setSnackbarOpen(true);
            } catch (error) {
                setSnackbarMessage('Failed to upload the profile picture.');
                setSnackbarOpen(true);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api.delete('profile-picture/');
            setProfilePicture('/default-profile-picture.png');
            setSnackbarMessage('Profile picture deleted successfully.');
            setSnackbarOpen(true);

            // Add a 2-second delay before refreshing the page
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            setSnackbarMessage('Failed to delete the profile picture.');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const baseURL = 'http://localhost:8000';

    return (
        <Container>
            <Box>
                <Typography sx={{ ml: 1.7, fontWeight: 600 }}>Profile Picture</Typography>
                <StyledAvatar
                    src={profilePicture ? `${baseURL}${profilePicture}` : '/default-profile-picture.png'}
                    alt="Profile Picture"
                >
                    {loading && <CircularProgress size={24} />}
                </StyledAvatar>
                <HiddenInput
                    accept="image/*"
                    id="upload-profile-picture"
                    type="file"
                    onChange={handleFileChange}
                />
                <label htmlFor="upload-profile-picture">
                    <UploadIconButton
                        color="primary"
                        component="span"
                    >
                        <CameraAltIcon />
                    </UploadIconButton>
                </label>
            </Box>
            <Box>
                {profilePicture !== '/default-profile-picture.png' && (
                    <DeleteButton
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDelete}
                    >
                        Delete Profile Picture
                    </DeleteButton>
                )}
            </Box>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
            >
                <SnackbarContent
                    message={snackbarMessage}
                    style={{ backgroundColor: snackbarMessage.includes('failed') ? 'red' : 'green' }}
                />
            </Snackbar>
        </Container>
    );
};

export default ChangeProfilePic;
