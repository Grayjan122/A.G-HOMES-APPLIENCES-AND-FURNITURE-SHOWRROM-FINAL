'use client';
import { useState, useEffect, useMemo } from 'react';
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

const TransferRequestManagement = () => {
    // User and location state
    const [user_id, setUser_id] = useState('');
    const [currentLocationId, setCurrentLocationId] = useState('');
    const [currentLocationName, setCurrentLocationName] = useState('');

    // Transfer requests
    const [transferRequests, setTransferRequests] = useState([]);
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [filterStatus, setFilterStatus] = useState('pending'); // 'pending', 'approved', 'in_transit', 'completed', 'rejected'
    const [filterLocationFrom, setFilterLocationFrom] = useState('all'); // 'all' or specific location_id (from location)
    const [filterLocationTo, setFilterLocationTo] = useState('all'); // 'all' or specific location_id (to location)
    const [searchTerm, setSearchTerm] = useState('');
    const [locationList, setLocationList] = useState([]);

    // Modal states
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDeliverModal, setShowDeliverModal] = useState(false);
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedItemsToDeliver, setSelectedItemsToDeliver] = useState([]);
    const [driverName, setDriverName] = useState('');
    const [driverList, setDriverList] = useState([]);
    const [acceptDriverOption, setAcceptDriverOption] = useState('');
    const [deliverDriverOption, setDeliverDriverOption] = useState('');
    const [deliveryData, setDeliveryData] = useState({
        driver_name: '',
        driver_contact: '',
        vehicle_info: '',
        shipping_method: '',
        tracking_number: '',
        delivery_notes: ''
    });
    const selectedAcceptDriver = useMemo(() => {
        if (!acceptDriverOption || acceptDriverOption === 'other') return null;
        return driverList.find(driver => driver.driver_id?.toString() === acceptDriverOption.toString()) || null;
    }, [driverList, acceptDriverOption]);
    const selectedDeliverDriver = useMemo(() => {
        if (!deliverDriverOption || deliverDriverOption === 'other') return null;
        return driverList.find(driver => driver.driver_id?.toString() === deliverDriverOption.toString()) || null;
    }, [driverList, deliverDriverOption]);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [loadingTransfers, setLoadingTransfers] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userId = sessionStorage.getItem('user_id');
            const locationId = sessionStorage.getItem('location_id');
            const locationName = sessionStorage.getItem('location_name');

            setUser_id(userId);
            setCurrentLocationId(locationId);
            setCurrentLocationName(locationName || '');
        }
    }, []);

    // Fetch locations and drivers
    useEffect(() => {
        fetchLocations();
        fetchDrivers();
    }, []);

    // Fetch transfer requests
    useEffect(() => {
        if (currentLocationId) {
            fetchTransferRequests();
        }
    }, [currentLocationId, filterStatus, filterLocationFrom, filterLocationTo]);

    // Debug: Log current location and user info
    useEffect(() => {
        console.log('Transfer Request Management - Current Location:', {
            locationId: currentLocationId,
            locationName: currentLocationName,
            userId: user_id
        });
    }, [currentLocationId, currentLocationName, user_id]);

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
        }
    };

    const fetchDrivers = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
            const url = baseURL + 'delivery.php';

            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({}),
                    operation: 'GetDrivers'
                }
            });

            if (Array.isArray(response.data)) {
                setDriverList(response.data);
            } else if (response.data?.drivers) {
                setDriverList(response.data.drivers);
            } else {
                setDriverList([]);
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
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
            }

            setTransferRequests(transfers);
        } catch (error) {
            console.error('Error fetching transfer requests:', error);
            showAlertError({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load transfer requests. Please try again.',
                button: 'OK'
            });
        } finally {
            setLoadingTransfers(false);
        }
    };

    const getDriverFullName = (driver) => {
        if (!driver) return '';
        const middle = driver.nname || driver.mname || '';
        return [driver.fname, middle, driver.lname]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
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

    // Get transfer status badge
    const getTransferStatusBadge = (status) => {
        const statusLower = (status || '').toLowerCase();
        switch (statusLower) {
            case 'pending':
                return { variant: 'warning', text: 'Pending', color: '#ffc107' };
            case 'approved':
                return { variant: 'info', text: 'Approved', color: '#17a2b8' };
            case 'in_transit':
                return { variant: 'primary', text: 'In Transit', color: '#007bff' };
            case 'completed':
                return { variant: 'success', text: 'Completed', color: '#28a745' };
            case 'rejected':
                return { variant: 'danger', text: 'Rejected', color: '#dc3545' };
            default:
                return { variant: 'secondary', text: status || 'Unknown', color: '#6c757d' };
        }
    };

    // Filter transfer requests - only show pending requests
    const getFilteredTransfers = () => {
        let filtered = transferRequests;

        // Always filter to show only pending requests
        filtered = filtered.filter(transfer => {
            const status = (transfer.status || '').toLowerCase();
            return status === 'pending';
        });

        // Apply location filter (from location - requester)
        if (filterLocationFrom && filterLocationFrom !== 'all') {
            const locationId = parseInt(filterLocationFrom);
            filtered = filtered.filter(transfer => {
                const fromLocationId = transfer.request_from_location_id || transfer.from_location_id;
                return fromLocationId && parseInt(fromLocationId) === locationId;
            });
        }

        // Apply location filter (to location - provider)
        if (filterLocationTo && filterLocationTo !== 'all') {
            const locationId = parseInt(filterLocationTo);
            filtered = filtered.filter(transfer => {
                const toLocationId = transfer.request_to_location_id || transfer.to_location_id;
                return toLocationId && parseInt(toLocationId) === locationId;
            });
        }

        // Apply search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(transfer =>
                (transfer.request_number && transfer.request_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (transfer.from_location_name && transfer.from_location_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (transfer.to_location_name && transfer.to_location_name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        return filtered;
    };

    // View transfer details
    const viewTransferDetails = async (transfer) => {
        try {
            const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
            const url = baseURL + 'transferStock.php';

            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        transfer_request_id: transfer.transfer_request_id || transfer.transfer_id || transfer.id
                    }),
                    operation: 'GetTransferRequestById'
                }
            });

            if (response.data && response.data.success && response.data.transfer) {
                setSelectedTransfer(response.data.transfer);
                setShowDetailsModal(true);
            } else {
                setSelectedTransfer(transfer);
                setShowDetailsModal(true);
            }
        } catch (error) {
            console.error('Error fetching transfer details:', error);
            setSelectedTransfer(transfer);
            setShowDetailsModal(true);
        }
    };


    // Reject transfer request
    const handleReject = async () => {
        if (!selectedTransfer || !rejectionReason.trim()) {
            showAlertError({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please provide a rejection reason.',
                button: 'OK'
            });
            return;
        }

        setLoading(true);
        try {
            const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
            const url = baseURL + 'transferStock.php';

            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        transfer_request_id: selectedTransfer.transfer_request_id || selectedTransfer.transfer_id || selectedTransfer.id,
                        rejected_by: parseInt(user_id),
                        rejection_reason: rejectionReason
                    }),
                    operation: 'RejectTransferRequest'
                }
            });

            if (response.data && response.data.success) {
                const requesterName = sessionStorage.getItem('fullname') || 'Unknown User';
                const transferRequestId = selectedTransfer.transfer_request_id || selectedTransfer.transfer_id || selectedTransfer.id;
                const requestNumber = selectedTransfer.request_number || `TR-${transferRequestId}`;
                const fromLocationId = selectedTransfer.request_from_location_id || selectedTransfer.from_location_id;
                const fromLocationName = selectedTransfer.from_location_name || 'Unknown Location';

                Swal.fire({
                    icon: 'success',
                    title: 'Transfer Rejected',
                    text: 'The transfer request has been rejected.',
                    confirmButtonText: 'OK'
                });

                // Send notifications to Sales Clerk and requesting location
                if (fromLocationId) {
                    // Notification to Sales Clerk at requesting location
                    await createNotification({
                        type: 'transfer_request',
                        title: 'Transfer Request Rejected',
                        message: `Transfer request #${requestNumber} has been rejected. Reason: ${rejectionReason}`,
                        locationId: parseInt(fromLocationId),
                        targetRole: 'Sales Clerk',
                        productId: null,
                        customerId: null,
                        referenceId: transferRequestId || null
                    });

                    // Notification to Inventory Manager at requesting location (if needed)
                    await createNotification({
                        type: 'transfer_request',
                        title: 'Transfer Request Rejected',
                        message: `Transfer request #${requestNumber} from ${fromLocationName} has been rejected. Reason: ${rejectionReason}`,
                        locationId: parseInt(fromLocationId),
                        targetRole: 'Inventory Manager',
                        productId: null,
                        customerId: null,
                        referenceId: transferRequestId || null
                    });
                }

                setShowRejectModal(false);
                setShowDetailsModal(false);
                setSelectedTransfer(null);
                setRejectionReason('');
                fetchTransferRequests();
            } else {
                throw new Error(response.data?.message || 'Failed to reject transfer request');
            }
        } catch (error) {
            console.error('Error rejecting transfer:', error);
            showAlertError({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to reject transfer request. Please try again.',
                button: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    // Receive/Accept delivery at destination
    const handleReceive = async () => {
        if (!selectedTransfer) return;

        setLoading(true);
        try {
            const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
            const url = baseURL + 'transferStock.php';

            // Update transfer status to completed
            const statusResponse = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        transfer_request_id: selectedTransfer.transfer_request_id || selectedTransfer.transfer_id || selectedTransfer.id,
                        status: 'completed',
                        updated_by: parseInt(user_id),
                        notes: 'Transfer received and completed at destination'
                    }),
                    operation: 'UpdateTransferStatus'
                }
            });

            if (statusResponse.data && statusResponse.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Transfer Received!',
                    text: 'The transfer has been received and marked as completed.',
                    confirmButtonText: 'OK'
                });

                setShowReceiveModal(false);
                setShowDetailsModal(false);
                setSelectedTransfer(null);
                fetchTransferRequests();
            } else {
                throw new Error(statusResponse.data?.message || 'Failed to receive transfer');
            }
        } catch (error) {
            console.error('Error receiving transfer:', error);
            showAlertError({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to receive transfer. Please try again.',
                button: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle accept button - opens item selection modal
    const handleAccept = () => {
        if (!selectedTransfer || !selectedTransfer.items) return;
        
        // Initialize selected items with all approved items
        const itemsToSelect = (selectedTransfer.items || []).map(item => ({
            ...item,
            selected: true,
            deliver_quantity: item.approved_quantity || item.requested_quantity || item.quantity || 0
        }));
        
        setAcceptDriverOption('');
        setDriverName('');
        setSelectedItemsToDeliver(itemsToSelect);
        setShowAcceptModal(true);
    };

    // Toggle item selection
    const toggleItemSelection = (itemIndex) => {
        const updated = [...selectedItemsToDeliver];
        updated[itemIndex].selected = !updated[itemIndex].selected;
        setSelectedItemsToDeliver(updated);
    };

    // Update deliver quantity for an item
    const updateDeliverQuantity = (itemIndex, quantity) => {
        const updated = [...selectedItemsToDeliver];
        const maxQty = updated[itemIndex].approved_quantity || updated[itemIndex].requested_quantity || updated[itemIndex].quantity || 0;
        updated[itemIndex].deliver_quantity = Math.max(1, Math.min(parseInt(quantity) || 1, maxQty));
        setSelectedItemsToDeliver(updated);
    };

    const handleAcceptDriverOptionChange = (value) => {
        setAcceptDriverOption(value);
        if (value && value !== 'other') {
            const driver = driverList.find(d => d.driver_id?.toString() === value.toString());
            setDriverName(getDriverFullName(driver));
        } else {
            setDriverName('');
        }
    };

    const handleDeliverDriverOptionChange = (value) => {
        setDeliverDriverOption(value);
        if (value && value !== 'other') {
            const driver = driverList.find(d => d.driver_id?.toString() === value.toString());
            setDeliveryData(prev => ({
                ...prev,
                driver_name: getDriverFullName(driver),
                driver_contact: driver?.contact_number || ''
            }));
        } else {
            setDeliveryData(prev => ({
                ...prev,
                driver_name: '',
                driver_contact: ''
            }));
        }
    };

    // Create delivery and update status to in_transit (deliver)
    const handleDeliver = async () => {
        if (!selectedTransfer) return;

        const resolvedDriverName = (driverName || deliveryData.driver_name || '').trim();
        const resolvedDriverContact = deliveryData.driver_contact
            || (acceptDriverOption && acceptDriverOption !== 'other' ? selectedAcceptDriver?.contact_number : '')
            || (deliverDriverOption && deliverDriverOption !== 'other' ? selectedDeliverDriver?.contact_number : '');

        if (!resolvedDriverName) {
            showAlertError({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please enter the driver name.',
                button: 'OK'
            });
            return;
        }

        const selectedItems = selectedItemsToDeliver.filter(item => item.selected);
        if (selectedItems.length === 0) {
            showAlertError({
                icon: 'warning',
                title: 'No Items Selected',
                text: 'Please select at least one item to deliver.',
                button: 'OK'
            });
            return;
        }

        setLoading(true);
        try {
            const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
            const url = baseURL + 'transferStock.php';

            // Get selected items for delivery
            const items = selectedItems.map(item => ({
                product_id: item.product_id,
                quantity: item.deliver_quantity || item.approved_quantity || item.requested_quantity || item.quantity || 0
            }));

            // Create transfer delivery record
            // Use current date and time for delivery_date (datetime format)
            const now = new Date();
            const deliveryDateTime = now.toISOString().slice(0, 19).replace('T', ' '); // Format: YYYY-MM-DD HH:MM:SS
            
            const deliveryResponse = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        transfer_request_id: selectedTransfer.transfer_request_id || selectedTransfer.transfer_id || selectedTransfer.id,
                        driver_name: resolvedDriverName,
                        received_by: parseInt(user_id),
                        delivery_date: deliveryDateTime, // Send full datetime
                        delivery_notes: `Driver: ${resolvedDriverName}${resolvedDriverContact ? ` (${resolvedDriverContact})` : ''}`,
                        items: items
                    }),
                    operation: 'CreateTransferDelivery'
                }
            });

            if (deliveryResponse.data && deliveryResponse.data.success) {
                const requesterName = sessionStorage.getItem('fullname') || 'Unknown User';
                const transferRequestId = selectedTransfer.transfer_request_id || selectedTransfer.transfer_id || selectedTransfer.id;
                const requestNumber = selectedTransfer.request_number || `TR-${transferRequestId}`;
                const fromLocationId = selectedTransfer.request_from_location_id || selectedTransfer.from_location_id;
                const fromLocationName = selectedTransfer.from_location_name || 'Unknown Location';
                const itemsCount = selectedItems.length;
                const deliveryId = deliveryResponse.data.delivery_id || 'N/A';

                Swal.fire({
                    icon: 'success',
                    title: 'Transfer Delivery Created!',
                    text: `Delivery has been created successfully. Inventory has been deducted from provider location (To Location) and Transfer Out ledger entries created. Delivery ID: ${deliveryId}`,
                    confirmButtonText: 'OK'
                });

                // Send notifications to Sales Clerk and requesting location
                if (fromLocationId) {
                    // Notification to Sales Clerk at requesting location
                    await createNotification({
                        type: 'transfer_delivery',
                        title: 'Transfer Delivery Created',
                        message: `Transfer request #${requestNumber} has been accepted and delivery created. ${itemsCount} item${itemsCount > 1 ? 's' : ''} are now in transit. Driver: ${resolvedDriverName}`,
                        locationId: parseInt(fromLocationId),
                        targetRole: 'Sales Clerk',
                        productId: null,
                        customerId: null,
                        referenceId: transferRequestId || null
                    });

                    // Notification to Inventory Manager at requesting location
                    await createNotification({
                        type: 'transfer_delivery',
                        title: 'Transfer Delivery Created',
                        message: `Transfer request #${requestNumber} from ${fromLocationName} has been accepted and delivery created. ${itemsCount} item${itemsCount > 1 ? 's' : ''} are now in transit. Driver: ${resolvedDriverName}`,
                        locationId: parseInt(fromLocationId),
                        targetRole: 'Inventory Manager',
                        productId: null,
                        customerId: null,
                        referenceId: transferRequestId || null
                    });
                }

                setShowAcceptModal(false);
                setShowDeliverModal(false);
                setShowDetailsModal(false);
                setSelectedTransfer(null);
                setSelectedItemsToDeliver([]);
                setDriverName('');
                setAcceptDriverOption('');
                setDeliverDriverOption('');
                setDeliveryData({
                    driver_name: '',
                    driver_contact: '',
                    vehicle_info: '',
                    shipping_method: '',
                    tracking_number: '',
                    delivery_notes: ''
                });
                fetchTransferRequests();
            } else {
                throw new Error(deliveryResponse.data?.message || 'Failed to create transfer delivery');
            }
        } catch (error) {
            console.error('Error delivering transfer:', error);
            showAlertError({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to create transfer delivery. Please try again.',
                button: 'OK'
            });
        } finally {
            setLoading(false);
        }
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

    // Check if user can reject (all pending requests can be rejected)
    const canReject = (transfer) => {
        const status = (transfer.status || '').toLowerCase();
        return status === 'pending';
    };

    // Check if user can deliver (accept) - available regardless of location, just check status
    const canDeliver = (transfer) => {
        const status = (transfer.status || '').toLowerCase();
        // Can accept/deliver if status is approved or pending (regardless of location)
        return status === 'approved' || status === 'pending';
    };

    // Check if user can receive (must be destination location and in_transit)
    const canReceive = (transfer) => {
        if (!currentLocationId) return false;
        const toLocationId = transfer.request_to_location_id || transfer.to_location_id;
        const status = (transfer.status || '').toLowerCase();
        const canReceiveResult = toLocationId && 
               parseInt(toLocationId) === parseInt(currentLocationId) && 
               status === 'in_transit';
        console.log('canReceive check:', {
            toLocationId,
            currentLocationId,
            status,
            transferId: transfer.transfer_request_id || transfer.transfer_id,
            canReceive: canReceiveResult
        });
        return canReceiveResult;
    };

    const filteredTransfers = getFilteredTransfers();

    return (
        <>
            <div className='customer-main'>
                <Container fluid className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="mb-0">Transfer Request Management</h2>
                            <p className="text-muted mb-0" style={{ fontSize: '14px', marginTop: '4px' }}>
                                Pending transfer requests - Accept and deliver transfers
                            </p>
                        </div>
                    </div>

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
                                    Filter by Location From
                                </label>
                                <Form.Select
                                    value={filterLocationFrom}
                                    onChange={(e) => setFilterLocationFrom(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff'
                                    }}
                                >
                                    <option value="all">All Locations (From)</option>
                                    {locationList
                                        .filter(loc => loc.name !== "Warehouse")
                                        .map((loc, locIdx) => {
                                            const locId = loc.location_id || loc.id || `loc-${locIdx}`;
                                            return (
                                                <option
                                                    key={`filter-from-loc-${locId}-${locIdx}`}
                                                    value={locId}
                                                >
                                                    {loc.location_name || loc.name}
                                                    {locId === currentLocationId ? ' (Current)' : ''}
                                                </option>
                                            );
                                        })}
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
                                    Filter by Location To
                                </label>
                                <Form.Select
                                    value={filterLocationTo}
                                    onChange={(e) => setFilterLocationTo(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff'
                                    }}
                                >
                                    <option value="all">All Locations (To)</option>
                                    {locationList
                                        .filter(loc => loc.name !== "Warehouse")
                                        .map((loc, locIdx) => {
                                            const locId = loc.location_id || loc.id || `loc-${locIdx}`;
                                            return (
                                                <option
                                                    key={`filter-to-loc-${locId}-${locIdx}`}
                                                    value={locId}
                                                >
                                                    {loc.location_name || loc.name}
                                                    {locId === currentLocationId ? ' (Current)' : ''}
                                                </option>
                                            );
                                        })}
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
                                        placeholder="Search by request number or location..."
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
                    {(searchTerm || filterLocationFrom !== 'all' || filterLocationTo !== 'all') && (
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
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 8px',
                                    backgroundColor: '#fff3cd',
                                    borderRadius: '16px',
                                    fontSize: '13px',
                                    border: '1px solid #ffc107',
                                    fontWeight: '500'
                                }}>
                                    Status: Pending (Only pending requests are shown)
                                </span>

                                {filterLocationFrom !== 'all' && (
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
                                        From: {locationList.find(loc => (loc.location_id || loc.id) == filterLocationFrom)?.location_name || 'N/A'}
                                        <button
                                            type="button"
                                            onClick={() => setFilterLocationFrom('all')}
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
                                            title="Remove location from filter"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}

                                {filterLocationTo !== 'all' && (
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
                                        To: {locationList.find(loc => (loc.location_id || loc.id) == filterLocationTo)?.location_name || 'N/A'}
                                        <button
                                            type="button"
                                            onClick={() => setFilterLocationTo('all')}
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
                                            title="Remove location to filter"
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
                                        setFilterLocationFrom('all');
                                        setFilterLocationTo('all');
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
                    {loadingTransfers ? (
                        <div className="text-center p-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : filteredTransfers.length === 0 ? (
                        <Alert variant="info">
                            {searchTerm || filterLocationFrom !== 'all' || filterLocationTo !== 'all'
                                ? 'No pending transfer requests found matching your criteria.'
                                : 'No pending transfer requests found. All transfer requests have been processed.'}
                        </Alert>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Request Number</th>
                                        <th>From Location</th>
                                        <th>To Location</th>
                                        <th>Items</th>
                                        <th>Requested Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransfers.map((transfer, idx) => {
                                        const statusBadge = getTransferStatusBadge(transfer.status);
                                        const itemsCount = transfer.items ? transfer.items.length : (transfer.item_count || 0);
                                        
                                        return (
                                            <tr key={`transfer-${transfer.transfer_request_id || transfer.transfer_id || transfer.id || idx}`}>
                                                <td>
                                                    <strong>
                                                        {transfer.request_number || `TR-${transfer.transfer_request_id || transfer.transfer_id || transfer.id || idx}`}
                                                    </strong>
                                                </td>
                                                <td>{transfer.from_location_name || 'N/A'}</td>
                                                <td>{transfer.to_location_name || 'N/A'}</td>
                                                <td>{itemsCount} item(s)</td>
                                                <td>{formatDate(transfer.created_at || transfer.request_date)}</td>
                                                <td>
                                                    <Badge bg={statusBadge.variant} style={{ padding: '0.5rem 1rem' }}>
                                                        {statusBadge.text}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        onClick={() => viewTransferDetails(transfer)}
                                                    >
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Transfer Details Modal */}
                    <Modal show={showDetailsModal} onHide={() => {
                        setShowDetailsModal(false);
                        setSelectedTransfer(null);
                    }} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>Transfer Request Details</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedTransfer && (
                                <>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <p><strong>Request Number:</strong> {selectedTransfer.request_number || 'N/A'}</p>
                                            <p><strong>From Location:</strong> {selectedTransfer.from_location_name || 'N/A'}</p>
                                            <p><strong>To Location:</strong> {selectedTransfer.to_location_name || 'N/A'}</p>
                                            <p><strong>Requested By:</strong> {selectedTransfer.requested_by_name || 'N/A'}</p>
                                        </Col>
                                        <Col md={6}>
                                            <p><strong>Status:</strong>
                                                <Badge bg={getTransferStatusBadge(selectedTransfer.status).variant} className="ms-2">
                                                    {getTransferStatusBadge(selectedTransfer.status).text}
                                                </Badge>
                                            </p>
                                            <p><strong>Requested Date:</strong> {formatDate(selectedTransfer.created_at)}</p>
                                            {selectedTransfer.approved_at && (
                                                <p><strong>Approved Date:</strong> {formatDate(selectedTransfer.approved_at)}</p>
                                            )}
                                            {selectedTransfer.rejected_at && (
                                                <p><strong>Rejected Date:</strong> {formatDate(selectedTransfer.rejected_at)}</p>
                                            )}
                                        </Col>
                                    </Row>
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
                                                            <Badge bg="info">{item.requested_quantity || item.quantity || 0}</Badge>
                                                        </td>
                                                        <td>
                                                            {item.approved_quantity ? (
                                                                <Badge bg="success">{item.approved_quantity}</Badge>
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
                                            <p><strong>Rejection Reason:</strong> {selectedTransfer.rejection_reason}</p>
                                        </>
                                    )}
                                </>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => {
                                setShowDetailsModal(false);
                                setSelectedTransfer(null);
                            }}>
                                Close
                            </Button>
                            {selectedTransfer && canReject(selectedTransfer) && (
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        setShowRejectModal(true);
                                    }}
                                >
                                    Reject
                                </Button>
                            )}
                            {selectedTransfer && canDeliver(selectedTransfer) && (
                                <Button 
                                    variant="success" 
                                    onClick={handleAccept}
                                >
                                    Accept & Deliver
                                </Button>
                            )}
                            {selectedTransfer && canReceive(selectedTransfer) && (
                                <Button
                                    variant="success"
                                    onClick={() => {
                                        setShowReceiveModal(true);
                                    }}
                                >
                                    Receive
                                </Button>
                            )}
                        </Modal.Footer>
                    </Modal>

                    {/* Reject Modal */}
                    <Modal show={showRejectModal} onHide={() => {
                        setShowRejectModal(false);
                        setSelectedTransfer(null);
                        setRejectionReason('');
                    }}>
                        <Modal.Header closeButton>
                            <Modal.Title>Reject Transfer Request</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Please provide a reason for rejecting this transfer request:</p>
                            <Form.Group className="mb-3">
                                <Form.Label>Rejection Reason</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter rejection reason..."
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => {
                                setShowRejectModal(false);
                                setSelectedTransfer(null);
                                setRejectionReason('');
                            }}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleReject} disabled={loading || !rejectionReason.trim()}>
                                {loading ? 'Rejecting...' : 'Reject'}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Deliver Modal */}
                    <Modal show={showDeliverModal} onHide={() => {
                        setShowDeliverModal(false);
                        setSelectedTransfer(null);
                        setDeliverDriverOption('');
                        setDeliveryData({
                            driver_name: '',
                            driver_contact: '',
                            vehicle_info: '',
                            shipping_method: '',
                            tracking_number: '',
                            delivery_notes: ''
                        });
                    }} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>Create Transfer Delivery</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedTransfer && (
                                <>
                                    <Alert variant="info" className="mb-3">
                                        <strong>Transfer Request:</strong> {selectedTransfer.request_number || 'N/A'}<br />
                                        <strong>From:</strong> {selectedTransfer.from_location_name || 'N/A'}<br />
                                        <strong>To:</strong> {selectedTransfer.to_location_name || 'N/A'}
                                    </Alert>
                                    
                                    {selectedTransfer.items && selectedTransfer.items.length > 0 && (
                                        <div className="mb-3">
                                            <h6>Items to Deliver:</h6>
                                            <div className="table-responsive">
                                                <table className="table table-sm table-bordered">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Product</th>
                                                            <th>Approved Qty</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedTransfer.items.map((item, idx) => (
                                                            <tr key={`deliver-item-${idx}`}>
                                                                <td>{item.product_name || item.description || item.product_id}</td>
                                                                <td>
                                                                    <Badge bg="success">
                                                                        {item.approved_quantity || item.requested_quantity || item.quantity || 0}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Select Driver</Form.Label>
                                    <Form.Select
                                        value={deliverDriverOption}
                                        onChange={(e) => handleDeliverDriverOptionChange(e.target.value)}
                                    >
                                        <option value="">Choose driver...</option>
                                        {driverList.map((driver) => (
                                            <option key={`deliver-driver-${driver.driver_id}`} value={driver.driver_id}>
                                                {getDriverFullName(driver)}{driver.contact_number ? ` (${driver.contact_number})` : ''}
                                            </option>
                                        ))}
                                        <option value="other">Other (Enter manually)</option>
                                    </Form.Select>
                                </Form.Group>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Driver Name <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={deliveryData.driver_name}
                                                onChange={(e) => setDeliveryData({ ...deliveryData, driver_name: e.target.value })}
                                                placeholder="Enter driver name"
                                                required
                                                disabled={deliverDriverOption && deliverDriverOption !== 'other'}
                                            />
                                            {deliverDriverOption && deliverDriverOption !== 'other' && (
                                                <Form.Text muted>
                                                    Contact: {selectedDeliverDriver?.contact_number || 'N/A'}
                                                </Form.Text>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Driver Contact</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={deliveryData.driver_contact}
                                                onChange={(e) => setDeliveryData({ ...deliveryData, driver_contact: e.target.value })}
                                                placeholder="Enter contact number"
                                                disabled={deliverDriverOption && deliverDriverOption !== 'other'}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Vehicle Info</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={deliveryData.vehicle_info}
                                                onChange={(e) => setDeliveryData({ ...deliveryData, vehicle_info: e.target.value })}
                                                placeholder="Enter vehicle information"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Shipping Method</Form.Label>
                                            <Form.Select
                                                value={deliveryData.shipping_method}
                                                onChange={(e) => setDeliveryData({ ...deliveryData, shipping_method: e.target.value })}
                                            >
                                                <option value="">Select method...</option>
                                                <option value="Truck">Truck</option>
                                                <option value="Van">Van</option>
                                                <option value="Courier">Courier</option>
                                                <option value="Other">Other</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tracking Number (Optional)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={deliveryData.tracking_number}
                                        onChange={(e) => setDeliveryData({ ...deliveryData, tracking_number: e.target.value })}
                                        placeholder="Enter tracking number"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Delivery Notes (Optional)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={deliveryData.delivery_notes}
                                        onChange={(e) => setDeliveryData({ ...deliveryData, delivery_notes: e.target.value })}
                                        placeholder="Enter delivery notes"
                                    />
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => {
                                setShowDeliverModal(false);
                                setSelectedTransfer(null);
                                setDeliverDriverOption('');
                                setDeliveryData({
                                    driver_name: '',
                                    driver_contact: '',
                                    vehicle_info: '',
                                    shipping_method: '',
                                    tracking_number: '',
                                    delivery_notes: ''
                                });
                            }}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleDeliver} disabled={loading || !deliveryData.driver_name.trim()}>
                                {loading ? 'Creating Delivery...' : 'Create Delivery'}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Receive Modal */}
                    <Modal show={showReceiveModal} onHide={() => {
                        setShowReceiveModal(false);
                        setSelectedTransfer(null);
                    }} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>Receive Transfer Delivery</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Alert variant="info" className="mb-3">
                                <p>Are you sure you want to receive this transfer delivery?</p>
                                {selectedTransfer && (
                                    <div>
                                        <p><strong>Request Number:</strong> {selectedTransfer.request_number || 'N/A'}</p>
                                        <p><strong>From:</strong> {selectedTransfer.from_location_name || 'N/A'}</p>
                                        <p><strong>To:</strong> {selectedTransfer.to_location_name || 'N/A'}</p>
                                    </div>
                                )}
                            </Alert>
                            
                            {selectedTransfer && selectedTransfer.items && selectedTransfer.items.length > 0 && (
                                <div>
                                    <h6>Items to Receive:</h6>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Approved Qty</th>
                                                    <th>Delivered Qty</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedTransfer.items.map((item, idx) => (
                                                    <tr key={`receive-item-${idx}`}>
                                                        <td>{item.product_name || item.description || item.product_id}</td>
                                                        <td>
                                                            <Badge bg="success">
                                                                {item.approved_quantity || item.requested_quantity || item.quantity || 0}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Badge bg="primary">
                                                                {item.delivered_quantity || item.approved_quantity || item.requested_quantity || item.quantity || 0}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Alert variant="warning" className="mt-2">
                                        <small>Receiving this transfer will mark it as completed and update inventory.</small>
                                    </Alert>
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => {
                                setShowReceiveModal(false);
                                setSelectedTransfer(null);
                            }}>
                                Cancel
                            </Button>
                            <Button variant="success" onClick={handleReceive} disabled={loading}>
                                {loading ? 'Receiving...' : '✓ Receive Transfer'}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Accept & Deliver Modal - Item Selection and Driver Name */}
                    <Modal show={showAcceptModal} onHide={() => {
                        setShowAcceptModal(false);
                        setSelectedItemsToDeliver([]);
                        setDriverName('');
                        setAcceptDriverOption('');
                    }} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>Accept & Deliver Transfer</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedTransfer && (
                                <>
                                    <Alert variant="info" className="mb-3">
                                        <strong>Transfer Request:</strong> {selectedTransfer.request_number || 'N/A'}<br />
                                        <strong>From:</strong> {selectedTransfer.from_location_name || 'N/A'}<br />
                                        <strong>To:</strong> {selectedTransfer.to_location_name || 'N/A'}
                                    </Alert>
                                    
                                    <h6 className="mb-3">Select Items to Deliver:</h6>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: '50px' }}>Select</th>
                                                    <th>Product Name</th>
                                                    <th>Approved Qty</th>
                                                    <th>Deliver Qty</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedItemsToDeliver.map((item, idx) => {
                                                    const maxQty = item.approved_quantity || item.requested_quantity || item.quantity || 0;
                                                    return (
                                                        <tr key={`accept-item-${idx}`}>
                                                            <td>
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    checked={item.selected || false}
                                                                    onChange={() => toggleItemSelection(idx)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <strong>{item.product_name || item.description || item.product_id}</strong>
                                                            </td>
                                                            <td>
                                                                <Badge bg="success">{maxQty}</Badge>
                                                            </td>
                                                            <td>
                                                                <Form.Control
                                                                    type="number"
                                                                    min="1"
                                                                    max={maxQty}
                                                                    value={item.deliver_quantity || maxQty}
                                                                    onChange={(e) => updateDeliverQuantity(idx, e.target.value)}
                                                                    disabled={!item.selected}
                                                                    style={{ width: '100px' }}
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    <hr />

                                    <Form.Group className="mb-3">
                                        <Form.Label>Select Driver</Form.Label>
                                        <Form.Select
                                            value={acceptDriverOption}
                                            onChange={(e) => handleAcceptDriverOptionChange(e.target.value)}
                                        >
                                            <option value="">Choose driver...</option>
                                            {driverList.map((driver) => (
                                                <option key={`accept-driver-${driver.driver_id}`} value={driver.driver_id}>
                                                    {getDriverFullName(driver)}{driver.contact_number ? ` (${driver.contact_number})` : ''}
                                                </option>
                                            ))}
                                            <option value="other">Other (Enter manually)</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Driver Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={driverName}
                                            onChange={(e) => setDriverName(e.target.value)}
                                            placeholder="Enter driver name"
                                            required
                                            disabled={acceptDriverOption && acceptDriverOption !== 'other'}
                                        />
                                        {acceptDriverOption && acceptDriverOption !== 'other' && (
                                            <Form.Text muted>
                                                Contact: {selectedAcceptDriver?.contact_number || 'N/A'}
                                            </Form.Text>
                                        )}
                                    </Form.Group>

                                    <Alert variant="warning" className="mt-3">
                                        <small>
                                            <strong>Note:</strong> Only selected items will be delivered. Make sure to select items and enter driver name before proceeding.
                                        </small>
                                    </Alert>
                                </>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => {
                                setShowAcceptModal(false);
                                setSelectedItemsToDeliver([]);
                                setDriverName('');
                                setAcceptDriverOption('');
                            }}>
                                Cancel
                            </Button>
                            <Button 
                                variant="success" 
                                onClick={handleDeliver} 
                                disabled={loading || !driverName.trim() || selectedItemsToDeliver.filter(item => item.selected).length === 0}
                            >
                                {loading ? 'Delivering...' : '✓ Proceed Deliver'}
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Container>
            </div>
        </>
    );
};

export default TransferRequestManagement;

