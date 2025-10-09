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
        return stockItem ? stockItem.qty : 0;
    };

    // Helper functions for empty state messages
    const getEmptyStateTitle = () => {
        if (filterType === 'noStock') {
            return leftSearchTerm.trim() ? 'No Out-of-Stock Products Found' : 'No Out-of-Stock Products';
        } else if (filterType === 'inStock') {
            return leftSearchTerm.trim() ? 'No In-Stock Products Found' : 'No Products In Stock';
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
                setStockInList([]);
                setRequestFrom('');
                setRequestTo('');
                Logs(accountID, `Sent a request from ${from1.location_name} to ${to1.location_name}`);
            }
        } catch (error) {
            console.error("Error sending request:", error);
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

        setStockInList(prev => {
            const existingIds = new Set(prev.map(item => item.product_id));
            const newItems = selectedItems.filter(item => !existingIds.has(item.product_id));
            return [...prev, ...newItems];
        });

        setSelectedProducts([]);
        setReqStockOutVisible(true);
    };

    const sendRequest = async () => {
        if (!stockInList || stockInList.length === 0) {
            error_alert('error', 'Oops', "You can't send an empty request list!");
            return;
        } else if (!requestFrom.trim() || !requestTo.trim()) {
            error_alert('error', 'Oops', "Please fill in all needed details");
            return;
        } else if (requestFrom === requestTo) {
            error_alert('error', 'Oops', "You can't request stock from the same store/location!");
            return;
        } else {
            setContinueSendReq(false);
            return;
        }
    };

    // Pagination calculations
    const totalRequestPages = Math.ceil(stockInList.length / ITEMS_PER_PAGE_REQQUEST);
    const startRequestIndex = (currentRequestPage - 1) * ITEMS_PER_PAGE_REQQUEST;
    const currentRequestItems = stockInList.slice(startRequestIndex, startRequestIndex + ITEMS_PER_PAGE_REQQUEST);

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
                                                    {filterType === 'noStock' ? '📭' : filterType === 'inStock' ? '📦' : '🔍'}
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
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentLeftItems.map((p, index) => (
                                                        <tr
                                                            className='table-row'
                                                            key={p.product_id}
                                                            onClick={() => handleProductClick(p)}
                                                            style={{
                                                                cursor: 'pointer',
                                                                backgroundColor: selectedProductsForRequest.some(sp => sp.product_id === p.product_id)
                                                                    ? '#e3f2fd'
                                                                    : index % 2 === 0 ? 'white' : '#f8f9fa',
                                                                transition: 'background-color 0.2s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!selectedProductsForRequest.some(sp => sp.product_id === p.product_id)) {
                                                                    e.currentTarget.style.backgroundColor = '#f0f8ff';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                const isSelected = selectedProductsForRequest.some(sp => sp.product_id === p.product_id);
                                                                if (isSelected) {
                                                                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                                                                } else {
                                                                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa';
                                                                }
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
                                                                fontSize: '14px',
                                                                fontWeight: 'bold',
                                                                color: getCurrentStock(p.product_id) <= 0 ? '#dc3545' : '#28a745'
                                                            }}>
                                                                {getCurrentStock(p.product_id)}
                                                            </td>
                                                        </tr>
                                                    ))}
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
            <div className='customer-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>REQUEST STOCK</h1>
                </div>

                <Container style={{ marginTop: '10px' }}>
                    <Row>
                        <Col md={3}>
                            {/* LEFT COLUMN CONTENT */}
                            <div className='side-by-side' style={{ marginTop: '0px' }}>
                                <div>
                                    <label className='add-prod-label'>Request From:</label>
                                    <select
                                        id='storeReqFrom'
                                        className="category-dropdown"
                                        value={requestFrom}
                                        onChange={(e) => setRequestFrom(e.target.value)}
                                    >
                                        <option value="">Select Store / Location</option>
                                        {locationList
                                            .filter((r) => r.location_name !== "Warehouse CDO")
                                            .map((r) => (
                                                <option key={r.location_id} value={r.location_id}>
                                                    {r.location_name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div>
                                    <label className='add-prod-label'>Request To:</label>
                                    <select className='category-dropdown' value={requestTo} onChange={(e) => setRequestTo(e.target.value)}>
                                        <option value={''}>Select Store / Location</option>
                                        {locationList.map((r) => (
                                            <option key={r.location_id} value={r.location_id}>
                                                {r.location_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className='div-input-add-prod'>
                                <div>
                                    <button className='add-to-stock1' onClick={() => {
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
                                    }}>
                                        SEARCH PRODUCT
                                    </button>
                                </div>
                            </div>
                        </Col>

                        <Col md={9}>
                            {/* RIGHT COLUMN CONTENT - Updated with inline controls */}
                            <div className='tableContainer1' style={{ height: '52vh', overflow: 'hidden' }}>
                                {currentRequestItems && currentRequestItems.length > 0 ? (
                                    <table className='table'>
                                        <thead>
                                            <tr>
                                                <th className='t2'>PRODUCT ID</th>
                                                <th className='t2'>PRODUCT CODE</th>
                                                <th className='t2'>PRODUCT DESCRIPTION</th>
                                                <th className='th1' style={{ width: '150px' }}>QTY</th>
                                                <th className='th1' style={{ width: '80px' }}>ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentRequestItems.map((p, i) => (
                                                <tr className='table-row' key={i} style={{ cursor: 'default' }}>
                                                    <td className='td-name'>{p.product_id}</td>
                                                    <td className='td-name'>{p.product_name}</td>
                                                    <td className='td-name'>{p.description}</td>
                                                    <td style={{ padding: '8px' }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '5px'
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
                                                                    borderRadius: '4px',
                                                                    width: '30px',
                                                                    height: '30px',
                                                                    cursor: p.qty <= 1 ? 'not-allowed' : 'pointer',
                                                                    fontSize: '16px',
                                                                    fontWeight: 'bold',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    if (p.qty > 1) {
                                                                        e.target.style.backgroundColor = '#0056b3';
                                                                        e.target.style.transform = 'scale(1.1)';
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
                                                                onClick={(e) => e.stopPropagation()}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    const newQty = parseInt(e.target.value);
                                                                    if (!isNaN(newQty) && newQty > 0) {
                                                                        updateItemQuantity(p.product_id, newQty);
                                                                    }
                                                                }}
                                                                style={{
                                                                    width: '50px',
                                                                    textAlign: 'center',
                                                                    border: '1px solid #ced4da',
                                                                    borderRadius: '4px',
                                                                    padding: '5px',
                                                                    fontSize: '14px',
                                                                    outline: 'none'
                                                                }}
                                                                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                                                onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                                                            />

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateItemQuantity(p.product_id, p.qty + 1);
                                                                }}
                                                                style={{
                                                                    background: '#007bff',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    width: '30px',
                                                                    height: '30px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '16px',
                                                                    fontWeight: 'bold',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.target.style.backgroundColor = '#0056b3';
                                                                    e.target.style.transform = 'scale(1.1)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.target.style.backgroundColor = '#007bff';
                                                                    e.target.style.transform = 'scale(1)';
                                                                }}
                                                                title="Increase quantity"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeItemFromList(p.product_id);
                                                            }}
                                                            style={{
                                                                background: '#dc3545',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                width: '35px',
                                                                height: '35px',
                                                                cursor: 'pointer',
                                                                fontSize: '18px',
                                                                fontWeight: 'bold',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'all 0.2s ease',
                                                                margin: '0 auto'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = '#c82333';
                                                                e.target.style.transform = 'scale(1.1)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = '#dc3545';
                                                                e.target.style.transform = 'scale(1)';
                                                            }}
                                                            title="Remove item from list"
                                                        >
                                                            ×
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    // Empty State
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        textAlign: 'center',
                                        color: '#6c757d',
                                        padding: '40px 20px'
                                    }}>
                                        <div style={{
                                            fontSize: '48px',
                                            marginBottom: '20px',
                                            opacity: 0.3
                                        }}>
                                            📦
                                        </div>
                                        <h4 style={{
                                            color: '#495057',
                                            marginBottom: '10px',
                                            fontWeight: '500'
                                        }}>
                                            No items in your request list
                                        </h4>
                                        <p style={{
                                            margin: '0',
                                            fontSize: '14px',
                                            maxWidth: '300px',
                                            lineHeight: '1.4'
                                        }}>
                                            Start by adding products to build your request. Items will appear here once added.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Container style={{
                                display: 'flex',
                                flexDirection: 'row',
                                marginTop: '20px',
                                marginLeft: '20px',
                                justifyContent: 'space-between',
                                height: '40px'
                            }}>
                                <div style={{ justifySelf: 'center', marginTop: '20px' }}>
                                    {totalRequestPages > 1 && currentRequestItems && currentRequestItems.length > 0 && (
                                        <CustomPagination
                                            currentPage={currentRequestPage}
                                            totalPages={totalRequestPages}
                                            onPageChange={handlePageChange}
                                            color="green"
                                        />
                                    )}
                                </div>


                                <div style={{ display: 'flex', gap: '10px', marginRight: '10px' }}>
                                    <Button
                                        variant="danger"
                                        onClick={clearListAlert}
                                        disabled={!currentRequestItems || currentRequestItems.length === 0}
                                    >
                                        Clear List
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={sendRequest}
                                        disabled={!currentRequestItems || currentRequestItems.length === 0}
                                    >
                                        Send Request
                                    </Button>
                                </div>
                            </Container>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
};

export default RequestStockIM;