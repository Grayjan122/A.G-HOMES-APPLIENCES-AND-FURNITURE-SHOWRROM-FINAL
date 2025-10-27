'use client';
import axios from 'axios';
import { useState, useEffect, useMemo } from 'react';
import "../../css/inventory-css/inventory.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const ITEMS_PER_PAGE = 9;
const ITEMS_PER_PAGE_MODAL = 5;

const DeliveryCustomizeWR = () => {
    const [customizeDeliveryList, setCustomizeDeliveryList] = useState([]);
    const [normalDeliveryList, setNormalDeliveryList] = useState([]);
    const [requestList, setRequestList] = useState([]);
    const [semiDetails, setSemiDetails] = useState([]);
    const [fullDetails, setFullDetails] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const [userList, setUserList] = useState([]);

    const [deliveryTypeFilter, setDeliveryTypeFilter] = useState('all');
    const [deliverToFilter, setDeliverToFilter] = useState('');
    const [driverFilter, setDriverFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageModal, setCurrentPageModal] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [deliveryDetails, setDeliveryDetails] = useState([]);
    const [modalType, setModalType] = useState('');

    const [alert, setAlert] = useState({ show: false, message: '', variant: '', bg: '' });
    const [dateAndTime, setDateAndTime] = useState(null);
    const [reqDateTime, setReqDateTime] = useState("");

    const formatDate = (dateStr) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const [year, month, day] = dateStr.split('-');
        const monthName = months[parseInt(month) - 1];
        const dayNum = parseInt(day);
        return `${monthName} ${dayNum} ${year}`;
    };

    const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes}${period}`;
    };

    useEffect(() => {
        const savedFilter = sessionStorage.getItem('deliveryPageFilter');
        if (savedFilter) {
            try {
                const filterConfig = JSON.parse(savedFilter);
                if (filterConfig.statusFilter) setStatusFilter(filterConfig.statusFilter);
                if (filterConfig.deliverToFilter) setDeliverToFilter(filterConfig.deliverToFilter);
                if (filterConfig.driverFilter) setDriverFilter(filterConfig.driverFilter);
                if (filterConfig.searchFilter) setSearchFilter(filterConfig.searchFilter);
                if (filterConfig.deliveryTypeFilter) setDeliveryTypeFilter(filterConfig.deliveryTypeFilter);
                sessionStorage.removeItem('deliveryPageFilter');
            } catch (error) {
                console.error('Error parsing delivery filter config:', error);
                sessionStorage.removeItem('deliveryPageFilter');
            }
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [deliverToFilter, driverFilter, statusFilter, searchFilter, deliveryTypeFilter]);

    const fetchAllData = async () => {
        await Promise.all([
            fetchCustomizeDeliveryList(),
            fetchNormalDeliveryList(),
            fetchRequestList(),
            fetchSemiDetails(),
            fetchFullDetails(),
            fetchLocations(),
            fetchUsers()
        ]);
    };

    const fetchCustomizeDeliveryList = async () => {
        const locationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        try {
            const response = await fetch(`${baseURL}customizeProducts.php?json=${encodeURIComponent(JSON.stringify({ locID: locationID, deliverType: 'deliverFrom' }))}&operation=GetCustomizeDeliver`);
            const data = await response.json();
            const filtered = data.filter(item =>
                item.status === "On Delivery" || item.status === "Delivered"
            );
            setCustomizeDeliveryList(filtered);
        } catch (error) {
            console.error("Error fetching customize delivery list:", error);
        }
    };

    const fetchNormalDeliveryList = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const locationID = (sessionStorage.getItem('location_id'));
        const ID = {
            locID: locationID
        }
        console.log(ID);

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetReqDelivery"
                }
            });
            setNormalDeliveryList(response.data);
            // console.log(response.data + locationID);

        } catch (error) {
            console.error("Error fetching normal delivery list:", error);
        }
    };

    const GetStatsAndDate = async (stats, CR_ID) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const ID = {
            stats: stats,
            CD_ID: CR_ID
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetTheStatusDate"
                }
            });
            const formattedDate = formatDate(response.data[0].date);
            const formattedTime = formatTime(response.data[0].time);
            setDateAndTime(`${formattedDate}, ${formattedTime}`);
        } catch (error) {
            console.error("Error fetching status date:", error);
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
                setReqDateTime(formatDate(response.data[0].date) + " • " + formatTime(response.data[0].time));
            }
        } catch (error) {
            console.error("Error fetching request data:", error);
        }
    };

    const fetchRequestList = async () => {
        const locationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        try {
            const response = await fetch(`${baseURL}customizeProducts.php?json=${encodeURIComponent(JSON.stringify({ locID: locationID }))}&operation=GetCustomizeRequest`);
            const data = await response.json();
            setRequestList(data);
        } catch (error) {
            console.error("Error fetching request list:", error);
        }
    };

    const fetchSemiDetails = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        try {
            const response = await fetch(`${baseURL}customizeProducts.php?json=${encodeURIComponent(JSON.stringify([]))}&operation=GetCustomizeRequestDetailSemi`);
            const data = await response.json();
            setSemiDetails(data);
        } catch (error) {
            console.error("Error fetching semi details:", error);
        }
    };

    const fetchFullDetails = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        try {
            const response = await fetch(`${baseURL}customizeProducts.php?json=${encodeURIComponent(JSON.stringify([]))}&operation=GetCustomizeRequestDetailFull`);
            const data = await response.json();
            setFullDetails(data);
        } catch (error) {
            console.error("Error fetching full details:", error);
        }
    };

    const fetchLocations = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        try {
            const response = await fetch(`${baseURL}location.php?json=${encodeURIComponent(JSON.stringify([]))}&operation=GetLocation`);
            const data = await response.json();
            setLocationList(data);
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    const fetchUsers = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        try {
            const response = await fetch(`${baseURL}users.php?json=${encodeURIComponent(JSON.stringify([]))}&operation=GetUsers`);
            const data = await response.json();
            setUserList(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const GetNormalDeliveryDetails = async (transaction_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            reqID: transaction_id
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequestDetails"
                }
            });
            setDeliveryDetails(response.data);
        } catch (error) {
            console.error("Error fetching delivery details:", error);
        }
    };

    const getRequestInfo = (customizeRequestId) => {
        return requestList.find(req => req.customize_req_id === customizeRequestId) || {};
    };

    const getDeliveryDetailsBySalesId = (customizeSalesId) => {
        const semi = semiDetails.filter(item => item.customize_sales_id === customizeSalesId);
        const full = fullDetails.filter(item => item.customize_sales_id === customizeSalesId);

        const semiMapped = semi.map(item => ({
            type: 'Semi-Customized',
            baseProductId: item.product_name || item.baseProduct_id,  // Include product_name
            description: item.description || 'N/A',  // Include description from products table
            modifications: item.modifications || 'N/A',
            qty: item.qty
        }));

        const fullMapped = full.map(item => ({
            type: 'Full-Customized',
            description: item.description || 'N/A',
            additionalDescription: item.additional_description || 'N/A',
            qty: item.qty
        }));

        return { semi: semiMapped, full: fullMapped };
    };

    const filteredData = useMemo(() => {
        let filtered = [];

        if (deliveryTypeFilter === 'all' || deliveryTypeFilter === 'customize') {
            const customizeWithType = customizeDeliveryList.map(item => ({
                ...item,
                deliveryType: 'customize'
            }));
            filtered = [...filtered, ...customizeWithType];
        }

        if (deliveryTypeFilter === 'all' || deliveryTypeFilter === 'normal') {
            const normalWithType = normalDeliveryList.map(item => ({
                ...item,
                deliveryType: 'normal'
            }));
            filtered = [...filtered, ...normalWithType];
        }

        // Sort by date - oldest to newest
        filtered.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });

        if (deliverToFilter) {
            filtered = filtered.filter(item => {
                if (item.deliveryType === 'customize') {
                    return item.deliver_to?.toString() === deliverToFilter.toString();
                } else {
                    return item.request_from?.toString() === deliverToFilter.toString();
                }
            });
        }

        if (driverFilter) {
            filtered = filtered.filter(item => {
                if (item.deliveryType === 'customize') {
                    return item.done_by?.toString() === driverFilter.toString();
                } else {
                    // For normal deliveries, compare driverName with the full name from userList
                    const selectedDriver = userList.find(user => user.account_id?.toString() === driverFilter.toString());
                    if (selectedDriver) {
                        const driverFullName = `${selectedDriver.fname} ${selectedDriver.mname} ${selectedDriver.lname}`.trim();
                        return item.driverName?.toLowerCase().includes(driverFullName.toLowerCase()) || 
                               driverFullName.toLowerCase().includes(item.driverName?.toLowerCase() || '');
                    }
                    return false;
                }
            });
        }

        if (statusFilter) {
            filtered = filtered.filter(item => {
                if (item.deliveryType === 'customize') {
                    return item.status === statusFilter;
                } else {
                    return item.delivery_status === statusFilter;
                }
            });
        }

        if (searchFilter.trim()) {
            const searchTerm = searchFilter.toLowerCase();
            filtered = filtered.filter(item => {
                if (item.deliveryType === 'customize') {
                    const requestInfo = getRequestInfo(item.customize_request_id);
                    return (
                        item.deliver_customize_id?.toString().includes(searchTerm) ||
                        item.customize_request_id?.toString().includes(searchTerm) ||
                        item.DeliverTo?.toLowerCase().includes(searchTerm) ||
                        item.driver?.toLowerCase().includes(searchTerm) ||
                        requestInfo.invoice_id?.toString().includes(searchTerm)
                    );
                } else {
                    return (
                        item.request_stock_id?.toString().includes(searchTerm) ||
                        item.location_name?.toLowerCase().includes(searchTerm) ||
                        item.reqFrom?.toLowerCase().includes(searchTerm) ||
                        item.driverName?.toLowerCase().includes(searchTerm)
                    );
                }
            });
        }

        return filtered;
    }, [customizeDeliveryList, normalDeliveryList, deliveryTypeFilter, deliverToFilter, driverFilter, statusFilter, searchFilter, requestList, userList]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const currentItems = filteredData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const totalPagesModal = useMemo(() => {
        if (modalType === 'normal' && Array.isArray(deliveryDetails)) {
            return Math.ceil(deliveryDetails.length / ITEMS_PER_PAGE_MODAL);
        }
        return 1;
    }, [deliveryDetails, modalType]);

    const currentItemsModal = useMemo(() => {
        if (modalType === 'normal' && Array.isArray(deliveryDetails)) {
            return deliveryDetails.slice(
                (currentPageModal - 1) * ITEMS_PER_PAGE_MODAL,
                currentPageModal * ITEMS_PER_PAGE_MODAL
            );
        }
        return deliveryDetails || [];
    }, [deliveryDetails, currentPageModal, modalType]);

    const handleViewDetails = async (delivery) => {
        if (delivery.deliveryType === 'customize') {
            const requestInfo = getRequestInfo(delivery.customize_request_id);
            // Use customize_sales_id from delivery object directly, or fall back to requestInfo
            const customizeSalesId = delivery.customize_sales_id || requestInfo.customize_sales_id;
            const details = getDeliveryDetailsBySalesId(customizeSalesId);
            await GetStatsAndDate(delivery.status, delivery.customize_request_id);
            
            console.log('Customize Sales ID:', customizeSalesId);
            console.log('Details:', details);
            
            setSelectedDelivery({
                ...delivery,
                requestInfo
            });
            setDeliveryDetails(details);
            setModalType('customize');
        } else {
            await GetNormalDeliveryDetails(delivery.request_stock_id);
            await GetTrackRequestTimeandDate(delivery.request_stock_id, delivery.delivery_status);
            setSelectedDelivery(delivery);
            setModalType('normal');
        }
        setCurrentPageModal(1);
        setShowModal(true);
    };

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

    const handleMarkComplete = async () => {
        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL');

        if (modalType === 'customize') {
            const url = baseURL + 'customizeProducts.php';
            const ID = {
                customizeID: selectedDelivery.customize_request_id,
                accID: accountID
            };

            try {
                const response = await axios.get(url, {
                    params: {
                        json: JSON.stringify(ID),
                        operation: "MarkAsCompleteCustomize",
                    }
                });

                if (response.data === 'Success') {
                    AlertSucces(
                        "The delivery is now complete!",
                        "success",
                        true,
                        'Good'
                    );
                    setShowModal(false);
                    fetchAllData();
                    const name = sessionStorage.getItem('fullname');
                    // Send notification to the requesting location (Sales Clerk)
                    await createNotification({
                        type: 'delivery',
                        title: 'Delivery Completed',
                        message: `Customize request #${selectedDelivery.customize_request_id} has been marked as completed by ${name}.`,
                        locationId: selectedDelivery.deliver_to, // Requesting location (store)
                        targetRole: 'Sales Clerk',
                        productId: null,
                        customerId: null,
                        referenceId: selectedDelivery.customize_request_id
                    });
                } else {
                    showAlertError({
                        icon: "error",
                        title: "Something Went Wrong!",
                        text: 'Failed to mark the delivery complete!',
                        button: 'Try Again'
                    });
                }
            } catch (error) {
                console.error("Error marking complete:", error);
                showAlertError({
                    icon: "error",
                    title: "Error!",
                    text: 'Error occurred while updating delivery status!',
                    button: 'OK'
                });
            }
        } else {
            const url = baseURL + 'delivery.php';
            const ID = {
                reqID: selectedDelivery.request_stock_id,
                accID: accountID,
            };

            try {
                const response = await axios.get(url, {
                    params: {
                        json: JSON.stringify(ID),
                        operation: "MarkComplete"
                    }
                });

                if (response.data === 'Success') {
                    AlertSucces(
                        "The delivery is now complete!",
                        "success",
                        true,
                        'Good'
                    );
                    setShowModal(false);
                    fetchAllData();
                    const name = sessionStorage.getItem('fullname');
                    // Send notification to the requesting location (Inventory Manager)
                    await createNotification({
                        type: 'delivery',
                        title: 'Delivery Completed',
                        message: `Stock request #${selectedDelivery.request_stock_id} has been marked as completed by ${name}.`,
                        locationId: selectedDelivery.request_from, // Requesting location (store)
                        targetRole: 'Inventory Manager',
                        productId: null,
                        customerId: null,
                        referenceId: selectedDelivery.request_stock_id
                    });
                } else {
                    showAlertError({
                        icon: "error",
                        title: "Something Went Wrong!",
                        text: 'Failed to mark the delivery complete!',
                        button: 'Try Again'
                    });
                }
            } catch (error) {
                console.error("Error marking complete:", error);
                showAlertError({
                    icon: "error",
                    title: "Error!",
                    text: 'Error occurred while updating delivery status!',
                    button: 'OK'
                });
            }
        }
    };

    const clearAllFilters = () => {
        setDeliveryTypeFilter('all');
        setDeliverToFilter('');
        setDriverFilter('');
        setStatusFilter('');
        setSearchFilter('');
        setCurrentPage(1);
    };

    const getLocationName = (id) => {
        const location = locationList.find(loc => loc.location_id?.toString() === id?.toString());
        return location ? location.location_name : '';
    };

    const getDriverName = (driverNameOrId) => {
        // For normal deliveries, driverNameOrId is the actual driver name
        // For customize deliveries, we need to look it up
        if (typeof driverNameOrId === 'string') {
            return driverNameOrId;
        }
        const driver = userList.find(user => user.account_id?.toString() === driverNameOrId?.toString());
        return driver ? `${driver.fname} ${driver.mname} ${driver.lname}`.trim() : 'Unknown';
    };

    const getStatus = (item) => {
        return item.deliveryType === 'customize' ? item.status : item.delivery_status;
    };

    const getDeliverTo = (item) => {
        return item.deliveryType === 'customize' ? item.DeliverTo : item.reqFrom;
    };

    const getDriver = (item) => {
        if (item.deliveryType === 'customize') {
            return item.driver;
        } else {
            // Use driverName directly from the database
            return item.driverName || 'Not Assigned';
        }
    };

    const getDeliveryId = (item) => {
        return item.deliveryType === 'customize' ? item.customize_request_id : item.request_stock_id;
    };

    return (
        <>
            <Alert
                variant={alert.variant}
                show={alert.show}
                style={{
                    backgroundColor: alert.bg,
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 9999
                }}
            >
                {alert.message}
            </Alert>

            <Modal show={showModal} onHide={() => setShowModal(false)} size='xl' className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Delivery Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    {selectedDelivery && modalType === 'customize' && (
                        <>
                            <div className="r-details-head">
                                <div className='r-d-div'>
                                    <div className='r-1'><strong>REQUEST ID:</strong> {selectedDelivery.customize_request_id}</div>
                                    <div><strong>REQUEST DATE:</strong> {formatDate(selectedDelivery.date)}</div>
                                </div>
                                <div><strong>DELIVERY ID:</strong> {selectedDelivery.deliver_customize_id}</div>
                                <div><strong>DELIVER TO:</strong> {selectedDelivery.DeliverTo}</div>
                                <div><strong>DELIVER FROM:</strong> {selectedDelivery.DeliverFrom}</div>
                                <div><strong>REQUEST BY:</strong> {selectedDelivery.doneLname + ', ' + selectedDelivery.doneFname + ' ' + selectedDelivery.doneMname}</div>
                                <div><strong>DRIVER:</strong> {selectedDelivery.driver}</div>
                                <div><strong>STATUS:</strong>
                                    <span style={{
                                        marginLeft: '8px',
                                        color: selectedDelivery.status === "Delivered" ? "green" : "goldenrod",
                                        fontWeight: 'bold'
                                    }}>
                                        {selectedDelivery.status} | {dateAndTime}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                                <div style={{ flex: 1, padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
                                    <div style={{ fontSize: '14px', color: '#856404', marginBottom: '5px' }}>Semi-Customized Items</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>{deliveryDetails.semi?.length || 0}</div>
                                </div>
                                <div style={{ flex: 1, padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px', border: '1px solid #17a2b8' }}>
                                    <div style={{ fontSize: '14px', color: '#0c5460', marginBottom: '5px' }}>Full-Customized Items</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0c5460' }}>{deliveryDetails.full?.length || 0}</div>
                                </div>
                                <div style={{ flex: 1, padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px', border: '1px solid #28a745' }}>
                                    <div style={{ fontSize: '14px', color: '#155724', marginBottom: '5px' }}>Total Items</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
                                        {(deliveryDetails.semi?.length || 0) + (deliveryDetails.full?.length || 0)}
                                    </div>
                                </div>
                            </div>

                            <div style={{ border: '1px solid #ddd', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '500px', marginTop: '20px' }}>
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {(() => {
                                        // Combine semi and full items into one array
                                        const allItems = [
                                            ...(deliveryDetails.semi || []).map(item => ({
                                                type: 'Semi-Customized',
                                                baseProductId: item.baseProductId,
                                                description: item.description || 'N/A',
                                                additionalDescription: item.modifications || 'No modifications',
                                                qty: item.qty
                                            })),
                                            ...(deliveryDetails.full || []).map(item => ({
                                                type: 'Full-Customized',
                                                baseProductId: null,
                                                description: item.description || 'N/A',
                                                additionalDescription: item.additionalDescription || 'N/A',
                                                qty: item.qty
                                            }))
                                        ];

                                        // Calculate pagination for combined items
                                        const startIndex = (currentPageModal - 1) * ITEMS_PER_PAGE_MODAL;
                                        const paginatedItems = allItems.slice(startIndex, startIndex + ITEMS_PER_PAGE_MODAL);

                                        return allItems.length > 0 ? (
                                            <table className='table table-bordered' style={{ marginBottom: 0 }}>
                                                <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1 }}>
                                                    <tr>
                                                        <th style={{ width: '15%' }}>Type</th>
                                                        <th style={{ width: '15%' }}>Base Product Code</th>
                                                        <th style={{ width: '35%' }}>Description</th>
                                                        <th style={{ width: '25%' }}>Additional Description</th>
                                                        <th style={{ width: '10%', textAlign: 'center' }}>Quantity</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedItems.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>
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
                                                            <td style={{ fontWeight: '500' }}>{item.baseProductId || 'N/A'}</td>
                                                            <td>{item.description}</td>
                                                            <td>{item.additionalDescription || 'N/A'}</td>
                                                            <td style={{ textAlign: 'center', fontWeight: '500', fontSize: '16px' }}>{item.qty || 0}</td>
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
                                        const allItems = [
                                            ...(deliveryDetails.semi || []),
                                            ...(deliveryDetails.full || [])
                                        ];
                                        const totalPagesCustomize = Math.ceil(allItems.length / ITEMS_PER_PAGE_MODAL);

                                        return totalPagesCustomize > 1 ? (
                                            <CustomPagination
                                                currentPage={currentPageModal}
                                                totalPages={totalPagesCustomize}
                                                onPageChange={setCurrentPageModal}
                                                color="green"
                                            />
                                        ) : (
                                            <div style={{ height: '40px' }}></div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </>
                    )}

                    {selectedDelivery && modalType === 'normal' && (
                        <>
                            <div className="r-details-head">
                                <div className='r-d-div'>
                                    {/* <div className='r-1'><strong>REQUEST ID:</strong> {selectedDelivery.request_stock_id}</div> */}
                                    <div className='r-1'><strong>REQUEST ID:</strong> {selectedDelivery.request_stock_id}</div>
                                    <div><strong>REQUEST DATE:</strong> {formatDate(selectedDelivery.date)}</div>


                                </div>
                                <div><strong>DELIVERY ID:</strong> {selectedDelivery.r_deliver_id}</div>
                                <div><strong>DELIVER TO:</strong> {selectedDelivery.reqFrom}</div>
                                <div><strong>DELIVER FROM:</strong> {selectedDelivery.reqTo}</div>
                                <div><strong>REQUEST BY:</strong> {`${selectedDelivery.firstName || ''} ${selectedDelivery.middleName || ''} ${selectedDelivery.lastName || ''}`.trim()}</div>
                                <div><strong>DRIVER:</strong> {selectedDelivery.driverName || 'Not Assigned'}</div>
                                <div><strong>STATUS:</strong>
                                    <span style={{
                                        marginLeft: '8px',
                                        color: selectedDelivery.delivery_status === "Delivered"
                                            ? "green"
                                            : selectedDelivery.delivery_status === "On Delivery"
                                                ? "goldenrod"
                                                : "black",
                                        fontWeight: 'bold'
                                    }}>
                                        {selectedDelivery.delivery_status} | {reqDateTime}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                                <div style={{ flex: 1, padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px', border: '1px solid #28a745' }}>
                                    <div style={{ fontSize: '14px', color: '#155724', marginBottom: '5px' }}>Total Products</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>{deliveryDetails.length}</div>
                                </div>
                                <div style={{ flex: 1, padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px', border: '1px solid #17a2b8' }}>
                                    <div style={{ fontSize: '14px', color: '#0c5460', marginBottom: '5px' }}>Total Quantity</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0c5460' }}>
                                        {deliveryDetails.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0)}
                                    </div>
                                </div>
                            </div>

                            <div className='tableContainer' style={{ height: '40vh', overflowY: 'auto', marginTop: '20px' }}>
                                {deliveryDetails && deliveryDetails.length > 0 ? (
                                    <>
                                        <h6 style={{ padding: '10px', backgroundColor: '#d4edda', margin: 0, fontWeight: 'bold', color: '#155724' }}>
                                            Normal Stock Items ({deliveryDetails.length})
                                        </h6>
                                        <table className='table table-bordered'>
                                            <thead style={{ backgroundColor: '#f8f9fa' }}>
                                                <tr>
                                                    <th style={{ width: '25%' }}>Product Code</th>
                                                    <th style={{ width: '60%' }}>Product Description</th>
                                                    <th style={{ width: '15%', textAlign: 'center' }}>Quantity</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItemsModal.map((p, i) => (
                                                    <tr key={i}>
                                                        <td style={{ fontWeight: '500' }}>{p.product_name}</td>
                                                        <td>{p.description}</td>
                                                        <td style={{ textAlign: 'center', fontWeight: '500', fontSize: '16px' }}>{p.qty}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                ) : (
                                    <div style={{ textAlign: "center", padding: "30px", fontStyle: "italic", color: '#666' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
                                        <div style={{ fontSize: '16px' }}>No delivery items found</div>
                                    </div>
                                )}
                            </div>

                            {modalType === 'normal' && totalPagesModal > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                                    <CustomPagination
                                        currentPage={currentPageModal}
                                        totalPages={totalPagesModal}
                                        onPageChange={setCurrentPageModal}
                                        color="green"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    {selectedDelivery && (
                        (modalType === 'customize' && selectedDelivery.status === 'Delivered') ||
                        (modalType === 'normal' && selectedDelivery.delivery_status === 'Delivered')
                    ) && (
                            <Button variant="primary" onClick={handleMarkComplete}>
                                Mark Complete
                            </Button>
                        )}
                </Modal.Footer>
            </Modal>

            <div className='dash-main' style={{ overflowY: 'auto' }}>
                <div className='customer-header'>
                    <h1 className='h-customer'>DELIVERY MANAGEMENT</h1>
                </div>

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
                                Delivery Type
                            </label>
                            <select
                                value={deliveryTypeFilter}
                                onChange={(e) => setDeliveryTypeFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="all">All Deliveries</option>
                                <option value="normal">Normal Stock</option>
                                <option value="customize">Customized</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Deliver To
                            </label>
                            <select
                                value={deliverToFilter}
                                onChange={(e) => setDeliverToFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Locations</option>
                                {locationList.map((location) => (
                                    <option key={location.location_id} value={location.location_id}>
                                        {location.location_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Driver
                            </label>
                            <select
                                value={driverFilter}
                                onChange={(e) => setDriverFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Drivers</option>
                                {userList
                                    .filter(user => user.role_name?.toLowerCase() === 'driver')
                                    .map((driver) => (
                                        <option key={driver.account_id} value={driver.account_id}>
                                            {`${driver.fname} ${driver.mname} ${driver.lname}`.trim()}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Status</option>
                                <option value="On Delivery">On Delivery</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Search Deliveries
                            </label>
                            <input
                                type="text"
                                placeholder="Search by ID, location, driver..."
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    margin: '10px 0',
                    fontSize: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <strong>Active Filters:</strong>
                        {deliveryTypeFilter !== 'all' && (
                            <span style={{
                                padding: '4px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '16px',
                                fontSize: '13px'
                            }}>
                                Type: {deliveryTypeFilter === 'normal' ? 'Normal Stock' : 'Customized'}
                            </span>
                        )}
                        {deliverToFilter && (
                            <span style={{
                                padding: '4px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '16px',
                                fontSize: '13px'
                            }}>
                                Deliver To: {getLocationName(deliverToFilter)}
                            </span>
                        )}
                        {driverFilter && (
                            <span style={{
                                padding: '4px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '16px',
                                fontSize: '13px'
                            }}>
                                Driver: {(() => {
                                    const driver = userList.find(user => user.account_id?.toString() === driverFilter.toString());
                                    return driver ? `${driver.fname} ${driver.mname} ${driver.lname}`.trim() : 'Unknown';
                                })()}
                            </span>
                        )}
                        {statusFilter && (
                            <span style={{
                                padding: '4px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '16px',
                                fontSize: '13px'
                            }}>
                                Status: {statusFilter}
                            </span>
                        )}
                        <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                            ({filteredData.length} of {customizeDeliveryList.length + normalDeliveryList.length} records shown)
                        </span>
                    </div>
                    <button
                        onClick={clearAllFilters}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Clear All Filters
                    </button>
                </div>

                <div style={{
                    minHeight: '500px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '20px',
                        padding: '10px 0',
                        flex: '1'
                    }}>
                        {currentItems.length > 0 ? (
                            currentItems.map((delivery, index) => {
                                const status = getStatus(delivery);
                                const deliverTo = getDeliverTo(delivery);
                                const driver = getDriver(delivery);
                                const deliveryId = getDeliveryId(delivery);

                                return (
                                    <div
                                        key={`${delivery.deliveryType}-${deliveryId}-${index}`}
                                        onClick={() => handleViewDetails(delivery)}
                                        style={{
                                            backgroundColor: '#ffffff',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            border: '1px solid #e9ecef',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            height: 'fit-content'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(255, 152, 0, 0.15)';
                                            e.currentTarget.style.borderColor = '#ff9800';
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
                                            background: status === "Delivered"
                                                ? 'linear-gradient(90deg, #28a745 0%, #20c997 100%)'
                                                : 'linear-gradient(90deg, #ffc107 0%, #ff9800 100%)'
                                        }}></div>

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: '15px'
                                        }}>
                                            <div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: '#6c757d',
                                                    marginBottom: '2px',
                                                    fontWeight: '500',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {/* {delivery.deliveryType === 'customize' ? 'Delivery ID' : 'Request ID'} */}
                                                    Request ID
                                                </div>
                                                <div style={{
                                                    fontSize: '20px',
                                                    fontWeight: '700',
                                                    color: '#2c3e50'
                                                }}>
                                                    #{deliveryId}
                                                </div>
                                                <div style={{
                                                    fontSize: '10px',
                                                    color: '#fff',
                                                    backgroundColor: delivery.deliveryType === 'customize' ? '#17a2b8' : '#6c757d',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    marginTop: '4px',
                                                    display: 'inline-block',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {delivery.deliveryType === 'customize' ? 'Customized' : 'Normal Stock'}
                                                </div>
                                            </div>

                                            <div style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                backgroundColor: status === "Delivered"
                                                    ? '#d4edda'
                                                    : '#fff3cd',
                                                color: status === "Delivered"
                                                    ? '#155724'
                                                    : '#856404',
                                                border: `2px solid ${status === "Delivered" ? '#28a745' : '#ffc107'}`
                                            }}>
                                                {status}
                                            </div>
                                        </div>

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
                                                color: '#ff9800',
                                                marginTop: '2px',
                                                flexShrink: 0
                                            }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
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
                                                    Deliver To
                                                </div>
                                                <div style={{
                                                    fontSize: '15px',
                                                    color: '#2c3e50',
                                                    fontWeight: '600',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {deliverTo}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '10px',
                                            marginBottom: '15px',
                                            padding: '10px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{
                                                color: '#ff9800',
                                                marginTop: '2px',
                                                flexShrink: 0
                                            }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                    <circle cx="12" cy="7" r="4" />
                                                </svg>
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
                                                    Driver
                                                </div>
                                                <div style={{
                                                    fontSize: '15px',
                                                    color: '#2c3e50',
                                                    fontWeight: '600',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {driver || 'Not Assigned'}
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
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                    <line x1="16" y1="2" x2="16" y2="6" />
                                                    <line x1="8" y1="2" x2="8" y2="6" />
                                                    <line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                                {delivery.deliveryType === 'customize' || delivery.deliveryType === 'normal'
                                                    ? `${formatDate(delivery.date)}`
                                                    : 'Click for details'}
                                            </div>

                                            <div style={{
                                                fontSize: '13px',
                                                color: '#ff9800',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                View details
                                                <div style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    border: '2px solid #ff9800',
                                                    backgroundColor: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '14px'
                                                }}>
                                                    →
                                                </div>
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
                                    🚚
                                </div>
                                <h4 style={{
                                    color: '#495057',
                                    marginBottom: '10px',
                                    fontWeight: '500'
                                }}>
                                    {(customizeDeliveryList.length + normalDeliveryList.length) === 0
                                        ? 'No ongoing delivery'
                                        : 'No deliveries match the current filters'}
                                </h4>
                                <p style={{
                                    margin: '0',
                                    fontSize: '14px',
                                    maxWidth: '300px',
                                    lineHeight: '1.4'
                                }}>
                                    {(customizeDeliveryList.length + normalDeliveryList.length) === 0
                                        ? 'All deliveries are currently complete. New delivery requests will appear here when available.'
                                        : 'Try adjusting your filters to see more results.'
                                    }
                                </p>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && currentItems.length > 0 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '20px',
                            paddingTop: '10px',
                            borderTop: '1px solid #e9ecef'
                        }}>
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                color="green"
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DeliveryCustomizeWR;