'use client';
import { useState, useEffect, useMemo } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import Dropdown from 'react-bootstrap/Dropdown';

const ITEMS_PER_PAGE = 9;
const ITEMS_PER_PAGE_DETAILS = 5;

const RequestManagementWR = () => {
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [requestList, setRequestList] = useState([]);
    const [deliverDetails, setDeliverDetails] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const [userList, setUserList] = useState([]);

    // Filter states
    const [requestFromFilter, setRequestFromFilter] = useState('');
    const [requestByFilter, setRequestByFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

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
    const [reqDateTime, setReqDateTime] = useState("");

    const [transferDriver, setTransferDriver] = useState('');
    const [rID, setRID] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageDetails, setCurrentPageDetails] = useState(1);

    const filteredData = useMemo(() => {
        let filtered = [...requestList];

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

        if (statusFilter) {
            filtered = filtered.filter(item => item.request_status === statusFilter);
        }

        if (searchFilter.trim()) {
            const searchTerm = searchFilter.toLowerCase();
            filtered = filtered.filter(item =>
                item.request_stock_id?.toString().includes(searchTerm) ||
                item.reqFrom?.toLowerCase().includes(searchTerm) ||
                `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }, [requestList, requestFromFilter, requestByFilter, statusFilter, searchFilter]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const totalPagesDetails = Math.ceil(deliverDetails.length / ITEMS_PER_PAGE_DETAILS);
    const startIndexDetails = (currentPageDetails - 1) * ITEMS_PER_PAGE_DETAILS;
    const currentItemsDetails = deliverDetails.slice(startIndexDetails, startIndexDetails + ITEMS_PER_PAGE_DETAILS);

    useEffect(() => {
        setCurrentPage(1);
    }, [requestFromFilter, requestByFilter, statusFilter, searchFilter]);

    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));
    }, []);

    useEffect(() => {
        GetRequest();
        GetUser();
        GetLocation();
    }, []);

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
        const url = baseURL + 'requestStock.php';
        const ID = {
            locID: LocationID,
            status: 'OnGoing',
            reqType: 'ReqTo'
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequest2"
                }
            });
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

    const GetDeliveriesData = async (transaction_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        const ID = { transID: transaction_id };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequestData"
                }
            });
            const data = response.data[0];

            setRequestID(response.data[0].request_stock_id);
            setRequestFrom(response.data[0].reqFrom);
            setRequestBy(response.data[0].fname + " " + response.data[0].mname + " " + response.data[0].lname);
            setRequestStatus(response.data[0].request_status);
            GetTrackRequestTimeandDate(data.request_stock_id, data.request_status);

        } catch (error) {
            console.error("Error fetching deliveries list:", error);
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

    const GetDeliveriesDetails = async (transaction_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { reqID: transaction_id };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequestDetails"
                }
            });
            setDeliverDetails(response.data);
        } catch (error) {
            console.error("Error fetching deliveries list:", error);
        }
    };

    const DeliverStock = async () => {
        if (transferDriver === '') {
            showAlertError({
                icon: "error",
                title: "Wait!",
                text: "Please choose a driver first.",
                button: 'Okay'
            });
            return;
        }

        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            accID: accountID,
            reqID: rID,
            driverID: transferDriver
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "DeliverStock"
                }
            });

            if (response.data === 'Success') {
                AlertSucces(
                    "Successfully appointed a driver and it's ready to deliver",
                    "success",
                    true,
                    'Ok'
                );

                setAppointDriverVisible(true);
                setDeliveriesDataVisible(true);
                GetRequest();
                Logs(accountID, 'Deliver the request #' + rID);
            } else {
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

    const handlePageChangeDetails = (page) => {
        if (page >= 1 && page <= totalPagesDetails) {
            setCurrentPageDetails(page);
        }
    };

    const clearAllFilters = () => {
        setRequestFromFilter('');
        setRequestByFilter('');
        setStatusFilter('');
        setSearchFilter('');
        setCurrentPage(1);
    };

    const getUniqueLocations = () => {
        const uniqueLocations = [...new Set(requestList.map(item => item.reqFrom).filter(Boolean))];
        return uniqueLocations.sort();
    };

    const getUniqueUsers = () => {
        const uniqueUsers = [...new Set(requestList.map(item => `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.trim()).filter(name => name))];
        return uniqueUsers.sort();
    };

    const getStatusColor = (status) => {
        switch(status) {
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
            <Alert variant={alertVariant} className='alert-inventory' show={alert1} style={{ backgroundColor: alertBG }}>
                {message}
            </Alert>

            {/* Delivery Details Modal */}
            <Modal show={!deliveriesDataVisible} onHide={() => { setDeliveriesDataVisible(true); }} size='lg' className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Delivery Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    <div className="r-details-head">
                        <div className='r-d-div'>
                            <div className='r-1'><strong>REQUEST ID:</strong> {requestID}</div>
                        </div>
                        <div><strong>REQUEST FROM:</strong> {requestFrom}</div>
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
                                {requestStatus} | {reqDateTime}
                            </span>
                        </div>
                    </div>

                    <div className='tableContainer1' style={{ height: '30vh' }}>
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th className='t2'>Product Code</th>
                                    <th className='t2'>Product Description</th>
                                    <th className='th1'>QTY</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItemsDetails.length > 0 ? (
                                    currentItemsDetails.map((p, i) => (
                                        <tr className='table-row' key={i}>
                                            <td className='td-name'>{p.product_name}</td>
                                            <td className='td-name'>{p.description}</td>
                                            <td>{p.qty}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: "center", padding: "15px", fontStyle: "italic" }}>
                                            No delivery details found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPagesDetails > 1 && (
                        <div style={{ justifySelf: 'center' }}>
                            <CustomPagination
                                currentPage={currentPageDetails}
                                totalPages={totalPagesDetails}
                                onPageChange={handlePageChangeDetails}
                                color="green"
                            />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => { setDeliveriesDataVisible(true); }}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => { setAppointDriverVisible(false); setTransferDriver('') }}>
                        Deliver The Stock
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Appoint Driver Modal */}
            <Modal
                show={!appointDriverVisible}
                onHide={() => { setAppointDriverVisible(true) }}
                size='md'
                centered
            >
                <Modal.Header closeButton style={{ borderBottom: '2px solid #dee2e6' }}>
                    <Modal.Title style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c3e50' }}>
                        Appoint Driver To Deliver
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <label style={{ fontSize: '1rem', fontWeight: '500', color: '#34495e' }}>
                            Choose Driver:
                        </label>

                        <Dropdown>
                            <Dropdown.Toggle
                                variant="primary"
                                size="sm"
                                style={{
                                    width: '100%',
                                    height: '50px',
                                    textAlign: 'left',
                                    backgroundColor: '#fff',
                                    color: 'black',
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid #ced4da',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    padding: '10px 15px'
                                }}
                            >
                                {transferDriver ?
                                    userList.find(driver => driver.account_id?.toString() === transferDriver.toString())?.fname + " " +
                                    userList.find(driver => driver.account_id?.toString() === transferDriver.toString())?.mname + " " +
                                    userList.find(driver => driver.account_id?.toString() === transferDriver.toString())?.lname
                                    : '-- Select a Driver --'
                                }
                            </Dropdown.Toggle>

                            <Dropdown.Menu style={{
                                maxHeight: '300px',
                                overflowY: 'auto',
                                width: '100%',
                                borderRadius: '8px',
                                border: '1px solid #ced4da'
                            }}>
                                <Dropdown.Item
                                    onClick={() => setTransferDriver('')}
                                    style={{ padding: '10px 15px', fontSize: '0.95rem', color: '#6c757d', fontStyle: 'italic' }}
                                >
                                    -- Select a Driver --
                                </Dropdown.Item>

                                {userList
                                    .filter(role => role.role_name?.toLowerCase() === 'driver')
                                    .map((driver) => (
                                        <Dropdown.Item
                                            key={driver.account_id}
                                            onClick={() => setTransferDriver(driver.account_id.toString())}
                                            style={{ padding: '10px 15px', fontSize: '0.95rem' }}
                                        >
                                            {driver.fname + " " + driver.mname + " " + driver.lname}
                                        </Dropdown.Item>
                                    ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        {transferDriver && (
                            <div style={{
                                padding: '10px 15px',
                                backgroundColor: '#e8f5e8',
                                borderRadius: '8px',
                                border: '1px solid #28a745',
                                fontSize: '0.9rem'
                            }}>
                                <strong>Selected Driver: </strong>
                                <span style={{ color: '#28a745' }}>
                                    {userList.find(driver => driver.account_id?.toString() === transferDriver.toString())?.fname + " " +
                                        userList.find(driver => driver.account_id?.toString() === transferDriver.toString())?.mname + " " +
                                        userList.find(driver => driver.account_id?.toString() === transferDriver.toString())?.lname}
                                </span>
                            </div>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '1px solid #dee2e6', padding: '15px' }}>
                    <Button variant="outline-secondary" onClick={() => { setAppointDriverVisible(true) }}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={DeliverStock}
                        disabled={!transferDriver}
                        style={{
                            backgroundColor: transferDriver ? '#2563eb' : '#6c757d',
                            border: 'none',
                            opacity: transferDriver ? 1 : 0.6
                        }}
                    >
                        Confirm Appointment
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='customer-main' style={{overflowY: 'auto'}}>
                <div className='customer-header'>
                    <h1 className='h-customer'>REQUEST MANAGEMENT</h1>
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
                                <div style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 1,
                                    color: '#6c757d'
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                </div>

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
                                            padding: '4px'
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
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
                                <button onClick={() => setRequestFromFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}>×</button>
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
                                <button onClick={() => setRequestByFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}>×</button>
                            </span>
                        )}

                        {!requestFromFilter && !requestByFilter && !searchFilter && (
                            <span style={{ color: '#6c757d' }}>None</span>
                        )}

                        <span style={{ marginLeft: '6px', color: '#6c757d', fontSize: '12px' }}>
                            ({filteredData.length} of {requestList.length})
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
                    minHeight: '400px'
                }}>
                    {currentItems.length > 0 ? (
                        currentItems.map((request, i) => {
                            const statusColors = getStatusColor(request.request_status);
                            return (
                                <div
                                    key={i}
                                    onClick={() => {
                                        setDeliveriesDataVisible(false);
                                        GetDeliveriesData(request.request_stock_id);
                                        GetDeliveriesDetails(request.request_stock_id);
                                        setRID(request.request_stock_id);
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
                                    {/* Top Border */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: `linear-gradient(90deg, ${statusColors.border} 0%, ${statusColors.text} 100%)`
                                    }}></div>

                                    {/* Request ID Badge */}
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
                                                    #{request.request_stock_id}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
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
                                            {request.request_status}
                                        </div>
                                    </div>

                                    {/* Request Details */}
                                    <div style={{ marginBottom: '15px' }}>
                                        {/* Request From */}
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
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                                    <circle cx="12" cy="10" r="3"/>
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

                                        {/* Request By */}
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
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                    <circle cx="12" cy="7" r="4"/>
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

                                    {/* Card Footer */}
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
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                                <line x1="16" y1="2" x2="16" y2="6"/>
                                                <line x1="8" y1="2" x2="8" y2="6"/>
                                                <line x1="3" y1="10" x2="21" y2="10"/>
                                            </svg>
                                            Click to view details
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
                                {requestList.length === 0 ? 'No requests found' : 'No requests match the current filters'}
                            </h4>
                            <p style={{
                                margin: '0',
                                fontSize: '14px',
                                maxWidth: '300px',
                                lineHeight: '1.4'
                            }}>
                                {requestList.length === 0
                                    ? 'No ongoing requests at the moment. New requests will appear here when available.'
                                    : 'Try adjusting your filters to see more results.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && currentItems.length > 0 && (
                    <div style={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '30px',
                        paddingBottom: '20px'
                    }}>
                        <CustomPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            color="green"
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default RequestManagementWR;