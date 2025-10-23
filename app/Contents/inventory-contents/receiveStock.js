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

        // alert(rs_StoreID);

        // setProdId(id);

        // alert(sessionStorage.getItem('location_id'));
        // return;
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            locID: rs_StoreID,
            status: 'OnDeliver',
            reqType: 'ReqFrom'

        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID), // Send an empty object if required
                    operation: "GetRequest3"
                }
            });
            // console.log(response.data);

            setReceivStockList(response.data);



        } catch (error) {
            console.error("Error fetching request list:", error);

        }
        return;
    };



    const [viewRequestDetailVisibl, setViewRequestDetailVisible] = useState(true);


    const triggerModal = (operation, id) => {
        switch (operation) {
            case 'viewRequestDetails':
                // alert(id);
                // setRequestList1([]);
                GetRequestDetails(id);
                GetRequestD(id);
                setViewRequestDetailVisible(false);
                break;
        }

    }

    const [s_reqID, setS_ReqID] = useState('');
    const [s_reqDate, setS_ReqDate] = useState('');
    const [s_reqBy, setS_ReqBy] = useState('');
    const [s_reqFrom, setS_ReqFrom] = useState('');
    const [s_reqStatus, setS_ReqStatus] = useState('');
    const [reqFromId, setReqFromId] = useState('');
    const [reqToId, setReqToId] = useState('');

    const [dFrom, setDFrom] = useState('');
    const [driver, setDriver] = useState('');



    const GetRequestDetails = async (req_id) => {
        // setProdId(id);

        // alert(sessionStorage.getItem('location_id'));
        // const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        // const url = "http://localhost/capstone-api/api/products.php";
        // alert(LocationID);
        const ID = {
            reqID: req_id,
            // locID: LocationID
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID), // Send an empty object if required
                    operation: "GetRequestDetails"
                }
            });
            // alert(response.data[0].product_name);
            // setRequestDetails(response.data);
            // console.log(response.data);
            // console.log('Hellow');
            // alert(response.data);
            setRequestDetails(response.data);



        } catch (error) {
            console.error("Error fetching request details:", error);

        }
        return;
    };

    const GetTrackRequestTimeandDate = async (req_id, status) => {

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

            if (response.data && response.data.length > 0) {
                // format "12-01-2025 • 10:30"
                setReqDateTime(response.data[0].date + " • " + response.data[0].time);
                // alert('hell');
            } else {
                return "";
            }
        } catch (error) {
            handleError(error, "fetching request data");
            return "";
        }
    };

    const GetRequestD = async (req_id) => {
        // setProdId(id);

        // alert(sessionStorage.getItem('location_id'));
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        // const url = "http://localhost/capstone-api/api/products.php";
        // alert(LocationID);
        const ID = {
            reqID: req_id,
            locID: LocationID

        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID), // Send an empty object if required
                    operation: "GetRequestD2"
                }
            });
            // alert(response.data[0].product_name);
            // setRequestDetails(response.data);
            const data = response.data[0];

            setS_ReqBy(response.data[0].fname + " " + response.data[0].mname + " " + response.data[0].lname);
            setS_ReqID(response.data[0].request_stock_id);
            setS_ReqDate(response.data[0].date);
            setS_ReqFrom(response.data[0].reqFrom);
            setS_ReqStatus(response.data[0].request_status);
            setReqFromId(response.data[0].request_from);
            setReqToId(response.data[0].request_to);
            setDriver(response.data[0].F + " " + response.data[0].M + " " + response.data[0].L);
            setDFrom(response.data[0].reqTo);
            setRs_StoreID(data.request_from);
            GetTrackRequestTimeandDate(data.request_stock_id, data.request_status);


            // console.log(response.data);
            // console.log('Hellow');
            // alert(response.data);



        } catch (error) {
            console.error("Error fetching request details:", error);

        }
        return;
    };



    const [currentStoreInventory, setCurrentStoreInventory] = useState([]);

    useEffect(() => {
        GetCurrentSotreInventory();
    }, [rs_StoreID])


    const GetCurrentSotreInventory = async () => {
        // setProdId(id);
        // alert(location_id);
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'inventory.php';
        // const url = "http://localhost/capstone-api/api/products.php";


        const locDetails = {
            locID: rs_StoreID,
            stockLevel: '',
            search: ''
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(locDetails), // Send an empty object if required
                    operation: "GetInventory"
                }
            });
            // alert(response.data[0].product_name);
            if (response.data) {
                setCurrentStoreInventory(response.data);
                console.log(response.data);


            } else {
                setCurrentStoreInventory([]);
            }
            // alert('success');

        } catch (error) {
            console.error("Error fetching inventory:", error);

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


        const oldProduct = [];
        const newProduct = [];
        const report = [];
        GetCurrentSotreInventory();



        console.log('Deliver Details:', requestDetails);
        console.log('Current Inventory:', currentStoreInventory);

        requestDetails.forEach((invProd) => {
            const match = currentStoreInventory.find(delProd =>
                delProd.product_id == invProd.product_id
            );

            if (match) {
                oldProduct.push({
                    ...invProd,
                    qty: invProd.qty + match.qty
                });

                report.push({
                    prodID: match.product_id,
                    pastBalance: match.qty,
                    qty: invProd.qty,
                    currentBalance: invProd.qty + match.qty
                });

            } else {
                newProduct.push(invProd);
                report.push({
                    prodID: invProd.product_id,
                    pastBalance: 0,
                    qty: invProd.qty,
                    currentBalance: invProd.qty + 0
                });
            }
        });



        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        // const url = "http://localhost/capstone-api/api/products.php";

        const ID = {
            reqID: s_reqID,
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
                Logs(accountID, 'Receive the delivery from request #' + s_reqID);

                // Send notification to warehouse location (Warehouse Representative)
                await createNotification({
                    type: 'delivery',
                    title: 'Delivery Received',
                    message: `Stock request #${s_reqID} has been successfully received by ${s_reqFrom}.`,
                    locationId: reqToId, // Warehouse location (delivery from)
                    targetRole: 'Warehouse Representative',
                    productId: null,
                    customerId: null,
                    referenceId: s_reqID
                });
                
                return;


            } else {
                // alert(response.data);

                // setMessage('Failed to recieve the stock!' + response.data);
                // setAlertBG('#dc7a80');
                // // setAlertBG('#0ced93');
                // setAlertVariant('danger');
                // setAlert1(true);
                console.log(response.data);


                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to recieve the delivery!',
                    button: 'Try Again'
                });

                setViewRequestDetailVisible(true);
                setContinueR(true);
                GetRequest();
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
                    <Button variant="primary" onClick={() => {
                        GetCurrentSotreInventory();
                        ReveiceStock();
                    }}>
                        Continue
                    </Button>
                </Modal.Footer>
            </Modal> {/* clear confirmation product modal */}


            <Modal show={!viewRequestDetailVisibl} onHide={() => {
                setViewRequestDetailVisible(true); GetRequest();
            }} size='lg' className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title >Request Detials</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body' >

                    <div className="r-details-head">
                        <div className='r-d-div'>
                            <div className='r-1'><strong>REQUEST ID:</strong> {s_reqID}</div>
                            <div><strong>REQUEST DATE:</strong> {s_reqDate}</div>

                        </div>
                        <div><strong>DELIVERY FROM:</strong> {dFrom}</div>
                        <div><strong>DELIVER BY:</strong> {driver}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: s_reqStatus === 'Pending' ? 'red' : s_reqStatus === 'Approved' ? 'green' : 'black',
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

                                {locationList.map((r) => (
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
                                    triggerModal('viewRequestDetails', p.request_stock_id);
                                }}
                            >
                                <div className="cardContent">
                                    <div className="cardDetails">
                                        <div className="cardRow">
                                            <span className="cardLabel">REQUEST ID:</span>
                                            <span className="cardValue" style={{ fontWeight: 'bold', fontSize: '18px' }}>{p.request_stock_id}</span>
                                        </div>
                                        <div className="cardRow">
                                            <span className="cardLabel">DELIVERY FROM:</span>
                                            <span className="cardValue">{p.reqTo}</span>
                                        </div>
                                        <div className="cardRow">
                                            <span className="cardLabel">DELIVER BY:</span>
                                            <span className="cardValue">{p.F} {p.M} {p.L}</span>
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
                                                    fontWeight: 'bold'
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

            </div >
            {/* for main */}

        </>
    )
}

export default ReceiveStockIM;

