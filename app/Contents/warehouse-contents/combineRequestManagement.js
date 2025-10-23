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

const UnifiedRequestManagement = () => {
    const [activeTab, setActiveTab] = useState('normal');

    // Common states
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [locationList, setLocationList] = useState([]);
    const [userList, setUserList] = useState([]);

    // Alert states
    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

    // Normal Stock Request states
    const [normalRequestList, setNormalRequestList] = useState([]);
    const [normalDeliverDetails, setNormalDeliverDetails] = useState([]);
    const [normalRequestFromFilter, setNormalRequestFromFilter] = useState('');
    const [normalRequestByFilter, setNormalRequestByFilter] = useState('');
    const [normalSearchFilter, setNormalSearchFilter] = useState('');
    const [normalCurrentPage, setNormalCurrentPage] = useState(1);
    const [normalCurrentPageDetails, setNormalCurrentPageDetails] = useState(1);
    const [normalDeliveriesDataVisible, setNormalDeliveriesDataVisible] = useState(true);
    const [normalAppointDriverVisible, setNormalAppointDriverVisible] = useState(true);
    const [normalRequestID, setNormalRequestID] = useState('');
    const [normalRequestFrom, setNormalRequestFrom] = useState('');
    const [normalRequestBy, setNormalRequestBy] = useState('');
    const [normalRequestStatus, setNormalRequestStatus] = useState('');
    const [normalRequestDate, setNormalRequestDate] = useState('');
    const [normalReqDateTime, setNormalReqDateTime] = useState('');
    const [normalTransferDriver, setNormalTransferDriver] = useState('');
    const [normalRID, setNormalRID] = useState('');
    const [normalRequestFromID, setNormalRequestFromID] = useState('');

    // Customize Request states
    const [customizeRequestList, setCustomizeRequestList] = useState([]);
    const [semiDetails, setSemiDetails] = useState([]);
    const [fullDetails, setFullDetails] = useState([]);
    const [customizeRequestFromFilter, setCustomizeRequestFromFilter] = useState('');
    const [customizeRequestByFilter, setCustomizeRequestByFilter] = useState('');
    const [customizeSearchFilter, setCustomizeSearchFilter] = useState('');
    const [customizeCurrentCardsPage, setCustomizeCurrentCardsPage] = useState(1);
    const [currentSemiDetails, setCurrentSemiDetails] = useState([]);
    const [currentFullDetails, setCurrentFullDetails] = useState([]);
    const [currentSemiPage, setCurrentSemiPage] = useState(1);
    const [currentFullPage, setCurrentFullPage] = useState(1);
    const [customizeDeliveriesDataVisible, setCustomizeDeliveriesDataVisible] = useState(true);
    const [customizeAppointDriverVisible, setCustomizeAppointDriverVisible] = useState(true);
    const [customizeRequestID, setCustomizeRequestID] = useState('');
    const [customizeRequestFrom, setCustomizeRequestFrom] = useState('');
    const [customizeRequestBy, setCustomizeRequestBy] = useState('');
    const [customizeRequestStatus, setCustomizeRequestStatus] = useState('');
    const [customizeRequestDate, setCustomizeRequestDate] = useState('');
    const [customizeRequestTo, setCustomizeRequestTo] = useState('');
    const [customizeDateAndTime, setCustomizeDateAndTime] = useState('');
    const [customizeTransferDriverName, setCustomizeTransferDriverName] = useState('');
    const [customizeDeliverToID, setCustomizeDeliverToID] = useState('');
    const [customizeRID, setCustomizeRID] = useState('');

    // Initialize session data
    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));
    }, []);

    useEffect(() => {
        GetNormalRequest();
        GetCustomizeRequest();
        GetUser();
        GetLocation();
        GetSemiDetails();
        GetFullDetails();
    }, []);

    // Format functions
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

    // Common API calls
    const GetUser = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'users.php';
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify([]), operation: "GetUsers" }
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
                params: { json: JSON.stringify([]), operation: "GetLocation" }
            });
            setLocationList(response.data);
        } catch (error) {
            console.error("Error fetching location list:", error);
        }
    };

    const Logs = async (accID, activity) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'audit-log.php';
        const Details = { accID, activity };
        try {
            await axios.get(url, {
                params: { json: JSON.stringify(Details), operation: "Logs" }
            });
        } catch (error) {
            console.error("Error recording logs events:", error);
        }
    };

    // ==================== NORMAL STOCK REQUEST FUNCTIONS ====================
    const GetNormalRequest = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { locID: LocationID, status: 'OnGoing', reqType: 'ReqTo' };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetRequest2" }
            });
            setNormalRequestList(response.data);
        } catch (error) {
            console.error("Error fetching normal request list:", error);
        }
    };

    const GetNormalDeliveriesData = async (transaction_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        const ID = { transID: transaction_id };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetRequestData" }
            });
            console.log(response.data);

            const data = response.data[0];
            setNormalRequestID(response.data[0].request_stock_id);
            setNormalRequestFrom(response.data[0].reqFrom);
            setNormalRequestFromID(response.data[0].request_from); // Store requesting location ID
            setNormalRequestBy(response.data[0].fname + " " + response.data[0].mname + " " + response.data[0].lname);
            setNormalRequestStatus(response.data[0].request_status);
            GetNormalTrackRequestTimeandDate(data.request_stock_id, data.request_status);
            setNormalRequestDate(formatDate(data.date));
        } catch (error) {
            console.error("Error fetching normal deliveries data:", error);
        }
    };

    const GetNormalTrackRequestTimeandDate = async (req_id, status) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { reqID: req_id, status: status };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetReqDateAndTime" }
            });
            if (response.data && response.data.length > 0) {
                setNormalReqDateTime(formatDate(response.data[0].date) + " • " + formatTime(response.data[0].time));
            }
        } catch (error) {
            console.error("Error fetching normal request date/time:", error);
        }
    };

    const GetNormalDeliveriesDetails = async (transaction_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { reqID: transaction_id };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetRequestDetails" }
            });
            setNormalDeliverDetails(response.data);
            setNormalCurrentPageDetails(1);
        } catch (error) {
            console.error("Error fetching normal deliveries details:", error);
        }
    };

    const DeliverNormalStock = async () => {
        if (normalTransferDriver === '') {
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
        const ID = { accID: accountID, reqID: normalRID, driverID: normalTransferDriver };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "DeliverStock" }
            });
            if (response.data === 'Success') {
                AlertSucces(
                    "Successfully appointed a driver and it's ready to deliver",
                    "success",
                    true,
                    'Ok'
                );
                setNormalAppointDriverVisible(true);
                setNormalDeliveriesDataVisible(true);
                GetNormalRequest();
                Logs(accountID, 'Deliver the request #' + normalRID);
                
                // Send notification to requesting location (Inventory Manager)
                const driverName = userList.find(d => d.account_id?.toString() === normalTransferDriver.toString());
                const driverFullName = driverName ? `${driverName.fname} ${driverName.lname}` : 'Driver';
                
                await createNotification({
                    type: 'delivery',
                    title: 'Stock On Delivery',
                    message: `Your stock request #${normalRID} is now on delivery. Driver: ${driverFullName}`,
                    locationId: normalRequestFromID, // Send to requesting location
                    targetRole: 'Inventory Manager',
                    productId: null,
                    customerId: null,
                    referenceId: normalRID
                });
            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to deliver the stock!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error delivering normal stock:", error);
        }
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

    // ==================== CUSTOMIZE REQUEST FUNCTIONS ====================
    const GetCustomizeRequest = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const ID = { locID: LocationID };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetCustomizeRequest" }
            });
            setCustomizeRequestList(response.data);
        } catch (error) {
            console.error("Error fetching customize request list:", error);
        }
    };

    const GetSemiDetails = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify([]), operation: "GetCustomizeRequestDetailSemi" }
            });
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
                params: { json: JSON.stringify([]), operation: "GetCustomizeRequestDetailFull" }
            });
            setFullDetails(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching full details:", error);
            return [];
        }
    };

    const GetCustomizeStatsAndDate = async (stats, CR_ID) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const ID = { stats: stats, CD_ID: CR_ID };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "GetTheStatusDate" }
            });
            if (response.data && response.data.length > 0) {
                const formattedDate = formatDate(response.data[0].date);
                const formattedTime = formatTime(response.data[0].time);
                setCustomizeDateAndTime(`${formattedDate}, ${formattedTime}`);
            }
        } catch (error) {
            console.error("Error fetching customize status date:", error);
        }
    };

    const GetCustomizeDeliveriesData = async (request) => {
        const salesId = request.customize_sales_id;
        setCustomizeRequestID(request.customize_req_id);
        setCustomizeRequestFrom(request.reqFrom);
        setCustomizeRequestBy(`${request.fname} ${request.mname} ${request.lname}`);
        setCustomizeRequestStatus(request.status);
        setCustomizeRequestDate(formatDate(request.date));
        setCustomizeRequestTo(request.reqTo);
        setCustomizeDeliverToID(request.req_from);
        setCurrentSemiPage(1);
        setCurrentFullPage(1);

        await GetCustomizeStatsAndDate(request.status, request.customize_req_id);
        const [semiData, fullData] = await Promise.all([GetSemiDetails(), GetFullDetails()]);
        const filteredSemi = semiData.filter(item => parseInt(item.customize_sales_id) === parseInt(salesId));
        const filteredFull = fullData.filter(item => parseInt(item.customize_sales_id) === parseInt(salesId));
        setCurrentSemiDetails(filteredSemi);
        setCurrentFullDetails(filteredFull);
    };

    const DeliverCustomizeStock = async () => {
        if (customizeTransferDriverName === '') {
            showAlertError({
                icon: "error",
                title: "Wait!",
                text: "Please enter a driver name first.",
                button: 'Okay'
            });
            return;
        }
        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const locationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const ID = {
            accID: accountID,
            reqID: customizeRID,
            driverName: customizeTransferDriverName,
            deliverTo: customizeDeliverToID,
            deliverFrom: locationID
        };
        try {
            const response = await axios.get(url, {
                params: { json: JSON.stringify(ID), operation: "DeliverCustomize" }
            });
            if (response.data === 'Success') {
                AlertSucces(
                    "Successfully appointed a driver and it's ready to deliver",
                    "success",
                    true,
                    'Got It'
                );
                setCustomizeAppointDriverVisible(true);
                setCustomizeDeliveriesDataVisible(true);
                GetCustomizeRequest();
                Logs(accountID, 'Deliver the customize request #' + customizeRID);
                
                // Send notification to requesting location (Sales Clerk)
                await createNotification({
                    type: 'delivery',
                    title: 'Customize Order On Delivery',
                    message: `Your customize request #${customizeRID} is now on delivery. Driver: ${customizeTransferDriverName}`,
                    locationId: customizeDeliverToID, // Send to requesting location
                    targetRole: 'Sales Clerk',
                    productId: null,
                    customerId: null,
                    referenceId: customizeRID
                });
            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to deliver the stock!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error delivering customize stock:", error);
        }
    };

    // ==================== FILTERED DATA ====================
    const normalFilteredData = useMemo(() => {
        let filtered = [...normalRequestList];
        if (normalRequestFromFilter) {
            filtered = filtered.filter(item => item.reqFrom?.toLowerCase().includes(normalRequestFromFilter.toLowerCase()));
        }
        if (normalRequestByFilter) {
            filtered = filtered.filter(item => {
                const fullName = `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase();
                return fullName.includes(normalRequestByFilter.toLowerCase());
            });
        }
        if (normalSearchFilter.trim()) {
            const searchTerm = normalSearchFilter.toLowerCase();
            filtered = filtered.filter(item =>
                item.request_stock_id?.toString().includes(searchTerm) ||
                item.reqFrom?.toLowerCase().includes(searchTerm) ||
                `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase().includes(searchTerm)
            );
        }
        return filtered;
    }, [normalRequestList, normalRequestFromFilter, normalRequestByFilter, normalSearchFilter]);

    const customizeFilteredData = useMemo(() => {
        let filtered = [...customizeRequestList];
        filtered = filtered.filter(item => item.status === 'On Going');
        if (customizeRequestFromFilter) {
            filtered = filtered.filter(item => item.reqFrom?.toLowerCase().includes(customizeRequestFromFilter.toLowerCase()));
        }
        if (customizeRequestByFilter) {
            filtered = filtered.filter(item => {
                const fullName = `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase();
                return fullName.includes(customizeRequestByFilter.toLowerCase());
            });
        }
        if (customizeSearchFilter.trim()) {
            const searchTerm = customizeSearchFilter.toLowerCase();
            filtered = filtered.filter(item =>
                item.customize_req_id?.toString().includes(searchTerm) ||
                item.reqFrom?.toLowerCase().includes(searchTerm) ||
                `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase().includes(searchTerm)
            );
        }
        return filtered;
    }, [customizeRequestList, customizeRequestFromFilter, customizeRequestByFilter, customizeSearchFilter]);

    // Pagination calculations
    const normalTotalPages = Math.ceil(normalFilteredData.length / ITEMS_PER_PAGE);
    const normalStartIndex = (normalCurrentPage - 1) * ITEMS_PER_PAGE;
    const normalCurrentItems = normalFilteredData.slice(normalStartIndex, normalStartIndex + ITEMS_PER_PAGE);

    const customizeTotalCardsPages = Math.ceil(customizeFilteredData.length / CARDS_PER_PAGE);
    const customizeStartCardsIndex = (customizeCurrentCardsPage - 1) * CARDS_PER_PAGE;
    const customizeCurrentCardsItems = customizeFilteredData.slice(customizeStartCardsIndex, customizeStartCardsIndex + CARDS_PER_PAGE);

    const normalTotalPagesDetails = Math.ceil(normalDeliverDetails.length / ITEMS_PER_DETAILS_PAGE);
    const normalStartIndexDetails = (normalCurrentPageDetails - 1) * ITEMS_PER_DETAILS_PAGE;
    const normalCurrentItemsDetails = normalDeliverDetails.slice(normalStartIndexDetails, normalStartIndexDetails + ITEMS_PER_DETAILS_PAGE);

    // Reset pagination on filter change
    useEffect(() => {
        setNormalCurrentPage(1);
    }, [normalRequestFromFilter, normalRequestByFilter, normalSearchFilter]);

    useEffect(() => {
        setCustomizeCurrentCardsPage(1);
        setCurrentSemiPage(1);
        setCurrentFullPage(1);
    }, [customizeRequestFromFilter, customizeRequestByFilter, customizeSearchFilter]);

    const getUniqueNormalLocations = () => {
        const uniqueLocations = [...new Set(normalRequestList.map(item => item.reqFrom).filter(Boolean))];
        return uniqueLocations.sort();
    };

    const getUniqueNormalUsers = () => {
        const uniqueUsers = [...new Set(normalRequestList.map(item => `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.trim()).filter(name => name))];
        return uniqueUsers.sort();
    };

    const getUniqueCustomizeLocations = () => {
        const onGoingRequests = customizeRequestList.filter(item => item.status === 'On Going');
        const uniqueLocations = [...new Set(onGoingRequests.map(item => item.reqFrom).filter(Boolean))];
        return uniqueLocations.sort();
    };

    const getUniqueCustomizeUsers = () => {
        const onGoingRequests = customizeRequestList.filter(item => item.status === 'On Going');
        const uniqueUsers = [...new Set(onGoingRequests.map(item => `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.trim()).filter(name => name))];
        return uniqueUsers.sort();
    };

    // ==================== RENDER ====================
    return (
        <>
            <Alert variant={alertVariant} show={alert1} style={{ backgroundColor: alertBG }}>
                {message}
            </Alert>

            {/* Normal Stock Request - Delivery Details Modal */}
            <Modal show={!normalDeliveriesDataVisible} onHide={() => setNormalDeliveriesDataVisible(true)} size='xl'>
                <Modal.Header closeButton>
                    <Modal.Title>Request Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    {/* <div style={{ marginBottom: '20px' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <div><strong>REQUEST ID:</strong> {normalRequestID}</div>
                        </div>
                        <div><strong>REQUEST FROM:</strong> {normalRequestFrom}</div>
                        <div><strong>REQUEST BY:</strong> {normalRequestBy}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: normalRequestStatus === "Pending" ? "red"
                                    : normalRequestStatus === "Delivered" ? "green"
                                        : normalRequestStatus === "On Going" ? "orange"
                                            : normalRequestStatus === "On Delivery" ? "goldenrod"
                                                : normalRequestStatus === "Complete" ? "blue"
                                                    : "black",
                                fontWeight: 'bold'
                            }}>
                                {normalRequestStatus} | {normalReqDateTime}
                            </span>
                        </div>
                    </div> */}

                    <div className="r-details-head">
                        <div className='r-d-div'>
                            <div><strong>REQUEST ID:</strong> {normalRequestID}</div>
                            <div><strong>REQUEST DATE:</strong> {normalRequestDate}</div>
                        </div>

                        <div><strong>REQUEST FROM:</strong> {normalRequestFrom}</div>
                        <div><strong>REQUEST BY:</strong> {normalRequestBy}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: normalRequestStatus === "Pending" ? "red"
                                    : normalRequestStatus === "Delivered" ? "green"
                                        : normalRequestStatus === "On Going" ? "orange"
                                            : normalRequestStatus === "On Delivery" ? "goldenrod"
                                                : normalRequestStatus === "Complete" ? "blue"
                                                    : "black",
                                fontWeight: 'bold'
                            }}>
                                {normalRequestStatus} | {normalReqDateTime}
                            </span>
                        </div>
                    </div>

                    {/* Summary Cards for Normal Stock */}
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ flex: 1, padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px', border: '1px solid #28a745' }}>
                            <div style={{ fontSize: '14px', color: '#155724', marginBottom: '5px' }}>Total Items</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>{normalDeliverDetails.length}</div>
                        </div>
                        <div style={{ flex: 1, padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px', border: '1px solid #17a2b8' }}>
                            <div style={{ fontSize: '14px', color: '#0c5460', marginBottom: '5px' }}>Total Quantity</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0c5460' }}>
                                {normalDeliverDetails.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0)}
                            </div>
                        </div>
                    </div>

                    <div style={{ border: '1px solid #ddd', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '500px' }}>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1 }}>
                                    <tr>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left', width: '25%' }}>Product Code</th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left', width: '55%' }}>Product Description</th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'center', width: '20%' }}>Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {normalCurrentItemsDetails.length > 0 ? (
                                        normalCurrentItemsDetails.map((p, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '12px', fontWeight: '500' }}>{p.product_name}</td>
                                                <td style={{ padding: '12px' }}>{p.description}</td>
                                                <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500', fontSize: '16px' }}>{p.qty}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: "center", padding: "30px", fontStyle: "italic", color: '#666' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
                                                <div style={{ fontSize: '16px' }}>No delivery details found</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div style={{
                            borderTop: '1px solid #ddd',
                            backgroundColor: '#f8f9fa',
                            minHeight: '60px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {normalTotalPagesDetails > 1 ? (
                                <CustomPagination
                                    currentPage={normalCurrentPageDetails}
                                    totalPages={normalTotalPagesDetails}
                                    onPageChange={(page) => setNormalCurrentPageDetails(page)}
                                    color="green"
                                />
                            ) : (
                                <div style={{ height: '40px' }}></div>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setNormalDeliveriesDataVisible(true)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => { setNormalAppointDriverVisible(false); setNormalTransferDriver('') }}>
                        Deliver The Stock
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Normal Stock Request - Appoint Driver Modal */}
            <Modal show={!normalAppointDriverVisible} onHide={() => setNormalAppointDriverVisible(true)} size='md' centered>
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
                            <Dropdown.Toggle variant="primary" size="sm" style={{
                                width: '100%', height: '50px', textAlign: 'left', backgroundColor: '#fff',
                                color: 'black', display: 'flex', alignItems: 'center', border: '1px solid #ced4da',
                                borderRadius: '8px', fontSize: '0.95rem', padding: '10px 15px'
                            }}>
                                {normalTransferDriver ?
                                    userList.find(driver => driver.account_id?.toString() === normalTransferDriver.toString())?.fname + " " +
                                    userList.find(driver => driver.account_id?.toString() === normalTransferDriver.toString())?.mname + " " +
                                    userList.find(driver => driver.account_id?.toString() === normalTransferDriver.toString())?.lname
                                    : '-- Select a Driver --'
                                }
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ maxHeight: '300px', overflowY: 'auto', width: '100%', borderRadius: '8px', border: '1px solid #ced4da' }}>
                                <Dropdown.Item onClick={() => setNormalTransferDriver('')} style={{ padding: '10px 15px', fontSize: '0.95rem', color: '#6c757d', fontStyle: 'italic' }}>
                                    -- Select a Driver --
                                </Dropdown.Item>
                                {userList.filter(role => role.role_name?.toLowerCase() === 'driver').map((driver) => (
                                    <Dropdown.Item key={driver.account_id} onClick={() => setNormalTransferDriver(driver.account_id.toString())} style={{ padding: '10px 15px', fontSize: '0.95rem' }}>
                                        {driver.fname + " " + driver.mname + " " + driver.lname}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                        {normalTransferDriver && (
                            <div style={{ padding: '10px 15px', backgroundColor: '#e8f5e8', borderRadius: '8px', border: '1px solid #28a745', fontSize: '0.9rem' }}>
                                <strong>Selected Driver: </strong>
                                <span style={{ color: '#28a745' }}>
                                    {userList.find(driver => driver.account_id?.toString() === normalTransferDriver.toString())?.fname + " " +
                                        userList.find(driver => driver.account_id?.toString() === normalTransferDriver.toString())?.mname + " " +
                                        userList.find(driver => driver.account_id?.toString() === normalTransferDriver.toString())?.lname}
                                </span>
                            </div>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '1px solid #dee2e6', padding: '15px' }}>
                    <Button variant="outline-secondary" onClick={() => setNormalAppointDriverVisible(true)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={DeliverNormalStock} disabled={!normalTransferDriver} style={{
                        backgroundColor: normalTransferDriver ? '#2563eb' : '#6c757d',
                        border: 'none',
                        opacity: normalTransferDriver ? 1 : 0.6
                    }}>
                        Confirm Appointment
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Customize Request - Delivery Details Modal */}
            <Modal show={!customizeDeliveriesDataVisible} onHide={() => setCustomizeDeliveriesDataVisible(true)} size='xl'>
                <Modal.Header closeButton>
                    <Modal.Title>Request Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>

                    <div className="r-details-head">
                        <div className='r-d-div'>
                            <div><strong>CUSTOMIZE REQUEST ID:</strong> {customizeRequestID}</div>
                            <div><strong>REQUEST DATE:</strong> {customizeRequestDate}</div>
                        </div>
                        <div><strong>REQUEST FROM:</strong> {customizeRequestFrom}</div>
                        <div><strong>REQUEST TO:</strong> {customizeRequestTo}</div>
                        <div><strong>REQUEST BY:</strong> {customizeRequestBy}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: customizeRequestStatus === "Pending" ? "red"
                                    : customizeRequestStatus === "Delivered" ? "green"
                                        : customizeRequestStatus === "On Going" ? "orange"
                                            : customizeRequestStatus === "On Delivery" ? "goldenrod"
                                                : customizeRequestStatus === "Complete" ? "blue"
                                                    : "black",
                                fontWeight: 'bold'
                            }}>
                                {customizeRequestStatus} | {customizeDateAndTime}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '15px', marginBottom: '20px' }}>
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
                            {(() => {
                                // Combine semi and full items into one array
                                const allCustomizeItems = [
                                    ...(currentSemiDetails || []).map(item => ({
                                        type: 'Semi-Customized',
                                        baseProductId: item.baseProduct_id,
                                        description: item.description || 'No description',
                                        additionalDescription: item.modifications || 'No modifications specified',
                                        qty: item.qty
                                    })),
                                    ...(currentFullDetails || []).map(item => ({
                                        type: 'Full-Customized',
                                        baseProductId: null,
                                        description: item.description || 'N/A',
                                        additionalDescription: item.additional_description || 'N/A',
                                        qty: item.qty
                                    }))
                                ];

                                // Calculate pagination for combined items
                                const startIndex = (currentSemiPage - 1) * ITEMS_PER_DETAILS_PAGE;
                                const paginatedItems = allCustomizeItems.slice(startIndex, startIndex + ITEMS_PER_DETAILS_PAGE);

                                return allCustomizeItems.length > 0 ? (
                                    <table className='table table-bordered' style={{ marginBottom: 0 }}>
                                        <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1 }}>
                                            <tr>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd', width: '15%' }}>Type</th>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd', width: '15%' }}>Base Product Code</th>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd', width: '35%' }}>Description</th>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd', width: '25%' }}>Additional Description</th>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd', width: '10%', textAlign: 'center' }}>Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedItems.map((item, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '12px' }}>
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
                                                    <td style={{ padding: '12px', fontWeight: '500' }}>{item.baseProductId || 'N/A'}</td>
                                                    <td style={{ padding: '12px' }}>{item.description}</td>
                                                    <td style={{ padding: '12px' }}>{item.additionalDescription || 'N/A'}</td>
                                                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500', fontSize: '16px' }}>{item.qty || 0}</td>
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
                                const allCustomizeItems = [
                                    ...(currentSemiDetails || []),
                                    ...(currentFullDetails || [])
                                ];
                                const totalPagesCustomize = Math.ceil(allCustomizeItems.length / ITEMS_PER_DETAILS_PAGE);

                                return totalPagesCustomize > 1 ? (
                                    <CustomPagination
                                        currentPage={currentSemiPage}
                                        totalPages={totalPagesCustomize}
                                        onPageChange={(page) => setCurrentSemiPage(page)}
                                        color="green"
                                    />
                                ) : (
                                    <div style={{ height: '40px' }}></div>
                                );
                            })()}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setCustomizeDeliveriesDataVisible(true)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => { setCustomizeAppointDriverVisible(false); setCustomizeTransferDriverName('') }}>
                        Deliver The Stock
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Customize Request - Appoint Driver Modal */}
            <Modal show={!customizeAppointDriverVisible} onHide={() => setCustomizeAppointDriverVisible(true)} size='md' centered>
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
                            value={customizeTransferDriverName}
                            onChange={(e) => setCustomizeTransferDriverName(e.target.value)}
                            placeholder="Enter driver name"
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
                    <Button variant="outline-secondary" onClick={() => setCustomizeAppointDriverVisible(true)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={DeliverCustomizeStock}
                        disabled={!customizeTransferDriverName || customizeTransferDriverName.trim().length === 0}
                        style={{
                            backgroundColor: customizeTransferDriverName && customizeTransferDriverName.trim().length > 0 ? '#2563eb' : '#6c757d',
                            border: 'none',
                            opacity: customizeTransferDriverName && customizeTransferDriverName.trim().length > 0 ? 1 : 0.6
                        }}
                    >
                        Confirm Appointment
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Main Content */}
            <div className='dash-main' style={{ overflow: 'auto' }}>
                <div style={{ marginBottom: '20px' }}>
                    <h1>REQUEST MANAGEMENT</h1>
                </div>

                {/* Tabs */}
                <div style={{ marginBottom: '20px', borderBottom: '2px solid #e9ecef' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                            onClick={() => setActiveTab('normal')}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                borderBottom: activeTab === 'normal' ? '3px solid #667eea' : '3px solid transparent',
                                backgroundColor: activeTab === 'normal' ? '#f8f9fa' : 'transparent',
                                color: activeTab === 'normal' ? '#667eea' : '#6c757d',
                                fontWeight: activeTab === 'normal' ? '600' : '500',
                                cursor: 'pointer',
                                fontSize: '15px',
                                transition: 'all 0.3s'
                            }}
                        >
                            Normal Stock Requests
                        </button>
                        <button
                            onClick={() => setActiveTab('customize')}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                borderBottom: activeTab === 'customize' ? '3px solid #667eea' : '3px solid transparent',
                                backgroundColor: activeTab === 'customize' ? '#f8f9fa' : 'transparent',
                                color: activeTab === 'customize' ? '#667eea' : '#6c757d',
                                fontWeight: activeTab === 'customize' ? '600' : '500',
                                cursor: 'pointer',
                                fontSize: '15px',
                                transition: 'all 0.3s'
                            }}
                        >
                            Customize Requests
                        </button>
                    </div>
                </div>

                {/* Normal Stock Request Content */}
                {activeTab === 'normal' && (
                    <>
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
                                        value={normalRequestFromFilter}
                                        onChange={(e) => setNormalRequestFromFilter(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ced4da',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="">All Locations</option>
                                        {getUniqueNormalLocations().map((location, index) => (
                                            <option key={index} value={location}>{location}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                        Filter by Request By
                                    </label>
                                    <select
                                        value={normalRequestByFilter}
                                        onChange={(e) => setNormalRequestByFilter(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ced4da',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="">All Users</option>
                                        {getUniqueNormalUsers().map((user, index) => (
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
                                            value={normalSearchFilter}
                                            onChange={(e) => setNormalSearchFilter(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px 8px 35px',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        />
                                        {normalSearchFilter && (
                                            <button
                                                type="button"
                                                onClick={() => setNormalSearchFilter('')}
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
                                {normalRequestFromFilter && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '3px 8px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }}>
                                        {normalRequestFromFilter}
                                        <button onClick={() => setNormalRequestFromFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '16px' }}>×</button>
                                    </span>
                                )}
                                {normalRequestByFilter && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '3px 8px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }}>
                                        {normalRequestByFilter}
                                        <button onClick={() => setNormalRequestByFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '16px' }}>×</button>
                                    </span>
                                )}
                                {!normalRequestFromFilter && !normalRequestByFilter && !normalSearchFilter && (
                                    <span style={{ color: '#6c757d' }}>None</span>
                                )}
                                <span style={{ marginLeft: '6px', color: '#6c757d', fontSize: '12px' }}>
                                    ({normalFilteredData.length} of {normalRequestList.length})
                                </span>
                            </div>
                            <button onClick={() => {
                                setNormalRequestFromFilter('');
                                setNormalRequestByFilter('');
                                setNormalSearchFilter('');
                                setNormalCurrentPage(1);
                            }} style={{
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
                            {normalCurrentItems.length > 0 ? (
                                normalCurrentItems.map((request, i) => {
                                    const statusColors = getStatusColor(request.request_status);
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                setNormalDeliveriesDataVisible(false);
                                                GetNormalDeliveriesData(request.request_stock_id);
                                                GetNormalDeliveriesDetails(request.request_stock_id);
                                                setNormalRID(request.request_stock_id);
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
                                                            #{request.request_stock_id}
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
                                                    {request.request_status}
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
                                        {normalRequestList.length === 0 ? 'No requests found' : 'No requests match the current filters'}
                                    </h4>
                                    <p style={{
                                        margin: '0',
                                        fontSize: '14px',
                                        maxWidth: '300px',
                                        lineHeight: '1.4'
                                    }}>
                                        {normalRequestList.length === 0
                                            ? 'No ongoing requests at the moment. New requests will appear here when available.'
                                            : 'Try adjusting your filters to see more results.'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination - Fixed Position */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: '30px',
                            paddingBottom: '20px',
                            minHeight: '60px'
                        }}>
                            {normalTotalPages > 1 ? (
                                <CustomPagination
                                    currentPage={normalCurrentPage}
                                    totalPages={normalTotalPages}
                                    onPageChange={(page) => setNormalCurrentPage(page)}
                                    color="green"
                                />
                            ) : (
                                <div style={{ height: '40px' }}></div>
                            )}
                        </div>
                    </>
                )}

                {/* Customize Request Content */}
                {activeTab === 'customize' && (
                    <>
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
                                        value={customizeRequestFromFilter}
                                        onChange={(e) => setCustomizeRequestFromFilter(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ced4da',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="">All Locations</option>
                                        {getUniqueCustomizeLocations().map((location, index) => (
                                            <option key={index} value={location}>{location}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                        Filter by Request By
                                    </label>
                                    <select
                                        value={customizeRequestByFilter}
                                        onChange={(e) => setCustomizeRequestByFilter(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ced4da',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="">All Users</option>
                                        {getUniqueCustomizeUsers().map((user, index) => (
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
                                            value={customizeSearchFilter}
                                            onChange={(e) => setCustomizeSearchFilter(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px 8px 35px',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        />
                                        {customizeSearchFilter && (
                                            <button
                                                type="button"
                                                onClick={() => setCustomizeSearchFilter('')}
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
                                {customizeRequestFromFilter && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '3px 8px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }}>
                                        {customizeRequestFromFilter}
                                        <button onClick={() => setCustomizeRequestFromFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '16px' }}>×</button>
                                    </span>
                                )}
                                {customizeRequestByFilter && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '3px 8px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }}>
                                        {customizeRequestByFilter}
                                        <button onClick={() => setCustomizeRequestByFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '16px' }}>×</button>
                                    </span>
                                )}
                                {!customizeRequestFromFilter && !customizeRequestByFilter && !customizeSearchFilter && (
                                    <span style={{ color: '#6c757d' }}>None</span>
                                )}
                                <span style={{ marginLeft: '6px', color: '#6c757d', fontSize: '12px' }}>
                                    ({customizeFilteredData.length} of {customizeRequestList.filter(item => item.status === 'On Going').length} on-going)
                                </span>
                            </div>
                            <button onClick={() => {
                                setCustomizeRequestFromFilter('');
                                setCustomizeRequestByFilter('');
                                setCustomizeSearchFilter('');
                                setCustomizeCurrentCardsPage(1);
                            }} style={{
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
                            {customizeCurrentCardsItems.length > 0 ? (
                                customizeCurrentCardsItems.map((request, i) => {
                                    const statusColors = getStatusColor(request.status);
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                setCustomizeDeliveriesDataVisible(false);
                                                GetCustomizeDeliveriesData(request);
                                                setCustomizeRID(request.customize_req_id);
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
                                                    <div style={{ flex: 1, minWidth: 0 }}>
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
                                                            color: '#2c3e50',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
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
                                        {customizeRequestList.filter(item => item.status === 'On Going').length === 0 ? 'No on-going requests found' : 'No requests match the current filters'}
                                    </h4>
                                    <p style={{
                                        margin: '0',
                                        fontSize: '14px',
                                        maxWidth: '300px',
                                        lineHeight: '1.4'
                                    }}>
                                        {customizeRequestList.filter(item => item.status === 'On Going').length === 0
                                            ? 'No on-going requests at the moment. New requests will appear here when they are in progress.'
                                            : 'Try adjusting your filters to see more results.'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination - Fixed Position */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: '30px',
                            paddingBottom: '20px',
                            minHeight: '60px'
                        }}>
                            {customizeTotalCardsPages > 1 ? (
                                <CustomPagination
                                    currentPage={customizeCurrentCardsPage}
                                    totalPages={customizeTotalCardsPages}
                                    onPageChange={(page) => setCustomizeCurrentCardsPage(page)}
                                    color="green"
                                />
                            ) : (
                                <div style={{ height: '40px' }}></div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default UnifiedRequestManagement;