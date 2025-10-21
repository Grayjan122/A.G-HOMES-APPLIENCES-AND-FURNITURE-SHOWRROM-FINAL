'use client';
import { useState, useEffect } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Head from "next/head";
import CustomPagination from '@/app/Components/Pagination/pagination';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import { AlertSucces } from '@/app/Components/SweetAlert/success';

const ITEMS_PER_PAGE = 5;

const ReceiveCustomizeSC = () => {
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [locationList, setLocationList] = useState([]);
    const [rs_StoreID, setRs_StoreID] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');
    const [continueR, setContinueR] = useState(true);
    const [viewRequestDetailVisible, setViewRequestDetailVisible] = useState(true);

    // State for customize delivery data
    const [customizeDeliveryList, setCustomizeDeliveryList] = useState([]);
    const [fullDetails, setFullDetails] = useState([]);
    const [semiDetails, setSemiDetails] = useState([]);
    const [requestList, setRequestList] = useState([]);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [deliveryDetails, setDeliveryDetails] = useState([]);

    // Format date and time for better readability
    const formatDateTime = (date, time) => {
        if (!date || !time) return '';
        const dateObj = new Date(date + ' ' + time);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return dateObj.toLocaleString('en-US', options);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const [year, month, day] = dateStr.split('-');
        const monthName = months[parseInt(month) - 1];
        const dayNum = parseInt(day);
        return `${monthName} ${dayNum} ${year}`;
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
            console.error("Error recording event logs:", error);
        }
    };

    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));
        GetLocation();
    }, []);

    useEffect(() => {
        fetchCustomizeDeliveryList();
        fetchFullDetails();
        fetchSemiDetails();
        fetchRequestList();
    }, []);

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

    const fetchCustomizeDeliveryList = async () => {
        const locationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        try {
            const response = await fetch(`${baseURL}customizeProducts.php?json=${encodeURIComponent(JSON.stringify({ locID: locationID, deliverType: 'deliverTo' }))}&operation=GetCustomizeDeliver`);
            const data = await response.json();
            const filtered = data.filter(item => item.status === "On Delivery");
            setCustomizeDeliveryList(filtered);
            console.log('Customize Delivery List:', filtered);
        } catch (error) {
            console.error("Error fetching customize delivery list:", error);
        }
    };

    const fetchRequestList = async () => {
        const locationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        try {
            const response = await fetch(`${baseURL}customizeProducts.php?json=${encodeURIComponent(JSON.stringify({ locID: locationID }))}&operation=GetCustomizeRequestFrom`);
            const data = await response.json();
            setRequestList(data);
            console.log('Request List:', data);
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
            console.log('Semi Details:', data);
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
            console.log('Full Details:', data);
        } catch (error) {
            console.error("Error fetching full details:", error);
        }
    };

    // Get delivery details by connecting related data
    const getDeliveryDetails = (delivery) => {
        const request = requestList.find(r => r.customize_req_id === delivery.customize_request_id);
        if (!request) return { semi: [], full: [], request: null };

        const semi = semiDetails.filter(s => s.customize_sales_id === request.customize_sales_id);
        const full = fullDetails.filter(f => f.customize_sales_id === request.customize_sales_id);

        return { semi, full, request };
    };

    const viewDeliveryDetails = (delivery) => {
        const details = getDeliveryDetails(delivery);
        setSelectedDelivery(delivery);
        setDeliveryDetails(details);
        setCurrentPage(1); // Reset to first page when opening modal
        setViewRequestDetailVisible(false);
    };

    // Filter delivery list by selected store
    const filteredDeliveryList = rs_StoreID && rs_StoreID.trim() !== ''
        ? customizeDeliveryList.filter(d => d.deliver_to === parseInt(rs_StoreID))
        : customizeDeliveryList;

    // Combine semi and full details into a single array for unified table display
    const allDeliveryItems = [
        ...(deliveryDetails.semi || []).map(item => ({
            type: 'Semi-Customized',
            baseProductId: item.product_name,
            description: item.description || 'No modifications specified',
            additionalDescription: item.modifications,
            qty: item.qty
        })),
        ...(deliveryDetails.full || []).map(item => ({
            type: 'Full-Customized',
            baseProductId: null,
            description: item.description || 'N/A',
            additionalDescription: item.additional_description || 'N/A',
            qty: item.qty
        }))
    ];

    // Pagination for modal items
    const totalPages = Math.ceil(allDeliveryItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = allDeliveryItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const receiveDelivery = async () => {

        const locationID = parseInt(sessionStorage.getItem('location_id'));
        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';

        const details = {
            deliverID: selectedDelivery.deliver_customize_id,
            reqID: selectedDelivery.customize_request_id,
            accID: accountID, 
            locID: locationID
        };
        console.log(selectedDelivery);
        console.log(deliveryDetails);
        
        
        const semiCustomizedItems = deliveryDetails.semi;
        const fullCustomizedItems = deliveryDetails.full;

        console.log(semiCustomizedItems);
        console.log(fullCustomizedItems);
        console.log('Receiving delivery with details:', details);

        
        // return;

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(details),
                    semiProd: JSON.stringify(semiCustomizedItems),
                    fullProd: JSON.stringify(fullCustomizedItems),
                    operation: "ReceiveCustomize"
                }
            });

            if (response.data === 'Success') {
                AlertSucces(
                    "Successfully received the delivery!",
                    "success",
                    true,
                    'Good'
                );
                setViewRequestDetailVisible(true);
                setContinueR(true);
                fetchCustomizeDeliveryList();
                // Logs(accountID, 'Received customize delivery #' + selectedDelivery.deliver_customize_id);
            } else {
                console.log('Failed to receive delivery:', response.data);
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to receive the delivery!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error receiving delivery:", error);
            showAlertError({
                icon: "error",
                title: "Error!",
                text: 'An error occurred while receiving the delivery.',
                button: 'Try Again'
            });
        }
    };

    return (
        <>
            <Head>
                <title>Receive Customize Stock | My App</title>
            </Head>

            <Alert variant={alertVariant} className='alert-inventory' show={alert1} style={{ backgroundColor: alertBG }}>
                {message}
            </Alert>

            {/* Confirmation Modal */}
            <Modal show={!continueR} onHide={() => setContinueR(true)} size='md'>
                <Modal.Header closeButton>
                    <Modal.Title>Receive This Delivery</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Continue receiving the delivery?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setContinueR(true)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={receiveDelivery}>
                        Continue
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delivery Details Modal */}
            <Modal show={!viewRequestDetailVisible} onHide={() => setViewRequestDetailVisible(true)} size='xl' className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Delivery Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    {selectedDelivery && deliveryDetails.request && (
                        <>
                            <div className="r-details-head">
                                <div className='r-d-div'>
                                    <div className='r-1'><strong>REQUEST ID:</strong> {selectedDelivery.customize_request_id}</div>
                                    <div><strong>REQUEST DATE:</strong> {formatDate(selectedDelivery.date)}</div>
                                </div>
                                <div><strong>DELIVERY ID:</strong> {selectedDelivery.deliver_customize_id}</div>
                                <div><strong>DELIVER TO:</strong> {selectedDelivery.DeliverTo}</div>
                                <div><strong>DELIVERY FROM:</strong> {selectedDelivery.DeliverFrom}</div>
                                <div><strong>REQUEST BY:</strong> {selectedDelivery.doneLname}, {selectedDelivery.doneFname} {selectedDelivery.doneMname}</div>
                                <div><strong>DRIVER:</strong> {selectedDelivery.driver}</div>
                                <div><strong>STATUS:</strong>
                                    <span style={{
                                        marginLeft: '8px',
                                        color: selectedDelivery.status === "Delivered" ? "green" : "goldenrod",
                                        fontWeight: 'bold'
                                    }}>
                                        {selectedDelivery.status} | {formatDateTime(selectedDelivery.date, selectedDelivery.time)}
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
                                        {allDeliveryItems.length}
                                    </div>
                                </div>
                            </div>

                            <div className='tableContainer' style={{ marginTop: '20px' }}>
                                {allDeliveryItems.length > 0 ? (
                                    <>
                                        <div style={{ overflowY: 'auto', maxHeight: '40vh' }}>
                                            <table className='table table-bordered'>
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
                                                    {currentItems.map((item, index) => (
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
                                        </div>
                                        
                                        {totalPages > 1 && (
                                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px', alignItems: 'center' }}>
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </Button>
                                                <span style={{ padding: '0 15px', fontWeight: '500' }}>
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div style={{ textAlign: "center", padding: "30px", fontStyle: "italic", color: '#666' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
                                        <div style={{ fontSize: '16px' }}>No delivery items found</div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => setViewRequestDetailVisible(true)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => setContinueR(false)}>
                        Receive
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Main Content */}
            <div className='customer-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>Receive Customize Stock Delivery</h1>
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
                            Note: Deliveries are processed on a first-come, first-served basis.
                        </span>
                    </div>
                </div>

              

                <div className="cardContainer" style={{ height: '60vh', overflowY: 'auto', padding: '10px' }}>
                    {filteredDeliveryList.length === 0 ? (
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
                                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>No Customize Delivery Found</div>
                                <div>There are currently no deliveries yet.</div>
                            </div>
                        </div>
                    ) : (
                        filteredDeliveryList.map((delivery, i) => {
                            const request = requestList.find(r => r.customize_req_id === delivery.customize_request_id);
                            return (
                                <div
                                    className="requestCard"
                                    key={i}
                                    onClick={() => viewDeliveryDetails(delivery)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="cardContent">
                                        <div>
                                            <div className="cardRow">
                                                <span className="cardLabel" style={{ fontSize: '30px' }}>REQUEST ID:</span>
                                                <span className="cardValue" style={{ fontSize: '30px', fontWeight: 'bold' }}>{delivery.customize_request_id}</span>
                                            </div>
                                         
                                            <div className="cardRow">
                                                <span className="cardLabel">DELIVERY FROM:</span>
                                                <span className="cardValue">{delivery.DeliverFrom}</span>
                                            </div>
                                            <div className="cardRow">
                                                <span className="cardLabel">DELIVER BY:</span>
                                                <span className="cardValue">{delivery.driver}</span>
                                            </div>
                                            <div className="cardRow">
                                                <span className="cardLabel">STATUS:</span>
                                                <span className="cardValue" style={{ color: 'orange', fontWeight: 'bold' }}>
                                                    {delivery.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="statusIcon">
                                            <span>📦</span>
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

export default ReceiveCustomizeSC;