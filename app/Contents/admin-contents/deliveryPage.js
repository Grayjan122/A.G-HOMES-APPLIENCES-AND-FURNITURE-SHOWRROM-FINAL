'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const ITEMS_PER_PAGE = 8;
const ITEMS_PER_PAGE1 = 5;

const DeliveryAdmin = () => {
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [requestList1, setRequestList1] = useState([]);
    const [requestList2, setRequestList2] = useState([]);
    const [userList, setUserList] = useState([]);
    const [locationList, setLocationList] = useState([]);

    // Filter states
    const [deliverToFilter, setDeliverToFilter] = useState('');
    const [driverFilter, setDriverFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    const [currentPage1, setCurrentPage1] = useState(1);

    useEffect(()=>{
        
    },[]);

    // Check for filter configuration from dashboard navigation
    useEffect(() => {
        const savedFilter = sessionStorage.getItem('deliveryPageFilter');
        if (savedFilter) {
            try {
                const filterConfig = JSON.parse(savedFilter);
                
                if (filterConfig.statusFilter) {
                    setStatusFilter(filterConfig.statusFilter);
                }
                if (filterConfig.deliverToFilter) {
                    setDeliverToFilter(filterConfig.deliverToFilter);
                }
                if (filterConfig.driverFilter) {
                    setDriverFilter(filterConfig.driverFilter);
                }
                if (filterConfig.searchFilter) {
                    setSearchFilter(filterConfig.searchFilter);
                }
                
                sessionStorage.removeItem('deliveryPageFilter');
            } catch (error) {
                console.error('Error parsing delivery filter config:', error);
                sessionStorage.removeItem('deliveryPageFilter');
            }
        }
    }, []);
   
    
    // Apply filters to the data
    const filteredData = useMemo(() => {
        let filtered = [...requestList1];

        if (deliverToFilter) {
            filtered = filtered.filter(item => {
                return item.request_from?.toString() == deliverToFilter.toString();
            });
        }

        if (driverFilter) {
            filtered = filtered.filter(item => {
                return item.account_id?.toString() === driverFilter.toString();
            });
        }

        if (statusFilter) {
            filtered = filtered.filter(item => item.delivery_status === statusFilter);
        }

        if (searchFilter.trim()) {
            const searchTerm = searchFilter.toLowerCase();
            filtered = filtered.filter(item =>
                item.request_stock_id?.toString().includes(searchTerm) ||
                item.location_name?.toLowerCase().includes(searchTerm) ||
                `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }, [requestList1, deliverToFilter, driverFilter, statusFilter, searchFilter]);

    // Pagination calculations using filtered data
    const totalPages1 = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex1 = (currentPage1 - 1) * ITEMS_PER_PAGE;
    const currentItems1 = filteredData.slice(startIndex1, startIndex1 + ITEMS_PER_PAGE);

    const [deliverDetailsVisible, setDeliverDetailsVisible] = useState(true);
    const [deliverDetails, setDeliverDetails] = useState([]);

    const [currentPage2, setCurrentPage2] = useState(1);
    const totalPages2 = Math.ceil(deliverDetails.length / ITEMS_PER_PAGE1);
    const startIndex2 = (currentPage2 - 1) * ITEMS_PER_PAGE1;
    const currentItems2 = deliverDetails.slice(startIndex2, startIndex2 + ITEMS_PER_PAGE1);

    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

    const [deliveriesDataVisible, setDeliveriesDataVisible] = useState(true);
    const [dd_trandferID, setDD_TraferID] = useState('');
    const [dd_dtID, setDD_dtID] = useState('');
    const [dd_tranferTo, setDD_TraferTo] = useState('');
    const [dd_Driver, setDD_Driver] = useState('');
    const [dd_Status, setDD_Status] = useState('');
    const [dd_reqID, setDD_ReqID] = useState('');
    const [updateStatus, setUpdateStatus] = useState('');
    const [updateStatusVisible, setUpdateStatusVisible] = useState(true);
    const [requestID, setRequestID] = useState('');
    const [requestFrom, setRequestFrom] = useState('');
    const [requestBy, setRequestBY] = useState('');
    const [requestStatus, setRequesStatus] = useState('');
    const [reqDateTime, setReqDateTime] = useState("");

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage1(1);
    }, [deliverToFilter, driverFilter, statusFilter, searchFilter]);

    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));
    }, []);

    useEffect(() => {
        GetRequest();
        GetUser();
        GetLocation();
    }, []);

    const GetLocation = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const response = await axios.get(`${baseURL}location.php`, {
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

    const Logs = async (accID, activity) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'audit-log.php';
        const Details = {
            accID: accID,
            activity: activity
        }
        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(Details),
                    operation: "Logs"
                }
            });
        } catch (error) {
            console.error("Error recording logs events:", error);
        }
        return;
    };

    const GetRequest = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            locID: LocationID,
            status: 'OnDeliver',
            reqType: 'ReqTo'
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetReqDelivery"
                }
            });
            setRequestList1(response.data);
            
            console.log("Request data:", response.data);
            if (response.data && response.data.length > 0) {
                console.log("Sample item structure:", response.data[0]);
                console.log("Available keys:", Object.keys(response.data[0]));
            }
        } catch (error) {
            console.error("Error fetching request list:", error);
        }
        return;
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

    const GetDeliveriesData = async (transaction_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        const ID = {
            transID: transaction_id
        }

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
            setRequestBY(response.data[0].fname + " " + response.data[0].mname + " " + response.data[0].lname);
            setRequesStatus(response.data[0].request_status);
            GetTrackRequestTimeandDate(data.request_stock_id, data.request_status);
        } catch (error) {
            console.error("Error fetching deliveries list:", error);
        }
        return;
    };

    const GetDeliveriesDetails = async (transaction_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            reqID: transaction_id
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequestDetails"
                }
            });
            setDeliverDetails(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching deliveries list:", error);
        }
        return;
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
            
            console.log("User data:", response.data);
            if (response.data && response.data.length > 0) {
                console.log("Sample user structure:", response.data[0]);
            }
        } catch (error) {
            console.error("Error fetching user list:", error);
        }
    };

    const MarkComplete = async () => {
        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        const ID = {
            reqID: requestID,
            accID: accountID,
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "MarkComplete"
                }
            });

            if (response.data == 'Success') {
                AlertSucces(
                    "The delivery is now complete!",
                    "success",
                    true,
                    'Good'
                );
                setDeliveriesDataVisible(true);
                GetRequest();
                Logs(accountID, 'Mark the request #' + requestID + " to complete");
                return;
            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to mark the delivery complete!',
                    button: 'Try Again'
                });
                return;
            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
        return;
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages1) {
            setCurrentPage1(page);
        }
    };

    const handlePageChangeDetails = (page) => {
        if (page >= 1 && page <= totalPages2) {
            setCurrentPage2(page);
        }
    };

    const clearAllFilters = () => {
        setDeliverToFilter('');
        setDriverFilter('');
        setStatusFilter('');
        setSearchFilter('');
        setCurrentPage1(1);
    };

    const getLocationName = (id) => {
        const location = locationList.find(loc => loc.location_id?.toString() === id?.toString());
        return location ? location.location_name : '';
    };

    const getDriverName = (id) => {
        const driver = userList.find(user => user.account_id?.toString() === id?.toString());
        return driver ? `${driver.fname || ''} ${driver.mname || ''} ${driver.lname || ''}` : '';
    };

    return (
        <>
            <Alert variant={alertVariant} className='alert-inventory' show={alert1} style={{ backgroundColor: alertBG }}>
                {message}
            </Alert>

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
                                color: requestStatus === "Delivered"
                                    ? "green"
                                    : requestStatus === "On Delivery"
                                        ? "goldenrod"
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
                                {currentItems2.map((p, i) => (
                                    <tr className='table-row' key={i}>
                                        <td className='td-name'>{p.product_name}</td>
                                        <td className='td-name'>{p.description}</td>
                                        <td>{p.qty}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages2 > 1 && (
                        <div style={{ justifySelf: 'center', marginTop: '10px' }}>
                            <CustomPagination
                                currentPage={currentPage2}
                                totalPages={totalPages2}
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
                </Modal.Footer>
            </Modal>

            <div className='customer-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>DELIVERY MANAGEMENT</h1>
                </div>

               {/* Enhanced Filter Controls */}
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
                        {/* Deliver To Filter */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '5px', 
                                fontWeight: '500', 
                                fontSize: '14px'
                            }}>
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

                        {/* Driver Filter */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '5px', 
                                fontWeight: '500', 
                                fontSize: '14px'
                            }}>
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
                                            {driver.fname + " " + driver.mname + " " + driver.lname}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '5px', 
                                fontWeight: '500', 
                                fontSize: '14px'
                            }}>
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

                        {/* Search Filter */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '5px', 
                                fontWeight: '500', 
                                fontSize: '14px'
                            }}>
                                Search Deliveries
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
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Search by ID, location, or driver..."
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
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Clear search"
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active filters section */}
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
                        
                        {deliverToFilter && (
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
                                Deliver To: {getLocationName(deliverToFilter)}
                                <button
                                    type="button"
                                    onClick={() => setDeliverToFilter('')}
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
                                    title="Remove filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {driverFilter && (
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
                                Driver: {getDriverName(driverFilter)}
                                <button
                                    type="button"
                                    onClick={() => setDriverFilter('')}
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
                                    title="Remove driver filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {statusFilter && (
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
                                Status: {statusFilter}
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('')}
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

                        {!deliverToFilter && !driverFilter && !statusFilter && !searchFilter && (
                            <span style={{ color: '#6c757d' }}>None</span>
                        )}
                        
                        <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                            ({filteredData.length} of {requestList1.length} records shown)
                        </span>
                    </div>
                    
                    <div>
                        <button
                            type="button"
                            onClick={clearAllFilters}
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

                {/* Delivery Cards Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '20px',
                    padding: '10px 0',
                    minHeight: '400px'
                }}>
                    {currentItems1 && currentItems1.length > 0 ? (
                        currentItems1.map((delivery, i) => (
                            <div
                                key={i}
                                onClick={() => {
                                    setDeliveriesDataVisible(false);
                                    GetDeliveriesData(delivery.request_stock_id);
                                    GetDeliveriesDetails(delivery.request_stock_id);
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
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(255, 152, 0, 0.15)';
                                    e.currentTarget.style.borderColor = '#ff9800';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                    e.currentTarget.style.borderColor = '#e9ecef';
                                }}
                            >
                                {/* Status Color Bar */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: delivery.delivery_status === "Delivered"
                                        ? 'linear-gradient(90deg, #28a745 0%, #20c997 100%)'
                                        : 'linear-gradient(90deg, #ffc107 0%, #ff9800 100%)'
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
                                            background: delivery.delivery_status === "Delivered"
                                                ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                                                : 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '24px',
                                            flexShrink: 0
                                        }}>
                                            🚚
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
                                                #{delivery.request_stock_id}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div style={{
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        backgroundColor: delivery.delivery_status === "Delivered"
                                            ? '#d4edda'
                                            : '#fff3cd',
                                        color: delivery.delivery_status === "Delivered"
                                            ? '#155724'
                                            : '#856404',
                                        border: `2px solid ${delivery.delivery_status === "Delivered" ? '#28a745' : '#ffc107'}`
                                    }}>
                                        {delivery.delivery_status}
                                    </div>
                                </div>

                                {/* Delivery Details */}
                                <div style={{ marginBottom: '15px' }}>
                                    {/* Deliver To */}
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
                                                {delivery.location_name}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Driver */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '10px',
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
                                                {`${delivery.fname || ''} ${delivery.mname || ''} ${delivery.lname || ''}`.trim() || 'Not Assigned'}
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
                                        border: '2px solid #ff9800',
                                        backgroundColor: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ff9800',
                                        fontSize: '16px',
                                        transition: 'all 0.2s'
                                    }}>
                                        →
                                    </div>
                                </div>
                            </div>
                        ))
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
                                {requestList1.length === 0 ? 'No ongoing delivery' : 'No deliveries match the current filters'}
                            </h4>
                            <p style={{
                                margin: '0',
                                fontSize: '14px',
                                maxWidth: '300px',
                                lineHeight: '1.4'
                            }}>
                                {requestList1.length === 0 
                                    ? 'All deliveries are currently complete. New delivery requests will appear here when available.'
                                    : 'Try adjusting your filters to see more results.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages1 > 1 && currentItems1 && currentItems1.length > 0 && (
                    <div style={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '30px',
                        paddingBottom: '20px'
                    }}>
                        <CustomPagination
                            currentPage={currentPage1}
                            totalPages={totalPages1}
                            onPageChange={handlePageChange}
                            color="green"
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default DeliveryAdmin;