'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const ITEMS_PER_PAGE = 5;

const CombinedRequests = () => {
    // User session data
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');

    // Stock Request States
    const [stockRequestList, setStockRequestList] = useState([]);
    const [stockRequestDetails, setStockRequestDetails] = useState([]);
    const [currentStoreInventory, setCurrentStoreInventory] = useState([]);
    const [s_reqID, setS_ReqID] = useState('');
    const [s_idMaker, setS_idMaker] = useState('');

    const [s_reqDate, setS_ReqDate] = useState('');
    const [s_reqBy, setS_ReqBy] = useState('');
    const [s_reqFrom, setS_ReqFrom] = useState('');
    const [s_reqStatus, setS_ReqStatus] = useState('');
    const [reqFromId, setReqFromId] = useState('');
    const [reqToId, setReqToId] = useState('');
    const [reqDateTime, setReqDateTime] = useState("");
    const [checkedItems, setCheckedItems] = useState({});
    const [unavailableProducts, setUnavailableProducts] = useState([]);
    const [availProduct, setAvailProducts] = useState([]);
    const [declinedProducts, setDeclinedProducts] = useState([]);

    // Customize Request States
    const [customizeRequestList, setCustomizeRequestList] = useState([]);
    const [semiDetails, setSemiDetails] = useState([]);
    const [fullDetails, setFullDetails] = useState([]);
    const [c_reqID, setC_ReqID] = useState('');
    const [c_idMaker, setC_idMaker] = useState('');
    const [c_salesID, setC_SalesID] = useState('');
    const [c_reqDate, setC_ReqDate] = useState('');
    const [c_reqTime, setC_ReqTime] = useState('');
    const [c_reqBy, setC_ReqBy] = useState('');
    const [c_reqFrom, setC_ReqFrom] = useState('');
    const [c_reqTo, setC_ReqTo] = useState('');
    const [c_reqStatus, setC_ReqStatus] = useState('');
    const [c_reqFromId, setC_ReqFromId] = useState('');
    const [c_reqToId, setC_ReqToId] = useState('');
    const [c_reqDateTime, setC_ReqDateTime] = useState("");
    const [currentSemiDetails, setCurrentSemiDetails] = useState([]);
    const [currentFullDetails, setCurrentFullDetails] = useState([]);
    const [dateAndTime, setDateAndTime] = useState(null);

    // Modal States
    const [showStockModal, setShowStockModal] = useState(false);
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);

    // Alert states
    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

    // Pagination States
    const [currentStockPage, setCurrentStockPage] = useState(1);
    const [currentCustomizeSemiPage, setCurrentCustomizeSemiPage] = useState(1);
    const [currentCustomizeFullPage, setCurrentCustomizeFullPage] = useState(1);

    // Calculate pagination for Stock Request
    const totalStockPages = Math.max(1, Math.ceil(stockRequestDetails.length / ITEMS_PER_PAGE));
    const startStockIndex = (currentStockPage - 1) * ITEMS_PER_PAGE;
    const currentStockItems = stockRequestDetails.slice(startStockIndex, startStockIndex + ITEMS_PER_PAGE);

    // Calculate pagination for Customize Request - Semi
    const totalSemiPages = Math.max(1, Math.ceil(currentSemiDetails.length / ITEMS_PER_PAGE));
    const startSemiIndex = (currentCustomizeSemiPage - 1) * ITEMS_PER_PAGE;
    const currentSemiItems = currentSemiDetails.slice(startSemiIndex, startSemiIndex + ITEMS_PER_PAGE);

    // Calculate pagination for Customize Request - Full
    const totalFullPages = Math.max(1, Math.ceil(currentFullDetails.length / ITEMS_PER_PAGE));
    const startFullIndex = (currentCustomizeFullPage - 1) * ITEMS_PER_PAGE;
    const currentFullItems = currentFullDetails.slice(startFullIndex, startFullIndex + ITEMS_PER_PAGE);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const [year, month, day] = dateStr.split('-');
        const monthName = months[parseInt(month) - 1];
        const dayNum = parseInt(day);
        return `${monthName} ${dayNum} ${year}`;
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return 'N/A';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes}${period}`;
    };

    // Initialize user session
    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));
    }, []);

    // Load all data
    useEffect(() => {
        GetStockRequest();
        GetCustomizeRequest();
        GetSemiDetails();
        GetFullDetails();
    }, []);

    const showAlert = (msg, variant, bg) => {
        setMessage(msg);
        setAlertVariant(variant);
        setAlertBG(bg);
        setAlert1(true);
        setTimeout(() => setAlert1(false), 3000);
    };

    const Logs = async (accID, activity) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'audit-log.php';
        const Details = { accID, activity };
        try {
            await axios.get(url, {
                params: { json: JSON.stringify(Details), operation: "Logs" }
            });
        } catch (error) {
            console.error("Error recording logs:", error);
        }
    };

    // Pagination handlers
    const handleStockPageChange = (page) => {
        if (page >= 1 && page <= totalStockPages) {
            setCurrentStockPage(page);
        }
    };

    const handleSemiPageChange = (page) => {
        if (page >= 1 && page <= totalSemiPages) {
            setCurrentCustomizeSemiPage(page);
        }
    };

    const handleFullPageChange = (page) => {
        if (page >= 1 && page <= totalFullPages) {
            setCurrentCustomizeFullPage(page);
        }
    };

    // ============= STOCK REQUEST FUNCTIONS =============
    const GetStockRequest = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { locID: LocationID, status: 'Pending', reqType: 'ReqTo' };

        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetRequest" }
            });
            setStockRequestList(response.data);
        } catch (error) {
            console.error("Error fetching stock requests:", error);
        }
    };

    const GetStockRequestDetails = async (req_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { reqID: req_id };

        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetRequestDetails" }
            });
            setStockRequestDetails(response.data);
        } catch (error) {
            console.error("Error fetching stock request details:", error);
        }
    };

    const GetDeclinedProducts = async (req_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { reqID: req_id };

        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetDeclinedProducts" }
            });
            
            const declinedProductIds = Array.isArray(response.data) ? response.data : [];
            
            // Use the current stockRequestDetails state to get product details
            const declinedProductsList = stockRequestDetails
                .filter(p => declinedProductIds.includes(parseInt(p.product_id)))
                .map(p => ({
                    product_id: p.product_id,
                    product_name: p.product_name,
                    description: p.description,
                    qty: p.qty
                }));
            
            setDeclinedProducts(declinedProductsList);
        } catch (error) {
            console.error("Error fetching declined products:", error);
            // If table doesn't exist, just set empty array
            setDeclinedProducts([]);
        }
    };

    // Load declined products when stockRequestDetails changes
    useEffect(() => {
        if (s_reqID && stockRequestDetails.length > 0) {
            const loadDeclined = async () => {
                const baseURL = sessionStorage.getItem('baseURL');
                const url = baseURL + 'requestStock.php';
                const ID = { reqID: s_reqID };

                try {
                    const response = await axios.get(url, {
                        params: { json: JSON.stringify(ID), operation: "GetDeclinedProducts" }
                    });
                    
                    const declinedProductIds = Array.isArray(response.data) ? response.data : [];
                    
                    // Use the current stockRequestDetails state to get product details
                    const declinedProductsList = stockRequestDetails
                        .filter(p => declinedProductIds.includes(parseInt(p.product_id)))
                        .map(p => ({
                            product_id: p.product_id,
                            product_name: p.product_name,
                            description: p.description,
                            qty: p.qty
                        }));
                    
                    setDeclinedProducts(declinedProductsList);
                } catch (error) {
                    console.error("Error fetching declined products:", error);
                    setDeclinedProducts([]);
                }
            };
            loadDeclined();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stockRequestDetails, s_reqID]);

    const GetStockRequestD = async (req_id) => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        
        // Validate baseURL and location_id
        if (!baseURL) {
            console.error("baseURL is not set in sessionStorage");
            showAlertError({
                icon: "error",
                title: "Configuration Error",
                text: "Base URL is not configured. Please log in again.",
                button: 'Okay'
            });
            return;
        }

        if (!LocationID || isNaN(LocationID)) {
            console.error("Invalid location_id:", LocationID);
            showAlertError({
                icon: "error",
                title: "Configuration Error",
                text: "Location ID is invalid. Please log in again.",
                button: 'Okay'
            });
            return;
        }

        const url = baseURL + 'requestStock.php';
        const ID = { reqID: req_id, locID: LocationID };

        console.log("GetStockRequestD called with:", {
            reqID: req_id,
            locID: LocationID,
            baseURL: baseURL,
            fullURL: url
        });

        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetRequestD" }
            });
            
            console.log("GetStockRequestD response:", response.data);
            
            // Check if response has data
            if (!response.data || response.data.length === 0) {
                console.error("No data returned from GetRequestD");
                return;
            }

            const data = response.data[0];
            
            // Validate data exists
            if (!data) {
                console.error("Invalid data structure from GetRequestD");
                return;
            }

            setS_ReqBy(`${data.fname || ''} ${data.mname || ''} ${data.lname || ''}`.trim());
            setS_ReqID(data.request_stock_id);
            setS_idMaker(data.id_maker);
            setS_ReqDate(data.date);
            setS_ReqFrom(data.reqFrom);
            setS_ReqStatus(data.request_status);
            setReqFromId(data.request_from);
            setReqToId(data.request_to);

            if (data.request_status === 'Pending') {
                GetTrackRequestTimeandDate(data.request_stock_id, 'Pending');
            } else {
                GetTrackRequestTimeandDate(data.request_stock_id, data.request_status);
            }
        } catch (error) {
            console.error("Error fetching stock request metadata:", error);
            console.error("Request ID:", req_id);
            console.error("Location ID:", LocationID);
            console.error("Error details:", error.response?.data || error.message);
        }
    };

    const GetTrackRequestTimeandDate = async (req_id, status) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { reqID: req_id, status: status };

        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetReqDateAndTime" }
            });
            if (response.data && response.data.length > 0) {
                const formattedDate = formatDate(response.data[0].date);
                const formattedTime = formatTime(response.data[0].time);
                setReqDateTime(`${formattedDate}, ${formattedTime}`);
            }
        } catch (error) {
            console.error("Error fetching request date/time:", error);
        }
    };

    const GetCurrentStoreInventory = async (lc) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'inventory.php';
        const locDetails = { locID: lc, stockLevel: '', search: '' };

        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(locDetails), operation: "GetInventory" }
            });
            setCurrentStoreInventory(response.data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

    const handleCheckboxChange = (product_id, location_id) => {
        const reqQTY = stockRequestDetails.find(f => f.product_id === product_id);
        const av = currentStoreInventory.find(f => f.product_id === product_id);

        if (!av || reqQTY.qty > av.qty || av.qty < 1) {
            showAlert("Product is unavailable or has insufficient stock.", 'danger', '#dc7a80');
            setUnavailableProducts(prev => {
                const productInfo = stockRequestDetails.find(p => p.product_id === product_id);
                if (!prev.find(p => p.product_id === product_id)) {
                    return [...prev, productInfo];
                }
                return prev;
            });
            return;
        }

        setCheckedItems(prev => {
            const isChecked = prev[product_id];
            setAvailProducts(prevAvail => {
                const productInfo = stockRequestDetails.find(p => p.product_id === product_id);
                const alreadyExists = prevAvail.some(p => p.product_id === product_id);
                if (isChecked && alreadyExists) {
                    return prevAvail.filter(p => p.product_id !== product_id);
                } else if (!isChecked && !alreadyExists) {
                    return [...prevAvail, productInfo];
                }
                return prevAvail;
            });
            return { ...prev, [product_id]: !isChecked };
        });
    };

    useEffect(() => {
        const initialChecked = {};
        const unavailable = [];
        const available = [];

        stockRequestDetails.forEach(p => {
            // Skip declined products
            const isDeclined = declinedProducts.some(dp => dp.product_id === p.product_id);
            if (isDeclined) {
                unavailable.push(p);
                return;
            }

            const av = currentStoreInventory.find(f => f.product_id === p.product_id);
            const reqQTY = p.qty;

            if (av && av.qty >= 1 && reqQTY <= av.qty) {
                initialChecked[p.product_id] = true;
                available.push(p);
            } else {
                unavailable.push(p);
            }
        });

        setCheckedItems(initialChecked);
        setUnavailableProducts(unavailable);
        setAvailProducts(available);
    }, [stockRequestDetails, currentStoreInventory, declinedProducts]);

    const createNotification = async (notificationData) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'notifications.php';
        
        try {
            // Format data for PHP backend (using FormData for POST)
            const formData = new FormData();
            formData.append('operation', 'CreateNotification');
            formData.append('json', JSON.stringify(notificationData));

            const response = await axios.post(url, formData);
            console.log('Notification sent successfully:', response.data);
        } catch (error) {
            console.error('Error sending notification:', error);
            console.error('Error details:', error.response?.data || error.message);
        }
    };

    const ApproveStockRequest = async () => {
        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const updates = [];

        // Get all products from stockRequestDetails that are NOT declined
        // Note: Availability is NOT based on inventory - approve all non-declined products
        const allNonDeclinedProducts = stockRequestDetails.filter(p => 
            !declinedProducts.some(dp => dp.product_id === p.product_id)
        );

        // If user has checked items, use those (excluding declined), otherwise use all non-declined products
        let productsToApprove = [];
        
        // Check if there are any checked items that are not declined
        const checkedNonDeclined = Object.keys(checkedItems).filter(productId => {
            if (checkedItems[productId]) {
                const isDeclined = declinedProducts.some(dp => dp.product_id === parseInt(productId));
                return !isDeclined;
            }
            return false;
        });

        if (checkedNonDeclined.length > 0) {
            // User has manually checked items - use only checked ones (excluding declined)
            productsToApprove = checkedNonDeclined;
        } else {
            // No items checked - use ALL non-declined products (regardless of inventory)
            productsToApprove = allNonDeclinedProducts.map(p => p.product_id.toString());
        }

        // If still no products to approve, check if all products are declined
        if (productsToApprove.length === 0) {
            const totalProducts = stockRequestDetails.length;
            const declinedCount = declinedProducts.length;
            
            if (totalProducts === declinedCount) {
                showAlertError({
                    icon: "warning",
                    title: "No Products Available",
                    text: 'All products in this request have been declined.',
                    button: 'OK'
                });
            } else {
                showAlertError({
                    icon: "warning",
                    title: "No Products Selected",
                    text: 'Please select at least one product to approve.',
                    button: 'OK'
                });
            }
            return;
        }

        productsToApprove.forEach(productId => {
            const productIdInt = parseInt(productId);
            const p = stockRequestDetails.find(r => r.product_id === productIdInt);
            const u = currentStoreInventory.find(f => f.product_id === productIdInt);

            // Calculate inventory updates if product exists in inventory
            if (u && p) {
                updates.push({
                    prodID: u.product_id,
                    pastBalance: u.qty,
                    qty: p.qty,
                    currentBalance: u.qty - p.qty
                });
            }
        });

        // Get product details for transfer list (all non-declined products being approved)
        const filteredAvailProducts = allNonDeclinedProducts.filter(p => 
            productsToApprove.includes(p.product_id.toString())
        );
        
        // Combine declined products with unavailable products for the backend
        const allUnavailableProducts = [
            ...unavailableProducts,
            ...declinedProducts.map(dp => ({ product_id: dp.product_id }))
        ];

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const reqDetails1 = {
            reqID: s_reqID,
            accID: accountID,
            reqFromID: reqFromId,
            reqToID: reqToId
        };

        console.log('ApproveStockRequest - Debug Info:', {
            productsToApprove,
            allNonDeclinedProducts,
            filteredAvailProducts,
            allUnavailableProducts,
            updates,
            checkedItems,
            declinedProducts
        });

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(reqDetails1),
                    operation: "AcceptRequestWR",
                    transferList: JSON.stringify(filteredAvailProducts),
                    unavailList: JSON.stringify(allUnavailableProducts),
                    inventoryReportList: JSON.stringify(updates),
                }
            });

            console.log('AcceptRequestWR Response:', response.data);

            if (response.data === 'Success') {
                AlertSucces(
                    "Request successfully approved!",
                    "success",
                    true,
                    'Got It'
                );
                GetStockRequest();
                setShowStockModal(false);
                setDeclinedProducts([]);
                setCheckedItems({});
                
                Logs(accountID, 'Accept the request #' + s_reqID);

                // Send notification to the requesting location (Inventory Manager role)
                await createNotification({
                    type: 'stock_request',
                    title: 'Stock Request Approved',
                    message: `Your stock request #${s_idMaker || s_reqID} has been approved by ${s_reqFrom} and is now on production.`,
                    locationId: reqFromId, // Send to requesting location
                    targetRole: 'Inventory Manager',
                    productId: null,
                    customerId: null,
                    referenceId: s_idMaker || s_reqID
                });
            } else {
                console.error('AcceptRequestWR failed:', {
                    accountID,
                    responseData: response.data,
                    reqDetails: reqDetails1,
                    filteredAvailProducts,
                    allUnavailableProducts,
                    updates
                });
                
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: `Failed to approve the request! Server response: ${JSON.stringify(response.data)}`,
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error approving stock request:", error);
            console.error("Error details:", {
                message: error.message,
                response: error.response?.data,
                request: error.config
            });
            
            showAlertError({
                icon: "error",
                title: "Network Error",
                text: `Failed to connect to server. Please check your connection and try again. Error: ${error.message}`,
                button: 'OK'
            });
        }
    };

    const DeclineProduct = async (product) => {
        // Show confirmation dialog
        const confirmed = await new Promise((resolve) => {
            import('sweetalert2').then((Swal) => {
                Swal.default.fire({
                    icon: 'warning',
                    title: 'Decline Product?',
                    text: `Are you sure you want to decline ${product.product_name} (${product.description}) from this request?`,
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Decline',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#dc3545',
                    cancelButtonColor: '#6c757d',
                    reverseButtons: true
                }).then((result) => {
                    resolve(result.isConfirmed);
                });
            });
        });

        if (!confirmed) {
            return;
        }

        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        
        // Save declined product to database
        const declineDetails = {
            reqID: s_reqID,
            productID: product.product_id,
            accID: accountID,
            reqFromID: reqFromId,
            reqToID: reqToId
        };

        try {
            // Save declined product to database immediately
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(declineDetails),
                    operation: "DeclineProductFromRequest"
                }
            });

            if (response.data === 'Success') {
                console.log('Product declined and saved to database');
            } else {
                console.error('Failed to save declined product:', response.data);
            }
        } catch (error) {
            console.error('Error saving declined product to database:', error);
            // Still update local state even if database save fails
        }
        
        // Add product to declined list
        setDeclinedProducts(prev => {
            if (!prev.find(p => p.product_id === product.product_id)) {
                return [...prev, product];
            }
            return prev;
        });

        // Remove from checked items if it was checked
        setCheckedItems(prev => {
            const newChecked = { ...prev };
            delete newChecked[product.product_id];
            return newChecked;
        });

        // Remove from available products if it was there
        setAvailProducts(prev => prev.filter(p => p.product_id !== product.product_id));

        AlertSucces(
            `Product ${product.product_name} declined from request`,
            "success",
            true,
            'Got It'
        );

        Logs(accountID, `Declined product ${product.product_name} (ID: ${product.product_id}) from request #${s_reqID}`);
    };

    const DeclineStockRequest = async () => {
        // Show confirmation dialog
        const confirmed = await new Promise((resolve) => {
            import('sweetalert2').then((Swal) => {
                Swal.default.fire({
                    icon: 'warning',
                    title: 'Decline Request?',
                    text: `Are you sure you want to decline stock request #${s_reqID}? This action cannot be undone.`,
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Decline',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#dc3545',
                    cancelButtonColor: '#6c757d',
                    reverseButtons: true
                }).then((result) => {
                    resolve(result.isConfirmed);
                });
            });
        });

        if (!confirmed) {
            return;
        }

        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        
        // Try multiple operation names that might exist
        const operations = [
            "DeclineRequestWR",
            "RejectRequestWR",
            "UpdateRequestStatus",
            "CancelRequestWR"
        ];

        const reqDetails1 = {
            reqID: s_reqID,
            accID: accountID,
            reqFromID: reqFromId,
            reqToID: reqToId,
            status: 'Declined'
        };

        console.log('Declining stock request:', reqDetails1);

        let lastError = null;
        
        // Try each operation until one works
        for (const operation of operations) {
            try {
                console.log(`Trying operation: ${operation}`);
                const response = await axios.get(url, {
                    params: {
                        json: JSON.stringify(reqDetails1),
                        operation: operation
                    }
                });

                console.log(`Response for ${operation}:`, response.data);

                // Check for success in different formats
                if (response.data === 'Success' || 
                    response.data?.success === true || 
                    response.data?.message === 'Success' ||
                    response.data === '1' ||
                    (typeof response.data === 'string' && response.data.toLowerCase().includes('success'))) {
                    
                    AlertSucces(
                        "Request successfully declined!",
                        "success",
                        true,
                        'Got It'
                    );
                    GetStockRequest();
                    setShowStockModal(false);
                    setDeclinedProducts([]);
                    Logs(accountID, 'Decline the request #' + s_reqID);

                    // Send notification to the requesting location (Inventory Manager role)
                    await createNotification({
                        type: 'stock_request',
                        title: 'Stock Request Declined',
                        message: `Your stock request #${s_idMaker || s_reqID} has been declined by ${s_reqFrom}. Please contact them for more information.`,
                        locationId: reqFromId,
                        targetRole: 'Inventory Manager',
                        productId: null,
                        customerId: null,
                        referenceId: s_idMaker || s_reqID
                    });
                    return; // Success, exit function
                }
            } catch (error) {
                console.log(`Operation ${operation} failed:`, error.response?.data || error.message);
                lastError = error;
                continue; // Try next operation
            }
        }

        // If all operations failed, show error
        console.error('All decline operations failed. Last error:', lastError);
        showAlertError({
            icon: "error",
            title: "Backend Operation Not Found",
            text: 'The decline operation is not available in the backend. Please contact the administrator to add this functionality.',
            button: 'OK'
        });
    };

    // ============= CUSTOMIZE REQUEST FUNCTIONS =============
    const GetCustomizeRequest = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const ID = { locID: LocationID };

        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetCustomizeRequest" }
            });
            setCustomizeRequestList(response.data);
            console.log(response.data);
            
        } catch (error) {
            console.error("Error fetching customize requests:", error);
        }
    };

    const GetSemiDetails = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';

        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify([]), operation: "GetCustomizeRequestDetailSemi" }
            });
            setSemiDetails(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching semi details:", error);
            return [];
        }
    };

    const GetFullDetails = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';

        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify([]), operation: "GetCustomizeRequestDetailFull" }
            });
            setFullDetails(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching full details:", error);
            return [];
        }
    };

    const GetCustomizeRequestD = async (customize_req_id) => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const ID = { customizeReqID: customize_req_id, locID: LocationID };

        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetCustomizeRequestD" }
            });

            if (response.data && response.data.length > 0) {
                const data = response.data[0];
                setC_ReqBy(`${data.fname} ${data.mname} ${data.lname}`);
            }
        } catch (error) {
            console.error("Error fetching customize request details:", error);
        }
    };

    const GetStatsAndDate = async (stats, CR_ID, fallbackDate = null, fallbackTime = null) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const ID = { stats: stats, CD_ID: CR_ID };

        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetTheStatusDate" }
            });

            if (response.data && response.data.length > 0 && response.data[0].date) {
                const formattedDate = formatDate(response.data[0].date);
                const formattedTime = formatTime(response.data[0].time);
                setDateAndTime(`${formattedDate}, ${formattedTime}`);
            } else {
                // Fallback: use provided date/time or 'N/A'
                if (fallbackDate && fallbackTime) {
                    const formattedDate = formatDate(fallbackDate);
                    const formattedTime = formatTime(fallbackTime);
                    setDateAndTime(`${formattedDate}, ${formattedTime}`);
                } else {
                    setDateAndTime('N/A');
                }
            }
        } catch (error) {
            console.error("Error fetching status date:", error);
            // Fallback on error
            if (fallbackDate && fallbackTime) {
                const formattedDate = formatDate(fallbackDate);
                const formattedTime = formatTime(fallbackTime);
                setDateAndTime(`${formattedDate}, ${formattedTime}`);
            } else {
                setDateAndTime('N/A');
            }
        }
    };

    const ApproveCustomizeRequest = async () => {
        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const reqDetails1 = { accID: accountID, customizeID: c_reqID };

        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(reqDetails1), operation: "AcceptCustomizeRequestWR" }
            });

            if (response.data === 'Success') {
                AlertSucces(
                    "Customize request successfully approved!",
                    "success",
                    true,
                    'Got It'
                );
                GetCustomizeRequest();
                GetSemiDetails();
                GetFullDetails();
                setShowCustomizeModal(false);
                Logs(accountID, 'Accept the customize request #' + c_reqID);

                // Send notification to the requesting location (Sales Clerk role)
                await createNotification({
                    type: 'customize_request',
                    title: 'Customize Request Approved',
                    message: `Your customize request #${c_reqID} has been approved by ${c_reqFrom} and is now on production.`,
                    locationId: c_reqFromId, // Send to requesting location
                    targetRole: 'Sales Clerk',
                    productId: null,
                    customerId: null,
                    referenceId: c_reqID
                });
            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to approve the customize request!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error approving customize request:", error);
        }
    };

    const DeclineCustomizeRequest = async () => {
        // Show confirmation dialog
        const confirmed = await new Promise((resolve) => {
            import('sweetalert2').then((Swal) => {
                Swal.default.fire({
                    icon: 'warning',
                    title: 'Decline Request?',
                    text: `Are you sure you want to decline customize request #${c_reqID}? This action cannot be undone.`,
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Decline',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#dc3545',
                    cancelButtonColor: '#6c757d',
                    reverseButtons: true
                }).then((result) => {
                    resolve(result.isConfirmed);
                });
            });
        });

        if (!confirmed) {
            return;
        }

        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        
        // Try multiple operation names that might exist
        const operations = [
            "DeclineCustomizeRequestWR",
            "RejectCustomizeRequestWR",
            "UpdateCustomizeRequestStatus",
            "CancelCustomizeRequestWR"
        ];

        const reqDetails1 = { 
            accID: accountID, 
            customizeID: c_reqID,
            status: 'Declined'
        };

        console.log('Declining customize request:', reqDetails1);

        let lastError = null;
        
        // Try each operation until one works
        for (const operation of operations) {
            try {
                console.log(`Trying operation: ${operation}`);
                const response = await axios.get(url, {
                    params: { 
                        json: JSON.stringify(reqDetails1), 
                        operation: operation 
                    }
                });

                console.log(`Response for ${operation}:`, response.data);

                // Check for success in different formats
                if (response.data === 'Success' || 
                    response.data?.success === true || 
                    response.data?.message === 'Success' ||
                    response.data === '1' ||
                    (typeof response.data === 'string' && response.data.toLowerCase().includes('success'))) {
                    
                    AlertSucces(
                        "Customize request successfully declined!",
                        "success",
                        true,
                        'Got It'
                    );
                    GetCustomizeRequest();
                    GetSemiDetails();
                    GetFullDetails();
                    setShowCustomizeModal(false);
                    Logs(accountID, 'Decline the customize request #' + c_reqID);

                    // Send notification to the requesting location (Sales Clerk role)
                    await createNotification({
                        type: 'customize_request',
                        title: 'Customize Request Declined',
                        message: `Your customize request #${c_reqID} has been declined by ${c_reqFrom}. Please contact them for more information.`,
                        locationId: c_reqFromId,
                        targetRole: 'Sales Clerk',
                        productId: null,
                        customerId: null,
                        referenceId: c_reqID
                    });
                    return; // Success, exit function
                }
            } catch (error) {
                console.log(`Operation ${operation} failed:`, error.response?.data || error.message);
                lastError = error;
                continue; // Try next operation
            }
        }

        // If all operations failed, show error
        console.error('All decline operations failed. Last error:', lastError);
        showAlertError({
            icon: "error",
            title: "Backend Operation Not Found",
            text: 'The decline operation is not available in the backend. Please contact the administrator to add this functionality.',
            button: 'OK'
        });
    };

    const openStockModal = async (request) => {
        setCurrentStockPage(1);
        setDeclinedProducts([]); // Reset declined products initially
        setReqDateTime(""); // Reset date/time
        await GetStockRequestD(request.request_stock_id);
        await GetCurrentStoreInventory(location_id);
        await GetStockRequestDetails(request.request_stock_id); // This will trigger useEffect to load declined products
        setShowStockModal(true);
    };

    const openCustomizeModal = async (request) => {
        const salesId = request.customize_sales_id;
        setC_idMaker(request.id_maker || request.customize_req_id);
        setC_ReqID(request.customize_req_id);
        setC_SalesID(request.customize_sales_id);
        setC_ReqDate(formatDate(request.date));
        setC_ReqTime(request.time);
        setC_ReqFrom(request.reqFrom);
        setC_ReqTo(request.reqTo);
        setC_ReqStatus(request.status);
        setC_ReqFromId(request.req_from);
        setC_ReqToId(request.req_to);
        setC_ReqDateTime(request.date + " • " + request.time);
        setC_ReqBy(request.lname + ", " + request.fname + " " + request.mname);
        setDateAndTime(null); // Reset date/time
        await GetStatsAndDate(request.status, request.customize_req_id, request.date, request.time);

        const [semiData, fullData] = await Promise.all([GetSemiDetails(), GetFullDetails()]);

        const filteredSemi = semiData.filter(item => parseInt(item.customize_sales_id) === parseInt(salesId));
        const filteredFull = fullData.filter(item => parseInt(item.customize_sales_id) === parseInt(salesId));

        setCurrentSemiDetails(filteredSemi);
        setCurrentFullDetails(filteredFull);
        setCurrentCustomizeSemiPage(1);
        setCurrentCustomizeFullPage(1);

        await GetCustomizeRequestD(request.customize_req_id);
        setShowCustomizeModal(true);
    };

    // Combine and sort all requests by id_maker ascending
    const allRequests = [
        ...stockRequestList.map(req => ({
            ...req,
            type: 'stock',
            id: req.id_maker || req.request_stock_id,
            displayDate: req.date,
            displayTime: req.time
        })),
        ...customizeRequestList.filter(req => req.status === 'Pending').map(req => ({
            ...req,
            type: 'customize',
            id: req.id_maker || req.customize_req_id,
            displayDate: req.date,
            displayTime: req.time
        }))
    ].sort((a, b) => {
        // Sort by id_maker (ascending) - treat as string for proper alphanumeric sorting
        const idA = String(a.id || '');
        const idB = String(b.id || '');
        const idCompare = idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
        
        // If id_maker is the same, sort by date/time as secondary sort
        if (idCompare !== 0) {
            return idCompare;
        }
        
        const dateTimeA = new Date(`${a.displayDate} ${a.displayTime || '00:00:00'}`);
        const dateTimeB = new Date(`${b.displayDate} ${b.displayTime || '00:00:00'}`);
        return dateTimeA - dateTimeB;
    });

    return (
        <div>
            <Alert variant={alertVariant} show={alert1} style={{ backgroundColor: alertBG }}>
                {message}
            </Alert>

            {/* Stock Request Modal */}
            {/* Stock Request Modal */}
            <Modal show={showStockModal} onHide={() => { setShowStockModal(false); setAvailProducts([]); }} size="lg" className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Request Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>

                    <div className="r-details-head">
                        <div className='r-d-div'>
                            <div className='r-1'><strong>REQUEST ID:</strong> {s_idMaker} </div>
                            <div><strong>REQUEST DATE:</strong> {s_reqDate ? formatDate(s_reqDate) : 'N/A'}</div>
                        </div>
                        <div><strong>REQUEST FROM:</strong> {s_reqFrom}</div>
                        <div><strong>REQUEST BY:</strong> {s_reqBy}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: s_reqStatus === 'Pending' ? 'red' : s_reqStatus === 'Approved' ? 'green' : 'black',
                                fontWeight: 'bold'
                            }}>
                                {s_reqStatus} {reqDateTime ? `| ${reqDateTime}` : ''}
                            </span>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div style={{ display: 'flex', gap: '15px', marginTop: '15px', marginBottom: '20px' }}>
                        <div style={{ flex: 1, padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px', border: '1px solid #28a745' }}>
                            <div style={{ fontSize: '14px', color: '#155724', marginBottom: '5px' }}>Total Items Requested</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>{stockRequestDetails.length}</div>
                        </div>
                        <div style={{ flex: 1, padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px', border: '1px solid #17a2b8' }}>
                            <div style={{ fontSize: '14px', color: '#0c5460', marginBottom: '5px' }}>Total Quantity</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0c5460' }}>
                                {stockRequestDetails.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0)}
                            </div>
                        </div>
                    </div>

                    <div style={{ border: '1px solid #ddd', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '500px' }}>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 0 }}>
                                <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1 }}>
                                    <tr>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', width: '20%' }}>Product Code</th>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', width: '45%' }}>Description</th>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', width: '15%', textAlign: 'center' }}>QTY</th>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', width: '20%', textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentStockItems.length > 0 ? (
                                        currentStockItems.map((p, i) => {
                                            const isDeclined = declinedProducts.some(dp => dp.product_id === p.product_id);
                                            return (
                                                <tr 
                                                    key={i}
                                                    style={{
                                                        backgroundColor: isDeclined ? '#f8d7da' : 'transparent',
                                                        opacity: isDeclined ? 0.6 : 1
                                                    }}
                                                >
                                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: '500' }}>
                                                        {p.product_name}
                                                        {isDeclined && (
                                                            <span style={{
                                                                marginLeft: '8px',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                fontSize: '10px',
                                                                backgroundColor: '#dc3545',
                                                                color: 'white',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                DECLINED
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{p.description}</td>
                                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center', fontWeight: '500', fontSize: '16px' }}>{p.qty}</td>
                                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                                                        {!isDeclined ? (
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    DeclineProduct(p);
                                                                }}
                                                                style={{
                                                                    fontSize: '12px',
                                                                    padding: '4px 12px'
                                                                }}
                                                            >
                                                                Decline
                                                            </Button>
                                                        ) : (
                                                            <span style={{
                                                                color: '#dc3545',
                                                                fontWeight: 'bold',
                                                                fontSize: '12px'
                                                            }}>
                                                                Declined
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: "center", padding: "30px", fontStyle: "italic", color: '#666' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
                                                <div style={{ fontSize: '16px' }}>No items found</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Fixed Pagination Footer */}
                        <div style={{
                            borderTop: '1px solid #ddd',
                            backgroundColor: '#f8f9fa',
                            minHeight: '60px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {totalStockPages > 1 ? (
                                <CustomPagination
                                    currentPage={currentStockPage}
                                    totalPages={totalStockPages}
                                    onPageChange={handleStockPageChange}
                                    color="green"
                                />
                            ) : (
                                <div style={{ height: '40px' }}></div>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { 
                        setShowStockModal(false); 
                        setAvailProducts([]); 
                        setDeclinedProducts([]);
                    }}>
                        Close
                    </Button>
                    <Button variant="danger" onClick={DeclineStockRequest} style={{ marginRight: '10px' }}>
                        Decline All
                    </Button>
                    <Button variant="primary" onClick={ApproveStockRequest}>
                        Accept Selected
                        {Object.keys(checkedItems).filter(key => checkedItems[key]).length > 0 && (
                            <span style={{ marginLeft: '8px', fontSize: '12px' }}>
                                ({Object.keys(checkedItems).filter(key => checkedItems[key]).length})
                            </span>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Customize Request Modal */}
            <Modal show={showCustomizeModal} onHide={() => { 
                setShowCustomizeModal(false); 
                setCurrentSemiDetails([]); 
                setCurrentFullDetails([]);
            }} size="xl" className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Customize Request Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    <div className="r-details-head">
                        <div className='r-d-div'>
                            <div><strong>REQUEST ID:</strong> {c_idMaker}</div>
                            <div><strong>REQUEST DATE:</strong> {c_reqDate}</div>
                        </div>

                        <div><strong>REQUEST FROM:</strong> {c_reqFrom}</div>
                        <div><strong>REQUEST TO:</strong> {c_reqTo}</div>
                        <div><strong>REQUEST BY:</strong> {c_reqBy}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: c_reqStatus === 'Pending' ? 'red' : c_reqStatus === 'Approved' ? 'green' : 'black',
                                fontWeight: 'bold'
                            }}>
                                {c_reqStatus} {dateAndTime ? `| ${dateAndTime}` : ''}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '15px', marginBottom: '20px' }}>
                        <div style={{ flex: 1, padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
                            <div style={{ fontSize: '14px', color: '#856404', marginBottom: '5px' }}>Semi-Customized Items</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>{currentSemiDetails.length}</div>
                        </div>
                        <div style={{ flex: 1, padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px', border: '1px solid #17a2b8' }}>
                            <div style={{ fontSize: '14px', color: '#0c5460', marginBottom: '5px' }}>Full-Customized Items</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0c5460' }}>{currentFullDetails.length}</div>
                        </div>
                        <div style={{ flex: 1, padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px', border: '1px solid #28a745' }}>
                            <div style={{ fontSize: '14px', color: '#155724', marginBottom: '5px' }}>Total Items</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>{currentSemiDetails.length + currentFullDetails.length}</div>
                        </div>
                    </div>

                    <div style={{ border: '1px solid #ddd', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '500px' }}>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {(() => {
                                // Combine semi and full items into one array
                                const allCustomizeItems = [
                                    ...(currentSemiDetails || []).map(item => ({
                                        type: 'Semi-Customized',
                                        baseProductId: item.baseProduct_id,
                                        productName: item.product_name || 'N/A',
                                        description: item.description || 'No description',
                                        additionalDescription: item.modifications || 'No modifications specified',
                                        qty: item.qty
                                    })),
                                    ...(currentFullDetails || []).map(item => ({
                                        type: 'Full-Customized',
                                        baseProductId: null,
                                        productName: 'N/A',
                                        description: item.description || 'N/A',
                                        additionalDescription: item.additional_description || 'N/A',
                                        qty: item.qty
                                    }))
                                ];

                                // Calculate pagination for combined items
                                const startIndex = (currentCustomizeSemiPage - 1) * ITEMS_PER_PAGE;
                                const paginatedItems = allCustomizeItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

                                return allCustomizeItems.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 0 }}>
                                        <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1 }}>
                                            <tr>
                                                <th style={{ padding: '12px', border: '1px solid #dee2e6', width: '15%' }}>Type</th>
                                                <th style={{ padding: '12px', border: '1px solid #dee2e6', width: '15%' }}>Base Product Code</th>
                                                <th style={{ padding: '12px', border: '1px solid #dee2e6', width: '35%' }}>Description</th>
                                                <th style={{ padding: '12px', border: '1px solid #dee2e6', width: '25%' }}>Additional Description</th>
                                                <th style={{ padding: '12px', border: '1px solid #dee2e6', width: '10%', textAlign: 'center' }}>Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                                        <span style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            backgroundColor: item.type === 'Semi-Customized' ? '#fff3cd' : '#d1ecf1',
                                                            color: item.type === 'Semi-Customized' ? '#856404' : '#0c5460'
                                                        }}>
                                                            {item.type}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: '500' }}>{item.productName || 'N/A'}</td>
                                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{item.description}</td>
                                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{item.additionalDescription || 'N/A'}</td>
                                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center', fontWeight: '500', fontSize: '16px' }}>{item.qty || 0}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{ textAlign: "center", padding: "30px", fontStyle: "italic", color: '#666' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
                                        <div style={{ fontSize: '16px' }}>No customize items found</div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Fixed Pagination Footer */}
                        <div style={{
                            borderTop: '1px solid #ddd',
                            backgroundColor: '#f8f9fa',
                            minHeight: '60px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {(() => {
                                const allCustomizeItems = [
                                    ...(currentSemiDetails || []),
                                    ...(currentFullDetails || [])
                                ];
                                const totalPagesCustomize = Math.ceil(allCustomizeItems.length / ITEMS_PER_PAGE);

                                return totalPagesCustomize > 1 ? (
                                    <CustomPagination
                                        currentPage={currentCustomizeSemiPage}
                                        totalPages={totalPagesCustomize}
                                        onPageChange={handleSemiPageChange}
                                        color="green"
                                    />
                                ) : (
                                    <div style={{ height: '40px' }}></div>
                                );
                            })()}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { 
                        setShowCustomizeModal(false); 
                        setCurrentSemiDetails([]); 
                        setCurrentFullDetails([]);
                    }}>Close</Button>
                    <Button variant="primary" onClick={ApproveCustomizeRequest}>Accept Request</Button>
                </Modal.Footer>
            </Modal>

            {/* Main Page */}
            <div className='dash-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>ALL REQUESTS</h1>
                </div>

                <div className="cardContainer" style={{ height: '60vh', overflowY: 'auto', padding: '10px' }}>
                    {allRequests.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            textAlign: 'center',
                            color: '#666',
                            fontSize: '18px'
                        }}>
                            <div>
                                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
                                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>No Requests Found</div>
                                <div>There are currently no pending requests to display.</div>
                            </div>
                        </div>
                    ) : (
                        allRequests.map((req, i) => (
                            <div
                                key={i}
                                className="requestCard"
                                onClick={() => req.type === 'stock' ? openStockModal(req) : openCustomizeModal(req)}
                            >
                                <div className="cardContent">
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '10px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', marginRight: '10px', padding: '4px 8px', borderRadius: '4px', backgroundColor: req.type === 'stock' ? '#e3f2fd' : '#fff3cd', color: req.type === 'stock' ? '#1976d2' : '#856404' }}>
                                                {req.type === 'stock' ? 'STOCK REQUEST' : 'CUSTOMIZE REQUEST'}
                                            </span>
                                        </div>

                                        <div className="cardRow" style={{ maxWidth: '100%' }}>
                                            <span className="cardLabel" style={{ fontSize: '18px' }}>{req.type === 'stock' ? 'REQUEST ID:' : 'REQUEST ID:'}</span>
                                            <span className="cardValue" style={{ fontSize: '18px', fontWeight: 'bold' }}>{req.id}</span>
                                        </div>

                                        {req.type === 'stock' ? (
                                            <>
                                                <div className="cardRow">
                                                    <span className="cardLabel">REQUEST FROM:</span>
                                                    <span className="cardValue">{req.reqFrom}</span>
                                                </div>
                                                <div className="cardRow">
                                                    <span className="cardLabel">REQUEST BY:</span>
                                                    <span className="cardValue">{req.fname} {req.mname} {req.lname}</span>
                                                </div>
                                                <div className="cardRow">
                                                    <span className="cardLabel">STATUS:</span>
                                                    <span className="cardValue" style={{ color: req.request_status === 'Pending' ? 'red' : req.request_status === 'Approved' ? 'green' : 'black' }}>
                                                        {req.request_status}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="cardRow">
                                                    <span className="cardLabel">REQUEST FROM:</span>
                                                    <span className="cardValue">{req.reqFrom}</span>
                                                </div>
                                                <div className="cardRow">
                                                    <span className="cardLabel">REQUEST TO:</span>
                                                    <span className="cardValue">{req.reqTo}</span>
                                                </div>
                                                <div className="cardRow">
                                                    <span className="cardLabel">STATUS:</span>
                                                    <span className="cardValue" style={{ color: req.status === 'Pending' ? 'red' : req.status === 'Approved' ? 'green' : 'black' }}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="statusIcon">
                                        {(req.type === 'stock' ? req.request_status : req.status) === 'Pending' && <span>⟳</span>}
                                        {(req.type === 'stock' ? req.request_status : req.status) === 'Approved' && <span>✅</span>}
                                        {(req.type === 'stock' ? req.request_status : req.status) !== 'Pending' && (req.type === 'stock' ? req.request_status : req.status) !== 'Approved' && <span>📦</span>}
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

export default CombinedRequests;
