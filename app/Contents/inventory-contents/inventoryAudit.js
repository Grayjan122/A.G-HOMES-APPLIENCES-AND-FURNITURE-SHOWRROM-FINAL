'use client';
import { useState, useEffect, useMemo, use } from 'react';
import axios from 'axios';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { Alert } from 'react-bootstrap';
import "../../css/inventory-css/inventory.css";
import { Dropdown } from 'react-bootstrap';

const ITEMS_PER_PAGE = 8;

const InventoryLedgerIM = () => {
    // Essential states
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [invenReport, setInvenReport] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [locationList, setLocationList] = useState([]);

    // Filter states
    const [filterProd, setFilterProd] = useState('');
    const [filterSearch, setFilterSearch] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterLocation, setFilterLocation] = useState(''); // Added location filter

    useEffect(() => {
        console.log('Filters changed:', { filterDate, filterProd, filterLocation });
        // Reset to first page when filters change
        setCurrentPage(1);
    }, [filterProd, filterSearch, filterDate, filterLocation]);

    // Alert states
    const [alert, setAlert] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

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

    // Apply filters to the data
    const filteredData = useMemo(() => {
        let filtered = [...invenReport];

        // Filter by product
        if (filterProd) {
            filtered = filtered.filter(item => item.product_id === filterProd);
        }

        // Filter by location - FIXED
        if (filterLocation) {
            filtered = filtered.filter(item =>
                item.location_id?.toString() === filterLocation.toString()
            );
        }

        // Filter by date
        if (filterDate) {
            filtered = filtered.filter(item => {
                return item.date === filterDate;
            });
        }

        // Filter by search term (searches in product name, description, and done by)
        if (filterSearch.trim()) {
            const searchTerm = filterSearch.toLowerCase();
            filtered = filtered.filter(item =>
                item.product_name?.toLowerCase().includes(searchTerm) ||
                item.description?.toLowerCase().includes(searchTerm) ||
                `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }, [invenReport, filterProd, filterDate, filterSearch, filterLocation]);

    // Pagination calculations using filtered data
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Initialize data on mount
    useEffect(() => {
        setUser_id(sessionStorage.getItem("user_id"));
        setLocation_id(sessionStorage.getItem("location_id"));
        GetLocation();

        const hasRun = sessionStorage.getItem("once");

        if (hasRun == "false") {
            GetInventoryReport();
            sessionStorage.setItem("once", "true");
        }
    }, []);

    // Fetch inventory when location changes
    useEffect(() => {
        if (user_id) {
            GetInventoryReport();
        }
    }, [user_id]);

    const showAlert = (variant, bg, msg) => {
        setAlert(true);
        setAlertVariant(variant);
        setAlertBG(bg);
        setMessage(msg);
        setTimeout(() => setAlert(false), 3000);
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
            console.log('Location list:', response.data);
        } catch (error) {
            console.error("Error fetching location list:", error);
        }
    };

    const uniqueSortedProducts = useMemo(() => {
        return invenReport
            .filter((item, index, self) =>
                index === self.findIndex(t => t.product_id === item.product_id)
            )
            .sort((a, b) => a.description.localeCompare(b.description));
    }, [invenReport]);

    useEffect(() => {
        GetInventoryReport1(filterLocation);
    }, [filterLocation]);

    const GetInventoryReport1 = async (id) => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const accountID = sessionStorage.getItem('user_id');
            const locationID = id;
            const locName = sessionStorage.getItem('location_name');
            console.log('Getting inventory for location:', locationID);

            const response = await axios.get(`${baseURL}inventory.php`, {
                params: {
                    json: JSON.stringify({ locID: locationID }),
                    operation: "GetInventoryReport"
                }
            });

            setInvenReport(response.data);
            console.log('Inventory report data:', response.data);
            Logs(accountID, 'Get the inventory reports of ' + locName);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            showAlert('danger', '#f8d7da', 'Error loading inventory data');
        }
    };

    const GetInventoryReport = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const accountID = sessionStorage.getItem('user_id');
            const locationID = sessionStorage.getItem('location_id');
            const locName = sessionStorage.getItem('location_name');
            console.log('Getting inventory for location:', locationID);

            const response = await axios.get(`${baseURL}inventory.php`, {
                params: {
                    json: JSON.stringify({ locID: locationID }),
                    operation: "GetInventoryReport"
                }
            });

            setInvenReport(response.data);
            console.log('Inventory report data:', response.data);
            Logs(accountID, 'Get the inventory reports of ' + locName);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            showAlert('danger', '#f8d7da', 'Error loading inventory data');
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Clear all filters function
    const clearAllFilters = () => {
        setFilterProd('');
        setFilterDate('');
        setFilterSearch('');
        setFilterLocation('');
        setCurrentPage(1);
        GetInventoryReport();
    };

    // Get location name by ID
    const getLocationName = (id) => {
        const location = locationList.find(loc => loc.location_id?.toString() === id?.toString());
        return location ? location.location_name : '';
    };

    return (
        <>
            <Alert variant={alertVariant} show={alert} style={{ backgroundColor: alertBG }}>
                {message}
            </Alert>

            <div className='customer-main' style={{ overflowY: 'scroll', overflowX: 'hidden' }}>
                <div className='customer-header'>
                    <h1 className='h-customer'>INVENTORY LEDGER</h1>
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
                                value={filterLocation}
                                onChange={(e) => setFilterLocation(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Stores</option>
                                {locationList.map((location) => (
                                    <option key={location.location_id} value={location.location_id.toString()}>
                                        {location.location_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Product Filter */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: '500',
                                fontSize: '14px'
                            }}>
                                Filter by Product
                            </label>
                            <select
                                value={filterProd}
                                onChange={(e) => setFilterProd(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Products</option>
                                {uniqueSortedProducts.map((r) => (
                                    <option key={r.product_id} value={r.product_id}>
                                        {r.product_name} - {r.description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: '500',
                                fontSize: '14px'
                            }}>
                                Filter by Date
                            </label>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        {/* Search Filter */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: '500',
                                fontSize: '14px'
                            }}>
                                Search Records
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
                                    placeholder="Search products or staff..."
                                    value={filterSearch}
                                    onChange={(e) => setFilterSearch(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px 8px 35px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />

                                {filterSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setFilterSearch('')}
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
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <strong>Active Filters:</strong>

                        {filterLocation && (
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
                                Store: {getLocationName(filterLocation)}
                                <button
                                    type="button"
                                    onClick={() => { setFilterLocation(''); GetInventoryReport(); }}
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

                        {filterProd && (
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
                                Product: {uniqueSortedProducts.find(r => r.product_id === filterProd)?.product_name}
                                <button
                                    type="button"
                                    onClick={() => setFilterProd('')}
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
                                    title="Remove product filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {filterDate && (
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
                                Date: {formatDate(filterDate)}
                                <button
                                    type="button"
                                    onClick={() => setFilterDate('')}
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
                                    title="Remove date filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {filterSearch && (
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
                                Search: "{filterSearch}"
                                <button
                                    type="button"
                                    onClick={() => setFilterSearch('')}
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
                            ({filteredData.length} of {invenReport.length} records shown)
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
                                <th className='t2'>PRODUCT CODE</th>
                                <th className='t3'>PRODUCT DESCRIPTION</th>
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
                            {currentItems.length > 0 ? (
                                currentItems.map((p, i) => {
                                    // Determine transaction type
                                    const type = p.type?.toLowerCase() || '';
                                    const isNegative = type.includes('sales') || type.includes('transfer out');
                                    const isPositive = type.includes('stock in') || type.includes('transfer in');
                                    
                                    // Color coding
                                    const rowStyle = {
                                        backgroundColor: isNegative ? '#fff5f5' : isPositive ? '#f0fdf4' : 'transparent'
                                    };
                                    
                                    const typeStyle = {
                                        color: isNegative ? '#dc2626' : isPositive ? '#16a34a' : '#374151',
                                        fontWeight: '500'
                                    };
                                    
                                    const qtyStyle = {
                                        textAlign: 'center',
                                        color: isNegative ? '#dc2626' : isPositive ? '#16a34a' : '#374151',
                                        fontWeight: '600'
                                    };
                                    
                                    return (
                                        <tr className='table-row' key={i} style={rowStyle}>
                                            <td className='td-name'>{p.product_name}</td>
                                            <td className='td-name'>{p.description}</td>
                                            <td style={typeStyle}>{p.type}</td>
                                            <td style={{textAlign: 'center'}}>{p.past_balance}</td>
                                            <td style={qtyStyle}>
                                                {p.qty}
                                            </td>
                                            <td style={{textAlign: 'center', fontWeight: '500'}}>{p.current_balance}</td>
                                            <td>{formatDate(p.date)}</td>
                                            <td>{formatTime(p.time)}</td>
                                            <td>{`${p.fname || ''} ${p.mname || ''} ${p.lname || ''}`}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: "center", padding: "15px", fontStyle: "italic" }}>
                                        {invenReport.length === 0 ?
                                            "No inventory records found" :
                                            "No records match the current filters"
                                        }
                                    </td>
                                </tr>
                            )}
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
            </div>
        </>
    );
};

export default InventoryLedgerIM;