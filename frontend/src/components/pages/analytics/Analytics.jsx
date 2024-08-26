import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, MenuItem, FormControl, Select, InputLabel, CircularProgress, Alert } from '@mui/material';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Filler } from 'chart.js';
import useAuthAxios from '../../../hooks/useAuthAxios';
import { useAuth } from '../../../context/AuthProvider';
import VisibilityToggleButton from '../../generallyshared/VisibilityToggleButton';
import GeneralFilter from '../../generallyshared/GeneralFilter';

// Import configuration files
import inventoryConfig from '../../../config/analytics/inventoryConfig';
import currentInventoryConfig from '../../../config/analytics/currentInventoryConfig';
import adjustmentConfig from '../../../config/analytics/adjustmentConfig';
import transferConfig from '../../../config/analytics/transferConfig';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Filler);

// Map of configuration based on type
const configMap = {
  Inventory: inventoryConfig,
  CurrentInventory: currentInventoryConfig,
  Adjustment: adjustmentConfig,
  Transfer: transferConfig
};

const Analytics = () => {
  const [selectedChartType, setSelectedChartType] = useState('Bar Chart');
  const [selectedConfigType, setSelectedConfigType] = useState('Inventory');
  const [group_by, setGroupBy] = useState('monthly');
  const { isAuthenticated } = useAuth();
  const api = useAuthAxios();

  const { apiEndpoint, filtersConfig, chartTitle, hiddenFields, mappedData } = configMap[selectedConfigType] || {};
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(filtersConfig);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          let params;

          if (selectedConfigType === 'CurrentInventory') {
            params = { ...filters };
            const response = await api.get(apiEndpoint, { params });
            console.log(response.data);

            // Access the results array inside response.data
            const rawData = response.data.results;


            // Map over the results array to format the data
            const formattedData = rawData.map(item => ({
              ...item,
              ...mappedData(item)
            }));

            // Calculate totals
            const totalQuantity = rawData.reduce((sum, item) => sum + item.total_current_inventory, 0);
            const totalItems = rawData.length;  
            setTotalQuantity(totalQuantity);
            setTotalItems(totalItems);
            
            
            setData(formattedData);
          } else {
            params = { ...filters, group_by };
            const response = await api.get(apiEndpoint, { params });
            console.log(response.data);

            // If response.data is an object, convert it to an array
            const rawData = Array.isArray(response.data) ? response.data : Object.values(response.data);

          

            // Apply the mappedData function from the configuration
            const formattedData = rawData.map(item => ({
              ...item,
              ...mappedData(item, group_by)
            }));

            // Calculate total_quantity
            const totalQuantity = rawData.reduce((sum, item) => sum + (item.total_quantity || 0), 0);
            const totalItems = rawData.length;
            setTotalQuantity(totalQuantity);
            setTotalItems(totalItems);
            
            setData(formattedData);
          }
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      }
    };


    fetchData();
  }, [filters, isAuthenticated, api, apiEndpoint, group_by, mappedData, selectedConfigType]);

  const handleFilterVisibilityToggle = () => {
    setIsFilterVisible(prev => !prev);
  };

  if (!isAuthenticated) return <p>You must be logged in to view this page.</p>;

  const chartColors = [
    'rgba(255, 99, 132, 0.75)',    // Red
    'rgba(54, 162, 235, 0.75)',    // Blue
    'rgba(255, 206, 86, 0.75)',    // Yellow
    'rgba(75, 192, 192, 0.75)',    // Teal
    'rgba(153, 102, 255, 0.75)',   // Purple
    'rgba(255, 159, 64, 0.75)',    // Orange
    'rgba(255, 99, 71, 0.75)',     // Tomato
    'rgba(0, 204, 255, 0.75)',     // Light Blue
    'rgba(0, 255, 127, 0.75)',     // Spring Green
    'rgba(255, 20, 147, 0.75)',    // Deep Pink
    'rgba(255, 105, 180, 0.75)',   // Hot Pink
    'rgba(100, 149, 237, 0.75)'    // Cornflower Blue
  ];

  const chartData = {
    labels: data.map(item => item.date || item.item_name),
    datasets: [
      {
        label: 'Total Quantity',
        data: data.map(item => item.total_quantity || item.total_current_inventory),
        borderColor: selectedChartType === 'Line Chart' ? 'rgb(150, 150, 150)' : 'rgb(0, 0, 0)',
        backgroundColor: data.map((_, index) => chartColors[index % chartColors.length]),
        fill: selectedChartType !== 'Line Chart',
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: chartTitle,
      },
    },
  };

  const renderChart = () => {
    switch (selectedChartType) {
      case 'Bar Chart':
        return <Bar data={chartData} options={chartOptions} />;
      case 'Pie Chart':
        return <Pie data={chartData} options={chartOptions} />;
      case 'Doughnut Chart':
        return <Doughnut data={chartData} options={chartOptions} />;
      default:
        return <Line data={chartData} options={chartOptions} />;
    }
  };


  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {chartTitle}
      </Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
          <Box sx={{ mr: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={selectedChartType}
                onChange={(e) => setSelectedChartType(e.target.value)}
                label="Chart Type"
              >
                <MenuItem value="Line Chart">Line Chart</MenuItem>
                <MenuItem value="Bar Chart">Bar Chart</MenuItem>
                <MenuItem value="Pie Chart">Pie Chart</MenuItem>
                <MenuItem value="Doughnut Chart">Doughnut Chart</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {selectedConfigType !== 'CurrentInventory' && (
            <Box sx={{ mr: 2 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Group By</InputLabel>
                <Select
                  value={group_by}
                  onChange={(e) => setGroupBy(e.target.value)}
                  label="Group By"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          <Box>
            <FormControl sx={{ minWidth: 200, mr: 2 }}>
              <InputLabel>Config Type</InputLabel>
              <Select
                value={selectedConfigType}
                onChange={(e) => setSelectedConfigType(e.target.value)}
                label="Config Type"
              >
                <MenuItem value="Inventory">Inventory</MenuItem>
                <MenuItem value="CurrentInventory">Current Inventory</MenuItem>
                <MenuItem value="Adjustment">Adjustment</MenuItem>
                <MenuItem value="Transfer">Transfer</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <VisibilityToggleButton
            onClick={handleFilterVisibilityToggle}
            isFilterVisible={isFilterVisible}
          />
        </Box>
      </Box>
        <Box display="flex" alignItems="center" justifyContent="center">
          {isFilterVisible && (
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <GeneralFilter
                filters={filters}
                setFilters={setFilters}
                hiddenFields={hiddenFields}
                visible={isFilterVisible}
              />
            </Box>
          )}
        </Box>
      
      <Box display="flex" alignItems="center" justifyContent="center" mb={2} ml={10}>
          <Typography variant="h6" sx={{ mr: 10, mt: 1 }}>
            <span style={{ fontWeight: 'bold' }}>Total Quantity:</span> {totalQuantity}
          </Typography>
          <Typography variant="h6" sx={{ mr: 10, mt: 1 }}>
            <span style={{ fontWeight: 'bold' }}>Log Counter:</span> {totalItems}
          </Typography>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '500px', width: '100%' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : (
          data.length > 0 ? renderChart() : <Typography>No data available</Typography>
        )}
        {error && <Alert severity="error">Error: {error.message}</Alert>}
      </Box>
    </Container>
  );
};

export default Analytics;
