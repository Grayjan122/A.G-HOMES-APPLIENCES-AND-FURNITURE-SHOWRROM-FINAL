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
    const [loading, setLoading] = useState(true);

    // Statistics states
    const [stats, setStats] = useState({
        totalProducts: 0,
        inStock: 0,
        outOfStock: 0,
        pendingRequests: 0,
        incomingDeliveries: 0,
        totalValue: 0
    });

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
                fetchDeliveries()
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
        
        console.log('Inventory Stats Calculation:', {
            totalProducts,
            inStock,
            outOfStock,
            totalValue,
            sampleData: data.slice(0, 3).map(item => ({
                name: item.product_name,
                qty: item.qty,
                price: item.price,
                value: (parseInt(item.qty) || 0) * (parseFloat(item.price) || 0),
                parsedQty: parseInt(item.qty),
                type: typeof item.qty
            }))
        });
        
        setStats(prev => {
            const newStats = {
                ...prev,
                totalProducts,
                inStock,
                outOfStock,
                totalValue
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

                    <div className="stat-card danger">
                        <div className="stat-icon">🚫</div>
                        <div className="stat-value">{stats.outOfStock}</div>
                        <div className="stat-label">No Stock</div>
                    </div>

                    <div className="stat-card warning">
                        <div className="stat-icon">💰</div>
                        <div className="stat-value">
                            ₱{stats.totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="stat-label">Inventory Value</div>
                    </div>

                    <div className="stat-card info">
                        <div className="stat-icon">📝</div>
                        <div className="stat-value">{stats.pendingRequests}</div>
                        <div className="stat-label">Pending Requests</div>
                    </div>

                    <div className="stat-card primary">
                        <div className="stat-icon">🚚</div>
                        <div className="stat-value">
                            {requests.filter(req => req.request_status === 'On Delivery').length}
                        </div>
                        <div className="stat-label">Incoming Deliveries</div>
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
                                <div key={`delivery-${delivery.request_stock_id || index}`} className="delivery-item">
                                    <div className="item-header">
                                        <div className="item-title">
                                            Request #{delivery.request_stock_id}
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
                                <div key={`request-${request.request_stock_id || index}`} className="request-item">
                                    <div className="item-header">
                                        <div className="item-title">
                                            Request #{request.request_stock_id}
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
            </div>
        </div>
    );
};

export default DashboardIM;

