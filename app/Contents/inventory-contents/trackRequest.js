'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import CustomPagination from '@/app/Components/Pagination/pagination';

const ITEMS_PER_PAGE_TRACK_REQ = 9;
const ITEMS_PER_PAGE_DETAILS = 5;
const ITEMS_PER_PAGE_ARCHIVE = 6;

const TrackRequestIM = () => {
    // Core state variables
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [myRequestList, setMyRequestList] = useState([]);
    const [locationList, setLocationList] = useState([]);

    // Filter states for main table
    const [requestFromFilter, setRequestFromFilter] = useState('');
    const [requestToFilter, setRequestToFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    // Archive modal states
    const [showArchive, setShowArchive] = useState(false);
    const [archiveRequestList, setArchiveRequestList] = useState([]);
    const [archiveCurrentPage, setArchiveCurrentPage] = useState(1);

    // Archive filter states
    const [archiveRequestFromFilter, setArchiveRequestFromFilter] = useState('');
    const [archiveRequestToFilter, setArchiveRequestToFilter] = useState('');
    const [archiveUserFilter, setArchiveUserFilter] = useState('');
    const [archiveSearchFilter, setArchiveSearchFilter] = useState('');

    // Progress tracker state
    const steps = [
        "Request Placed",
        "In Progress",
        "On Delivery",
        "Delivered",
        "Complete",
    ];
    const [currentStep, setCurrentStep] = useState(0);

    // Modal visibility state
    const [show, setShow] = useState(false);
    const [trackRequestDetailsVisible, setTrackRequestDetailsVisible] = useState(true);
    const [trackReqVisible, setTrackReqVisible] = useState(true);

    // Request details state
    const [myRequestDetails, setMyRequestDetails] = useState([]);
    const [s_reqID, setS_ReqID] = useState('');
    const [s_reqDate, setS_ReqDate] = useState('');
    const [s_reqBy, setS_ReqBy] = useState('');
    const [s_reqFrom, setS_ReqFrom] = useState('');
    const [s_reqTo, setS_ReqTo] = useState('');
    const [s_reqStatus, setS_ReqStatus] = useState('');
    const [reqReports, setReqReports] = useState([]);
    const [reqDateTime, setReqDateTime] = useState("");

    // Alert state
    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPage1, setCurrentPage1] = useState(1);

    // Filter main data to show only non-complete requests
    const nonCompleteRequests = useMemo(() => {
        return myRequestList.filter(request => request.request_status !== 'Complete');
    }, [myRequestList]);

    // Apply filters to the non-complete data
    const filteredData = useMemo(() => {
        let filtered = [...nonCompleteRequests];

        if (requestFromFilter) {
            filtered = filtered.filter(item =>
                item.reqFrom?.toLowerCase().includes(requestFromFilter.toLowerCase())
            );
        }

        if (requestToFilter) {
            filtered = filtered.filter(item =>
                item.reqTo?.toLowerCase().includes(requestToFilter.toLowerCase())
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(item => item.request_status === statusFilter);
        }

        if (userFilter) {
            filtered = filtered.filter(item => {
                const fullName = `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase();
                return fullName.includes(userFilter.toLowerCase());
            });
        }

        if (searchFilter.trim()) {
            const searchTerm = searchFilter.toLowerCase();
            filtered = filtered.filter(item =>
                item.request_stock_id?.toString().includes(searchTerm) ||
                item.reqFrom?.toLowerCase().includes(searchTerm) ||
                item.reqTo?.toLowerCase().includes(searchTerm) ||
                `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }, [nonCompleteRequests, requestFromFilter, requestToFilter, statusFilter, userFilter, searchFilter]);

    // Apply filters to archive data
    const filteredArchiveData = useMemo(() => {
        let filtered = [...archiveRequestList];

        if (archiveRequestFromFilter) {
            filtered = filtered.filter(item =>
                item.reqFrom?.toLowerCase().includes(archiveRequestFromFilter.toLowerCase())
            );
        }

        if (archiveRequestToFilter) {
            filtered = filtered.filter(item =>
                item.reqTo?.toLowerCase().includes(archiveRequestToFilter.toLowerCase())
            );
        }

        if (archiveUserFilter) {
            filtered = filtered.filter(item => {
                const fullName = `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase();
                return fullName.includes(archiveUserFilter.toLowerCase());
            });
        }

        if (archiveSearchFilter.trim()) {
            const searchTerm = archiveSearchFilter.toLowerCase();
            filtered = filtered.filter(item =>
                item.request_stock_id?.toString().includes(searchTerm) ||
                item.reqFrom?.toLowerCase().includes(searchTerm) ||
                item.reqTo?.toLowerCase().includes(searchTerm) ||
                `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }, [archiveRequestList, archiveRequestFromFilter, archiveRequestToFilter, archiveUserFilter, archiveSearchFilter]);

    // Pagination
    const archiveTotalPages = Math.ceil(filteredArchiveData.length / ITEMS_PER_PAGE_ARCHIVE);
    const archiveStartIndex = (archiveCurrentPage - 1) * ITEMS_PER_PAGE_ARCHIVE;
    const archiveCurrentItems = filteredArchiveData.slice(archiveStartIndex, archiveStartIndex + ITEMS_PER_PAGE_ARCHIVE);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE_TRACK_REQ);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE_TRACK_REQ;
    const currentItems = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE_TRACK_REQ);

    const totalPages1 = Math.ceil(myRequestDetails.length / ITEMS_PER_PAGE_DETAILS);
    const startIndex1 = (currentPage1 - 1) * ITEMS_PER_PAGE_DETAILS;
    const currentItems1 = myRequestDetails.slice(startIndex1, startIndex1 + ITEMS_PER_PAGE_DETAILS);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [requestFromFilter, requestToFilter, statusFilter, userFilter, searchFilter]);

    useEffect(() => {
        setArchiveCurrentPage(1);
    }, [archiveRequestFromFilter, archiveRequestToFilter, archiveUserFilter, archiveSearchFilter]);

    // Helper functions
    const getBaseURL = () => sessionStorage.getItem('baseURL') || '';

    const handleError = (error, context) => {
        console.error(`Error ${context}:`, error);
        setMessage(`Error occurred while ${context}. Please try again.`);
        setAlertVariant('danger');
        setAlertBG('#dc7a80');
        setAlert1(true);
        setTimeout(() => setAlert1(false), 3000);
    };

    const getUniqueRequestFrom = (data = nonCompleteRequests) => {
        const locations = [...new Set(data.map(item => item.reqFrom).filter(Boolean))];
        return locations.sort();
    };

    const getUniqueRequestTo = (data = nonCompleteRequests) => {
        const locations = [...new Set(data.map(item => item.reqTo).filter(Boolean))];
        return locations.sort();
    };

    const getUniqueUsers = (data = nonCompleteRequests) => {
        const uniqueUsers = [...new Set(data.map(item =>
            `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.trim()
        ).filter(name => name))];
        return uniqueUsers.sort();
    };

    const clearAllFilters = () => {
        setRequestFromFilter('');
        setRequestToFilter('');
        setStatusFilter('');
        setUserFilter('');
        setSearchFilter('');
        setCurrentPage(1);
    };

    const clearAllArchiveFilters = () => {
        setArchiveRequestFromFilter('');
        setArchiveRequestToFilter('');
        setArchiveUserFilter('');
        setArchiveSearchFilter('');
        setArchiveCurrentPage(1);
    };

    // Get progress step based on status
    const getProgressStep = (status) => {
        const statusMap = {
            'Pending': 0,
            'On Going': 1,
            'On Delivery': 2,
            'Delivered': 3,
            'Complete': 4
        };
        return statusMap[status] || 0;
    };

    // API Functions
    const Logs = async (accID, activity) => {
        if (!accID || !activity) return;

        const url = `${getBaseURL()}audit-log.php`;
        const Details = { accID, activity };

        try {
            await axios.get(url, {
                params: {
                    json: JSON.stringify(Details),
                    operation: "Logs"
                }
            });
        } catch (error) {
            console.error("Error logging activity:", error);
        }
    };

    const MyGetRequest = async () => {
        const url = `${getBaseURL()}requestStock.php`;
        const ID = {
            locID: location_id,
            status: '',
            reqType: 'ReqFrom',
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequest"
                }
            });

            setMyRequestList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            handleError(error, 'fetching request list');
            setMyRequestList([]);
        }
    };

    const GetArchiveRequests = async () => {
        const url = `${getBaseURL()}requestStock.php`;
        const ID = {
            locID: location_id,
            status: 'Complete',
            reqType: 'ReqFrom',
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetCompletedRequest"
                }
            });

            const completeRequests = Array.isArray(response.data) ? 
                response.data.filter(req => req.request_status === 'Complete') : [];
            setArchiveRequestList(completeRequests);
            setArchiveCurrentPage(1);
        } catch (error) {
            handleError(error, 'fetching archive requests');
            setArchiveRequestList([]);
        }
    };

    const GetLocation = async () => {
        const url = `${getBaseURL()}location.php`;

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetLocation"
                }
            });

            setLocationList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            handleError(error, 'fetching location list');
            setLocationList([]);
        }
    };

    const GetTrackRequestDetails = async (req_id) => {
        if (!req_id) return;

        const url = `${getBaseURL()}requestStock.php`;
        const ID = { reqID: req_id };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequestDetails"
                }
            });

            setMyRequestDetails(Array.isArray(response.data) ? response.data : []);
            setCurrentPage1(1);
        } catch (error) {
            handleError(error, 'fetching request details');
            setMyRequestDetails([]);
        }
    };

    const GetTrackRequestD = async (req_id) => {
        MyGetProgressCount(req_id);

        const url = `${getBaseURL()}requestStock.php`;
        const ID = {
            reqID: req_id,
            locID: 12
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequestD"
                }
            });

            if (response.data && response.data.length > 0) {
                const data = response.data[0];
                setS_ReqBy(`${data.fname || ''} ${data.mname || ''} ${data.lname || ''}`.trim());
                setS_ReqID(data.request_stock_id || '');
                setS_ReqDate(data.date || '');
                setS_ReqFrom(data.reqFrom || '');
                setS_ReqTo(data.reqTo || '');
                setS_ReqStatus(data.request_status || '');

                GetTrackRequestTimeandDate(data.request_stock_id, data.request_status);
            }
        } catch (error) {
            handleError(error, 'fetching request data');
        }
    };

    const GetTrackRequestTimeandDate = async (req_id, status) => {
        const url = `${getBaseURL()}requestStock.php`;
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
            handleError(error, "fetching request data");
            return "";
        }
    };

    const MyGetProgressCount = async (id) => {
        if (!id) return;

        const url = `${getBaseURL()}requestReport.php`;
        const accountID = sessionStorage.getItem('user_id');
        const ID = { reqID: id };

        try {
            const progressResponse = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "progress"
                }
            });

            if (progressResponse.data && progressResponse.data.length > 0) {
                setCurrentStep(progressResponse.data[0].Count - 1);
                if (accountID) {
                    Logs(accountID, `Track the request #${id}`);
                }
            }

            const detailsResponse = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "progress1"
                }
            });

            setReqReports(Array.isArray(detailsResponse.data) ? detailsResponse.data : []);
        } catch (error) {
            handleError(error, 'fetching progress data');
            setReqReports([]);
        }
    };

    // Event handlers
    const handleClose = () => setShow(false);
    const handleArchiveClose = () => setShowArchive(false);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleArchivePageChange = (page) => {
        if (page >= 1 && page <= archiveTotalPages) {
            setArchiveCurrentPage(page);
        }
    };

    const handleArchiveOpen = () => {
        GetArchiveRequests();
        setShowArchive(true);
    };

    const triggerModal = (operation, id) => {
        if (operation === 'trackRequestDetails' && id) {
            setTrackRequestDetailsVisible(false);
            GetTrackRequestDetails(id);
            GetTrackRequestD(id);
            MyGetProgressCount(id);
        }
    };

    const triggerArchiveModal = (id) => {
        if (id) {
            setShowArchive(false);
            setTrackRequestDetailsVisible(false);
            GetTrackRequestDetails(id);
            GetTrackRequestD(id);
            MyGetProgressCount(id);
        }
    };

    // Effects
    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id') || '');
        setLocation_id(sessionStorage.getItem('location_id') || '');
    }, []);

    useEffect(() => {
        if (location_id) {
            GetLocation();
            MyGetRequest();
        }
    }, [location_id]);

    const merged = steps.map((step, index) => ({
        stepName: step,
        data: reqReports[index] || null
    }));

    return (
        <>
            <Alert
                variant={alertVariant}
                show={alert1}
                style={{ backgroundColor: alertBG, position: 'fixed', top: 20, right: 20, zIndex: 9999 }}
            >
                {message}
            </Alert>

            {/* Archive Modal */}
            <Modal show={showArchive} onHide={handleArchiveClose} size='xl'>
                <Modal.Header closeButton>
                    <Modal.Title>Completed Requests</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Archive Filters */}
                    <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '15px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Request From</label>
                                <select
                                    value={archiveRequestFromFilter}
                                    onChange={(e) => setArchiveRequestFromFilter(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                                >
                                    <option value="">All Locations</option>
                                    {getUniqueRequestFrom(archiveRequestList).map((location, index) => (
                                        <option key={index} value={location}>{location}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Request To</label>
                                <select
                                    value={archiveRequestToFilter}
                                    onChange={(e) => setArchiveRequestToFilter(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                                >
                                    <option value="">All Locations</option>
                                    {getUniqueRequestTo(archiveRequestList).map((location, index) => (
                                        <option key={index} value={location}>{location}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Request By</label>
                                <select
                                    value={archiveUserFilter}
                                    onChange={(e) => setArchiveUserFilter(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                                >
                                    <option value="">All Users</option>
                                    {getUniqueUsers(archiveRequestList).map((user, index) => (
                                        <option key={index} value={user}>{user}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Search</label>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={archiveSearchFilter}
                                    onChange={(e) => setArchiveSearchFilter(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #dee2e6' }}>
                            <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                Showing {filteredArchiveData.length} of {archiveRequestList.length} completed requests
                            </div>
                            <button onClick={clearAllArchiveFilters} style={{ padding: '6px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Clear All Filters
                            </button>
                        </div>
                    </div>

                    {/* Archive Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', maxHeight: '50vh', overflowY: 'auto', padding: '10px' }}>
                        {archiveCurrentItems.length > 0 ? archiveCurrentItems.map((request, index) => (
                            <div
                                key={index}
                                onClick={() => triggerArchiveModal(request.request_stock_id)}
                                style={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    ':hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 8px rgba(0,0,0,0.15)' }
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                    <div>
                                        <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>#{request.request_stock_id}</h5>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>{request.date}</p>
                                    </div>
                                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#007bff', color: 'white' }}>
                                        Complete
                                    </span>
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                        </svg>
                                        <span style={{ fontSize: '14px', color: '#333' }}><strong>From:</strong> {request.reqFrom}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                                            <circle cx="12" cy="10" r="3"/>
                                            <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/>
                                        </svg>
                                        <span style={{ fontSize: '14px', color: '#333' }}><strong>To:</strong> {request.reqTo}</span>
                                    </div>
                                </div>

                                <div style={{ paddingTop: '12px', borderTop: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                            <circle cx="12" cy="7" r="4"/>
                                        </svg>
                                        <span style={{ fontSize: '13px', color: '#666' }}>
                                            {`${request.fname || ''} ${request.mname || ''} ${request.lname || ''}`.trim()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#999' }}>
                                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📁</div>
                                <h4>No completed requests found</h4>
                                <p>Completed requests will appear here.</p>
                            </div>
                        )}
                    </div>

                    {archiveTotalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <CustomPagination
                                currentPage={archiveCurrentPage}
                                totalPages={archiveTotalPages}
                                onPageChange={handleArchivePageChange}
                                color="#007bff"
                            />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleArchiveClose}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Request Details Modal */}
            <Modal show={!trackRequestDetailsVisible} onHide={() => setTrackRequestDetailsVisible(true)} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Request Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div><strong>REQUEST ID:</strong> #{s_reqID}</div>
                            <div><strong>REQUEST DATE:</strong> {s_reqDate}</div>
                            <div><strong>REQUEST FROM:</strong> {s_reqFrom}</div>
                            <div><strong>REQUEST TO:</strong> {s_reqTo}</div>
                        </div>
                        <div style={{ marginBottom: '10px' }}><strong>REQUEST BY:</strong> {s_reqBy}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong>STATUS:</strong>
                                <span style={{
                                    marginLeft: '8px',
                                    color: s_reqStatus === "Pending" ? "red" : s_reqStatus === "Delivered" ? "green" : s_reqStatus === "On Going" ? "orange" : s_reqStatus === "On Delivery" ? "goldenrod" : s_reqStatus === "Complete" ? "blue" : "black",
                                    fontWeight: 'bold'
                                }}>
                                    {s_reqStatus} | {reqDateTime}
                                </span>
                            </div>
                            <button
                                onClick={() => setTrackReqVisible(false)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                View Tracking History
                            </button>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Product Code</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Product Description</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Requested QTY</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems1.length > 0 ? currentItems1.map((p, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #dee2e6' }}>
                                    <td style={{ padding: '12px' }}>{p.product_name || 'N/A'}</td>
                                    <td style={{ padding: '12px' }}>{p.description || 'N/A'}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>{p.qty || '0'}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No request details available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {totalPages1 > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <CustomPagination currentPage={currentPage1} totalPages={totalPages1} onPageChange={(page) => setCurrentPage1(page)} color="#28a745" />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setTrackRequestDetailsVisible(true)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Track Request History Modal */}
            <Modal show={!trackReqVisible} onHide={() => setTrackReqVisible(true)} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Tracking History - Request #{s_reqID}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ padding: '20px' }}>
                        <h4 style={{ marginBottom: '30px', textAlign: 'center', fontWeight: 'bold' }}>Request Progress Tracker</h4>
                        
                        <div style={{ position: 'relative', paddingLeft: '40px' }}>
                            {merged.map((label, index) => (
                                <div key={index} style={{ position: 'relative', paddingBottom: index < steps.length - 1 ? '40px' : '0' }}>
                                    {/* Vertical Line */}
                                    {index < steps.length - 1 && (
                                        <div style={{
                                            position: 'absolute',
                                            left: '-25px',
                                            top: '25px',
                                            width: '3px',
                                            height: '100%',
                                            backgroundColor: index < currentStep ? '#28a745' : '#e0e0e0'
                                        }} />
                                    )}
                                    
                                    {/* Step Circle */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '-32px',
                                        top: '5px',
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        backgroundColor: index <= currentStep ? '#28a745' : '#e0e0e0',
                                        border: '3px solid white',
                                        boxShadow: '0 0 0 2px ' + (index <= currentStep ? '#28a745' : '#e0e0e0')
                                    }} />
                                    
                                    {/* Step Content */}
                                    <div style={{
                                        padding: '15px',
                                        backgroundColor: index <= currentStep ? '#f8fff9' : '#f8f9fa',
                                        borderRadius: '8px',
                                        border: '1px solid ' + (index <= currentStep ? '#28a745' : '#e0e0e0'),
                                        opacity: index <= currentStep ? 1 : 0.6
                                    }}>
                                        <h6 style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: index <= currentStep ? '#28a745' : '#666' }}>
                                            {label.stepName}
                                        </h6>
                                        {label.data && label.data.status && (
                                            <>
                                                <p style={{ margin: '4px 0', fontSize: '14px', color: '#333' }}>
                                                    <strong>Status:</strong> {label.data.status}
                                                </p>
                                                <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                                                    <strong>Date:</strong> {label.data.date} at {label.data.time}
                                                </p>
                                            </>
                                        )}
                                        {(!label.data || !label.data.status) && index > currentStep && (
                                            <p style={{ margin: '4px 0', fontSize: '13px', color: '#999', fontStyle: 'italic' }}>
                                                Pending...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setTrackReqVisible(true)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Main Content */}
            <div className='customer-main'>
                <div className='customer-header'>
                    <div>
                        <h1 className='h-customer'>TRACK REQUEST</h1>
                    </div>
                    <div>
                        <button className='add-pro-bttn' onClick={handleArchiveOpen}>
                            COMPLETED REQUESTS
                        </button>
                    </div>
                </div>

                {/* Filter Controls */}
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
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Request From</label>
                            <select
                                value={requestFromFilter}
                                onChange={(e) => setRequestFromFilter(e.target.value)}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
                            >
                                <option value="">All Locations</option>
                                {getUniqueRequestFrom().map((location, index) => (
                                    <option key={index} value={location}>{location}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Request To</label>
                            <select
                                value={requestToFilter}
                                onChange={(e) => setRequestToFilter(e.target.value)}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
                            >
                                <option value="">All Locations</option>
                                {getUniqueRequestTo().map((location, index) => (
                                    <option key={index} value={location}>{location}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Filter by Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
                            >
                                <option value="">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="On Going">On Going</option>
                                <option value="On Delivery">On Delivery</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Filter by User</label>
                            <select
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
                            >
                                <option value="">All Users</option>
                                {getUniqueUsers().map((user, index) => (
                                    <option key={index} value={user}>{user}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Search Requests</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Search by ID, location, or user..."
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    style={{ width: '100%', padding: '8px 35px 8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
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
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #dee2e6' }}>
                        <div style={{ fontSize: '14px', color: '#6c757d' }}>
                            Showing {filteredData.length} of {nonCompleteRequests.length} active requests
                        </div>
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
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>

                {/* Request Cards Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '20px',
                    padding: '10px',
                    maxHeight: '60vh',
                    overflowY: 'auto'
                }}>
                    {currentItems.length > 0 ? currentItems.map((request, index) => {
                        const progressStep = getProgressStep(request.request_status);
                        const progressPercentage = (progressStep / 4) * 100;

                        return (
                            <div
                                key={index}
                                onClick={() => triggerModal('trackRequestDetails', request.request_stock_id)}
                                style={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                }}
                            >
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                    <div>
                                        <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                                            #{request.request_stock_id}
                                        </h5>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>{request.date}</p>
                                    </div>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: request.request_status === "Pending" ? "#dc3545" :
                                            request.request_status === "Delivered" ? "#28a745" :
                                            request.request_status === "On Going" ? "#fd7e14" :
                                            request.request_status === "On Delivery" ? "#ffc107" : "#6c757d",
                                        color: 'white'
                                    }}>
                                        {request.request_status}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#666' }}>Progress</span>
                                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#666' }}>{progressPercentage}%</span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        backgroundColor: '#e0e0e0',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${progressPercentage}%`,
                                            height: '100%',
                                            backgroundColor: request.request_status === "Pending" ? "#dc3545" :
                                                request.request_status === "Delivered" ? "#28a745" :
                                                request.request_status === "On Going" ? "#fd7e14" :
                                                request.request_status === "On Delivery" ? "#ffc107" : "#6c757d",
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                        {steps.map((step, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    fontSize: '10px',
                                                    color: idx <= progressStep ? '#28a745' : '#999',
                                                    fontWeight: idx === progressStep ? 'bold' : 'normal'
                                                }}
                                            >
                                                {idx === 0 ? 'Start' : idx === 4 ? 'End' : ''}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Location Info */}
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                        </svg>
                                        <span style={{ fontSize: '14px', color: '#333' }}>
                                            <strong>From:</strong> {request.reqFrom}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                                            <circle cx="12" cy="10" r="3"/>
                                            <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/>
                                        </svg>
                                        <span style={{ fontSize: '14px', color: '#333' }}>
                                            <strong>To:</strong> {request.reqTo}
                                        </span>
                                    </div>
                                </div>

                                
                                {/* User Info */}
                                <div style={{ paddingTop: '12px', borderTop: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                            <circle cx="12" cy="7" r="4"/>
                                        </svg>
                                        <span style={{ fontSize: '13px', color: '#666' }}>
                                            {`${request.fname || ''} ${request.mname || ''} ${request.lname || ''}`.trim()}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'center', marginTop: '8px' }}>
                                        <span style={{ fontSize: '12px', color: '#007bff', fontStyle: 'italic' }}>
                                            Click to view details
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{
                            gridColumn: '1 / -1',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '60px 20px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.3 }}>📋</div>
                            <h4 style={{ color: '#495057', marginBottom: '10px', fontWeight: '500' }}>
                                {nonCompleteRequests.length === 0 ? 'No active requests to track' : 'No requests match the current filters'}
                            </h4>
                            <p style={{ margin: '0', fontSize: '14px', maxWidth: '400px', lineHeight: '1.6', color: '#6c757d' }}>
                                {nonCompleteRequests.length === 0
                                    ? 'All requests are completed. Check the Completed Requests to view them.'
                                    : 'Try adjusting your filters to see more results.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && currentItems.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <CustomPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            color="#28a745"
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default TrackRequestIM;