'use client';

import "../../css/dashboard.css";
import axios from 'axios';
import { useEffect, useState } from 'react';
import Router from "next/router";


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
    const [customizeRequestList, setCustomizeRequestList] = useState([]);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [outOfStockCount, setOutOfStockCount] = useState(0);
    const [totalInventoryValue, setTotalInventoryValue] = useState('0.00');
    const [recentActivities, setRecentActivities] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [pendingRequestDetails, setPendingRequestDetails] = useState([]);
    const [pendingRequestItems, setPendingRequestItems] = useState({}); // Store items for each request
    const [ongoingDeliveryDetails, setOngoingDeliveryDetails] = useState([]);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [showOngoingModal, setShowOngoingModal] = useState(false);
    const [showOnDeliveryModal, setShowOnDeliveryModal] = useState(false);
    const [showDeliveredModal, setShowDeliveredModal] = useState(false);

    useEffect(() => {
        const user_id = sessionStorage.getItem("user_id");
        if (!user_id){
            return;
        }
        countConfigs.forEach(config => fetchCount(config));
        GetRequest();
        GetCustomizeRequest();
        GetOngoingReq();
        GetDelivered();
        GetRecentActivities();
        
        // Refresh data every 10 seconds for more responsive updates
        const interval = setInterval(() => {
            GetRequest();
            GetCustomizeRequest();
            GetOngoingReq();
            GetDelivered();
            GetRecentActivities();
        }, 10000); // Reduced from 30s to 10s
        
        return () => clearInterval(interval);
    }, []);

    // Update pending request details whenever requestList1 or customizeRequestList changes
    useEffect(() => {
        GetPendingRequestDetails();
    }, [requestList1, customizeRequestList]);

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

    const GetCustomizeRequest = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const ID = {
            locID: LocationID,
            requestType: 'To'  // req_to requests (requests coming TO this warehouse)
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetCustomizeRequest"
                }
            });
            // Filter only Pending status
            const pendingCustomizeRequests = Array.isArray(response.data) 
                ? response.data.filter(req => req.status === 'Pending')
                : [];
            setCustomizeRequestList(pendingCustomizeRequests);
        } catch (error) {
            console.error("Error fetching customize request list:", error);
            setCustomizeRequestList([]);
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
            locID: LocationID
        }

        try {
            // Fetch deliveries from request_delivery table (delivery batch system)
            // This replaces the old request_deliver table
            // Status: 'On Delivery', 'Delivered', 'Complete', 'Cancelled'
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetNormalDeliveries"
                }
            });
            
            const deliveries = Array.isArray(response.data) ? response.data : [];
            setDeliveredList(deliveries);
            
            // Update ongoing delivery details after data is loaded
            GetOngoingDeliveryDetails();

            // DEBUG: Log the data structure to console
            console.log("Deliveries from request_delivery table:", deliveries);

        } catch (error) {
            console.error("Error fetching delivery list:", error);
            setDeliveredList([]);
        }
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

    const GetPendingRequestDetails = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        
        try {
            // Combine both normal and customize pending requests
            const normalRequests = Array.isArray(requestList1) ? requestList1.slice(0, 5) : [];
            const customizeRequests = Array.isArray(customizeRequestList) ? customizeRequestList.slice(0, 5) : [];
            
            // Merge and sort by date (most recent first)
            const allRequests = [
                ...normalRequests.map(req => ({ ...req, type: 'Normal' })),
                ...customizeRequests.map(req => ({ ...req, type: 'Customize' }))
            ].sort((a, b) => {
                const dateA = new Date(a.date || a.created_at || a.request_date || 0);
                const dateB = new Date(b.date || b.created_at || b.request_date || 0);
                return dateB - dateA;
            });
            
            setPendingRequestDetails(allRequests.slice(0, 5));
            
            // Fetch items for each request
            const itemsMap = {};
            for (const request of allRequests.slice(0, 5)) {
                // Use customize_req_id for customize requests, request_stock_id for normal requests
                const requestId = request.type === 'Customize' 
                    ? (request.customize_req_id || request.customize_id)
                    : request.request_stock_id;
                
                if (requestId) {
                    try {
                        if (request.type === 'Normal') {
                            // Fetch normal request items
                            const response = await axios.get(baseURL + 'requestStock.php', {
                                params: {
                                    json: JSON.stringify({ reqID: requestId }),
                                    operation: "GetRequestDetails"
                                }
                            });
                            itemsMap[requestId] = Array.isArray(response.data) ? response.data : [];
                        } else {
                            // Fetch customize request items (both semi and full)
                            // Customize items are linked by customize_sales_id, not customize_req_id
                            const customizeSalesId = request.customize_sales_id;
                            if (!customizeSalesId) {
                                itemsMap[requestId] = [];
                                continue;
                            }
                            
                            const [semiResponse, fullResponse] = await Promise.all([
                                axios.get(baseURL + 'customizeProducts.php', {
                                    params: {
                                        json: JSON.stringify([]),
                                        operation: "GetCustomizeRequestDetailSemi"
                                    }
                                }),
                                axios.get(baseURL + 'customizeProducts.php', {
                                    params: {
                                        json: JSON.stringify([]),
                                        operation: "GetCustomizeRequestDetailFull"
                                    }
                                })
                            ]);
                            
                            // Filter items by customize_sales_id (convert to numbers for comparison)
                            const salesIdNum = parseInt(customizeSalesId);
                            const semiItems = Array.isArray(semiResponse.data) 
                                ? semiResponse.data.filter(item => {
                                    const itemSalesId = parseInt(item.customize_sales_id || 0);
                                    return itemSalesId === salesIdNum;
                                })
                                : [];
                            const fullItems = Array.isArray(fullResponse.data)
                                ? fullResponse.data.filter(item => {
                                    const itemSalesId = parseInt(item.customize_sales_id || 0);
                                    return itemSalesId === salesIdNum;
                                })
                                : [];
                            
                            // Combine and format items with proper structure
                            const allItems = [
                                ...semiItems.map(item => ({ 
                                    ...item,
                                    itemType: 'Semi-Customized',
                                    product_name: item.product_name || item.baseProduct_id || 'N/A',
                                    description: item.description || 'No description',
                                    additionalDescription: item.modifications || 'No modifications specified',
                                    qty: item.qty || 0
                                })),
                                ...fullItems.map(item => ({ 
                                    ...item,
                                    itemType: 'Full-Customized',
                                    product_name: 'Full Custom',
                                    description: item.description || 'N/A',
                                    additionalDescription: item.additional_description || 'N/A',
                                    qty: item.qty || 0
                                }))
                            ];
                            itemsMap[requestId] = allItems;
                        }
                    } catch (error) {
                        console.error(`Error fetching items for request ${requestId}:`, error);
                        itemsMap[requestId] = [];
                    }
                }
            }
            setPendingRequestItems(itemsMap);
        } catch (error) {
            console.error("Error processing pending request details:", error);
        }
    };

    const GetOngoingDeliveryDetails = async () => {
        try {
            // Get deliveries with "On Delivery" status from request_delivery table
            const ongoingDeliveries = Array.isArray(deleveredList) 
                ? deleveredList
                    .filter(item => item.delivery_status === 'On Delivery')
                    .sort((a, b) => {
                        // Sort by delivery date (most recent first)
                        const dateA = new Date(a.date || a.delivery_date);
                        const dateB = new Date(b.date || b.delivery_date);
                        return dateB - dateA;
                    })
                    .slice(0, 5)
                : [];
            
            setOngoingDeliveryDetails(ongoingDeliveries);
        } catch (error) {
            console.error("Error processing ongoing delivery details:", error);
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        
        // Handle different date formats
        let date;
        if (typeof dateString === 'string') {
            // Try parsing as ISO string or common formats
            date = new Date(dateString);
            // If invalid date, try parsing with time
            if (isNaN(date.getTime())) {
                // Try format like "2024-01-01 12:00:00"
                const dateTimeStr = dateString.replace(' ', 'T');
                date = new Date(dateTimeStr);
            }
        } else {
            date = new Date(dateString);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        // Compare dates (ignore time)
        if (dateOnly.getTime() === today.getTime()) {
            return 'Today';
        } else if (dateOnly.getTime() === yesterday.getTime()) {
            return 'Yesterday';
        } else {
            // Return formatted date (e.g., "Jan 15, 2024")
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }
    };

    const formatActivityTime = (dateString) => {
        if (!dateString) return '';
        
        // Handle different date formats
        let date;
        if (typeof dateString === 'string') {
            // Try parsing as ISO string or common formats
            date = new Date(dateString);
            // If invalid date, try parsing with time
            if (isNaN(date.getTime())) {
                // Try format like "2024-01-01 12:00:00"
                const dateTimeStr = dateString.replace(' ', 'T');
                date = new Date(dateTimeStr);
            }
        } else {
            date = new Date(dateString);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(seconds / 3600);
        const days = Math.floor(seconds / 86400);
        
        // Handle negative seconds (future dates) - show as "Just now"
        if (seconds < 0) return 'Just now';
        
        // Just now (less than 1 minute)
        if (seconds < 60) return 'Just now';
        
        // Minutes ago (less than 1 hour)
        if (minutes < 60) {
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        }
        
        // Hours ago (less than 24 hours)
        if (hours < 24) {
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        }
        
        // Yesterday (24-48 hours ago)
        if (days === 1) {
            return 'Yesterday';
        }
        
        // Days ago (less than 7 days)
        if (days < 7) {
            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        }
        
        // Weeks ago (less than 4 weeks)
        const weeks = Math.floor(days / 7);
        if (weeks < 4) {
            return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        }
        
        // Months ago (less than 12 months)
        const months = Math.floor(days / 30);
        if (months < 12) {
            return `${months} ${months === 1 ? 'month' : 'months'} ago`;
        }
        
        // Years ago
        const years = Math.floor(days / 365);
        return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    };

    // Calculate the counts from the respective arrays
    const normalRequestCount = Array.isArray(requestList1) ? requestList1.length : 0;
    const customizeRequestCount = Array.isArray(customizeRequestList) ? customizeRequestList.length : 0;
    const pendingRequestCount = (normalRequestCount + customizeRequestCount).toString();
    const ongoingCount = Array.isArray(requestList) ? requestList.length.toString() : '0';
    
    // Count deliveries from request_delivery table
    // Status in request_delivery: 'On Delivery', 'Delivered', 'Complete', 'Cancelled'
    const deliveredCount = Array.isArray(deleveredList)
        ? deleveredList.filter(item => item.delivery_status === 'Delivered' || item.delivery_status === 'Complete').length.toString()
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
            
            // Expand parent for request-all page (it's a child of combineRequestManagement)
            if (pageKey === 'request-all') {
                setExpandedParent && setExpandedParent('combineRequestManagement');
            }
            
            // For combineRequestManagement, no parent expansion needed (it's a top-level page)

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
            showZero: true,
            description: 'Awaiting approval',
            modalHandler: () => setShowPendingModal(true)
        },
        {
            title: 'ONGOING REQUEST',
            value: ongoingCount,
            pageKey: 'combineRequestManagement',
            image: '/assets/images/onGoing.png',
            color: '#17a2b8',
            showZero: true,
            description: 'In progress',
            modalHandler: () => setShowOngoingModal(true)
        },
        {
            title: 'ONGOING DELIVERY',
            value: OnDeliverCount,
            pageKey: 'delivery',
            filterConfig: { statusFilter: 'On Delivery' },
            image: '/assets/images/obDelivery.png',
            color: '#007bff',
            showZero: true,
            description: 'Out for delivery',
            modalHandler: () => setShowOnDeliveryModal(true)
        },
        {
            title: 'DELIVERED STOCK',
            value: deliveredCount,
            pageKey: 'delivery',
            filterConfig: { statusFilter: 'Delivered' },
            image: '/assets/images/delivered.png',
            color: '#28a745',
            showZero: true,
            description: 'Successfully delivered',
            modalHandler: () => setShowDeliveredModal(true)
        },
    ];

    const router = useRouter();

    // Show all cards now (removed filtering)
    const visibleCards = cards;

    return (
        <div className='dash-main'>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px',
                padding: '0 20px'
            }}>
                <h1 className='h-dashboard' style={{ margin: 0 }}>WAREHOUSE OVERVIEW</h1>
                {/* <button
                    onClick={() => setShowInfoModal(true)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#138496';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#17a2b8';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                >
                    <span style={{ fontSize: '18px' }}>ℹ️</span>
                    <span>Dashboard Info</span>
                </button> */}
            </div>
            
            {/* Status Cards */}
            <div className='container' style={{ marginBottom: '20px' }}>
                {visibleCards.map((card, index) => (
                    <div
                        key={index}
                        className='card'
                        onClick={() => card.modalHandler && card.modalHandler()}
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

            {/* Request Summary Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '20px',
                padding: '0 20px'
            }}>
                {/* Total Requests */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '25px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>Total Active Requests</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                        {parseInt(pendingRequestCount) + parseInt(ongoingCount)}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
                        Pending & Ongoing requests
                    </div>
                </div>

                {/* Request Breakdown */}
                <div style={{
                    background: 'white',
                    padding: '25px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0'
                }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Request Breakdown</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}> Normal Requests:</span>
                            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{normalRequestCount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}> Customize Requests:</span>
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#17a2b8' }}>{customizeRequestCount}</span>
                        </div>
                    </div>
                </div>

                {/* Delivery Status */}
                <div style={{
                    background: 'white',
                    padding: '25px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0'
                }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Delivery Status</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}> On Delivery:</span>
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#007bff' }}>{OnDeliverCount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}>Delivered:</span>
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>{deliveredCount}</span>
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
                {/* Pending Requests */}
                <div style={{
                    background: 'white',
                    borderRadius: '10px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    maxHeight: '600px'
                }}>
                    <h3 style={{ 
                        margin: '0 0 15px 0', 
                        fontSize: '16px', 
                        fontWeight: 'bold',
                        color: '#333',
                        borderBottom: '2px solid #ffc107',
                        paddingBottom: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexShrink: 0
                    }}>
                        <span> Pending Requests</span>
                       
                    </h3>
                    {pendingRequestDetails.length > 0 ? (
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '10px',
                            overflowY: 'auto',
                            flex: 1,
                            paddingRight: '5px'
                        }}>
                            {pendingRequestDetails.map((request, index) => (
                                <div key={index} style={{
                                    padding: '12px',
                                    background: '#f8f9fa',
                                    borderRadius: '5px',
                                    borderLeft: `3px solid ${request.type === 'Customize' ? '#17a2b8' : '#ffc107'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#e9ecef';
                                    e.currentTarget.style.transform = 'translateX(5px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#f8f9fa';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                                onClick={() => handleCardClick('request-all')}
                                >
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '6px'
                                    }}>
                                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                                            Request #{request.id_maker || (request.type === 'Customize' 
                                                ? (request.customize_req_id || request.customize_id) 
                                                : request.request_stock_id)}
                                        </div>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            backgroundColor: request.type === 'Customize' ? '#d1ecf1' : '#fff3cd',
                                            color: request.type === 'Customize' ? '#0c5460' : '#856404'
                                        }}>
                                            {request.type}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                                        <div> From: {request.reqFrom || request.req_from_name}</div>
                                        <div> {formatTimeAgo(request.date || request.created_at || request.request_date)}</div>
                                    </div>
                                    {/* Display items */}
                                    {(() => {
                                        const requestId = request.type === 'Customize' 
                                            ? (request.customize_req_id || request.customize_id)
                                            : request.request_stock_id;
                                        return pendingRequestItems[requestId] && pendingRequestItems[requestId].length > 0;
                                    })() && (() => {
                                        const requestId = request.type === 'Customize' 
                                            ? (request.customize_req_id || request.customize_id)
                                            : request.request_stock_id;
                                        return (
                                        <div style={{ 
                                            marginTop: '10px', 
                                            padding: '10px', 
                                            background: 'white', 
                                            borderRadius: '5px',
                                            border: '1px solid #dee2e6'
                                        }}>
                                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                                                Items ({pendingRequestItems[requestId].length}):
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {pendingRequestItems[requestId].slice(0, 3).map((item, idx) => {
                                                    const isSemiCustom = item.itemType === 'Semi-Customized';
                                                    const productCode = item.product_name || 'N/A';
                                                    const descriptionText = item.description || 'No description';
                                                    const modificationText = item.additionalDescription || item.modifications;

                                                    return (
                                                    <div key={idx} style={{ 
                                                        fontSize: '10px', 
                                                        color: '#6c757d',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '4px 0',
                                                        borderBottom: idx < 2 ? '1px solid #f1f3f5' : 'none'
                                                    }}>
                                                        <div style={{ flex: 1 }}>
                                                            {isSemiCustom ? (
                                                                <>
                                                                    <div style={{ fontWeight: 600 }}>{`Code: ${productCode}`}</div>
                                                                    <div>{descriptionText}</div>
                                                                    {modificationText && (
                                                                        <div style={{ fontSize: '9px', color: '#6c757d', marginTop: '2px', fontStyle: 'italic' }}>
                                                                            Mods: {modificationText}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <div>{item.product_name || item.description || productCode}</div>
                                                            )}
                                                            {item.itemType && (
                                                                <div style={{ fontSize: '9px', color: '#adb5bd', marginTop: '2px' }}>
                                                                    {item.itemType}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span style={{ fontWeight: '600', color: '#495057', marginLeft: '8px' }}>
                                                            Qty: {item.qty || item.quantity || 0}
                                                        </span>
                                                    </div>
                                                    );
                                                })}
                                                {pendingRequestItems[requestId].length > 3 && (
                                                    <div style={{ fontSize: '10px', color: '#6c757d', fontStyle: 'italic', marginTop: '4px' }}>
                                                        +{pendingRequestItems[requestId].length - 3} more item(s)
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        );
                                    })()}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px', opacity: 0.3 }}>📭</div>
                            <div>No pending requests</div>
                        </div>
                    )}
                </div>

                {/* Ongoing Deliveries */}
                <div style={{
                    background: 'white',
                    borderRadius: '10px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    maxHeight: '600px'
                }}>
                    <h3 style={{ 
                        margin: '0 0 15px 0', 
                        fontSize: '16px', 
                        fontWeight: 'bold',
                        color: '#333',
                        borderBottom: '2px solid #007bff',
                        paddingBottom: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexShrink: 0
                    }}>
                        <span>Ongoing Deliveries</span>
                      
                    </h3>
                    {ongoingDeliveryDetails.length > 0 ? (
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '10px',
                            overflowY: 'auto',
                            flex: 1,
                            paddingRight: '5px'
                        }}>
                            {ongoingDeliveryDetails.map((delivery, index) => (
                                <div key={index} style={{
                                    padding: '12px',
                                    background: '#f8f9fa',
                                    borderRadius: '5px',
                                    borderLeft: '3px solid #007bff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#e9ecef';
                                    e.currentTarget.style.transform = 'translateX(5px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#f8f9fa';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                                onClick={() => handleCardClick('delivery', { statusFilter: 'On Delivery' })}
                                >
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '6px'
                                    }}>
                                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                                            Delivery #{delivery.r_delivery_id || delivery.request_stock_id}
                                        </div>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            backgroundColor: '#cfe2ff',
                                            color: '#084298'
                                        }}>
                                            On Delivery
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                                        <div> Request: #{delivery.request_stock_id}</div>
                                        <div> To: {delivery.reqTo || delivery.req_to_name}</div>
                                        <div>Driver: {delivery.driverName || 'N/A'}</div>
                                        <div> {formatTimeAgo(delivery.date || delivery.delivery_date)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px', opacity: 0.3 }}>🚛</div>
                            <div>No ongoing deliveries</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activities Section */}
            <div style={{
                padding: '0 20px',
                marginBottom: '20px'
            }}>
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
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '10px' 
                        }}>
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
                                        <span>{formatActivityTime(activity.timestamp)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px', opacity: 0.3 }}>📝</div>
                            <div>No recent activities</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Information Modal */}
            {showInfoModal && (
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
                        padding: '20px',
                        overflowY: 'auto'
                    }}
                    onClick={() => setShowInfoModal(false)}
                >
                    <div 
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            maxWidth: '900px',
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
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span>ℹ️</span> Dashboard Information
                                </h3>
                                <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                                    Understanding your Warehouse Overview
                                </p>
                            </div>
                            <button
                                onClick={() => setShowInfoModal(false)}
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
                        <div style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
                            {/* Overview Section */}
                            <div style={{ marginBottom: '30px' }}>
                                <h4 style={{ 
                                    margin: '0 0 15px 0', 
                                    fontSize: '18px', 
                                    fontWeight: '700',
                                    color: '#2d3748',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span>📊</span> Dashboard Overview
                                </h4>
                                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4a5568', lineHeight: '1.6' }}>
                                    The Warehouse Dashboard provides a real-time overview of all requests, deliveries, and activities in your warehouse. 
                                    Data automatically refreshes every 10 seconds to keep you updated.
                                </p>
                            </div>

                            {/* Status Cards Section */}
                            <div style={{ marginBottom: '30px' }}>
                                <h4 style={{ 
                                    margin: '0 0 15px 0', 
                                    fontSize: '18px', 
                                    fontWeight: '700',
                                    color: '#2d3748',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span>🎯</span> Status Cards
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ 
                                        padding: '12px', 
                                        backgroundColor: '#fff3cd', 
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #ffc107'
                                    }}>
                                        <div style={{ fontWeight: '600', color: '#856404', marginBottom: '4px' }}>⏳ Pending Requests</div>
                                        <div style={{ fontSize: '13px', color: '#856404' }}>
                                            Stock requests awaiting your approval. Click to view and process them.
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '12px', 
                                        backgroundColor: '#d1ecf1', 
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #17a2b8'
                                    }}>
                                        <div style={{ fontWeight: '600', color: '#0c5460', marginBottom: '4px' }}>🔄 Ongoing Requests</div>
                                        <div style={{ fontSize: '13px', color: '#0c5460' }}>
                                            Approved requests currently being prepared for delivery.
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '12px', 
                                        backgroundColor: '#cfe2ff', 
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #007bff'
                                    }}>
                                        <div style={{ fontWeight: '600', color: '#084298', marginBottom: '4px' }}> Ongoing Delivery</div>
                                        <div style={{ fontSize: '13px', color: '#084298' }}>
                                            Items currently in transit to their destination stores.
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '12px', 
                                        backgroundColor: '#d4edda', 
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #28a745'
                                    }}>
                                        <div style={{ fontWeight: '600', color: '#155724', marginBottom: '4px' }}> Delivered Stock</div>
                                        <div style={{ fontSize: '13px', color: '#155724' }}>
                                            Successfully delivered items that have reached their destination.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Stats Section */}
                            <div style={{ marginBottom: '30px' }}>
                                <h4 style={{ 
                                    margin: '0 0 15px 0', 
                                    fontSize: '18px', 
                                    fontWeight: '700',
                                    color: '#2d3748',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span>📈</span> Summary Statistics
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4a5568', lineHeight: '2' }}>
                                    <li><strong>Total Active Requests:</strong> Combined count of pending and ongoing requests</li>
                                    <li><strong>Request Breakdown:</strong> Separated view of Normal vs Customize requests</li>
                                    <li><strong>Delivery Status:</strong> Quick view of deliveries in transit vs completed</li>
                                </ul>
                            </div>

                            {/* Detailed Views Section */}
                            <div style={{ marginBottom: '30px' }}>
                                <h4 style={{ 
                                    margin: '0 0 15px 0', 
                                    fontSize: '18px', 
                                    fontWeight: '700',
                                    color: '#2d3748',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span>🔍</span> Detailed Views
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4a5568', lineHeight: '2' }}>
                                    <li><strong>Pending Requests Panel:</strong> Shows the 5 most recent pending requests with type badges (Normal/Customize)</li>
                                    <li><strong>Ongoing Deliveries Panel:</strong> Displays active deliveries with delivery ID, driver info, and destination</li>
                                    <li><strong>Recent Activities:</strong> Logs of recent warehouse operations and user actions</li>
                                </ul>
                            </div>

                            {/* Delivery System Section */}
                            <div style={{ marginBottom: '30px' }}>
                                <h4 style={{ 
                                    margin: '0 0 15px 0', 
                                    fontSize: '18px', 
                                    fontWeight: '700',
                                    color: '#2d3748',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span></span> Delivery Batch System
                                </h4>
                                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4a5568', lineHeight: '1.6' }}>
                                    The warehouse uses a delivery batch system that supports partial deliveries:
                                </p>
                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4a5568', lineHeight: '2' }}>
                                    <li>Each delivery batch has a unique Delivery ID (<code>r_delivery_id</code>)</li>
                                    <li>Multiple batches can be created for a single request</li>
                                    <li>Track individual items within each delivery batch</li>
                                    <li>Statuses: On Delivery → Delivered → Complete</li>
                                </ul>
                            </div>

                            {/* Tips Section */}
                            <div style={{ 
                                padding: '15px', 
                                backgroundColor: '#e7f3ff', 
                                borderRadius: '8px',
                                border: '1px solid #b3d7ff'
                            }}>
                                <h4 style={{ 
                                    margin: '0 0 10px 0', 
                                    fontSize: '16px', 
                                    fontWeight: '600',
                                    color: '#004085',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span>💡</span> Quick Tips
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#004085', lineHeight: '1.8' }}>
                                    <li>Click any status card to navigate to the detailed page</li>
                                    <li>Use "View All →" links to see complete lists</li>
                                    <li>Data refreshes automatically every 10 seconds</li>
                                    <li>Hover over cards for interactive effects</li>
                                    <li>Check Recent Activities for latest warehouse operations</li>
                                </ul>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '20px 30px',
                            borderTop: '2px solid #e2e8f0',
                            background: '#f8f9fa',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center'
                        }}>
                            <button
                                onClick={() => setShowInfoModal(false)}
                                style={{
                                    padding: '10px 24px',
                                    backgroundColor: '#667eea',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5568d3'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Requests Modal */}
            {showPendingModal && (
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
                        padding: '20px',
                        overflowY: 'auto'
                    }}
                    onClick={() => setShowPendingModal(false)}
                >
                    <div 
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            maxWidth: '1000px',
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
                            background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span></span> Pending Requests
                                </h3>
                                <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                                    {pendingRequestCount} request{parseInt(pendingRequestCount) !== 1 ? 's' : ''} awaiting approval
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPendingModal(false)}
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
                            {/* Summary */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '15px',
                                marginBottom: '25px'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                                    color: 'white',
                                    padding: '20px',
                                    borderRadius: '10px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '32px', fontWeight: '700' }}>{normalRequestCount}</div>
                                    <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '5px' }}>Normal Requests</div>
                                </div>
                                <div style={{
                                    background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                                    color: 'white',
                                    padding: '20px',
                                    borderRadius: '10px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '32px', fontWeight: '700' }}>{customizeRequestCount}</div>
                                    <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '5px' }}>Customize Requests</div>
                                </div>
                            </div>

                            {/* Request List */}
                            {[...requestList1, ...customizeRequestList].length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {[...requestList1.map(req => ({ ...req, type: 'Normal' })), 
                                      ...customizeRequestList.map(req => ({ ...req, type: 'Customize' }))]
                                      .sort((a, b) => {
                                          const dateA = new Date(a.date || a.created_at || a.request_date || 0);
                                          const dateB = new Date(b.date || b.created_at || b.request_date || 0);
                                          return dateB - dateA;
                                      })
                                      .map((request, index) => (
                                        <div key={index} style={{
                                            padding: '20px',
                                            background: '#f8f9fa',
                                            borderRadius: '10px',
                                            border: `2px solid ${request.type === 'Customize' ? '#17a2b8' : '#ffc107'}`,
                                            transition: 'all 0.2s'
                                        }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: '12px'
                                            }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#2d3748' }}>
                                                        Request #{request.id_maker || (request.type === 'Customize' 
                                                            ? (request.customize_req_id || request.customize_id) 
                                                            : request.request_stock_id)}
                                                    </h4>
                                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                        <span style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '15px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            backgroundColor: request.type === 'Customize' ? '#d1ecf1' : '#fff3cd',
                                                            color: request.type === 'Customize' ? '#0c5460' : '#856404'
                                                        }}>
                                                            {request.type}
                                                        </span>
                                                        <span style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '15px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            backgroundColor: '#fff3cd',
                                                            color: '#856404'
                                                        }}>
                                                            Pending
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ 
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                gap: '12px',
                                                fontSize: '14px',
                                                color: '#4a5568'
                                            }}>
                                                <div>
                                                    <strong style={{ color: '#2d3748' }}> From:</strong><br />
                                                    {request.reqFrom || request.req_from_name || 'N/A'}
                                                </div>
                                                <div>
                                                    <strong style={{ color: '#2d3748' }}> Requested by:</strong><br />
                                                    {request.fname} {request.mname} {request.lname}
                                                </div>
                                                <div>
                                                    <strong style={{ color: '#2d3748' }}> Date:</strong><br />
                                                    {formatTimeAgo(request.date || request.created_at || request.request_date)}
                                                </div>
                                            </div>
                                            {/* Display items in modal */}
                                            {(() => {
                                                const requestId = request.type === 'Customize' 
                                                    ? (request.customize_req_id || request.customize_id)
                                                    : request.request_stock_id;
                                                return pendingRequestItems[requestId] && pendingRequestItems[requestId].length > 0;
                                            })() && (() => {
                                                const requestId = request.type === 'Customize' 
                                                    ? (request.customize_req_id || request.customize_id)
                                                    : request.request_stock_id;
                                                return (
                                                <div style={{ 
                                                    marginTop: '15px', 
                                                    padding: '15px', 
                                                    background: '#f8f9fa', 
                                                    borderRadius: '8px',
                                                    border: '1px solid #dee2e6'
                                                }}>
                                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748', marginBottom: '10px' }}>
                                                         Requested Items ({pendingRequestItems[requestId].length})
                                                    </div>
                                                    <div style={{ 
                                                        maxHeight: '200px', 
                                                        overflowY: 'auto',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '8px'
                                                    }}>
                                                        {pendingRequestItems[requestId].map((item, idx) => (
                                                            <div key={idx} style={{ 
                                                                padding: '10px',
                                                                background: 'white',
                                                                borderRadius: '5px',
                                                                border: '1px solid #dee2e6',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center'
                                                            }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#2d3748' }}>
                                                                    {item.product_name || item.description || 'N/A'}
                                                                    </div>
                                                                    {item.description && item.itemType === 'Full-Customized' && (
                                                                        <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>
                                                                            {item.description}
                                                                        </div>
                                                                    )}
                                                                    {item.additionalDescription && (
                                                                        <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px', fontStyle: 'italic' }}>
                                                                            {item.itemType === 'Semi-Customized' ? `Modifications: ${item.additionalDescription}` : `Details: ${item.additionalDescription}`}
                                                                        </div>
                                                                    )}
                                                                    {item.itemType && (
                                                                        <div style={{ 
                                                                            fontSize: '10px', 
                                                                            color: item.itemType === 'Semi-Customized' ? '#856404' : '#0c5460',
                                                                            marginTop: '4px',
                                                                            padding: '2px 8px',
                                                                            background: item.itemType === 'Semi-Customized' ? '#fff3cd' : '#d1ecf1',
                                                                            borderRadius: '10px',
                                                                            display: 'inline-block'
                                                                        }}>
                                                                            {item.itemType}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div style={{ 
                                                                    fontSize: '14px', 
                                                                    fontWeight: '600', 
                                                                    color: '#007bff',
                                                                    padding: '4px 12px',
                                                                    background: '#e7f3ff',
                                                                    borderRadius: '12px',
                                                                    marginLeft: '10px'
                                                                }}>
                                                                    {item.qty || item.quantity || 0}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                );
                                            })()}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                    <div style={{ fontSize: '60px', marginBottom: '15px' }}>📭</div>
                                    <h4>No Pending Requests</h4>
                                    <p>All requests have been processed.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '20px 30px',
                            borderTop: '2px solid #e2e8f0',
                            background: '#f8f9fa',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center'
                        }}>
                            <button
                                onClick={() => setShowPendingModal(false)}
                                style={{
                                    padding: '10px 24px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
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

            {/* Ongoing Requests Modal */}
            {showOngoingModal && (
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
                        padding: '20px',
                        overflowY: 'auto'
                    }}
                    onClick={() => setShowOngoingModal(false)}
                >
                    <div 
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            maxWidth: '1000px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '25px 30px',
                            borderBottom: '2px solid #e2e8f0',
                            background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span>🔄</span> Ongoing Requests
                                </h3>
                                <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                                    {ongoingCount} request{parseInt(ongoingCount) !== 1 ? 's' : ''} in progress
                                </p>
                            </div>
                            <button
                                onClick={() => setShowOngoingModal(false)}
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

                        <div style={{ padding: '20px 30px', overflowY: 'auto', flex: 1 }}>
                            {requestList.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {requestList.map((request, index) => (
                                        <div key={index} style={{
                                            padding: '20px',
                                            background: '#f8f9fa',
                                            borderRadius: '10px',
                                            border: '2px solid #17a2b8'
                                        }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: '12px'
                                            }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#2d3748' }}>
                                                        Request #{request.request_stock_id}
                                                    </h4>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '15px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        backgroundColor: '#d1ecf1',
                                                        color: '#0c5460'
                                                    }}>
                                                        On Going
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ 
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                gap: '12px',
                                                fontSize: '14px',
                                                color: '#4a5568'
                                            }}>
                                                <div>
                                                    <strong style={{ color: '#2d3748' }}> From:</strong><br />
                                                    {request.reqFrom || 'N/A'}
                                                </div>
                                                <div>
                                                    <strong style={{ color: '#2d3748' }}> To:</strong><br />
                                                    {request.reqTo || 'N/A'}
                                                </div>
                                                <div>
                                                    <strong style={{ color: '#2d3748' }}> Requested by:</strong><br />
                                                    {request.fname} {request.lname}
                                                </div>
                                                <div>
                                                    <strong style={{ color: '#2d3748' }}>Date:</strong><br />
                                                    {formatTimeAgo(request.date)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                    <div style={{ fontSize: '60px', marginBottom: '15px' }}>📋</div>
                                    <h4>No Ongoing Requests</h4>
                                    <p>All requests are either pending or completed.</p>
                                </div>
                            )}
                        </div>

                        <div style={{
                            padding: '20px 30px',
                            borderTop: '2px solid #e2e8f0',
                            background: '#f8f9fa',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center'
                        }}>
                            <button
                                onClick={() => setShowOngoingModal(false)}
                                style={{
                                    padding: '10px 24px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
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

            {/* Ongoing Delivery Modal */}
            {showOnDeliveryModal && (
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
                        padding: '20px',
                        overflowY: 'auto'
                    }}
                    onClick={() => setShowOnDeliveryModal(false)}
                >
                    <div 
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            maxWidth: '1000px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '25px 30px',
                            borderBottom: '2px solid #e2e8f0',
                            background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span></span> Ongoing Deliveries
                                </h3>
                                <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                                    {OnDeliverCount} deliver{parseInt(OnDeliverCount) !== 1 ? 'ies' : 'y'} in transit
                                </p>
                            </div>
                            <button
                                onClick={() => setShowOnDeliveryModal(false)}
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

                        <div style={{ padding: '20px 30px', overflowY: 'auto', flex: 1 }}>
                            {deleveredList.filter(item => item.delivery_status === 'On Delivery').length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {deleveredList.filter(item => item.delivery_status === 'On Delivery').map((delivery, index) => (
                                        <div key={index} style={{
                                            padding: '20px',
                                            background: '#f8f9fa',
                                            borderRadius: '10px',
                                            border: '2px solid #007bff'
                                        }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: '12px'
                                            }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#2d3748' }}>
                                                        Delivery #{delivery.r_delivery_id || delivery.request_stock_id}
                                                    </h4>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '15px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        backgroundColor: '#cfe2ff',
                                                        color: '#084298'
                                                    }}>
                                                        On Delivery
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ 
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                gap: '12px',
                                                fontSize: '14px',
                                                color: '#4a5568'
                                            }}>
                                                <div>
                                                    <strong style={{ color: '#2d3748' }}>Request ID:</strong><br />
                                                    #{delivery.request_stock_id}
                                                </div>
                                                <div>
                                                    <strong style={{ color: '#2d3748' }}> To:</strong><br />
                                                    {delivery.reqTo || delivery.req_to_name || 'N/A'}
                                                </div>
                                                <div>
                                                    <strong style={{ color: '#2d3748' }}> Driver:</strong><br />
                                                    {delivery.driverName || 'Not assigned'}
                                                </div>
                                                <div>
                                                    <strong style={{ color: '#2d3748' }}> Date:</strong><br />
                                                    {formatTimeAgo(delivery.date || delivery.delivery_date)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                    <div style={{ fontSize: '60px', marginBottom: '15px' }}>🚛</div>
                                    <h4>No Ongoing Deliveries</h4>
                                    <p>All deliveries have been completed.</p>
                                </div>
                            )}
                        </div>

                        <div style={{
                            padding: '20px 30px',
                            borderTop: '2px solid #e2e8f0',
                            background: '#f8f9fa',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center'
                        }}>
                            <button
                                onClick={() => setShowOnDeliveryModal(false)}
                                style={{
                                    padding: '10px 24px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
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

            {/* Delivered Stock Modal */}
            {showDeliveredModal && (
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
                        padding: '20px',
                        overflowY: 'auto'
                    }}
                    onClick={() => setShowDeliveredModal(false)}
                >
                    <div 
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            maxWidth: '1000px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '25px 30px',
                            borderBottom: '2px solid #e2e8f0',
                            background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span>✅</span> Delivered Stock
                                </h3>
                                <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                                    {deliveredCount} deliver{parseInt(deliveredCount) !== 1 ? 'ies' : 'y'} completed
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDeliveredModal(false)}
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

                        <div style={{ padding: '20px 30px', overflowY: 'auto', flex: 1 }}>
                            {deleveredList.filter(item => item.delivery_status === 'Delivered' || item.delivery_status === 'Complete').length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {deleveredList.filter(item => item.delivery_status === 'Delivered' || item.delivery_status === 'Complete').map((delivery, index) => (
                                        <div key={index} style={{
                                            padding: '20px',
                                            background: '#f8f9fa',
                                            borderRadius: '10px',
                                            border: '2px solid #28a745'
                                        }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: '12px'
                                            }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#2d3748' }}>
                                                        Delivery #{delivery.r_delivery_id || delivery.request_stock_id}
                                                    </h4>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '15px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        backgroundColor: delivery.delivery_status === 'Complete' ? '#cfe2ff' : '#d4edda',
                                                        color: delivery.delivery_status === 'Complete' ? '#084298' : '#155724'
                                                    }}>
                                                        {delivery.delivery_status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ 
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                gap: '12px',
                                                fontSize: '14px',
                                                color: '#4a5568'
                                            }}>
                                                <div>
                                                    <strong style={{ color: '#2d3748' }}> Request ID:</strong><br />
                                                    #{delivery.request_stock_id}
                                                </div>
                                                <div>
                                                    <strong style={{ color: '#2d3748' }}> To:</strong><br />
                                                    {delivery.reqTo || delivery.req_to_name || 'N/A'}
                                                </div>
                                                <div>
                                                    <strong style={{ color: '#2d3748' }}> Driver:</strong><br />
                                                    {delivery.driverName || 'N/A'}
                                                </div>
                                                <div>
                                                    <strong style={{ color: '#2d3748' }}> Date:</strong><br />
                                                    {formatTimeAgo(delivery.date || delivery.delivery_date)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                    <div style={{ fontSize: '60px', marginBottom: '15px' }}></div>
                                    <h4>No Delivered Stock</h4>
                                    <p>No deliveries have been completed yet.</p>
                                </div>
                            )}
                        </div>

                        <div style={{
                            padding: '20px 30px',
                            borderTop: '2px solid #e2e8f0',
                            background: '#f8f9fa',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center'
                        }}>
                            <button
                                onClick={() => setShowDeliveredModal(false)}
                                style={{
                                    padding: '10px 24px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
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
    );
};

export default DashboardWR;