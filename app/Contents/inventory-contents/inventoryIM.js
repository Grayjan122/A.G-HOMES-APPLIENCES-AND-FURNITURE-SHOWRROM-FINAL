'use client';
import { useState, useEffect } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import { AlertSucces } from '@/app/Components/SweetAlert/success';

const ITEMS_PER_PAGE = 10;
const REPORT_ITEMS_PER_PAGE = 10;

const InventoryIM = () => {
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [inventoryList, setInventoryList] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const [inventReport, setInventReport] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [currentPage1, setCurrentPage1] = useState(1);

    const [pName, setPname] = useState('');
    const [pDes, setDes] = useState('');

    const [locID, setLocID] = useState(0);
    const [stockLevel, setStockLevel] = useState('');
    const [searchProd, setSearchProd] = useState('');

    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [sortedInventoryList, setSortedInventoryList] = useState([]);

    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');
    const [inventReportVisible, setInventReportVisible] = useState(true);

    // Adjust Stock Modal States
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [adjustmentType, setAdjustmentType] = useState('add'); // 'add' or 'subtract'
    const [adjustmentQty, setAdjustmentQty] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('');

    // Min/Max Threshold Modal States
    const [showThresholdModal, setShowThresholdModal] = useState(false);
    const [selectedItemForThreshold, setSelectedItemForThreshold] = useState(null);
    const [minThreshold, setMinThreshold] = useState(1); // Default min: 1
    const [maxThreshold, setMaxThreshold] = useState(2); // Default max: 2

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
        // Start with all inventory items
        let filtered = [...inventoryList];

        // Filter by location
        if (locID > 0) {
            filtered = filtered.filter(item => {
                return parseInt(item.location_id) === parseInt(locID);
            });
        }

        // Filter by stock level
        if (stockLevel) {
            filtered = filtered.filter(item => {
                const qty = parseInt(item.qty) || 0;
                if (stockLevel === 'high') {
                    return qty >= 3;
                } else if (stockLevel === 'low') {
                    return qty === 2;
                } else if (stockLevel === 'critical') {
                    return qty === 1;
                } else if (stockLevel === 'out') {
                    return qty === 0;
                }
                return true;
            });
        }

        // Filter by search
        if (searchProd) {
            const searchLower = searchProd.toLowerCase();
            filtered = filtered.filter(item => {
                const productName = (item.product_name || '').toLowerCase();
                const description = (item.description || '').toLowerCase();
                return productName.includes(searchLower) || description.includes(searchLower);
            });
        }

        // Finally, sort
        if (sortField && filtered.length > 0) {
            const sorted = filtered.sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];

                if (sortField === 'qty') {
                    aVal = parseInt(aVal) || 0;
                    bVal = parseInt(bVal) || 0;
                } else if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }

                if (sortDirection === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
            setSortedInventoryList(sorted);
        } else {
            setSortedInventoryList(filtered);
        }
    }, [inventoryList, sortField, sortDirection, stockLevel, searchProd, locID]);

    const totalPages = Math.ceil(sortedInventoryList.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = sortedInventoryList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const totalPages1 = Math.ceil(inventReport.length / REPORT_ITEMS_PER_PAGE);
    const startIndex1 = (currentPage1 - 1) * REPORT_ITEMS_PER_PAGE;
    const currentItems1 = inventReport.slice(startIndex1, startIndex1 + REPORT_ITEMS_PER_PAGE);

    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));
    }, []);

    useEffect(() => {
        GetInventory();
        setCurrentPage(1);
    }, [locID, stockLevel, searchProd]);

    useEffect(() => {
        GetLocation();
        GetInventory();
    }, []);

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

    const GetInventoryReport = async (prodID1, locID, prodName, pD) => {
        setPname(prodName);
        setDes(pD);
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const accountID = sessionStorage.getItem('user_id');
            const locName = sessionStorage.getItem('location_name');
            const productID = prodID1;
            const locationID = locID;

            const response = await axios.get(`${baseURL}inventory.php`, {
                params: {
                    json: JSON.stringify({ locID: locationID, prodID: productID }),
                    operation: "GetInventoryReport"
                }
            });

            setInventReport(response.data);
            Logs(accountID, 'Get the inventory reports of ' + prodName + ' in ' + locName + ' store');
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

    const GetInventory = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const response = await axios.get(`${baseURL}inventory.php`, {
                params: {
                    json: JSON.stringify({ locID, stockLevel, search: searchProd }),
                    operation: "GetInventory"
                }
            });
            
            // Ensure each item has min/max thresholds with defaults
            const inventoryWithThresholds = (response.data || []).map(item => ({
                ...item,
                min_threshold: item.min_threshold !== null && item.min_threshold !== undefined ? parseInt(item.min_threshold) : 1,
                max_threshold: item.max_threshold !== null && item.max_threshold !== undefined ? parseInt(item.max_threshold) : 2
            }));
            
            setInventoryList(inventoryWithThresholds);
        } catch (error) {
            console.error("Error fetching inventory:", error);
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

    const clearAllFilters = () => {
        setLocID(0);
        setStockLevel('');
        setSearchProd('');
        setSortField('');
        setSortDirection('asc');
        setCurrentPage(1);
    };

    const openAdjustModal = (item) => {
        setSelectedProduct(item);
        setAdjustmentType('add');
        setAdjustmentQty('');
        setAdjustmentReason('');
        setShowAdjustModal(true);
    };

    const closeAdjustModal = () => {
        setShowAdjustModal(false);
        setSelectedProduct(null);
        setAdjustmentType('add');
        setAdjustmentQty('');
        setAdjustmentReason('');
    };

    const handleAdjustStock = async () => {
        if (!adjustmentQty || parseInt(adjustmentQty) <= 0) {
            setMessage('Please enter a valid quantity');
            setAlertVariant('danger');
            setAlertBG('#f8d7da');
            setAlert1(true);
            setTimeout(() => setAlert1(false), 3000);
            return;
        }

        // Validate that removing stock won't result in negative quantity
        if (adjustmentType === 'subtract') {
            const currentQty = parseInt(selectedProduct.qty) || 0;
            const subtractQty = parseInt(adjustmentQty);
            const newQty = currentQty - subtractQty;

            if (newQty < 0) {

                showAlertError({
                    icon: "warning",
                    title: "Insufficient Stock!",
                    text: "Cannot remove " + subtractQty + " units. Current stock is only " + currentQty + " units. Stock cannot go below zero.",
                    button: 'OK'
                });
                return;
            }
        }

        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const accountID = sessionStorage.getItem('user_id');
            const locName = sessionStorage.getItem('location_name');

            const adjustmentData = {
                product_id: selectedProduct.product_id,
                location_id: selectedProduct.location_id,
                adjustment_type: adjustmentType,
                quantity: parseInt(adjustmentQty),
                reason: adjustmentReason,
                user_id: accountID
            };

            const response = await axios.get(`${baseURL}inventory.php`, {
                params: {
                    json: JSON.stringify(adjustmentData),
                    operation: "AdjustStock"
                }
            });

            if (response.data.success) {
               
                AlertSucces('Stock adjusted successfully!', 'success', true, 'OK');


                // Log the activity
                const activityText = `${adjustmentType === 'add' ? 'Added' : 'Subtracted'} ${adjustmentQty} units ${adjustmentType === 'add' ? 'to' : 'from'} ${selectedProduct.product_name} - Reason: ${adjustmentReason}`;
                Logs(accountID, activityText);

                // Refresh inventory
                GetInventory();
                closeAdjustModal();
            } else {

                showAlertError({
                    icon: "warning",
                    title: "Failed to adjust stock!",
                    text: response.data.message || 'Failed to adjust stock',
                    button: 'OK'
                });
            }
        } catch (error) {

            showAlertError({
                icon: "warning",
                title: "Error adjusting stock!",
                text: error.message || 'Failed to adjust stock',
                button: 'OK'
            });
        }
    };

    // Min/Max Threshold Functions
    const openThresholdModal = (item) => {
        setSelectedItemForThreshold(item);
        setMinThreshold(item.min_threshold !== null && item.min_threshold !== undefined ? parseInt(item.min_threshold) : 1);
        setMaxThreshold(item.max_threshold !== null && item.max_threshold !== undefined ? parseInt(item.max_threshold) : 2);
        setShowThresholdModal(true);
    };

    const closeThresholdModal = () => {
        setShowThresholdModal(false);
        setSelectedItemForThreshold(null);
        setMinThreshold(1);
        setMaxThreshold(2);
    };

    const handleSaveThresholds = async () => {
        if (!selectedItemForThreshold) return;

        // Validate min and max
        const min = parseInt(minThreshold);
        const max = parseInt(maxThreshold);

        if (isNaN(min) || min < 0) {
            showAlertError({
                icon: "warning",
                title: "Invalid Minimum Threshold!",
                text: "Minimum threshold must be a number greater than or equal to 0.",
                button: 'OK'
            });
            return;
        }

        if (isNaN(max) || max < 0) {
            showAlertError({
                icon: "warning",
                title: "Invalid Maximum Threshold!",
                text: "Maximum threshold must be a number greater than or equal to 0.",
                button: 'OK'
            });
            return;
        }

        if (min > max) {
            showAlertError({
                icon: "warning",
                title: "Invalid Threshold Values!",
                text: "Minimum threshold cannot be greater than maximum threshold.",
                button: 'OK'
            });
            return;
        }

        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const accountID = sessionStorage.getItem('user_id');

            const thresholdData = {
                product_id: selectedItemForThreshold.product_id,
                location_id: selectedItemForThreshold.location_id,
                min_threshold: min,
                max_threshold: max,
                user_id: accountID
            };

            const response = await axios.get(`${baseURL}inventory.php`, {
                params: {
                    json: JSON.stringify(thresholdData),
                    operation: "UpdateThresholds"
                }
            });

            if (response.data.success) {
                AlertSucces('Thresholds updated successfully!', 'success', true, 'OK');

                // Log the activity
                const activityText = `Updated thresholds for ${selectedItemForThreshold.product_name} in ${selectedItemForThreshold.location_name}: Min=${min}, Max=${max}`;
                Logs(accountID, activityText);

                // Refresh inventory
                GetInventory();
                closeThresholdModal();
            } else {
                showAlertError({
                    icon: "warning",
                    title: "Failed to update thresholds!",
                    text: response.data.message || 'Failed to update thresholds',
                    button: 'OK'
                });
            }
        } catch (error) {
            showAlertError({
                icon: "warning",
                title: "Error updating thresholds!",
                text: error.message || 'Failed to update thresholds',
                button: 'OK'
            });
        }
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
                    <Modal.Title style={{ fontWeight: '600' }}>Product Inventory Report</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{
                    padding: '30px',
                    height: '70vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Scrollable Content Area */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        paddingRight: '10px',
                        marginRight: '-10px'
                    }}>
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
                                alignItems: 'center'
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
                                        {pName}
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
                                        Description
                                    </div>
                                    <div style={{
                                        fontSize: '16px',
                                        color: '#495057'
                                    }}>
                                        {pDes}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '4px',
                            border: '1px solid #dee2e6',
                            overflow: 'hidden'
                        }}>
                            {currentItems1.length > 0 ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '13px', color: '#495057' }}>Type</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '13px', color: '#495057' }}>Past Balance</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '13px', color: '#495057' }}>Qty</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '13px', color: '#495057' }}>Current Balance</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '13px', color: '#495057' }}>Date</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '13px', color: '#495057' }}>Time</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '13px', color: '#495057' }}>Done By</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems1.map((item, index) => {
                                                // Define types that reduce stock (subtract from inventory)
                                                const negativeTypes = ['Installment Sales', 'Sales', 'Transfer Stock', 'Stock Adjustment (Subtract)'];
                                                const isNegativeType = negativeTypes.includes(item.type);

                                                // Determine if this is a positive change (adds to stock)
                                                // Stock Adjustment (Add) explicitly adds to stock
                                                // Other types not in negativeTypes are also positive (like Purchase, etc.)
                                                const isPositiveChange = item.type === 'Stock Adjustment (Add)' ||
                                                    (!negativeTypes.includes(item.type));

                                                // Display just the quantity number without + or - signs
                                                const displayQty = parseInt(item.qty) || 0;

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
                                                            color: isPositiveChange ? '#198754' : '#dc3545'
                                                        }}>
                                                            {displayQty}
                                                        </td>
                                                        <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600' }}>{item.current_balance}</td>
                                                        <td style={{ padding: '12px', fontSize: '14px', color: '#6c757d' }}>{formatDate(item.date)}</td>
                                                        <td style={{ padding: '12px', fontSize: '14px', color: '#6c757d' }}>{formatTime(item.time)}</td>
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
                    </div>

                    {/* Fixed Pagination at Bottom */}
                    {totalPages1 > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            paddingTop: '20px',
                            paddingBottom: '10px',
                            borderTop: '1px solid #dee2e6',
                            backgroundColor: '#ffffff',
                            marginTop: '20px',
                            flexShrink: 0
                        }}>
                            <CustomPagination
                                currentPage={currentPage1}
                                totalPages={totalPages1}
                                onPageChange={handlePageChange1}
                                color="green"
                            />
                        </div>
                    )}
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

            {/* Min/Max Threshold Modal */}
            <Modal show={showThresholdModal} onHide={closeThresholdModal} centered>
                <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <Modal.Title style={{ fontWeight: '700', fontSize: '20px', color: '#212529' }}>
                        Set Inventory Thresholds
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '30px' }}>
                    {selectedItemForThreshold && (
                        <>
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                marginBottom: '24px',
                                border: '1px solid #dee2e6'
                            }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <strong style={{ color: '#495057', fontSize: '13px' }}>Product:</strong>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#212529', marginTop: '4px' }}>
                                        {selectedItemForThreshold.product_name}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <strong style={{ color: '#495057', fontSize: '13px' }}>Description:</strong>
                                    <div style={{ fontSize: '14px', color: '#495057', marginTop: '4px' }}>
                                        {selectedItemForThreshold.description}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <strong style={{ color: '#495057', fontSize: '13px' }}>Store:</strong>
                                    <div style={{ fontSize: '14px', color: '#495057', marginTop: '4px' }}>
                                        {selectedItemForThreshold.location_name}
                                    </div>
                                </div>
                                <div>
                                    <strong style={{ color: '#495057', fontSize: '13px' }}>Current Stock:</strong>
                                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#0d6efd', marginTop: '4px' }}>
                                        {selectedItemForThreshold.qty} units
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                padding: '16px',
                                backgroundColor: '#e7f3ff',
                                borderRadius: '8px',
                                marginBottom: '24px',
                                border: '1px solid #b3d9ff'
                            }}>
                                <div style={{ fontSize: '13px', color: '#004085', lineHeight: '1.6' }}>
                                    <strong>How thresholds work:</strong>
                                    <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                        <li><strong>Minimum Threshold:</strong> When stock falls below this level, it's marked as "Below Minimum"</li>
                                        <li><strong>Maximum Threshold:</strong> When stock is at or below this level, it's marked as "Low Stock" and needs restocking</li>
                                        <li>Stock above the maximum threshold is considered "In Stock"</li>
                                    </ul>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: '#495057'
                                }}>
                                    Minimum Threshold <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={minThreshold}
                                    onChange={(e) => setMinThreshold(e.target.value)}
                                    placeholder="Enter minimum threshold"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                                <div style={{ marginTop: '6px', fontSize: '12px', color: '#6c757d' }}>
                                    Stock below this level will be marked as "Below Minimum"
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: '#495057'
                                }}>
                                    Maximum Threshold <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={maxThreshold}
                                    onChange={(e) => setMaxThreshold(e.target.value)}
                                    placeholder="Enter maximum threshold"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                                <div style={{ marginTop: '6px', fontSize: '12px', color: '#6c757d' }}>
                                    Stock at or below this level will be marked as "Low Stock" and needs restocking
                                </div>
                            </div>

                            {minThreshold && maxThreshold && parseInt(minThreshold) > parseInt(maxThreshold) && (
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#f8d7da',
                                    borderRadius: '8px',
                                    border: '1px solid #f5c2c7',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ color: '#721c24', fontSize: '13px', fontWeight: '600' }}>
                                        ⚠️ Warning: Minimum threshold cannot be greater than maximum threshold
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer style={{
                    backgroundColor: '#f8f9fa',
                    border: 'none',
                    padding: '20px 30px',
                    gap: '10px'
                }}>
                    <Button
                        variant="secondary"
                        onClick={closeThresholdModal}
                        style={{
                            padding: '10px 24px',
                            fontWeight: '600',
                            borderRadius: '8px'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="warning"
                        onClick={handleSaveThresholds}
                        style={{
                            padding: '10px 24px',
                            fontWeight: '600',
                            borderRadius: '8px'
                        }}
                    >
                        Save Thresholds
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Adjust Stock Modal */}
            <Modal show={showAdjustModal} onHide={closeAdjustModal} centered>
                <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <Modal.Title style={{ fontWeight: '700', fontSize: '20px', color: '#212529' }}>
                        Adjust Stock
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '30px' }}>
                    {selectedProduct && (
                        <>
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                marginBottom: '24px',
                                border: '1px solid #dee2e6'
                            }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <strong style={{ color: '#495057', fontSize: '13px' }}>Product:</strong>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#212529', marginTop: '4px' }}>
                                        {selectedProduct.product_name}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <strong style={{ color: '#495057', fontSize: '13px' }}>Description:</strong>
                                    <div style={{ fontSize: '14px', color: '#495057', marginTop: '4px' }}>
                                        {selectedProduct.description}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <strong style={{ color: '#495057', fontSize: '13px' }}>Store:</strong>
                                    <div style={{ fontSize: '14px', color: '#495057', marginTop: '4px' }}>
                                        {selectedProduct.location_name}
                                    </div>
                                </div>
                                <div>
                                    <strong style={{ color: '#495057', fontSize: '13px' }}>Current Stock:</strong>
                                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#0d6efd', marginTop: '4px' }}>
                                        {selectedProduct.qty} units
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: '#495057'
                                }}>
                                    Adjustment Type <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <label style={{
                                        flex: 1,
                                        padding: '12px',
                                        border: `2px solid ${adjustmentType === 'add' ? '#198754' : '#dee2e6'}`,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        backgroundColor: adjustmentType === 'add' ? '#d1e7dd' : 'white',
                                        transition: 'all 0.2s',
                                        textAlign: 'center',
                                        fontWeight: '600'
                                    }}>
                                        <input
                                            type="radio"
                                            name="adjustmentType"
                                            value="add"
                                            checked={adjustmentType === 'add'}
                                            onChange={(e) => setAdjustmentType(e.target.value)}
                                            style={{ marginRight: '8px' }}
                                        />
                                        <span style={{ color: adjustmentType === 'add' ? '#0f5132' : '#495057' }}>
                                            Add Stock
                                        </span>
                                    </label>
                                    <label style={{
                                        flex: 1,
                                        padding: '12px',
                                        border: `2px solid ${adjustmentType === 'subtract' ? '#dc3545' : '#dee2e6'}`,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        backgroundColor: adjustmentType === 'subtract' ? '#f8d7da' : 'white',
                                        transition: 'all 0.2s',
                                        textAlign: 'center',
                                        fontWeight: '600'
                                    }}>
                                        <input
                                            type="radio"
                                            name="adjustmentType"
                                            value="subtract"
                                            checked={adjustmentType === 'subtract'}
                                            onChange={(e) => setAdjustmentType(e.target.value)}
                                            style={{ marginRight: '8px' }}
                                        />
                                        <span style={{ color: adjustmentType === 'subtract' ? '#721c24' : '#495057' }}>
                                            Remove Stock
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: '#495057'
                                }}>
                                    Quantity <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={adjustmentQty}
                                    onChange={(e) => setAdjustmentQty(e.target.value)}
                                    placeholder="Enter quantity to adjust"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                                {adjustmentQty && (
                                    <div style={{
                                        marginTop: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600'
                                    }}>
                                        {(() => {
                                            const currentQty = parseInt(selectedProduct.qty) || 0;
                                            const adjustQty = parseInt(adjustmentQty) || 0;
                                            const newQty = adjustmentType === 'add'
                                                ? currentQty + adjustQty
                                                : currentQty - adjustQty;

                                            if (adjustmentType === 'subtract' && newQty < 0) {
                                                return (
                                                    <div style={{
                                                        color: '#dc3545',
                                                        backgroundColor: '#f8d7da',
                                                        padding: '8px',
                                                        borderRadius: '4px',
                                                        border: '1px solid #f5c2c7'
                                                    }}>
                                                        ⚠️ Warning: New stock would be {newQty} units (negative!)
                                                        <br />
                                                        <span style={{ fontSize: '12px', fontWeight: '400' }}>
                                                            Maximum removable: {currentQty} units
                                                        </span>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div style={{
                                                    color: adjustmentType === 'add' ? '#198754' : '#dc3545'
                                                }}>
                                                    New stock will be: {newQty} units
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>


                        </>
                    )}
                </Modal.Body>
                <Modal.Footer style={{
                    backgroundColor: '#f8f9fa',
                    border: 'none',
                    padding: '20px 30px',
                    gap: '10px'
                }}>
                    <Button
                        variant="secondary"
                        onClick={closeAdjustModal}
                        style={{
                            padding: '10px 24px',
                            fontWeight: '600',
                            borderRadius: '8px'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={adjustmentType === 'add' ? 'success' : 'danger'}
                        onClick={handleAdjustStock}
                        style={{
                            padding: '10px 24px',
                            fontWeight: '600',
                            borderRadius: '8px'
                        }}
                    >
                        {adjustmentType === 'add' ? 'Add Stock' : 'Remove Stock'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='dash-main'>
                <div className='customer-header' style={{ marginBottom: '30px' }}>
                    <h1 className='h-customer' style={{
                        color: 'black',
                        fontSize: '32px',
                        fontWeight: '700'
                    }}>
                        INVENTORY MANAGEMENT
                    </h1>
                </div>

                {/* Filter Controls */}
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
                                onChange={(e) => setLocID(e.target.value)}
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
                                {locationList.
                                    filter(r => r.name !== 'Warehouse')
                                    .map((r) => (
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
                                Filter by Stock Level
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
                                <option value={''}>All Stock Levels</option>
                                <option value={'high'}>High Stock (3 and above)</option>
                                <option value={'low'}>Low Stock (2 units)</option>
                                <option value={'critical'}>Critical Stock (1 unit)</option>
                                <option value={'out'}>Out of Stock (0 units)</option>
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
                            <input
                                type="text"
                                placeholder="Search by product code or description..."
                                value={searchProd}
                                onChange={(e) => setSearchProd(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    backgroundColor: '#ffffff'
                                }}
                            />
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
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#dc3545';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#6c757d';
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
                                Stock: {
                                    stockLevel === 'high' ? 'High Stock (3 and above)' :
                                        stockLevel === 'low' ? 'Low Stock (2 units)' :
                                            stockLevel === 'critical' ? 'Critical Stock (1 unit)' :
                                                stockLevel === 'out' ? 'Out of Stock (0 units)' :
                                                    'All Stock Levels'
                                }
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
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#dc3545';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#6c757d';
                                    }}
                                    title="Remove stock filter"
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
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#dc3545';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#6c757d';
                                    }}
                                    title="Remove search filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                            ({sortedInventoryList.length} of {inventoryList.length} records shown)
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

                {/* Results Count */}
                <div style={{
                    padding: '12px 0',
                    fontSize: '14px',
                    color: '#6c757d',
                    fontWeight: '500'
                }}>
                    Showing {currentItems.length} of {sortedInventoryList.length} items
                </div>

                {/* Table and Pagination Container */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '400px'
                }}>
                    {/* Inventory Table */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                        overflow: 'hidden',
                        marginBottom: totalPages > 1 ? '0' : '20px',
                        flex: 1
                    }}>
                        <div style={{ overflowX: 'auto' }}>
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
                                            Stock Qty {sortField === 'qty' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>Status</th>
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
                                        <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>Stock Thresholds</th>
                                        <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map((item, index) => {
                                            const qty = parseInt(item.qty) || 0;
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
                                                    <td style={{ padding: '14px', fontSize: '14px', color: '#495057' }}>
                                                        {item.description}
                                                    </td>
                                                    <td style={{ padding: '14px', fontSize: '14px', fontWeight: '600', color: '#212529' }}>
                                                        {qty}
                                                    </td>
                                                    <td style={{ padding: '14px' }}>
                                                        {(() => {
                                                            const minThreshold = item.min_threshold !== null && item.min_threshold !== undefined ? parseInt(item.min_threshold) : 1;
                                                            const maxThreshold = item.max_threshold !== null && item.max_threshold !== undefined ? parseInt(item.max_threshold) : 2;
                                                            
                                                            let statusText = '';
                                                            let backgroundColor = '';
                                                            let textColor = '';
                                                            let needsRestock = false;

                                                            if (qty === 0) {
                                                                statusText = 'Out of Stock';
                                                                backgroundColor = '#f8d7da';
                                                                textColor = '#721c24';
                                                                needsRestock = true;
                                                            } else if (qty < minThreshold) {
                                                                statusText = 'Below Minimum';
                                                                backgroundColor = '#dc3545';
                                                                textColor = '#ffffff';
                                                                needsRestock = true;
                                                            } else if (qty <= maxThreshold) {
                                                                statusText = 'Low Stock';
                                                                backgroundColor = '#fff3cd';
                                                                textColor = '#856404';
                                                                needsRestock = true;
                                                            } else {
                                                                statusText = 'In Stock';
                                                                backgroundColor = '#d1e7dd';
                                                                textColor = '#0f5132';
                                                            }

                                                            return (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <span style={{
                                                                        padding: '4px 10px',
                                                                        borderRadius: '4px',
                                                                        fontSize: '12px',
                                                                        fontWeight: '600',
                                                                        backgroundColor: backgroundColor,
                                                                        color: textColor
                                                                    }}>
                                                                        {statusText}
                                                                    </span>
                                                                    {needsRestock && (
                                                                        <span style={{
                                                                            fontSize: '16px',
                                                                            color: '#dc3545',
                                                                            cursor: 'help',
                                                                            title: `Stock is below maximum threshold (${maxThreshold}). Restock needed.`
                                                                        }}>
                                                                            ⚠️
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td style={{ padding: '14px', fontSize: '14px', color: '#495057' }}>
                                                        {item.location_name}
                                                    </td>
                                                    <td style={{ padding: '14px' }}>
                                                        {(() => {
                                                            const minThreshold = item.min_threshold !== null && item.min_threshold !== undefined ? parseInt(item.min_threshold) : 1;
                                                            const maxThreshold = item.max_threshold !== null && item.max_threshold !== undefined ? parseInt(item.max_threshold) : 2;
                                                            const currentQty = parseInt(item.qty) || 0;

                                                            return (
                                                                <div style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'stretch',
                                                                    gap: '8px'
                                                                }}>
                                                                    {/* Threshold Display */}
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: '6px',
                                                                        padding: '8px',
                                                                        backgroundColor: '#f8f9fa',
                                                                        borderRadius: '6px',
                                                                        border: '1px solid #dee2e6'
                                                                    }}>
                                                                        {/* Min Threshold */}
                                                                        <div style={{
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            alignItems: 'center',
                                                                            gap: '8px'
                                                                        }}>
                                                                            <span style={{
                                                                                fontSize: '11px',
                                                                                fontWeight: '600',
                                                                                color: '#6c757d',
                                                                                textTransform: 'uppercase'
                                                                            }}>
                                                                                Min:
                                                                            </span>
                                                                            <span style={{
                                                                                fontSize: '13px',
                                                                                fontWeight: '700',
                                                                                color: currentQty < minThreshold ? '#dc3545' : '#198754',
                                                                                padding: '2px 8px',
                                                                                backgroundColor: currentQty < minThreshold ? '#f8d7da' : '#d1e7dd',
                                                                                borderRadius: '4px'
                                                                            }}>
                                                                                {minThreshold}
                                                                            </span>
                                                                        </div>

                                                                        {/* Separator */}
                                                                        <div style={{
                                                                            height: '1px',
                                                                            backgroundColor: '#dee2e6'
                                                                        }}></div>

                                                                        {/* Max Threshold */}
                                                                        <div style={{
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            alignItems: 'center',
                                                                            gap: '8px'
                                                                        }}>
                                                                            <span style={{
                                                                                fontSize: '11px',
                                                                                fontWeight: '600',
                                                                                color: '#6c757d',
                                                                                textTransform: 'uppercase'
                                                                            }}>
                                                                                Max:
                                                                            </span>
                                                                            <span style={{
                                                                                fontSize: '13px',
                                                                                fontWeight: '700',
                                                                                color: currentQty <= maxThreshold ? '#ffc107' : '#198754',
                                                                                padding: '2px 8px',
                                                                                backgroundColor: currentQty <= maxThreshold ? '#fff3cd' : '#d1e7dd',
                                                                                borderRadius: '4px'
                                                                            }}>
                                                                                {maxThreshold}
                                                                            </span>
                                                                        </div>

                                                                        {/* Range Indicator */}
                                                                        <div style={{
                                                                            marginTop: '4px',
                                                                            fontSize: '10px',
                                                                            color: '#6c757d',
                                                                            textAlign: 'center',
                                                                            fontStyle: 'italic'
                                                                        }}>
                                                                            Range: {minThreshold}-{maxThreshold}
                                                                        </div>
                                                                    </div>

                                                                    {/* Edit Button - Under Threshold */}
                                                                    <button
                                                                        onClick={() => openThresholdModal(item)}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '8px 12px',
                                                                            backgroundColor: '#ffc107',
                                                                            color: '#000',
                                                                            border: '1px solid #ffc107',
                                                                            borderRadius: '6px',
                                                                            cursor: 'pointer',
                                                                            fontSize: '12px',
                                                                            fontWeight: '600',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            gap: '6px',
                                                                            transition: 'all 0.2s'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.currentTarget.style.backgroundColor = '#ffb700';
                                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.currentTarget.style.backgroundColor = '#ffc107';
                                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                                            e.currentTarget.style.boxShadow = 'none';
                                                                        }}
                                                                        title="Edit thresholds for this item"
                                                                    >
                                                                        <span style={{ fontSize: '14px' }}>✏️</span>
                                                                        <span>Edit Thresholds</span>
                                                                    </button>
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td style={{ padding: '14px' }}>
                                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                            <button
                                                                onClick={() => {
                                                                    setInventReportVisible(false);
                                                                    GetInventoryReport(item.product_id, item.location_id, item.product_name, item.description);
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
                                                            <button
                                                                onClick={() => openAdjustModal(item)}
                                                                style={{
                                                                    padding: '6px 14px',
                                                                    backgroundColor: '#198754',
                                                                    color: 'white',
                                                                    border: '1px solid #198754',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '13px',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                Adjust Stock
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" style={{ padding: '60px 20px', textAlign: 'center', color: '#6c757d' }}>
                                                <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#495057' }}>
                                                    No Inventory Items Found
                                                </h3>
                                                <p>
                                                    {sortedInventoryList.length === 0 ?
                                                        "There are no inventory items in the system." :
                                                        "No items match your current filter criteria."
                                                    }
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination - Fixed Position at Bottom */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            paddingTop: '20px',
                            paddingBottom: '20px',
                            borderTop: '1px solid #dee2e6',
                            backgroundColor: 'white',
                            borderRadius: '0 0 8px 8px',
                            marginTop: '0',
                            flexShrink: 0
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
            </div>
        </>
    );
};

export default InventoryIM;