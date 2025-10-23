'use client';

import "../../css/dashboard.css";
import axios from 'axios';
import { useEffect, useState } from 'react';
import Router from "next/router";

// import Dashboard from '@/app/Contents/Dashboard/page';
import Products from '@/app/Contents/admin-contents/Products/page';
import Sale from '@/app/Contents/admin-contents/Sale/page';
import Analytics from '@/app/Contents/admin-contents/Analytics/page';
import Inventory from '@/app/Contents/admin-contents/Inventory/page';
import Location from '@/app/Contents/admin-contents/Location/page';
import Delivery from '@/app/Contents/admin-contents/Delivery/page';
import Customer from '@/app/Contents/admin-contents/Customer/page';
import User from '@/app/Contents/admin-contents/User/page';
import Setting from '@/app/Contents/admin-contents/Setting/page';
import { useRouter } from "next/navigation";

const DashboardWR = ({ setActivePage, setExpandedParent }) => {
    const [counts, setCounts] = useState({
        prodCount: '0',
        categoryCount: '0',
        locationCount: '0',
        userCount: '0',
        customerCount: '0',
        ongoingDelivery: '0',
        montlySales: '0.00',
        dailySales: '0.00',
    });

    const countConfigs = [
        { id: 'product_id', from: 'products', name: 'product_count', stateKey: 'prodCount' },
        { id: 'category_id', from: 'category', name: 'category_count', stateKey: 'categoryCount' },
        { id: 'location_id', from: 'location', name: 'location_count', stateKey: 'locationCount' },
        { id: 'account_id', from: 'account', name: 'user_count', stateKey: 'userCount' },
        { id: 'cust_id', from: 'customers', name: 'customer_count', stateKey: 'customerCount' },
        // Add more here if needed
    ];

    const [requestList1, setRequestList1] = useState([]);
    const [requestList, setRequestList] = useState([]);
    const [deleveredList, setDeliveredList] = useState([]);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [outOfStockCount, setOutOfStockCount] = useState(0);
    const [totalInventoryValue, setTotalInventoryValue] = useState('0.00');
    const [recentActivities, setRecentActivities] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    useEffect(() => {
        const user_id = sessionStorage.getItem("user_id");
        if (!user_id){
            return;
        }
        countConfigs.forEach(config => fetchCount(config));
        GetRequest();
        GetOngoingReq();
        GetDelivered();
        GetInventoryStats();
        GetRecentActivities();
        GetTopProducts();
        
        // Refresh data every 10 seconds for more responsive updates
        const interval = setInterval(() => {
            GetRequest();
            GetOngoingReq();
            GetDelivered();
            GetInventoryStats();
            GetRecentActivities();  // Add auto-refresh for recent activities
        }, 10000); // Reduced from 30s to 10s
        
        return () => clearInterval(interval);
    }, []);

    const GetRequest = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            locID: LocationID,
            status: 'Pending',
            reqType: 'ReqTo'
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequest"
                }
            });
            setRequestList1(response.data);
        } catch (error) {
            console.error("Error fetching request list:", error);
        }
    };

    const GetOngoingReq = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            locID: LocationID,
            status: 'OnGoing',
            reqType: 'ReqTo'
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequest2"
                }
            });
            setRequestList(response.data);
            console.log(response.data);

        } catch (error) {
            console.error("Error fetching request list:", error);
        }
    };

    const GetDelivered = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            locID: LocationID,
            status: 'OnDeliver',
            reqType: 'ReqTo'
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetReqDelivery"
                }
            });
            setDeliveredList(response.data);

            // DEBUG: Log the data structure to console
            console.log("delivered:", response.data);

        } catch (error) {
            console.error("Error fetching request list:", error);
        }
        return;
    };

    const fetchCount = async ({ id, from, name, stateKey }) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'counts.php';

        const countDetails = { ID: id, tFrom: from, tName: name };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(countDetails),
                    operation: 'Count'
                }
            });

            const countValue = response.data?.[0]?.[name] || '0';

            setCounts(prev => ({
                ...prev,
                [stateKey]: countValue
            }));
        } catch (error) {
            console.error(`Error fetching ${stateKey}:`, error);
        }
    };

    const GetInventoryStats = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'inventory.php';
        const locDetails = {
            locID: LocationID,
            stockLevel: '',
            search: ''
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(locDetails),
                    operation: "GetInventory"
                }
            });
            
            const inventory = response.data || [];
            
            // Calculate out of stock and total inventory value
            let outOfStock = 0;
            let totalValue = 0;
            
            inventory.forEach(item => {
                const qty = parseInt(item.qty) || 0;
                const price = parseFloat(item.price) || 0;  // Changed from selling_price to price
                
                if (qty === 0) {
                    outOfStock++;
                }
                
                totalValue += qty * price;
            });
            
            setOutOfStockCount(outOfStock);
            setTotalInventoryValue(totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
            
        } catch (error) {
            console.error("Error fetching inventory stats:", error);
        }
    };

    const GetRecentActivities = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'audit-log.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({ location_id: LocationID }),
                    operation: "GetRecentLogs"
                }
            });
            
            setRecentActivities((response.data || []).slice(0, 5)); // Get last 5 activities
        } catch (error) {
            console.error("Error fetching recent activities:", error);
        }
    };

    const GetTopProducts = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'inventory.php';
        const locDetails = {
            locID: LocationID,
            stockLevel: '',
            search: ''
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(locDetails),
                    operation: "GetInventory"
                }
            });
            
            const inventory = response.data || [];
            
            // Sort by quantity (highest stock items)
            const sorted = [...inventory].sort((a, b) => {
                return (parseInt(b.qty) || 0) - (parseInt(a.qty) || 0);
            });
            
            setTopProducts(sorted.slice(0, 5)); // Top 5 products
        } catch (error) {
            console.error("Error fetching top products:", error);
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    // Calculate the counts from the respective arrays
    const pendingRequestCount = Array.isArray(requestList1) ? requestList1.length.toString() : '0';
    const ongoingCount = Array.isArray(requestList) ? requestList.length.toString() : '0';
    const deliveredCount = Array.isArray(deleveredList)
        ? deleveredList.filter(item => item.delivery_status === 'Delivered').length.toString()
        : '0';
    const OnDeliverCount = Array.isArray(deleveredList)
        ? deleveredList.filter(item => item.delivery_status === 'On Delivery').length.toString()
        : '0';

    // Navigation handler for card clicks with filter support
    const handleCardClick = (pageKey, filterConfig = null) => {
        if (setActivePage && pageKey) {
            // Store filter configuration in sessionStorage for the delivery page
            if (filterConfig && pageKey === 'delivery') {
                sessionStorage.setItem('deliveryPageFilter', JSON.stringify(filterConfig));
            }

            // If it's a child page, expand the parent first
            if (pageKey === 'inventory-transfer-request') {
                setExpandedParent && setExpandedParent('requestmanagement');
            }

            setActivePage(pageKey);
            sessionStorage.setItem('once', "false");
        }
    };

    const cards = [
        {
            title: 'PENDING REQUEST',
            value: pendingRequestCount,
            pageKey: 'request-all',
            image: '/assets/images/pending.png',
            color: '#ffc107',
            showZero: false
        },
        {
            title: 'ONGOING REQUEST',
            value: ongoingCount,
            pageKey: 'combineRequestManagement',
            image: '/assets/images/onGoing.png',
            color: '#17a2b8',
            showZero: false
        },
        {
            title: 'ONGOING DELIVERY',
            value: OnDeliverCount,
            pageKey: 'delivery',
            filterConfig: { statusFilter: 'On Delivery' },
            image: '/assets/images/obDelivery.png',
            color: '#007bff',
            showZero: false
        },
        {
            title: 'DELIVERED STOCK',
            value: deliveredCount,
            pageKey: 'delivery',
            filterConfig: { statusFilter: 'Delivered' },
            image: '/assets/images/delivered.png',
            color: '#28a745',
            showZero: false
        },
        {
            title: 'OUT OF STOCK',
            value: outOfStockCount.toString(),
            pageKey: 'inventory',
            image: '/assets/images/sold-out.png',
            color: '#dc3545',
            showZero: true
        },
    ];

    const router = useRouter();

    // Filter out cards with zero count (except those with showZero: true)
    const visibleCards = cards.filter(card => {
        if (card.showZero) return true;
        const count = parseInt(card.value) || 0;
        return count > 0;
    });

    return (
        <div className='dash-main'>
            <h1 className='h-dashboard'>WAREHOUSE OVERVIEW</h1>
            
            {/* Status Cards */}
            <div className='container' style={{ marginBottom: '20px' }}>
                {visibleCards.map((card, index) => (
                    <div
                        key={index}
                        className='card'
                        onClick={() => handleCardClick(card.pageKey, card.filterConfig)}
                        style={{ 
                            cursor: 'pointer',
                            borderLeft: `4px solid ${card.color}`
                        }}
                    >
                        <div className='cardText'>
                            <p className='title'>{card.title}</p>
                        </div>
                        <div className="icon-and-val">
                            <div>
                                <h2 className='value' style={{ color: card.color }}>{card.value}</h2>
                            </div>
                            <div>
                                <img src={card.image} alt="icon" className='icon' />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Stats Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '20px',
                padding: '0 20px'
            }}>
                {/* Total Inventory Value */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '25px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>Total Inventory Value</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>₱{totalInventoryValue}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>Current warehouse stock value</div>
                </div>

                {/* Quick Action Stats */}
                <div style={{
                    background: 'white',
                    padding: '25px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0'
                }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Quick Stats</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}>📦 Total Products:</span>
                            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{counts.prodCount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}>⚠️ Out of Stock:</span>
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#dc3545' }}>{outOfStockCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Two Columns */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '20px',
                padding: '0 20px',
                marginBottom: '20px'
            }}>
                {/* Top Products by Stock */}
                <div style={{
                    background: 'white',
                    borderRadius: '10px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0'
                }}>
                    <h3 style={{ 
                        margin: '0 0 15px 0', 
                        fontSize: '16px', 
                        fontWeight: 'bold',
                        color: '#333',
                        borderBottom: '2px solid #007bff',
                        paddingBottom: '10px'
                    }}>
                        📊 Top Products by Stock
                    </h3>
                    {topProducts.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {topProducts.map((product, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px',
                                    background: index % 2 === 0 ? '#f8f9fa' : 'white',
                                    borderRadius: '5px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                                            {product.product_name}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                            {product.description}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        color: '#007bff',
                                        minWidth: '60px',
                                        textAlign: 'right'
                                    }}>
                                        {product.qty} pcs
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                            No inventory data available
                        </div>
                    )}
                </div>

                {/* Recent Activities */}
                <div style={{
                    background: 'white',
                    borderRadius: '10px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0'
                }}>
                    <h3 style={{ 
                        margin: '0 0 15px 0', 
                        fontSize: '16px', 
                        fontWeight: 'bold',
                        color: '#333',
                        borderBottom: '2px solid #28a745',
                        paddingBottom: '10px'
                    }}>
                        🕐 Recent Activities
                    </h3>
                    {recentActivities.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {recentActivities.map((activity, index) => (
                                <div key={index} style={{
                                    padding: '12px',
                                    background: '#f8f9fa',
                                    borderRadius: '5px',
                                    borderLeft: '3px solid #28a745'
                                }}>
                                    <div style={{ 
                                        fontSize: '12px', 
                                        color: '#555',
                                        marginBottom: '5px',
                                        lineHeight: '1.4'
                                    }}>
                                        {activity.activity}
                                    </div>
                                    <div style={{ 
                                        fontSize: '11px', 
                                        color: '#999',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span>{activity.fname} {activity.lname}</span>
                                        <span>{formatTimeAgo(activity.timestamp)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                            No recent activities
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardWR;