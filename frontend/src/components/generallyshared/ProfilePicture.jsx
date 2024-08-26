import React, { useState, useEffect } from 'react';
import useAuthAxios from '../../hooks/useAuthAxios';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const ProfilePicture = ({ altText = "Profile Picture" }) => {
    const [profilePicture, setProfilePicture] = useState('/default-profile-picture.png');
    const [loading, setLoading] = useState(false);
    const api = useAuthAxios();

    useEffect(() => {
        // Fetch the current profile picture on component mount
        setLoading(true);
        api.get('profile-picture/')
            .then(response => {
                setProfilePicture(response.data.profile_picture || '/default-profile-picture.png');
            })
            .catch(error => {
                console.error('Error fetching profile picture:', error);
            })
            .finally(() => setLoading(false));
    }, [api, 'profile-picture/']);

    const baseURL = 'http://localhost:8000';

    return (
        <Box display="flex" alignItems="center" position="relative">
            <Avatar
                src={profilePicture ? `${baseURL}${profilePicture}` : '/default-profile-picture.png'}
                alt={altText}
                sx={{ width: 50, height: 50 }}
            >
                {loading && <CircularProgress size={24} />}
            </Avatar>
        </Box>
    );
};

export default ProfilePicture;
