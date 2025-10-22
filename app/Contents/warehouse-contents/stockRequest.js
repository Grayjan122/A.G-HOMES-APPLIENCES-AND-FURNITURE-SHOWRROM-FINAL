'use client';
import { useState, useEffect } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const ITEMS_PER_PAGE = 5;

const StockRequestWR = () => {
    // User session data
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');

    // Main data states
    const [requestList1, setRequestList1] = useState([]);
    const [requestList2, setRequestList2] = useState([]);

    const [requestDetails, setRequestDetails] = useState([]);
    const [currentStoreInventory, setCurrentStoreInventory] = useState([]);

    // Modal visibility states
    const [viewRequestDetailVisible, setViewRequestDetailVisible] = useState(true);

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
    const [reqFromId, setReqFromId] = useState('');
    const [reqToId, setReqToId] = useState('');
    const [reqDateTime, setReqDateTime] = useState("");


    // Checkbox and product availability states
    const [checkedItems, setCheckedItems] = useState({});
    const [unavailableProducts, setUnavailableProducts] = useState([]);
    const [availProduct, setAvailProducts] = useState([]);

    // Pagination for request details
    const [currentRequestPage, setCurrentRequestPage] = useState(1);
    const totalRequestPages = Math.ceil(requestDetails.length / ITEMS_PER_PAGE);
    const startRequestIndex = (currentRequestPage - 1) * ITEMS_PER_PAGE;
    const currentRequestItems = requestDetails.slice(startRequestIndex, startRequestIndex + ITEMS_PER_PAGE);

    // Initialize user session data
    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));
    }, []);

    // Load initial data
    useEffect(() => {
        GetRequest();
    }, []);

    // Utility function for showing alerts
    const showAlert = (msg, variant, bg) => {
        setMessage(msg);
        setAlertVariant(variant);
        setAlertBG(bg);
        setAlert1(true);
        setTimeout(() => setAlert1(false), 3000);
    };

    // Logging function
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
            console.error("Error recording logs events:", error);
        }
    };

    // Get pending requests for the current location
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

    // Get detailed information about a specific request
    const GetRequestDetails = async (req_id) => {
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
            setRequestDetails(response.data);
        } catch (error) {
            console.error("Error fetching request details:", error);
        }
    };

    // Get request metadata (requester info, dates, etc.)
    const GetRequestD = async (req_id) => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
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
            setReqFromId(data.request_from);
            setReqToId(data.request_to);

            if (data.request_status == 'Pending')  {
                 GetTrackRequestTimeandDate(data.request_stock_id, 'Request Sent');
            } else{
                 GetTrackRequestTimeandDate(data.request_stock_id, data.request_status);

            }
           

        } catch (error) {
            console.error("Error fetching request details:", error);
        }
    };

    const GetTrackRequestTimeandDate = async (req_id, status) => {
        // alert('hello');

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        // const url = `${getBaseURL()}requestStock.php`;
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
            //  alert('hello');
            if (response.data && response.data.length > 0) {
                
                // format "12-01-2025 • 10:30"
                setReqDateTime(response.data[0].date + " • " + response.data[0].time);
                // alert(reqDateTime);
                // alert('hell');
            } else {
                return "";
            }
        } catch (error) {
            handleError(error, "fetching request data");
            return "";
        }
    };

    // Get current store inventory
    const GetCurrentStoreInventory = async (lc) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'inventory.php';
        const locDetails = {
            locID: lc,
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
            setCurrentStoreInventory(response.data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

    // Handle checkbox changes for product selection
    const handleCheckboxChange = (product_id, location_id) => {
        const reqQTY = requestDetails.find(f => f.product_id === product_id);
        const av = currentStoreInventory.find(f => f.product_id === product_id);

        if (!av || reqQTY.qty > av.qty || av.qty < 1) {
            showAlert("Product is unavailable or has insufficient stock.", 'danger', '#dc7a80');

            setUnavailableProducts(prev => {
                const productInfo = requestDetails.find(p => p.product_id === product_id);
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
                const productInfo = requestDetails.find(p => p.product_id === product_id);
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

    // Initialize product availability when request details change
    useEffect(() => {
        const initialChecked = {};
        const unavailable = [];
        const available = [];

        requestDetails.forEach(p => {
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
    }, [requestDetails, currentStoreInventory]);

    // Approve and process the request
    const ApproveRequest = async () => {
        const accountID = sessionStorage.getItem('user_id');
        const updates = [];

        Object.keys(checkedItems).forEach(productId => {
            if (checkedItems[productId]) {
                const p = requestDetails.find(r => r.product_id === parseInt(productId));
                const u = currentStoreInventory.find(f => f.product_id === parseInt(productId));

                if (u && p) {
                    updates.push({
                        prodID: u.product_id,
                        pastBalance: u.qty,
                        qty: p.qty,
                        currentBalance: u.qty - p.qty
                    });
                }
            }
        });

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const reqDetails1 = {
            reqID: s_reqID,
            accID: user_id,
            reqFromID: reqFromId,
            reqToID: reqToId
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(reqDetails1),
                    operation: "AcceptRequestWR",
                    transferList: JSON.stringify(availProduct),
                    unavailList: JSON.stringify(unavailableProducts),
                    inventoryReportList: JSON.stringify(updates),
                }
            });

            if (response.data === 'Success') {
                AlertSucces(
                    "Request is successfully approved!",
                    "success",
                    true,
                    'Got It'
                );
                GetRequest();
                setViewRequestDetailVisible(true);
                Logs(accountID, 'Accept the request #' + s_reqID);
            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to approve the request!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error ", error);
        }
    };

    // Handle modal triggers
    const triggerModal = (operation, id) => {
        switch (operation) {
            case 'viewRequestDetails':
                GetRequestDetails(id);
                GetRequestD(id);
                setViewRequestDetailVisible(false);
                break;
        }
    };

    // Pagination handler
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalRequestPages) {
            setCurrentRequestPage(page);
        }
    };

    return (
        <>
            <Alert variant={alertVariant} className='alert-inventory' show={alert1} style={{ backgroundColor: alertBG }}>
                {message}
            </Alert>

            {/* Request Details Modal */}
            <Modal show={!viewRequestDetailVisible} onHide={() => {
                setViewRequestDetailVisible(true);
                GetRequest();
                setAvailProducts([]);
            }} size='lg' className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Request Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    <div className="r-details-head">
                        <div className='r-d-div'>
                            <div className='r-1'><strong>REQUEST ID:</strong> {s_reqID}</div>
                            <div><strong>REQUEST DATE:</strong> {s_reqDate}</div>
                        </div>
                        <div><strong>REQUEST FROM:</strong> {s_reqFrom}</div>
                        <div><strong>REQUEST BY:</strong> {s_reqBy}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: s_reqStatus === 'Pending' ? 'red' : s_reqStatus === 'Approved' ? 'green' : 'black',
                                fontWeight: 'bold'
                            }}>
                                {/* {s_reqStatus} */}
                                {s_reqStatus} | {reqDateTime}

                            </span>
                        </div>
                    </div>

                    <div className='tableContainer1' style={{ height: '30vh' }}>
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th className='t2'>Product Code</th>
                                    <th className='t2'>Product Description</th>
                                    <th className='th1'>Requested QTY</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRequestItems.length > 0 ? (
                                    currentRequestItems.map((p, i) => (
                                        <tr key={i} onClick={() => { 
                                            // handleCheckboxChange(p.product_id, location_id) 
                                        }}>
                                            <td className='td-name'>{p.product_name}</td>
                                            <td className='td-name'>{p.description}</td>
                                            <td style={{textAlign: 'center'}}>{p.qty}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: "center", padding: "15px", fontStyle: "italic" }}>
                                            No request details found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalRequestPages > 1 && (
                        <div style={{ justifySelf: 'center' }}>
                            <CustomPagination
                                currentPage={currentRequestPage}
                                totalPages={totalRequestPages}
                                onPageChange={handlePageChange}
                                color="green"
                            />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => {
                        setViewRequestDetailVisible(true);
                        GetRequest();
                        setAvailProducts([]);
                    }}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={ApproveRequest}>
                        Accept
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='dash-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>STOCK REQUEST</h1>
                </div>

                <div className="cardContainer" style={{ height: '60vh', overflowY: 'auto', padding: '10px' }}>
                    {requestList1.length === 0 ? (
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
                                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>No Stock Requests Found</div>
                                <div>There are currently no pending stock requests to display.</div>
                            </div>
                        </div>
                    ) : (
                        requestList1.map((p, i) => (
                            <div
                                className="requestCard"
                                key={i}
                                onClick={() => {
                                    triggerModal('viewRequestDetails', p.request_stock_id);
                                    GetCurrentStoreInventory(location_id);
                                }}
                            >
                                <div className="cardContent">
                                    <div>
                                        <div className="cardRow">
                                            <span className="cardLabel" style={{ fontSize: '30px' }}>REQUEST ID:</span>
                                            <span className="cardValue" style={{ fontSize: '30px', fontWeight: 'bold' }}>{p.request_stock_id}</span>
                                        </div>
                                        <div className="cardRow">
                                            <span className="cardLabel">REQUEST FROM:</span>
                                            <span className="cardValue">{p.reqFrom}</span>
                                        </div>
                                        <div className="cardRow">
                                            <span className="cardLabel">REQUEST BY:</span>
                                            <span className="cardValue">{p.fname} {p.mname} {p.lname}</span>
                                        </div>
                                        <div className="cardRow">
                                            <span className="cardLabel">STATUS:</span>
                                            <span
                                                className="cardValue"
                                                style={{
                                                    color:
                                                        p.request_status === 'Pending'
                                                            ? 'red'
                                                            : p.request_status === 'Approved'
                                                                ? 'green'
                                                                : 'black',
                                                }}
                                            >
                                                {p.request_status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="statusIcon">
                                        {p.request_status === 'Pending' && <span>⟳</span>}
                                        {p.request_status === 'Approved' && <span>✅</span>}
                                        {p.request_status !== 'Pending' && p.request_status !== 'Approved' && <span>📦</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default StockRequestWR;