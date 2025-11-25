'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Dropdown from 'react-bootstrap/Dropdown';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const ITEMS_PER_PAGE = 9;
const CARDS_PER_PAGE = 5;
const ITEMS_PER_DETAILS_PAGE = 5;

const UnifiedRequestManagement = () => {
    const [activeTab, setActiveTab] = useState('normal');

    // Common states
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [locationList, setLocationList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [driverList, setDriverList] = useState([]);

    // Alert states
    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

    // Normal Stock Request states
    const [normalRequestList, setNormalRequestList] = useState([]);
    const [normalDeliverDetails, setNormalDeliverDetails] = useState([]);
    const [normalDeclinedProducts, setNormalDeclinedProducts] = useState([]);
    const [normalRequestFromFilter, setNormalRequestFromFilter] = useState('');
    const [normalRequestByFilter, setNormalRequestByFilter] = useState('');
    const [normalSearchFilter, setNormalSearchFilter] = useState('');
    const [normalCurrentPage, setNormalCurrentPage] = useState(1);
    const [normalCurrentPageDetails, setNormalCurrentPageDetails] = useState(1);
    const [normalDeliveriesDataVisible, setNormalDeliveriesDataVisible] = useState(true);
    const [normalAppointDriverVisible, setNormalAppointDriverVisible] = useState(true);
    const [normalRequestID, setNormalRequestID] = useState('');
    const [normalIdMaker, setNormalIdMaker] = useState('');
    const [normalRequestFrom, setNormalRequestFrom] = useState('');
    const [normalRequestBy, setNormalRequestBy] = useState('');
    const [normalRequestStatus, setNormalRequestStatus] = useState('');
    const [normalRequestDate, setNormalRequestDate] = useState('');
    const [normalReqDateTime, setNormalReqDateTime] = useState('');
    const [normalTransferDriver, setNormalTransferDriver] = useState('');
    const [selectedNormalDriverOption, setSelectedNormalDriverOption] = useState('');
    const [normalRID, setNormalRID] = useState('');
    const [normalRIDMaker, setNormalRIDMaker] = useState(''); // Store id_maker for display in notifications/logs
    const [normalRequestFromID, setNormalRequestFromID] = useState('');
    const [normalSelectedProductsForDelivery, setNormalSelectedProductsForDelivery] = useState([]);
    const [normalDeliveredProducts, setNormalDeliveredProducts] = useState([]);

    // Customize Request states
    const [customizeRequestList, setCustomizeRequestList] = useState([]);
    const [semiDetails, setSemiDetails] = useState([]);
    const [fullDetails, setFullDetails] = useState([]);
    const [customizeRequestFromFilter, setCustomizeRequestFromFilter] = useState('');
    const [customizeRequestByFilter, setCustomizeRequestByFilter] = useState('');
    const [customizeSearchFilter, setCustomizeSearchFilter] = useState('');
    const [customizeCurrentCardsPage, setCustomizeCurrentCardsPage] = useState(1);
    const [currentSemiDetails, setCurrentSemiDetails] = useState([]);
    const [currentFullDetails, setCurrentFullDetails] = useState([]);
    const [currentSemiPage, setCurrentSemiPage] = useState(1);
    const [currentFullPage, setCurrentFullPage] = useState(1);
    const [customizeDeliveriesDataVisible, setCustomizeDeliveriesDataVisible] = useState(true);
    const [customizeAppointDriverVisible, setCustomizeAppointDriverVisible] = useState(true);
    const [customizeRequestID, setCustomizeRequestID] = useState('');
    const [customizeRIDMaker, setCustomizeRIDMaker] = useState('');
    const [customizeRequestFrom, setCustomizeRequestFrom] = useState('');
    const [customizeRequestBy, setCustomizeRequestBy] = useState('');
    const [customizeRequestStatus, setCustomizeRequestStatus] = useState('');
    const [customizeRequestDate, setCustomizeRequestDate] = useState('');
    const [customizeRequestTo, setCustomizeRequestTo] = useState('');
    const [customizeDateAndTime, setCustomizeDateAndTime] = useState('');
    const [customizeTransferDriverName, setCustomizeTransferDriverName] = useState('');
    const [selectedCustomizeDriverOption, setSelectedCustomizeDriverOption] = useState('');
    const [customizeDeliverToID, setCustomizeDeliverToID] = useState('');
    const [customizeRID, setCustomizeRID] = useState('');

    // Initialize session data
    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));
    }, []);

    useEffect(() => {
        GetNormalRequest();
        GetCustomizeRequest();
        GetUser();
        GetLocation();
        GetSemiDetails();
        GetFullDetails();
        GetDrivers();
    }, []);

    // Format functions
    const formatDate = (dateStr) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const [year, month, day] = dateStr.split('-');
        const monthName = months[parseInt(month) - 1];
        const dayNum = parseInt(day);
        return `${monthName} ${dayNum} ${year}`;
    };

    const handleNormalDriverSelect = (event) => {
        const value = event.target.value;
        setSelectedNormalDriverOption(value);
        if (value && value !== 'other') {
            const driver = driverList.find(d => String(d.driver_id) === value);
            setNormalTransferDriver(driver ? formatDriverName(driver) : '');
        } else {
            setNormalTransferDriver('');
        }
    };

    const handleCustomizeDriverSelect = (event) => {
        const value = event.target.value;
        setSelectedCustomizeDriverOption(value);
        if (value && value !== 'other') {
            const driver = driverList.find(d => String(d.driver_id) === value);
            setCustomizeTransferDriverName(driver ? formatDriverName(driver) : '');
        } else {
            setCustomizeTransferDriverName('');
        }
    };

    const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes}${period}`;
    };

    const formatDriverName = (driver) => {
        if (!driver) return '';
        return [driver.fname, driver.nname, driver.lname].filter(Boolean).join(' ').trim();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return { bg: '#fff3cd', text: '#856404', border: '#ffc107' };
            case 'On Going': return { bg: '#fff3e0', text: '#e65100', border: '#ff9800' };
            case 'On Delivery': return { bg: '#e3f2fd', text: '#0d47a1', border: '#2196f3' };
            case 'Delivered': return { bg: '#d4edda', text: '#155724', border: '#28a745' };
            case 'Complete': return { bg: '#cfe2ff', text: '#084298', border: '#0d6efd' };
            default: return { bg: '#f8f9fa', text: '#495057', border: '#6c757d' };
        }
    };

    // Common API calls
    const GetUser = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'users.php';
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify([]), operation: "GetUsers" }
            });
            setUserList(response.data);
        } catch (error) {
            console.error("Error fetching user list:", error);
        }
    };

    const GetLocation = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'location.php';
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify([]), operation: "GetLocation" }
            });
            setLocationList(response.data);
        } catch (error) {
            console.error("Error fetching location list:", error);
        }
    };

    const GetDrivers = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        if (!baseURL) return;
        const url = baseURL + 'delivery.php';
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify([]), operation: "GetDrivers" }
            });
            setDriverList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching driver list:", error);
            setDriverList([]);
        }
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
            console.error("Error recording logs events:", error);
        }
    };

    // ==================== NORMAL STOCK REQUEST FUNCTIONS ====================
    const GetNormalRequest = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { locID: LocationID, status: 'OnGoing', reqType: 'ReqTo' };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetRequest2" }
            });
            setNormalRequestList(response.data);
        } catch (error) {
            console.error("Error fetching normal request list:", error);
        }
    };

    const GetNormalDeliveriesData = async (transaction_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        const ID = { transID: transaction_id };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetRequestData" }
            });
            console.log(response.data);

            const data = response.data[0];
            setNormalRequestID(response.data[0].request_stock_id); // Keep for internal operations
            setNormalIdMaker(response.data[0].id_maker); // For display
            setNormalRIDMaker(response.data[0].id_maker || response.data[0].request_stock_id); // Store for notifications/logs
            setNormalRequestFrom(response.data[0].reqFrom);
            setNormalRequestFromID(response.data[0].request_from); // Store requesting location ID
            setNormalRequestBy(response.data[0].fname + " " + response.data[0].mname + " " + response.data[0].lname);
            setNormalRequestStatus(response.data[0].request_status);
            GetNormalTrackRequestTimeandDate(data.request_stock_id, data.request_status);
            setNormalRequestDate(formatDate(data.date));
        } catch (error) {
            console.error("Error fetching normal deliveries data:", error);
        }
    };

    const GetNormalTrackRequestTimeandDate = async (req_id, status) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { reqID: req_id, status: status };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetReqDateAndTime" }
            });
            if (response.data && response.data.length > 0) {
                setNormalReqDateTime(formatDate(response.data[0].date) + " • " + formatTime(response.data[0].time));
            }
        } catch (error) {
            console.error("Error fetching normal request date/time:", error);
        }
    };

    // Helper function to validate if a product is declined in the database
    const validateProductIsDeclined = async (req_id, product_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { reqID: req_id };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetDeclinedProducts" }
            });
            
            let declinedProductIds = [];
            let data = response.data;
            
            // Parse response data
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    console.error('Error parsing JSON string:', e);
                    data = [];
                }
            }
            
            // Extract product IDs from response
            if (Array.isArray(data)) {
                declinedProductIds = data
                    .map(id => parseInt(id))
                    .filter(id => !isNaN(id));
            } else if (data && typeof data === 'object' && !Array.isArray(data)) {
                declinedProductIds = Object.values(data)
                    .map(id => parseInt(id))
                    .filter(id => !isNaN(id));
            }
            
            // Check if the specific product ID is in the declined list
            const productIdNum = parseInt(product_id);
            const isDeclined = declinedProductIds.includes(productIdNum);
            
            return isDeclined;
        } catch (error) {
            console.error("Error validating declined product:", error);
            return false; // If error, assume not declined
        }
    };

    const GetNormalDeclinedProducts = async (req_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { reqID: req_id };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetDeclinedProducts" }
            });
            
            // Handle various response formats - Axios should auto-parse JSON
            let declinedProductIds = [];
            let data = response.data;
            
            // If response is a string, parse it
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    console.error('Error parsing JSON string:', e);
                    data = [];
                }
            }
            
            // Extract product IDs from response
            if (Array.isArray(data)) {
                declinedProductIds = data
                    .map(id => parseInt(id))
                    .filter(id => !isNaN(id));
            } else if (data && typeof data === 'object' && !Array.isArray(data)) {
                // Handle object response (e.g., {0: 123, 1: 456})
                declinedProductIds = Object.values(data)
                    .map(id => parseInt(id))
                    .filter(id => !isNaN(id));
            }
            
            console.log(`[GetDeclinedProducts] Request ${req_id}: Found ${declinedProductIds.length} declined products from database:`, declinedProductIds);
            
            setNormalDeclinedProducts(declinedProductIds);
            return declinedProductIds; // Return for immediate use
        } catch (error) {
            console.error("Error fetching declined products from database:", error);
            console.error("Error details:", error.response?.data || error.message);
            setNormalDeclinedProducts([]);
            return [];
        }
    };

    const GetNormalDeliveredProducts = async (req_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { reqID: req_id };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetDeliveredProducts" }
            });
            
            let deliveredProductIds = [];
            let data = response.data;
            
            console.log(`[GetDeliveredProducts] Raw response for request ${req_id}:`, data);
            
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    console.error('Error parsing JSON string:', e);
                    data = [];
                }
            }
            
            // The API returns an array of product IDs directly, not objects
            if (Array.isArray(data)) {
                deliveredProductIds = data
                    .map(id => {
                        // Handle both direct IDs and objects with product_id
                        if (typeof id === 'object' && id.product_id !== undefined) {
                            return parseInt(id.product_id);
                        }
                        return parseInt(id);
                    })
                    .filter(id => !isNaN(id) && id > 0);
            } else if (data && typeof data === 'object' && !Array.isArray(data)) {
                // Handle object response (e.g., {0: 123, 1: 456})
                deliveredProductIds = Object.values(data)
                    .map(id => {
                        if (typeof id === 'object' && id.product_id !== undefined) {
                            return parseInt(id.product_id);
                        }
                        return parseInt(id);
                    })
                    .filter(id => !isNaN(id) && id > 0);
            }
            
            console.log(`[GetDeliveredProducts] Request ${req_id}: Parsed ${deliveredProductIds.length} delivered product IDs:`, deliveredProductIds);
            setNormalDeliveredProducts(deliveredProductIds);
            return deliveredProductIds;
        } catch (error) {
            console.error("Error fetching delivered products:", error);
            console.error("Error details:", error.response?.data || error.message);
            setNormalDeliveredProducts([]);
            return [];
        }
    };

    const GetSelectedDeliveryItems = async (req_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { reqID: req_id };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetSelectedDeliveryItems" }
            });
            
            let selectedItems = [];
            let data = response.data;
            
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    console.error('Error parsing JSON string:', e);
                    data = [];
                }
            }
            
            if (Array.isArray(data)) {
                selectedItems = data;
            }
            
            console.log(`[GetSelectedDeliveryItems] Request ${req_id}: Found ${selectedItems.length} selected items from database`);
            return selectedItems;
        } catch (error) {
            console.error("Error fetching selected delivery items:", error);
            return [];
        }
    };

    const SaveSelectedDeliveryItems = async (req_id, selectedProductIds) => {
        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { 
            reqID: req_id, 
            accID: accountID,
            selectedProducts: selectedProductIds 
        };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "SaveSelectedDeliveryItems" }
            });
            
            if (response.data === 'Success' || response.data === '"Success"') {
                console.log(`[SaveSelectedDeliveryItems] Successfully saved ${selectedProductIds.length} selected items for request ${req_id}`);
                return true;
            } else {
                console.error('SaveSelectedDeliveryItems - Error:', response.data);
                return false;
            }
        } catch (error) {
            console.error("Error saving selected delivery items:", error);
            return false;
        }
    };

    const GetNormalDeliveriesDetails = async (transaction_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { reqID: transaction_id };
        try {
            // Step 1: Fetch declined products FIRST from database to validate
            const declinedProductIds = await GetNormalDeclinedProducts(transaction_id);
            console.log(`[VALIDATION] Request ${transaction_id}: Validated ${declinedProductIds.length} declined products from database`);
            
            // Step 1.5: Fetch delivered products to track partial delivery status (get returned value)
            const deliveredProductIds = await GetNormalDeliveredProducts(transaction_id);
            
            // Step 2: ALWAYS fetch ALL products from request_stock_details (not from selected_delivery table)
            // This ensures we show ALL products (both delivered and pending) after partial delivery
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetRequestDetails" }
            });
            
            const allProducts = Array.isArray(response.data) ? response.data : [];
            console.log(`[GetNormalDeliveriesDetails] Fetched ${allProducts.length} total products from request_stock_details`);
            
            // Step 3: Filter out declined products ONLY (keep all others including delivered ones)
            const declinedIdsAsNumbers = declinedProductIds.map(id => parseInt(id)).filter(id => !isNaN(id));
            const declinedIdsAsStrings = declinedProductIds.map(id => String(id));
            
            const filteredData = allProducts.filter(item => {
                if (!item || item.product_id === undefined || item.product_id === null) {
                    return true;
                }
                
                const productIdNum = parseInt(item.product_id);
                const productIdStr = String(item.product_id);
                
                const isDeclined = declinedIdsAsNumbers.includes(productIdNum) || 
                                   declinedIdsAsStrings.includes(productIdStr) ||
                                   declinedIdsAsNumbers.includes(item.product_id) ||
                                   declinedIdsAsStrings.includes(item.product_id);
                
                return !isDeclined;
            });
            
            console.log(`[GetNormalDeliveriesDetails] After filtering declined: ${filteredData.length} products remain (includes both delivered and pending)`);
            console.log(`[GetNormalDeliveriesDetails] Delivered products: ${deliveredProductIds.length} (${JSON.stringify(deliveredProductIds)})`);
            
            // Step 4: Set the delivery details (includes ALL non-declined products)
            setNormalDeliverDetails(filteredData);
            
            // Step 6: Load selected products from database for checkbox state (only if state is empty)
            // This prevents overwriting user's manual selections
            const selectedItems = await GetSelectedDeliveryItems(transaction_id);
            const selectedProductIds = selectedItems
                .filter(item => item.delivery_status === 'Selected')
                .map(item => parseInt(item.product_id));
            
            setNormalSelectedProductsForDelivery(prev => {
                // If state is empty, use database values (but only for pending items)
                if (prev.length === 0) {
                    // Filter to only include pending (not delivered) products for initial selection
                    // Use the returned deliveredProductIds directly instead of state
                    const pendingSelectedIds = selectedProductIds.filter(prodId => {
                        return !deliveredProductIds.some(deliveredId => 
                            parseInt(deliveredId) === prodId || 
                            String(deliveredId) === String(prodId) ||
                            parseInt(deliveredId) === parseInt(prodId)
                        );
                    });
                    console.log(`[GetNormalDeliveriesDetails] Setting initial selection from database: ${pendingSelectedIds.length} pending products (out of ${selectedProductIds.length} total selected)`);
                    return pendingSelectedIds;
                }
                // Otherwise, keep current selection (user has made manual changes)
                console.log(`[GetNormalDeliveriesDetails] Keeping existing selection (${prev.length} products), not overwriting with database values`);
                return prev;
            });
            
            setNormalCurrentPageDetails(1);
        } catch (error) {
            console.error("Error fetching normal deliveries details:", error);
            setNormalDeliverDetails([]);
        }
    };

    const DeliverNormalStock = async () => {
        if (normalTransferDriver === '' || normalTransferDriver.trim().length === 0) {
            showAlertError({
                icon: "error",
                title: "Wait!",
                text: "Please enter a driver name first.",
                button: 'Okay'
            });
            return;
        }

        // Check if any products are selected for partial delivery
        if (normalSelectedProductsForDelivery.length === 0) {
            showAlertError({
                icon: "error",
                title: "Wait!",
                text: "Please select at least one product to deliver.",
                button: 'Okay'
            });
            return;
        }

        // VALIDATION: Ensure we only send products that are NOT already delivered
        const pendingProducts = normalFilteredDeliverDetails
            .filter(item => {
                const productId = parseInt(item.product_id);
                return !normalDeliveredProducts.some(deliveredId => 
                    parseInt(deliveredId) === productId || 
                    String(deliveredId) === String(productId)
                );
            })
            .map(item => parseInt(item.product_id));

        // Filter selected products to only include pending (not delivered) products
        const selectedProductIds = normalSelectedProductsForDelivery
            .map(id => parseInt(id))
            .filter(id => !isNaN(id) && id > 0)
            .filter(id => pendingProducts.includes(id)); // Only include products that are still pending

        if (selectedProductIds.length === 0) {
            showAlertError({
                icon: "error",
                title: "Wait!",
                text: "Selected products are already delivered. Please select different products.",
                button: 'Okay'
            });
            return;
        }

        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        
        console.log('[DeliverNormalStock] State Check:');
        console.log('  - normalSelectedProductsForDelivery (before filtering):', normalSelectedProductsForDelivery);
        console.log('  - Pending products (not delivered):', pendingProducts);
        console.log('  - Selected Product IDs (after filtering):', selectedProductIds);
        console.log('  - Request ID:', normalRID);
        console.log('  - Driver:', normalTransferDriver);
        
        const ID = { 
            accID: accountID, 
            reqID: parseInt(normalRID), 
            driverName: normalTransferDriver,
            selectedProducts: selectedProductIds // Array of product IDs to deliver (ensured as integers)
        };
        try {
            const response = await axios.get(url, {
                params: { 
                    json: JSON.stringify(ID), 
                    operation: "DeliverStockPartial"
                }
            });
            
            console.log('DeliverStockPartial - Response:', response.data);
            
            if (response.data === 'Success' || response.data === '"Success"') {
                // Update selected items status to "Delivered" in database
                const baseURL = sessionStorage.getItem('baseURL');
                const updateUrl = baseURL + 'requestStock.php';
                const updateID = {
                    reqID: parseInt(normalRID),
                    productIds: selectedProductIds,
                    status: 'Delivered'
                };
                try {
                    await axios.get(updateUrl, {
                        params: { json: JSON.stringify(updateID), operation: "UpdateSelectedDeliveryStatus" }
                    });
                } catch (error) {
                    console.error("Error updating selected delivery status:", error);
                }
                
                AlertSucces(
                    `Successfully delivered ${selectedProductIds.length} product(s). Driver: ${normalTransferDriver}`,
                    "success",
                    true,
                    'Ok'
                );
                setNormalAppointDriverVisible(true);
                setSelectedNormalDriverOption('');
                setNormalDeliveriesDataVisible(true);
                setNormalSelectedProductsForDelivery([]);
                GetNormalRequest();
                // Refresh delivered products list FIRST, then refresh details
                await GetNormalDeliveredProducts(normalRID);
                GetNormalDeliveriesDetails(normalRID); // Refresh to show updated delivery status
                Logs(accountID, `Delivered ${selectedProductIds.length} product(s) from request #${normalRIDMaker || normalRID}`);
                
                // Send notification to requesting location (Inventory Manager)
                await createNotification({
                    type: 'delivery',
                    title: 'Stock Partially Delivered',
                    message: `${selectedProductIds.length} product(s) from request #${normalRIDMaker || normalRID} are now on delivery. Driver: ${normalTransferDriver}`,
                    locationId: normalRequestFromID, // Send to requesting location
                    targetRole: 'Inventory Manager',
                    productId: null,
                    customerId: null,
                    referenceId: normalRIDMaker || normalRID
                });
            } else {
                // Show the actual error message from backend
                const errorMessage = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
                console.error('DeliverStockPartial - Error response:', errorMessage);
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: errorMessage.includes('Error:') ? errorMessage : 'Failed to deliver the stock! ' + errorMessage,
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error delivering normal stock:", error);
            console.error("Error response data:", error.response?.data);
            const errorMessage = error.response?.data || error.message || 'Failed to deliver the stock!';
            showAlertError({
                icon: "error",
                title: "Error!",
                text: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
                button: 'Try Again'
            });
        }
    };

    const handleProductSelectionForDelivery = async (productId) => {
        const newSelection = normalSelectedProductsForDelivery.includes(productId)
            ? normalSelectedProductsForDelivery.filter(id => id !== productId)
            : [...normalSelectedProductsForDelivery, productId];
        
        setNormalSelectedProductsForDelivery(newSelection);
        
        // Save to database
        if (normalRID) {
            await SaveSelectedDeliveryItems(normalRID, newSelection);
        }
    };

    const handleSelectAllProductsForDelivery = async () => {
        const pendingProducts = normalFilteredDeliverDetails
            .filter(item => {
                const productId = parseInt(item.product_id);
                // Check if product is NOT delivered - compare both as integers and strings
                return !normalDeliveredProducts.some(deliveredId => 
                    parseInt(deliveredId) === productId || 
                    String(deliveredId) === String(productId) ||
                    parseInt(deliveredId) === parseInt(item.product_id)
                );
            })
            .map(item => parseInt(item.product_id));
        
        const newSelection = normalSelectedProductsForDelivery.length === pendingProducts.length
            ? []
            : pendingProducts;
        
        setNormalSelectedProductsForDelivery(newSelection);
        
        // Save to database
        if (normalRID) {
            await SaveSelectedDeliveryItems(normalRID, newSelection);
        }
    };

    // Function to create notification
    const createNotification = async (notificationData) => {
        const baseURL = sessionStorage.getItem('baseURL');
        if (!baseURL) return;

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

    // ==================== CUSTOMIZE REQUEST FUNCTIONS ====================
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
        } catch (error) {
            console.error("Error fetching customize request list:", error);
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

    const GetCustomizeStatsAndDate = async (stats, CR_ID) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const ID = { stats: stats, CD_ID: CR_ID };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetTheStatusDate" }
            });
            if (response.data && response.data.length > 0) {
                const formattedDate = formatDate(response.data[0].date);
                const formattedTime = formatTime(response.data[0].time);
                setCustomizeDateAndTime(`${formattedDate}, ${formattedTime}`);
            }
        } catch (error) {
            console.error("Error fetching customize status date:", error);
        }
    };

    const GetCustomizeDeliveriesData = async (request) => {
        const salesId = request.customize_sales_id;
        setCustomizeRequestID(request.customize_req_id);
        setCustomizeRIDMaker(request.id_maker || request.customize_req_id);
        setCustomizeRequestFrom(request.reqFrom);
        setCustomizeRequestBy(`${request.fname} ${request.mname} ${request.lname}`);
        setCustomizeRequestStatus(request.status);
        setCustomizeRequestDate(formatDate(request.date));
        setCustomizeRequestTo(request.reqTo);
        setCustomizeDeliverToID(request.req_from);
        setCurrentSemiPage(1);
        setCurrentFullPage(1);

        await GetCustomizeStatsAndDate(request.status, request.customize_req_id);
        const [semiData, fullData] = await Promise.all([GetSemiDetails(), GetFullDetails()]);
        const filteredSemi = semiData.filter(item => parseInt(item.customize_sales_id) === parseInt(salesId));
        const filteredFull = fullData.filter(item => parseInt(item.customize_sales_id) === parseInt(salesId));
        setCurrentSemiDetails(filteredSemi);
        setCurrentFullDetails(filteredFull);
    };

    const DeliverCustomizeStock = async () => {
        if (customizeTransferDriverName === '') {
            showAlertError({
                icon: "error",
                title: "Wait!",
                text: "Please enter a driver name first.",
                button: 'Okay'
            });
            return;
        }
        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const locationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const ID = {
            accID: accountID,
            reqID: customizeRID,
            driverName: customizeTransferDriverName,
            deliverTo: customizeDeliverToID,
            deliverFrom: locationID
        };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "DeliverCustomize" }
            });
            if (response.data === 'Success') {
                AlertSucces(
                    "Successfully appointed a driver and it's ready to deliver",
                    "success",
                    true,
                    'Got It'
                );
                setCustomizeAppointDriverVisible(true);
                setSelectedCustomizeDriverOption('');
                setCustomizeDeliveriesDataVisible(true);
                GetCustomizeRequest();
                Logs(accountID, 'Deliver the customize request #' + (customizeRIDMaker || customizeRID));
                
                // Send notification to requesting location (Sales Clerk)
                await createNotification({
                    type: 'delivery',
                    title: 'Customize Order On Delivery',
                    message: `Your customize request #${customizeRIDMaker || customizeRID} is now on delivery. Driver: ${customizeTransferDriverName}`,
                    locationId: customizeDeliverToID, // Send to requesting location
                    targetRole: 'Sales Clerk',
                    productId: null,
                    customerId: null,
                    referenceId: customizeRIDMaker || customizeRID
                });
            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to deliver the stock!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error delivering customize stock:", error);
        }
    };

    // ==================== FILTERED DATA ====================
    const normalFilteredData = useMemo(() => {
        let filtered = [...normalRequestList];
        if (normalRequestFromFilter) {
            filtered = filtered.filter(item => item.reqFrom?.toLowerCase().includes(normalRequestFromFilter.toLowerCase()));
        }
        if (normalRequestByFilter) {
            filtered = filtered.filter(item => {
                const fullName = `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase();
                return fullName.includes(normalRequestByFilter.toLowerCase());
            });
        }
        if (normalSearchFilter.trim()) {
            const searchTerm = normalSearchFilter.toLowerCase();
            filtered = filtered.filter(item =>
                item.id_maker?.toString().includes(searchTerm) ||
                item.request_stock_id?.toString().includes(searchTerm) ||
                item.reqFrom?.toLowerCase().includes(searchTerm) ||
                `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase().includes(searchTerm)
            );
        }
        return filtered;
    }, [normalRequestList, normalRequestFromFilter, normalRequestByFilter, normalSearchFilter]);

    const customizeFilteredData = useMemo(() => {
        let filtered = [...customizeRequestList];
        filtered = filtered.filter(item => item.status === 'On Going');
        if (customizeRequestFromFilter) {
            filtered = filtered.filter(item => item.reqFrom?.toLowerCase().includes(customizeRequestFromFilter.toLowerCase()));
        }
        if (customizeRequestByFilter) {
            filtered = filtered.filter(item => {
                const fullName = `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase();
                return fullName.includes(customizeRequestByFilter.toLowerCase());
            });
        }
        if (customizeSearchFilter.trim()) {
            const searchTerm = customizeSearchFilter.toLowerCase();
            filtered = filtered.filter(item =>
                item.id_maker?.toString().includes(searchTerm) ||
                item.reqFrom?.toLowerCase().includes(searchTerm) ||
                `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase().includes(searchTerm)
            );
        }
        return filtered;
    }, [customizeRequestList, customizeRequestFromFilter, customizeRequestByFilter, customizeSearchFilter]);

    // Pagination calculations
    const normalTotalPages = Math.ceil(normalFilteredData.length / ITEMS_PER_PAGE);
    const normalStartIndex = (normalCurrentPage - 1) * ITEMS_PER_PAGE;
    const normalCurrentItems = normalFilteredData.slice(normalStartIndex, normalStartIndex + ITEMS_PER_PAGE);

    const customizeTotalCardsPages = Math.ceil(customizeFilteredData.length / CARDS_PER_PAGE);
    const customizeStartCardsIndex = (customizeCurrentCardsPage - 1) * CARDS_PER_PAGE;
    const customizeCurrentCardsItems = customizeFilteredData.slice(customizeStartCardsIndex, customizeStartCardsIndex + CARDS_PER_PAGE);

    // Use the already filtered data directly (no need for additional filtering since it's done in GetNormalDeliveriesDetails)
    const normalFilteredDeliverDetails = normalDeliverDetails;

    const normalTotalPagesDetails = Math.ceil(normalFilteredDeliverDetails.length / ITEMS_PER_DETAILS_PAGE);
    const normalStartIndexDetails = (normalCurrentPageDetails - 1) * ITEMS_PER_DETAILS_PAGE;
    const normalCurrentItemsDetails = normalFilteredDeliverDetails.slice(normalStartIndexDetails, normalStartIndexDetails + ITEMS_PER_DETAILS_PAGE);

    const selectedNormalDriver = driverList.find(driver => String(driver.driver_id) === selectedNormalDriverOption);
    const selectedCustomizeDriver = driverList.find(driver => String(driver.driver_id) === selectedCustomizeDriverOption);

    // Reset pagination on filter change
    useEffect(() => {
        setNormalCurrentPage(1);
    }, [normalRequestFromFilter, normalRequestByFilter, normalSearchFilter]);

    useEffect(() => {
        setCustomizeCurrentCardsPage(1);
        setCurrentSemiPage(1);
        setCurrentFullPage(1);
    }, [customizeRequestFromFilter, customizeRequestByFilter, customizeSearchFilter]);

    const getUniqueNormalLocations = () => {
        const uniqueLocations = [...new Set(normalRequestList.map(item => item.reqFrom).filter(Boolean))];
        return uniqueLocations.sort();
    };

    const getUniqueNormalUsers = () => {
        const uniqueUsers = [...new Set(normalRequestList.map(item => `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.trim()).filter(name => name))];
        return uniqueUsers.sort();
    };

    const getUniqueCustomizeLocations = () => {
        const onGoingRequests = customizeRequestList.filter(item => item.status === 'On Going');
        const uniqueLocations = [...new Set(onGoingRequests.map(item => item.reqFrom).filter(Boolean))];
        return uniqueLocations.sort();
    };

    const getUniqueCustomizeUsers = () => {
        const onGoingRequests = customizeRequestList.filter(item => item.status === 'On Going');
        const uniqueUsers = [...new Set(onGoingRequests.map(item => `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.trim()).filter(name => name))];
        return uniqueUsers.sort();
    };

    // ==================== RENDER ====================
    return (
        <>
            <Alert variant={alertVariant} show={alert1} style={{ backgroundColor: alertBG }}>
                {message}
            </Alert>

            {/* Normal Stock Request - Delivery Details Modal */}
            <Modal show={!normalDeliveriesDataVisible} onHide={() => setNormalDeliveriesDataVisible(true)} size='xl'>
                <Modal.Header closeButton>
                    <Modal.Title>Request Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    {/* <div style={{ marginBottom: '20px' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <div><strong>REQUEST ID:</strong> {normalRequestID}</div>
                        </div>
                        <div><strong>REQUEST FROM:</strong> {normalRequestFrom}</div>
                        <div><strong>REQUEST BY:</strong> {normalRequestBy}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: normalRequestStatus === "Pending" ? "red"
                                    : normalRequestStatus === "Delivered" ? "green"
                                        : normalRequestStatus === "On Going" ? "orange"
                                            : normalRequestStatus === "On Delivery" ? "goldenrod"
                                                : normalRequestStatus === "Complete" ? "blue"
                                                    : "black",
                                fontWeight: 'bold'
                            }}>
                                {normalRequestStatus} | {normalReqDateTime}
                            </span>
                        </div>
                    </div> */}  

                    <div className="r-details-head">
                        <div className='r-d-div'>
                            <div><strong>REQUEST ID:</strong> {normalIdMaker}</div>
                            <div><strong>REQUEST DATE:</strong> {normalRequestDate}</div>
                        </div>

                        <div><strong>REQUEST FROM:</strong> {normalRequestFrom}</div>
                        <div><strong>REQUEST BY:</strong> {normalRequestBy}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: normalRequestStatus === "Pending" ? "red"
                                    : normalRequestStatus === "Delivered" ? "green"
                                        : normalRequestStatus === "On Going" ? "orange"
                                            : normalRequestStatus === "On Delivery" ? "goldenrod"
                                                : normalRequestStatus === "Complete" ? "blue"
                                                    : "black",
                                fontWeight: 'bold'
                            }}>
                                {normalRequestStatus} | {normalReqDateTime}
                            </span>
                        </div>
                    </div>

                    {/* Summary Cards for Normal Stock */}
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ flex: 1, padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px', border: '1px solid #28a745' }}>
                            <div style={{ fontSize: '14px', color: '#155724', marginBottom: '5px' }}>Total Items</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>{normalFilteredDeliverDetails.length}</div>
                        </div>
                        <div style={{ flex: 1, padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px', border: '1px solid #17a2b8' }}>
                            <div style={{ fontSize: '14px', color: '#0c5460', marginBottom: '5px' }}>Total Quantity</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0c5460' }}>
                                {normalFilteredDeliverDetails.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0)}
                            </div>
                        </div>
                        <div style={{ flex: 1, padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
                            <div style={{ fontSize: '14px', color: '#856404', marginBottom: '5px' }}>Delivered Items</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>{normalDeliveredProducts.length}</div>
                        </div>
                        <div style={{ flex: 1, padding: '15px', backgroundColor: '#f8d7da', borderRadius: '8px', border: '1px solid #dc3545' }}>
                            <div style={{ fontSize: '14px', color: '#721c24', marginBottom: '5px' }}>Pending Items</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>
                                {normalFilteredDeliverDetails.filter(item => {
                                    const productId = parseInt(item.product_id);
                                    return !normalDeliveredProducts.some(deliveredId => 
                                        parseInt(deliveredId) === productId || 
                                        String(deliveredId) === String(productId) ||
                                        parseInt(deliveredId) === parseInt(item.product_id)
                                    );
                                }).length}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '14px', color: '#495057' }}>
                            <strong>Select products to deliver:</strong> {normalSelectedProductsForDelivery.length} selected
                        </div>
                        <button
                            onClick={handleSelectAllProductsForDelivery}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: (() => {
                                    const pendingProducts = normalFilteredDeliverDetails.filter(item => {
                                        const productId = parseInt(item.product_id);
                                        return !normalDeliveredProducts.some(deliveredId => 
                                            parseInt(deliveredId) === productId || 
                                            String(deliveredId) === String(productId) ||
                                            parseInt(deliveredId) === parseInt(item.product_id)
                                        );
                                    });
                                    return normalSelectedProductsForDelivery.length === pendingProducts.length ? '#dc3545' : '#007bff';
                                })(),
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}
                        >
                            {(() => {
                                const pendingProducts = normalFilteredDeliverDetails.filter(item => {
                                    const productId = parseInt(item.product_id);
                                    return !normalDeliveredProducts.some(deliveredId => 
                                        parseInt(deliveredId) === productId || 
                                        String(deliveredId) === String(productId) ||
                                        parseInt(deliveredId) === parseInt(item.product_id)
                                    );
                                });
                                return normalSelectedProductsForDelivery.length === pendingProducts.length ? 'Deselect All' : 'Select All Pending';
                            })()}
                        </button>
                    </div>

                    <div style={{ border: '1px solid #ddd', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '500px' }}>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1 }}>
                                    <tr>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'center', width: '5%' }}>
                                            <input
                                                type="checkbox"
                                                checked={(() => {
                                                    const pendingProducts = normalFilteredDeliverDetails.filter(item => {
                                                        const productId = parseInt(item.product_id);
                                                        return !normalDeliveredProducts.some(deliveredId => 
                                                            parseInt(deliveredId) === productId || 
                                                            String(deliveredId) === String(productId) ||
                                                            parseInt(deliveredId) === parseInt(item.product_id)
                                                        );
                                                    });
                                                    return pendingProducts.length > 0 && 
                                                           normalSelectedProductsForDelivery.length === pendingProducts.length;
                                                })()}
                                                onChange={handleSelectAllProductsForDelivery}
                                                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                            />
                                        </th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left', width: '20%' }}>Product Code</th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left', width: '45%' }}>Product Description</th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'center', width: '15%' }}>Quantity</th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'center', width: '15%' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody  >
                                    {normalCurrentItemsDetails.length > 0 ? (
                                        normalCurrentItemsDetails.map((p, i) => {
                                            const productId = parseInt(p.product_id);
                                            // Check if product is delivered - compare both as integers and strings
                                            const isDelivered = normalDeliveredProducts.some(deliveredId => 
                                                parseInt(deliveredId) === productId || 
                                                String(deliveredId) === String(productId) ||
                                                parseInt(deliveredId) === parseInt(p.product_id)
                                            );
                                            const isSelected = normalSelectedProductsForDelivery.some(selectedId =>
                                                parseInt(selectedId) === productId ||
                                                String(selectedId) === String(productId)
                                            );
                                            
                                            return (
                                                <tr 
                                                    key={i} 
                                                    style={{ 
                                                        borderBottom: '1px solid #eee',
                                                        backgroundColor: isDelivered ? '#d4edda' : (isSelected ? '#e7f3ff' : 'white'),
                                                        cursor: !isDelivered ? 'pointer' : 'default'
                                                    }}
                                                    onClick={() => {
                                                        if (!isDelivered) {
                                                            handleProductSelectionForDelivery(productId);
                                                        }
                                                    }}
                                                >
                                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                                        {!isDelivered ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    handleProductSelectionForDelivery(productId);
                                                                }}
                                                                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                                            />
                                                        ) : (
                                                            <span style={{ color: '#28a745', fontSize: '18px' }}>✓</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '12px', fontWeight: '500' }}>{p.product_name}</td>
                                                    <td style={{ padding: '12px' }}>{p.description}</td>
                                                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500', fontSize: '16px' }}>{p.qty}</td>
                                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                                        <span style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '12px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            backgroundColor: isDelivered ? '#d4edda' : '#fff3cd',
                                                            color: isDelivered ? '#155724' : '#856404',
                                                            border: `1px solid ${isDelivered ? '#28a745' : '#ffc107'}`
                                                        }}>
                                                            {isDelivered ? '✓ Delivered' : '⏳ Pending'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: "center", padding: "30px", fontStyle: "italic", color: '#666' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
                                                <div style={{ fontSize: '16px' }}>No delivery details found</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div style={{
                            borderTop: '1px solid #ddd',
                            backgroundColor: '#f8f9fa',
                            minHeight: '60px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {normalTotalPagesDetails > 1 ? (
                                <CustomPagination
                                    currentPage={normalCurrentPageDetails}
                                    totalPages={normalTotalPagesDetails}
                                    onPageChange={(page) => setNormalCurrentPageDetails(page)}
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
                        setNormalDeliveriesDataVisible(true);
                        setNormalSelectedProductsForDelivery([]);
                        setSelectedNormalDriverOption('');
                        setNormalTransferDriver('');
                    }}>
                        Close
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => { 
                            if (normalSelectedProductsForDelivery.length === 0) {
                                showAlertError({
                                    icon: "warning",
                                    title: "No Products Selected!",
                                    text: "Please select at least one product to deliver.",
                                    button: 'Okay'
                                });
                                return;
                            }
                            setNormalAppointDriverVisible(false); 
                            setNormalTransferDriver(''); 
                            setSelectedNormalDriverOption('');
                        }}
                        disabled={(() => {
                            const pendingProducts = normalFilteredDeliverDetails.filter(item => {
                                const productId = parseInt(item.product_id);
                                return !normalDeliveredProducts.some(deliveredId => 
                                    parseInt(deliveredId) === productId || 
                                    String(deliveredId) === String(productId) ||
                                    parseInt(deliveredId) === parseInt(item.product_id)
                                );
                            });
                            return pendingProducts.length === 0;
                        })()}
                    >
                        Deliver Selected ({normalSelectedProductsForDelivery.length})
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Normal Stock Request - Appoint Driver Modal */}
            <Modal
                show={!normalAppointDriverVisible}
                onHide={() => {
                    setNormalAppointDriverVisible(true);
                    setNormalTransferDriver('');
                    setSelectedNormalDriverOption('');
                }}
                size='md'
                centered
            >
                <Modal.Header closeButton style={{ borderBottom: '2px solid #dee2e6' }}>
                    <Modal.Title style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c3e50' }}>
                        Enter The Driver Name
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '1rem', fontWeight: '500', color: '#34495e', marginBottom: '8px', display: 'block' }}>
                                Choose Driver <span style={{ color: '#dc3545' }}>*</span>
                            </label>
                            <select
                                value={selectedNormalDriverOption}
                                onChange={handleNormalDriverSelect}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    color: '#34495e'
                                }}
                            >
                                <option value="">Select driver</option>
                                {driverList.map((driver) => (
                                    <option key={driver.driver_id} value={driver.driver_id}>
                                        {formatDriverName(driver)}{driver.contact_number ? ` - ${driver.contact_number}` : ''}
                                    </option>
                                ))}
                                <option value="other">Other (Enter manually)</option>
                            </select>
                        </div>
                        {selectedNormalDriver && selectedNormalDriver.contact_number && (
                            <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                                Contact: {selectedNormalDriver.contact_number}
                            </div>
                        )}
                        <div>
                            <label style={{ fontSize: '1rem', fontWeight: '500', color: '#34495e', marginBottom: '8px', display: 'block' }}>
                                Driver Name <span style={{ color: '#dc3545' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={normalTransferDriver}
                                onChange={(e) => setNormalTransferDriver(e.target.value)}
                                placeholder={selectedNormalDriverOption === 'other' ? 'Enter driver name' : 'Select a driver from the list'}
                                disabled={selectedNormalDriverOption !== 'other'}
                                style={{
                                    padding: '10px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    color: '#34495e',
                                    width: '100%',
                                    backgroundColor: selectedNormalDriverOption !== 'other' ? '#f8f9fa' : 'white'
                                }}
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '1px solid #dee2e6', padding: '15px' }}>
                    <Button
                        variant="outline-secondary"
                        onClick={() => {
                            setNormalAppointDriverVisible(true);
                            setNormalTransferDriver('');
                            setSelectedNormalDriverOption('');
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={DeliverNormalStock}
                        disabled={!normalTransferDriver || normalTransferDriver.trim().length === 0}
                        style={{
                            backgroundColor: normalTransferDriver && normalTransferDriver.trim().length > 0 ? '#2563eb' : '#6c757d',
                            border: 'none',
                            opacity: normalTransferDriver && normalTransferDriver.trim().length > 0 ? 1 : 0.6
                        }}
                    >
                        Confirm Appointment
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Customize Request - Delivery Details Modal */}
            <Modal show={!customizeDeliveriesDataVisible} onHide={() => setCustomizeDeliveriesDataVisible(true)} size='xl'>
                <Modal.Header closeButton>
                    <Modal.Title>Request Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>

                    <div className="r-details-head">
                        <div className='r-d-div'>
                            <div><strong>CUSTOMIZE REQUEST ID:</strong> {customizeRIDMaker}</div>
                            <div><strong>REQUEST DATE:</strong> {customizeRequestDate}</div>
                        </div>
                        <div><strong>REQUEST FROM:</strong> {customizeRequestFrom}</div>
                        <div><strong>REQUEST TO:</strong> {customizeRequestTo}</div>
                        <div><strong>REQUEST BY:</strong> {customizeRequestBy}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: customizeRequestStatus === "Pending" ? "red"
                                    : customizeRequestStatus === "Delivered" ? "green"
                                        : customizeRequestStatus === "On Going" ? "orange"
                                            : customizeRequestStatus === "On Delivery" ? "goldenrod"
                                                : customizeRequestStatus === "Complete" ? "blue"
                                                    : "black",
                                fontWeight: 'bold'
                            }}>
                                {customizeRequestStatus} | {customizeDateAndTime}
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
                                        description: item.description || 'No description',
                                        additionalDescription: item.modifications || 'No modifications specified',
                                        qty: item.qty
                                    })),
                                    ...(currentFullDetails || []).map(item => ({
                                        type: 'Full-Customized',
                                        baseProductId: null,
                                        description: item.description || 'N/A',
                                        additionalDescription: item.additional_description || 'N/A',
                                        qty: item.qty
                                    }))
                                ];

                                // Calculate pagination for combined items
                                const startIndex = (currentSemiPage - 1) * ITEMS_PER_DETAILS_PAGE;
                                const paginatedItems = allCustomizeItems.slice(startIndex, startIndex + ITEMS_PER_DETAILS_PAGE);

                                return allCustomizeItems.length > 0 ? (
                                    <table className='table table-bordered' style={{ marginBottom: 0 }}>
                                        <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1 }}>
                                            <tr>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd', width: '15%' }}>Type</th>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd', width: '15%' }}>Base Product Code</th>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd', width: '35%' }}>Description</th>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd', width: '25%' }}>Additional Description</th>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd', width: '10%', textAlign: 'center' }}>Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedItems.map((item, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '12px' }}>
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
                                                    <td style={{ padding: '12px', fontWeight: '500' }}>{item.baseProductId || 'N/A'}</td>
                                                    <td style={{ padding: '12px' }}>{item.description}</td>
                                                    <td style={{ padding: '12px' }}>{item.additionalDescription || 'N/A'}</td>
                                                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500', fontSize: '16px' }}>{item.qty || 0}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{ textAlign: "center", padding: "30px", fontStyle: "italic", color: '#666' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
                                        <div style={{ fontSize: '16px' }}>No delivery items found</div>
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
                                const totalPagesCustomize = Math.ceil(allCustomizeItems.length / ITEMS_PER_DETAILS_PAGE);

                                return totalPagesCustomize > 1 ? (
                                    <CustomPagination
                                        currentPage={currentSemiPage}
                                        totalPages={totalPagesCustomize}
                                        onPageChange={(page) => setCurrentSemiPage(page)}
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
                    <Button variant="secondary" onClick={() => setCustomizeDeliveriesDataVisible(true)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => { setCustomizeAppointDriverVisible(false); setCustomizeTransferDriverName(''); setSelectedCustomizeDriverOption(''); }}>
                        Deliver The Stock
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Customize Request - Appoint Driver Modal */}
            <Modal
                show={!customizeAppointDriverVisible}
                onHide={() => {
                    setCustomizeAppointDriverVisible(true);
                    setCustomizeTransferDriverName('');
                    setSelectedCustomizeDriverOption('');
                }}
                size='md'
                centered
            >
                <Modal.Header closeButton style={{ borderBottom: '2px solid #dee2e6' }}>
                    <Modal.Title style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c3e50' }}>
                        Enter The Driver Name
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '1rem', fontWeight: '500', color: '#34495e' }}>
                                Choose Driver
                            </label>
                            <select
                                value={selectedCustomizeDriverOption}
                                onChange={handleCustomizeDriverSelect}
                                style={{
                                    padding: '10px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    color: '#34495e',
                                    width: '100%'
                                }}
                            >
                                <option value="">Select driver</option>
                                {driverList.map(driver => (
                                    <option key={driver.driver_id} value={driver.driver_id}>
                                        {formatDriverName(driver)}{driver.contact_number ? ` - ${driver.contact_number}` : ''}
                                    </option>
                                ))}
                                <option value="other">Other (Enter manually)</option>
                            </select>
                        </div>
                        {selectedCustomizeDriver && selectedCustomizeDriver.contact_number && (
                            <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                                Contact: {selectedCustomizeDriver.contact_number}
                            </div>
                        )}
                        <div>
                            <label style={{ fontSize: '1rem', fontWeight: '500', color: '#34495e' }}>
                                Driver Name
                            </label>
                            <input
                                type="text"
                                value={customizeTransferDriverName}
                                onChange={(e) => setCustomizeTransferDriverName(e.target.value)}
                                placeholder={selectedCustomizeDriverOption === 'other' ? 'Enter driver name' : 'Select a driver from the list'}
                                disabled={selectedCustomizeDriverOption !== 'other'}
                                style={{
                                    padding: '10px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    color: '#34495e',
                                    width: '100%',
                                    backgroundColor: selectedCustomizeDriverOption !== 'other' ? '#f8f9fa' : 'white'
                                }}
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '1px solid #dee2e6', padding: '15px' }}>
                    <Button
                        variant="outline-secondary"
                        onClick={() => {
                            setCustomizeAppointDriverVisible(true);
                            setCustomizeTransferDriverName('');
                            setSelectedCustomizeDriverOption('');
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={DeliverCustomizeStock}
                        disabled={!customizeTransferDriverName || customizeTransferDriverName.trim().length === 0}
                        style={{
                            backgroundColor: customizeTransferDriverName && customizeTransferDriverName.trim().length > 0 ? '#2563eb' : '#6c757d',
                            border: 'none',
                            opacity: customizeTransferDriverName && customizeTransferDriverName.trim().length > 0 ? 1 : 0.6
                        }}
                    >
                        Confirm Appointment
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Main Content */}
            <div className='dash-main' style={{ overflow: 'auto' }}>
                <div style={{ marginBottom: '20px' }}>
                    <h1>REQUEST MANAGEMENT</h1>
                </div>

                {/* Tabs */}
                <div style={{ marginBottom: '20px', borderBottom: '2px solid #e9ecef' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                            onClick={() => setActiveTab('normal')}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                borderBottom: activeTab === 'normal' ? '3px solid #667eea' : '3px solid transparent',
                                backgroundColor: activeTab === 'normal' ? '#f8f9fa' : 'transparent',
                                color: activeTab === 'normal' ? '#667eea' : '#6c757d',
                                fontWeight: activeTab === 'normal' ? '600' : '500',
                                cursor: 'pointer',
                                fontSize: '15px',
                                transition: 'all 0.3s'
                            }}
                        >
                            Normal Stock Requests
                        </button>
                        <button
                            onClick={() => setActiveTab('customize')}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                borderBottom: activeTab === 'customize' ? '3px solid #667eea' : '3px solid transparent',
                                backgroundColor: activeTab === 'customize' ? '#f8f9fa' : 'transparent',
                                color: activeTab === 'customize' ? '#667eea' : '#6c757d',
                                fontWeight: activeTab === 'customize' ? '600' : '500',
                                cursor: 'pointer',
                                fontSize: '15px',
                                transition: 'all 0.3s'
                            }}
                        >
                            Customize Requests
                        </button>
                    </div>
                </div>

                {/* Normal Stock Request Content */}
                {activeTab === 'normal' && (
                    <>
                        {/* Filters */}
                        <div style={{
                            padding: '15px',
                            backgroundColor: '#ffffff',
                            borderRadius: '8px',
                            margin: '10px 0',
                            border: '1px solid #e9ecef',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '15px',
                                alignItems: 'end'
                            }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                        Filter by Request From
                                    </label>
                                    <select
                                        value={normalRequestFromFilter}
                                        onChange={(e) => setNormalRequestFromFilter(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ced4da',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="">All Locations</option>
                                        {getUniqueNormalLocations().map((location, index) => (
                                            <option key={index} value={location}>{location}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                        Filter by Request By
                                    </label>
                                    <select
                                        value={normalRequestByFilter}
                                        onChange={(e) => setNormalRequestByFilter(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ced4da',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="">All Users</option>
                                        {getUniqueNormalUsers().map((user, index) => (
                                            <option key={index} value={user}>{user}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                        Search Requests
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={normalSearchFilter}
                                            onChange={(e) => setNormalSearchFilter(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px 8px 35px',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        />
                                        {normalSearchFilter && (
                                            <button
                                                type="button"
                                                onClick={() => setNormalSearchFilter('')}
                                                style={{
                                                    position: 'absolute',
                                                    right: '8px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#6c757d',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    fontSize: '18px'
                                                }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
                        <div style={{
                            padding: '10px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '6px',
                            margin: '10px 0',
                            fontSize: '14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <strong>Filters:</strong>
                                {normalRequestFromFilter && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '3px 8px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }}>
                                        {normalRequestFromFilter}
                                        <button onClick={() => setNormalRequestFromFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '16px' }}>×</button>
                                    </span>
                                )}
                                {normalRequestByFilter && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '3px 8px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }}>
                                        {normalRequestByFilter}
                                        <button onClick={() => setNormalRequestByFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '16px' }}>×</button>
                                    </span>
                                )}
                                {!normalRequestFromFilter && !normalRequestByFilter && !normalSearchFilter && (
                                    <span style={{ color: '#6c757d' }}>None</span>
                                )}
                                <span style={{ marginLeft: '6px', color: '#6c757d', fontSize: '12px' }}>
                                    ({normalFilteredData.length} of {normalRequestList.length})
                                </span>
                            </div>
                            <button onClick={() => {
                                setNormalRequestFromFilter('');
                                setNormalRequestByFilter('');
                                setNormalSearchFilter('');
                                setNormalCurrentPage(1);
                            }} style={{
                                padding: "6px 12px",
                                backgroundColor: "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px"
                            }}>
                                Clear All
                            </button>
                        </div>

                        {/* Request Cards Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '20px',
                            padding: '10px 0',
                            minHeight: '600px',
                            alignContent: 'start'
                        }}>
                            {normalCurrentItems.length > 0 ? (
                                normalCurrentItems.map((request, i) => {
                                    const statusColors = getStatusColor(request.request_status);
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                setNormalDeliveriesDataVisible(false);
                                                setNormalDeclinedProducts([]); // Reset declined products
                                                setNormalSelectedProductsForDelivery([]); // Reset selection when opening modal
                                                GetNormalDeliveriesData(request.request_stock_id);
                                                GetNormalDeliveriesDetails(request.request_stock_id);
                                                setNormalRID(request.request_stock_id); // Keep for API calls
                                                setNormalRIDMaker(request.id_maker || request.request_stock_id); // Store for display
                                            }}
                                            style={{
                                                backgroundColor: '#ffffff',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                                border: '1px solid #e9ecef',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.15)';
                                                e.currentTarget.style.borderColor = '#667eea';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                                e.currentTarget.style.borderColor = '#e9ecef';
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '4px',
                                                background: `linear-gradient(90deg, ${statusColors.border} 0%, ${statusColors.text} 100%)`
                                            }}></div>

                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginBottom: '15px'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px'
                                                }}>
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '10px',
                                                        background: `linear-gradient(135deg, ${statusColors.border} 0%, ${statusColors.text} 100%)`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '24px',
                                                        flexShrink: 0
                                                    }}>
                                                        📋
                                                    </div>
                                                    <div>
                                                        <div style={{
                                                            fontSize: '11px',
                                                            color: '#6c757d',
                                                            marginBottom: '2px',
                                                            fontWeight: '500',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            Request ID
                                                        </div>
                                                        <div style={{
                                                            fontSize: '18px',
                                                            fontWeight: '700',
                                                            color: '#2c3e50'
                                                        }}>
                                                            #{request.id_maker || request.request_stock_id}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    backgroundColor: statusColors.bg,
                                                    color: statusColors.text,
                                                    border: `2px solid ${statusColors.border}`,
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {request.request_status}
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '15px' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '10px',
                                                    marginBottom: '12px',
                                                    padding: '10px',
                                                    backgroundColor: '#f8f9fa',
                                                    borderRadius: '8px'
                                                }}>
                                                    <div style={{
                                                        color: '#667eea',
                                                        marginTop: '2px',
                                                        flexShrink: 0
                                                    }}>
                                                        📍
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            fontSize: '11px',
                                                            color: '#6c757d',
                                                            marginBottom: '3px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            Request From
                                                        </div>
                                                        <div style={{
                                                            fontSize: '15px',
                                                            color: '#2c3e50',
                                                            fontWeight: '600',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {request.reqFrom}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '10px',
                                                    padding: '10px',
                                                    backgroundColor: '#f8f9fa',
                                                    borderRadius: '8px'
                                                }}>
                                                    <div style={{
                                                        color: '#667eea',
                                                        marginTop: '2px',
                                                        flexShrink: 0
                                                    }}>
                                                        👤
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            fontSize: '11px',
                                                            color: '#6c757d',
                                                            marginBottom: '3px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            Requested By
                                                        </div>
                                                        <div style={{
                                                            fontSize: '15px',
                                                            color: '#2c3e50',
                                                            fontWeight: '600',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {`${request.fname || ''} ${request.mname || ''} ${request.lname || ''}`.trim() || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                paddingTop: '15px',
                                                borderTop: '1px solid #e9ecef'
                                            }}>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: '#6c757d',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    📅 Click to view details
                                                </div>

                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    border: '2px solid #667eea',
                                                    backgroundColor: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#667eea',
                                                    fontSize: '16px',
                                                    transition: 'all 0.2s'
                                                }}>
                                                    →
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{
                                    gridColumn: '1 / -1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '400px',
                                    textAlign: 'center',
                                    color: '#6c757d',
                                    padding: '40px 20px'
                                }}>
                                    <div style={{
                                        fontSize: '64px',
                                        marginBottom: '20px',
                                        opacity: 0.3
                                    }}>
                                        📋
                                    </div>
                                    <h4 style={{
                                        color: '#495057',
                                        marginBottom: '10px',
                                        fontWeight: '500'
                                    }}>
                                        {normalRequestList.length === 0 ? 'No requests found' : 'No requests match the current filters'}
                                    </h4>
                                    <p style={{
                                        margin: '0',
                                        fontSize: '14px',
                                        maxWidth: '300px',
                                        lineHeight: '1.4'
                                    }}>
                                        {normalRequestList.length === 0
                                            ? 'No ongoing requests at the moment. New requests will appear here when available.'
                                            : 'Try adjusting your filters to see more results.'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination - Fixed Position */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: '30px',
                            paddingBottom: '20px',
                            minHeight: '60px'
                        }}>
                            {normalTotalPages > 1 ? (
                                <CustomPagination
                                    currentPage={normalCurrentPage}
                                    totalPages={normalTotalPages}
                                    onPageChange={(page) => setNormalCurrentPage(page)}
                                    color="green"
                                />
                            ) : (
                                <div style={{ height: '40px' }}></div>
                            )}
                        </div>
                    </>
                )}

                {/* Customize Request Content */}
                {activeTab === 'customize' && (
                    <>
                        {/* Filters */}
                        <div style={{
                            padding: '15px',
                            backgroundColor: '#ffffff',
                            borderRadius: '8px',
                            margin: '10px 0',
                            border: '1px solid #e9ecef',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '15px',
                                alignItems: 'end'
                            }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                        Filter by Request From
                                    </label>
                                    <select
                                        value={customizeRequestFromFilter}
                                        onChange={(e) => setCustomizeRequestFromFilter(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ced4da',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="">All Locations</option>
                                        {getUniqueCustomizeLocations().map((location, index) => (
                                            <option key={index} value={location}>{location}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                        Filter by Request By
                                    </label>
                                    <select
                                        value={customizeRequestByFilter}
                                        onChange={(e) => setCustomizeRequestByFilter(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ced4da',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="">All Users</option>
                                        {getUniqueCustomizeUsers().map((user, index) => (
                                            <option key={index} value={user}>{user}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                        Search Requests
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={customizeSearchFilter}
                                            onChange={(e) => setCustomizeSearchFilter(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px 8px 35px',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        />
                                        {customizeSearchFilter && (
                                            <button
                                                type="button"
                                                onClick={() => setCustomizeSearchFilter('')}
                                                style={{
                                                    position: 'absolute',
                                                    right: '8px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#6c757d',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    fontSize: '18px'
                                                }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
                        <div style={{
                            padding: '10px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '6px',
                            margin: '10px 0',
                            fontSize: '14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <strong>Filters:</strong>
                                {customizeRequestFromFilter && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '3px 8px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }}>
                                        {customizeRequestFromFilter}
                                        <button onClick={() => setCustomizeRequestFromFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '16px' }}>×</button>
                                    </span>
                                )}
                                {customizeRequestByFilter && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '3px 8px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }}>
                                        {customizeRequestByFilter}
                                        <button onClick={() => setCustomizeRequestByFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '16px' }}>×</button>
                                    </span>
                                )}
                                {!customizeRequestFromFilter && !customizeRequestByFilter && !customizeSearchFilter && (
                                    <span style={{ color: '#6c757d' }}>None</span>
                                )}
                                <span style={{ marginLeft: '6px', color: '#6c757d', fontSize: '12px' }}>
                                    ({customizeFilteredData.length} of {customizeRequestList.filter(item => item.status === 'On Going').length} on-going)
                                </span>
                            </div>
                            <button onClick={() => {
                                setCustomizeRequestFromFilter('');
                                setCustomizeRequestByFilter('');
                                setCustomizeSearchFilter('');
                                setCustomizeCurrentCardsPage(1);
                            }} style={{
                                padding: "6px 12px",
                                backgroundColor: "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px"
                            }}>
                                Clear All
                            </button>
                        </div>

                        {/* Request Cards Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '20px',
                            padding: '10px 0',
                            minHeight: '600px',
                            alignContent: 'start'
                        }}>
                            {customizeCurrentCardsItems.length > 0 ? (
                                customizeCurrentCardsItems.map((request, i) => {
                                    const statusColors = getStatusColor(request.status);
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                setCustomizeDeliveriesDataVisible(false);
                                                GetCustomizeDeliveriesData(request);
                                                setCustomizeRID(request.customize_req_id);
                                            }}
                                            style={{
                                                backgroundColor: '#ffffff',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                                border: '1px solid #e9ecef',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.15)';
                                                e.currentTarget.style.borderColor = '#667eea';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                                e.currentTarget.style.borderColor = '#e9ecef';
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '4px',
                                                background: `linear-gradient(90deg, ${statusColors.border} 0%, ${statusColors.text} 100%)`
                                            }}></div>

                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginBottom: '15px'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px'
                                                }}>
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '10px',
                                                        background: `linear-gradient(135deg, ${statusColors.border} 0%, ${statusColors.text} 100%)`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '24px',
                                                        flexShrink: 0
                                                    }}>
                                                        📋
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            fontSize: '11px',
                                                            color: '#6c757d',
                                                            marginBottom: '2px',
                                                            fontWeight: '500',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            Request ID
                                                        </div>
                                                        <div style={{
                                                            fontSize: '18px',
                                                            fontWeight: '700',
                                                            color: '#2c3e50',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            #{request.id_maker}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    backgroundColor: statusColors.bg,
                                                    color: statusColors.text,
                                                    border: `2px solid ${statusColors.border}`,
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {request.status}
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '15px' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '10px',
                                                    marginBottom: '12px',
                                                    padding: '10px',
                                                    backgroundColor: '#f8f9fa',
                                                    borderRadius: '8px'
                                                }}>
                                                    <div style={{
                                                        color: '#667eea',
                                                        marginTop: '2px',
                                                        flexShrink: 0
                                                    }}>
                                                        📍
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            fontSize: '11px',
                                                            color: '#6c757d',
                                                            marginBottom: '3px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            Request From
                                                        </div>
                                                        <div style={{
                                                            fontSize: '15px',
                                                            color: '#2c3e50',
                                                            fontWeight: '600',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {request.reqFrom}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '10px',
                                                    padding: '10px',
                                                    backgroundColor: '#f8f9fa',
                                                    borderRadius: '8px'
                                                }}>
                                                    <div style={{
                                                        color: '#667eea',
                                                        marginTop: '2px',
                                                        flexShrink: 0
                                                    }}>
                                                        👤
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            fontSize: '11px',
                                                            color: '#6c757d',
                                                            marginBottom: '3px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            Requested By
                                                        </div>
                                                        <div style={{
                                                            fontSize: '15px',
                                                            color: '#2c3e50',
                                                            fontWeight: '600',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {`${request.fname || ''} ${request.mname || ''} ${request.lname || ''}`.trim() || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                paddingTop: '15px',
                                                borderTop: '1px solid #e9ecef'
                                            }}>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: '#6c757d',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    📅 Click to view details
                                                </div>

                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    border: '2px solid #667eea',
                                                    backgroundColor: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#667eea',
                                                    fontSize: '16px',
                                                    transition: 'all 0.2s'
                                                }}>
                                                    →
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{
                                    gridColumn: '1 / -1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '400px',
                                    textAlign: 'center',
                                    color: '#6c757d',
                                    padding: '40px 20px'
                                }}>
                                    <div style={{
                                        fontSize: '64px',
                                        marginBottom: '20px',
                                        opacity: 0.3
                                    }}>
                                        📋
                                    </div>
                                    <h4 style={{
                                        color: '#495057',
                                        marginBottom: '10px',
                                        fontWeight: '500'
                                    }}>
                                        {customizeRequestList.filter(item => item.status === 'On Going').length === 0 ? 'No on-going requests found' : 'No requests match the current filters'}
                                    </h4>
                                    <p style={{
                                        margin: '0',
                                        fontSize: '14px',
                                        maxWidth: '300px',
                                        lineHeight: '1.4'
                                    }}>
                                        {customizeRequestList.filter(item => item.status === 'On Going').length === 0
                                            ? 'No on-going requests at the moment. New requests will appear here when they are in progress.'
                                            : 'Try adjusting your filters to see more results.'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination - Fixed Position */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: '30px',
                            paddingBottom: '20px',
                            minHeight: '60px'
                        }}>
                            {customizeTotalCardsPages > 1 ? (
                                <CustomPagination
                                    currentPage={customizeCurrentCardsPage}
                                    totalPages={customizeTotalCardsPages}
                                    onPageChange={(page) => setCustomizeCurrentCardsPage(page)}
                                    color="green"
                                />
                            ) : (
                                <div style={{ height: '40px' }}></div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default UnifiedRequestManagement;