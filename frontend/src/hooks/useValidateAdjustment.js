import { useState, useEffect } from 'react';
import useAuthAxios from './useAuthAxios';

const useValidateAdjustment = (itemName, location, sku, productCode, quantity) => {
    const [isValid, setIsValid] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const api = useAuthAxios();

    useEffect(() => {
        const validate = async () => {
            if (!itemName || !location || !sku || !productCode || quantity === undefined) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get('total-current-inventory/');
                const inventoryItems = response.data;

                // Check if there's any item matching the provided criteria
                const matchingItem = inventoryItems.find(item => 
                    item.item_name === itemName && 
                    item.location === location && 
                    item.sku === sku && 
                    item.product_code === productCode
                );

                if (!matchingItem || matchingItem.total_quantity === 0) {
                    setIsValid(false);
                    setError('Insufficient stock, cannot proceed with the adjustment.');
                } else {
                    setIsValid(true);
                    setError(null);
                }
            } catch (err) {
                console.error('Error validating adjustment:', err);
                setError('Error validating adjustment. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        validate();
    }, [api, itemName, location, sku, productCode, quantity]);

    return { isValid, loading, error };
};

export default useValidateAdjustment;
