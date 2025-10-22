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

const RequestManagementCustomizeWR = () => {

    const [transferDriverName, setTransferDriverName] = useState('');
    const [deliverToID, setDeliverToID] = useState('');

    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [requestList, setRequestList] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const [userList, setUserList] = useState([]);

    // Filter states
    const [requestFromFilter, setRequestFromFilter] = useState('');
    const [requestByFilter, setRequestByFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    const [semiDetails, setSemiDetails] = useState([]);
    const [fullDetails, setFullDetails] = useState([]);

    const [deliveriesDataVisible, setDeliveriesDataVisible] = useState(true);
    const [appointDriverVisible, setAppointDriverVisible] = useState(true);

    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

    const [requestID, setRequestID] = useState('');
    const [requestFrom, setRequestFrom] = useState('');
    const [requestBy, setRequestBy] = useState('');
    const [requestStatus, setRequestStatus] = useState('');
    const [requestDate, setRequestDate] = useState('');
    const [requestTo, setRequestTo] = useState('');
    const [dateAndTime, setDateAndTime] = useState('');

    const [currentSemiDetails, setCurrentSemiDetails] = useState([]);
    const [currentFullDetails, setCurrentFullDetails] = useState([]);

    const [transferDriver, setTransferDriver] = useState('');
    const [rID, setRID] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [currentCardsPage, setCurrentCardsPage] = useState(1);
    const [currentSemiPage, setCurrentSemiPage] = useState(1);
    const [currentFullPage, setCurrentFullPage] = useState(1);

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

    const filteredData = useMemo(() => {
        let filtered = [...requestList];

        // Always filter for "On Going" status first
        filtered = filtered.filter(item => item.status === 'On Going');

        if (requestFromFilter) {
            filtered = filtered.filter(item => {
                return item.reqFrom?.toLowerCase().includes(requestFromFilter.toLowerCase());
            });
        }

        if (requestByFilter) {
            filtered = filtered.filter(item => {
                const fullName = `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase();
                return fullName.includes(requestByFilter.toLowerCase());
            });
        }

        if (searchFilter.trim()) {
            const searchTerm = searchFilter.toLowerCase();
            filtered = filtered.filter(item =>
                item.customize_req_id?.toString().includes(searchTerm) ||
                item.reqFrom?.toLowerCase().includes(searchTerm) ||
                `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }, [requestList, requestFromFilter, requestByFilter, searchFilter]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Pagination for cards - already filtered for "On Going" in filteredData
    const totalCardsPages = Math.ceil(filteredData.length / CARDS_PER_PAGE);
    const startCardsIndex = (currentCardsPage - 1) * CARDS_PER_PAGE;
    const currentCardsItems = filteredData.slice(startCardsIndex, startCardsIndex + CARDS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
        setCurrentCardsPage(1);
        setCurrentSemiPage(1);
        setCurrentFullPage(1);
    }, [requestFromFilter, requestByFilter, statusFilter, searchFilter]);

    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));
    }, []);

    useEffect(() => {
        GetRequest();
        GetUser();
        GetLocation();
        GetSemiDetails();
        GetFullDetails();
    }, []);

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

    const GetUser = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'users.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetUsers"
                }
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

    const GetRequest = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const ID = { locID: LocationID };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetCustomizeRequest"
                }
            });
            console.log(response.data);
            setRequestList(response.data);
        } catch (error) {
            console.error("Error fetching request list:", error);
        }
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
            console.error("Error recording logs events:", error);
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

            if (response.data && response.data.length > 0) {
                const formattedDate = formatDate(response.data[0].date);
                const formattedTime = formatTime(response.data[0].time);
                setDateAndTime(`${formattedDate}, ${formattedTime}`);
            }
        } catch (error) {
            console.error("Error fetching status date:", error);
        }
    };

    const GetDeliveriesData = async (request) => {
        const salesId = request.customize_sales_id;

        setRequestID(request.customize_req_id);
        setRequestFrom(request.reqFrom);
        setRequestBy(`${request.fname} ${request.mname} ${request.lname}`);
        setRequestStatus(request.status);
        setRequestDate(formatDate(request.date));
        setRequestTo(request.reqTo);
        setDeliverToID(request.req_from);

        // Reset pagination when opening new request
        setCurrentSemiPage(1);
        setCurrentFullPage(1);

        await GetStatsAndDate(request.status, request.customize_req_id);

        // Get fresh details data
        const [semiData, fullData] = await Promise.all([
            GetSemiDetails(),
            GetFullDetails()
        ]);

        // Filter by customize_sales_id
        const filteredSemi = semiData.filter(item =>
            parseInt(item.customize_sales_id) === parseInt(salesId)
        );
        const filteredFull = fullData.filter(item =>
            parseInt(item.customize_sales_id) === parseInt(salesId)
        );

        setCurrentSemiDetails(filteredSemi);
        setCurrentFullDetails(filteredFull);
    };

    const DeliverStock = async () => {
        if (transferDriverName === '') {
            alert("Please choose a driver first.");
            return;
        }

        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const locationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const ID = {
            accID: accountID,
            reqID: rID,
            driverName: transferDriverName,
            deliverTo: deliverToID,
            deliverFrom: locationID
        };

        console.log(ID);

        // return;
        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "DeliverCustomize"
                }
            });

            if (response.data === 'Success') {
                // alert("Successfully appointed a driver and it's ready to deliver");
                AlertSucces(
                    "Successfully appointed a driver and it's ready to deliver",
                    "success",
                    true,
                    'Got It'
                );
                setAppointDriverVisible(true);
                setDeliveriesDataVisible(true);
                GetRequest();
                Logs(accountID, 'Deliver the request #' + rID);
            } else {
                // console.log(response.data);
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to deliver the stock!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error delivering stock:", error);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleCardsPageChange = (page) => {
        if (page >= 1 && page <= totalCardsPages) {
            setCurrentCardsPage(page);
        }
    };

    const handleSemiPageChange = (page) => {
        const totalSemiPages = Math.ceil(currentSemiDetails.length / ITEMS_PER_DETAILS_PAGE);
        if (page >= 1 && page <= totalSemiPages) {
            setCurrentSemiPage(page);
        }
    };

    const handleFullPageChange = (page) => {
        const totalFullPages = Math.ceil(currentFullDetails.length / ITEMS_PER_DETAILS_PAGE);
        if (page >= 1 && page <= totalFullPages) {
            setCurrentFullPage(page);
        }
    };

    const clearAllFilters = () => {
        setRequestFromFilter('');
        setRequestByFilter('');
        setSearchFilter('');
        setCurrentPage(1);
        setCurrentCardsPage(1);
    };

    const getUniqueLocations = () => {
        const onGoingRequests = requestList.filter(item => item.status === 'On Going');
        const uniqueLocations = [...new Set(onGoingRequests.map(item => item.reqFrom).filter(Boolean))];
        return uniqueLocations.sort();
    };

    const getUniqueUsers = () => {
        const onGoingRequests = requestList.filter(item => item.status === 'On Going');
        const uniqueUsers = [...new Set(onGoingRequests.map(item => `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.trim()).filter(name => name))];
        return uniqueUsers.sort();
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

    return (
        <>
            <Alert variant={alertVariant} show={alert1} style={{ backgroundColor: alertBG }}>
                {message}
            </Alert>

            {/* Delivery Details Modal */}
            <Modal show={!deliveriesDataVisible} onHide={() => setDeliveriesDataVisible(true)} size='xl'>
                <Modal.Header closeButton>
                    <Modal.Title>Request Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    <div className="r-details-head">
                        <div className='r-d-div'>
                            <div><strong>CUSTOMIZE REQUEST ID:</strong> {requestID}</div>
                            <div><strong>REQUEST DATE:</strong> {requestDate}</div>
                        </div>
                        <div><strong>REQUEST FROM:</strong> {requestFrom}</div>
                        <div><strong>REQUEST TO:</strong> {requestTo}</div>
                        <div><strong>REQUEST BY:</strong> {requestBy}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: requestStatus === "Pending" ? "red"
                                    : requestStatus === "Delivered" ? "green"
                                        : requestStatus === "On Going" ? "orange"
                                            : requestStatus === "On Delivery" ? "goldenrod"
                                                : requestStatus === "Complete" ? "blue"
                                                    : "black",
                                fontWeight: 'bold'
                            }}>
                                {requestStatus} | {dateAndTime}
                            </span>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
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
                            {/* Semi-Customized Items Table */}
                            {currentSemiDetails.length > 0 && (
                                <>
                                    <h6 style={{ padding: '10px', backgroundColor: '#fff3cd', margin: 0, fontWeight: 'bold', color: '#856404' }}>
                                        Semi-Customized Items ({currentSemiDetails.length})
                                    </h6>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                                            <tr>
                                                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', width: '20%' }}>Base Product ID</th>
                                                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', width: '65%' }}>Modifications</th>
                                                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', width: '15%', textAlign: 'center' }}>Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentSemiDetails
                                                .slice((currentSemiPage - 1) * ITEMS_PER_DETAILS_PAGE, currentSemiPage * ITEMS_PER_DETAILS_PAGE)
                                                .map((item, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ padding: '10px', fontWeight: '500' }}>{item.baseProduct_id || 'N/A'}</td>
                                                        <td style={{ padding: '10px' }}>{item.modifications || 'No modifications specified'}</td>
                                                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: '500', fontSize: '16px' }}>{item.qty || 0}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </>
                            )}

                            {/* Full-Customized Items Table */}
                            {currentFullDetails.length > 0 && (
                                <>
                                    <h6 style={{ padding: '10px', backgroundColor: '#d1ecf1', margin: 0, fontWeight: 'bold', color: '#0c5460', marginTop: currentSemiDetails.length > 0 ? '20px' : '0' }}>
                                        Full-Customized Items ({currentFullDetails.length})
                                    </h6>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                                            <tr>
                                                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', width: '35%' }}>Description</th>
                                                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', width: '50%' }}>Additional Description</th>
                                                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', width: '15%', textAlign: 'center' }}>Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentFullDetails
                                                .slice((currentFullPage - 1) * ITEMS_PER_DETAILS_PAGE, currentFullPage * ITEMS_PER_DETAILS_PAGE)
                                                .map((item, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ padding: '10px', fontWeight: '500' }}>{item.description || 'N/A'}</td>
                                                        <td style={{ padding: '10px' }}>{item.additional_description || 'N/A'}</td>
                                                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: '500', fontSize: '16px' }}>{item.qty || 0}</td>
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

                        {/* Fixed Pagination Area */}
                        <div style={{
                            borderTop: '1px solid #ddd',
                            backgroundColor: '#f8f9fa',
                            minHeight: '60px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            {/* Semi-Customized Pagination */}
                            {currentSemiDetails.length > 0 && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: '10px',
                                    minHeight: '50px',
                                    alignItems: 'center'
                                }}>
                                    {Math.ceil(currentSemiDetails.length / ITEMS_PER_DETAILS_PAGE) > 1 ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '12px', color: '#856404', fontWeight: '600' }}>Semi-Customized:</span>
                                            <CustomPagination
                                                currentPage={currentSemiPage}
                                                totalPages={Math.ceil(currentSemiDetails.length / ITEMS_PER_DETAILS_PAGE)}
                                                onPageChange={handleSemiPageChange}
                                                color="#856404"
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ height: '40px' }}></div>
                                    )}
                                </div>
                            )}

                            {/* Full-Customized Pagination */}
                            {currentFullDetails.length > 0 && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: '10px',
                                    minHeight: '50px',
                                    alignItems: 'center',
                                    borderTop: currentSemiDetails.length > 0 ? '1px solid #e0e0e0' : 'none'
                                }}>
                                    {Math.ceil(currentFullDetails.length / ITEMS_PER_DETAILS_PAGE) > 1 ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '12px', color: '#0c5460', fontWeight: '600' }}>Full-Customized:</span>
                                            <CustomPagination
                                                currentPage={currentFullPage}
                                                totalPages={Math.ceil(currentFullDetails.length / ITEMS_PER_DETAILS_PAGE)}
                                                onPageChange={handleFullPageChange}
                                                color="#0c5460"
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ height: '40px' }}></div>
                                    )}
                                </div>
                            )}

                            {/* Empty state spacer */}
                            {currentSemiDetails.length === 0 && currentFullDetails.length === 0 && (
                                <div style={{ height: '60px' }}></div>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setDeliveriesDataVisible(true)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => { setAppointDriverVisible(false); setTransferDriver('') }}>
                        Deliver The Stock
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Appoint Driver Modal */}
            <Modal show={!appointDriverVisible} onHide={() => setAppointDriverVisible(true)} size='md' centered>
                <Modal.Header closeButton style={{ borderBottom: '2px solid #dee2e6' }}>
                    <Modal.Title style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c3e50' }}>
                        Enter The Driver Name
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <label style={{ fontSize: '1rem', fontWeight: '500', color: '#34495e' }}>
                            Enter Driver name:
                        </label>
                        <input
                            type="text"
                            value={transferDriverName}
                            onChange={(e) => setTransferDriverName(e.target.value)}
                            style={{
                                padding: '10px',
                                border: '1px solid #ced4da',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                color: '#34495e'
                            }}
                        />



                    </div>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '1px solid #dee2e6', padding: '15px' }}>
                    <Button variant="outline-secondary" onClick={() => setAppointDriverVisible(true)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={DeliverStock}
                        disabled={!transferDriverName || transferDriverName.trim().length === 0}
                        style={{
                            backgroundColor:
                                transferDriverName && transferDriverName.trim().length > 0
                                    ? '#2563eb'   // ✅ active color
                                    : '#6c757d',  // ❌ disabled color
                            border: 'none',
                            opacity:
                                transferDriverName && transferDriverName.trim().length > 0
                                    ? 1
                                    : 0.6
                        }}
                    >
                        Confirm Appointment
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='dash-main' style={{ overflowY: 'auto', padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <h1>REQUESTss MANAGEMENT</h1>
                </div>

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
                                value={requestFromFilter}
                                onChange={(e) => setRequestFromFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Locations</option>
                                {getUniqueLocations().map((location, index) => (
                                    <option key={index} value={location}>{location}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Request By
                            </label>
                            <select
                                value={requestByFilter}
                                onChange={(e) => setRequestByFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Users</option>
                                {getUniqueUsers().map((user, index) => (
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
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px 8px 35px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                                {searchFilter && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchFilter('')}
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
                        {requestFromFilter && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '12px',
                                fontSize: '12px'
                            }}>
                                {requestFromFilter}
                                <button onClick={() => setRequestFromFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '16px' }}>×</button>
                            </span>
                        )}
                        {requestByFilter && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '12px',
                                fontSize: '12px'
                            }}>
                                {requestByFilter}
                                <button onClick={() => setRequestByFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '16px' }}>×</button>
                            </span>
                        )}
                        {!requestFromFilter && !requestByFilter && !searchFilter && (
                            <span style={{ color: '#6c757d' }}>None</span>
                        )}
                        <span style={{ marginLeft: '6px', color: '#6c757d', fontSize: '12px' }}>
                            ({filteredData.length} of {requestList.filter(item => item.status === 'On Going').length} on-going)
                        </span>
                    </div>
                    <button onClick={clearAllFilters} style={{
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
                    {currentCardsItems.length > 0 ? (
                        currentCardsItems.map((request, i) => {
                            const statusColors = getStatusColor(request.status);
                            return (
                                <div
                                    key={i}
                                    onClick={() => {
                                        setDeliveriesDataVisible(false);
                                        GetDeliveriesData(request);
                                        setRID(request.customize_req_id);
                                        // setDeliverToID(request.req_from);
                                        // alert(request.req_from);
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
                                                    #{request.customize_req_id}
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
                                {requestList.filter(item => item.status === 'On Going').length === 0 ? 'No on-going requests found' : 'No requests match the current filters'}
                            </h4>
                            <p style={{
                                margin: '0',
                                fontSize: '14px',
                                maxWidth: '300px',
                                lineHeight: '1.4'
                            }}>
                                {requestList.filter(item => item.status === 'On Going').length === 0
                                    ? 'No on-going requests at the moment. New requests will appear here when they are in progress.'
                                    : 'Try adjusting your filters to see more results.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination - Always visible with fixed position */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '30px',
                    paddingBottom: '20px',
                    minHeight: '60px'
                }}>
                    {totalCardsPages > 1 ? (
                        <CustomPagination
                            currentPage={currentCardsPage}
                            totalPages={totalCardsPages}
                            onPageChange={handleCardsPageChange}
                            color="green"
                        />
                    ) : (
                        <div style={{ height: '40px' }}></div>
                    )}
                </div>
            </div>
        </>
    );
};

export default RequestManagementCustomizeWR;