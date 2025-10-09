'use client';
import React from 'react';
import "../../css/user.css";
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import CustomPagination from '@/app/Components/Pagination/pagination';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ITEMS_PER_PAGE = 11;

const Audit = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const [message, setMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [bgVisible, setBgVisible] = useState(true);
    const [addUserVisible, setAddUserVisible] = useState(true);
    const [viewUserVisible, setViewUserVisible] = useState(true);
    const [editUserVisible, setEditUserVisible] = useState(true);
    const [mainSize, setMainSize] = useState('720px');
    const [maxH, setMaxH] = useState('80%');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Filter states
    const [userFilter, setUserFilter] = useState('');
    const [activityFilter, setActivityFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [specificDate, setSpecificDate] = useState('');
    const [specificMonth, setSpecificMonth] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    // Arrays
    const [userList, setUserList] = useState([]);
    const [roleList, setRoleList] = useState([]);
    const [locationList, setLocationList] = useState([]);

    // Get unique users and activities for filters
    const uniqueUsers = [...new Set(userList.map(log => `${log.fname} ${log.mname} ${log.lname}`))].filter(Boolean);
    const uniqueActivities = [...new Set(userList.map(log => log.activity))].filter(Boolean);

    // Helper function to safely parse dates
    const isValidDate = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    };

    // Filter the audit log data
    const filteredLogs = userList.filter(log => {
        // User filter
        if (userFilter) {
            const fullName = `${log.fname} ${log.mname} ${log.lname}`;
            if (fullName !== userFilter) {
                return false;
            }
        }

        // Activity filter
        if (activityFilter && log.activity !== activityFilter) {
            return false;
        }

        // Date filters with error handling
        if (dateFilter === 'daily' && specificDate) {
            if (!isValidDate(log.date) || !isValidDate(specificDate)) {
                return false;
            }
            try {
                const logDate = new Date(log.date).toDateString();
                const filterDate = new Date(specificDate).toDateString();
                if (logDate !== filterDate) {
                    return false;
                }
            } catch (error) {
                console.error('Date comparison error:', error);
                return false;
            }
        }

        if (dateFilter === 'monthly' && specificMonth) {
            if (!isValidDate(log.date)) {
                return false;
            }
            try {
                const logMonth = new Date(log.date).toISOString().slice(0, 7);
                if (logMonth !== specificMonth) {
                    return false;
                }
            } catch (error) {
                console.error('Month comparison error:', error);
                return false;
            }
        }

        // Search filter
        if (searchFilter) {
            const searchTerm = searchFilter.toLowerCase();
            const fullName = `${log.fname} ${log.mname} ${log.lname}`.toLowerCase();
            const activity = (log.activity || '').toLowerCase();
            
            if (!fullName.includes(searchTerm) && !activity.includes(searchTerm)) {
                return false;
            }
        }

        return true;
    });

    // Pagination for filtered data
    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [userFilter, activityFilter, dateFilter, specificDate, specificMonth, searchFilter]);

    // Account inputs (keeping for compatibility)
    const [userID_, ssetUserID_] = useState('');
    const [f_name, setF_name] = useState('');
    const [m_name, setM_name] = useState('');
    const [l_name, setL_name] = useState('');
    const [user_name, setUser_name] = useState('');
    const [password_, setPassword_] = useState('');
    const [phonne_, setPhone_] = useState('');
    const [email_, setEmail_] = useState('');
    const [address_, setAddress_] = useState('');
    const [bdate_, setBdate_] = useState('');
    const [dateCreated_, setDateCreated_] = useState('');
    const [status_, setStatus_] = useState('');
    const [role_, setRole_] = useState('');
    const [roleID_, setRoleID_] = useState('');
    const [roleValue_, setRoleValue_] = useState('');
    const [location_, setLocation_] = useState('');
    const [locationID_, setLocationID_] = useState('');
    const [locationValue_, setLocationValue_] = useState('');

    useEffect(() => {
        const ua = navigator.userAgent;
        if (ua.includes("Edg")) {
            setMainSize('720px');
            setMaxH('80%');
        } else if (ua.includes("Chrome")) {
            setMainSize('680px');
            setMaxH('79%');
        }
    }, []);

    useEffect(() => {
        GetUser();
        GetLocation();
        GetRole();
    }, []);

    const GetRole = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'GetDropDown.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetRole"
                }
            });
            setRoleList(response.data);
        } catch (error) {
            console.error("Error fetching role list:", error);
        }
    }

    const GetLocation = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'GetDropDown.php';

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
    }

    const GetUser = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'audit-log.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetLogs"
                }
            });
            console.log(response.data);
            setUserList(response.data);
        } catch (error) {
            console.error("Error fetching user list:", error);
        }
    }

    const clearAllFilters = () => {
        setUserFilter('');
        setActivityFilter('');
        setDateFilter('');
        setSpecificDate('');
        setSpecificMonth('');
        setSearchFilter('');
    };

    const removeFilter = (filterType) => {
        switch (filterType) {
            case 'user':
                setUserFilter('');
                break;
            case 'activity':
                setActivityFilter('');
                break;
            case 'date':
                setDateFilter('');
                setSpecificDate('');
                setSpecificMonth('');
                break;
            case 'search':
                setSearchFilter('');
                break;
        }
    };

    const exportToExcel = () => {
        // Use filtered data for export instead of all data
        const dataToExport = filteredLogs.map((p) => ({
            User: `${p.fname} ${p.mname} ${p.lname}`,
            Activity: p.activity,
            Date: p.date,
            Time: p.time
        }));

        // Create worksheet with filtered data
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        
        // Create a workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Audit Logs");

        // Generate filename with filter info
        let filename = "AuditLogs";
        if (userFilter || activityFilter || dateFilter || searchFilter) {
            filename += "_Filtered";
        }
        if (specificDate) {
            filename += `_${specificDate}`;
        }
        if (specificMonth) {
            filename += `_${specificMonth}`;
        }
        filename += ".xlsx";

        // Generate Excel file and trigger download
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, filename);
    };

    // Keep existing functions for compatibility
    const resetForm = () => {
        setF_name('');
        setM_name('');
        setL_name('');
        setUser_name('');
        setPassword_('');
        setPhone_('');
        setEmail_('');
        setAddress_('');
        setBdate_('');
        setRole_('');
        setLocation_('');
        setRoleID_('');
    };

    const close_modal = () => {
        resetForm();
        setBgVisible(true);
        setAddUserVisible(true);
        setViewUserVisible(true);
        setEditUserVisible(true);
    }

    const register_account = async () => {
        // Keep existing function for compatibility
    }

    const GetUserDetials = async (user_id) => {
        // Keep existing function for compatibility
    }

    const UpdateUser = async (e) => {
        // Keep existing function for compatibility
    }

    const role_change = (e) => {
        // Keep existing function for compatibility
    };

    const location_change = (e) => {
        // Keep existing function for compatibility
    };

    const triggerModal = (operation, id, e) => {
        // Keep existing function for compatibility
    }

    return (
        <>
            <Modal show={show} onHide={handleClose} size='sm'>
                <Modal.Header closeButton >
                    <Modal.Title >{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    {message}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='black-bg-cust'
                onClick={close_modal}
                hidden={bgVisible} ></div>

            <div className='customer-main' >
                <div className='customer-header'>
                    <h1 className='h-customer'>AUDIT LOGS</h1>
                    <button
                        className='add-cust-bttn'
                        onClick={exportToExcel}
                    >
                        Export to Excel 📑
                    </button>
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
                        {/* User Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by User
                            </label>
                            <select
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Users</option>
                                {uniqueUsers.map((user, index) => (
                                    <option key={index} value={user}>
                                        {user}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Activity Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Activity
                            </label>
                            <select
                                value={activityFilter}
                                onChange={(e) => setActivityFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Activities</option>
                                {uniqueActivities.map((activity, index) => (
                                    <option key={index} value={activity}>
                                        {activity}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter Type */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Date Filter
                            </label>
                            <select
                                value={dateFilter}
                                onChange={(e) => {
                                    setDateFilter(e.target.value);
                                    setSpecificDate('');
                                    setSpecificMonth('');
                                }}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Dates</option>
                                <option value="daily">Daily Logs</option>
                                <option value="monthly">Monthly Logs</option>
                            </select>
                        </div>

                        {/* Specific Date Input */}
                        {dateFilter === 'daily' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    value={specificDate}
                                    onChange={(e) => setSpecificDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                        )}

                        {/* Specific Month Input */}
                        {dateFilter === 'monthly' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                    Select Month
                                </label>
                                <input
                                    type="month"
                                    value={specificMonth}
                                    onChange={(e) => setSpecificMonth(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                        )}

                        {/* Search Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Search Logs
                            </label>
                            <input
                                type="text"
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                placeholder="Search by user or activity"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Log Count Summary */}
                <div style={{
                    padding: '15px',
                    backgroundColor: '#e8f5e8',
                    borderRadius: '8px',
                    margin: '10px 0',
                    border: '1px solid #c3e6c3',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <span style={{ fontSize: '18px', fontWeight: '600', color: '#155724' }}>
                            Total Logs: {filteredLogs.length}
                        </span>
                        <span style={{ marginLeft: '15px', fontSize: '14px', color: '#6c757d' }}>
                            ({filteredLogs.length} of {userList.length} records)
                        </span>
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

                        {userFilter && (
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
                                User: {userFilter}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('user')}
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
                                    title="Remove user filter"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </span>
                        )}

                        {activityFilter && (
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
                                Activity: {activityFilter}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('activity')}
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
                                    title="Remove activity filter"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </span>
                        )}

                        {dateFilter && (
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
                                {dateFilter === 'daily' && specificDate && `Daily: ${new Date(specificDate).toLocaleDateString()}`}
                                {dateFilter === 'monthly' && specificMonth && `Monthly: ${new Date(specificMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`}
                                {dateFilter && !specificDate && !specificMonth && `${dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)} Logs`}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('date')}
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
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </span>
                        )}

                        {searchFilter && (
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
                                Search: "{searchFilter}"
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
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </span>
                        )}

                        {!userFilter && !activityFilter && !dateFilter && !searchFilter && (
                            <span style={{ color: '#6c757d' }}>None</span>
                        )}
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

                <div className='tableContainer' style={{ height: '35vh', overflowY: 'auto' }}>
                    {currentItems && currentItems.length > 0 ? (
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th className='t2'>USER</th>
                                    <th className='t2'>ACTIVITY</th>
                                    <th className='th1'>DATE</th>
                                    <th className='th1'>TIME</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((p, i) => (
                                    <tr className='table-row' key={i}>
                                        <td className='td-name'>{p.fname} {p.mname} {p.lname}</td>
                                        <td className='td-name'>{p.activity}</td>
                                        <td style={{textAlign: 'center'}}>{p.date}</td>
                                        <td style={{textAlign: 'center'}}>{p.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            textAlign: 'center',
                            color: '#6c757d',
                            padding: '40px 20px'
                        }}>
                            <div style={{
                                fontSize: '48px',
                                marginBottom: '20px',
                                opacity: 0.3
                            }}>
                                📋
                            </div>
                            <h4 style={{
                                color: '#495057',
                                marginBottom: '10px',
                                fontWeight: '500'
                            }}>
                                {userList.length === 0 ? 'No audit logs available' : 'No logs match the current filters'}
                            </h4>
                            <p style={{
                                margin: '0',
                                fontSize: '14px',
                                maxWidth: '300px',
                                lineHeight: '1.4'
                            }}>
                                {userList.length === 0
                                    ? 'Audit logs will appear here once user activities are recorded.'
                                    : 'Try adjusting your filters to see more results.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && currentItems && currentItems.length > 0 && (
                    <div style={{ justifySelf: 'center', marginTop: '20px' }}>
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
    )
}

export default Audit;