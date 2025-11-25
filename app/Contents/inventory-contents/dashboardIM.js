'use client';
import { useState, useEffect } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const DashboardIM = () => {
    // User states
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [location_name, setLocation_name] = useState('');

    // Location selection states
    const [availableLocations, setAvailableLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');

    // Data states
    const [inventoryList, setInventoryList] = useState([]);
    const [requests, setRequests] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [transferRequests, setTransferRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Statistics states
    const [stats, setStats] = useState({
        totalProducts: 0,
        inStock: 0,
        outOfStock: 0,
        pendingRequests: 0,
        incomingDeliveries: 0,
        totalValue: 0,
        needsRestock: 0,
        belowMinimum: 0,
        lowStock: 0,
        pendingTransfers: 0,
        approvedTransfers: 0,
        inTransitTransfers: 0,
        completedTransfers: 0
    });

    // Modal states
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [restockItems, setRestockItems] = useState([]);

    useEffect(() => {
        const userId = sessionStorage.getItem('user_id');
        setUser_id(userId);
        fetchAvailableLocations();
    }, []);

    useEffect(() => {
        if (selectedLocation) {
            fetchDashboardData();
        }
    }, [selectedLocation]);

    useEffect(() => {
        console.log('Stats updated:', stats);
    }, [stats]);

    const fetchAvailableLocations = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            console.log('Fetching locations from:', `${baseURL}location.php`);
            
            const response = await axios.get(`${baseURL}location.php`, {
                params: {
                    json: JSON.stringify({ search: '' }),
                    operation: "GetLocation"
                }
            });
            
            console.log('Locations response:', response.data);
            let locations = Array.isArray(response.data) ? response.data : [];
            
            // If no locations from API, try to use sessionStorage location
            if (locations.length === 0) {
                console.log('No locations from API, checking sessionStorage...');
                const ssLocId = sessionStorage.getItem('location_id');
                const ssLocName = sessionStorage.getItem('location_name');
                const ssLocTypeId = sessionStorage.getItem('loc_type_id');
                
                if (ssLocId && ssLocName) {
                    console.log('Using sessionStorage location:', ssLocName);
                    locations = [{
                        location_id: ssLocId,
                        location_name: ssLocName,
                        loc_type_id: ssLocTypeId || '3' // Default to Store if not set
                    }];
                }
            }
            
            // Log first location to see the structure
            if (locations.length > 0) {
                console.log('Sample location structure:', locations[0]);
            }
            
            console.log('Total locations available:', locations.length);
            
            // Filter for Main (1) and Store (3) locations only (Warehouse=2 has separate module)
            const filteredLocations = locations.filter(loc => {
                const locTypeId = parseInt(loc.loc_type_id);
                console.log('Checking location:', loc.location_name, 'Type ID:', locTypeId);
                // loc_type_id: 1=Main, 2=Warehouse, 3=Store
                return locTypeId === 1 || locTypeId === 3;
            });
            
            console.log('Filtered Main/Store locations:', filteredLocations);
            setAvailableLocations(filteredLocations);
            
            // Set first location as default if available
            if (filteredLocations.length > 0) {
                console.log('Setting default location:', filteredLocations[0]);
                setSelectedLocation(filteredLocations[0].location_id);
                setLocation_name(filteredLocations[0].location_name);
            } else {
                console.log('No Main or Store locations found');
                setLoading(false); // No locations found, stop loading
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
            
            // Fallback to sessionStorage location on error
            const ssLocId = sessionStorage.getItem('location_id');
            const ssLocName = sessionStorage.getItem('location_name');
            const ssLocTypeId = sessionStorage.getItem('loc_type_id');
            
            if (ssLocId && ssLocName) {
                console.log('API error - using sessionStorage location:', ssLocName);
                const fallbackLocation = {
                    location_id: ssLocId,
                    location_name: ssLocName,
                    loc_type_id: ssLocTypeId || '3' // Default to Store if not set
                };
                
                setAvailableLocations([fallbackLocation]);
                setSelectedLocation(ssLocId);
                setLocation_name(ssLocName);
            } else {
                setLoading(false); // Error occurred, stop loading
            }
        }
    };

    const handleLocationChange = (e) => {
        const locId = e.target.value;
        const location = availableLocations.find(loc => loc.location_id === locId);
        setSelectedLocation(locId);
        setLocation_name(location ? location.location_name : '');
    };

    const getLocationTypeName = (loc_type_id) => {
        const typeId = parseInt(loc_type_id);
        switch(typeId) {
            case 1: return 'Main';
            case 2: return 'Warehouse';
            case 3: return 'Store';
            default: return 'Unknown';
        }
    };

    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} ${months === 1 ? 'month' : 'months'} ago`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `${years} ${years === 1 ? 'year' : 'years'} ago`;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchInventory(),
                fetchRequests(),
                fetchDeliveries(),
                fetchTransferRequests()
            ]);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInventory = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const response = await axios.get(`${baseURL}inventory.php`, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetInventory2"
                }
            });
            
            console.log('Inventory API Response:', response.data);
            const allData = response.data || [];
            
            // Filter inventory for selected location
            const filteredData = allData.filter(item => 
                item.location_id === selectedLocation || item.location_id === parseInt(selectedLocation)
            );
            
            console.log('All inventory count:', allData.length);
            console.log('Filtered for location', selectedLocation, ':', filteredData.length);
            
            setInventoryList(filteredData);
            calculateInventoryStats(filteredData);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

    const fetchRequests = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const response = await axios.get(`${baseURL}requestStock.php`, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetRequestDash"
                }
            });
            
            console.log('Requests API Response:', response.data);
            const allData = Array.isArray(response.data) ? response.data : [];
            
            // Filter requests for selected location (where request is FROM this location)
            const filteredData = allData.filter(req => 
                req.request_from === selectedLocation || req.request_from === parseInt(selectedLocation)
            );
            
            console.log('All requests count:', allData.length);
            console.log('Filtered requests for location', selectedLocation, ':', filteredData.length);
            
            setRequests(filteredData);
            calculateRequestStats(filteredData);
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    const fetchDeliveries = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            
            // Fetch delivery data
            const deliveryResponse = await axios.get(`${baseURL}requestStock.php`, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetDeliveryDash"
                }
            });
            
            // Fetch request data to get details
            const requestResponse = await axios.get(`${baseURL}requestStock.php`, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetRequestDash"
                }
            });
            
            console.log('Deliveries API Response:', deliveryResponse.data);
            const deliveryData = Array.isArray(deliveryResponse.data) ? deliveryResponse.data : [];
            const requestData = Array.isArray(requestResponse.data) ? requestResponse.data : [];
            
            // Filter for deliveries from the selected location with "Delivered" or "Complete" status
            const filteredDeliveries = deliveryData.filter(delivery => 
                (delivery.request_from === selectedLocation || delivery.request_from === parseInt(selectedLocation)) &&
                (delivery.delivery_status === 'Delivered' || delivery.delivery_status === 'Complete')
            );
            
            // Merge delivery data with request data to get full details
            const enrichedDeliveries = filteredDeliveries.map(delivery => {
                const request = requestData.find(req => req.request_stock_id === delivery.request_stock_id);
                return {
                    ...delivery,
                    ...request // Merge request details
                };
            }).filter(d => d.request_stock_id); // Remove any that didn't match
            
            console.log('Filtered deliveries for location', selectedLocation, ':', enrichedDeliveries.length);
            setDeliveries(enrichedDeliveries);
        } catch (error) {
            console.error("Error fetching deliveries:", error);
        }
    };

    const calculateInventoryStats = (data) => {
        const totalProducts = data.length;
        const inStock = data.filter(item => {
            const qty = parseInt(item.qty) || 0;
            return !isNaN(qty) && qty > 0;
        }).length;
        const outOfStock = data.filter(item => {
            const qty = parseInt(item.qty) || 0;
            return qty === 0 || isNaN(parseInt(item.qty));
        }).length;
        
        // Calculate total inventory value (qty * price)
        const totalValue = data.reduce((sum, item) => {
            const qty = parseInt(item.qty) || 0;
            const price = parseFloat(item.price) || 0;
            return sum + (qty * price);
        }, 0);

        // Calculate threshold-based statistics
        let belowMinimum = 0;
        let lowStock = 0;
        let needsRestock = 0;
        const itemsNeedingRestock = [];

        data.forEach(item => {
            const qty = parseInt(item.qty) || 0;
            const minThreshold = item.min_threshold !== null && item.min_threshold !== undefined ? parseInt(item.min_threshold) : 1;
            const maxThreshold = item.max_threshold !== null && item.max_threshold !== undefined ? parseInt(item.max_threshold) : 2;

            let status = '';
            let priority = 0;

            // Out of Stock: quantity is 0
            if (qty === 0) {
                status = 'Out of Stock';
                priority = 1;
                needsRestock++;
                itemsNeedingRestock.push({ ...item, restockStatus: status, priority });
            } 
            // Below Minimum: quantity is greater than 0 but less than minimum threshold
            else if (qty > 0 && qty < minThreshold) {
                status = 'Below Minimum';
                priority = 2;
                belowMinimum++;
                needsRestock++;
                itemsNeedingRestock.push({ ...item, restockStatus: status, priority });
            } 
            // Low Stock: quantity is between minimum and maximum threshold (exclusive of max)
            // Items at max threshold or above are considered well-stocked and don't need restocking
            else if (qty >= minThreshold && qty < maxThreshold) {
                status = 'Low Stock';
                priority = 3;
                lowStock++;
                needsRestock++;
                itemsNeedingRestock.push({ ...item, restockStatus: status, priority });
            }
            // Items at maxThreshold or above are considered well-stocked and don't need restocking
        });

        // Sort restock items by priority (1 = most urgent)
        itemsNeedingRestock.sort((a, b) => a.priority - b.priority);
        setRestockItems(itemsNeedingRestock);
        
        console.log('Inventory Stats Calculation:', {
            totalProducts,
            inStock,
            outOfStock,
            totalValue,
            needsRestock,
            belowMinimum,
            lowStock,
            itemsNeedingRestock: itemsNeedingRestock.length
        });
        
        setStats(prev => {
            const newStats = {
                ...prev,
                totalProducts,
                inStock,
                outOfStock,
                totalValue,
                needsRestock,
                belowMinimum,
                lowStock
            };
            console.log('Setting new stats:', newStats);
            return newStats;
        });
    };

    const calculateRequestStats = (data) => {
        const pendingRequests = data.filter(req => req.request_status === 'Pending').length;
        const incomingDeliveries = data.filter(req => req.request_status === 'On Delivery').length;
        
        setStats(prev => ({
            ...prev,
            pendingRequests,
            incomingDeliveries
        }));
    };

    const fetchTransferRequests = async () => {
        if (!selectedLocation) return;

        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const url = baseURL + 'transferStock.php';

            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        location_id: parseInt(selectedLocation),
                        status: null // Get all statuses
                    }),
                    operation: 'GetTransferRequests'
                }
            });

            let transfers = [];
            if (response.data && response.data.success && response.data.transfers) {
                transfers = response.data.transfers;
            } else if (response.data && Array.isArray(response.data)) {
                transfers = response.data;
            } else if (response.data && response.data.transfers) {
                transfers = response.data.transfers;
            } else if (response.data && response.data.requests) {
                transfers = response.data.requests;
            }

            // Filter transfers where request_to_location_id matches selected location
            // Only show transfers coming TO this location
            const filteredTransfers = transfers.filter(transfer => {
                const toLoc = transfer.to_location_id || transfer.request_to_location_id;
                return toLoc && parseInt(toLoc) === parseInt(selectedLocation);
            });

            setTransferRequests(filteredTransfers);
            calculateTransferStats(filteredTransfers);
        } catch (error) {
            console.error("Error fetching transfer requests:", error);
            // Don't show error if endpoint doesn't exist yet
            if (error.response?.status !== 404) {
                console.warn("Transfer requests API may not be available");
            }
            setTransferRequests([]);
        }
    };

    const calculateTransferStats = (data) => {
        const pendingTransfers = data.filter(transfer => {
            const status = (transfer.status || '').toLowerCase();
            return status === 'pending' || status === 'requested';
        }).length;

        const approvedTransfers = data.filter(transfer => {
            const status = (transfer.status || '').toLowerCase();
            return status === 'approved';
        }).length;

        const inTransitTransfers = data.filter(transfer => {
            const status = (transfer.status || '').toLowerCase();
            return status === 'in_transit' || status === 'in transit' || status === 'shipped';
        }).length;

        const completedTransfers = data.filter(transfer => {
            const status = (transfer.status || '').toLowerCase();
            return status === 'completed' || status === 'delivered' || status === 'received';
        }).length;

        setStats(prev => ({
            ...prev,
            pendingTransfers,
            approvedTransfers,
            inTransitTransfers,
            completedTransfers
        }));
    };

    // Get stock level distribution for chart
    const getStockLevelData = () => {
        const inStock = stats.inStock;
        const noStock = stats.outOfStock;
        
        console.log('Chart data:', { inStock, noStock, stats });

        return {
            labels: ['In Stock', 'No Stock'],
            datasets: [{
                label: 'Products',
                data: [inStock, noStock],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 2,
            }],
        };
    };

    // Get request status distribution
    const getRequestStatusData = () => {
        const pending = requests.filter(r => r.request_status === 'Pending').length;
        const ongoing = requests.filter(r => r.request_status === 'On Going').length;
        const delivery = requests.filter(r => r.request_status === 'On Delivery').length;

        return {
            labels: ['Pending', 'On Going', 'On Delivery'],
            datasets: [{
                label: 'Requests',
                data: [pending, ongoing, delivery],
                backgroundColor: [
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 159, 64, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 2,
            }],
        };
    };

    // Get transfer status distribution
    const getTransferStatusData = () => {
        const pending = transferRequests.filter(t => {
            const status = (t.status || '').toLowerCase();
            return status === 'pending' || status === 'requested';
        }).length;
        const approved = transferRequests.filter(t => {
            const status = (t.status || '').toLowerCase();
            return status === 'approved';
        }).length;
        const inTransit = transferRequests.filter(t => {
            const status = (t.status || '').toLowerCase();
            return status === 'in_transit' || status === 'in transit' || status === 'shipped';
        }).length;
        const completed = transferRequests.filter(t => {
            const status = (t.status || '').toLowerCase();
            return status === 'completed' || status === 'delivered' || status === 'received';
        }).length;

        return {
            labels: ['Pending', 'Approved', 'In Transit', 'Completed'],
            datasets: [{
                label: 'Transfers',
                data: [pending, approved, inTransit, completed],
                backgroundColor: [
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 159, 64, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 2,
            }],
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };

    // Get status badge color
    const getStatusBadgeColor = (status) => {
        const statusColors = {
            'Pending': 'red',
            'Delivered': 'green',
            'On Going': 'orange',
            'On Delivery': 'goldenrod',
            'Complete': 'blue',
            'Declined': 'red'
        };
        return statusColors[status] || 'black';
    };

    // Get transfer status badge color
    const getTransferStatusBadgeColor = (status) => {
        const statusLower = (status || '').toLowerCase();
        const statusColors = {
            'pending': '#ffc107',
            'requested': '#ffc107',
            'approved': '#17a2b8',
            'in_transit': '#007bff',
            'in transit': '#007bff',
            'shipped': '#007bff',
            'completed': '#28a745',
            'delivered': '#28a745',
            'received': '#28a745',
            'rejected': '#dc3545',
            'cancelled': '#dc3545',
            'declined': '#dc3545'
        };
        return statusColors[statusLower] || '#6c757d';
    };

    // Get location name by ID
    const getLocationName = (locationId) => {
        const location = availableLocations.find(loc =>
            loc.location_id === parseInt(locationId) || loc.id === parseInt(locationId)
        );
        return location ? (location.location_name || location.name) : 'Unknown Location';
    };

    if (loading && availableLocations.length === 0) {
        return (
            <div className="customer-main" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '400px' 
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p style={{ marginTop: '20px', color: '#666' }}>Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (availableLocations.length === 0) {
        return (
            <div className="customer-main" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '400px' 
            }}>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '60px', marginBottom: '20px' }}>📍</div>
                    <h3 style={{ color: '#2d3748', marginBottom: '10px' }}>No Locations Available</h3>
                    <p style={{ color: '#718096' }}>
                        No Main or Store locations found. Please contact your administrator.
                    </p>
                    <p style={{ color: '#a0aec0', fontSize: '12px', marginTop: '10px' }}>
                        (Check browser console for details)
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="customer-main">
            <style jsx>{`
                .dashboard-container {
                    padding: 20px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .dashboard-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 15px;
                    margin-bottom: 30px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .dashboard-header h2 {
                    margin: 0 0 10px 0;
                    font-size: 28px;
                    font-weight: 700;
                }

                .dashboard-header p {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 16px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .stat-card {
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                    border-left: 4px solid;
                    transition: all 0.3s ease;
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
                }

                .stat-card.primary { border-left-color: #667eea; }
                .stat-card.success { border-left-color: #28a745; }
                .stat-card.warning { border-left-color: #ffc107; }
                .stat-card.danger { border-left-color: #dc3545; }
                .stat-card.info { border-left-color: #17a2b8; }

                .stat-icon {
                    font-size: 40px;
                    margin-bottom: 10px;
                    opacity: 0.8;
                }

                .stat-value {
                    font-size: 32px;
                    font-weight: 700;
                    margin: 10px 0;
                    color: #2d3748;
                }

                .stat-card.warning .stat-value {
                    font-size: 24px;
                    word-break: break-word;
                }

                .stat-label {
                    color: #718096;
                    font-size: 14px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .chart-card {
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                }

                .chart-card h3 {
                    margin: 0 0 20px 0;
                    color: #2d3748;
                    font-size: 18px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .chart-container {
                    height: 300px;
                    position: relative;
                }

                .section-card {
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                    margin-bottom: 20px;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #e2e8f0;
                }

                .section-header h3 {
                    margin: 0;
                    color: #2d3748;
                    font-size: 20px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .section-header .view-all {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.3s ease;
                }

                .section-header .view-all:hover {
                    color: #764ba2;
                    text-decoration: underline;
                }

                .delivery-item, .request-item {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 12px;
                    border-left: 4px solid #667eea;
                    transition: all 0.3s ease;
                }

                .delivery-item:hover, .request-item:hover {
                    background: #e9ecef;
                    transform: translateX(5px);
                }

                .item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .item-title {
                    font-weight: 600;
                    color: #2d3748;
                    font-size: 15px;
                }

                .badge {
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .badge.warning { background: #fff3cd; color: #856404; }
                .badge.success { background: #d4edda; color: #155724; }
                .badge.danger { background: #f8d7da; color: #721c24; }
                .badge.info { background: #d1ecf1; color: #0c5460; }
                .badge.primary { background: #cfe2ff; color: #084298; }

                .item-details {
                    font-size: 13px;
                    color: #718096;
                    margin-top: 5px;
                }

                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: #a0aec0;
                }

                .empty-state-icon {
                    font-size: 60px;
                    opacity: 0.3;
                    margin-bottom: 15px;
                }

                .refresh-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }

                .refresh-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .charts-grid {
                        grid-template-columns: 1fr;
                    }

                    .dashboard-header h2 {
                        font-size: 22px;
                    }

                    .section-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }
                }

                /* Restock Modal Styles */
                .restock-modal-tip {
                    display: block;
                }

                @media (max-width: 768px) {
                    .restock-modal-tip {
                        display: none;
                    }
                }
            `}</style>

            <div className="dashboard-container">
                {/* Header */}
                <div className="dashboard-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                            <h2>📊 Inventory Manager Dashboard</h2>
                            <p>{location_name} - Real-time Overview</p>
                        </div>
                        <div style={{ minWidth: '250px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                                Select Location:
                            </label>
                            <select 
                                value={selectedLocation} 
                                onChange={handleLocationChange}
                                style={{
                                    width: '100%',
                                    padding: '10px 15px',
                                    fontSize: '15px',
                                    borderRadius: '8px',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    color: '#2d3748',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    outline: 'none'
                                }}
                            >
                                {availableLocations.map(location => (
                                    <option key={location.location_id} value={location.location_id}>
                                        {location.location_name} ({getLocationTypeName(location.loc_type_id)})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="stats-grid">
                    <div className="stat-card primary">
                        <div className="stat-icon">📦</div>
                        <div className="stat-value">{stats.totalProducts}</div>
                        <div className="stat-label">Total Products</div>
                    </div>

                    <div className="stat-card success">
                        <div className="stat-icon">✅</div>
                        <div className="stat-value">{stats.inStock}</div>
                        <div className="stat-label">In Stock</div>
                    </div>

                    <div 
                        className="stat-card danger"
                        style={{ cursor: stats.needsRestock > 0 ? 'pointer' : 'default' }}
                        onClick={() => stats.needsRestock > 0 && setShowRestockModal(true)}
                        title={stats.needsRestock > 0 ? 'Click to view items needing restock' : ''}
                    >
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-value">{stats.needsRestock}</div>
                        <div className="stat-label">Needs Restock</div>
                        {stats.needsRestock > 0 && (
                            <div style={{ 
                                fontSize: '11px', 
                                marginTop: '8px', 
                                color: '#dc3545', 
                                fontWeight: '600',
                                textTransform: 'uppercase'
                            }}>
                                Click to View →
                            </div>
                        )}
                    </div>

                    {/* <div className="stat-card warning">
                        <div className="stat-icon">💰</div>
                        <div className="stat-value">
                            ₱{stats.totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="stat-label">Inventory Value</div>
                    </div> */}

                    <div 
                        className="stat-card info"
                        style={{ cursor: stats.pendingRequests > 0 ? 'pointer' : 'default' }}
                        onClick={() => {
                            if (stats.pendingRequests > 0) {
                                sessionStorage.setItem('activePage', 'track-request');
                                window.location.reload();
                            }
                        }}
                        title={stats.pendingRequests > 0 ? 'Click to view pending requests' : ''}
                    >
                        <div className="stat-icon">📝</div>
                        <div className="stat-value">{stats.pendingRequests}</div>
                        <div className="stat-label">Pending Requests</div>
                        {stats.pendingRequests > 0 && (
                            <div style={{ 
                                fontSize: '11px', 
                                marginTop: '8px', 
                                color: '#17a2b8', 
                                fontWeight: '600',
                                textTransform: 'uppercase'
                            }}>
                                Click to View →
                            </div>
                        )}
                    </div>

                    <div className="stat-card primary">
                        <div className="stat-icon">🚚</div>
                        <div className="stat-value">
                            {requests.filter(req => req.request_status === 'On Delivery').length}
                        </div>
                        <div className="stat-label">Incoming Deliveries</div>
                    </div>

                    <div 
                        className="stat-card warning"
                        style={{ cursor: stats.pendingTransfers > 0 ? 'pointer' : 'default' }}
                        onClick={() => {
                            if (stats.pendingTransfers > 0) {
                                sessionStorage.setItem('activePage', 'transfer-stock');
                                window.location.reload();
                            }
                        }}
                        title={stats.pendingTransfers > 0 ? 'Click to view transfer requests' : ''}
                    >
                        <div className="stat-icon">📤</div>
                        <div className="stat-value">{stats.pendingTransfers}</div>
                        <div className="stat-label">Pending Transfers</div>
                        {stats.pendingTransfers > 0 && (
                            <div style={{ 
                                fontSize: '11px', 
                                marginTop: '8px', 
                                color: '#ffc107', 
                                fontWeight: '600',
                                textTransform: 'uppercase'
                            }}>
                                Click to View →
                            </div>
                        )}
                    </div>

                 

                    <div 
                        className="stat-card primary"
                        style={{ cursor: stats.inTransitTransfers > 0 ? 'pointer' : 'default' }}
                        onClick={() => {
                            if (stats.inTransitTransfers > 0) {
                                sessionStorage.setItem('activePage', 'transfer-stock');
                                window.location.reload();
                            }
                        }}
                        title={stats.inTransitTransfers > 0 ? 'Click to view transfer requests' : ''}
                    >
                        <div className="stat-icon">🚛</div>
                        <div className="stat-value">{stats.inTransitTransfers}</div>
                        <div className="stat-label">In Transit</div>
                        {stats.inTransitTransfers > 0 && (
                            <div style={{ 
                                fontSize: '11px', 
                                marginTop: '8px', 
                                color: '#667eea', 
                                fontWeight: '600',
                                textTransform: 'uppercase'
                            }}>
                                Click to View →
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts */}
                <div className="charts-grid">
                    <div className="chart-card">
                        <h3>
                            <span>📊</span>
                            Stock Level Distribution
                        </h3>
                        <div className="chart-container">
                            <Doughnut data={getStockLevelData()} options={chartOptions} />
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3>
                            <span>📋</span>
                            Request Status Overview
                        </h3>
                        <div className="chart-container">
                            <Doughnut data={getRequestStatusData()} options={chartOptions} />
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3>
                            <span>📤</span>
                            Transfer Status Overview
                        </h3>
                        <div className="chart-container">
                            <Doughnut data={getTransferStatusData()} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Recent Deliveries */}
                <div className="section-card">
                    <div className="section-header">
                        <h3>
                            <span>🚚</span>
                            Recent Deliveries
                        </h3>
                        <button className="refresh-btn" onClick={fetchDashboardData}>
                            <span>🔄</span>
                            Refresh
                        </button>
                    </div>

                    {deliveries.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <p>No recent deliveries</p>
                        </div>
                    ) : (
                        deliveries
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice(0, 5)
                            .map((delivery, index) => (
                                <div key={`delivery-${delivery.id_maker || delivery.request_stock_id || index}`} className="delivery-item">
                                    <div className="item-header">
                                        <div className="item-title">
                                            Request #{delivery.id_maker || delivery.request_stock_id}
                                        </div>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: 'white',
                                            backgroundColor: getStatusBadgeColor(delivery.delivery_status)
                                        }}>
                                            {delivery.delivery_status}
                                        </span>
                                    </div>
                                    <div className="item-details">
                                        <div><strong>To:</strong> {delivery.reqTo}</div>
                                        <div><strong>Requested by:</strong> {`${delivery.fname} ${delivery.mname} ${delivery.lname}`}</div>
                                        <div>
                                            <strong>Date:</strong> {formatDate(delivery.date)} 
                                            <span style={{ color: '#718096', fontSize: '12px', marginLeft: '8px' }}>
                                                ({getRelativeTime(delivery.date)})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>

                {/* Recent Requests */}
                <div className="section-card">
                    <div className="section-header">
                        <h3>
                            <span>📝</span>
                            Recent Requests
                        </h3>
                    </div>

                    {requests.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📄</div>
                            <p>No recent requests</p>
                        </div>
                    ) : (
                        requests
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice(0, 5)
                            .map((request, index) => (
                                <div key={`request-${request.id_maker || request.request_stock_id || index}`} className="request-item">
                                    <div className="item-header">
                                        <div className="item-title">
                                            Request #{request.id_maker || request.request_stock_id}
                                        </div>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: 'white',
                                            backgroundColor: getStatusBadgeColor(request.request_status)
                                        }}>
                                            {request.request_status}
                                        </span>
                                    </div>
                                    <div className="item-details">
                                        <div><strong>To:</strong> {request.reqTo}</div>
                                        <div><strong>Requested by:</strong> {`${request.fname} ${request.mname} ${request.lname}`}</div>
                                        <div>
                                            <strong>Date:</strong> {formatDate(request.date)} 
                                            <span style={{ color: '#718096', fontSize: '12px', marginLeft: '8px' }}>
                                                ({getRelativeTime(request.date)})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>

                {/* Recent Transfers */}
                <div className="section-card">
                    <div className="section-header">
                        <h3>
                            <span>📤</span>
                            Recent Transfers
                        </h3>
                        <button className="refresh-btn" onClick={fetchDashboardData}>
                            <span>🔄</span>
                            Refresh
                        </button>
                    </div>

                    {transferRequests.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📦</div>
                            <p>No recent transfers</p>
                        </div>
                    ) : (
                        transferRequests
                            .sort((a, b) => {
                                const dateA = new Date(a.created_at || a.request_date || a.date || 0);
                                const dateB = new Date(b.created_at || b.request_date || b.date || 0);
                                return dateB - dateA;
                            })
                            .slice(0, 5)
                            .map((transfer, index) => {
                                const transferId = transfer.transfer_id || transfer.id || transfer.request_number || `#${index + 1}`;
                                const fromLoc = transfer.from_location_name || getLocationName(transfer.from_location_id || transfer.request_from_location_id);
                                const toLoc = transfer.to_location_name || getLocationName(transfer.to_location_id || transfer.request_to_location_id);
                                const itemsCount = transfer.items ? transfer.items.length : (transfer.item_count || 0);
                                const status = transfer.status || 'Unknown';
                                
                                return (
                                    <div key={`transfer-${transferId}-${index}`} className="delivery-item">
                                        <div className="item-header">
                                            <div className="item-title">
                                                Transfer #{transferId}
                                            </div>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: 'white',
                                                backgroundColor: getTransferStatusBadgeColor(status)
                                            }}>
                                                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="item-details">
                                            <div><strong>From:</strong> {fromLoc}</div>
                                            <div><strong>To:</strong> {toLoc}</div>
                                            <div><strong>Items:</strong> {itemsCount} item(s)</div>
                                            <div>
                                                <strong>Date:</strong> {formatDate(transfer.created_at || transfer.request_date || transfer.date)} 
                                                <span style={{ color: '#718096', fontSize: '12px', marginLeft: '8px' }}>
                                                    ({getRelativeTime(transfer.created_at || transfer.request_date || transfer.date)})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                    )}
                </div>

                {/* Restock Modal */}
                {showRestockModal && (
                    <div 
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 9999,
                            padding: '20px'
                        }}
                        onClick={() => setShowRestockModal(false)}
                    >
                        <div 
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '15px',
                                maxWidth: '1200px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflow: 'hidden',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div style={{
                                padding: '25px 30px',
                                borderBottom: '2px solid #e2e8f0',
                                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                color: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span>⚠️</span> Items Needing Restock
                                    </h3>
                                    <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                                        {location_name} - {restockItems.length} item{restockItems.length !== 1 ? 's' : ''} requiring attention
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowRestockModal(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '24px',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div style={{ padding: '20px 30px', overflowY: 'auto', flex: 1 }}>
                                {/* Summary Cards */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '15px',
                                    marginBottom: '25px'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                        color: 'white',
                                        padding: '20px',
                                        borderRadius: '10px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.outOfStock}</div>
                                        <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '5px' }}>Out of Stock</div>
                                    </div>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #fd7e14 0%, #e36209 100%)',
                                        color: 'white',
                                        padding: '20px',
                                        borderRadius: '10px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.belowMinimum}</div>
                                        <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '5px' }}>Below Minimum</div>
                                    </div>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                                        color: 'white',
                                        padding: '20px',
                                        borderRadius: '10px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.lowStock}</div>
                                        <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '5px' }}>Low Stock</div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                {restockItems.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                        <div style={{ fontSize: '60px', marginBottom: '15px' }}>✅</div>
                                        <h4>All Items Are Well Stocked!</h4>
                                        <p>No items currently need restocking.</p>
                                    </div>
                                ) : (
                                    <div style={{ 
                                        background: 'white', 
                                        borderRadius: '10px', 
                                        overflow: 'hidden',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ 
                                                width: '100%', 
                                                borderCollapse: 'collapse',
                                                fontSize: '14px'
                                            }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                                        <th style={{ padding: '14px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>Status</th>
                                                        <th style={{ padding: '14px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>Product Code</th>
                                                        <th style={{ padding: '14px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>Description</th>
                                                        <th style={{ padding: '14px', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>Current Qty</th>
                                                        <th style={{ padding: '14px', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>Min</th>
                                                        <th style={{ padding: '14px', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>Max</th>
                                                        <th style={{ padding: '14px', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>Need</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {restockItems.map((item, index) => {
                                                        const qty = parseInt(item.qty) || 0;
                                                        const minThreshold = parseInt(item.min_threshold) || 1;
                                                        const maxThreshold = parseInt(item.max_threshold) || 2;
                                                        const needQty = Math.max(0, maxThreshold - qty);
                                                        
                                                        let statusColor = '#28a745';
                                                        let statusBg = '#d4edda';
                                                        let statusIcon = '✓';
                                                        
                                                        if (item.restockStatus === 'Out of Stock') {
                                                            statusColor = '#dc3545';
                                                            statusBg = '#f8d7da';
                                                            statusIcon = '🚫';
                                                        } else if (item.restockStatus === 'Below Minimum') {
                                                            statusColor = '#fd7e14';
                                                            statusBg = '#ffe5d0';
                                                            statusIcon = '⚠️';
                                                        } else if (item.restockStatus === 'Low Stock') {
                                                            statusColor = '#ffc107';
                                                            statusBg = '#fff3cd';
                                                            statusIcon = '⚡';
                                                        }

                                                        return (
                                                            <tr 
                                                                key={index}
                                                                style={{ 
                                                                    borderBottom: '1px solid #f1f3f5',
                                                                    backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                                                                }}
                                                            >
                                                                <td style={{ padding: '12px' }}>
                                                                    <span style={{
                                                                        padding: '6px 12px',
                                                                        borderRadius: '20px',
                                                                        fontSize: '12px',
                                                                        fontWeight: '600',
                                                                        color: statusColor,
                                                                        backgroundColor: statusBg,
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '5px',
                                                                        whiteSpace: 'nowrap'
                                                                    }}>
                                                                        <span>{statusIcon}</span>
                                                                        {item.restockStatus}
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding: '12px', color: '#495057', fontWeight: '500' }}>{item.product_name}</td>
                                                                <td style={{ padding: '12px', color: '#495057' }}>{item.description}</td>
                                                                <td style={{ 
                                                                    padding: '12px', 
                                                                    textAlign: 'center',
                                                                    fontWeight: '700',
                                                                    color: qty === 0 ? '#dc3545' : qty < minThreshold ? '#fd7e14' : '#ffc107'
                                                                }}>
                                                                    {qty}
                                                                </td>
                                                                <td style={{ padding: '12px', textAlign: 'center', color: '#6c757d', fontWeight: '500' }}>{minThreshold}</td>
                                                                <td style={{ padding: '12px', textAlign: 'center', color: '#6c757d', fontWeight: '500' }}>{maxThreshold}</td>
                                                                <td style={{ 
                                                                    padding: '12px', 
                                                                    textAlign: 'center',
                                                                    fontWeight: '700',
                                                                    fontSize: '16px',
                                                                    color: needQty > 0 ? '#dc3545' : '#28a745'
                                                                }}>
                                                                    {needQty > 0 ? `${needQty}` : '✓'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div style={{
                                padding: '20px 30px',
                                borderTop: '2px solid #e2e8f0',
                                background: '#f8f9fa',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div className="restock-modal-tip" style={{ fontSize: '13px', color: '#6c757d' }}>
                                    💡 Tip: Items are sorted by priority (Out of Stock → Below Minimum → Low Stock)
                                </div>
                                <button
                                    onClick={() => setShowRestockModal(false)}
                                    style={{
                                        padding: '10px 24px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        width: window.innerWidth < 768 ? '100%' : 'auto'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardIM;

