'use client';
import { useState, useEffect, useRef } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import { Col, Row, Container } from 'react-bootstrap';
import CustomPagination from '@/app/Components/Pagination/pagination';
import 'sweetalert2/dist/sweetalert2.all';
import Swal from 'sweetalert2';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import { AlertSucces } from '@/app/Components/SweetAlert/success';

import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';


const ITEMS_PER_PAGE_REQUEST = 10;

const StockInWR = () => {
    // Core state
    const [user_id, setUser_id] = useState('');
    const [productList, setProductList] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const [stockInList, setStockInList] = useState([]);
    const [currentStoreInventory, setCurrentStoreInventory] = useState([]);
    const [searchList, setSearchList] = useState([]);

    // Input states
    const [prodName, setProdName] = useState('');

    // Modal states
    const [clearReq, setClearReq] = useState(true);
    const [continueSendReq, setContinueSendReq] = useState(true);

    // Alert states
    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

    // Pagination
    const [currentRequestPage, setCurrentRequestPage] = useState(1);
    const totalRequestPages = Math.ceil(stockInList.length / ITEMS_PER_PAGE_REQUEST);
    const startRequestIndex = (currentRequestPage - 1) * ITEMS_PER_PAGE_REQUEST;
    const currentRequestItems = stockInList.slice(startRequestIndex, startRequestIndex + ITEMS_PER_PAGE_REQUEST);

    // Initialize
    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        document.getElementById("prod-search")?.focus();
    }, []);

    useEffect(() => {
        GetProduct();
        GetLocation();
        GetCurrentStoreInventory();
    }, []);

    useEffect(() => {
        SearchProduct();
    }, [prodName]);

    // API Functions
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
            console.error("Error logging activity:", error);
        }
    };

    const GetProduct = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetProduct"
                }
            });
            setProductList(response.data);
        } catch (error) {
            console.error("Error fetching product list:", error);
        }
    };

    const SearchProduct = async () => {
        if (!prodName.trim()) {
            setSearchList([]);
            return;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';
        const searchD = { search: prodName };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(searchD),
                    operation: "SearchProduct"
                }
            });
            setSearchList(response.data || []);
        } catch (error) {
            console.error("Error fetching search list:", error);
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

    const GetCurrentStoreInventory = async () => {
        const locID = sessionStorage.getItem('location_id');
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'inventory.php';
        const locDetails = { locID, stockLevel: '', search: '' };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(locDetails),
                    operation: "GetInventory"
                }
            });
            setCurrentStoreInventory(response.data || []);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

    // Utility Functions
    const showAlert = (msg, variant, bg, duration = 3000) => {
        setMessage(msg);
        setAlertVariant(variant);
        setAlertBG(bg);
        setAlert1(true);
        setTimeout(() => setAlert1(false), duration);
    };

    const clearListAlert = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to clear the list?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, clear it!"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Cleared!",
                    text: "Your list has been cleared out.",
                    icon: "success"
                });
                setStockInList([]);
            }
        });
    };

    // Event Handlers
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            const product = productList.find(product =>
                product.product_name.toLowerCase() === prodName.toLowerCase() ||
                product.product_id == prodName
            );

            if (!product) {
                showAlertError({
                    icon: "error",
                    title: "Product Not Found!",
                    text: "Product is unavailable! Please select another.",
                    button: 'Try Again'
                });
                return;
            }

            addProductToList(product);
        }
    };

    const searchClick = (prodN) => {
        const product = productList.find(product =>
            product.product_name.toLowerCase() === prodN.toLowerCase() ||
            product.product_id == prodN
        );

        if (!product) {
            showAlertError({
                icon: "error",
                title: "Product Not Found!",
                text: "Product is unavailable! Please select another.",
                button: 'Try Again'
            });
            return;
        }

        addProductToList(product);
    };

    const addProductToList = (product) => {
        setStockInList(prev => {
            const existingIndex = prev.findIndex(item => item.product_id === product.product_id);
            if (existingIndex !== -1) {
                showAlertError({
                    icon: "warning",
                    title: "Product Already Added!",
                    text: "This product is already in your list. Adjust the quantity in the table.",
                    button: 'OK'
                });
                return prev;
            } else {
                AlertSucces(
                    `${product.product_name} added to list!`,
                    "success",
                    false,
                    'OK'
                );
                return [...prev, { ...product, qty: 1 }];
            }
        });

        setSearchList([]);
        setProdName('');
        document.getElementById("prod-search")?.focus();
    };

    const updateQuantity = (productId, newQty) => {
        const qty = parseInt(newQty);
        if (isNaN(qty) || qty < 1) {
            return;
        }

        setStockInList(prevList =>
            prevList.map(item =>
                item.product_id === productId
                    ? { ...item, qty: qty }
                    : item
            )
        );
    };

    const incrementQuantity = (productId) => {
        setStockInList(prevList =>
            prevList.map(item =>
                item.product_id === productId
                    ? { ...item, qty: item.qty + 1 }
                    : item
            )
        );
    };

    const decrementQuantity = (productId) => {
        setStockInList(prevList =>
            prevList.map(item =>
                item.product_id === productId
                    ? { ...item, qty: Math.max(1, item.qty - 1) }
                    : item
            )
        );
    };

    const removeItem = (productId, productName) => {
        Swal.fire({
            title: "Remove Item?",
            text: `Remove ${productName} from the list?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, remove it!"
        }).then((result) => {
            if (result.isConfirmed) {
                setStockInList(prevList =>
                    prevList.filter(item => item.product_id !== productId)
                );
                AlertSucces(
                    "Item removed from list!",
                    "success",
                    false,
                    'OK'
                );
            }
        });
    };

    const clearList = () => {
        setStockInList([]);
        showAlert('Your request list is now empty!', 'success', '#0ced93');
        setClearReq(true);
    };

    const StockIn = async () => {
        const oldProduct = [];
        const newProduct = [];
        const report = [];

        console.log('Stock In List:', stockInList);
        console.log('Current Inventory:', currentStoreInventory);

        stockInList.forEach((invProd) => {
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

        const locationID = parseInt(sessionStorage.getItem('location_id'));
        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'inventory.php';

        const ID = {
            accID: accountID,
            locID: locationID
        };

        console.log(ID);
        console.log('OLD:', oldProduct);
        console.log('NEW:', newProduct);
        console.log('Reports:', report);

        try {
            const response = await axios.get(url, {
                params: {
                    updatedInventory: JSON.stringify(oldProduct),
                    newInventory: JSON.stringify(newProduct),
                    reportInventory: JSON.stringify(report),
                    json: JSON.stringify(ID),
                    operation: "StockIn"
                }
            });

            if (response.data === 'Success') {
                AlertSucces(
                    "The stock is successfully added to your inventory!",
                    "success",
                    true,
                    'Ok'
                );
                setStockInList([]);
                Logs(accountID, 'Stock In A Product');
            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to save stock in!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error in stock in:", error);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalRequestPages) {
            setCurrentRequestPage(page);
        }
    };

    return (
        <>
            <style jsx>{`
                .search-container {
                    position: relative;
                    width: 100%;
                    margin-bottom: 20px;
                }

                .search-input-wrapper {
                    position: relative;
                    width: 100%;
                }

                .search-input {
                    width: 100%;
                    padding: 12px 16px;
                    font-size: 16px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    background-color: #fff;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
                }

                .dropdown-search-responsive {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    margin-top: 4px;
                    max-height: 300px;
                    overflow-y: auto;
                    z-index: 1000;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .dropdown-search-responsive ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .dropdown-search-responsive li {
                    padding: 12px 16px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    border-bottom: 1px solid #f0f0f0;
                    font-size: 14px;
                }

                .dropdown-search-responsive li:last-child {
                    border-bottom: none;
                }

                .dropdown-search-responsive li:hover {
                    background-color: #f8f9fa;
                }

                .responsive-table-container {
                    width: 100%;
                    overflow-x: auto;
                    overflow-y: hidden;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .responsive-table {
                    width: 100%;
                    min-width: 700px;
                    border-collapse: collapse;
                }

                .responsive-table thead {
                    background-color: #f8f9fa;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                .responsive-table th {
                    padding: 14px 12px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 13px;
                    color: #495057;
                    border-bottom: 2px solid #dee2e6;
                    white-space: nowrap;
                }

                .responsive-table td {
                    padding: 12px;
                    border-bottom: 1px solid #f0f0f0;
                    font-size: 14px;
                    color: #212529;
                }

                .responsive-table tbody tr {
                    transition: background-color 0.2s;
                }

                .responsive-table tbody tr:hover {
                    background-color: #f8f9fa;
                }

                .qty-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    justify-content: center;
                }

                .qty-btn {
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    font-weight: bold;
                    border: 1px solid #dee2e6;
                    background: white;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .qty-btn:hover {
                    background-color: #e9ecef;
                    border-color: #adb5bd;
                }

                .qty-btn:active {
                    transform: scale(0.95);
                }

                .qty-input {
                    width: 60px;
                    text-align: center;
                    padding: 6px;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    font-weight: 600;
                }

                .qty-input:focus {
                    outline: none;
                    border-color: #007bff;
                }

                .action-cell {
                    text-align: center;
                }

                .remove-btn {
                    padding: 6px 12px;
                    font-size: 13px;
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .remove-btn:hover {
                    background-color: #c82333;
                }

                .action-buttons-container {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 15px;
                    flex-wrap: wrap;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 300px;
                    text-align: center;
                    color: #6c757d;
                    padding: 40px 20px;
                }

                .empty-state-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                    opacity: 0.3;
                }

                .empty-state-title {
                    color: #495057;
                    margin-bottom: 10px;
                    font-weight: 500;
                    font-size: 18px;
                }

                .empty-state-text {
                    margin: 0;
                    font-size: 14px;
                    max-width: 300px;
                    line-height: 1.5;
                }

                @media (max-width: 992px) {
                    .responsive-table th,
                    .responsive-table td {
                        padding: 10px 8px;
                        font-size: 13px;
                    }

                    .action-buttons-container {
                        justify-content: center;
                    }

                    .qty-controls {
                        gap: 6px;
                    }

                    .qty-btn {
                        width: 28px;
                        height: 28px;
                        font-size: 16px;
                    }

                    .qty-input {
                        width: 50px;
                    }
                }

                @media (max-width: 768px) {
                    .search-input {
                        font-size: 16px;
                    }

                    .responsive-table {
                        min-width: 100%;
                    }

                    .responsive-table th,
                    .responsive-table td {
                        padding: 8px 6px;
                        font-size: 12px;
                    }

                    .qty-controls {
                        gap: 4px;
                        flex-wrap: nowrap;
                    }

                    .qty-btn {
                        width: 26px;
                        height: 26px;
                        font-size: 14px;
                    }

                    .qty-input {
                        width: 45px;
                        padding: 4px;
                        font-size: 12px;
                    }

                    .remove-btn {
                        padding: 4px 8px;
                        font-size: 11px;
                    }

                    .action-buttons-container {
                        width: 100%;
                    }

                    .action-buttons-container button {
                        flex: 1;
                        min-width: 120px;
                    }

                    .empty-state {
                        min-height: 250px;
                        padding: 30px 15px;
                    }

                    .empty-state-icon {
                        font-size: 36px;
                    }

                    .empty-state-title {
                        font-size: 16px;
                    }

                    .empty-state-text {
                        font-size: 13px;
                    }
                }

                @media (max-width: 576px) {
                    .responsive-table th,
                    .responsive-table td {
                        padding: 6px 4px;
                        font-size: 11px;
                    }

                    .dropdown-search-responsive li {
                        padding: 10px 12px;
                        font-size: 13px;
                    }

                    .qty-btn {
                        width: 24px;
                        height: 24px;
                        font-size: 12px;
                    }

                    .qty-input {
                        width: 40px;
                    }
                }
            `}</style>

            <Alert
                variant={alertVariant}
                className='alert-inventory'
                show={alert1}
                style={{ backgroundColor: alertBG }}
            >
                {message}
            </Alert>

            <Modal show={!clearReq} onHide={() => setClearReq(true)} size='md' className='searched-product-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Continue this action?</Modal.Title>
                </Modal.Header>
                <Modal.Body className='searched-product-body'>
                    Are you sure you want to clear your request list?
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => setClearReq(true)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={clearList}>
                        Continue
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={!continueSendReq} onHide={() => setContinueSendReq(true)} size='md' className='searched-product-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Continue stock in?</Modal.Title>
                </Modal.Header>
                <Modal.Body className='searched-product-body'>
                    Are you sure you want to add this list to your inventory?
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => setContinueSendReq(true)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => { StockIn(); setContinueSendReq(true); }}>
                        Continue
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='customer-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>STOCK IN</h1>
                </div>

                <Container fluid>
                    <Row>
                        <Col xs={12} lg={3} className="mb-3 mb-lg-0">
                            <div className='search-container'>
                                <label className='add-prod-label' style={{ marginBottom: '8px', display: 'block' }}>
                                    Search Product
                                </label>
                                <div className='search-input-wrapper'>
                                    <input
                                        className='search-input'
                                        onKeyDown={handleKeyDown}
                                        type='text'
                                        value={prodName}
                                        onChange={(e) => setProdName(e.target.value)}
                                        id='prod-search'
                                        placeholder="Search by name or ID..."
                                    />
                                    {prodName.trim() && (
                                        <div className='dropdown-search-responsive'>
                                            <ul>
                                                {searchList.map((p, i) => (
                                                    <li key={i} onClick={() => searchClick(p.product_name)}>
                                                        <strong>{p.product_name}</strong>
                                                        <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                                                            {p.description}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>

                        <Col xs={12} lg={9}>
                            <div className='responsive-table-container' style={{ height: '52vh', overflow: 'auto' }}>
                                {stockInList && stockInList.length > 0 ? (
                                    <table className='responsive-table'>
                                        <thead>
                                            <tr>
                                                <th>PRODUCT ID</th>
                                                <th>PRODUCT CODE</th>
                                                <th>DESCRIPTION</th>
                                                <th style={{ textAlign: 'center' }}>QTY</th>
                                                <th style={{ textAlign: 'center' }}>ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentRequestItems.map((p, i) => (
                                                <tr key={p.product_id || i}>
                                                    <td>{p.product_id}</td>
                                                    <td>{p.product_name}</td>
                                                    <td>{p.description}</td>
                                                    <td>
                                                        <div className='qty-controls'>
                                                            <button 
                                                                className='qty-btn'
                                                                onClick={() => decrementQuantity(p.product_id)}
                                                            >
                                                                −
                                                            </button>
                                                            <input
                                                                className='qty-input'
                                                                type='number'
                                                                min='1'
                                                                value={p.qty}
                                                                onChange={(e) => updateQuantity(p.product_id, e.target.value)}
                                                            />
                                                            <button 
                                                                className='qty-btn'
                                                                onClick={() => incrementQuantity(p.product_id)}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className='action-cell'>
                                                        <button 
                                                            className='remove-btn'
                                                            onClick={() => removeItem(p.product_id, p.product_name)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className='empty-state'>
                                        <div className='empty-state-icon'>📦</div>
                                        <h4 className='empty-state-title'>No items in stock in list</h4>
                                        <p className='empty-state-text'>
                                            Search for products and add them to your stock in list to get started.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'row',
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginTop: '20px',
                                gap: '15px'
                            }}>
                                <div>
                                    {totalRequestPages > 1 && stockInList && stockInList.length > 0 && (
                                        <CustomPagination
                                            currentPage={currentRequestPage}
                                            totalPages={totalRequestPages}
                                            onPageChange={handlePageChange}
                                            color="green"
                                        />
                                    )}
                                </div>

                                <div className='action-buttons-container'>
                                    <Button
                                        variant="danger"
                                        onClick={clearListAlert}
                                        disabled={!stockInList || stockInList.length === 0}
                                    >
                                        Clear List
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            if (stockInList.length > 0) {
                                                setContinueSendReq(false);
                                                GetCurrentStoreInventory();
                                            } else {
                                                showAlertError({
                                                    icon: "error",
                                                    title: "Something Went Wrong!",
                                                    text: 'Your list is currently empty!',
                                                    button: 'Okay'
                                                });
                                            }
                                        }}
                                        disabled={!stockInList || stockInList.length === 0}
                                    >
                                        Save Stock In
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
};

export default StockInWR;