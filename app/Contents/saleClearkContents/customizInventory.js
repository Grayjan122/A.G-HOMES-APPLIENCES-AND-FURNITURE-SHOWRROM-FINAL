'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import CustomPagination from '@/app/Components/Pagination/pagination';

const ITEMS_PER_PAGE = 10;
const REPORT_ITEMS_PER_PAGE = 10;

const CustomizeInventorySC = () => {
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [locationList, setLocationList] = useState([]);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPage1, setCurrentPage1] = useState(1);

    const [locID, setLocID] = useState(0);
    const [stockLevel, setStockLevel] = useState('');
    const [searchProd, setSearchProd] = useState('');

    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');

    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');
    const [inventReportVisible, setInventReportVisible] = useState(true);
    const [showDeliveredModal, setShowDeliveredModal] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState({
        name: '',
        description: '',
        type: '',
        baseProduct: '',
        modifications: ''
    });
    const [currentInventoryReport, setCurrentInventoryReport] = useState([]);
    const [deliveredProducts, setDeliveredProducts] = useState([]);
    const [currentPageDelivered, setCurrentPageDelivered] = useState(1);

    const [customizeInventoryList, setCustomizeInventoryList] = useState([]);
    const [customizeInventoryReport, setCustomizeInventoryReport] = useState([]);
    const [customizeProducts, setCustomizeProducts] = useState([]);
    const [semiCustomizeProductDetails, setSemiCustomizeProductDetails] = useState([]);
    const [fullCustomizeProductDetails, setFullCustomizeProductDetails] = useState([]);

    const [combinedInventory, setCombinedInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [combinedDeliveredInventory, setCombinedDeliveredInventory] = useState([]);

    const handleSort = (field) => {
        let direction = 'asc';
        if (sortField === field && sortDirection === 'asc') {
            direction = 'desc';
        }
        setSortField(field);
        setSortDirection(direction);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (customizeInventoryList.length > 0) {
            const available = [];
            const delivered = [];
            
            customizeInventoryList.forEach(inv => {
                const product = customizeProducts.find(p => p.cp_id === inv.cp_id);
                let productDetails = null;
                let productName = '';
                let description = '';
                let customizeType = product?.customize_type || 'Unknown';
                let baseProductName = '';
                let modifications = '';

                if (customizeType === 'Semi') {
                    productDetails = semiCustomizeProductDetails.find(p => p.cp_id === inv.cp_id);
                    productName = `CSTM-${inv.cp_id}`;
                    baseProductName = productDetails?.product_name || '';
                    description = productDetails?.description || 'No description';
                    modifications = productDetails?.modifications || '';
                } else if (customizeType === 'Full') {
                    productDetails = fullCustomizeProductDetails.find(p => p.cp_id === inv.cp_id);
                    productName = `CSTM-${inv.cp_id}`;
                    description = productDetails?.description || 'No description';
                    modifications = productDetails?.additional_description || '';
                }

                const combinedItem = {
                    ...inv,
                    customize_type: customizeType,
                    product_name: productName,
                    base_product_name: baseProductName,
                    description: description,
                    modifications: modifications,
                    price: product?.price || '0.00',
                    additional_description: productDetails?.additional_description || '',
                    orig_price: productDetails?.orig_price || product?.price || '0.00'
                };

                if (inv.status === 'Delivered' || inv.status === 'Sold' || inv.status === 'Transferred') {
                    delivered.push(combinedItem);
                } else {
                    available.push(combinedItem);
                }
            });
            
            setCombinedInventory(available);
            setCombinedDeliveredInventory(delivered);
        }
    }, [customizeInventoryList, customizeProducts, semiCustomizeProductDetails, fullCustomizeProductDetails]);

    useEffect(() => {
        let filtered = [...combinedInventory];

        if (locID > 0) {
            filtered = filtered.filter(item => item.locationd_id === parseInt(locID));
        }

        if (stockLevel) {
            if (stockLevel === 'High') {
                filtered = filtered.filter(item => item.status === 'Available' && parseInt(item.qty) > 0);
            } else if (stockLevel === 'Low') {
                filtered = filtered.filter(item => item.status !== 'Available' || parseInt(item.qty) === 0);
            }
        }

        if (searchProd) {
            const searchLower = searchProd.toLowerCase();
            filtered = filtered.filter(item =>
                item.product_name?.toLowerCase().includes(searchLower) ||
                item.description?.toLowerCase().includes(searchLower) ||
                item.customize_type?.toLowerCase().includes(searchLower) ||
                item.base_product_name?.toLowerCase().includes(searchLower) ||
                item.modifications?.toLowerCase().includes(searchLower)
            );
        }

        if (sortField) {
            filtered.sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];

                if (sortField === 'qty') {
                    aVal = parseInt(aVal) || 0;
                    bVal = parseInt(bVal) || 0;
                } else if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal?.toLowerCase() || '';
                }

                if (sortDirection === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }
        // const multipliedFiltered = [...Array(17)].flatMap(() => filtered);
        setFilteredInventory(filtered);
        setCurrentPage(1);
    }, [combinedInventory, locID, stockLevel, searchProd, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredInventory.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const totalPages1 = Math.ceil(currentInventoryReport.length / REPORT_ITEMS_PER_PAGE);
    const startIndex1 = (currentPage1 - 1) * REPORT_ITEMS_PER_PAGE;
    const currentItems1 = currentInventoryReport.slice(startIndex1, startIndex1 + REPORT_ITEMS_PER_PAGE);

    const totalPagesDelivered = Math.ceil(combinedDeliveredInventory.length / ITEMS_PER_PAGE);
    const startIndexDelivered = (currentPageDelivered - 1) * ITEMS_PER_PAGE;
    const currentItemsDelivered = combinedDeliveredInventory.slice(startIndexDelivered, startIndexDelivered + ITEMS_PER_PAGE);

    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));
    }, []);

    useEffect(() => {
        GetLocation();
        fetchCustomizeInventory();
        fetchCustomizeInventoryLedger();
        fetchCustomizeProduct();
        fetchCustomizeProductSemiDetails();
        fetchCustomizeProductFullDetails();
    }, []);

    const fetchCustomizeInventory = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';
        const locationID = sessionStorage.getItem('location_id');
        const ID = { locID: locationID };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetCustomizeInventory"
                }
            });
            setCustomizeInventoryList(response.data);
            console.log("Customize Inventory List fetched:", response.data);
        } catch (error) {
            console.error("Error fetching customize inventory list:", error);
        }
    };

    const fetchCustomizeInventoryLedger = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetCustomizeInventoryLedger"
                }
            });
            setCustomizeInventoryReport(response.data);
            console.log("Customize Inventory Report fetched:", response.data);
        } catch (error) {
            console.error("Error fetching customize inventory report:", error);
        }
    };

    const fetchCustomizeProduct = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetCustomizProduct"
                }
            });
            setCustomizeProducts(response.data);
            console.log("Customize Products fetched:", response.data);
        } catch (error) {
            console.error("Error fetching customize products:", error);
        }
    };

    const fetchCustomizeProductSemiDetails = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetSemiCustomizeProduct"
                }
            });
            setSemiCustomizeProductDetails(response.data);
            console.log("Semi Customize Product Details fetched:", response.data);
        } catch (error) {
            console.error("Error fetching semi customize product details:", error);
        }
    };

    const fetchCustomizeProductFullDetails = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customizeProducts.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetFullCustomizeProduct"
                }
            });
            setFullCustomizeProductDetails(response.data);
            console.log("Full Customize Product Details fetched:", response.data);
        } catch (error) {
            console.error("Error fetching full customize product details:", error);
        }
    };

    const Logs = async (accID, activity) => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            await axios.get(`${baseURL}audit-log.php`, {
                params: {
                    json: JSON.stringify({ accID, activity }),
                    operation: "Logs"
                }
            });
        } catch (error) {
            console.error("Error recording logs:", error);
        }
    };

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

    const GetInventoryReport = async (cp_id, csi_id, productName, productType, description, baseProduct, modifications) => {
        setSelectedProduct({
            name: productName,
            description: description,
            type: productType,
            baseProduct: baseProduct || '',
            modifications: modifications || ''
        });

        try {
            const accountID = sessionStorage.getItem('user_id');
            const locName = sessionStorage.getItem('location_name');

            const filtered = customizeInventoryReport.filter(
                report => report.cp_id === cp_id && report.csi_id === csi_id
            );

            setCurrentInventoryReport(filtered);
            setCurrentPage1(1);
            Logs(accountID, `Get the inventory reports of ${productName} (${productType}) in ${locName} store`);
        } catch (error) {
            console.error("Error fetching inventory report:", error);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handlePageChange1 = (page) => {
        if (page >= 1 && page <= totalPages1) {
            setCurrentPage1(page);
        }
    };

    const handlePageChangeDelivered = (page) => {
        if (page >= 1 && page <= totalPagesDelivered) {
            setCurrentPageDelivered(page);
        }
    };

    const clearAllFilters = () => {
        setLocID(0);
        setStockLevel('');
        setSearchProd('');
        setSortField('');
        setSortDirection('asc');
        setCurrentPage(1);
    };

    return (
        <>
            <Alert
                variant={alertVariant}
                className='alert-inventory'
                show={alert1}
                style={{ backgroundColor: alertBG }}
            >
                {message}
            </Alert>

            <Modal show={!inventReportVisible} onHide={() => { setInventReportVisible(true); }} size='xl' className='request-modal'>
                <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title style={{ fontWeight: '600' }}>Customize Product Inventory Report</Modal.Title>
                </Modal.Header>
                <Modal.Body  className='request-modal-body'>
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        marginBottom: '24px',
                        border: '1px solid #dee2e6'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '20px',
                            alignItems: 'start'
                        }}>
                            <div>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#6c757d',
                                    textTransform: 'uppercase',
                                    marginBottom: '6px'
                                }}>
                                    Product Code
                                </div>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#212529'
                                }}>
                                    {selectedProduct.name}
                                </div>
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#6c757d',
                                    textTransform: 'uppercase',
                                    marginBottom: '6px'
                                }}>
                                    Type
                                </div>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#212529'
                                }}>
                                    {selectedProduct.type}
                                </div>
                            </div>
                            {selectedProduct.baseProduct && (
                                <div>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#6c757d',
                                        textTransform: 'uppercase',
                                        marginBottom: '6px'
                                    }}>
                                        Base Product Reference
                                    </div>
                                    <div style={{
                                        fontSize: '16px',
                                        color: '#495057',
                                        fontWeight: '500'
                                    }}>
                                        {selectedProduct.baseProduct}
                                    </div>
                                </div>
                            )}
                            <div>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#6c757d',
                                    textTransform: 'uppercase',
                                    marginBottom: '6px'
                                }}>
                                    Description
                                </div>
                                <div style={{
                                    fontSize: '16px',
                                    color: '#495057'
                                }}>
                                    {selectedProduct.description}
                                </div>
                            </div>
                            {selectedProduct.modifications && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#6c757d',
                                        textTransform: 'uppercase',
                                        marginBottom: '6px'
                                    }}>
                                        Modifications / Additional Details
                                    </div>
                                    <div style={{
                                        fontSize: '15px',
                                        color: '#495057',
                                        padding: '10px',
                                        backgroundColor: '#ffffff',
                                        borderRadius: '4px',
                                        border: '1px solid #dee2e6'
                                    }}>
                                        {selectedProduct.modifications}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6',
                        overflow: 'hidden'
                    }}>
                        {currentItems1.length > 0 ? (
                            <div style={{ 
                                overflowX: 'auto',
                                height: '400px',
                                overflowY: 'auto'
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '13px', color: '#495057' }}>Type</th>
                                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '13px', color: '#495057' }}>Past Balance</th>
                                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '13px', color: '#495057' }}>Qty</th>
                                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '13px', color: '#495057' }}>Current Balance</th>
                                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '13px', color: '#495057' }}>Date</th>
                                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '13px', color: '#495057' }}>Time</th>
                                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '13px', color: '#495057' }}>Store</th>
                                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '13px', color: '#495057' }}>Done By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems1.map((item, index) => {
                                            const isNegativeType = ['Sales', 'Transfer Stock', 'Stock Out'].includes(item.type);
                                            // Display neutral quantity without signs
                                            const displayQty = Math.abs(parseInt(item.qty) || 0);
                                            return (
                                                <tr
                                                    key={index}
                                                    style={{
                                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                                        borderBottom: '1px solid #dee2e6'
                                                    }}
                                                >
                                                    <td style={{ padding: '12px', fontSize: '14px' }}>
                                                        <span style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            backgroundColor: isNegativeType ? '#f8d7da' : '#d4edda',
                                                            color: isNegativeType ? '#721c24' : '#155724'
                                                        }}>
                                                            {item.type}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600' }}>{item.past_balance}</td>
                                                    <td style={{
                                                        padding: '12px',
                                                        fontSize: '14px',
                                                        fontWeight: '700',
                                                        color: '#212529'
                                                    }}>
                                                        {displayQty}
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600' }}>{item.current_balance}</td>
                                                    <td style={{ padding: '12px', fontSize: '14px', color: '#6c757d' }}>{item.date}</td>
                                                    <td style={{ padding: '12px', fontSize: '14px', color: '#6c757d' }}>{item.time}</td>
                                                    <td style={{ padding: '12px', fontSize: '14px', color: '#495057' }}>{item.location_name}</td>
                                                    <td style={{ padding: '12px', fontSize: '14px', color: '#495057' }}>
                                                        {`${item.fname} ${item.mname} ${item.lname}`.trim()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: '#6c757d'
                            }}>
                                <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#495057' }}>
                                    No Reports Found
                                </h3>
                                <p>No inventory records available for this product.</p>
                            </div>
                        )}
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '24px',
                        height: '60px',
                        alignItems: 'center'
                    }}>
                        {totalPages1 > 1 && (
                            <CustomPagination
                                currentPage={currentPage1}
                                totalPages={totalPages1}
                                onPageChange={handlePageChange1}
                                color="green"
                            />
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer style={{
                    backgroundColor: '#f8f9fa',
                    border: 'none',
                    padding: '20px 30px'
                }}>
                    <Button
                        variant="secondary"
                        onClick={() => { setInventReportVisible(true); }}
                        style={{
                            padding: '10px 24px',
                            fontWeight: '600',
                            borderRadius: '8px'
                        }}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeliveredModal} onHide={() => { setShowDeliveredModal(false); setCurrentPageDelivered(1); }} size='xl' className='request-modal'>
                <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title style={{ fontWeight: '600' }}>Delivered / Sold Products History</Modal.Title>
                </Modal.Header>
                <Modal.Body  className='request-modal-body'>
                    <div style={{
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffc107',
                        borderRadius: '4px',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span style={{ fontSize: '20px' }}>ℹ️</span>
                        <div style={{ fontSize: '14px', color: '#856404' }}>
                            <strong>Note:</strong> These products have been delivered to the customers and are no longer available in the current inventory.
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                        overflow: 'hidden'
                    }}>
                        {currentItemsDelivered.length > 0 ? (
                            <div style={{ 
                                overflowX: 'auto',
                                height: '400px',
                                overflowY: 'auto'
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>
                                                Product Code
                                            </th>
                                            <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>
                                                Type
                                            </th>
                                            <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>
                                                Base Product / Reference
                                            </th>
                                            <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>
                                                Description
                                            </th>
                                            <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>
                                                Modifications
                                            </th>
                                            <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>
                                                Status
                                            </th>
                                            <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>
                                                Store
                                            </th>
                                            <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItemsDelivered.map((item, index) => {
                                            return (
                                                <tr
                                                    key={index}
                                                    style={{
                                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                                        borderBottom: '1px solid #dee2e6'
                                                    }}
                                                >
                                                    <td style={{ padding: '14px', fontSize: '14px', color: '#495057' }}>
                                                        {item.description}
                                                    </td>
                                                    <td style={{ padding: '14px', fontSize: '13px', color: '#6c757d', maxWidth: '200px' }}>
                                                        <div style={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }} title={item.modifications}>
                                                            {item.modifications || 'None'}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '14px' }}>
                                                        <span style={{
                                                            padding: '4px 10px',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            backgroundColor: '#e9ecef',
                                                            color: '#495057'
                                                        }}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '14px', fontSize: '14px', color: '#495057' }}>
                                                        {item.location_name}
                                                    </td>
                                                    <td style={{ padding: '14px' }}>
                                                        <button
                                                            onClick={() => {
                                                                setShowDeliveredModal(false);
                                                                setInventReportVisible(false);
                                                                GetInventoryReport(
                                                                    item.cp_id,
                                                                    item.csi_id,
                                                                    item.product_name,
                                                                    item.customize_type,
                                                                    item.description,
                                                                    item.base_product_name,
                                                                    item.modifications
                                                                );
                                                            }}
                                                            style={{
                                                                padding: '6px 14px',
                                                                backgroundColor: 'white',
                                                                color: '#0d6efd',
                                                                border: '1px solid #0d6efd',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '13px',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            View History
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: '#6c757d'
                            }}>
                                <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#495057' }}>
                                    No Delivered Products Found
                                </h3>
                                <p>There are no delivered, sold, or transferred products in the history.</p>
                            </div>
                        )}
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '24px',
                        height: '60px',
                        alignItems: 'center'
                    }}>
                        {totalPagesDelivered > 1 && (
                            <CustomPagination
                                currentPage={currentPageDelivered}
                                totalPages={totalPagesDelivered}
                                onPageChange={handlePageChangeDelivered}
                                color="green"
                            />
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer style={{
                    backgroundColor: '#f8f9fa',
                    border: 'none',
                    padding: '20px 30px'
                }}>
                    <Button
                        variant="secondary"
                        onClick={() => { setShowDeliveredModal(false); setCurrentPageDelivered(1); }}
                        style={{
                            padding: '10px 24px',
                            fontWeight: '600',
                            borderRadius: '8px'
                        }}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='customer-main'>
                <div className='customer-header' style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className='h-customer' style={{
                        color: 'black',
                        fontSize: '32px',
                        fontWeight: '700',
                        margin: 0
                    }}>
                        CUSTOMIZE INVENTORY MANAGEMENT
                    </h1>
                    <button
                        onClick={() => setShowDeliveredModal(true)}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#5a6268';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#6c757d';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>📦</span>
                        View Delivered Products ({combinedDeliveredInventory.length})
                    </button>
                </div>

                <div style={{
                    padding: '24px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    margin: '20px 0',
                    border: '1px solid #dee2e6'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '20px',
                        alignItems: 'end'
                    }}>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: '#495057'
                            }}>
                                Filter by Store
                            </label>
                            <select
                                value={locID}
                                onChange={(e) => setLocID(parseInt(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    backgroundColor: '#ffffff'
                                }}
                            >
                                <option value={0}>All Stores</option>
                                {locationList.map((r) => (
                                    <option key={r.location_id} value={r.location_id}>
                                        {r.location_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: '#495057'
                            }}>
                                Filter by Status
                            </label>
                            <select
                                value={stockLevel}
                                onChange={(e) => setStockLevel(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    backgroundColor: '#ffffff'
                                }}
                            >
                                <option value={''}>All Status</option>
                                <option value={'High'}>Available</option>
                                <option value={'Low'}>Not Available</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '600', 
                                fontSize: '14px',
                                color: '#495057'
                            }}>
                                Search Products
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
                                    placeholder="Search by product code or description..."
                                    value={searchProd}
                                    onChange={(e) => setSearchProd(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px 10px 35px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff'
                                    }}
                                />

                                {searchProd && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchProd('')}
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

                <div style={{
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    margin: '10px 0',
                    fontSize: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <strong>Active Filters:</strong>

                        {locID > 0 && (
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
                                Store: {locationList.find(loc => loc.location_id === parseInt(locID))?.location_name || ''}
                                <button
                                    type="button"
                                    onClick={() => setLocID(0)}
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
                                    title="Remove location filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {stockLevel && (
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
                                Status: {stockLevel === 'High' ? 'Available' : 'Not Available'}
                                <button
                                    type="button"
                                    onClick={() => setStockLevel('')}
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
                                    title="Remove status filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {searchProd && (
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
                                Search: "{searchProd}"
                                <button
                                    type="button"
                                    onClick={() => setSearchProd('')}
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
                                    title="Remove search filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                            ({filteredInventory.length} of {combinedInventory.length} records shown)
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
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>

                <div style={{
                    padding: '12px 0',
                    fontSize: '14px',
                    color: '#6c757d',
                    fontWeight: '500'
                }}>
                    Showing {currentItems.length} of {filteredInventory.length} items
                </div>

                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6',
                    overflow: 'hidden',
                    marginBottom: '20px'
                }}>
                    <div style={{ 
                        overflowX: 'auto',
                        height: '600px',
                        overflowY: 'auto'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th
                                        onClick={() => handleSort('product_name')}
                                        style={{
                                            padding: '14px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #dee2e6',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            color: '#495057',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                    >
                                        Product Code {sortField === 'product_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('customize_type')}
                                        style={{
                                            padding: '14px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #dee2e6',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            color: '#495057',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                    >
                                        Type {sortField === 'customize_type' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('base_product_name')}
                                        style={{
                                            padding: '14px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #dee2e6',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            color: '#495057',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                    >
                                        Base Product {sortField === 'base_product_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('description')}
                                        style={{
                                            padding: '14px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #dee2e6',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            color: '#495057',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                    >
                                        Description {sortField === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>
                                        Modifications
                                    </th>
                                    <th
                                        onClick={() => handleSort('qty')}
                                        style={{
                                            padding: '14px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #dee2e6',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            color: '#495057',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                    >
                                        Qty {sortField === 'qty' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('status')}
                                        style={{
                                            padding: '14px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #dee2e6',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            color: '#495057',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                    >
                                        Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('location_name')}
                                        style={{
                                            padding: '14px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #dee2e6',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            color: '#495057',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                    >
                                        Store {sortField === 'location_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((item, index) => {
                                        const qty = parseInt(item.qty) || 0;
                                        const isAvailable = item.status === 'Available' && qty > 0;
                                        return (
                                            <tr
                                                key={index}
                                                style={{
                                                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                                    borderBottom: '1px solid #dee2e6'
                                                }}
                                            >
                                                <td style={{ padding: '14px', fontSize: '14px', fontWeight: '500', color: '#212529' }}>
                                                    {item.product_name}
                                                </td>
                                                <td style={{ padding: '14px' }}>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        backgroundColor: item.customize_type === 'Semi' ? '#cfe2ff' : '#f8d7da',
                                                        color: item.customize_type === 'Semi' ? '#084298' : '#721c24'
                                                    }}>
                                                        {item.customize_type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px', fontSize: '14px', color: '#495057', fontWeight: '500' }}>
                                                    {item.base_product_name || 'N/A'}
                                                </td>
                                                <td style={{ padding: '14px', fontSize: '14px', color: '#495057' }}>
                                                    {item.description}
                                                </td>
                                                <td style={{ padding: '14px', fontSize: '13px', color: '#6c757d', maxWidth: '200px' }}>
                                                    <div style={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }} title={item.modifications}>
                                                        {item.modifications || 'None'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px', fontSize: '14px', fontWeight: '600', color: '#212529' }}>
                                                    {qty}
                                                </td>
                                                <td style={{ padding: '14px' }}>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        backgroundColor: isAvailable ? '#d1e7dd' : '#f8d7da',
                                                        color: isAvailable ? '#0f5132' : '#721c24'
                                                    }}>
                                                        {isAvailable ? 'Available' : 'Not Available'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px', fontSize: '14px', color: '#495057' }}>
                                                    {item.location_name}
                                                </td>
                                                <td style={{ padding: '14px' }}>
                                                    <button
                                                        onClick={() => {
                                                            setInventReportVisible(false);
                                                            GetInventoryReport(
                                                                item.cp_id,
                                                                item.csi_id,
                                                                item.product_name,
                                                                item.customize_type,
                                                                item.description,
                                                                item.base_product_name,
                                                                item.modifications
                                                            );
                                                        }}
                                                        style={{
                                                            padding: '6px 14px',
                                                            backgroundColor: 'white',
                                                            color: '#0d6efd',
                                                            border: '1px solid #0d6efd',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '13px',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        View Report
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" style={{ padding: '60px 20px', textAlign: 'center', color: '#6c757d' }}>
                                            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#495057' }}>
                                                No Customize Inventory Items Found
                                            </h3>
                                            <p>
                                                {filteredInventory.length === 0 && combinedInventory.length > 0 ?
                                                    "No items match your current filter criteria." :
                                                    "There are no customize inventory items in the system."
                                                }
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '30px',
                    height: '60px'
                }}>
                    {totalPages > 1 && (
                        <CustomPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            color="green"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default CustomizeInventorySC;