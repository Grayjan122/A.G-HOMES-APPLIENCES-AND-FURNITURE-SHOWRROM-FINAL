'use client';
import { useState, useEffect } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import 'sweetalert2/dist/sweetalert2.all';
import Swal from 'sweetalert2';
import Head from "next/head";
import CustomPagination from '@/app/Components/Pagination/pagination';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import { AlertSucces } from '@/app/Components/SweetAlert/success';

const ITEMS_PER_PAGE = 5;

const ReceiveTransferDelivery = () => {
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [locationList, setLocationList] = useState([]);
    const [deliveryList, setDeliveryList] = useState([]);
    const [deliveryDetails, setDeliveryDetails] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewDeliveryDetailVisible, setViewDeliveryDetailVisible] = useState(true);
    const [continueR, setContinueR] = useState(true);
    
    // Delivery info state
    const [s_deliveryID, setS_DeliveryID] = useState('');
    const [s_transferID, setS_TransferID] = useState('');
    const [s_deliveryDate, setS_DeliveryDate] = useState('');
    const [s_driverName, setS_DriverName] = useState('');
    const [s_deliveryFrom, setS_DeliveryFrom] = useState('');
    const [s_deliveryTo, setS_DeliveryTo] = useState('');
    const [s_deliveryStatus, setS_DeliveryStatus] = useState('');
    const [deliveryDateTime, setDeliveryDateTime] = useState('');
    const [transfer_delivery_id, setTransfer_Delivery_ID] = useState('');
    const [from_location_id, setFrom_location_id] = useState('');
    
    // Inventory state
    const [currentStoreInventory, setCurrentStoreInventory] = useState([]);
    const [filterLocation, setFilterLocation] = useState('');

    const totalPages = Math.ceil(deliveryDetails.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = deliveryDetails.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));
        GetLocation();
        document.getElementById("c-loc")?.focus();
        document.getElementById("c-loc")?.click();
        setFilterLocation(location_id);
        GetTransferDeliveries();
    }, []);

    useEffect(() => {
        if (location_id) {
            GetTransferDeliveries();
        }
    }, [location_id, filterLocation]);

    useEffect(() => {
        if (location_id) {
            GetCurrentStoreInventory();
        }
    }, [location_id]);

    const GetLocation = async () => {
        const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
        const url = baseURL + 'location.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetLocation"
                }
            });

            setLocationList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching location list:", error);
        }
    };

    const GetTransferDeliveries = async () => {
        const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
        const url = baseURL + 'transferStock.php';

        console.log('[GetTransferDeliveries] Filter location:', filterLocation);
        console.log('[GetTransferDeliveries] Current location_id:', location_id);

        try {
            const payload = {
                status: 'in_transit'
            };
            
            // Only filter by location if a specific location is selected (not empty string)
            if (filterLocation && filterLocation !== '') {
                const targetLocationId = parseInt(filterLocation);
                if (!isNaN(targetLocationId) && targetLocationId > 0) {
                    payload.location_id = targetLocationId;
                    console.log('[GetTransferDeliveries] Filtering by location:', targetLocationId);
                }
            } else {
                // Default: Show all deliveries from all locations (no location filter)
                console.log('[GetTransferDeliveries] Showing all deliveries from all locations');
            }

            console.log('[GetTransferDeliveries] Payload:', payload);

            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(payload),
                    operation: 'GetTransferDeliveries'
                }
            });

            console.log('[GetTransferDeliveries] Response:', response.data);


            let deliveries = [];
            if (response.data && response.data.success && response.data.deliveries) {
                deliveries = response.data.deliveries;
            } else if (response.data && Array.isArray(response.data)) {
                deliveries = response.data;
            }

            // Sort deliveries by date - oldest first (first come first show)
            deliveries.sort((a, b) => {
                const dateA = new Date(a.delivery_date || a.created_at || a.date || 0);
                const dateB = new Date(b.delivery_date || b.created_at || b.date || 0);
                return dateA - dateB; // Ascending order (oldest first)
            });

            const d = deliveries.filter(delivery => delivery.request_from_location_id === parseInt(location_id));
            setDeliveryList(d);

        } catch (error) {
            console.error("Error fetching transfer deliveries:", error);
            console.error("Error details:", error.response?.data || error.message);
            setDeliveryList([]);
        }
    };

    const GetCurrentStoreInventory = async () => {
        if (!location_id) {
            setCurrentStoreInventory([]);
            return;
        }

        const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
        const url = baseURL + 'inventory.php';

        const locDetails = {
            locID: location_id,
            stockLevel: '',
            search: ''
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(locDetails),
                    operation: "GetInventory"
                }
            });
            
            if (response.data) {
                setCurrentStoreInventory(Array.isArray(response.data) ? response.data : []);
            } else {
                setCurrentStoreInventory([]);
            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
            setCurrentStoreInventory([]);
        }
    };

    const GetDeliveryDetails = async (deliveryId, transferRequestId) => {
        const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
        const url = baseURL + 'transferStock.php';

        try {
            const payload = {};
            if (deliveryId) {
                payload.transfer_delivery_id = deliveryId;
            } else if (transferRequestId) {
                payload.transfer_request_id = transferRequestId;
            }

            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(payload),
                    operation: 'GetTransferDeliveryById'
                }
            });

            if (response.data && response.data.success && response.data.delivery) {
                const delivery = response.data.delivery;
                setDeliveryDetails(delivery.items || []);
            } else {
                setDeliveryDetails([]);
            }
        } catch (error) {
            console.error("Error fetching delivery details:", error);
            setDeliveryDetails([]);
        }
    };

    const GetDeliveryInfo = async (deliveryId, transferRequestId) => {
        const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
        const url = baseURL + 'transferStock.php';

        try {
            const payload = {};
            if (deliveryId) {
                payload.transfer_delivery_id = deliveryId;
            } else if (transferRequestId) {
                payload.transfer_request_id = transferRequestId;
            }

            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(payload),
                    operation: 'GetTransferDeliveryById'
                }
            });

            if (response.data && response.data.success && response.data.delivery) {
                const delivery = response.data.delivery;
                setS_TransferID(delivery.transfer_request_id || delivery.id);
                setS_DeliveryID(delivery.request_number || `TR-${delivery.transfer_request_id || delivery.transfer_id || delivery.id}`);
                setS_DeliveryDate(delivery.delivery_date || delivery.created_at || '');
                setS_DriverName(delivery.driver_name || 'Not Assigned');
                setS_DeliveryFrom(delivery.from_location_name || 'N/A');
                setS_DeliveryTo(delivery.to_location_name || 'N/A');
                setS_DeliveryStatus(delivery.delivery_status || 'in_transit');
                setTransfer_Delivery_ID(delivery.transfer_request_id || delivery.transfer_id || delivery.id);
                setFrom_location_id(delivery.from_location_id || delivery.request_from_location_id || '');
                
                if (delivery.delivery_date || delivery.created_at) {
                    setDeliveryDateTime(formatDate(delivery.delivery_date || delivery.created_at));
                } else {
                    setDeliveryDateTime('');
                }
            }
        } catch (error) {
            console.error("Error fetching delivery info:", error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('en-US', options);
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

    const triggerModal = async (operation, delivery) => {
        switch (operation) {
            case 'viewDeliveryDetails':
                const transferRequestId = delivery.transfer_request_id || delivery.transfer_id || delivery.id;
                // Store from_location_id from delivery object as fallback
                if (delivery.from_location_id || delivery.request_from_location_id) {
                    setFrom_location_id(delivery.from_location_id || delivery.request_from_location_id);
                }
                await Promise.all([
                    GetDeliveryDetails(null, transferRequestId),
                    GetDeliveryInfo(null, transferRequestId)
                ]);
                setViewDeliveryDetailVisible(false);
                break;
        }
    };

    const ReceiveTransferDelivery = async () => {
        if (!deliveryDetails || deliveryDetails.length === 0) {
            showAlertError({
                icon: "error",
                title: "No Delivery Details!",
                text: 'Delivery details are missing. Please refresh and try again.',
                button: 'OK'
            });
            return;
        }

        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
        const url = baseURL + 'transferStock.php';

        try {
            // Update transfer status to completed - this will handle inventory update with "Transfer In" ledger entries
            // The UpdateTransferStatus function will:
            // 1. Add stock to the "to" location (the receiving location - request_from_location_id)
            // 2. Create "Transfer In" ledger entries in store_inventory_transaction_ledger
            // 3. Update received_quantity in transfer_request_items
            const statusResponse = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        transfer_request_id: transfer_delivery_id,
                        status: 'completed',
                        delivery_status: 'received',
                        updated_by: accountID,
                        received_by: accountID,
                        notes: `Transfer delivery received and inventory updated by user ${accountID}`,
                        received_items: deliveryDetails.map(item => ({
                            transfer_request_item_id: item.transfer_request_item_id || item.id,
                            received_quantity: item.delivered_quantity || item.approved_quantity || item.requested_quantity || item.quantity || 0
                        }))
                    }),
                    operation: 'UpdateTransferStatus'
                }
            });

            // console.log(statusResponse);

            if (statusResponse.data && statusResponse.data.success) {
                const receiverName = sessionStorage.getItem('fullname') || 'Unknown User';
                const transferRequestId = transfer_delivery_id || s_transferID;
                const requestNumber = s_deliveryID || `TR-${transferRequestId}`;
                const itemsCount = deliveryDetails.length;
                const fromLocationId = from_location_id || statusResponse.data.from_location_id;

                AlertSucces(
                    "Successfully received the transfer delivery! Stock is added to inventory.",
                    "success",
                    true,
                    'Good'
                );

                // Send notification to Inventory Manager at the provider location (from location)
                await createNotification({
                    type: 'transfer_delivery',
                    title: 'Transfer Delivery Received',
                    message: `Transfer request #${requestNumber} has been received and completed at destination. ${itemsCount} item${itemsCount > 1 ? 's' : ''} received by ${receiverName}. Inventory has been updated.`,
                    locationId: null,
                    targetRole: 'Inventory Manager',
                    productId: null,
                    customerId: null,
                    referenceId: transferRequestId || null
                });

                setViewDeliveryDetailVisible(true);
                setContinueR(true);
                GetTransferDeliveries();
                GetCurrentStoreInventory();
            } else {
                throw new Error(statusResponse.data?.message || 'Failed to update transfer status');
            }
        } catch (error) {
            console.error("Error receiving transfer delivery:", error);
            showAlertError({
                icon: "error",
                title: "Failed to Receive Delivery!",
                text: error.response?.data?.message || error.message || 'Failed to receive the transfer delivery. Please try again.',
                button: 'OK'
            });
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <>
            <Head>
                <title>Receive Transfer Delivery | My App</title>
            </Head>

            <Alert variant={alertVariant} className='alert-inventory' show={alert1} style={{ backgroundColor: alertBG }}>
                {message}
            </Alert>

            <Modal show={!continueR} onHide={() => { setContinueR(true) }} size='md' className='searched-product-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Receive This Delivery</Modal.Title>
                </Modal.Header>
                <Modal.Body className='searched-product-body'>
                    Continue receiving the delivery?
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => { setContinueR(true) }}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={async () => {
                        await GetCurrentStoreInventory();
                        setTimeout(() => {
                            ReceiveTransferDelivery();
                        }, 100);
                    }}>
                        Continue
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={!viewDeliveryDetailVisible} onHide={() => {
                setViewDeliveryDetailVisible(true);
                GetTransferDeliveries();
            }} size='lg' className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Transfer Delivery Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    <div className="r-details-head">
                        <div className='r-d-div' style={{justifyContent: 'space-between'}}>
                            <div className='r-1' style={{fontWeight: 'bold', fontSize: '18px'}}><strong>TRANSFER REQUEST NUMBER:</strong> {s_deliveryID}</div>

                            <div><strong>DELIVERY DATE:</strong> {formatDate(s_deliveryDate)}</div>
                        </div>
                        <div><strong>DELIVERY FROM:</strong> {s_deliveryTo}</div>
                        <div><strong>DELIVERY TO:</strong> {s_deliveryFrom}</div>
                        <div><strong>DRIVER:</strong> {s_driverName}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: s_deliveryStatus === 'in_transit' ? 'goldenrod' : s_deliveryStatus === 'delivered' ? 'green' : 'black',
                                fontWeight: 'bold'
                            }}>
                                {s_deliveryStatus.toUpperCase()} | {deliveryDateTime}
                            </span>
                        </div>
                    </div>

                    <div className='tableContainer' style={{ height: '30vh', overflowY: 'auto' }}>
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th className='t2'>Product Code</th>
                                    <th className='t2'>Product Description</th>
                                    <th className='th1'>Delivered QTY</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? currentItems.map((item, i) => {
                                    const qty = item.delivered_quantity || item.approved_quantity || item.requested_quantity || item.quantity || 0;
                                    return (
                                        <tr key={i}>
                                            <td className='td-name'>{item.product_name || item.product_code || 'N/A'}</td>
                                            <td className='td-name'>{item.description || 'N/A'}</td>
                                            <td style={{textAlign: 'center'}}>{qty}</td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="3" style={{textAlign: 'center'}}>No items found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div style={{ justifySelf: 'center' }}>
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                color="green"
                            />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => {
                        setViewDeliveryDetailVisible(true);
                        GetTransferDeliveries();
                    }}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => { setContinueR(false); }}>
                        Receive
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='customer-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>Receive Transfer Delivery</h1>
                    <div style={{
                        padding: '12px 20px',
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffc107',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span style={{ fontSize: '20px' }}>ℹ️</span>
                        <span style={{ color: '#856404', fontSize: '14px', fontWeight: '500' }}>
                            Note: Only deliveries for transfers you requested can be received here.
                        </span>
                    </div>
                </div>

                <div className='search-customer'>
                    {/* <div className='filter'>
                        <div>
                            <label className='label'>Store:</label>
                            <select 
                                className='new' 
                                value={filterLocation} 
                                onChange={(e) => setFilterLocation(e.target.value)} 
                                id='c-loc'
                            >
                                <option value={''}>Select All Location</option>
                                {locationList
                                    .filter(r => r.name !== "Warehouse")
                                    .map((r) => (
                                        <option key={r.location_id} value={r.location_id}>
                                            {r.location_name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div> */}
                </div>

                <div className="cardContainer" style={{ height: '60vh', overflowY: 'auto', padding: '10px' }}>
                    {deliveryList.length === 0 ? (
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
                                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>No Transfer Delivery Found</div>
                                <div>There are currently no transfer deliveries in transit for transfers you requested.</div>
                            </div>
                        </div>
                    ) : (
                        deliveryList.map((delivery, i) => {
                            const transferId = delivery.transfer_request_id || delivery.transfer_id || delivery.id;
                            return (
                                <div
                                    className="requestCard"
                                    key={i}
                                    onClick={() => {
                                        triggerModal('viewDeliveryDetails', delivery);
                                    }}
                                >
                                    <div className="cardContent">
                                        <div className="cardDetails">
        
                                            <div className="cardRow">
                                                <span className="cardLabel">TRANSFER REQUEST NUMBER:</span>
                                                <span className="cardValue">{delivery.request_number || `TR-${delivery.transfer_request_id || delivery.transfer_id || 'N/A'}`}</span>
                                            </div>
                                            <div className="cardRow">
                                                <span className="cardLabel">DELIVERY FROM:</span>
                                                <span className="cardValue">{delivery.from_location_name || 'N/A'}</span>
                                            </div>
                                            <div className="cardRow">
                                                <span className="cardLabel">DELIVERY TO:</span>
                                                <span className="cardValue">{delivery.to_location_name || 'N/A'}</span>
                                            </div>
                                            <div className="cardRow">
                                                <span className="cardLabel">DRIVER:</span>
                                                <span className="cardValue">{delivery.driver_name || 'Not Assigned'}</span>
                                            </div>
                                            <div className="cardRow">
                                                <span className="cardLabel">STATUS:</span>
                                                <span
                                                    className="cardValue"
                                                    style={{
                                                        color: delivery.delivery_status === 'in_transit' ? 'goldenrod' : delivery.delivery_status === 'delivered' ? 'green' : 'black',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {delivery.delivery_status ? delivery.delivery_status.toUpperCase().replace('_', ' ') : 'IN TRANSIT'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="statusIcon">
                                            {delivery.delivery_status === 'in_transit' && <span>🚚</span>}
                                            {delivery.delivery_status === 'delivered' && <span>✅</span>}
                                            {delivery.delivery_status === 'received' && <span>✓</span>}
                                            {delivery.delivery_status !== 'in_transit' && delivery.delivery_status !== 'delivered' && delivery.delivery_status !== 'received' && <span>📦</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
};

export default ReceiveTransferDelivery;

