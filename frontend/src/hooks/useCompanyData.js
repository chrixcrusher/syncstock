// src/hooks/useCompanyData.js

import { useState, useEffect } from 'react';
import useAuthAxios from './useAuthAxios'; // Import your custom hook

const useCompanyData = () => {
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const api = useAuthAxios();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesResponse, locationsResponse] = await Promise.all([
                    api.get('categories/'), // Adjust endpoint as needed
                    api.get('locations/'), // Adjust endpoint as needed
                ]);

                // Handle categories
                if (Array.isArray(categoriesResponse.data)) {
                    setCategories(categoriesResponse.data);
                } else if (categoriesResponse.data && Array.isArray(categoriesResponse.data.results)) {
                    setCategories(categoriesResponse.data.results);
                } else {
                    console.error('Expected an array or an object with a results array for categories');
                }

                // Handle locations
                if (Array.isArray(locationsResponse.data)) {
                    setLocations(locationsResponse.data);
                } else if (locationsResponse.data && Array.isArray(locationsResponse.data.results)) {
                    setLocations(locationsResponse.data.results);
                } else {
                    console.error('Expected an array or an object with a results array for locations');
                }
            } catch (error) {
                setError(error);
                console.error('Error fetching company data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [api]);

    return { categories, locations, loading, error };
};

export default useCompanyData;
