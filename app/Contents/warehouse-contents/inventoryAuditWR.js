'use client';
import { useState, useEffect, use } from 'react';
import axios from 'axios';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { Alert } from 'react-bootstrap';
import "../../css/inventory-css/inventory.css";
import Form from 'react-bootstrap/Form';
import { Dropdown } from 'react-bootstrap';
import { useMemo } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';

const ITEMS_PER_PAGE = 8;

const InventoryLedgerWR = () => {
    // Essential states
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [invenReport, setInvenReport] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [locationList, setLocationList] = useState([]);
    const [loc_id, setLoc_ID] = useState(0);

    const [filterProd, setFilterProd] = useState('');
    const [filterSearch, setFilterSearch] = useState('');
    const [filterDate, setFilterDate] = useState('');

    // Sorting states
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');

    useEffect(() => {
        console.log(filterDate);
        console.log(filterProd);
        // Reset to first page when filters change
        setCurrentPage(1);
    }, [filterProd, filterSearch, filterDate]);

    // Alert states
    const [alert, setAlert] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

  
   
    // Apply filters and sorting to the data
    const filteredAndSortedData = useMemo(() => {
        let filtered = [...invenReport];

        // Filter by product
        if (filterProd) {
            filtered = filtered.filter(item => item.product_id === filterProd);
        }

        // Filter by date
        if (filterDate) {
            filtered = filtered.filter(item => {
                return item.date === filterDate;
            });
        }

        // Filter by search term
        if (filterSearch.trim()) {
            const searchTerm = filterSearch.toLowerCase();
            filtered = filtered.filter(item =>
                item.product_name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm) ||
                `${item.fname} ${item.mname} ${item.lname}`.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting if a field is selected
        if (sortField) {
            filtered.sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];

                // Handle different data types
                if (['past_balance', 'qty', 'current_balance'].includes(sortField)) {
                    aVal = parseInt(aVal) || 0;
                    bVal = parseInt(bVal) || 0;
                } else if (sortField === 'date') {
                    aVal = new Date(aVal);
                    bVal = new Date(bVal);
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
        }

        return filtered;
    }, [invenReport, filterProd, filterDate, filterSearch, sortField, sortDirection]);

    // Pagination calculations using filtered and sorted data
    const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
        GetInventoryReport();
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

    const GetInventoryReport = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const accountID = sessionStorage.getItem('user_id');
            const locationID = sessionStorage.getItem('location_id');
            const locName = sessionStorage.getItem('location_name');

            const response = await axios.get(`${baseURL}inventory.php`, {
                params: {
                    json: JSON.stringify({ locID: locationID }),
                    operation: "GetInventoryReport"
                }
            });

            setInvenReport(response.data);
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
        setSortField('');
        setSortDirection('asc');
        setCurrentPage(1);
    };

    return (
        <>
            <Alert variant={alertVariant} show={alert} style={{ backgroundColor: alertBG }}>
                {message}
            </Alert>

            <div className='dash-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>WAREHOUSE LEDGER</h1>
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
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '15px',
                        alignItems: 'end'
                    }}>
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
                                Date: {filterDate}
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

                        {!filterProd && !filterDate && !filterSearch && (
                            <span style={{ color: '#6c757d' }}>None</span>
                        )}
                        
                        <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                            ({filteredAndSortedData.length} of {invenReport.length} records shown)
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
                                    
                                   
                                >
                                    <span>PRODUCT CODE</span>
                                    
                                </th>
                                <th 
                                    className='t3'
                                   
                                   
                                  
                                >
                                    <span>PRODUCT DESCRIPTION</span>
                                   
                                </th>
                                <th 
                                    className='th1'
                                   
                                   
                                >
                                    <span>TYPE</span>
                                   
                                </th>
                                <th 
                                    className='th1'
                                   
                                    
                                >
                                    <span>PAST BALANCE</span>
                                    
                                </th>
                                <th 
                                    className='th1'
                                    
                                    
                                >
                                    <span>QTY</span>
                                    
                                </th>
                                <th 
                                    className='th1'
                                    
                                  
                                >
                                    <span>CURRENT BALANCE</span>
                                    
                                </th>
                                <th 
                                    className='th1'
                                    
                                    
                                >
                                    <span>DATE</span>
                                    
                                </th>
                                <th 
                                    className='th1'
                                    
                                   
                                >
                                    <span>TIME</span>
                                   
                                </th>
                                <th 
                                    className='th1'
                                   
                                   
                                >
                                    <span>DONE BY</span>
                                    
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((p, i) => (
                                    <tr className='table-row' key={i}>
                                        <td className='td-name'>{p.product_name}</td>
                                        <td className='td-name'>{p.description}</td>
                                        <td>{p.type}</td>
                                        <td style={{textAlign: 'center'}}>{p.past_balance}</td>
                                        <td style={{textAlign: 'center'}}>{p.qty}</td>
                                        <td style={{textAlign: 'center'}}>{p.current_balance}</td>
                                        <td style={{textAlign: 'center'}}>{p.date}</td>
                                        <td style={{textAlign: 'center'}}>{p.time}</td>
                                        <td>{`${p.fname} ${p.mname} ${p.lname}`}</td>
                                    </tr>
                                ))
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
                    <div style={{ justifySelf: 'center',  marginTop: '10px' }}>
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

export default InventoryLedgerWR;