'use client';
import { useState, useEffect, useRef } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import CustomPagination from '@/app/Components/Pagination/pagination';

const ITEMS_PER_PAGE = 8;

const InventoryWR = () => {
    // Essential state variables
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [inventoryList, setInventoryList] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const [inventReport, setInventReport] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [currentPage1, setCurrentPage1] = useState(1);

    const [pName, setPname] = useState('');
    const [pDes, setDes] = useState('');

    // Search and filter states
    const [locID, setLocID] = useState(0);
    const [stockLevel, setStockLevel] = useState('');
    const [searchProd, setSearchProd] = useState('');

    // Sorting states
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [sortedInventoryList, setSortedInventoryList] = useState([]);

    // Alert states
    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');
    const [inventReportVisible, setInventReportVisible] = useState(true);

    // Sort function
    const handleSort = (field) => {
        let direction = 'asc';
        if (sortField === field && sortDirection === 'asc') {
            direction = 'desc';
        }
        
        setSortField(field);
        setSortDirection(direction);
        setCurrentPage(1); // Reset to first page when sorting
    };

    // Apply sorting to inventory list
    useEffect(() => {
        if (sortField && inventoryList.length > 0) {
            const sorted = [...inventoryList].sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];

                // Handle different data types
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

    // Use sorted list for pagination
    const totalPages = Math.ceil(sortedInventoryList.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = sortedInventoryList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const totalPages1 = Math.ceil(inventReport.length / ITEMS_PER_PAGE);
    const startIndex1 = (currentPage1 - 1) * ITEMS_PER_PAGE;
    const currentItems1 = inventReport.slice(startIndex1, startIndex1 + ITEMS_PER_PAGE);

    // Render sort arrow
    const renderSortArrow = (field) => {
        if (sortField !== field) {
            return (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ opacity: 0.3, marginLeft: '5px' }}
                >
                    <path d="m7 14 5-5 5 5"/>
                    <path d="m7 10 5 5 5-5"/>
                </svg>
            );
        }

        return sortDirection === 'asc' ? (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ marginLeft: '5px' }}
            >
                <path d="m7 14 5-5 5 5"/>
            </svg>
        ) : (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ marginLeft: '5px' }}
            >
                <path d="m7 10 5 5 5-5"/>
            </svg>
        );
    };

    // Initialize user session
    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));
    }, []);

    // Load data based on filters
    useEffect(() => {
        GetInventory();
        // Reset to first page when filters change
        setCurrentPage(1);
    }, [locID, stockLevel, searchProd]);

    // Initial data load
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
            console.log(response.data);

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

    // Clear all filters function
    const clearAllFilters = () => {
        setLocID(0);
        setStockLevel('');
        setSearchProd('');
        setSortField('');
        setSortDirection('asc');
        setCurrentPage(1);
    };

    // Get location name by ID
    const getLocationName = (id) => {
        const location = locationList.find(loc => loc.location_id === parseInt(id));
        return location ? location.location_name : '';
    };

    // Get stock level display name
    const getStockLevelName = (level) => {
        switch (level) {
            case 'High': return 'In Stock';
            case 'Low': return 'No Stock';
            default: return level;
        }
    };

    // Remove individual filter
    const removeFilter = (filterType) => {
        switch (filterType) {
            case 'location':
                setLocID(0);
                break;
            case 'stock':
                setStockLevel('');
                break;
            case 'search':
                setSearchProd('');
                break;
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
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Product Inventory Report</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="r-details-head" style={{width: '95%'}}>
                        <div className='r-d-div'>
                            <div className='r-1'><strong>PRODUCT CODE:</strong> {pName}</div>
                        </div>
                        <div><strong>PRODUCT DESCRIPTION:</strong> {pDes}</div>
                    </div>
                    <div className='tableContainer1' style={{ height: '45vh', overflowY: 'auto' }}>
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th className='th1'>TYPE</th>
                                    <th className='th1'>PAST BALANCE</th>
                                    <th className='th1'>QTY</th>
                                    <th className='th1'>CURRENT BALANCE</th>
                                    <th className='th1'>DATE</th>
                                    <th className='th1'>TIME</th>
                                    <th className='th1'>DONE BY</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems1.length > 0 ? (
                                    currentItems1.map((p, i) => (
                                        <tr className='table-row' key={i}>
                                            <td>{p.type}</td>
                                            <td>{p.past_balance}</td>
                                            <td>{p.qty}</td>
                                            <td>{p.current_balance}</td>
                                            <td>{p.date}</td>
                                            <td>{p.time}</td>
                                            <td>{`${p.fname} ${p.mname} ${p.lname}`}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: "center", padding: "15px", fontStyle: "italic" }}>
                                            {inventReport.length === 0 ?
                                                "No inventory records found" :
                                                "No records match the current filters"
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages1 > 1 && (
                        <div style={{ justifySelf: 'center' }}>
                            <CustomPagination
                                currentPage={currentPage1}
                                totalPages={totalPages1}
                                onPageChange={handlePageChange1}
                                color="green"
                            />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => { setInventReportVisible(true); }}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='dash-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>INVENTORY MANAGEMENT</h1>
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
                        {/* Store/Location Filter */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '5px', 
                                fontWeight: '500', 
                                fontSize: '14px'
                            }}>
                                Filter by Store
                            </label>
                            <select
                                value={locID}
                                onChange={(e) => setLocID(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
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

                        {/* Stock Level Filter */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '5px', 
                                fontWeight: '500', 
                                fontSize: '14px'
                            }}>
                                Filter by Stock Level
                            </label>
                            <select
                                value={stockLevel}
                                onChange={(e) => setStockLevel(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value={''}>All Stock Levels</option>
                                <option value={'High'}>In Stock</option>
                                <option value={'Low'}>No Stock</option>
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
                                        padding: '8px 12px 8px 35px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
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

                {/* Active Filters Display */}
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
                                Store: {getLocationName(locID)}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('location')}
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
                                    title="Remove store filter"
                                >
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
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
                                Stock: {getStockLevelName(stockLevel)}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('stock')}
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
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
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
                                    onClick={() => removeFilter('search')}
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
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </span>
                        )}

                        {!locID && !stockLevel && !searchProd && (
                            <span style={{ color: '#6c757d' }}>None</span>
                        )}

                        <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                            ({sortedInventoryList.length} records found)
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

                <div className='tableContainer' style={{ height: '45vh', overflowY: 'auto' }}>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th 
                                    className='t2' 
                                    onClick={() => handleSort('product_name')}
                                    
                                >
                                    <span>PRODUCT CODE</span>
                                    {renderSortArrow('product_name')}
                                </th>
                                <th 
                                    className='t3' 
                                    onClick={() => handleSort('description')}
                                   
                                >
                                    <span>PRODUCT DESCRIPTION</span>
                                    {renderSortArrow('description')}
                                </th>
                                <th 
                                    className='th1' 
                                    onClick={() => handleSort('qty')}
                                    
                                >
                                    <span>STOCK</span>
                                    {renderSortArrow('qty')}
                                </th>
                                <th 
                                    className='th1' 
                                    onClick={() => handleSort('location_name')}
                                   
                                >
                                    <span>STORE</span>
                                    {renderSortArrow('location_name')}
                                </th>
                                <th className='t2'>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((p, i) => (
                                    <tr className='table-row' key={i}
                                        onClick={() => {
                                            setInventReportVisible(false);
                                            GetInventoryReport(p.product_id, p.location_id, p.product_name, p.description);
                                        }}
                                    >
                                        <td className='td-name'>{p.product_name}</td>
                                        <td className='td-name'>{p.description}</td>
                                        <td style={{ textAlign: 'center' }}>{p.qty}</td>
                                        <td style={{ textAlign: 'center' }}>{p.location_name}</td>
                                        <td>
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                fontSize: "12px",
                                                fontWeight: "bold"
                                            }}>
                                                <span style={{
                                                    height: "20px",
                                                    width: "20px",
                                                    borderRadius: "50%",
                                                    backgroundColor: p.qty > 0 ? "green" : "red"
                                                }}></span>
                                                <span>
                                                    { p.qty > 0 ? "In Stock" : "Out of Stock"}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "15px", fontStyle: "italic" }}>
                                        {sortedInventoryList.length === 0 ? 
                                            "No inventory items found" : 
                                            "No inventory items match the current filters"
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div style={{ justifySelf: 'center', marginTop: '10px' }}>
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

export default InventoryWR;