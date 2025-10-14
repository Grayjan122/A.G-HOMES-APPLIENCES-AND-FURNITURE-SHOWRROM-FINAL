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

const CustomizeRequest = () => {
    // User session data
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');

    // Main data states
    const [requestList1, setRequestList1] = useState([]);
    const [semiDetails, setSemiDetails] = useState([]);
    const [fullDetails, setFullDetails] = useState([]);

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
    const [s_salesID, setS_SalesID] = useState('');
    const [s_reqDate, setS_ReqDate] = useState('');
    const [s_reqTime, setS_ReqTime] = useState('');
    const [s_reqBy, setS_ReqBy] = useState('');
    const [s_reqFrom, setS_ReqFrom] = useState('');
    const [s_reqTo, setS_ReqTo] = useState('');
    const [s_reqStatus, setS_ReqStatus] = useState('');
    const [reqFromId, setReqFromId] = useState('');
    const [reqToId, setReqToId] = useState('');
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

    // Filtered details for current request
    const [currentSemiDetails, setCurrentSemiDetails] = useState([]);
    const [currentFullDetails, setCurrentFullDetails] = useState([]);

    // Checkbox and product availability states
    const [checkedItems, setCheckedItems] = useState({});
    const [unavailableProducts, setUnavailableProducts] = useState([]);
    const [availProduct, setAvailProducts] = useState([]);

    // Pagination for request details
    const [currentRequestPage, setCurrentRequestPage] = useState(1);
    const totalItems = currentSemiDetails.length + currentFullDetails.length;
    const totalRequestPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startRequestIndex = (currentRequestPage - 1) * ITEMS_PER_PAGE;

    // Initialize user session data
    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));
    }, []);

    // Load initial data
    useEffect(() => {
        GetRequest();
        GetSemiDetails();
        GetFullDetails();
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

    // Get pending customize requests for the current location
    const GetRequest = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const ID = {
            locID: LocationID,
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetCustomizeRequest"
                }
            });
            setRequestList1(response.data);
        } catch (error) {
            console.error("Error fetching request list:", error);
        }
    };

    // Get all semi-customized details
    const GetSemiDetails = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetCustomizeRequestDetailSemi"
                }
            });
            console.log("Semi Details Response:", response.data);
            setSemiDetails(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching semi details:", error);
            return [];
        }
    };

    // Get all full-customized details
    const GetFullDetails = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetCustomizeRequestDetailFull"
                }
            });
            console.log("Full Details Response:", response.data);
            setFullDetails(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching full details:", error);
            return [];
        }
    };



    // Get request metadata (requester info - just for user name)
    const GetRequestD = async (customize_req_id) => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const ID = { customizeReqID: customize_req_id, locID: LocationID };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetCustomizeRequestD"
                }
            });

            if (response.data && response.data.length > 0) {
                const data = response.data[0];
                // Only update the requester name
                setS_ReqBy(`${data.fname} ${data.mname} ${data.lname}`);
            }
        } catch (error) {
            console.error("Error fetching request details:", error);
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

    // Approve and process the customize request
    const ApproveRequest = async () => {
        const accountID = sessionStorage.getItem('user_id');

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const reqDetails1 = {
           accID: accountID,
           customizeID: s_reqID
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(reqDetails1),
                    operation: "AcceptCustomizeRequestWR",
                    // semiDetailsList: JSON.stringify(currentSemiDetails),
                    // fullDetailsList: JSON.stringify(currentFullDetails),
                }
            });

            if (response.data === 'Success') {
                AlertSucces(
                    "Customize request is successfully approved!",
                    "success",
                    true,
                    'Got It'
                );
                GetRequest();
                GetSemiDetails();
                GetFullDetails();
                setViewRequestDetailVisible(true);
                Logs(accountID, 'Accept the customize request #' + s_reqID);
            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to approve the customize request!',
                    button: 'Try Again'
                });
                console.log(response.data);
                
            }
        } catch (error) {
            console.error("Error ", error);
        }
    };

    // Handle modal triggers
    const triggerModal = async (operation, request) => {
        console.log("=== Trigger Modal ===");
        console.log("Operation:", operation);
        console.log("Request Object:", request);

        switch (operation) {
            case 'viewRequestDetails':
                // Use the customize_sales_id from the request directly
                const salesId = request.customize_sales_id;
                console.log("Sales ID from request:", salesId);

                // Set basic request info immediately
                setS_ReqID(request.customize_req_id);
                setS_SalesID(request.customize_sales_id);
                setS_ReqDate(formatDate(request.date));
                setS_ReqTime(request.time);
                setS_ReqFrom(request.reqFrom);
                setS_ReqTo(request.reqTo);
                setS_ReqStatus(request.status);
                setReqFromId(request.req_from);
                setReqToId(request.req_to);
                setReqDateTime(request.date + " • " + request.time);
                setS_ReqBy(request.lname + ", " + request.fname + " " + request.mname);
                GetStatsAndDate(request.status, request.customize_req_id);

                // Get fresh details data
                const [semiData, fullData] = await Promise.all([
                    GetSemiDetails(),
                    GetFullDetails()
                ]);

                console.log("All Semi Data:", semiData);
                console.log("All Full Data:", fullData);

                // Filter by customize_sales_id
                const filteredSemi = semiData.filter(item =>
                    parseInt(item.customize_sales_id) === parseInt(salesId)
                );
                const filteredFull = fullData.filter(item =>
                    parseInt(item.customize_sales_id) === parseInt(salesId)
                );

                console.log("Filtered Semi for sales ID", salesId, ":", filteredSemi);
                console.log("Filtered Full for sales ID", salesId, ":", filteredFull);

                setCurrentSemiDetails(filteredSemi);
                setCurrentFullDetails(filteredFull);
                setCurrentRequestPage(1);

                // Get additional request details (user info)
                await GetRequestD(request.customize_req_id);

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

    const [dateAndTime, setDateAndTime] = useState(null);
    const GetStatsAndDate = async (stats, CR_ID) => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
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


            // Use it like this:
            const formattedDate = formatDate(response.data[0].date);
            const formattedTime = formatTime(response.data[0].time);
            setDateAndTime(`${formattedDate}, ${formattedTime}`);
        } catch (error) {
            console.error("Error fetching request list:", error);
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
                setCurrentSemiDetails([]);
                setCurrentFullDetails([]);
            }} size='xl' className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Customize Request Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    <div className="r-details-head">
                        <div className='r-d-div'>
                            <div className='r-1'><strong>CUSTOMIZE REQUEST ID:</strong> {s_reqID}</div>
                            <div><strong>REQUEST DATE:</strong> {s_reqDate}</div>
                        </div>

                        <div><strong>REQUEST FROM:</strong> {s_reqFrom}</div>
                        <div><strong>REQUEST TO:</strong> {s_reqTo}</div>
                        <div><strong>REQUEST BY:</strong> {s_reqBy}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: s_reqStatus === 'Pending' ? 'red' : s_reqStatus === 'Approved' ? 'green' : 'black',
                                fontWeight: 'bold'
                            }}>
                                {s_reqStatus} | {dateAndTime}
                            </span>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div style={{ display: 'flex', gap: '15px', marginTop: '15px', marginLeft: '30px' }}>
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

                    <div className='tableContainer1' style={{ height: '40vh', overflowY: 'auto', marginTop: '20px' }}>
                        {/* Semi-Customized Items Table */}
                        {currentSemiDetails.length > 0 && (
                            <>
                                <h6 style={{ padding: '10px', backgroundColor: '#fff3cd', margin: 0, fontWeight: 'bold', color: '#856404' }}>
                                    Semi-Customized Items ({currentSemiDetails.length})
                                </h6>
                                <table className='table table-bordered' style={{ marginBottom: '20px' }}>
                                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                                        <tr>
                                            <th style={{ width: '20%' }}>Base Product ID</th>
                                            <th style={{ width: '65%' }}>Modifications</th>
                                            <th style={{ width: '15%', textAlign: 'center' }}>Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentSemiDetails.map((item, i) => (
                                            <tr key={`semi-${i}`}>
                                                <td style={{ fontWeight: '500' }}>{item.baseProduct_id || 'N/A'}</td>
                                                <td>{item.modifications || 'No modifications specified'}</td>
                                                <td style={{ textAlign: 'center', fontWeight: '500', fontSize: '16px' }}>{item.qty || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* Full-Customized Items Table */}
                        {currentFullDetails.length > 0 && (
                            <>
                                <h6 style={{ padding: '10px', backgroundColor: '#d1ecf1', margin: 0, fontWeight: 'bold', color: '#0c5460' }}>
                                    Full-Customized Items ({currentFullDetails.length})
                                </h6>
                                <table className='table table-bordered'>
                                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                                        <tr>
                                            <th style={{ width: '35%' }}>Description</th>
                                            <th style={{ width: '50%' }}>Additional Description</th>
                                            <th style={{ width: '15%', textAlign: 'center' }}>Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentFullDetails.map((item, i) => (
                                            <tr key={`full-${i}`}>
                                                <td style={{ fontWeight: '500' }}>{item.description || 'N/A'}</td>
                                                <td>{item.additional_description || 'N/A'}</td>
                                                <td style={{ textAlign: 'center', fontWeight: '500', fontSize: '16px' }}>{item.qty || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {currentSemiDetails.length === 0 && currentFullDetails.length === 0 && (
                            <div style={{ textAlign: "center", padding: "30px", fontStyle: "italic", color: '#666' }}>
                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
                                <div style={{ fontSize: '16px' }}>No customize details found for this request</div>
                            </div>
                        )}
                    </div>



                    {totalRequestPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
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
                        setCurrentSemiDetails([]);
                        setCurrentFullDetails([]);
                    }}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={ApproveRequest}>
                        Accept Request
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='customer-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>CUSTOMIZE REQUEST</h1>
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
                                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>No Customize Requests Found</div>
                                <div>There are currently no pending customize requests to display.</div>
                            </div>
                        </div>
                    ) : (
                        requestList1
                        .filter((p) => p.status === 'Pending')
                        .map((p, i) => (
                            <div
                                className="requestCard"
                                key={i}
                                onClick={() => {
                                    triggerModal('viewRequestDetails', p);
                                    GetCurrentStoreInventory(location_id);
                                }}
                            >
                                <div className="cardContent">
                                    <div>
                                        <div className="cardRow">
                                            <span className="cardLabel" style={{ fontSize: '30px' }}>CUSTOMIZE REQUEST ID:</span>
                                            <span className="cardValue" style={{ fontSize: '30px', fontWeight: 'bold' }}>{p.customize_req_id}</span>
                                        </div>

                                        <div className="cardRow">
                                            <span className="cardLabel">REQUEST FROM:</span>
                                            <span className="cardValue">{p.reqFrom}</span>
                                        </div>
                                        <div className="cardRow">
                                            <span className="cardLabel">REQUEST TO:</span>
                                            <span className="cardValue">{p.reqTo}</span>
                                        </div>
                                        {/* <div className="cardRow">
                                            <span className="cardLabel">DATE & TIME:</span>
                                            <span className="cardValue">{formatDate(p.date)} • {formatTime(p.time)}</span>
                                        </div> */}
                                        <div className="cardRow">
                                            <span className="cardLabel">STATUS:</span>
                                            <span
                                                className="cardValue"
                                                style={{
                                                    color:
                                                        p.status === 'Pending'
                                                            ? 'red'
                                                            : p.status === 'Approved'
                                                                ? 'green'
                                                                : 'black',
                                                }}
                                            >
                                                {p.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="statusIcon">
                                        {p.status === 'Pending' && <span>⟳</span>}
                                        {p.status === 'Approved' && <span>✅</span>}
                                        {p.status !== 'Pending' && p.status !== 'Approved' && <span>📦</span>}
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

export default CustomizeRequest;