'use client';
import { useState, useEffect } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import { Col, Row, Container, Badge } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import 'sweetalert2/dist/sweetalert2.all';
import Swal from 'sweetalert2';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const TransferStock = () => {
    // User and location state
    const [user_id, setUser_id] = useState('');
    const [currentLocationId, setCurrentLocationId] = useState('');
    const [currentLocationName, setCurrentLocationName] = useState('');

    // Location lists
    const [locationList, setLocationList] = useState([]);
    const [requestFromLocation, setRequestFromLocation] = useState('');
    const [requestToLocation, setRequestToLocation] = useState('');

    // Product and inventory state
    const [productList, setProductList] = useState([]);
    const [sourceLocationInventory, setSourceLocationInventory] = useState([]);
    const [destinationLocationInventory, setDestinationLocationInventory] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Transfer requests tracking
    const [transferRequests, setTransferRequests] = useState([]);
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'in_transit', 'completed', 'rejected'
    const [transferHistory, setTransferHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);

    // Search and filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'inStock', 'lowStock', 'outOfStock'

    // Modal states
    const [showProductModal, setShowProductModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showNewRequestModal, setShowNewRequestModal] = useState(false);
    const [showTransferDetailsModal, setShowTransferDetailsModal] = useState(false);
    const [showCompletedModal, setShowCompletedModal] = useState(false);
    const [showRejectedModal, setShowRejectedModal] = useState(false);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [loadingInventory, setLoadingInventory] = useState(false);
    const [loadingTransfers, setLoadingTransfers] = useState(false);

    // Alert states
    const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userId = sessionStorage.getItem('user_id');
            const locationId = sessionStorage.getItem('location_id');
            const locationName = sessionStorage.getItem('location_name');

            setUser_id(userId);
            setCurrentLocationId(locationId);
            setCurrentLocationName(locationName || '');

            // Set source location (from) to current location and lock it
            if (locationId) {
                setRequestFromLocation(locationId);
                // Don't set destination location - it should be selected by user
            }
        }
    }, []);

    // Fetch all locations
    useEffect(() => {
        fetchLocations();
    }, []);

    // Fetch transfer requests
    useEffect(() => {
        fetchTransferRequests();
    }, [currentLocationId, filterStatus]);

    // Fetch inventory when locations are selected (for new request modal)
    useEffect(() => {
        if (showNewRequestModal && requestFromLocation && requestToLocation) {
            console.log('useEffect triggered - fetching inventory', { requestFromLocation, requestToLocation });
            fetchInventory();
        } else {
            console.log('useEffect - conditions not met', { showNewRequestModal, requestFromLocation, requestToLocation });
        }
    }, [showNewRequestModal, requestFromLocation, requestToLocation]);

    const fetchLocations = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
            const url = baseURL + 'location.php';

            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({}),
                    operation: 'GetLocation'
                }
            });

            if (response.data && Array.isArray(response.data)) {
                setLocationList(response.data);
            } else if (response.data && response.data.locations) {
                setLocationList(response.data.locations);
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
            showAlertError({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load locations. Please try again.',
                button: 'OK'
            });
        }
    };

    const fetchTransferRequests = async () => {
        if (!currentLocationId) return;

        setLoadingTransfers(true);
        try {
            const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
            const url = baseURL + 'transferStock.php';

            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        location_id: parseInt(currentLocationId),
                        status: filterStatus === 'all' ? null : filterStatus
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

            // Filter to show only transfers where current location is the source (from location)
            const filteredTransfers = transfers.filter(transfer => {
                const fromLocationId = transfer.request_from_location_id || transfer.from_location_id || transfer.from_location;
                return fromLocationId && parseInt(fromLocationId) === parseInt(currentLocationId);
            });

            setTransferRequests(filteredTransfers);
        } catch (error) {
            console.error('Error fetching transfer requests:', error);
            // Don't show error if endpoint doesn't exist yet
            if (error.response?.status !== 404) {
                showAlertError({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load transfer requests. Please try again.',
                    button: 'OK'
                });
            }
        } finally {
            setLoadingTransfers(false);
        }
    };

    const fetchInventory = async () => {
        // Source location is always the current logged-in location
        const sourceLocationId = currentLocationId || requestFromLocation;
        
        if (!sourceLocationId || !requestToLocation) {
            console.log('Missing locations:', { sourceLocationId, requestToLocation });
            return;
        }

        setLoadingInventory(true);
        try {
            const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';

            // Fetch inventory for source location (current logged-in location)
            const sourceInventoryUrl = baseURL + 'transferStock.php';
            console.log('Fetching source inventory for location:', sourceLocationId);
            
            const sourceResponse = await axios.get(sourceInventoryUrl, {
                params: {
                    json: JSON.stringify({
                        location_id: parseInt(sourceLocationId)
                    }),
                    operation: 'GetInventory2'
                }
            });

            console.log('Source inventory response:', sourceResponse.data);
            console.log('Response type:', typeof sourceResponse.data);
            console.log('Is array?', Array.isArray(sourceResponse.data));

            let sourceInventory = [];
            
            // Handle different response formats
            if (Array.isArray(sourceResponse.data)) {
                sourceInventory = sourceResponse.data;
            } else if (typeof sourceResponse.data === 'string') {
                // If response is a JSON string, parse it
                try {
                    const parsed = JSON.parse(sourceResponse.data);
                    if (Array.isArray(parsed)) {
                        sourceInventory = parsed;
                    } else if (parsed && Array.isArray(parsed.inventory)) {
                        sourceInventory = parsed.inventory;
                    } else if (parsed && Array.isArray(parsed.products)) {
                        sourceInventory = parsed.products;
                    }
                } catch (e) {
                    console.error('Error parsing JSON string:', e);
                }
            } else if (sourceResponse.data && Array.isArray(sourceResponse.data.inventory)) {
                sourceInventory = sourceResponse.data.inventory;
            } else if (sourceResponse.data && Array.isArray(sourceResponse.data.products)) {
                sourceInventory = sourceResponse.data.products;
            } else if (sourceResponse.data && sourceResponse.data.success === false) {
                console.error('API Error:', sourceResponse.data.message);
                throw new Error(sourceResponse.data.message || 'Failed to fetch inventory');
            }

            console.log('Parsed source inventory:', sourceInventory);
            console.log('Source inventory count:', sourceInventory.length);
            setSourceLocationInventory(sourceInventory);

            // Fetch inventory for destination location
            const destInventoryUrl = baseURL + 'transferStock.php';
            console.log('Fetching destination inventory for location:', requestToLocation);
            
            const destResponse = await axios.get(destInventoryUrl, {
                params: {
                    json: JSON.stringify({
                        location_id: parseInt(requestToLocation)
                    }),
                    operation: 'GetInventory2'
                }
            });

            console.log('Destination inventory response:', destResponse.data);
            console.log('Destination response type:', typeof destResponse.data);
            console.log('Destination is array?', Array.isArray(destResponse.data));

            let destInventory = [];
            
            // Handle different response formats
            if (Array.isArray(destResponse.data)) {
                destInventory = destResponse.data;
            } else if (typeof destResponse.data === 'string') {
                // If response is a JSON string, parse it
                try {
                    const parsed = JSON.parse(destResponse.data);
                    if (Array.isArray(parsed)) {
                        destInventory = parsed;
                    } else if (parsed && Array.isArray(parsed.inventory)) {
                        destInventory = parsed.inventory;
                    } else if (parsed && Array.isArray(parsed.products)) {
                        destInventory = parsed.products;
                    }
                } catch (e) {
                    console.error('Error parsing JSON string:', e);
                }
            } else if (destResponse.data && Array.isArray(destResponse.data.inventory)) {
                destInventory = destResponse.data.inventory;
            } else if (destResponse.data && Array.isArray(destResponse.data.products)) {
                destInventory = destResponse.data.products;
            } else if (destResponse.data && destResponse.data.success === false) {
                console.error('API Error:', destResponse.data.message);
            }

            console.log('Parsed destination inventory:', destInventory);
            console.log('Destination inventory count:', destInventory.length);
            setDestinationLocationInventory(destInventory);

            // Create unique product list from DESTINATION inventory (show all products from destination location)
            const uniqueProducts = [];
            const seenProductIds = new Set();

            if (destInventory && Array.isArray(destInventory) && destInventory.length > 0) {
                console.log('Processing', destInventory.length, 'destination inventory items');
                destInventory.forEach((item, idx) => {
                    const productId = item.product_id;
                    // Include all products from destination location
                    if (productId && !seenProductIds.has(productId)) {
                        seenProductIds.add(productId);
                        uniqueProducts.push({
                            product_id: productId,
                            product_code: item.product_name || item.product_code || `PROD-${productId}`,
                            product_name: item.product_name,
                            description: item.description,
                            price: item.price,
                            product_preview_image: item.product_preview_image,
                            color: item.color,
                            category_name: item.category_name,
                            product_type_name: item.product_type_name
                        });
                    } else if (!productId) {
                        console.warn('Item at index', idx, 'has no product_id:', item);
                    }
                });
            } else {
                console.warn('Destination inventory is empty or not an array:', destInventory);
                console.warn('Type:', typeof destInventory, 'Is Array:', Array.isArray(destInventory));
            }

            console.log('Unique products list (from destination location):', uniqueProducts);
            console.log('Product list count:', uniqueProducts.length);
            setProductList(uniqueProducts);

        } catch (error) {
            console.error('Error fetching inventory:', error);
            console.error('Error details:', error.response?.data || error.message);
            showAlertError({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to load inventory. Please check console for details.',
                button: 'OK'
            });
        } finally {
            setLoadingInventory(false);
        }
    };

    // Get stock level for a product in a specific location
    const getStockLevel = (productId, locationId) => {
        // Source location is always the current logged-in location
        const sourceLocationId = currentLocationId || requestFromLocation;
        const inventory = locationId === sourceLocationId
            ? sourceLocationInventory
            : destinationLocationInventory;

        // Find item by product_id and location_id to handle same product in multiple locations
        const item = inventory.find(inv => {
            const invProductId = inv.product_id || inv.product_code;
            const invLocationId = inv.location_id || inv.locationId;
            return invProductId === productId &&
                invLocationId &&
                parseInt(invLocationId) === parseInt(locationId);
        });

        return item ? (parseInt(item.qty) || parseInt(item.quantity) || 0) : 0;
    };

    // Get stock status badge
    const getStockStatus = (stock) => {
        if (stock === 0) {
            return { text: 'Out of Stock', variant: 'danger', color: '#dc3545' };
        } else if (stock <= 5) {
            return { text: 'Low Stock', variant: 'warning', color: '#ffc107' };
        } else {
            return { text: 'In Stock', variant: 'success', color: '#28a745' };
        }
    };

    // Get transfer status badge
    const getTransferStatusBadge = (status) => {
        const statusLower = (status || '').toLowerCase();
        switch (statusLower) {
            case 'pending':
            case 'requested':
                return { variant: 'warning', text: 'Pending', color: '#ffc107' };
            case 'approved':
            case 'approved':
                return { variant: 'info', text: 'Approved', color: '#17a2b8' };
            case 'in_transit':
            case 'in transit':
            case 'shipped':
                return { variant: 'primary', text: 'In Transit', color: '#007bff' };
            case 'completed':
            case 'delivered':
            case 'received':
                return { variant: 'success', text: 'Completed', color: '#28a745' };
            case 'rejected':
            case 'cancelled':
            case 'declined':
                return { variant: 'danger', text: 'Rejected', color: '#dc3545' };
            default:
                return { variant: 'secondary', text: status || 'Unknown', color: '#6c757d' };
        }
    };

    // Filter products based on search and filter type
    const getFilteredProducts = () => {
        // If productList is empty but we have destination inventory, create product list from destination inventory
        let productsToFilter = productList;
        
        if (productsToFilter.length === 0 && destinationLocationInventory && destinationLocationInventory.length > 0) {
            const seenProductIds = new Set();
            productsToFilter = destinationLocationInventory
                .filter(item => {
                    const productId = item.product_id;
                    if (productId && !seenProductIds.has(productId)) {
                        seenProductIds.add(productId);
                        return true;
                    }
                    return false;
                })
                .map(item => ({
                    product_id: item.product_id,
                    product_code: item.product_name || item.product_code || `PROD-${item.product_id}`,
                    product_name: item.product_name,
                    description: item.description,
                    price: item.price,
                    product_preview_image: item.product_preview_image,
                    color: item.color,
                    category_name: item.category_name,
                    product_type_name: item.product_type_name
                }));
        }
        
        let filtered = productsToFilter;

        // Apply search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(p =>
                (p.product_name && p.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (p.product_code && p.product_code.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply stock filter (using current location as source)
        const sourceLocationId = currentLocationId || requestFromLocation;
        if (sourceLocationId) {
            filtered = filtered.filter(p => {
                const stock = getStockLevel(p.product_id || p.product_code, sourceLocationId);

                if (filterType === 'inStock') return stock > 5;
                if (filterType === 'lowStock') return stock > 0 && stock <= 5;
                if (filterType === 'outOfStock') return stock === 0;
                return true; // 'all'
            });
        }

        return filtered;
    };

    // Filter transfer requests - only show current/active transfers
    const getFilteredTransfers = () => {
        let filtered = transferRequests;

        // Always show only active transfers (pending, approved, in_transit)
        filtered = filtered.filter(transfer => {
            const status = (transfer.status || '').toLowerCase();
            return status === 'pending' || status === 'approved' || status === 'in_transit';
        });

        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(transfer => {
                const status = (transfer.status || '').toLowerCase();
                return status === filterStatus.toLowerCase();
            });
        }

        // Apply search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(transfer =>
                (transfer.transfer_id && transfer.transfer_id.toString().includes(searchTerm)) ||
                (transfer.request_number && transfer.request_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (transfer.from_location_name && transfer.from_location_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (transfer.to_location_name && transfer.to_location_name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        return filtered;
    };

    // Get completed transfers sorted by latest update
    const getCompletedTransfers = () => {
        return transferRequests
            .filter(transfer => {
                const status = (transfer.status || '').toLowerCase();
                return status === 'completed' || status === 'received' || status === 'delivered';
            })
            .sort((a, b) => {
                const dateA = new Date(a.updated_at || a.completed_at || a.created_at || 0);
                const dateB = new Date(b.updated_at || b.completed_at || b.created_at || 0);
                return dateB - dateA; // Latest first
            });
    };

    // Get rejected transfers sorted by latest update
    const getRejectedTransfers = () => {
        return transferRequests
            .filter(transfer => {
                const status = (transfer.status || '').toLowerCase();
                return status === 'rejected' || status === 'cancelled' || status === 'declined';
            })
            .sort((a, b) => {
                const dateA = new Date(a.updated_at || a.rejected_at || a.created_at || 0);
                const dateB = new Date(b.updated_at || b.rejected_at || b.created_at || 0);
                return dateB - dateA; // Latest first
            });
    };

    // Add product to transfer list
    const addProductToTransfer = (product) => {
        const productId = product.productId || product.product_id || product.product_code;
        // Check stock at DESTINATION location (the provider, who will send the stock)
        const stock = getStockLevel(productId, requestToLocation);

        if (stock === 0) {
            showAlertError({
                icon: 'warning',
                title: 'Out of Stock',
                text: 'This product is out of stock at the destination location (provider).',
                button: 'OK'
            });
            return;
        }

        const existingIndex = selectedProducts.findIndex(
            p => {
                const pId = p.productId || p.product_id || p.product_code;
                return pId === productId;
            }
        );

        if (existingIndex >= 0) {
            // Update existing product
            const updated = [...selectedProducts];
            updated[existingIndex] = {
                ...updated[existingIndex],
                quantity: Math.min(updated[existingIndex].quantity + 1, stock)
            };
            setSelectedProducts(updated);
        } else {
            // Add new product
            setSelectedProducts([
                ...selectedProducts,
                {
                    ...product,
                    productId: productId,
                    quantity: 1,
                    maxQuantity: stock
                }
            ]);
        }
    };

    // Update product quantity
    const updateQuantity = (productId, newQuantity) => {
        const updated = selectedProducts.map(p => {
            const pId = p.productId || p.product_id || p.product_code;
            if (pId === productId) {
                // Use destination stock (provider) as max quantity
                const maxQty = p.maxQuantity || getStockLevel(pId, requestToLocation);
                return {
                    ...p,
                    quantity: Math.max(1, Math.min(newQuantity, maxQty))
                };
            }
            return p;
        });
        setSelectedProducts(updated);
    };

    // Remove product from transfer list
    const removeProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(
            p => {
                const pId = p.productId || p.product_id || p.product_code;
                return pId !== productId;
            }
        ));
    };

    // Submit transfer request
    const submitTransferRequest = async () => {
        if (selectedProducts.length === 0) {
            showAlertError({
                icon: 'warning',
                title: 'No Products Selected',
                text: 'Please select at least one product to transfer.',
                button: 'OK'
            });
            return;
        }

        if (!requestToLocation) {
            showAlertError({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a destination location.',
                button: 'OK'
            });
            return;
        }

        // Always use current location as source (from location)
        const sourceLocationId = currentLocationId || requestFromLocation;

        setLoading(true);
        try {
            const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
            const url = baseURL + 'transferStock.php';

            const transferData = {
                request_from_location_id: parseInt(sourceLocationId),
                request_to_location_id: parseInt(requestToLocation),
                requested_by: parseInt(user_id),
                items: selectedProducts.map(p => ({
                    product_id: p.product_id || p.product_code,
                    quantity: parseInt(p.quantity),
                    product_name: p.product_name || p.description
                }))
            };

            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(transferData),
                    operation: 'CreateTransferRequest'
                }
            });

            if (response.data && response.data.success) {
                const transferRequestId = response.data.transfer_request_id || response.data.id || response.data.request_id;
                const requesterName = sessionStorage.getItem('fullname') || 'Unknown User';
                const fromLocationName = getLocationName(sourceLocationId);
                const toLocationName = getLocationName(requestToLocation);
                const itemsCount = selectedProducts.length;

                Swal.fire({
                    icon: 'success',
                    title: 'Transfer Request Created!',
                    text: 'Your stock transfer request has been submitted successfully.',
                    confirmButtonText: 'OK'
                });

                // Send notification to inventory manager at destination location
                await createNotification({
                    type: 'transfer_request',
                    title: 'New Transfer Request',
                    message: `New transfer request #${transferRequestId || 'N/A'} from ${fromLocationName} (${itemsCount} item${itemsCount > 1 ? 's' : ''}) - Requested by ${requesterName}`,
                    locationId: parseInt(requestToLocation), // Destination location (where inventory manager is)
                    targetRole: 'Inventory Manager',
                    productId: null,
                    customerId: null,
                    referenceId: transferRequestId || null
                });

                // Reset form
                setSelectedProducts([]);
                setRequestFromLocation(currentLocationId); // Keep locked to current location
                setRequestToLocation(currentLocationId);
                setSearchTerm('');
                setShowConfirmModal(false);
                setShowNewRequestModal(false);
                
                // Refresh transfer requests
                fetchTransferRequests();
            } else {
                throw new Error(response.data?.message || 'Failed to create transfer request');
            }
        } catch (error) {
            console.error('Error submitting transfer request:', error);
            showAlertError({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to submit transfer request. Please try again.',
                button: 'OK'
            });
        } finally {
            setLoading(false);
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

    // Get location name by ID
    const getLocationName = (locationId) => {
        const location = locationList.find(loc =>
            loc.location_id === parseInt(locationId) || loc.id === parseInt(locationId)
        );
        return location ? (location.location_name || location.name) : 'Unknown Location';
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    // Open new request modal
    const handleNewRequest = () => {
        setShowNewRequestModal(true);
        setRequestFromLocation(currentLocationId); // Lock to current location
        setRequestToLocation(''); // Start with empty destination location
        setSelectedProducts([]);
        setProductList([]); // Clear product list
        setSourceLocationInventory([]); // Clear inventory data
        setDestinationLocationInventory([]); // Clear inventory data
        setSearchTerm('');
        setFilterType('all');
    };

    // Transfer progress steps
    const transferSteps = [
        "Request Created",
        "Approved & In Transit",
        "Delivered",
        "Completed"
    ];

    // Rejected transfer steps
    const rejectedSteps = [
        "Request Created",
        "Rejected"
    ];

    // Get progress step based on status
    const getProgressStep = (status) => {
        const statusLower = (status || '').toLowerCase();
        if (statusLower === 'pending') return 0;
        if (statusLower === 'approved' || statusLower === 'in_transit') return 1;
        if (statusLower === 'delivered') return 2;
        if (statusLower === 'completed' || statusLower === 'received') return 3;
        if (statusLower === 'rejected' || statusLower === 'cancelled' || statusLower === 'declined') return 1; // For rejected, step 1 is "Rejected"
        return 0;
    };

    // Fetch transfer history/status history
    const fetchTransferHistory = async (transferId) => {
        if (!transferId) return;
        
        try {
            const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
            const url = baseURL + 'transferStock.php';

            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        transfer_request_id: transferId
                    }),
                    operation: 'GetTransferRequestById'
                }
            });

            if (response.data && response.data.success && response.data.transfer) {
                const transfer = response.data.transfer;
                // If history is available, use it; otherwise create from dates
                if (transfer.history && Array.isArray(transfer.history)) {
                    setTransferHistory(transfer.history);
                } else {
                    // Create history from available dates
                    const history = [];
                    if (transfer.created_at) {
                        history.push({ stepName: 'Request Created', status_type: 'request', created_at: transfer.created_at });
                    }
                    // Check if rejected
                    if (transfer.status === 'rejected' || transfer.status === 'cancelled' || transfer.status === 'declined') {
                        const rejectedDate = transfer.rejected_at || transfer.updated_at || transfer.created_at;
                        history.push({ 
                            stepName: 'Rejected', 
                            status_type: 'status_change',
                            new_status: 'rejected',
                            created_at: rejectedDate 
                        });
                    } else {
                        // Combined Approved & In Transit step
                        if (transfer.approved_at || transfer.status === 'approved' || transfer.status === 'in_transit') {
                            const approvedDate = transfer.approved_at || transfer.updated_at || transfer.created_at;
                            history.push({ 
                                stepName: 'Approved & In Transit', 
                                status_type: transfer.status === 'in_transit' ? 'delivery' : 'status_change',
                                new_status: transfer.status === 'in_transit' ? 'in_transit' : 'approved',
                                created_at: approvedDate 
                            });
                        }
                        if (transfer.completed_at) {
                            history.push({ 
                                stepName: 'Completed', 
                                status_type: 'status_change', 
                                new_status: 'completed',
                                created_at: transfer.completed_at 
                            });
                        }
                    }
                    setTransferHistory(history);
                }
                
                // Set current step based on status
                setCurrentStep(getProgressStep(transfer.status));
            }
        } catch (error) {
            console.error('Error fetching transfer history:', error);
            setTransferHistory([]);
        }
    };

    // View transfer details
    const viewTransferDetails = async (transfer) => {
        setSelectedTransfer(transfer);
        setShowTransferDetailsModal(true);
        
        // Fetch full details with history
        const transferId = transfer.transfer_request_id || transfer.transfer_id || transfer.id;
        if (transferId) {
            try {
                const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
                const url = baseURL + 'transferStock.php';

                const response = await axios.get(url, {
                    params: {
                        json: JSON.stringify({
                            transfer_request_id: transferId
                        }),
                        operation: 'GetTransferRequestById'
                    }
                });

                if (response.data && response.data.success && response.data.transfer) {
                    // Update selectedTransfer with full details including rejection_reason
                    setSelectedTransfer(response.data.transfer);
                }
            } catch (error) {
                console.error('Error fetching transfer details:', error);
            }
            
            // Fetch history
            await fetchTransferHistory(transferId);
        }
    };

    const filteredProducts = getFilteredProducts();
    const filteredTransfers = getFilteredTransfers();

    return (
        <>
            <style>
                {`
                    /* Mobile Responsive Styles */
                    @media (max-width: 768px) {
                        .transfer-header {
                            flex-direction: column !important;
                            align-items: flex-start !important;
                            gap: 15px !important;
                        }
                        
                        .transfer-header h2 {
                            font-size: 1.5rem !important;
                            width: 100%;
                        }
                        
                        .transfer-actions {
                            flex-direction: column !important;
                            width: 100% !important;
                            gap: 10px !important;
                        }
                        
                        .archive-buttons {
                            flex-direction: column !important;
                            width: 100% !important;
                            gap: 8px !important;
                        }
                        
                        .archive-buttons button {
                            width: 100% !important;
                            font-size: 0.875rem !important;
                            padding: 8px 12px !important;
                        }
                        
                        .request-transfer-btn {
                            width: 100% !important;
                            font-size: 0.875rem !important;
                            padding: 10px 16px !important;
                        }
                        
                        .table-responsive {
                            font-size: 0.8rem !important;
                        }
                        
                        .table th,
                        .table td {
                            padding: 0.5rem 0.4rem !important;
                            font-size: 0.8rem !important;
                        }
                        
                        .table th {
                            font-size: 0.75rem !important;
                        }
                        
                        .badge {
                            font-size: 0.7rem !important;
                            padding: 0.3rem 0.5rem !important;
                        }
                        
                        .btn-sm {
                            font-size: 0.75rem !important;
                            padding: 0.35rem 0.65rem !important;
                        }
                        
                        .modal-xl {
                            max-width: 95% !important;
                            margin: 0.5rem !important;
                        }
                        
                        .modal-body {
                            padding: 1rem !important;
                            max-height: calc(100vh - 150px) !important;
                        }
                        
                        .modal-header {
                            padding: 0.75rem 1rem !important;
                        }
                        
                        .modal-title {
                            font-size: 1.1rem !important;
                        }
                        
                        .modal-footer {
                            padding: 0.75rem 1rem !important;
                            flex-direction: column !important;
                            gap: 8px !important;
                        }
                        
                        .modal-footer button {
                            width: 100% !important;
                        }
                        
                        .search-filter-row {
                            flex-direction: column !important;
                        }
                        
                        .search-filter-row .col-md-6 {
                            width: 100% !important;
                            margin-bottom: 10px !important;
                        }
                        
                        .tracker-container {
                            padding: 12px !important;
                            margin-bottom: 20px !important;
                        }
                        
                        .tracker-container h5 {
                            font-size: 0.9rem !important;
                            margin-bottom: 12px !important;
                        }
                        
                        .tracker-step {
                            padding-left: 24px !important;
                        }
                        
                        .tracker-step-content {
                            padding: 8px !important;
                            font-size: 0.8rem !important;
                        }
                        
                        .tracker-step-content h6 {
                            font-size: 0.85rem !important;
                            margin-bottom: 4px !important;
                        }
                        
                        /* Reduce circle size and spacing on mobile */
                        .tracker-step > div {
                            padding-bottom: 25px !important;
                        }
                        
                        .tracker-step > div:last-child {
                            padding-bottom: 0 !important;
                        }
                    }
                    
                    @media (max-width: 576px) {
                        .transfer-header h2 {
                            font-size: 1.25rem !important;
                        }
                        
                        .table {
                            font-size: 0.75rem !important;
                        }
                        
                        .table th,
                        .table td {
                            padding: 0.4rem 0.3rem !important;
                            font-size: 0.75rem !important;
                        }
                        
                        .table th {
                            font-size: 0.7rem !important;
                        }
                        
                        .modal-xl {
                            max-width: 100% !important;
                            margin: 0 !important;
                        }
                        
                        .modal-content {
                            border-radius: 0 !important;
                            min-height: 100vh !important;
                        }
                        
                        .modal-body {
                            padding: 0.75rem !important;
                            max-height: calc(100vh - 120px) !important;
                        }
                        
                        .modal-header {
                            padding: 0.75rem !important;
                        }
                        
                        .modal-title {
                            font-size: 1rem !important;
                        }
                        
                        .badge {
                            font-size: 0.65rem !important;
                            padding: 0.25rem 0.4rem !important;
                        }
                        
                        .btn-sm {
                            font-size: 0.7rem !important;
                            padding: 0.3rem 0.5rem !important;
                        }
                        
                        .tracker-container {
                            padding: 8px !important;
                            margin-bottom: 15px !important;
                        }
                        
                        .tracker-container h5 {
                            font-size: 0.85rem !important;
                            margin-bottom: 10px !important;
                        }
                        
                        .tracker-step {
                            padding-left: 20px !important;
                        }
                        
                        .tracker-step-content {
                            padding: 6px !important;
                            font-size: 0.75rem !important;
                        }
                        
                        .tracker-step-content h6 {
                            font-size: 0.8rem !important;
                            margin-bottom: 3px !important;
                        }
                        
                        .tracker-step-content p {
                            font-size: 0.7rem !important;
                            margin: 2px 0 !important;
                        }
                        
                        /* Reduce circle size and spacing on small mobile */
                        .tracker-step > div {
                            padding-bottom: 20px !important;
                        }
                        
                        .tracker-step > div:last-child {
                            padding-bottom: 0 !important;
                        }
                    }
                `}
            </style>
            <div className='customer-main'>
                <Container fluid className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4 transfer-header">
                        <h2 className="mb-0">Transfer Stock Tracker</h2>
                        <div className="d-flex align-items-center gap-3 transfer-actions">
                            {/* Archive Buttons */}
                            <div className="d-flex gap-2 archive-buttons" style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '4px', 
                                borderRadius: '8px',
                                border: '1px solid #dee2e6'
                            }}>
                                <Button
                                    variant="success"
                                    onClick={() => setShowCompletedModal(true)}
                                    size="sm"
                                    style={{
                                        fontWeight: '500',
                                        padding: '6px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Completed ({getCompletedTransfers().length})
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => setShowRejectedModal(true)}
                                    size="sm"
                                    style={{
                                        fontWeight: '500',
                                        padding: '6px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Rejected ({getRejectedTransfers().length})
                                </Button>
                            </div>
                            <Button
                                variant="primary"
                                onClick={handleNewRequest}
                                className="request-transfer-btn"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    fontWeight: '600'
                                }}
                            >
                                Request Transfer
                            </Button>
                        </div>
                    </div>

                    {alert.show && (
                        <Alert
                            variant={alert.variant}
                            onClose={() => setAlert({ ...alert, show: false })}
                            dismissible
                            className="mb-4"
                        >
                            {alert.message}
                        </Alert>
                    )}

                    {/* Filter Controls */}
                    <div style={{
                        padding: '24px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        margin: '20px 0',
                        border: '1px solid #dee2e6'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '20px',
                            alignItems: 'end'
                        }}>
                           
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: '#495057'
                                }}>
                                    Filter by Status
                                </label>
                                <Form.Select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff'
                                    }}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="in_transit">In Transit</option>
                                </Form.Select>
                            </div>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: '#495057'
                                }}>
                                    Search Transfers
                                </label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by transfer ID, location, or request number..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            padding: '10px 12px',
                                            border: '1px solid #dee2e6',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            backgroundColor: '#ffffff'
                                        }}
                                    />
                                    <Button variant="outline-secondary" style={{
                                        border: '1px solid #dee2e6',
                                        borderLeft: 'none'
                                    }}>
                                        🔍
                                    </Button>
                                </InputGroup>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {(searchTerm || filterStatus !== 'all') && (
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
                                <strong>Active Filters:</strong>

                                {filterStatus !== 'all' && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '4px 8px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '16px',
                                        fontSize: '13px',
                                        border: '1px solid #dee2e6'
                                    }}>
                                        Status: {
                                            filterStatus === 'pending' ? 'Pending' :
                                            filterStatus === 'approved' ? 'Approved' :
                                            filterStatus === 'in_transit' ? 'In Transit' :
                                            'All Status'
                                        }
                                        <button
                                            type="button"
                                            onClick={() => setFilterStatus('all')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#6c757d',
                                                cursor: 'pointer',
                                                padding: '2px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '18px',
                                                height: '18px',
                                                marginLeft: '4px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#dc3545';
                                                e.target.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.color = '#6c757d';
                                            }}
                                            title="Remove status filter"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}

                                {searchTerm && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '4px 8px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '16px',
                                        fontSize: '13px',
                                        border: '1px solid #dee2e6'
                                    }}>
                                        Search: "{searchTerm}"
                                        <button
                                            type="button"
                                            onClick={() => setSearchTerm('')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#6c757d',
                                                cursor: 'pointer',
                                                padding: '2px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '18px',
                                                height: '18px',
                                                marginLeft: '4px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#dc3545';
                                                e.target.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.color = '#6c757d';
                                            }}
                                            title="Remove search filter"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}

                                <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                                    ({filteredTransfers.length} records shown)
                                </span>
                            </div>

                            <div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterStatus('all');
                                    }}
                                    style={{
                                        padding: "8px 16px",
                                        backgroundColor: "#6c757d",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "14px"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#5a6268';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '#6c757d';
                                    }}
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Transfer Requests List */}
                    <div className="mb-4">

                        {loadingTransfers ? (
                            <div className="text-center p-4">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : filteredTransfers.length === 0 ? (
                            <Alert variant="info">
                                {searchTerm.trim()
                                    ? 'No transfer requests found matching your search criteria.'
                                    : 'No active transfer requests found. Click "Request Transfer" to create a new transfer request.'}
                            </Alert>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Transfer ID</th>
                                            <th>From Location</th>
                                            <th>To Location</th>
                                            <th>Items</th>
                                            <th>Requested Date</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransfers.map((transfer, idx) => {
                                            const statusBadge = getTransferStatusBadge(transfer.status);
                                            const itemsCount = transfer.items ? transfer.items.length : (transfer.item_count || 0);
                                            
                                            return (
                                                <tr key={`transfer-${transfer.transfer_id || transfer.id || idx}`}>
                                                    <td>
                                                        <strong>
                                                            {transfer.transfer_id || transfer.id || transfer.request_number || `#${idx + 1}`}
                                                        </strong>
                                                    </td>
                                                    <td>{transfer.from_location_name || getLocationName(transfer.from_location_id || transfer.request_from_location_id)}</td>
                                                    <td>{transfer.to_location_name || getLocationName(transfer.to_location_id || transfer.request_to_location_id)}</td>
                                                    <td>{itemsCount} item(s)</td>
                                                    <td>{formatDate(transfer.created_at || transfer.request_date || transfer.date)}</td>
                                                    <td>
                                                        <Badge bg={statusBadge.variant} style={{ padding: '0.5rem 1rem' }}>
                                                            {statusBadge.text}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => viewTransferDetails(transfer)}
                                                        >
                                                            View Details
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* New Transfer Request Modal */}
                    <Modal show={showNewRequestModal} onHide={() => {
                        setShowNewRequestModal(false);
                        setSelectedProducts([]);
                        setProductList([]); // Clear product list
                        setSourceLocationInventory([]); // Clear inventory data
                        setDestinationLocationInventory([]); // Clear inventory data
                        setRequestFromLocation(currentLocationId); // Keep locked to current location
                        setRequestToLocation(''); // Reset to empty
                    }} size="xl">
                        <Modal.Header closeButton>
                            <Modal.Title>Request Stock Transfer</Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            {/* Location Selection */}
                            <Row className="mb-4">
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label><strong>Request From (Source Location)</strong></Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={getLocationName(requestFromLocation) || currentLocationName || 'Current Location'}
                                            disabled
                                            readOnly
                                            style={{
                                                backgroundColor: '#f8f9fa',
                                                cursor: 'not-allowed'
                                            }}
                                        />
                                        <Form.Text className="text-muted">
                                            Source location is locked to your current location.
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label><strong>Request To (Destination Location)</strong></Form.Label>
                                        <Form.Select
                                            value={requestToLocation}
                                            onChange={(e) => {
                                                setRequestToLocation(e.target.value);
                                                setSelectedProducts([]);
                                                setProductList([]); // Clear product list when destination changes
                                                setSourceLocationInventory([]); // Clear inventory data
                                                setDestinationLocationInventory([]); // Clear inventory data
                                            }}
                                            required
                                        >
                                            <option value="">Select destination location...</option>
                                            {locationList
                                                .filter(loc => {
                                                    const locId = loc.location_id || loc.id;
                                                    return locId && locId.toString() !== requestFromLocation;
                                                })
                                                .filter(loc => loc.name !== "Warehouse")
                                                .map((loc, locIdx) => {
                                                    const locId = loc.location_id || loc.id || `loc-${locIdx}`;
                                                    return (
                                                        <option
                                                            key={`to-${locId}-${locIdx}`}
                                                            value={locId}
                                                        >
                                                            {loc.location_name || loc.name}
                                                            {locId === currentLocationId ? ' (Current)' : ''}
                                                        </option>
                                                    );
                                                })}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Selected Products Summary */}
                            {selectedProducts.length > 0 && (
                                <div className="mb-4 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">Selected Products for Transfer</h5>
                                        <Badge bg="primary">{selectedProducts.length} item(s)</Badge>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: '35%' }}>Product</th>
                                                    <th style={{ width: '20%' }}>Quantity</th>
                                                    <th style={{ width: '20%' }}>Destination Stock</th>
                                                    <th style={{ width: '10%' }}>Status</th>
                                                    <th style={{ width: '15%' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedProducts.map((product, idx) => {
                                                    const productId = product.product_id || product.product_code || `product-${idx}`;
                                                    // Destination is the provider, so check destination stock
                                                    const destStock = getStockLevel(
                                                        productId,
                                                        requestToLocation
                                                    );
                                                    const destStatus = getStockStatus(destStock);

                                                    return (
                                                        <tr key={`selected-${productId}-${idx}`}>
                                                            <td>
                                                                <div>
                                                                    <strong>{product.product_name || product.description}</strong>
                                                                    <br />
                                                                    <small className="text-muted">
                                                                        {product.product_code || product.product_id}
                                                                    </small>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <InputGroup size="sm">
                                                                    <Button
                                                                        variant="outline-secondary"
                                                                        onClick={() => updateQuantity(
                                                                            productId,
                                                                            product.quantity - 1
                                                                        )}
                                                                        disabled={product.quantity <= 1}
                                                                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                                                    >
                                                                        −
                                                                    </Button>
                                                                    <Form.Control
                                                                        type="number"
                                                                        min="1"
                                                                        max={product.maxQuantity || destStock}
                                                                        value={product.quantity}
                                                                        onChange={(e) => updateQuantity(
                                                                            productId,
                                                                            parseInt(e.target.value) || 1
                                                                        )}
                                                                        style={{ textAlign: 'center', fontSize: '0.875rem' }}
                                                                    />
                                                                    <Button
                                                                        variant="outline-secondary"
                                                                        onClick={() => updateQuantity(
                                                                            productId,
                                                                            product.quantity + 1
                                                                        )}
                                                                        disabled={product.quantity >= (product.maxQuantity || destStock)}
                                                                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                                                    >
                                                                        +
                                                                    </Button>
                                                                </InputGroup>
                                                            </td>
                                                            <td>
                                                                <Badge bg={destStatus.variant} style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}>
                                                                    {destStock} units
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                {product.quantity > destStock ? (
                                                                    <Badge bg="danger" style={{ fontSize: '0.75rem' }}>
                                                                        Exceeds Stock
                                                                    </Badge>
                                                                ) : product.quantity === destStock ? (
                                                                    <Badge bg="warning" style={{ fontSize: '0.75rem' }}>
                                                                        All Stock
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge bg="success" style={{ fontSize: '0.75rem' }}>
                                                                        OK
                                                                    </Badge>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => removeProduct(productId)}
                                                                    style={{ fontSize: '0.75rem' }}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Product Selection */}
                            {requestFromLocation && requestToLocation && requestToLocation !== currentLocationId ? (
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5>Select Products to Transfer</h5>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={fetchInventory}
                                            disabled={loadingInventory}
                                        >
                                            {loadingInventory ? 'Loading...' : ' Refresh Products'}
                                        </Button>
                                    </div>

                                    {/* Search and Filter */}
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <InputGroup>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Search products..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <Button variant="outline-secondary">
                                                    🔍
                                                </Button>
                                            </InputGroup>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Select
                                                value={filterType}
                                                onChange={(e) => setFilterType(e.target.value)}
                                            >
                                                <option value="all">All Products</option>
                                                <option value="inStock">In Stock</option>
                                                <option value="lowStock">Low Stock</option>
                                                <option value="outOfStock">Out of Stock</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>

                                    {/* Product List */}
                                    {loadingInventory ? (
                                        <div className="text-center p-4">
                                            <div className="spinner-border" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2">Loading products from source location...</p>
                                        </div>
                                    ) : productList.length === 0 ? (
                                        <Alert variant="warning">
                                            <strong>No products available at destination location.</strong>
                                            <br />
                                            <small>Please select a different destination location or ensure the location has inventory.</small>
                                            <br />
                                            <small className="text-muted">Destination Location ID: {requestToLocation}</small>
                                        </Alert>
                                    ) : filteredProducts.length === 0 ? (
                                        <Alert variant="info">
                                            No products found matching your search/filter criteria.
                                            <br />
                                            <small>Total products available: {productList.length}</small>
                                        </Alert>
                                    ) : (
                                        <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            <table className="table table-hover table-sm">
                                                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                    <tr>
                                                        <th>Product</th>
                                                        <th>Stock (Destination)</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredProducts.map((product, productIdx) => {
                                                        const productId = product.product_id || product.product_code || `product-${productIdx}`;
                                                        // Destination is the provider, so check destination stock
                                                        const destStock = getStockLevel(
                                                            productId,
                                                            requestToLocation
                                                        );
                                                        const destStatus = getStockStatus(destStock);

                                                        return (
                                                            <tr key={`product-${productId}-${productIdx}`}>
                                                                <td>
                                                                    <strong>{product.product_name || product.description}</strong>
                                                                    <br />
                                                                    <small className="text-muted">
                                                                        {product.product_code || product.product_id}
                                                                    </small>
                                                                </td>
                                                                <td>
                                                                    <span
                                                                        className={`badge bg-${destStatus.variant}`}
                                                                        style={{ fontSize: '0.85rem' }}
                                                                    >
                                                                        {destStock} units
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        onClick={() => addProductToTransfer({ ...product, productId })}
                                                                        disabled={destStock === 0}
                                                                    >
                                                                        {destStock === 0 ? 'Out of Stock' : 'Add'}
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Alert variant="info" className="mb-4">
                                    <strong>Please select a destination location to view available products.</strong>
                                    <br />
                                    <small>Choose a location from the "Request To (Destination Location)" dropdown above.</small>
                                </Alert>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => {
                                setShowNewRequestModal(false);
                                setSelectedProducts([]);
                                setProductList([]); // Clear product list
                                setSourceLocationInventory([]); // Clear inventory data
                                setDestinationLocationInventory([]); // Clear inventory data
                                setRequestFromLocation(currentLocationId); // Keep locked to current location
                                setRequestToLocation(''); // Reset to empty
                            }}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => setShowConfirmModal(true)}
                                disabled={selectedProducts.length === 0 || !requestFromLocation || !requestToLocation}
                            >
                                Review Request
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Confirmation Modal */}
                    <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Transfer Request</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p><strong>From:</strong> {getLocationName(requestFromLocation)}</p>
                            <p><strong>To:</strong> {getLocationName(requestToLocation)}</p>
                            <hr />
                            <h6>Products to Transfer:</h6>
                            <ul>
                                {selectedProducts.map((product, idx) => {
                                    const productId = product.product_id || product.product_code || `product-${idx}`;
                                    return (
                                        <li key={`confirm-${productId}-${idx}`}>
                                            {product.product_name || product.description} -
                                            Quantity: {product.quantity}
                                        </li>
                                    );
                                })}
                            </ul>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={submitTransferRequest} disabled={loading}>
                                {loading ? 'Submitting...' : 'Confirm Transfer'}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Transfer Details Modal */}
                    <Modal show={showTransferDetailsModal} onHide={() => {
                        setShowTransferDetailsModal(false);
                        setSelectedTransfer(null);
                    }} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>Transfer Request Details</Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ height: '70vh', overflowY: 'auto' }}>
                            {selectedTransfer && (
                                <>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <p><strong>Transfer ID:</strong> {selectedTransfer.transfer_id || selectedTransfer.id || selectedTransfer.request_number}</p>
                                            <p><strong>From Location:</strong> {selectedTransfer.from_location_name || getLocationName(selectedTransfer.from_location_id || selectedTransfer.request_from_location_id)}</p>
                                            <p><strong>To Location:</strong> {selectedTransfer.to_location_name || getLocationName(selectedTransfer.to_location_id || selectedTransfer.request_to_location_id)}</p>
                                        </Col>
                                        <Col md={6}>
                                            <p><strong>Status:</strong>
                                                <Badge bg={getTransferStatusBadge(selectedTransfer.status).variant} className="ms-2">
                                                    {getTransferStatusBadge(selectedTransfer.status).text}
                                                </Badge>
                                            </p>
                                            <p><strong>Requested Date:</strong> {formatDate(selectedTransfer.created_at || selectedTransfer.request_date || selectedTransfer.date)}</p>
                                            {selectedTransfer.approved_at && (
                                                <p><strong>Approved Date:</strong> {formatDate(selectedTransfer.approved_at)}</p>
                                            )}
                                            {selectedTransfer.rejected_at && (
                                                <p><strong>Rejected Date:</strong> {formatDate(selectedTransfer.rejected_at)}</p>
                                            )}
                                            {selectedTransfer.completed_at && (
                                                <p><strong>Completed Date:</strong> {formatDate(selectedTransfer.completed_at)}</p>
                                            )}
                                        </Col>
                                    </Row>
                                    <hr />
                                    
                                    {/* Transfer Progress Tracker */}
                                    <div className="tracker-container" style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                        <h5 style={{ marginBottom: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: typeof window !== 'undefined' && window.innerWidth <= 768 ? '14px' : '18px' }}>
                                            Transfer Progress Tracker
                                        </h5>
                                        
                                        {(() => {
                                            const isRejected = selectedTransfer.status === 'rejected' || selectedTransfer.status === 'cancelled' || selectedTransfer.status === 'declined';
                                            const stepsToShow = isRejected ? rejectedSteps : transferSteps;
                                            const rejectedColor = '#dc3545';
                                            
                                            return (
                                                <div className="tracker-step" style={{ 
                                                    position: 'relative', 
                                                    paddingLeft: typeof window !== 'undefined' && window.innerWidth <= 768 ? '28px' : '40px' 
                                                }}>
                                                    {stepsToShow.map((step, index) => {
                                                        // Responsive circle size - smaller on mobile
                                                        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
                                                        const circleSize = isMobile ? 14 : 20;
                                                        const circleLeft = isMobile ? -20 : -28;
                                                        const circleCenter = circleLeft + (circleSize / 2);
                                                        const lineWidth = isMobile ? 2 : 3;
                                                        const lineLeft = circleCenter - (lineWidth / 2);
                                                        const lineTop = circleSize;
                                                        
                                                        // Determine if this step is active
                                                        const isActive = index <= currentStep;
                                                        const isRejectedStep = step === 'Rejected';
                                                        const activeColor = isRejectedStep ? rejectedColor : '#28a745';
                                                        
                                                        // Find history data for this step
                                                        const stepData = transferHistory.find(h => {
                                                            if (step === 'Request Created' && h.status_type === 'request') return true;
                                                            if (step === 'Rejected' && 
                                                                (h.status_type === 'status_change' && (h.new_status === 'rejected' || h.new_status === 'cancelled' || h.new_status === 'declined'))) return true;
                                                            if (step === 'Approved & In Transit' && 
                                                                (h.status_type === 'status_change' && (h.new_status === 'approved' || h.new_status === 'in_transit') || 
                                                                 h.status_type === 'delivery')) return true;
                                                            if (step === 'Delivered' && h.status_type === 'delivery' && h.new_status === 'delivered') return true;
                                                            if (step === 'Completed' && h.status_type === 'status_change' && h.new_status === 'completed') return true;
                                                            return false;
                                                        });
                                                        
                                                        return (
                                                            <div key={index} style={{ position: 'relative', paddingBottom: index < stepsToShow.length - 1 ? (isMobile ? '25px' : '40px') : '0' }}>
                                                                {/* Vertical Line */}
                                                                {index < stepsToShow.length - 1 && (() => {
                                                                    // Line should only be active if the NEXT step is also reached
                                                                    // The line connects current step to next step, so both must be active
                                                                    const nextStepActive = (index + 1) <= currentStep;
                                                                    return (
                                                                        <div style={{
                                                                            position: 'absolute',
                                                                            left: `${lineLeft}px`,
                                                                            top: `${lineTop}px`,
                                                                            width: `${lineWidth}px`,
                                                                            height: 'calc(100% - 4px)',
                                                                            backgroundColor: nextStepActive ? activeColor : '#e0e0e0',
                                                                            zIndex: 0
                                                                        }} />
                                                                    );
                                                                })()}
                                                                
                                                                {/* Step Circle */}
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    left: `${circleLeft}px`,
                                                                    top: '0px',
                                                                    width: `${circleSize}px`,
                                                                    height: `${circleSize}px`,
                                                                    borderRadius: '50%',
                                                                    backgroundColor: isActive ? activeColor : '#e0e0e0',
                                                                    border: isMobile ? '2px solid white' : '3px solid white',
                                                                    boxShadow: '0 0 0 ' + (isMobile ? '1.5px' : '2px') + ' ' + (isActive ? activeColor : '#e0e0e0'),
                                                                    zIndex: 1
                                                                }} />
                                                            
                                                        {/* Step Content */}
                                                        <div className="tracker-step-content" style={{
                                                            padding: isMobile ? '8px' : '12px',
                                                            backgroundColor: isActive ? (isRejectedStep ? '#fff5f5' : '#f8fff9') : '#f8f9fa',
                                                            borderRadius: isMobile ? '6px' : '8px',
                                                            border: '1px solid ' + (isActive ? activeColor : '#e0e0e0'),
                                                            opacity: isActive ? 1 : 0.6
                                                        }}>
                                                                    <h6 style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: isActive ? activeColor : '#666', fontSize: isMobile ? '13px' : '15px' }}>
                                                                        {step}
                                                                    </h6>
                                                                    {stepData && stepData.created_at && (
                                                                        <>
                                                                            <p style={{ margin: '4px 0', fontSize: isMobile ? '11px' : '13px', color: '#333' }}>
                                                                                <strong>Status:</strong> {stepData.new_status || stepData.status_type || step}
                                                                            </p>
                                                                            <p style={{ margin: '4px 0', fontSize: isMobile ? '10px' : '12px', color: '#666' }}>
                                                                                <strong>Date:</strong> {formatDate(stepData.created_at)}
                                                                            </p>
                                                                            {stepData.changed_by_name && (
                                                                                <p style={{ margin: '4px 0', fontSize: isMobile ? '10px' : '12px', color: '#666' }}>
                                                                                    <strong>By:</strong> {stepData.changed_by_name}
                                                                                </p>
                                                                            )}
                                                                            {isRejectedStep && selectedTransfer.rejection_reason && (
                                                                                <p style={{ margin: '4px 0', fontSize: isMobile ? '10px' : '12px', color: rejectedColor, fontWeight: 'bold' }}>
                                                                                    <strong>Reason:</strong> {selectedTransfer.rejection_reason}
                                                                                </p>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                    {(!stepData || !stepData.created_at) && index > currentStep && (
                                                                        <p style={{ margin: '4px 0', fontSize: isMobile ? '10px' : '12px', color: '#999', fontStyle: 'italic' }}>
                                                                            Pending...
                                                                        </p>
                                                                    )}
                                                                    {index <= currentStep && (!stepData || !stepData.created_at) && (
                                                                        <p style={{ margin: '4px 0', fontSize: isMobile ? '10px' : '12px', color: '#666' }}>
                                                                            {index === 0 && selectedTransfer.created_at ? (
                                                                                <>
                                                                                    <strong>Date:</strong> {formatDate(selectedTransfer.created_at)}
                                                                                </>
                                                                            ) : isRejectedStep && selectedTransfer.rejected_at ? (
                                                                                <>
                                                                                    <strong>Status:</strong> Rejected
                                                                                    <br />
                                                                                    <strong>Date:</strong> {formatDate(selectedTransfer.rejected_at)}
                                                                                    {selectedTransfer.rejection_reason && (
                                                                                        <>
                                                                                            <br />
                                                                                            <strong style={{ color: rejectedColor }}>Reason:</strong> <span style={{ color: rejectedColor }}>{selectedTransfer.rejection_reason}</span>
                                                                                        </>
                                                                                    )}
                                                                                </>
                                                                            ) : index === 1 && !isRejected && (selectedTransfer.approved_at || selectedTransfer.status === 'approved' || selectedTransfer.status === 'in_transit') ? (
                                                                                <>
                                                                                    <strong>Status:</strong> {selectedTransfer.status === 'in_transit' ? 'In Transit' : 'Approved'}
                                                                                    <br />
                                                                                    <strong>Date:</strong> {formatDate(selectedTransfer.approved_at || selectedTransfer.updated_at || selectedTransfer.created_at)}
                                                                                </>
                                                                            ) : index === 3 && selectedTransfer.completed_at ? (
                                                                                <>
                                                                                    <strong>Date:</strong> {formatDate(selectedTransfer.completed_at)}
                                                                                </>
                                                                            ) : (
                                                                                'In progress...'
                                                                            )}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    
                                    <hr />
                                    <h6>Items:</h6>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Product Name</th>
                                                    <th>Product Code</th>
                                                    <th>Description</th>
                                                    <th>Requested Qty</th>
                                                    <th>Approved Qty</th>
                                                    <th>Delivered Qty</th>
                                                    <th>Received Qty</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(selectedTransfer.items || []).map((item, idx) => (
                                                    <tr key={`item-${idx}`}>
                                                        <td>
                                                            <strong>{item.product_name || 'N/A'}</strong>
                                                        </td>
                                                        <td>
                                                            <small className="text-muted">
                                                                {item.product_code || item.product_name || item.product_id || 'N/A'}
                                                            </small>
                                                        </td>
                                                        <td>{item.description || 'N/A'}</td>
                                                        <td>
                                                            <Badge bg="info">{item.requested_quantity || item.quantity || item.qty || 0}</Badge>
                                                        </td>
                                                        <td>
                                                            {item.approved_quantity || item.approved_quantity === 0 ? (
                                                                <Badge bg="success">{item.approved_quantity}</Badge>
                                                            ) : (selectedTransfer.status === 'approved' || selectedTransfer.status === 'in_transit' || selectedTransfer.status === 'completed') ? (
                                                                <Badge bg="success">{item.requested_quantity || item.quantity || item.qty || 0}</Badge>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {item.delivered_quantity ? (
                                                                <Badge bg="primary">{item.delivered_quantity}</Badge>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {item.received_quantity ? (
                                                                <Badge bg="success">{item.received_quantity}</Badge>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <Badge bg={getTransferStatusBadge(item.item_status || selectedTransfer.status).variant}>
                                                                {getTransferStatusBadge(item.item_status || selectedTransfer.status).text}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {(!selectedTransfer.items || selectedTransfer.items.length === 0) && (
                                        <Alert variant="info" className="mt-3">
                                            No items found for this transfer request.
                                        </Alert>
                                    )}
                                    {selectedTransfer.notes && (
                                        <>
                                            <hr />
                                            <p><strong>Notes:</strong> {selectedTransfer.notes}</p>
                                        </>
                                    )}
                                    {selectedTransfer.rejection_reason && (
                                        <>
                                            <hr />
                                            <Alert variant="danger">
                                                <strong>Rejection Reason:</strong> {selectedTransfer.rejection_reason}
                                            </Alert>
                                        </>
                                    )}
                                    {selectedTransfer.priority && (
                                        <>
                                            <hr />
                                            <p><strong>Priority:</strong> 
                                                <Badge bg={selectedTransfer.priority === 'high' ? 'danger' : selectedTransfer.priority === 'medium' ? 'warning' : 'secondary'} className="ms-2">
                                                    {selectedTransfer.priority.toUpperCase()}
                                                </Badge>
                                            </p>
                                        </>
                                    )}
                                </>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => {
                                setShowTransferDetailsModal(false);
                                setSelectedTransfer(null);
                            }}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Completed Transfers Modal */}
                    <Modal show={showCompletedModal} onHide={() => setShowCompletedModal(false)} size="xl">
                        <Modal.Header closeButton>
                            <Modal.Title>Completed Transfers</Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            {getCompletedTransfers().length === 0 ? (
                                <Alert variant="info">
                                    No completed transfer requests found.
                                </Alert>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Transfer ID</th>
                                                <th>From Location</th>
                                                <th>To Location</th>
                                                <th>Items</th>
                                                <th>Completed Date</th>
                                                <th>Last Updated</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getCompletedTransfers().map((transfer, idx) => {
                                                const statusBadge = getTransferStatusBadge(transfer.status);
                                                const itemsCount = transfer.items ? transfer.items.length : (transfer.item_count || 0);
                                                
                                                return (
                                                    <tr key={`completed-${transfer.transfer_id || transfer.id || idx}`}>
                                                        <td>
                                                            <strong>
                                                                {transfer.transfer_id || transfer.id || transfer.request_number || `#${idx + 1}`}
                                                            </strong>
                                                        </td>
                                                        <td>{transfer.from_location_name || getLocationName(transfer.from_location_id || transfer.request_from_location_id)}</td>
                                                        <td>{transfer.to_location_name || getLocationName(transfer.to_location_id || transfer.request_to_location_id)}</td>
                                                        <td>{itemsCount} item(s)</td>
                                                        <td>{formatDate(transfer.completed_at || transfer.updated_at)}</td>
                                                        <td>{formatDate(transfer.updated_at || transfer.completed_at)}</td>
                                                        <td>
                                                            <Badge bg={statusBadge.variant} style={{ padding: '0.5rem 1rem' }}>
                                                                {statusBadge.text}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setShowCompletedModal(false);
                                                                    viewTransferDetails(transfer);
                                                                }}
                                                            >
                                                                View Details
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowCompletedModal(false)}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Rejected Transfers Modal */}
                    <Modal show={showRejectedModal} onHide={() => setShowRejectedModal(false)} size="xl">
                        <Modal.Header closeButton>
                            <Modal.Title>Rejected/Cancelled Transfers</Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            {getRejectedTransfers().length === 0 ? (
                                <Alert variant="info">
                                    No rejected or cancelled transfer requests found.
                                </Alert>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Transfer ID</th>
                                                <th>From Location</th>
                                                <th>To Location</th>
                                                <th>Items</th>
                                                <th>Rejected Date</th>
                                                <th>Last Updated</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getRejectedTransfers().map((transfer, idx) => {
                                                const statusBadge = getTransferStatusBadge(transfer.status);
                                                const itemsCount = transfer.items ? transfer.items.length : (transfer.item_count || 0);
                                                
                                                return (
                                                    <tr key={`rejected-${transfer.transfer_id || transfer.id || idx}`}>
                                                        <td>
                                                            <strong>
                                                                {transfer.transfer_id || transfer.id || transfer.request_number || `#${idx + 1}`}
                                                            </strong>
                                                        </td>
                                                        <td>{transfer.from_location_name || getLocationName(transfer.from_location_id || transfer.request_from_location_id)}</td>
                                                        <td>{transfer.to_location_name || getLocationName(transfer.to_location_id || transfer.request_to_location_id)}</td>
                                                        <td>{itemsCount} item(s)</td>
                                                        <td>{formatDate(transfer.rejected_at || transfer.updated_at)}</td>
                                                        <td>{formatDate(transfer.updated_at || transfer.rejected_at)}</td>
                                                        <td>
                                                            <Badge bg={statusBadge.variant} style={{ padding: '0.5rem 1rem' }}>
                                                                {statusBadge.text}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setShowRejectedModal(false);
                                                                    viewTransferDetails(transfer);
                                                                }}
                                                            >
                                                                View Details
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowRejectedModal(false)}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Container>
            </div>
        </>
    );
};

export default TransferStock;
