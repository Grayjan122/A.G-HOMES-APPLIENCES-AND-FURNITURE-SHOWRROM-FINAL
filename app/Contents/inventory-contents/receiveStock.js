'use client';
import { useState, useEffect, useRef } from 'react';
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


const ReceiveStockIM = () => {

    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');

    const [locationList, setLocationList] = useState([]);

    const [recieveStockList, setReceivStockList] = useState([]);
    const [requestDetails, setRequestDetails] = useState([]);


    const [rs_StoreID, setRs_StoreID] = useState('');

    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(requestDetails.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = requestDetails.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

    const [continueR, setContinueR] = useState(true);
    const [reqDateTime, setReqDateTime] = useState("");



    const Logs = async (accID, activity) => {
        // setProdId(id);

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'audit-log.php';
        // const url = "http://localhost/capstone-api/api/products.php";

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
            console.error("Error recording event logs:", error);

        }
        return;
    };

    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));
        GetLocation();
        document.getElementById("c-loc")?.focus();
        document.getElementById("c-loc")?.click();




    }, []);

    const GetLocation = async () => {

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'location.php';
        // const url = "http://localhost/capstone-api/api/products.php";


        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]), // Send an empty object if required
                    operation: "GetLocation"
                }
            });

            setLocationList(response.data);
            // alert("Success");
        } catch (error) {
            console.error("Error fetching location list:", error);
        }
    };
    useEffect(() => {
        GetRequest();
    }, [rs_StoreID]);

    const GetRequest = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        
        // If no store is selected or "Select All Location" is selected, fetch all "On Delivery" deliveries
        // Otherwise, filter by the selected location
        // Convert rs_StoreID to string first to handle both string and number types
        const storeIDStr = rs_StoreID ? String(rs_StoreID).trim() : '';
        const ID = {
            locID: (storeIDStr !== '' && storeIDStr !== ' ' && !isNaN(parseInt(storeIDStr))) ? parseInt(storeIDStr) : 0,
            status: 'On Delivery'
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetNormalDeliveriesForReceiving"
                }
            });

            // Handle response - check if it's an error object or data array
            if (response.data && typeof response.data === 'object' && response.data.error) {
                console.error("Error from backend:", response.data.error);
                setReceivStockList([]);
            } else {
                const deliveryData = Array.isArray(response.data) ? response.data : [];
                console.log('[GetRequest] Fetched', deliveryData.length, 'deliveries for receiving');
                const normalizedData = await Promise.all(deliveryData.map(async (item) => {
                    if (item.id_maker) {
                        return { ...item, id_maker: item.id_maker };
                    }

                    // Attempt to fetch id_maker using delivery info
                    if (item.r_delivery_id) {
                        try {
                            const infoResponse = await axios.get(url, {
                                params: {
                                    json: JSON.stringify({ r_delivery_id: item.r_delivery_id }),
                                    operation: "GetNormalDeliveryInfo"
                                }
                            });

                            const infoData = Array.isArray(infoResponse.data) ? infoResponse.data[0] : infoResponse.data;
                            if (infoData && infoData.id_maker) {
                                return { ...item, id_maker: infoData.id_maker };
                            }
                        } catch (infoError) {
                            console.error("Error fetching id_maker for delivery:", infoError);
                        }
                    }

                    return { ...item, id_maker: item.request_stock_id };
                }));

                setReceivStockList(normalizedData);
            }

        } catch (error) {
            console.error("Error fetching delivery list:", error);
            setReceivStockList([]);
        }
        return;
    };



    const [viewRequestDetailVisibl, setViewRequestDetailVisible] = useState(true);


    const triggerModal = async (operation, r_delivery_id) => {
        switch (operation) {
            case 'viewRequestDetails':
                // r_delivery_id is the delivery batch ID from request_delivery table
                // Ensure both functions complete before opening modal
                await Promise.all([
                    GetRequestDetails(r_delivery_id),
                    GetRequestD(r_delivery_id)
                ]);
                setViewRequestDetailVisible(false);
                break;
        }

    }

    const [s_reqID, setS_ReqID] = useState('');
    const [s_idMaker, setS_idMaker] = useState('');
    const [s_reqDate, setS_ReqDate] = useState('');
    const [s_reqBy, setS_ReqBy] = useState('');
    const [s_reqFrom, setS_ReqFrom] = useState('');
    const [s_reqStatus, setS_ReqStatus] = useState('');
    const [reqFromId, setReqFromId] = useState('');
    const [reqToId, setReqToId] = useState('');
    const [r_delivery_id, setR_Delivery_ID] = useState(''); // Store the delivery batch ID

    const [dFrom, setDFrom] = useState('');
    const [driver, setDriver] = useState('');

    // Date and Time formatting functions
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        
        // If time is already in HH:MM:SS format
        const timeParts = timeString.split(':');
        if (timeParts.length >= 2) {
            let hours = parseInt(timeParts[0]);
            const minutes = timeParts[1];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            return `${hours}:${minutes} ${ampm}`;
        }
        
        return timeString;
    };

    const formatDateTime = (dateString, timeString) => {
        if (!dateString && !timeString) return '';
        
        const formattedDate = formatDate(dateString);
        const formattedTime = formatTime(timeString);
        
        if (formattedDate && formattedTime) {
            return `${formattedDate} • ${formattedTime}`;
        }
        
        return formattedDate || formattedTime || '';
    };

    const GetRequestDetails = async (r_delivery_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            r_delivery_id: r_delivery_id
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetNormalDeliveryDetailsFromBatch"
                }
            });

            // Handle error response
            if (response.data && typeof response.data === 'object' && response.data.error) {
                console.error("Error from backend:", response.data.error);
                setRequestDetails([]);
            } else {
                const deliveryDetails = Array.isArray(response.data) ? response.data : [];
                console.log(`[GetRequestDetails] Fetched ${deliveryDetails.length} products from request_delivery_details`);
                setRequestDetails(deliveryDetails);
            }

        } catch (error) {
            console.error("Error fetching delivery details:", error);
            setRequestDetails([]);
        }
        return;
    };

    // This function is no longer needed as we get date/time directly from request_delivery
    // Keeping it for backward compatibility but it won't be used
    const GetTrackRequestTimeandDate = async (req_id, status) => {
        // Date and time are now fetched directly from request_delivery in GetRequestD
        return "";
    };

    const GetRequestD = async (r_delivery_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            r_delivery_id: r_delivery_id
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetNormalDeliveryInfo"
                }
            });

            // Handle error response
            if (response.data && typeof response.data === 'object' && response.data.error) {
                console.error("Error from backend:", response.data.error);
                return;
            }

            const data = Array.isArray(response.data) ? response.data[0] : response.data;
            if (!data) {
                console.error("No delivery data found for r_delivery_id:", r_delivery_id);
                return;
            }

            setS_ReqBy(`${data.fname || ''} ${data.mname || ''} ${data.lname || ''}`.trim());
            setS_ReqID(data.request_stock_id);
            setS_idMaker(data.id_maker || data.request_stock_id);
            setS_ReqDate(data.date);  // delivery_date from request_delivery
            setS_ReqFrom(data.reqFrom);
            setS_ReqStatus(data.delivery_status || data.request_status);  // Use delivery_status from request_delivery
            setReqFromId(data.request_from);
            setReqToId(data.request_to);
            setDriver(data.driverName || 'Not Assigned');
            setDFrom(data.reqTo);
            setRs_StoreID(data.request_from);
            setR_Delivery_ID(r_delivery_id); // Store the delivery batch ID for receiving
            
            // Format date and time from request_delivery
            if (data.date && data.delivery_time) {
                setReqDateTime(formatDateTime(data.date, data.delivery_time));
            } else {
                setReqDateTime('');
            }

        } catch (error) {
            console.error("Error fetching delivery info:", error);
        }
        return;
    };



    const [currentStoreInventory, setCurrentStoreInventory] = useState([]);

    useEffect(() => {
        GetCurrentSotreInventory();
    }, [rs_StoreID])


    const GetCurrentSotreInventory = async () => {
        if (!rs_StoreID) {
            setCurrentStoreInventory([]);
            return;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'inventory.php';

        const locDetails = {
            locID: rs_StoreID,
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
                setCurrentStoreInventory(response.data);
                console.log('[GetCurrentSotreInventory] Fetched', response.data.length, 'inventory items');
            } else {
                setCurrentStoreInventory([]);
            }

        } catch (error) {
            console.error("Error fetching inventory:", error);
            setCurrentStoreInventory([]);
        }
        return;
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

    const ReveiceStock = async () => {
        // Validate that we have delivery details
        if (!requestDetails || requestDetails.length === 0) {
            showAlertError({
                icon: "error",
                title: "No Delivery Details!",
                text: 'Delivery details are missing. Please refresh and try again.',
                button: 'OK'
            });
            return;
        }

        const oldProduct = [];
        const newProduct = [];
        const report = [];
        
        // Ensure we have current inventory before processing
        await GetCurrentSotreInventory();

        console.log('[ReveiceStock] Deliver Details:', requestDetails);
        console.log('[ReveiceStock] Deliver Details Length:', requestDetails.length);
        console.log('[ReveiceStock] Current Inventory:', currentStoreInventory);
        console.log('[ReveiceStock] Current Inventory Length:', currentStoreInventory.length);
        console.log('[ReveiceStock] Request ID:', s_reqID);
        console.log('[ReveiceStock] Store ID:', rs_StoreID);

        if (!requestDetails || requestDetails.length === 0) {
            showAlertError({
                icon: "error",
                title: "No Delivery Details!",
                text: 'Delivery details are missing. Please close and reopen the delivery details.',
                button: 'OK'
            });
            return;
        }

        requestDetails.forEach((invProd) => {
            // Ensure we have valid product_id and qty
            if (!invProd.product_id || !invProd.qty || invProd.qty <= 0) {
                console.error('[ReveiceStock] Invalid product data:', invProd);
                return; // Skip invalid products
            }

            const match = currentStoreInventory.find(delProd =>
                String(delProd.product_id) === String(invProd.product_id)
            );

            if (match) {
                oldProduct.push({
                    product_id: parseInt(invProd.product_id),
                    qty: parseInt(invProd.qty) + parseInt(match.qty || 0)
                });

                report.push({
                    prodID: parseInt(match.product_id),
                    pastBalance: parseInt(match.qty || 0),
                    qty: parseInt(invProd.qty),
                    currentBalance: parseInt(invProd.qty) + parseInt(match.qty || 0)
                });

            } else {
                newProduct.push({
                    product_id: parseInt(invProd.product_id),
                    qty: parseInt(invProd.qty)
                });
                report.push({
                    prodID: parseInt(invProd.product_id),
                    pastBalance: 0,
                    qty: parseInt(invProd.qty),
                    currentBalance: parseInt(invProd.qty)
                });
            }
        });



        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        // const url = "http://localhost/capstone-api/api/products.php";

        const ID = {
            reqID: s_reqID,
            r_delivery_id: r_delivery_id, // Pass the specific delivery batch ID
            accID: accountID,
            locID: parseInt(rs_StoreID)
        }

        console.log(ID);
        console.log('OLD:', oldProduct);
        console.log('NEW:', newProduct);
        console.log('Reports:', report);
        // return;


        // return;
        try {
            const response = await axios.get(url, {
                params: {
                    updatedInventory: JSON.stringify(oldProduct),
                    newInventory: JSON.stringify(newProduct),
                    reportInventory: JSON.stringify(report),
                    json: JSON.stringify(ID), // Send an empty object if required
                    operation: "ReceiveStockRequest"
                }
            });
            // alert(response.data[0].product_name);
            if (response.data == 'Success') {
                // alert(response.data);
                // setMessage('Successfuly received the delivery!');
                // // setAlertBG('#dc7a80');
                // setAlertBG('#0ced93');
                // setAlertVariant('success');
                // setAlert1(true);

                // setTimeout(() => {
                //     setAlert1(false);
                // }, 3000);
                // // setReceiveStockDetailsVisible(true);
                AlertSucces(
                    "Successfuly received the delivery! Stock is added to inventory.",
                    "success",
                    true,
                    'Good'
                );
                setViewRequestDetailVisible(true);
                setContinueR(true);
                GetRequest();
                Logs(accountID, 'Receive the delivery from request #' + (s_idMaker || s_reqID));

                // Send notification to warehouse location (Warehouse Representative)
                await createNotification({
                    type: 'delivery',
                    title: 'Delivery Received',
                    message: `Request #${s_idMaker || s_reqID} has been successfully received by ${s_reqFrom}.`,
                    locationId: reqToId, // Warehouse location (delivery from)
                    targetRole: 'Warehouse Representative',
                    productId: null,
                    customerId: null,
                    referenceId: s_idMaker || s_reqID
                });
                
                return;


            } else {
                // Check if response.data contains error message
                const errorMessage = typeof response.data === 'string' && response.data.startsWith('Error:') 
                    ? response.data 
                    : 'Failed to receive the delivery!';
                
                console.error('[ReveiceStock] Error response:', response.data);
                console.error('[ReveiceStock] Request ID:', s_reqID);
                console.error('[ReveiceStock] Delivery ID:', r_delivery_id);
                console.error('[ReveiceStock] Old Products:', oldProduct);
                console.error('[ReveiceStock] New Products:', newProduct);
                console.error('[ReveiceStock] Reports:', report);

                showAlertError({
                    icon: "error",
                    title: "Failed to Receive Delivery!",
                    text: errorMessage + '\n\nPlease check the console for details.',
                    button: 'OK'
                });

                setViewRequestDetailVisible(true);
                setContinueR(true);
                GetRequest(); // Refresh the list to show the delivery again
                return;
            }
            // alert('success');

        } catch (error) {
            console.error("Error fetching inventory:", error);

        }
        return;


    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };







    return (
        <>

            <Head>
                <title>Dashboard | My App</title>
            </Head>

            <Alert variant={alertVariant} className='alert-inventory' show={alert1} style={{ backgroundColor: alertBG }}>
                {message}
            </Alert>


            <Modal show={!continueR} onHide={() => { setContinueR(true) }} size='md' className='searched-product-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title >Recieve This Delivery</Modal.Title>
                </Modal.Header>
                <Modal.Body className='searched-product-body' >
                    Continue receiving the delivery?
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => { setContinueR(true) }}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={async () => {
                        // Ensure inventory is loaded before receiving
                        await GetCurrentSotreInventory();
                        // Small delay to ensure state is updated
                        setTimeout(() => {
                            ReveiceStock();
                        }, 100);
                    }}>
                        Continue
                    </Button>
                </Modal.Footer>
            </Modal> {/* clear confirmation product modal */}


            <Modal show={!viewRequestDetailVisibl} onHide={() => {
                setViewRequestDetailVisible(true); GetRequest();
            }} size='lg' className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title >Request Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body' >

                    <div className="r-details-head">
                        <div className='r-d-div'>
                            <div className='r-1'><strong>REQUEST ID:</strong> {s_idMaker || s_reqID}</div>
                            <div><strong>DELIVERY DATE:</strong> {formatDate(s_reqDate)}</div>

                        </div>
                        <div><strong>DELIVERY FROM:</strong> {dFrom}</div>
                        <div><strong>DELIVER BY:</strong> {driver}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: s_reqStatus === 'On Delivery' ? 'goldenrod' : s_reqStatus === 'Delivered' ? 'green' : 'black',
                                fontWeight: 'bold'
                            }}>
                                {s_reqStatus} | {reqDateTime}
                            </span>
                        </div>
                    </div>

                    <div className='tableContainer' style={{ height: '30vh', overflowY: 'auto' }}>
                        <table className='table'>
                            <thead>
                                <tr>
                                    {/* <th className='t2'></th> */}
                                    <th className='t2'>Product Code</th>
                                    <th className='t2'>Product Description</th>
                                    <th className='th1'>Requested QTY</th>
                                    {/* <th className='t2'>Available Stock</th> */}

                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((p, i) => (
                                    <tr key={i}
                                    // onClick={() => { handleCheckboxChange1(p.product_id, location_id) }}
                                    >
                                        {/* <td>
                                            <input
                                                type="checkbox"
                                                checked={!!checkedItems[p.product_id]}
                                                onChange={() => handleCheckboxChange1(p.product_id, location_id)}
                                            />
                                        </td> */}
                                        <td className='td-name'>{p.product_name}</td>
                                        <td className='td-name'>{p.description}</td>
                                        <td style={{textAlign: 'center'}}>{p.qty}</td>
                                        {/* <td>{Availability(p.product_id)}</td> */}
                                    </tr>
                                ))}
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
                        setViewRequestDetailVisible(true);
                        GetRequest();
                        // setAvailProducts([]);
                    }}>
                        Close
                    </Button>

                    {/* <Button variant="primary" onClick={ApproveRequest}>
                        Approve Transfer
                    </Button> */}
                    <Button variant="primary" onClick={() => { setContinueR(false); }}>
                        Recieve
                    </Button>

                </Modal.Footer>
            </Modal> {/*request details modal */}

            < div className='customer-main' >

                <div className='customer-header'>
                    <h1 className='h-customer'>Receive Stock Delivery</h1>
                    <div style={{
                        // marginTop: '15px',
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

                <div className='search-customer'>
                    <div className='filter'>
                        <div >
                            <label className='label'>Store:</label>
                            <select className='new' value={rs_StoreID} onChange={(e) => setRs_StoreID(e.target.value)} id='c-loc'>
                                <option value={' '}> Select All Location</option>

                                {locationList.
                                filter(r => r.name !== "Warehouse")
                                .map((r) => (
                                    <option key={r.location_id} value={r.location_id}>
                                        {r.location_name}
                                    </option>
                                ))}
                            </select>
                        </div>


                    </div>

                </div>

                <div className="cardContainer" style={{ height: '60vh', overflowY: 'auto', padding: '10px' }}>
                    {recieveStockList.length === 0 ? (
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
                                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>No Stock Delivery Found</div>
                                <div>There are currently no delivery yet.</div>
                            </div>
                        </div>
                    ) : (
                        recieveStockList.map((p, i) => (
                            <div
                                className="requestCard"
                                key={i}
                                onClick={() => {
                                    triggerModal('viewRequestDetails', p.r_delivery_id);
                                }}
                            >
                                <div className="cardContent">
                                    <div className="cardDetails">
                                        <div className="cardRow">
                                            <span className="cardLabel">DELIVERY ID:</span>
                                            <span className="cardValue" style={{ fontWeight: 'bold', fontSize: '18px' }}>#{p.r_delivery_id}</span>
                                        </div>
                                        <div className="cardRow">
                                            <span className="cardLabel">REQUEST ID:</span>
                                            <span className="cardValue">{p.id_maker || p.request_stock_id}</span>
                                        </div>
                                        <div className="cardRow">
                                            <span className="cardLabel">DELIVERY FROM:</span>
                                            <span className="cardValue">{p.reqTo}</span>
                                        </div>
                                        <div className="cardRow">
                                            <span className="cardLabel">DELIVER BY:</span>
                                            <span className="cardValue">{p.driverName || 'Not Assigned'}</span>
                                        </div>
                                        <div className="cardRow">
                                            <span className="cardLabel">STATUS:</span>
                                            <span
                                                className="cardValue"
                                                style={{
                                                    color:
                                                        p.delivery_status === 'On Delivery'
                                                            ? 'goldenrod'
                                                            : p.delivery_status === 'Delivered'
                                                                ? 'green'
                                                                : 'black',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {p.delivery_status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="statusIcon">
                                        {p.delivery_status === 'On Delivery' && <span>🚚</span>}
                                        {p.delivery_status === 'Delivered' && <span>✅</span>}
                                        {p.delivery_status !== 'On Delivery' && p.delivery_status !== 'Delivered' && <span>📦</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div >
            {/* for main */}

        </>
    )
}

export default ReceiveStockIM;

