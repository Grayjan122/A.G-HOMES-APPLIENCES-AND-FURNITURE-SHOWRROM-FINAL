'use client';
import { useState, useEffect, useRef } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import { Col, Row, Container } from 'react-bootstrap';
import CustomPagination from '@/app/Components/Pagination/pagination';
import InputGroup from 'react-bootstrap/InputGroup';
import 'sweetalert2/dist/sweetalert2.all';
import Swal from 'sweetalert2';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const ITEMS_PER_PAGE_REQQUEST = 10;
const ITEMS_PER_PAGE_PRODUCT = 5;

const RequestStockIM = () => {
    // Responsive state
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    // User state
    const [user_id, setUser_id] = useState('');

    // Modal visibility states
    const [searchedProdkVisible, setSearchedVisible] = useState(true);
    const [reqStockOutVisible, setReqStockOutVisible] = useState(true);
    const [trackRequestVisible, setTrackRequestVisible] = useState(true);
    const [viewRequestVisibl, setViewRequestVisible] = useState(true);
    const [trackRequestDetailsVsible, setTrackRequestDetailsVisible] = useState(true);
    const [receiveStockDetailsVsible, setReceiveStockDetailsVisible] = useState(true);
    const [stockReceiveVisible, setStockReceiveVisible] = useState(true);
    const [continueSendReq, setContinueSendReq] = useState(true);
    const [searchProdVisible, setSearchProdVisible] = useState(true);
    const [confirmClearSelected, setConfirmClearSelected] = useState(true);

    // Data arrays
    const [productList, setProductList] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const [stockInList, setStockInList] = useState([]);
    const [searcList, setSearchList] = useState([]);
    const [stockOutList, setStockOutList] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [myRequestList, setMyRequestList] = useState([]);
    const [myRequestDetails, setMyRequestDetails] = useState([]);
    const [deliverdList, setDeliverdList] = useState([]);
    const [deliverDetails, setDeliverDetails] = useState([]);
    const [unavailDetails, setUnavailDetails] = useState([]);
    const [currentStoreInventory, setCurrentStoreInventory] = useState([]);

    // Input states
    const [prodName, setProdName] = useState('');
    const [prodQty, setProdQty] = useState(1);
    const [selectedProdName, setSelectedProdName] = useState('');
    const [searchProd, setSearchProd] = useState('');
    const [storeReq, setStoreReq] = useState('');
    const [statusReq, setStatusReq] = useState('');
    const [requestFrom, setRequestFrom] = useState('');
    const [requestTo, setRequestTo] = useState('');
    const [rs_StoreID, setRs_StoreID] = useState('');

    // Search modal states
    const [leftSearchTerm, setLeftSearchTerm] = useState('');
    const [rightSearchTerm, setRightSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [selectedProductsForRequest, setSelectedProductsForRequest] = useState([]);
    const [currentStockInventory, setCurrentStockInventory] = useState([]);

    // Alert states
    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

    // Request details states
    const [s_reqID, setS_ReqID] = useState('');
    const [s_reqDate, setS_ReqDate] = useState('');
    const [s_reqBy, setS_ReqBy] = useState('');
    const [s_reqFrom, setS_ReqFrom] = useState('');
    const [s_reqStatus, setS_ReqStatus] = useState('');
    const [reqDateTime, setReqDateTime] = useState("");

    // Delivery states
    const [d_transferID, setD_TransferID] = useState('');
    const [d_From, setD_From] = useState('');
    const [d_deliveredBy, setD_DeliveredBy] = useState('');
    const [d_status, setD_status] = useState('');
    const [d_dtID, setD_dtID] = useState('');
    const [d_reqID, setD_ReqID] = useState('');

    // Pagination
    const [currentRequestPage, setCurrentRequestPage] = useState(1);
    const [currentRequestPage1, setCurrentRequestPage1] = useState(1);
    const [currentRequestPage2, setCurrentRequestPage2] = useState(1);
    const [leftPaginationPage, setLeftPaginationPage] = useState(1);
    const [rightPaginationPage, setRightPaginationPage] = useState(1);

    // Helper function to get current stock for a product
    const getCurrentStock = (productId) => {
        const stockItem = currentStockInventory.find(item => item.product_id === productId);
        return stockItem ? parseInt(stockItem.qty) || 0 : 0;
    };

    // Helper function to get threshold values for a product (defaults: min=1, max=2)
    const getProductThresholds = (productId) => {
        const stockItem = currentStockInventory.find(item => item.product_id === productId);
        if (!stockItem) {
            // Product doesn't exist in store - use defaults
            return { min: 1, max: 2 };
        }
        return {
            min: stockItem.min_threshold !== null && stockItem.min_threshold !== undefined 
                ? parseInt(stockItem.min_threshold) : 1,
            max: stockItem.max_threshold !== null && stockItem.max_threshold !== undefined 
                ? parseInt(stockItem.max_threshold) : 2
        };
    };

    // Helper function to check if product is below min threshold
    const isBelowMinThreshold = (productId) => {
        const currentStock = getCurrentStock(productId);
        const thresholds = getProductThresholds(productId);
        return currentStock < thresholds.min;
    };

    // Helper function to check if product is low stock (between min and max)
    const isLowStock = (productId) => {
        const currentStock = getCurrentStock(productId);
        const thresholds = getProductThresholds(productId);
        return currentStock >= thresholds.min && currentStock < thresholds.max;
    };

    // Helper function to get stock priority (1 = highest priority)
    const getStockPriority = (productId) => {
        const currentStock = getCurrentStock(productId);
        const thresholds = getProductThresholds(productId);
        
        if (currentStock === 0) return 1; // Out of stock - highest priority
        if (currentStock < thresholds.min) return 2; // Below minimum
        if (currentStock >= thresholds.min && currentStock < thresholds.max) return 3; // Low stock
        return 4; // Well stocked
    };

    // Helper functions for empty state messages
    const getEmptyStateTitle = () => {
        if (filterType === 'noStock') {
            return leftSearchTerm.trim() ? 'No Out-of-Stock Products Found' : 'No Out-of-Stock Products';
        } else if (filterType === 'inStock') {
            return leftSearchTerm.trim() ? 'No In-Stock Products Found' : 'No Products In Stock';
        } else if (filterType === 'lowStock') {
            return leftSearchTerm.trim() ? 'No Low Stock Products Found' : 'No Low Stock Products';
        } else {
            return leftSearchTerm.trim() ? 'No Products Found' : 'No Products Available';
        }
    };

    const getEmptyStateMessage = () => {
        if (filterType === 'noStock') {
            if (leftSearchTerm.trim()) {
                return `No out-of-stock products match your search "${leftSearchTerm}". Try adjusting your search terms.`;
            } else {
                return 'All products currently have stock available. This is great news for inventory management!';
            }
        } else if (filterType === 'inStock') {
            if (leftSearchTerm.trim()) {
                return `No in-stock products match your search "${leftSearchTerm}". Try adjusting your search terms.`;
            } else {
                return 'No products currently have stock available. Consider restocking or check with your supplier.';
            }
        } else if (filterType === 'lowStock') {
            if (leftSearchTerm.trim()) {
                return `No low stock products match your search "${leftSearchTerm}". Try adjusting your search terms.`;
            } else {
                return 'No products are currently in low stock (between min and max thresholds). All products are either out of stock, below minimum, or well stocked.';
            }
        } else {
            if (leftSearchTerm.trim()) {
                return `No products match your search "${leftSearchTerm}". Try using different search terms.`;
            } else {
                return 'No products are available in the system. Add products to get started.';
            }
        }
    };

    // Search modal helper functions
    const getFilteredProducts = () => {
        let filteredList = [];

        // Apply filter
        if (filterType === 'noStock') {
            if (stockOutList && stockOutList.length > 0) {
                filteredList = stockOutList;
            } else {
                filteredList = productList.filter(p => {
                    const currentStock = getCurrentStock(p.product_id);
                    return currentStock <= 0;
                });
            }
        } else if (filterType === 'inStock') {
            filteredList = productList.filter(p => {
                const currentStock = getCurrentStock(p.product_id);
                return currentStock > 0;
            });
        } else if (filterType === 'lowStock') {
            filteredList = productList.filter(p => {
                return isLowStock(p.product_id);
            });
        } else {
            filteredList = productList;
        }

        // Apply search filter
        if (leftSearchTerm.trim()) {
            filteredList = filteredList.filter(p =>
                p.product_name.toLowerCase().includes(leftSearchTerm.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(leftSearchTerm.toLowerCase()))
            );
        }

        // Sort by priority: Out of Stock > Below Min > Low Stock > Others
        filteredList.sort((a, b) => {
            const aPriority = getStockPriority(a.product_id);
            const bPriority = getStockPriority(b.product_id);
            
            // Sort by priority (lower number = higher priority)
            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }
            
            // If same priority, sort by current stock (lower stock first)
            const stockA = getCurrentStock(a.product_id);
            const stockB = getCurrentStock(b.product_id);
            return stockA - stockB;
        });

        return filteredList;
    };

    useEffect(() => {
        if (filterType === 'noStock' && requestFrom) {
            GetStockOut();
        }
        if (requestFrom) {
            GetCurrentStockInventory();
        }
    }, [filterType, requestFrom]);

    const getFilteredSelectedProducts = () => {
        if (rightSearchTerm.trim()) {
            return selectedProductsForRequest.filter(p =>
                p.product_name.toLowerCase().includes(rightSearchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(rightSearchTerm.toLowerCase())
            );
        }
        return selectedProductsForRequest;
    };

    // Pagination calculations for modal tables
    const filteredProducts = getFilteredProducts();
    const totalLeftPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE_PRODUCT);
    const startLeftIndex = (leftPaginationPage - 1) * ITEMS_PER_PAGE_PRODUCT;
    const currentLeftItems = filteredProducts.slice(startLeftIndex, startLeftIndex + ITEMS_PER_PAGE_PRODUCT);

    const filteredSelectedProducts = getFilteredSelectedProducts();
    const totalRightPages = Math.ceil(filteredSelectedProducts.length / ITEMS_PER_PAGE_PRODUCT);
    const startRightIndex = (rightPaginationPage - 1) * ITEMS_PER_PAGE_PRODUCT;
    const currentRightItems = filteredSelectedProducts.slice(startRightIndex, startRightIndex + ITEMS_PER_PAGE_PRODUCT);

    const handleProductClick = (product) => {
        const isAlreadySelected = selectedProductsForRequest.some(p => p.product_id === product.product_id);

        if (!isAlreadySelected) {
            setSelectedProductsForRequest(prev => [...prev, { ...product, requestQty: 1 }]);
        }
    };

    const handleRemoveSelectedProduct = (productId) => {
        setSelectedProductsForRequest(prev => prev.filter(p => p.product_id !== productId));
    };

    const handleAddToRequest = () => {
        if (selectedProductsForRequest.length === 0) {
            showAlertError({
                icon: "warning",
                title: "No Products Selected!",
                text: "Please select at least one product to add to request.",
                button: 'OK'
            });
            return;
        }

        // Check for items where requested quantity + current stock exceeds max threshold
        const itemsExceedingMax = selectedProductsForRequest.filter(item => {
            const currentStock = getCurrentStock(item.product_id);
            const thresholds = getProductThresholds(item.product_id);
            const requestedQty = item.requestQty || 1;
            const totalAfterRequest = currentStock + requestedQty;
            return totalAfterRequest > thresholds.max;
        });

        if (itemsExceedingMax.length > 0) {
            const maxValues = itemsExceedingMax.map(item => {
                const currentStock = getCurrentStock(item.product_id);
                const thresholds = getProductThresholds(item.product_id);
                const requestedQty = item.requestQty || 1;
                const totalAfterRequest = currentStock + requestedQty;
                return `${item.product_name} (current: ${currentStock}, requesting: ${requestedQty}, total: ${totalAfterRequest}, max: ${thresholds.max})`;
            }).join('\n');
            
            showAlertError({
                icon: "warning",
                title: "Some Items Will Exceed Maximum Threshold!",
                text: `The following products will exceed their maximum threshold after adding the requested quantity:\n\n${maxValues}\n\nStock can only cater up to the maximum threshold. You can still proceed, but the request may be adjusted.`,
                button: 'OK'
            });
        }

        // Add selected products to stockInList
        setStockInList(prev => {
            const existingIds = new Set(prev.map(item => item.product_id));
            const newItems = selectedProductsForRequest
                .filter(item => !existingIds.has(item.product_id))
                .map(item => ({
                    ...item,
                    qty: item.requestQty || 1
                }));

            if (newItems.length === 0) {
                showAlertError({
                    icon: "info",
                    title: "Products Already Added!",
                    text: "All selected products are already in your request list.",
                    button: 'OK'
                });
                return prev;
            }

            Swal.fire({
                title: "Products Added!",
                text: `${newItems.length} product(s) added to request list.`,
                icon: "success",
                draggable: true
            });

            return [...prev, ...newItems];
        });

        // Reset and close modal
        setSelectedProductsForRequest([]);
        setLeftSearchTerm('');
        setRightSearchTerm('');
        setFilterType('');
        setLeftPaginationPage(1);
        setRightPaginationPage(1);
        setSearchProdVisible(true);
    };

    const handleLeftPageChange = (page) => {
        if (page >= 1 && page <= totalLeftPages) {
            setLeftPaginationPage(page);
        }
    };

    const handleRightPageChange = (page) => {
        if (page >= 1 && page <= totalRightPages) {
            setRightPaginationPage(page);
        }
    };

    // Initialize user_id
    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
    }, []);

    // Handle window resize for responsive design
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize data
    useEffect(() => {
        GetProduct();
        GetLocation();
    }, []);

    // Reset pagination when filter or search changes
    useEffect(() => {
        setLeftPaginationPage(1);
    }, [filterType, leftSearchTerm]);

    useEffect(() => {
        setRightPaginationPage(1);
    }, [rightSearchTerm]);

    // Handle store and status changes
    useEffect(() => {
        if (storeReq) {
            MyGetRequest();
        } else if (statusReq) {
            showAlert('Choose a store first!', 'danger', '#dc7a80');
        }
    }, [storeReq, statusReq]);

    // Handle search
    useEffect(() => {
        SearchProduct();
    }, [prodName]);

    // Handle stock out list changes
    useEffect(() => {
        const allProductIds = stockOutList.map((item) => item.product_id);
        setSelectedProducts(allProductIds);
    }, [stockOutList]);

    // Handle delivery changes
    useEffect(() => {
        GetDelivered();
        GetCurrentSotreInventory();
    }, [rs_StoreID]);

    // Utility functions
    const showAlert = (msg, variant, bg) => {
        setMessage(msg);
        setAlertVariant(variant);
        setAlertBG(bg);
        setAlert1(true);
        setTimeout(() => setAlert1(false), 3000);
    };

    const show_sweet1 = () => {
        Swal.fire({
            title: "Request Sent!",
            icon: "success",
            draggable: true
        });
    };

    const clearListAlert = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to clear the list?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, clear it!"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Cleared!",
                    text: "Your list has been cleared out.",
                    icon: "success"
                });
                setStockInList([]);
            }
        });
    };

    const clearSelectedProductsAlert = () => {
        setConfirmClearSelected(false);
    };

    const handleClearSelectedProducts = () => {
        setRightPaginationPage(1);
        setSelectedProductsForRequest([]);
        setConfirmClearSelected(true);
        Swal.fire({
            title: "Cleared!",
            text: "Selected products have been cleared.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });
    };

    const error_alert = (icon1, title1, text1) => {
        Swal.fire({
            icon: icon1,
            title: title1,
            text: text1,
            confirmButtonText: "Try Again",
            confirmButtonColor: "#3085d6",
        });
    };

    const Logs = async (accID, activity) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'audit-log.php';
        const Details = { accID, activity };

        try {
            await axios.get(url, {
                params: {
                    json: JSON.stringify(Details),
                    operation: "Logs"
                }
            });
        } catch (error) {
            console.error("Error logging activity:", error);
        }
    };

    // Inline editing functions
    const updateItemQuantity = (productId, newQty) => {
        if (newQty < 1) {
            showAlertError({
                icon: "error",
                title: "Invalid Quantity!",
                text: "Quantity cannot be less than 1.",
                button: 'OK'
            });
            return;
        }

        // Check if requested quantity + current stock exceeds max threshold
        const currentStock = getCurrentStock(productId);
        const thresholds = getProductThresholds(productId);
        const totalAfterRequest = currentStock + newQty;
        
        if (totalAfterRequest > thresholds.max) {
            showAlertError({
                icon: "warning",
                title: "Exceeds Maximum Threshold!",
                text: `Current stock: ${currentStock} units. Requesting ${newQty} units will result in ${totalAfterRequest} total units, which exceeds the maximum threshold of ${thresholds.max} units.`,
                button: 'OK'
            });
            // Still allow the update, but warn the user
        }

        setStockInList(prevList =>
            prevList.map(item =>
                item.product_id === productId
                    ? { ...item, qty: parseInt(newQty) }
                    : item
            )
        );
    };

    const removeItemFromList = (productId) => {
        Swal.fire({
            title: "Remove Item?",
            text: "Are you sure you want to remove this item from the request list?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, remove it!"
        }).then((result) => {
            if (result.isConfirmed) {
                setStockInList(prevList =>
                    prevList.filter(item => item.product_id !== productId)
                );

                Swal.fire({
                    title: "Removed!",
                    text: "Item has been removed from your request list.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    // API Functions
    const GetProduct = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetProduct"
                }
            });
            setProductList(response.data);
        } catch (error) {
            console.error("Error fetching product list:", error);
        }
    };

    const SearchProduct = async () => {
        if (!prodName.trim()) {
            setSearchList([]);
            return;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';
        const searchD = { search: prodName };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(searchD),
                    operation: "SearchProduct"
                }
            });
            setSearchList(response.data || []);
        } catch (error) {
            console.error("Error fetching search list:", error);
        }
    };

    const GetLocation = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'location.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetLocation"
                }
            });
            setLocationList(response.data);
        } catch (error) {
            console.error("Error fetching location list:", error);
        }
    };

    const MyGetRequest = async () => {
        if (!storeReq) return;

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            locID: storeReq,
            status: statusReq,
            reqType: 'ReqFrom',
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequest"
                }
            });
            setMyRequestList(response.data || []);
        } catch (error) {
            console.error("Error fetching request list:", error);
        }
    };

    const GetStockOut = async () => {
        const accountID = sessionStorage.getItem('user_id');
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'inventory.php';
        const locDetails = { locID: requestFrom };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(locDetails),
                    operation: "GetStockOut"
                }
            });
            setStockOutList(response.data);
            Logs(accountID, 'Request Stock Out List');
        } catch (error) {
            console.error("Error fetching inventory stock out:", error);
        }
    };

    const GetTrackRequestDetails = async (req_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { reqID: req_id };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequestDetails"
                }
            });
            setMyRequestDetails(response.data);
        } catch (error) {
            console.error("Error fetching request details:", error);
        }
    };

    const GetTrackRequestD = async (req_id) => {
        const LocationID = 12;
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { reqID: req_id, locID: LocationID };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequestD"
                }
            });
            const data = response.data[0];
            setS_ReqBy(`${data.fname} ${data.mname} ${data.lname}`);
            setS_ReqID(data.request_stock_id);
            setS_ReqDate(data.date);
            setS_ReqFrom(data.reqFrom);
            setS_ReqStatus(data.request_status);
            GetTrackRequestTimeandDate(data.request_stock_id, data.request_status);

        } catch (error) {
            console.error("Error fetching request details:", error);
        }
    };

    const GetTrackRequestTimeandDate = async (req_id, status) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            reqID: req_id,
            status: status
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetReqDateAndTime"
                }
            });

            if (response.data && response.data.length > 0) {
                setReqDateTime(response.data[0].date + " • " + response.data[0].time);
            } else {
                return "";
            }
        } catch (error) {
            console.error("Error fetching request data:", error);
            return "";
        }
    };

    const GetDelivered = async () => {
        if (!rs_StoreID) {
            setDeliverdList([]);
            return;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        const ID = { locID: rs_StoreID };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetDelivered"
                }
            });
            setDeliverdList(response.data || []);
        } catch (error) {
            console.error("Error fetching deliveries list:", error);
        }
    };

    const GetCurrentStockInventory = async () => {
        if (!requestFrom) {
            setCurrentStockInventory([]);
            return;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'inventory.php';
        const locDetails = {
            locID: requestFrom,
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
            setCurrentStockInventory(response.data || []);
        } catch (error) {
            console.error("Error fetching current stock inventory:", error);
        }
    };

    const GetCurrentSotreInventory = async () => {
        if (!rs_StoreID) {
            setCurrentStoreInventory([]);
            return;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'inventory.php';
        const locDetails = {
            locID: rs_StoreID,
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
            setCurrentStoreInventory(response.data || []);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

    const sendSuccess = async () => {
        const accountID = sessionStorage.getItem('user_id');
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const LocDetails = {
            reqFrom: requestFrom,
            reqTo: requestTo,
            reqBy: user_id
        };

        const to1 = locationList.find(l => l.location_id == requestTo);
        const from1 = locationList.find(l => l.location_id == requestFrom);

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(LocDetails),
                    operation: "SendRequest",
                    requestList: JSON.stringify(stockInList)
                }
            });

            if (response.data === 'Success') {
                show_sweet1();
                const itemCount = stockInList.length;
                setStockInList([]);
                setRequestFrom('');
                setRequestTo('');
                Logs(accountID, `Sent a request from ${from1.location_name} to ${to1.location_name}`);
                
                // Create notification for Warehouse Representatives at the "Request To" location
                await createNotification(
                    'stock_request',
                    'New Stock Request',
                    `New stock request from ${from1.location_name} to ${to1.location_name} with ${itemCount} item(s)`,
                    requestTo,
                    'Warehouse Representative',  // Send only to Warehouse Representatives
                    null
                );
            }
        } catch (error) {
            console.error("Error sending request:", error);
        }
    };

    // Function to create notification
    const createNotification = async (type, title, message, locationId, targetRole, referenceId) => {
        const baseURL = sessionStorage.getItem('baseURL');
        if (!baseURL) {
            console.error("baseURL not found in sessionStorage");
            return;
        }

        const notificationURL = baseURL + 'notifications.php';
        const notificationData = {
            type: type,
            title: title,
            message: message,
            locationId: locationId,  // Changed from location_id to locationId (camelCase)
            targetRole: targetRole,  // Changed from target_role to targetRole (camelCase)
            referenceId: referenceId, // Changed from reference_id to referenceId (camelCase)
            productId: null,
            customerId: null
        };

        console.log('Creating notification:', notificationData);

        try {
            const response = await axios.get(notificationURL, {
                params: {
                    json: JSON.stringify(notificationData),
                    operation: "CreateNotification"
                }
            });
            console.log('Notification created successfully:', response.data);
        } catch (error) {
            console.error("Error creating notification:", error);
            console.error("Notification data:", notificationData);
        }
    };

    // Event handlers
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            const s = productList.find(product =>
                product.product_name.toLowerCase() === prodName.toLowerCase() ||
                product.product_id == prodName
            );

            if (!s) {
                alert("Product is unavailable! Please select other.");
                setSelectedProdName('');
                return;
            }

            setSelectedProdName(s.product_name);
            triggerModal('searchedProduct', s.product_id);
        }
    };

    const searchClick = (prodN) => {
        const s = productList.find(product =>
            product.product_name.toLowerCase() === prodN.toLowerCase() ||
            product.product_id == prodN
        );

        if (!s) {
            alert("Product is unavailable! Please select other.");
            setSelectedProdName('');
            return;
        }

        setSelectedProdName(s.product_name);
        triggerModal('searchedProduct', s.product_id);
        setSearchList([]);
        setProdName('');
    };

    const addInStockList = () => {
        if (prodQty < 1) {
            showAlertError({
                icon: "error",
                title: "Something Went Wrong!",
                text: "Qty can't be less than 1, Please input a valid qty!",
                button: 'Try Again'
            });
            return;
        }

        const s = productList.find(product =>
            product.product_name.toLowerCase() === selectedProdName.toLowerCase()
        );
        const incomingQty = parseInt(prodQty) || 0;

        // Check if requested quantity + current stock exceeds max threshold
        const currentStock = getCurrentStock(s.product_id);
        const thresholds = getProductThresholds(s.product_id);
        const totalAfterRequest = currentStock + incomingQty;
        
        if (totalAfterRequest > thresholds.max) {
            showAlertError({
                icon: "warning",
                title: "Exceeds Maximum Threshold!",
                text: `Current stock: ${currentStock} units. Requesting ${incomingQty} units will result in ${totalAfterRequest} total units, which exceeds the maximum threshold of ${thresholds.max} units. You can still proceed, but the request may be adjusted.`,
                button: 'OK'
            });
        }

        setStockInList(prev => {
            const existingIndex = prev.findIndex(item => item.product_name === s.product_name);
            if (existingIndex !== -1) {
                showAlertError({
                    icon: "warning",
                    title: "Product is already on list!!",
                    text: "You can edit the quantity in the main list",
                    button: 'OK'
                });
                return prev;
            } else {
                return [...prev, { ...s, qty: incomingQty }];
            }
        });

        setSearchedVisible(true);
        setProdQty(1);
        setSelectedProdName('');
    };

    const triggerModal = (operation, id) => {
        switch (operation) {
            case 'searchedProduct':
                setSearchedVisible(false);
                break;
            case 'reqStockOut':
                if (!requestFrom) {
                    showAlertError({
                        icon: "error",
                        title: "Oppss",
                        text: "Please choose a store request from first!",
                        button: 'Try Again'
                    });
                    const input = document.getElementById("storeReqFrom");
                    if (input) input.focus();
                    return;
                }
                GetStockOut();
                setReqStockOutVisible(false);
                break;
            case 'trackRequest':
                setTrackRequestVisible(false);
                break;
            case 'viewRequest':
                setViewRequestVisible(false);
                break;
            case 'trackRequestDetails':
                setMyRequestList([]);
                setTrackRequestDetailsVisible(false);
                GetTrackRequestDetails(id);
                GetTrackRequestD(id);
                break;
        }
    };

    const handleCheckboxChange = (productId) => {
        setSelectedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const add_stock_out = () => {
        const selectedItems = stockOutList
            .filter(item => selectedProducts.includes(item.product_id))
            .map(item => ({ ...item, qty: 1 }));

        // Check for items where requested quantity + current stock exceeds max threshold
        const itemsExceedingMax = selectedItems.filter(item => {
            const currentStock = getCurrentStock(item.product_id);
            const thresholds = getProductThresholds(item.product_id);
            const totalAfterRequest = currentStock + item.qty;
            return totalAfterRequest > thresholds.max;
        });

        if (itemsExceedingMax.length > 0) {
            const maxValues = itemsExceedingMax.map(item => {
                const currentStock = getCurrentStock(item.product_id);
                const thresholds = getProductThresholds(item.product_id);
                const totalAfterRequest = currentStock + item.qty;
                return `${item.product_name} (current: ${currentStock}, requesting: ${item.qty}, total: ${totalAfterRequest}, max: ${thresholds.max})`;
            }).join('\n');
            
            showAlertError({
                icon: "warning",
                title: "Some Items Will Exceed Maximum Threshold!",
                text: `The following products will exceed their maximum threshold after adding the requested quantity:\n\n${maxValues}\n\nStock can only cater up to the maximum threshold.`,
                button: 'OK'
            });
        }

        setStockInList(prev => {
            const existingIds = new Set(prev.map(item => item.product_id));
            const newItems = selectedItems.filter(item => !existingIds.has(item.product_id));
            return [...prev, ...newItems];
        });

        setSelectedProducts([]);
        setReqStockOutVisible(true);
    };

    const sendRequest = async () => {
        if (!sortedStockInList || sortedStockInList.length === 0) {
            error_alert('error', 'Oops', "You can't send an empty request list!");
            return;
        } else if (!requestFrom.trim() || !requestTo.trim()) {
            error_alert('error', 'Oops', "Please fill in all needed details");
            return;
        } else if (requestFrom === requestTo) {
            error_alert('error', 'Oops', "You can't request stock from the same store/location!");
            return;
        } else {
            // Check for any items where requested quantity + current stock exceeds max threshold before sending
            const itemsExceedingMax = sortedStockInList.filter(item => {
                const currentStock = getCurrentStock(item.product_id);
                const thresholds = getProductThresholds(item.product_id);
                const totalAfterRequest = currentStock + item.qty;
                return totalAfterRequest > thresholds.max;
            });

            if (itemsExceedingMax.length > 0) {
                Swal.fire({
                    icon: "warning",
                    title: "Some Items Will Exceed Maximum Threshold!",
                    html: `<div style="text-align: left; padding: 10px;">
                        <p>The following products will exceed their maximum threshold after adding the requested quantity:</p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            ${itemsExceedingMax.map(item => {
                                const currentStock = getCurrentStock(item.product_id);
                                const thresholds = getProductThresholds(item.product_id);
                                const totalAfterRequest = currentStock + item.qty;
                                return `<li><strong>${item.product_name}</strong>: Current ${currentStock} + Requested ${item.qty} = ${totalAfterRequest} (max: ${thresholds.max})</li>`;
                            }).join('')}
                        </ul>
                        <p style="margin-top: 10px;">Stock can only cater up to the maximum threshold. Do you want to continue anyway?</p>
                    </div>`,
                    showCancelButton: true,
                    confirmButtonText: "Yes, Continue",
                    cancelButtonText: "Cancel",
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33"
                }).then((result) => {
                    if (result.isConfirmed) {
                        setContinueSendReq(false);
                    }
                });
                return;
            }

            setContinueSendReq(false);
            return;
        }
    };

    // Sort stockInList by priority: Out of Stock > Below Min > Low Stock > Others
    const sortedStockInList = [...stockInList].sort((a, b) => {
        const aPriority = getStockPriority(a.product_id);
        const bPriority = getStockPriority(b.product_id);
        
        // Sort by priority (lower number = higher priority)
        if (aPriority !== bPriority) {
            return aPriority - bPriority;
        }
        
        // If same priority, sort by current stock (lower stock first)
        const aStock = getCurrentStock(a.product_id);
        const bStock = getCurrentStock(b.product_id);
        return aStock - bStock;
    });

    // Pagination calculations
    const totalRequestPages = Math.ceil(sortedStockInList.length / ITEMS_PER_PAGE_REQQUEST);
    const startRequestIndex = (currentRequestPage - 1) * ITEMS_PER_PAGE_REQQUEST;
    const currentRequestItems = sortedStockInList.slice(startRequestIndex, startRequestIndex + ITEMS_PER_PAGE_REQQUEST);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalRequestPages) {
            setCurrentRequestPage(page);
        }
    };

    const totalRequestPages1 = Math.ceil(stockOutList.length / ITEMS_PER_PAGE_REQQUEST);
    const startRequestIndex1 = (currentRequestPage1 - 1) * ITEMS_PER_PAGE_REQQUEST;
    const currentRequestItems1 = stockOutList.slice(startRequestIndex1, startRequestIndex1 + ITEMS_PER_PAGE_REQQUEST);

    const totalRequestPages2 = Math.ceil(productList.length / ITEMS_PER_PAGE_PRODUCT);
    const startRequestIndex2 = (currentRequestPage2 - 1) * ITEMS_PER_PAGE_PRODUCT;
    const currentRequestItems2 = productList.slice(startRequestIndex2, startRequestIndex2 + ITEMS_PER_PAGE_PRODUCT);

    const handlePageChange2 = (page) => {
        if (page >= 1 && page <= totalRequestPages2) {
            setCurrentRequestPage2(page);
        }
    };

    // Check if all current page items are selected
    const areAllCurrentItemsSelected = () => {
        if (currentLeftItems.length === 0) return false;
        return currentLeftItems.every(product =>
            selectedProductsForRequest.some(selected => selected.product_id === product.product_id)
        );
    };

    // Check if some (but not all) current page items are selected
    const areSomeCurrentItemsSelected = () => {
        if (currentLeftItems.length === 0) return false;
        return currentLeftItems.some(product =>
            selectedProductsForRequest.some(selected => selected.product_id === product.product_id)
        ) && !areAllCurrentItemsSelected();
    };

    // Handle select/unselect all for current page
    const handleSelectAllCurrentPage = () => {
        const allSelected = areAllCurrentItemsSelected();

        if (allSelected) {
            // Unselect all items from current page
            const currentPageIds = new Set(currentLeftItems.map(item => item.product_id));
            setSelectedProductsForRequest(prev =>
                prev.filter(item => !currentPageIds.has(item.product_id))
            );
        } else {
            // Select all items from current page that aren't already selected
            const newSelections = currentLeftItems.filter(product =>
                !selectedProductsForRequest.some(selected => selected.product_id === product.product_id)
            ).map(product => ({ ...product, requestQty: 1 }));

            setSelectedProductsForRequest(prev => [...prev, ...newSelections]);
        }
    };

    // Handle select/unselect all filtered products (across all pages)
    const handleSelectAllFiltered = () => {
        const filteredProducts = getFilteredProducts();
        const allFilteredSelected = filteredProducts.every(product =>
            selectedProductsForRequest.some(selected => selected.product_id === product.product_id)
        );

        if (allFilteredSelected) {
            // Unselect all filtered items
            const filteredIds = new Set(filteredProducts.map(item => item.product_id));
            setSelectedProductsForRequest(prev =>
                prev.filter(item => !filteredIds.has(item.product_id))
            );
        } else {
            // Select all filtered items that aren't already selected
            const newSelections = filteredProducts.filter(product =>
                !selectedProductsForRequest.some(selected => selected.product_id === product.product_id)
            ).map(product => ({ ...product, requestQty: 1 }));

            setSelectedProductsForRequest(prev => [...prev, ...newSelections]);
        }
    };

    // Check if all filtered products are selected
    const areAllFilteredSelected = () => {
        const filteredProducts = getFilteredProducts();
        if (filteredProducts.length === 0) return false;
        return filteredProducts.every(product =>
            selectedProductsForRequest.some(selected => selected.product_id === product.product_id)
        );
    };

    return (
        <>
            <Alert variant={alertVariant} className='alert-inventory' show={alert1} style={{ backgroundColor: alertBG }}>
                {message}
            </Alert>

            {/* Continue Send Request Modal */}
            <Modal show={!continueSendReq} onHide={() => setContinueSendReq(true)} size='md' className='searched-product-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Continue sending a request?</Modal.Title>
                </Modal.Header>
                <Modal.Body className='searched-product-body'>
                    Are you sure you want to send this request list?
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => setContinueSendReq(true)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => {
                        sendSuccess();
                        MyGetRequest();
                        setContinueSendReq(true);
                    }}>
                        Continue
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Confirm Clear Selected Products Modal */}
            <Modal show={!confirmClearSelected} onHide={() => setConfirmClearSelected(true)} size='md' className='searched-product-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Clear Selected Products?</Modal.Title>
                </Modal.Header>
                <Modal.Body className='searched-product-body'>
                    Are you sure you want to clear all selected products? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => setConfirmClearSelected(true)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleClearSelectedProducts}>
                        Yes, Clear All
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Input QTY Modal */}
            <Modal show={!searchedProdkVisible} onHide={() => setSearchedVisible(true)} size='md' className='searched-product-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Input QTY</Modal.Title>
                </Modal.Header>
                <Modal.Body className='searched-product-body'>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Product Code</label>
                        <div className='stock-in-prod'>
                            <input
                                className='prod-name'
                                disabled={true}
                                value={selectedProdName}
                            />
                            <InputGroup className="mb-3" style={{ maxWidth: "150px", height: '50px' }}>
                                <Button variant="outline-secondary" onClick={() => setProdQty(Math.max(1, prodQty - 1))}>
                                    –
                                </Button>
                                <Form.Control
                                    type="number"
                                    value={prodQty}
                                    min="1"
                                    onChange={(e) => setProdQty(e.target.value)}
                                    aria-label="Quantity"
                                />
                                <Button variant="outline-secondary" onClick={() => setProdQty(parseInt(prodQty) + 1)}>
                                    +
                                </Button>
                            </InputGroup>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => setSearchedVisible(true)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={addInStockList}>
                        Add to Request
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Stock Out List Modal */}
            <Modal show={!reqStockOutVisible} onHide={() => setReqStockOutVisible(true)} size='lg' className='searched-product-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Stock Out List</Modal.Title>
                </Modal.Header>
                <Modal.Body className='searched-product-body'>
                    {stockOutList.length > 0 ? (
                        <>
                            <div className='tableContainer1'>
                                <table className='table'>
                                    <thead>
                                        <tr>
                                            <th className='t2'></th>
                                            <th className='t2'>PRODUCT CODE</th>
                                            <th className='t2'>PRODUCT DESCRIPTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRequestItems1.map((p, i) => (
                                            <tr
                                                className='table-row'
                                                key={i}
                                                onClick={() => handleCheckboxChange(p.product_id)}
                                            >
                                                <td>
                                                    <input
                                                        type='checkbox'
                                                        checked={selectedProducts.includes(p.product_id)}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            handleCheckboxChange(p.product_id);
                                                        }}
                                                    />
                                                </td>
                                                <td className='td-name'>{p.product_name}</td>
                                                <td className='td-name'>{p.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalRequestPages1 > 1 && (
                                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                                    <button
                                        onClick={() => setCurrentRequestPage1(p => Math.max(p - 1, 1))}
                                        disabled={currentRequestPage1 === 1}
                                        className='pagination-btn'
                                    >
                                        Previous
                                    </button>
                                    <span style={{ margin: '0 10px' }}>
                                        Page {currentRequestPage1} of {totalRequestPages1}
                                    </span>
                                    <button
                                        onClick={() => setCurrentRequestPage1(p => Math.min(p + 1, totalRequestPages1))}
                                        disabled={currentRequestPage1 === totalRequestPages1}
                                        className='pagination-btn'
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{
                            height: '200px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#777',
                            fontSize: '18px',
                            fontStyle: 'italic'
                        }}>
                            No stock out item for this store
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="primary" onClick={add_stock_out}>
                        Add
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Search Product Modal */}
            <Modal show={!searchProdVisible} onHide={() => {
                setSearchProdVisible(true);
                setSelectedProductsForRequest([]);
                setLeftSearchTerm('');
                setRightSearchTerm('');
                setFilterType('');
                setLeftPaginationPage(1);
                setRightPaginationPage(1);
            }} size='xl' className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Search Product To Request</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: '550px', overflow: 'auto' }}>
                    <Container>
                        <Row>
                            {/* Left Column - Available Products */}
                            <Col md={6}>
                                <div className='tableContainer1' style={{ height: '60vh', display: 'flex', flexDirection: 'column' }}>
                                    {/* Enhanced Filter and Search Section */}
                                    <div style={{
                                        marginBottom: '15px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px'
                                    }}>
                                        {/* First row - Filter and Search */}
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '15px'
                                        }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <label style={{ fontSize: '16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                                    Product List:
                                                </label>
                                                <select
                                                    value={filterType}
                                                    onChange={(e) => setFilterType(e.target.value)}
                                                    style={{
                                                        border: '1px solid #ccc',
                                                        minWidth: '130px',
                                                        backgroundColor: '#f8f9fa',
                                                        borderRadius: '5px',
                                                        padding: '8px 12px',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    <option value=''>All Products</option>
                                                    <option value='inStock'>In Stock</option>
                                                    <option value='noStock'>No Stock</option>
                                                    <option value='lowStock'>Low Stock</option>
                                                </select>
                                            </div>

                                            <div style={{ position: 'relative', minWidth: '200px' }}>
                                                <input
                                                    type="text"
                                                    value={leftSearchTerm}
                                                    onChange={(e) => setLeftSearchTerm(e.target.value)}
                                                    placeholder="Search products..."
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px 8px 40px',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '5px',
                                                        fontSize: '14px',
                                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'/%3e%3c/svg%3e")`,
                                                        backgroundPosition: '12px center',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundSize: '16px 16px',
                                                        outline: 'none',
                                                        transition: 'border-color 0.2s ease',
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                                    onBlur={(e) => e.target.style.borderColor = '#ccc'}
                                                />
                                            </div>
                                        </div>
                                        <div style={{marginTop: '40px'}}></div>

                                        {/* Second row - Select All Options */}
                                        <div style={{
                                            display: 'flex',
                                            gap: '15px',
                                            alignItems: 'center',
                                            padding: '8px 0',
                                            borderTop: '1px solid #e9ecef',
                                            paddingTop: '10px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <button
                                                    onClick={handleSelectAllFiltered}
                                                    style={{
                                                        background: areAllFilteredSelected() ? '#dc3545' : '#007bff',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        padding: '6px 12px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: '500',
                                                        transition: 'background-color 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (areAllFilteredSelected()) {
                                                            e.target.style.backgroundColor = '#c82333';
                                                        } else {
                                                            e.target.style.backgroundColor = '#0056b3';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (areAllFilteredSelected()) {
                                                            e.target.style.backgroundColor = '#dc3545';
                                                        } else {
                                                            e.target.style.backgroundColor = '#007bff';
                                                        }
                                                    }}
                                                >
                                                    {areAllFilteredSelected()
                                                        ? `Unselect all filtered (${getFilteredProducts().length})`
                                                        : `Select all filtered (${getFilteredProducts().length})`
                                                    }
                                                </button>
                                            </div>

                                            {selectedProductsForRequest.length > 0 && (
                                                <div style={{
                                                    marginLeft: 'auto',
                                                    fontSize: '13px',
                                                    color: '#28a745',
                                                    fontWeight: '500'
                                                }}>
                                                    {selectedProductsForRequest.length} product{selectedProductsForRequest.length !== 1 ? 's' : ''} selected
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Table Container with proper flex layout and scrolling */}
                                    <div style={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '5px',
                                        maxHeight: '400px',
                                        minHeight: '200px'
                                    }}>
                                        {currentLeftItems.length === 0 ? (
                                            // Empty state for filtered results
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '300px',
                                                textAlign: 'center',
                                                color: '#6c757d',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '8px',
                                                padding: '40px 20px'
                                            }}>
                                                <div style={{
                                                    fontSize: '48px',
                                                    marginBottom: '20px',
                                                    color: '#adb5bd'
                                                }}>
                                                    {filterType === 'noStock' ? '📭' : filterType === 'inStock' ? '📦' : filterType === 'lowStock' ? '⚡' : '🔍'}
                                                </div>
                                                <h4 style={{
                                                    color: '#495057',
                                                    marginBottom: '10px',
                                                    fontSize: '18px',
                                                    fontWeight: '600'
                                                }}>
                                                    {getEmptyStateTitle()}
                                                </h4>
                                                <p style={{
                                                    color: '#6c757d',
                                                    fontSize: '14px',
                                                    lineHeight: '1.5',
                                                    maxWidth: '300px',
                                                    margin: '0 auto'
                                                }}>
                                                    {getEmptyStateMessage()}
                                                </p>
                                            </div>
                                        ) : (
                                            <table className='table' style={{
                                                width: '100%',
                                                borderCollapse: 'collapse',
                                                margin: 0
                                            }}>
                                                <thead style={{
                                                    position: 'sticky',
                                                    top: 0,
                                                    backgroundColor: '#f8f9fa',
                                                    zIndex: 1
                                                }}>
                                                    <tr>
                                                        <th className='t2' style={{
                                                            border: '1px solid #ddd',
                                                            padding: '12px',
                                                            backgroundColor: '#f8f9fa',
                                                            textAlign: 'left',
                                                            fontSize: '14px',
                                                            fontWeight: '600'
                                                        }}>
                                                            Product Code
                                                        </th>
                                                        <th className='t2' style={{
                                                            border: '1px solid #ddd',
                                                            padding: '12px',
                                                            backgroundColor: '#f8f9fa',
                                                            textAlign: 'left',
                                                            fontSize: '14px',
                                                            fontWeight: '600'
                                                        }}>
                                                            Product Description
                                                        </th>
                                                        <th className='th1' style={{
                                                            border: '1px solid #ddd',
                                                            padding: '12px',
                                                            backgroundColor: '#f8f9fa',
                                                            textAlign: 'center',
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            width: '80px'
                                                        }}>
                                                            Stock
                                                        </th>
                                                        <th className='th1' style={{
                                                            border: '1px solid #ddd',
                                                            padding: '12px',
                                                            backgroundColor: '#f8f9fa',
                                                            textAlign: 'center',
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            width: '100px'
                                                        }}>
                                                            Min
                                                        </th>
                                                        <th className='th1' style={{
                                                            border: '1px solid #ddd',
                                                            padding: '12px',
                                                            backgroundColor: '#f8f9fa',
                                                            textAlign: 'center',
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            width: '100px'
                                                        }}>
                                                            Max
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentLeftItems.map((p, index) => {
                                                        const priority = getStockPriority(p.product_id);
                                                        const currentStock = getCurrentStock(p.product_id);
                                                        const thresholds = getProductThresholds(p.product_id);
                                                        
                                                        // Determine row styling based on priority
                                                        let rowBgColor = selectedProductsForRequest.some(sp => sp.product_id === p.product_id)
                                                            ? '#e3f2fd'
                                                            : index % 2 === 0 ? 'white' : '#f8f9fa';
                                                        let borderLeft = 'none';
                                                        
                                                        if (priority === 1) {
                                                            rowBgColor = selectedProductsForRequest.some(sp => sp.product_id === p.product_id)
                                                                ? '#f8d7da' : '#f8d7da';
                                                            borderLeft = '4px solid #dc3545';
                                                        } else if (priority === 2) {
                                                            rowBgColor = selectedProductsForRequest.some(sp => sp.product_id === p.product_id)
                                                                ? '#fff3cd' : '#fff3cd';
                                                            borderLeft = '4px solid #ffc107';
                                                        } else if (priority === 3) {
                                                            rowBgColor = selectedProductsForRequest.some(sp => sp.product_id === p.product_id)
                                                                ? '#fffbf0' : '#fffbf0';
                                                            borderLeft = '4px solid #ffc107';
                                                        }
                                                        
                                                        return (
                                                        <tr
                                                            className='table-row'
                                                            key={p.product_id}
                                                            onClick={() => handleProductClick(p)}
                                                            style={{
                                                                cursor: 'pointer',
                                                                backgroundColor: rowBgColor,
                                                                borderLeft: borderLeft,
                                                                transition: 'background-color 0.2s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (priority >= 4 && !selectedProductsForRequest.some(sp => sp.product_id === p.product_id)) {
                                                                    e.currentTarget.style.backgroundColor = '#f0f8ff';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                const isSelected = selectedProductsForRequest.some(sp => sp.product_id === p.product_id);
                                                                if (priority >= 4) {
                                                                    if (isSelected) {
                                                                        e.currentTarget.style.backgroundColor = '#e3f2fd';
                                                                    } else {
                                                                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa';
                                                                    }
                                                                } else {
                                                                    e.currentTarget.style.backgroundColor = rowBgColor;
                                                                }
                                                            }}
                                                        >
                                                            <td style={{
                                                                border: '1px solid #ddd',
                                                                padding: '12px',
                                                                textAlign: 'start',
                                                                fontSize: '14px'
                                                            }}>
                                                                {priority === 1 && (
                                                                    <span style={{ marginRight: '6px', fontSize: '14px' }} title="Out of stock - Highest priority">🚫</span>
                                                                )}
                                                                {priority === 2 && (
                                                                    <span style={{ marginRight: '6px', fontSize: '14px' }} title="Below minimum threshold - High priority">⚠️</span>
                                                                )}
                                                                {priority === 3 && (
                                                                    <span style={{ marginRight: '6px', fontSize: '14px' }} title="Low stock - Medium priority">⚡</span>
                                                                )}
                                                                {p.product_name}
                                                            </td>
                                                            <td style={{
                                                                border: '1px solid #ddd',
                                                                padding: '12px',
                                                                textAlign: 'start',
                                                                fontSize: '14px'
                                                            }}>
                                                                {p.description}
                                                            </td>
                                                            <td style={{
                                                                border: '1px solid #ddd',
                                                                padding: '12px',
                                                                textAlign: 'center',
                                                                fontSize: '14px',
                                                                fontWeight: 'bold',
                                                                color: currentStock <= 0 ? '#dc3545' : (priority <= 3 ? '#ffc107' : '#28a745')
                                                            }}>
                                                                {currentStock}
                                                            </td>
                                                            <td style={{
                                                                border: '1px solid #ddd',
                                                                padding: '12px',
                                                                textAlign: 'center',
                                                                fontSize: '13px',
                                                                color: '#6c757d',
                                                                fontWeight: '500'
                                                            }}>
                                                                {thresholds.min}
                                                            </td>
                                                            <td style={{
                                                                border: '1px solid #ddd',
                                                                padding: '12px',
                                                                textAlign: 'center',
                                                                fontSize: '13px',
                                                                color: '#6c757d',
                                                                fontWeight: '500'
                                                            }}>
                                                                {thresholds.max}
                                                            </td>
                                                        </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>

                                    {/* Pagination - Fixed at bottom */}
                                    <div style={{
                                        marginTop: '15px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        paddingTop: '10px',
                                        borderTop: currentLeftItems.length > 0 ? '1px solid #e9ecef' : 'none'
                                    }}>
                                        {totalLeftPages > 1 && (
                                            <CustomPagination
                                                currentPage={leftPaginationPage}
                                                totalPages={totalLeftPages}
                                                onPageChange={handleLeftPageChange}
                                                color="green"
                                            />
                                        )}
                                    </div>
                                </div>
                            </Col>

                            {/* Right Column - Selected Products */}
                            <Col md={6}>
                                <div className='tableContainer1' style={{ height: '60vh', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{
                                        marginBottom: '15px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px'
                                    }}>
                                        {/* First row - Label and Search Input inline */}
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '15px'
                                        }}>
                                            <label style={{ fontSize: '16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                                Selected Products ({selectedProductsForRequest.length})
                                            </label>

                                            <div style={{ position: 'relative', flex: 1, maxWidth: '250px' }}>
                                                <input
                                                    type="text"
                                                    value={rightSearchTerm}
                                                    onChange={(e) => setRightSearchTerm(e.target.value)}
                                                    placeholder="Search selected..."
                                                    disabled={selectedProductsForRequest.length === 0}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px 8px 40px',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '5px',
                                                        fontSize: '14px',
                                                        backgroundColor: selectedProductsForRequest.length === 0 ? '#f8f9fa' : 'white',
                                                        color: selectedProductsForRequest.length === 0 ? '#6c757d' : 'black',
                                                        cursor: selectedProductsForRequest.length === 0 ? 'not-allowed' : 'text',
                                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'/%3e%3c/svg%3e")`,
                                                        backgroundPosition: '12px center',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundSize: '16px 16px',
                                                        outline: 'none',
                                                        transition: 'border-color 0.2s ease',
                                                    }}
                                                    onFocus={(e) => selectedProductsForRequest.length > 0 && (e.target.style.borderColor = '#007bff')}
                                                    onBlur={(e) => e.target.style.borderColor = '#ccc'}
                                                />
                                            </div>
                                        </div>


                                        <div>
                                            <p><strong>NOTE:</strong> You can edit the quantity after adding the product to the list .</p>
                                        </div>

                                        {/* Second row - Clear List button */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={clearSelectedProductsAlert}
                                                disabled={selectedProductsForRequest.length === 0}
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '6px 12px',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                Clear List
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Conditional rendering: Empty state or Table */}
                                    {selectedProductsForRequest.length === 0 ? (
                                        // Empty State
                                        <div style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                            padding: '40px 20px',
                                            color: '#6c757d',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '8px',
                                            border: '2px dashed #dee2e6',
                                            marginTop: '20px',
                                        }}>
                                            <div style={{
                                                fontSize: '48px',
                                                marginBottom: '20px',
                                                color: '#adb5bd'
                                            }}>
                                                📦
                                            </div>
                                            <h4 style={{
                                                color: '#495057',
                                                marginBottom: '10px',
                                                fontSize: '18px',
                                                fontWeight: '600'
                                            }}>
                                                No Products Selected
                                            </h4>
                                            <p style={{
                                                color: '#6c757d',
                                                fontSize: '14px',
                                                lineHeight: '1.5',
                                                maxWidth: '300px',
                                                margin: '0 auto'
                                            }}>
                                                Start by selecting products from the available list to add them here for your request.
                                            </p>
                                        </div>
                                    ) : (
                                        // Table Container with proper flex layout
                                        <>
                                            <div style={{
                                                marginTop: '20px',
                                                flex: 1,
                                                overflowY: 'auto',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '5px'
                                            }}>
                                                <table className='table' style={{
                                                    width: '100%',
                                                    borderCollapse: 'collapse',
                                                    margin: 0
                                                }}>
                                                    <thead style={{
                                                        position: 'sticky',
                                                        top: 0,
                                                        backgroundColor: '#f8f9fa',
                                                        zIndex: 1
                                                    }}>
                                                        <tr>
                                                            <th className='t2' style={{
                                                                border: '1px solid #ddd',
                                                                padding: '12px',
                                                                backgroundColor: '#f8f9fa',
                                                                textAlign: 'left',
                                                                fontSize: '14px',
                                                                fontWeight: '600'
                                                            }}>
                                                                Product Code
                                                            </th>
                                                            <th className='t2' style={{
                                                                border: '1px solid #ddd',
                                                                padding: '12px',
                                                                backgroundColor: '#f8f9fa',
                                                                textAlign: 'left',
                                                                fontSize: '14px',
                                                                fontWeight: '600'
                                                            }}>
                                                                Product Description
                                                            </th>
                                                            <th className='th1' style={{
                                                                border: '1px solid #ddd',
                                                                padding: '12px',
                                                                backgroundColor: '#f8f9fa',
                                                                textAlign: 'center',
                                                                fontSize: '14px',
                                                                fontWeight: '600',
                                                                width: '80px'
                                                            }}>
                                                                Remove
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentRightItems.map((p, index) => (
                                                            <tr
                                                                key={p.product_id}
                                                                style={{
                                                                    backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                                                                    transition: 'background-color 0.2s ease'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa';
                                                                }}
                                                            >
                                                                <td style={{
                                                                    border: '1px solid #ddd',
                                                                    padding: '12px',
                                                                    textAlign: 'start',
                                                                    fontSize: '14px'
                                                                }}>
                                                                    {p.product_name}
                                                                </td>
                                                                <td style={{
                                                                    border: '1px solid #ddd',
                                                                    padding: '12px',
                                                                    textAlign: 'start',
                                                                    fontSize: '14px'
                                                                }}>
                                                                    {p.description}
                                                                </td>
                                                                <td style={{
                                                                    border: '1px solid #ddd',
                                                                    padding: '12px',
                                                                    textAlign: 'center',
                                                                    fontSize: '14px'
                                                                }}>
                                                                    <button
                                                                        onClick={() => handleRemoveSelectedProduct(p.product_id)}
                                                                        style={{
                                                                            background: '#dc3545',
                                                                            color: 'white',
                                                                            border: 'none',
                                                                            borderRadius: '4px',
                                                                            width: '30px',
                                                                            height: '30px',
                                                                            cursor: 'pointer',
                                                                            fontSize: '18px',
                                                                            fontWeight: 'bold',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            transition: 'all 0.2s ease',
                                                                            margin: '0 auto',
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.target.style.backgroundColor = '#c82333';
                                                                            e.target.style.transform = 'scale(1.1)';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.target.style.backgroundColor = '#dc3545';
                                                                            e.target.style.transform = 'scale(1)';
                                                                        }}
                                                                        title="Remove product"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination - Fixed at bottom */}
                                            <div style={{
                                                marginTop: '15px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                paddingTop: '10px',
                                                borderTop: '1px solid #e9ecef'
                                            }}>
                                                {totalRightPages > 1 && (
                                                    <CustomPagination
                                                        currentPage={rightPaginationPage}
                                                        totalPages={totalRightPages}
                                                        onPageChange={handleRightPageChange}
                                                        color="green"
                                                    />
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => {
                        setSearchProdVisible(true);
                        setSelectedProductsForRequest([]);
                        setLeftSearchTerm('');
                        setRightSearchTerm('');
                        setFilterType('');
                        setLeftPaginationPage(1);
                        setRightPaginationPage(1);
                    }}>
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleAddToRequest}
                        disabled={selectedProductsForRequest.length === 0}
                    >
                        Add to Request ({selectedProductsForRequest.length})
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Main Content */}
            <div className='customer-main' style={{ 
                padding: windowWidth <= 768 ? '15px' : windowWidth <= 576 ? '10px' : '20px', 
                maxWidth: '100%', 
                overflowX: 'hidden' 
            }}>
                <div className='customer-header' style={{ 
                    marginBottom: windowWidth <= 576 ? '20px' : '30px' 
                }}>
                    <h1 className='h-customer' style={{
                        fontSize: windowWidth <= 576 ? '20px' : windowWidth <= 768 ? '24px' : '32px',
                        fontWeight: '700',
                        color: '#212529',
                        marginBottom: '10px'
                    }}>REQUEST STOCK</h1>
                    <p style={{ 
                        color: '#6c757d', 
                        fontSize: windowWidth <= 576 ? '12px' : '14px', 
                        margin: 0 
                    }}>Create and manage stock requests from your store to the warehouse</p>
                </div>

                <Container fluid style={{ padding: '0' }}>
                    <Row style={{ margin: 0 }}>
                        <Col xs={12} lg={4} xl={3} style={{ padding: '0 15px 20px 15px' }}>
                            {/* LEFT COLUMN CONTENT - Form Card */}
                            <div style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                padding: '24px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                border: '1px solid #e9ecef',
                                height: '100%'
                            }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#212529',
                                    marginBottom: '20px',
                                    paddingBottom: '12px',
                                    borderBottom: '2px solid #e9ecef'
                                }}>Request Details</h3>
                                
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        color: '#495057'
                                    }}>Request From <span style={{ color: '#dc3545' }}>*</span></label>
                                    <select
                                        id='storeReqFrom'
                                        value={requestFrom}
                                        onChange={(e) => setRequestFrom(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ced4da',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            backgroundColor: '#ffffff',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#007bff';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(0,123,255,0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#ced4da';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="">Select Store / Location</option>
                                        {locationList
                                            .filter((r) => r.name !== "Warehouse")
                                            .map((r) => (
                                                <option key={r.location_id} value={r.location_id}>
                                                    {r.location_name}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        color: '#495057'
                                    }}>Request To <span style={{ color: '#dc3545' }}>*</span></label>
                                    <select 
                                        value={requestTo} 
                                        onChange={(e) => setRequestTo(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ced4da',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            backgroundColor: '#ffffff',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#007bff';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(0,123,255,0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#ced4da';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value={''}>Select Store / Location</option>
                                        {locationList
                                            .filter((r) => r.name === "Warehouse")
                                            .map((r) => (
                                            <option key={r.location_id} value={r.location_id}>
                                                {r.location_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button 
                                    onClick={() => {
                                        if (requestFrom) {
                                            setSearchProdVisible(false);
                                        } else {
                                            showAlertError({
                                                icon: "error",
                                                title: "Opss!",
                                                text: "Please choose a request from first!",
                                                button: 'Try Again'
                                            });
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 4px rgba(0,123,255,0.2)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#0056b3';
                                        e.target.style.transform = 'translateY(-1px)';
                                        e.target.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '#007bff';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 2px 4px rgba(0,123,255,0.2)';
                                    }}
                                >
                                    🔍 SEARCH PRODUCT
                                </button>
                            </div>
                        </Col>

                        <Col xs={12} lg={8} xl={9} style={{ padding: '0 15px' }}>
                            {/* RIGHT COLUMN CONTENT - Request List Card */}
                            <div style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                padding: '24px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                border: '1px solid #e9ecef',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '20px',
                                    flexWrap: 'wrap',
                                    gap: '15px'
                                }}>
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#212529',
                                        margin: 0
                                    }}>Request List</h3>
                                    {sortedStockInList.length > 0 && (
                                        <div style={{
                                            display: 'flex',
                                            gap: '12px',
                                            alignItems: 'center',
                                            flexWrap: 'wrap'
                                        }}>
                                            {sortedStockInList.filter(item => {
                                                const priority = getStockPriority(item.product_id);
                                                return priority <= 3; // Out of stock, below min, or low stock
                                            }).length > 0 && (
                                                <span style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#fff3cd',
                                                    color: '#856404',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    border: '1px solid #ffc107'
                                                }}>
                                                    ⚠️ {sortedStockInList.filter(item => {
                                                        const priority = getStockPriority(item.product_id);
                                                        return priority <= 3;
                                                    }).length} Priority Item{sortedStockInList.filter(item => {
                                                        const priority = getStockPriority(item.product_id);
                                                        return priority <= 3;
                                                    }).length !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                            <span style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#e7f3ff',
                                                color: '#004085',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                border: '1px solid #b3d9ff'
                                            }}>
                                                Total: {sortedStockInList.length} item(s)
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    flex: 1,
                                    overflow: 'auto',
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef',
                                    minHeight: windowWidth <= 768 ? '300px' : '400px',
                                    maxHeight: windowWidth <= 768 ? 'calc(100vh - 300px)' : 'calc(100vh - 350px)'
                                }}>
                                    {currentRequestItems && currentRequestItems.length > 0 ? (
                                        <div style={{ 
                                            overflowX: 'auto',
                                            WebkitOverflowScrolling: 'touch',
                                            width: '100%'
                                        }}>
                                            <table style={{
                                                width: '100%',
                                                borderCollapse: 'collapse',
                                                margin: 0,
                                                minWidth: windowWidth <= 768 ? '600px' : '100%'
                                            }}>
                                                <thead style={{
                                                    position: 'sticky',
                                                    top: 0,
                                                    backgroundColor: '#f8f9fa',
                                                    zIndex: 10
                                                }}>
                                                    <tr>
                                                        <th style={{
                                                            padding: windowWidth <= 768 ? '10px 8px' : '14px 12px',
                                                            textAlign: 'left',
                                                            borderBottom: '2px solid #dee2e6',
                                                            fontWeight: '600',
                                                            fontSize: windowWidth <= 768 ? '11px' : '13px',
                                                            color: '#495057',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>Product Code</th>
                                                        <th style={{
                                                            padding: windowWidth <= 768 ? '10px 8px' : '14px 12px',
                                                            textAlign: 'left',
                                                            borderBottom: '2px solid #dee2e6',
                                                            fontWeight: '600',
                                                            fontSize: windowWidth <= 768 ? '11px' : '13px',
                                                            color: '#495057',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>Description</th>
                                                        <th style={{
                                                            padding: windowWidth <= 768 ? '10px 8px' : '14px 12px',
                                                            textAlign: 'center',
                                                            borderBottom: '2px solid #dee2e6',
                                                            fontWeight: '600',
                                                            fontSize: windowWidth <= 768 ? '11px' : '13px',
                                                            color: '#495057',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            width: windowWidth <= 576 ? '120px' : '150px'
                                                        }}>Quantity</th>
                                                        <th style={{
                                                            padding: windowWidth <= 768 ? '10px 8px' : '14px 12px',
                                                            textAlign: 'center',
                                                            borderBottom: '2px solid #dee2e6',
                                                            fontWeight: '600',
                                                            fontSize: windowWidth <= 768 ? '11px' : '13px',
                                                            color: '#495057',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            width: windowWidth <= 576 ? '60px' : '80px'
                                                        }}>Min</th>
                                                        <th style={{
                                                            padding: windowWidth <= 768 ? '10px 8px' : '14px 12px',
                                                            textAlign: 'center',
                                                            borderBottom: '2px solid #dee2e6',
                                                            fontWeight: '600',
                                                            fontSize: windowWidth <= 768 ? '11px' : '13px',
                                                            color: '#495057',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            width: windowWidth <= 576 ? '60px' : '80px'
                                                        }}>Max</th>
                                                        <th style={{
                                                            padding: windowWidth <= 768 ? '10px 8px' : '14px 12px',
                                                            textAlign: 'center',
                                                            borderBottom: '2px solid #dee2e6',
                                                            fontWeight: '600',
                                                            fontSize: windowWidth <= 768 ? '11px' : '13px',
                                                            color: '#495057',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            width: windowWidth <= 576 ? '60px' : '80px'
                                                        }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentRequestItems.map((p, i) => {
                                                        const isBelowMin = isBelowMinThreshold(p.product_id);
                                                        const isLow = isLowStock(p.product_id);
                                                        const currentStock = getCurrentStock(p.product_id);
                                                        const thresholds = getProductThresholds(p.product_id);
                                                        const totalAfterRequest = currentStock + p.qty;
                                                        const exceedsMax = totalAfterRequest > thresholds.max;
                                                        const priority = getStockPriority(p.product_id);
                                                        
                                                        // Determine row styling based on priority
                                                        let rowBgColor = i % 2 === 0 ? 'white' : '#f8f9fa';
                                                        let borderLeft = 'none';
                                                        if (currentStock === 0) {
                                                            rowBgColor = '#f8d7da'; // Out of stock - red
                                                            borderLeft = '4px solid #dc3545';
                                                        } else if (isBelowMin) {
                                                            rowBgColor = '#fff3cd'; // Below min - yellow
                                                            borderLeft = '4px solid #ffc107';
                                                        } else if (isLow) {
                                                            rowBgColor = '#fffbf0'; // Low stock - light yellow
                                                            borderLeft = '4px solid #ffc107';
                                                        }
                                                        
                                                        return (
                                                            <tr 
                                                                key={i} 
                                                                style={{ 
                                                                    cursor: 'default',
                                                                    backgroundColor: rowBgColor,
                                                                    borderLeft: borderLeft,
                                                                    transition: 'background-color 0.2s ease'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    if (priority >= 4) {
                                                                        e.currentTarget.style.backgroundColor = '#f0f8ff';
                                                                    }
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    if (priority >= 4) {
                                                                        e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'white' : '#f8f9fa';
                                                                    } else {
                                                                        e.currentTarget.style.backgroundColor = rowBgColor;
                                                                    }
                                                                }}
                                                            >
                                                                <td style={{
                                                                    padding: windowWidth <= 768 ? '10px 8px' : '14px 12px',
                                                                    fontSize: windowWidth <= 768 ? '12px' : '14px',
                                                                    fontWeight: '500',
                                                                    color: '#212529'
                                                                }}>
                                                                    {priority === 1 && (
                                                                        <span style={{
                                                                            display: 'inline-block',
                                                                            marginRight: '8px',
                                                                            fontSize: windowWidth <= 768 ? '14px' : '16px'
                                                                        }} title="Out of stock - Highest priority">
                                                                            🚫
                                                                        </span>
                                                                    )}
                                                                    {priority === 2 && (
                                                                        <span style={{
                                                                            display: 'inline-block',
                                                                            marginRight: '8px',
                                                                            fontSize: windowWidth <= 768 ? '14px' : '16px'
                                                                        }} title="Below minimum threshold - High priority">
                                                                            ⚠️
                                                                        </span>
                                                                    )}
                                                                    {priority === 3 && (
                                                                        <span style={{
                                                                            display: 'inline-block',
                                                                            marginRight: '8px',
                                                                            fontSize: windowWidth <= 768 ? '14px' : '16px'
                                                                        }} title="Low stock - Medium priority">
                                                                            ⚡
                                                                        </span>
                                                                    )}
                                                                    {p.product_name}
                                                                </td>
                                                                <td style={{
                                                                    padding: windowWidth <= 768 ? '10px 8px' : '14px 12px',
                                                                    fontSize: windowWidth <= 768 ? '12px' : '14px',
                                                                    color: '#495057'
                                                                }}>{p.description}</td>
                                                                <td style={{ 
                                                                    padding: windowWidth <= 768 ? '10px 8px' : '14px 12px', 
                                                                    textAlign: 'center' 
                                                                }}>
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        gap: '6px'
                                                                    }}>
                                                                        <div style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            gap: '6px'
                                                                        }}>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    updateItemQuantity(p.product_id, p.qty - 1);
                                                                                }}
                                                                                disabled={p.qty <= 1}
                                                                                style={{
                                                                                    background: p.qty <= 1 ? '#e9ecef' : '#007bff',
                                                                                    color: p.qty <= 1 ? '#6c757d' : 'white',
                                                                                    border: 'none',
                                                                                    borderRadius: '6px',
                                                                                    width: windowWidth <= 576 ? '36px' : '32px',
                                                                                    height: windowWidth <= 576 ? '36px' : '32px',
                                                                                    cursor: p.qty <= 1 ? 'not-allowed' : 'pointer',
                                                                                    fontSize: windowWidth <= 576 ? '18px' : '16px',
                                                                                    fontWeight: 'bold',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    transition: 'all 0.2s ease',
                                                                                    boxShadow: p.qty <= 1 ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
                                                                                    minWidth: windowWidth <= 576 ? '36px' : '32px',
                                                                                    touchAction: 'manipulation'
                                                                                }}
                                                                                onMouseEnter={(e) => {
                                                                                    if (p.qty > 1) {
                                                                                        e.target.style.backgroundColor = '#0056b3';
                                                                                        e.target.style.transform = 'scale(1.05)';
                                                                                    }
                                                                                }}
                                                                                onMouseLeave={(e) => {
                                                                                    if (p.qty > 1) {
                                                                                        e.target.style.backgroundColor = '#007bff';
                                                                                        e.target.style.transform = 'scale(1)';
                                                                                    }
                                                                                }}
                                                                                title="Decrease quantity"
                                                                            >
                                                                                −
                                                                            </button>

                                                                            <input
                                                                                type="number"
                                                                                value={p.qty}
                                                                                min="1"
                                                                                max={thresholds.max}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                onChange={(e) => {
                                                                                    e.stopPropagation();
                                                                                    const newQty = parseInt(e.target.value);
                                                                                    if (!isNaN(newQty) && newQty > 0) {
                                                                                        updateItemQuantity(p.product_id, newQty);
                                                                                    }
                                                                                }}
                                                                                style={{
                                                                                    width: windowWidth <= 576 ? '50px' : '60px',
                                                                                    textAlign: 'center',
                                                                                    border: exceedsMax ? '2px solid #dc3545' : '1px solid #ced4da',
                                                                                    borderRadius: '6px',
                                                                                    padding: windowWidth <= 576 ? '8px 4px' : '6px',
                                                                                    fontSize: windowWidth <= 576 ? '13px' : '14px',
                                                                                    fontWeight: '500',
                                                                                    outline: 'none',
                                                                                    backgroundColor: exceedsMax ? '#f8d7da' : 'white',
                                                                                    transition: 'all 0.2s ease',
                                                                                    touchAction: 'manipulation'
                                                                                }}
                                                                                onFocus={(e) => {
                                                                                    e.target.style.borderColor = '#007bff';
                                                                                    e.target.style.boxShadow = '0 0 0 3px rgba(0,123,255,0.1)';
                                                                                }}
                                                                                onBlur={(e) => {
                                                                                    if (exceedsMax) {
                                                                                        e.target.style.borderColor = '#dc3545';
                                                                                        e.target.style.boxShadow = 'none';
                                                                                    } else {
                                                                                        e.target.style.borderColor = '#ced4da';
                                                                                        e.target.style.boxShadow = 'none';
                                                                                    }
                                                                                }}
                                                                                title={exceedsMax ? `Current: ${currentStock} + Requested: ${p.qty} = ${totalAfterRequest} (exceeds max: ${thresholds.max})` : `Current: ${currentStock}, Max threshold: ${thresholds.max}`}
                                                                            />

                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    updateItemQuantity(p.product_id, p.qty + 1);
                                                                                }}
                                                                                style={{
                                                                                    background: exceedsMax ? '#dc3545' : '#007bff',
                                                                                    color: 'white',
                                                                                    border: 'none',
                                                                                    borderRadius: '6px',
                                                                                    width: windowWidth <= 576 ? '36px' : '32px',
                                                                                    height: windowWidth <= 576 ? '36px' : '32px',
                                                                                    cursor: 'pointer',
                                                                                    fontSize: windowWidth <= 576 ? '18px' : '16px',
                                                                                    fontWeight: 'bold',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    transition: 'all 0.2s ease',
                                                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                                                    minWidth: windowWidth <= 576 ? '36px' : '32px',
                                                                                    touchAction: 'manipulation'
                                                                                }}
                                                                                onMouseEnter={(e) => {
                                                                                    e.target.style.backgroundColor = exceedsMax ? '#c82333' : '#0056b3';
                                                                                    e.target.style.transform = 'scale(1.05)';
                                                                                }}
                                                                                onMouseLeave={(e) => {
                                                                                    e.target.style.backgroundColor = exceedsMax ? '#dc3545' : '#007bff';
                                                                                    e.target.style.transform = 'scale(1)';
                                                                                }}
                                                                                title={exceedsMax ? `Warning: Current ${currentStock} + Requested ${p.qty} = ${totalAfterRequest} (exceeds max: ${thresholds.max})` : "Increase quantity"}
                                                                            >
                                                                                +
                                                                            </button>
                                                                        </div>
                                                                        {exceedsMax && (
                                                                            <div style={{
                                                                                fontSize: '10px',
                                                                                color: '#dc3545',
                                                                                fontWeight: '600',
                                                                                textAlign: 'center',
                                                                                padding: '2px 6px',
                                                                                backgroundColor: '#fff5f5',
                                                                                borderRadius: '4px',
                                                                                border: '1px solid #fecaca'
                                                                            }}>
                                                                                Max: {thresholds.max}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td style={{ 
                                                                    padding: windowWidth <= 768 ? '10px 8px' : '14px 12px', 
                                                                    textAlign: 'center',
                                                                    fontSize: windowWidth <= 768 ? '12px' : '14px',
                                                                    fontWeight: '500',
                                                                    color: '#495057'
                                                                }}>
                                                                    {thresholds.min}
                                                                </td>
                                                                <td style={{ 
                                                                    padding: windowWidth <= 768 ? '10px 8px' : '14px 12px', 
                                                                    textAlign: 'center',
                                                                    fontSize: windowWidth <= 768 ? '12px' : '14px',
                                                                    fontWeight: '500',
                                                                    color: '#495057'
                                                                }}>
                                                                    {thresholds.max}
                                                                </td>
                                                                <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeItemFromList(p.product_id);
                                                                        }}
                                                                        style={{
                                                                            background: '#dc3545',
                                                                            color: 'white',
                                                                            border: 'none',
                                                                            borderRadius: '6px',
                                                                            width: windowWidth <= 576 ? '40px' : '36px',
                                                                            height: windowWidth <= 576 ? '40px' : '36px',
                                                                            cursor: 'pointer',
                                                                            fontSize: windowWidth <= 576 ? '20px' : '18px',
                                                                            fontWeight: 'bold',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            transition: 'all 0.2s ease',
                                                                            margin: '0 auto',
                                                                            boxShadow: '0 2px 4px rgba(220,53,69,0.2)',
                                                                            minWidth: windowWidth <= 576 ? '40px' : '36px',
                                                                            touchAction: 'manipulation'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.target.style.backgroundColor = '#c82333';
                                                                            e.target.style.transform = 'scale(1.1)';
                                                                            e.target.style.boxShadow = '0 4px 8px rgba(220,53,69,0.3)';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.target.style.backgroundColor = '#dc3545';
                                                                            e.target.style.transform = 'scale(1)';
                                                                            e.target.style.boxShadow = '0 2px 4px rgba(220,53,69,0.2)';
                                                                        }}
                                                                        title="Remove item from list"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        // Empty State
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '400px',
                                            textAlign: 'center',
                                            color: '#6c757d',
                                            padding: '40px 20px'
                                        }}>
                                            <div style={{
                                                fontSize: '64px',
                                                marginBottom: '20px',
                                                opacity: 0.3
                                            }}>
                                                📦
                                            </div>
                                            <h4 style={{
                                                color: '#495057',
                                                marginBottom: '10px',
                                                fontWeight: '600',
                                                fontSize: '18px'
                                            }}>
                                                No items in your request list
                                            </h4>
                                            <p style={{
                                                margin: '0',
                                                fontSize: '14px',
                                                maxWidth: '300px',
                                                lineHeight: '1.6',
                                                color: '#6c757d'
                                            }}>
                                                Start by adding products to build your request. Items will appear here once added.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer with Pagination and Actions */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: windowWidth <= 768 ? 'column' : 'row',
                                    justifyContent: 'space-between',
                                    alignItems: windowWidth <= 768 ? 'stretch' : 'center',
                                    marginTop: '20px',
                                    paddingTop: '20px',
                                    borderTop: '1px solid #e9ecef',
                                    gap: '15px'
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        justifyContent: windowWidth <= 768 ? 'center' : 'flex-start'
                                    }}>
                                        {totalRequestPages > 1 && currentRequestItems && currentRequestItems.length > 0 && (
                                            <CustomPagination
                                                currentPage={currentRequestPage}
                                                totalPages={totalRequestPages}
                                                onPageChange={handlePageChange}
                                                color="green"
                                            />
                                        )}
                                    </div>

                                    <div style={{ 
                                        display: 'flex', 
                                        gap: '10px', 
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        justifyContent: windowWidth <= 768 ? 'center' : 'flex-end',
                                        width: windowWidth <= 768 ? '100%' : 'auto'
                                    }}>
                                        <Button
                                            variant="danger"
                                            onClick={clearListAlert}
                                            disabled={!currentRequestItems || currentRequestItems.length === 0}
                                            style={{
                                                padding: windowWidth <= 576 ? '12px 16px' : '10px 20px',
                                                borderRadius: '8px',
                                                fontWeight: '600',
                                                fontSize: windowWidth <= 576 ? '13px' : '14px',
                                                transition: 'all 0.2s ease',
                                                flex: windowWidth <= 576 ? '1' : 'none',
                                                minWidth: windowWidth <= 576 ? '120px' : 'auto'
                                            }}
                                        >
                                            Clear List
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={sendRequest}
                                            disabled={!currentRequestItems || currentRequestItems.length === 0}
                                            style={{
                                                padding: windowWidth <= 576 ? '12px 16px' : '10px 24px',
                                                borderRadius: '8px',
                                                fontWeight: '600',
                                                fontSize: windowWidth <= 576 ? '13px' : '14px',
                                                transition: 'all 0.2s ease',
                                                boxShadow: '0 2px 4px rgba(0,123,255,0.2)',
                                                flex: windowWidth <= 576 ? '1' : 'none',
                                                minWidth: windowWidth <= 576 ? '120px' : 'auto'
                                            }}
                                        >
                                            {windowWidth <= 576 ? '📤 Send' : '📤 Send Request'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

        </>
    );
};

export default RequestStockIM;