'use client';
import { useState, useEffect } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import CustomPagination from '@/app/Components/Pagination/pagination';

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
        if (sortField && inventoryList.length > 0) {
            const sorted = [...inventoryList].sort((a, b) => {
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
            setSortedInventoryList(inventoryList);
        }
    }, [inventoryList, sortField, sortDirection]);

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
            setInventoryList(response.data);
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
                <Modal.Body style={{ padding: '30px', height: '70vh', overflowY: 'auto' }}>
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
                                            const isNegativeType = ['Installment Sales', 'Sales', 'Transfer Stock'].includes(item.type);
                                            const displayQty = isNegativeType && parseInt(item.qty) > 0 ? -parseInt(item.qty) : parseInt(item.qty);
                                            const isPositiveChange = displayQty >= 0;
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
                                                        {displayQty > 0 ? '+' : ''}{displayQty}
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600' }}>{item.current_balance}</td>
                                                    <td style={{ padding: '12px', fontSize: '14px', color: '#6c757d' }}>{item.date}</td>
                                                    <td style={{ padding: '12px', fontSize: '14px', color: '#6c757d' }}>{item.time}</td>
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

                    {totalPages1 > 1 && (
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center',
                            marginTop: '24px'
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
                                <option value={'High'}>In Stock</option>
                                <option value={'Low'}>No Stock</option>
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

                        <div>
                            <button
                                type="button"
                                onClick={clearAllFilters}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: 'white',
                                    color: '#495057',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    width: '100%'
                                }}
                            >
                                Clear All Filters
                            </button>
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
                                Stock: {stockLevel === 'High' ? 'In Stock' : 'No Stock'}
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

                {/* Inventory Table */}
                <div style={{ 
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6',
                    overflow: 'hidden',
                    marginBottom: '20px'
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
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        backgroundColor: qty === 0 ? '#f8d7da' : '#d1e7dd',
                                                        color: qty === 0 ? '#721c24' : '#0f5132'
                                                    }}>
                                                        {qty === 0 ? 'Out of Stock' : 'In Stock'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px', fontSize: '14px', color: '#495057' }}>
                                                    {item.location_name}
                                                </td>
                                                <td style={{ padding: '14px' }}>
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
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '60px 20px', textAlign: 'center', color: '#6c757d' }}>
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        marginTop: '30px'
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

export default InventoryIM;