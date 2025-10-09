'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { Alert } from 'react-bootstrap';
import "../../css/inventory-css/inventory.css";

const ITEMS_PER_PAGE = 10;

const InventoryLedgerAdmin = () => {
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [invenReport, setInvenReport] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [locationList, setLocationList] = useState([]);

    // Filter states
    const [filterProd, setFilterProd] = useState('');
    const [filterSearch, setFilterSearch] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [filterType, setFilterType] = useState('');

    useEffect(() => {
        setCurrentPage(1);
    }, [filterProd, filterSearch, filterDate, filterLocation, filterType]);

    // Alert states
    const [alert, setAlert] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

    // Apply filters only (no sorting to maintain chronological order)
    const filteredData = useMemo(() => {
        let filtered = [...invenReport];

        if (filterProd) {
            filtered = filtered.filter(item => item.product_id === filterProd);
        }

        if (filterLocation) {
            filtered = filtered.filter(item =>
                item.location_id?.toString() === filterLocation.toString()
            );
        }

        if (filterType) {
            filtered = filtered.filter(item => item.type === filterType);
        }

        if (filterDate) {
            filtered = filtered.filter(item => item.date === filterDate);
        }

        if (filterSearch.trim()) {
            const searchTerm = filterSearch.toLowerCase();
            filtered = filtered.filter(item =>
                item.product_name?.toLowerCase().includes(searchTerm) ||
                item.description?.toLowerCase().includes(searchTerm) ||
                `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }, [invenReport, filterProd, filterDate, filterSearch, filterLocation, filterType]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

    const uniqueTypes = useMemo(() => {
        return [...new Set(invenReport.map(item => item.type))].filter(Boolean).sort();
    }, [invenReport]);

    useEffect(() => {
        GetInventoryReport1(filterLocation);
    }, [filterLocation]);

    const GetInventoryReport1 = async (id) => {
        if (!id) {
            return;
        }
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const accountID = sessionStorage.getItem('user_id');
            const locationID = id;
            const l = locationList.find(loc => loc.location_id?.toString() === id?.toString());
            const locName = l?.location_name;

            const response = await axios.get(`${baseURL}inventory.php`, {
                params: {
                    json: JSON.stringify({ locID: locationID }),
                    operation: "GetInventoryReport"
                }
            });

            setInvenReport(response.data);
            if (locName) {
                Logs(accountID, 'Get the inventory reports of ' + locName);
            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
            showAlert('danger', '#f8d7da', 'Error loading inventory data');
        }
    };

    const GetInventoryReport = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const accountID = sessionStorage.getItem('user_id');

            const response = await axios.get(`${baseURL}inventory.php`, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetInventoryReport1"
                }
            });

            setInvenReport(response.data);
            Logs(accountID, 'Get the inventory reports of all locations');
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

    const clearAllFilters = () => {
        setFilterProd('');
        setFilterDate('');
        setFilterSearch('');
        setFilterLocation('');
        setFilterType('');
        setCurrentPage(1);
        GetInventoryReport();
    };

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
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '12px',
                        alignItems: 'end'
                    }}>
                        {/* Store Filter */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: '500',
                                fontSize: '13px',
                                color: '#495057'
                            }}>
                                Store
                            </label>
                            <select
                                value={filterLocation}
                                onChange={(e) => setFilterLocation(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '13px'
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
                                fontSize: '13px',
                                color: '#495057'
                            }}>
                                Product
                            </label>
                            <select
                                value={filterProd}
                                onChange={(e) => setFilterProd(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '13px'
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

                        {/* Type Filter */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: '500',
                                fontSize: '13px',
                                color: '#495057'
                            }}>
                                Type
                            </label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '13px'
                                }}
                            >
                                <option value="">All Types</option>
                                {uniqueTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
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
                                fontSize: '13px',
                                color: '#495057'
                            }}>
                                Date
                            </label>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '13px'
                                }}
                            />
                        </div>

                        {/* Search Filter */}
                        <div style={{ gridColumn: 'span 1' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: '500',
                                fontSize: '13px',
                                color: '#495057'
                            }}>
                                Search
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 1,
                                    color: '#6c757d'
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={filterSearch}
                                    onChange={(e) => setFilterSearch(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px 8px 32px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '13px'
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
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
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
                    fontSize: '13px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <strong>Filters:</strong>

                        {filterLocation && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '12px',
                                fontSize: '12px'
                            }}>
                                {getLocationName(filterLocation)}
                                <button onClick={() => { setFilterLocation(''); GetInventoryReport(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}>×</button>
                            </span>
                        )}

                        {filterProd && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '12px',
                                fontSize: '12px'
                            }}>
                                {uniqueSortedProducts.find(r => r.product_id === filterProd)?.product_name}
                                <button onClick={() => setFilterProd('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}>×</button>
                            </span>
                        )}

                        {filterType && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '12px',
                                fontSize: '12px'
                            }}>
                                {filterType}
                                <button onClick={() => setFilterType('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}>×</button>
                            </span>
                        )}

                        {filterDate && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '12px',
                                fontSize: '12px'
                            }}>
                                {filterDate}
                                <button onClick={() => setFilterDate('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}>×</button>
                            </span>
                        )}

                        {!filterLocation && !filterProd && !filterType && !filterDate && !filterSearch && (
                            <span style={{ color: '#6c757d' }}>None</span>
                        )}

                        <span style={{ marginLeft: '6px', color: '#6c757d', fontSize: '12px' }}>
                            ({filteredData.length} of {invenReport.length})
                        </span>
                    </div>

                    <button
                        onClick={clearAllFilters}
                        style={{
                            padding: "6px 12px",
                            backgroundColor: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                        }}
                    >
                        Clear All
                    </button>
                </div>

                {/* Enhanced Responsive Table */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    border: '1px solid #e9ecef'
                }}>
                    <div style={{ overflowX: 'auto', maxHeight: '55vh' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '13px',
                            minWidth: '1000px'
                        }}>
                            <thead style={{
                                position: 'sticky',
                                top: 0,
                                zIndex: 10,
                                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                color: 'white'
                            }}>
                                <tr>
                                    <th style={{
                                        padding: '14px 12px',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        fontSize: '12px',
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        Product Code
                                    </th>
                                    <th style={{
                                        padding: '14px 12px',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        fontSize: '12px',
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase'
                                    }}>
                                        Description
                                    </th>
                                    <th style={{
                                        padding: '14px 12px',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        fontSize: '12px',
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        Type
                                    </th>
                                    <th style={{
                                        padding: '14px 12px',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        fontSize: '12px',
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        Past Balance
                                    </th>
                                    <th style={{
                                        padding: '14px 12px',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        fontSize: '12px',
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        Quantity
                                    </th>
                                    <th style={{
                                        padding: '14px 12px',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        fontSize: '12px',
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        Current Balance
                                    </th>
                                    <th style={{
                                        padding: '14px 12px',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        fontSize: '12px',
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        Date
                                    </th>
                                    <th style={{
                                        padding: '14px 12px',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        fontSize: '12px',
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        Time
                                    </th>
                                    <th style={{
                                        padding: '14px 12px',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        fontSize: '12px',
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        Done By
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((p, i) => (
                                        <tr key={i} style={{
                                            borderBottom: '1px solid #e9ecef',
                                            transition: 'background 0.2s',
                                            backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8f9fa'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#ffffff' : '#f8f9fa'}
                                        >
                                            <td style={{
                                                padding: '12px',
                                                fontWeight: '600',
                                                color: '#2c3e50'
                                            }}>{p.product_name}</td>
                                            <td style={{
                                                padding: '12px',
                                                color: '#495057'
                                            }}>{p.description}</td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'center'
                                            }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    backgroundColor: 
                                                        p.type === 'Stock In' || p.type === 'Transfer In' ? '#d4edda' : 
                                                        p.type === 'Sales' || p.type === 'Transfer Out' ? '#f8d7da' : 
                                                        '#fff3cd',
                                                    color: 
                                                        p.type === 'Stock In' || p.type === 'Transfer In' ? '#155724' : 
                                                        p.type === 'Sales' || p.type === 'Transfer Out' ? '#721c24' : 
                                                        '#856404',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {/* {p.type === 'Stock In' && '+ '}
                                                    {p.type === 'Transfer In' && '+ '}
                                                    {p.type === 'Sales' && '− '}
                                                    {p.type === 'Transfer Out' && '− '} */}
                                                    {p.type}
                                                </span>
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'center',
                                                fontWeight: '600',
                                                fontFamily: 'monospace',
                                                color: '#495057'
                                            }}>{p.past_balance}</td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'center',
                                                fontWeight: '700',
                                                fontFamily: 'monospace',
                                                color: 
                                                    p.type === 'Stock In' || p.type === 'Transfer In' ? '#28a745' : 
                                                    p.type === 'Sales' || p.type === 'Transfer Out' ? '#dc3545' : 
                                                    '#495057',
                                                fontSize: '14px'
                                            }}>
                                                {(p.type === 'Stock In' || p.type === 'Transfer In') && '+'}
                                                {(p.type === 'Sales' || p.type === 'Transfer Out') && '−'}
                                                {p.qty}
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'center',
                                                fontWeight: '600',
                                                fontFamily: 'monospace',
                                                color: '#495057'
                                            }}>{p.current_balance}</td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'center',
                                                color: '#495057',
                                                fontSize: '12px'
                                            }}>{p.date}</td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'center',
                                                color: '#6c757d',
                                                fontFamily: 'monospace',
                                                fontSize: '12px'
                                            }}>{p.time}</td>
                                            <td style={{
                                                padding: '12px',
                                                color: '#495057',
                                                fontSize: '12px'
                                            }}>{`${p.fname || ''} ${p.mname || ''} ${p.lname || ''}`.trim()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" style={{
                                            textAlign: 'center',
                                            padding: '40px 20px',
                                            color: '#6c757d'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}>
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                                                    <path d="M9 11l3 3L22 4"/>
                                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                                </svg>
                                                <div style={{ fontWeight: '500', fontSize: '14px' }}>
                                                    {invenReport.length === 0 ? 'No inventory records found' : 'No records match the current filters'}
                                                </div>
                                                {filteredData.length === 0 && invenReport.length > 0 && (
                                                    <button
                                                        onClick={clearAllFilters}
                                                        style={{
                                                            marginTop: '10px',
                                                            padding: '8px 16px',
                                                            backgroundColor: '#28a745',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        Clear Filters
                                                    </button>
                                                )}
                                            </div>
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
                        marginTop: '20px',
                        paddingBottom: '20px'
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

            {/* Mobile Responsive Styles */}
            <style jsx>{`
                @media (max-width: 768px) {
                    .customer-main {
                        padding: 10px !important;
                    }
                    
                    table {
                        font-size: 11px !important;
                    }
                    
                    th, td {
                        padding: 8px 6px !important;
                    }
                    
                    th {
                        font-size: 10px !important;
                    }
                }
                
                @media (max-width: 480px) {
                    table {
                        font-size: 10px !important;
                    }
                    
                    th, td {
                        padding: 6px 4px !important;
                    }
                }
            `}</style>
        </>
    );
};

export default InventoryLedgerAdmin;