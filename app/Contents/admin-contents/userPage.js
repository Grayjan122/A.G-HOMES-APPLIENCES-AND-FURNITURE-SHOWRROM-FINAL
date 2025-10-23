'use client';
import React from 'react';
import "../../css/user.css";
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const ITEMS_PER_PAGE = 9;

// Status Indicator Component
const StatusIndicator = ({ status }) => {
    const isOnline = status === 'Online';

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        }}>
            <div
                style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: isOnline ? '#28a745' : '#6c757d',
                    border: `2px solid ${isOnline ? '#1e7e34' : '#5a6268'}`,
                    boxShadow: isOnline ? '0 0 6px rgba(40, 167, 69, 0.4)' : 'none',
                    flexShrink: 0
                }}
            />
            <span style={{
                fontSize: '13px',
                color: isOnline ? '#28a745' : '#6c757d',
                fontWeight: '600'
            }}>
                {status}
            </span>
        </div>
    );
};

const User = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);

    const [message, setMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [bgVisible, setBgVisible] = useState(true);

    const [addUserVisible, setAddUserVisible] = useState(true);
    const [viewUserVisible, setViewUserVisible] = useState(true);
    const [editUserVisible, setEditUserVisible] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Filter states
    const [roleFilter, setRoleFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    // Sorting states
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');

    //arrays
    const [userList, setUserList] = useState([]);
    const [roleList, setRoleList] = useState([]);
    const [locationList, setLocationList] = useState([]);

    //account inputs
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

    // Sort function for users
    const handleSort = (field) => {
        let direction = 'asc';
        if (sortField === field && sortDirection === 'asc') {
            direction = 'desc';
        }

        setSortField(field);
        setSortDirection(direction);
        setCurrentPage(1);
    };

    // Get unique status values
    const uniqueStatuses = [...new Set(userList.map(user => user.status))].filter(Boolean);

    // Filter and sort the user data
    const filteredAndSortedUsers = useMemo(() => {
        let filtered = userList.filter(user => {
            if (roleFilter && user.role_id != roleFilter) {
                return false;
            }

            if (locationFilter && user.location_id != locationFilter) {
                return false;
            }

            if (statusFilter && user.status !== statusFilter) {
                return false;
            }

            if (searchFilter) {
                const searchTerm = searchFilter.toLowerCase();
                const fullName = `${user.fname} ${user.mname} ${user.lname}`.toLowerCase();
                const username = (user.username || '').toLowerCase();
                const email = (user.email || '').toLowerCase();

                if (!fullName.includes(searchTerm) &&
                    !username.includes(searchTerm) &&
                    !email.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });

        if (sortField) {
            filtered = [...filtered].sort((a, b) => {
                let aVal, bVal;

                switch (sortField) {
                    case 'fullName':
                        aVal = `${a.fname} ${a.mname} ${a.lname}`.toLowerCase();
                        bVal = `${b.fname} ${b.mname} ${b.lname}`.toLowerCase();
                        break;
                    default:
                        aVal = a[sortField];
                        bVal = b[sortField];
                        break;
                }

                if (typeof aVal === 'string') {
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
    }, [userList, roleFilter, locationFilter, statusFilter, searchFilter, sortField, sortDirection]);

    // Pagination for filtered data
    const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredAndSortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [roleFilter, locationFilter, statusFilter, searchFilter, sortField, sortDirection]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || typeof window === 'undefined') return;
        
        // Check if baseURL is available before fetching
        const baseURL = sessionStorage.getItem('baseURL');
        if (!baseURL) {
            console.warn("userPage: Waiting for baseURL to be set in sessionStorage");
            // Retry after a short delay
            const retryTimer = setTimeout(() => {
                const retryBaseURL = sessionStorage.getItem('baseURL');
                if (retryBaseURL) {
                    const fetchData = async () => {
                        await GetUser();
                        await GetLocation();
                        await GetRole();
                    };
                    fetchData();
                } else {
                    console.error("userPage: baseURL still not available after retry");
                }
            }, 500);
            return () => clearTimeout(retryTimer);
        }
        
        const fetchData = async () => {
            await GetUser();
            await GetLocation();
            await GetRole();
        };
        
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted]);

    const GetRole = async () => {
        const baseURL = typeof window !== 'undefined' ? sessionStorage.getItem('baseURL') : null;
        if (!baseURL) {
            console.error("GetRole: baseURL is not available");
            return;
        }
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
            console.error("URL:", url);
            console.error("Error details:", error.message);
        }
    }

    const GetLocation = async () => {
        const baseURL = typeof window !== 'undefined' ? sessionStorage.getItem('baseURL') : null;
        if (!baseURL) {
            console.error("GetLocation: baseURL is not available");
            return;
        }
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
            console.error("URL:", url);
            console.error("Error details:", error.message);
        }
    }

    const GetUser = async () => {
        const baseURL = typeof window !== 'undefined' ? sessionStorage.getItem('baseURL') : null;
        if (!baseURL) {
            console.error("GetUser: baseURL is not available");
            return;
        }
        const url = baseURL + 'users.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetUsers"
                }
            });
            console.log(response.data);
            
            setUserList(response.data);
        } catch (error) {
            console.error("Error fetching user list:", error);
            console.error("URL:", url);
            console.error("Error details:", error.message);
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
            }
        }
    }

    const register_account = async () => {
        // Validate without username and password (they'll set it up via email)
        if (
            !f_name.trim() ||
            !m_name.trim() ||
            !l_name.trim() ||
            !phonne_.trim() ||
            !email_.trim() ||
            !address_.trim() ||
            !bdate_.trim() ||
            !role_.trim() ||
            !location_.trim()
        ) {
            
            showAlertError({
                icon: "warning",
                title: "Incomplete Account Details!",
                text: 'Please fill all the required details!',
                button: 'Try Again'
            });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email_)) {
            showAlertError({
                icon: "warning",
                title: "Invalid Email!",
                text: 'Please enter a valid email address!',
                button: 'Try Again'
            });
            return;
        }

        const baseURL = typeof window !== 'undefined' ? sessionStorage.getItem('baseURL') : null;
        if (!baseURL) {
            showAlertError({
                icon: "error",
                title: "Connection Error!",
                text: 'Unable to connect to the server. Please try again.',
                button: 'OK'
            });
            return;
        }
        const url = baseURL + 'users.php';
        const accountDetails = {
            fName: f_name,
            mName: m_name,
            lName: l_name,
            roleID: role_,
            email: email_,
            address: address_,
            phone: phonne_,
            birthDate: bdate_,
            locationID: location_
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(accountDetails),
                    operation: "AddUser"
                }
            });

            if (response.data === 'Success') {
                GetUser();
                resetForm();
                close_modal();

                AlertSucces(
                    "New user created! Setup email has been sent to " + email_,
                    "success",
                    true,
                    'Okay'
                );
            } else if (response.data === 'EmailExists') {
                showAlertError({
                    icon: "warning",
                    title: "Email Already Exists!",
                    text: 'This email is already registered in the system.',
                    button: 'Try Again'
                });
            } else {
                showAlertError({
                    icon: "warning",
                    title: "Oppsss!",
                    text: typeof response.data === 'string' ? response.data : 'Failed to add new user',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error adding new user", error);
            showAlertError({
                icon: "error",
                title: "Error!",
                text: 'An error occurred while adding the user.',
                button: 'Try Again'
            });
        }
    }

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

    const GetUserDetials = async (user_id) => {
        const baseURL = typeof window !== 'undefined' ? sessionStorage.getItem('baseURL') : null;
        if (!baseURL) return;
        const url = baseURL + 'users.php';

        const userId = {
            userID: user_id
        }
        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(userId),
                    operation: "GetUserDetails"
                }
            });

            ssetUserID_(response.data[0].account_id);
            setF_name(response.data[0].fname);
            setM_name(response.data[0].mname);
            setL_name(response.data[0].lname);
            setBdate_(response.data[0].birth_date);
            setEmail_(response.data[0].email);
            setAddress_(response.data[0].address);
            setPhone_(response.data[0].phone);
            setDateCreated_(response.data[0].date_created);
            setPassword_(response.data[0].user_password);
            setUser_name(response.data[0].username);
            setStatus_(response.data[0].status);
            setRole_(response.data[0].role_name);
            setRoleID_(response.data[0].role_id);
            setRoleValue_(response.data[0].role_name);
            setLocation_(response.data[0].location_name);
            setLocationValue_(response.data[0].location_name);
            setLocationID_(response.data[0].location_id);
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    }

    const UpdateUser = async (e) => {
        e.preventDefault();

        const baseURL = typeof window !== 'undefined' ? sessionStorage.getItem('baseURL') : null;
        if (!baseURL) return;
        const url = baseURL + 'users.php';
        const userDetails = {
            fname: f_name,
            lname: l_name,
            mname: m_name,
            bDate: bdate_,
            role: roleID_,
            location: locationID_,
            phone: phonne_,
            email: email_,
            address: address_,
            accountStatus: status_,
            accountID: userID_
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(userDetails),
                    operation: "UpdateUser"
                }
            });

            if (response.data == 'Success') {
                GetUser();
                close_modal();
                AlertSucces(
                    "User details is successfully updated",
                    "success",
                    true,
                    'Okay'
                );
            } else {
                showAlertError({
                    icon: "warning",
                    title: "Oppsss!",
                    text: 'response.data',
                    button: 'Okay'
                });

            }
        } catch (error) {
            console.error("Error updating user information:", error);
        }
    }

    const role_change = (e) => {
        const selectedRoleName = e.target.value;
        setRole_(selectedRoleName);
        const r = roleList.find(u => u.role_name === selectedRoleName);
        setRoleID_(r.role_id);
    };

    const location_change = (e) => {
        const selectedLocationName = e.target.value;
        setLocation_(selectedLocationName);
        const r = locationList.find(l => l.location_name === selectedLocationName);
        setLocationID_(r.location_id);
    };

    const triggerModal = (operation, id, e) => {
        switch (operation) {
            case 'addUserVisible':
                setAddUserVisible(false);
                break;
            case 'viewUser':
                GetUserDetials(id);
                setViewUserVisible(false);
                break;
            case 'editUserDetails':
                GetUserDetials(id);
                setEditUserVisible(false);
                break;
        }
    }

    const clearAllFilters = () => {
        setRoleFilter('');
        setLocationFilter('');
        setStatusFilter('');
        setSearchFilter('');
        setSortField('');
        setSortDirection('asc');
    };

    const removeFilter = (filterType) => {
        switch (filterType) {
            case 'role':
                setRoleFilter('');
                break;
            case 'location':
                setLocationFilter('');
                break;
            case 'status':
                setStatusFilter('');
                break;
            case 'search':
                setSearchFilter('');
                break;
        }
    };

    // Prevent hydration mismatch by only rendering after mount
    if (!isMounted) {
        return null; // Return null during SSR to prevent any rendering
    }

    // Check if baseURL is available before rendering the full component
    const baseURL = typeof window !== 'undefined' ? sessionStorage.getItem('baseURL') : null;
    if (!baseURL) {
        return (
            <div className='customer-main' style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '70vh'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        fontSize: '18px', 
                        color: '#007bff',
                        marginBottom: '10px'
                    }}>
                        Loading...
                    </div>
                </div>
            </div>
        );
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

            <Modal show={!addUserVisible} onHide={close_modal} size='lg' >
                <Modal.Header closeButton >
                    <Modal.Title >Add User</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body' >
                    <label className='add-cust-label-1'>*Name</label>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>First Name</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={f_name}
                            onChange={(e) => setF_name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Middle Name</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={m_name}
                            onChange={(e) => setM_name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Last Name</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={l_name}
                            onChange={(e) => setL_name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Birthdate</label>
                        <input
                            className='prod-name-input'
                            type='date'
                            value={bdate_}
                            onChange={(e) => setBdate_(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Role</label>
                        <select className='category-dropdown' onChange={(e) => setRole_(e.target.value)} value={role_}>
                            <option>Select Role</option>
                            {roleList.map((role) => (
                                <option key={role.role_id} value={role.role_id}>
                                    {role.role_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Store</label>
                        <select className='category-dropdown' onChange={(e) => setLocation_(e.target.value)} value={location_}>
                            <option>Select Location</option>
                            {locationList.map((r) => (
                                <option key={r.location_id} value={r.location_id}>
                                    {r.location_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Phone Number</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={phonne_}
                            onChange={(e) => setPhone_(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Email</label>
                        <input
                            type='email'
                            className='prod-name-input'
                            value={email_}
                            onChange={(e) => setEmail_(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Address</label>
                        <textarea
                            className='description-input'
                            value={address_}
                            onChange={(e) => setAddress_(e.target.value)}
                        />
                    </div>
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#e3f2fd',
                        borderLeft: '4px solid #2196f3',
                        borderRadius: '4px',
                        marginTop: '10px'
                    }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#1976d2', fontWeight: '500' }}>
                            ℹ️ Username & Password Setup
                        </p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#424242', lineHeight: '1.5' }}>
                            An email will be sent to the user with instructions to set up their own username and password.
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close_modal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={register_account}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={!viewUserVisible} onHide={close_modal} size='lg'>
                <Modal.Header closeButton >
                    <Modal.Title >User Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body' >
                    <div className='div-input-add-prod' style={{ paddingBottom: '20px' }}>
                        <label className='add-prod-label'>User ID</label>
                        <input
                            className='prod-name-input'
                            value={userID_}
                            disabled={true}
                        />
                    </div>
                    <label className='add-cust-label-1'>*Name</label>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>First Name</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            value={f_name}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Middle Name</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            value={m_name}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Last Name</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            value={l_name}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Birthdate</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            type='date'
                            value={bdate_}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Role</label>
                        <select className='drop-role' disabled={true}>
                            <option>{role_}</option>
                        </select>
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Store</label>
                        <select className='drop-role' disabled={true}>
                            <option>{location_}</option>
                        </select>
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Phone Number</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            type='number'
                            value={phonne_}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Email</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            value={email_}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Address</label>
                        <textarea
                            disabled={true}
                            className='description-input'
                            value={address_}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Username</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            value={user_name}
                        />
                    </div>
                  
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Date Created</label>
                        <select className='drop-role' disabled={true}>
                            <option>{dateCreated_}</option>
                        </select>
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Status</label>
                        <select className='drop-role' disabled={true}>
                            <option>{status_}</option>
                        </select>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={!editUserVisible} onHide={close_modal} size='lg'>
                <Modal.Header closeButton >
                    <Modal.Title >Edit User</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body' >
                    <label className='add-cust-label-1'>*Name</label>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>First Name</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={f_name}
                            onChange={(e) => setF_name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Middle Name</label>
                        <input
                            className='prod-name-input'
                            type='text'
                            value={m_name}
                            onChange={(e) => setM_name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Last Name</label>
                        <input
                            className='prod-name-input'
                            type='text'
                            value={l_name}
                            onChange={(e) => setL_name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Birthdate</label>
                        <input
                            className='prod-name-input'
                            type='date'
                            value={bdate_}
                            onChange={(e) => setBdate_(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Role</label>
                        <select className='category-dropdown' onChange={(e) => role_change(e)} value={role_}>
                            <option value="" disabled hidden>
                                {roleValue_}
                            </option>
                            {roleList.map((cat) => (
                                <option key={cat.role_id} value={cat.role_name}>
                                    {cat.role_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Location </label>
                        <select className='category-dropdown' onChange={(e) => location_change(e)} value={location_}>
                            <option value="" disabled hidden>
                                {locationValue_}
                            </option>
                            {locationList.map((cat) => (
                                <option key={cat.location_id} value={cat.location_name}>
                                    {cat.location_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Phone Number</label>
                        <input
                            className='prod-name-input'
                            type='text'
                            value={phonne_}
                            onChange={(e) => setPhone_(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Email</label>
                        <input
                            className='prod-name-input'
                            type='email'
                            value={email_}
                            onChange={(e) => setEmail_(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Address</label>
                        <textarea
                            className='description-input'
                            value={address_}
                            onChange={(e) => setAddress_(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Account Status</label>
                        <select className='drop-role' value={status_} onChange={(e) => setStatus_(e.target.value)}>
                            <option value={status_}>{status_}</option>
                            <option value={'Active'}>Active</option>
                            <option value={'Deactive'}>Deactive</option>
                            <option value={'Suspended'}>Suspended</option>
                        </select>
                    </div>
                    
                    {/* Status Warning Messages */}
                    {status_ === 'Deactive' && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffc107',
                            borderLeft: '4px solid #ffc107',
                            borderRadius: '4px',
                            marginTop: '10px'
                        }}>
                            <p style={{ 
                                margin: 0, 
                                fontSize: '14px', 
                                color: '#856404', 
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                ⚠️ Warning: Deactivated Account
                            </p>
                            <p style={{ 
                                margin: '8px 0 0 0', 
                                fontSize: '13px', 
                                color: '#856404', 
                                lineHeight: '1.5' 
                            }}>
                                This user will <strong>no longer have access</strong> to the system and <strong>cannot log in</strong>. 
                                Use this status when the user is no longer with the company or should be permanently removed from the system.
                            </p>
                        </div>
                    )}
                    
                    {status_ === 'Suspended' && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#f8d7da',
                            border: '1px solid #f5c6cb',
                            borderLeft: '4px solid #dc3545',
                            borderRadius: '4px',
                            marginTop: '10px'
                        }}>
                            <p style={{ 
                                margin: 0, 
                                fontSize: '14px', 
                                color: '#721c24', 
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                🚫 Account Suspended
                            </p>
                            <p style={{ 
                                margin: '8px 0 0 0', 
                                fontSize: '13px', 
                                color: '#721c24', 
                                lineHeight: '1.5' 
                            }}>
                                This user's access is <strong>temporarily suspended</strong> and they <strong>cannot log in</strong>. 
                                The account can be reactivated later by changing the status back to "Active".
                            </p>
                        </div>
                    )}
                    
                    {status_ === 'Active' && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#d4edda',
                            border: '1px solid #c3e6cb',
                            borderLeft: '4px solid #28a745',
                            borderRadius: '4px',
                            marginTop: '10px'
                        }}>
                            <p style={{ 
                                margin: 0, 
                                fontSize: '14px', 
                                color: '#155724', 
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                ✅ Active Account
                            </p>
                            <p style={{ 
                                margin: '8px 0 0 0', 
                                fontSize: '13px', 
                                color: '#155724', 
                                lineHeight: '1.5' 
                            }}>
                                This user has <strong>full access</strong> to the system and can log in normally.
                            </p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close_modal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={UpdateUser}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='customer-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>USER MANAGEMENT</h1>
                    <button className='add-cust-bttn' onClick={() => { triggerModal('addUserVisible', '0') }}>ADD USER+</button>
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
                        {/* Role Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Role
                            </label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Roles</option>
                                {roleList.map((role) => (
                                    <option key={role.role_id} value={role.role_id}>
                                        {role.role_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Location Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Store
                            </label>
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
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
                                    <option key={location.location_id} value={location.location_id}>
                                        {location.location_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Statuses</option>
                                {uniqueStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Search Users
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
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    placeholder="Search by name, username, or email..."
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px 8px 35px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />

                                {searchFilter && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchFilter('')}
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

                {/* Active Filters */}
                <div style={{
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    margin: '10px 0',
                    fontSize: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <strong>Active Filters:</strong>

                        {roleFilter && (
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
                                Role: {roleList.find(role => role.role_id === roleFilter)?.role_name || roleFilter}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('role')}
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
                                    title="Remove role filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {locationFilter && (
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
                                Store: {locationList.find(loc => loc.location_id === locationFilter)?.location_name || locationFilter}
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
                                    ×
                                </button>
                            </span>
                        )}

                        {statusFilter && (
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
                                Status: {statusFilter}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('status')}
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
                                    title="Remove status filter"
                                >
                                    ×
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
                                    ×
                                </button>
                            </span>
                        )}

                        {!roleFilter && !locationFilter && !statusFilter && !searchFilter && (
                            <span style={{ color: '#6c757d' }}>None</span>
                        )}

                        <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                            ({filteredAndSortedUsers.length} of {userList.length} users shown)
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

                {/* Sort Controls */}
                <div style={{
                    padding: '10px 15px',
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    margin: '10px 0',
                    border: '1px solid #e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    flexWrap: 'wrap'
                }}>
                    <strong style={{ fontSize: '14px' }}>Sort by:</strong>
                    <button
                        onClick={() => handleSort('fullName')}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: sortField === 'fullName' ? '#007bff' : '#f8f9fa',
                            color: sortField === 'fullName' ? 'white' : '#495057',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        Name {sortField === 'fullName' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => handleSort('role_name')}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: sortField === 'role_name' ? '#007bff' : '#f8f9fa',
                            color: sortField === 'role_name' ? 'white' : '#495057',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        Role {sortField === 'role_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => handleSort('location_name')}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: sortField === 'location_name' ? '#007bff' : '#f8f9fa',
                            color: sortField === 'location_name' ? 'white' : '#495057',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        Store {sortField === 'location_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </button>
                </div>

                {/* User Cards Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '20px',
                    padding: '10px 0',
                    minHeight: '400px'
                }}>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((user, i) => (
                            <div
                                key={i}
                                onClick={() => triggerModal('viewUser', user.account_id)}
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    border: '1px solid #e9ecef',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 123, 255, 0.15)';
                                    e.currentTarget.style.borderColor = '#007bff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                    e.currentTarget.style.borderColor = '#e9ecef';
                                }}
                            >
                                {/* Decorative Top Border */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: 'linear-gradient(90deg, #007bff 0%, #0056b3 100%)'
                                }}></div>

                                {/* Edit Button - Top Right */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        triggerModal('editUserDetails', user.account_id, e);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '15px',
                                        right: '15px',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        border: '2px solid #007bff',
                                        backgroundColor: 'white',
                                        color: '#007bff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s',
                                        fontSize: '16px',
                                        zIndex: 10
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#007bff';
                                        e.currentTarget.style.color = 'white';
                                        e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.color = '#007bff';
                                        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                                    }}
                                    title="Edit User"
                                >
                                    ✏️
                                </button>

                                {/* User Avatar and Name */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    marginBottom: '15px'
                                }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '24px',
                                        fontWeight: '600',
                                        flexShrink: 0
                                    }}>
                                        {user.fname.charAt(0).toUpperCase()}{user.lname.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{
                                            margin: 0,
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            color: '#2c3e50',
                                            marginBottom: '4px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {user.fname} {user.mname} {user.lname}
                                        </h3>
                                        <div style={{
                                            fontSize: '13px',
                                            color: '#6c757d',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            @{user.username}
                                        </div>
                                    </div>
                                </div>

                                {/* User Details */}
                                <div style={{ marginBottom: '15px' }}>
                                    {/* Role */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '10px',
                                        marginBottom: '10px',
                                        padding: '8px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '6px'
                                    }}>
                                        <div style={{
                                            color: '#007bff',
                                            marginTop: '2px',
                                            flexShrink: 0
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                            </svg>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#6c757d',
                                                marginBottom: '2px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Role
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#2c3e50',
                                                fontWeight: '600'
                                            }}>
                                                {user.role_name}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Store */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '10px',
                                        marginBottom: '10px',
                                        padding: '8px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '6px'
                                    }}>
                                        <div style={{
                                            color: '#007bff',
                                            marginTop: '2px',
                                            flexShrink: 0
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                                <polyline points="9 22 9 12 15 12 15 22" />
                                            </svg>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#6c757d',
                                                marginBottom: '2px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Store
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#2c3e50',
                                                fontWeight: '600',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {user.location_name}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '10px',
                                        padding: '8px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '6px'
                                    }}>
                                        <div style={{
                                            color: '#007bff',
                                            marginTop: '2px',
                                            flexShrink: 0
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#6c757d',
                                                marginBottom: '2px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Account Status
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#2c3e50',
                                                fontWeight: '600'
                                            }}>
                                                {user.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '15px',
                                    borderTop: '1px solid #e9ecef'
                                }}>
                                    <StatusIndicator status={user.active_status} />

                                    <div style={{
                                        fontSize: '12px',
                                        color: '#6c757d',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="16 12 12 8 8 12" />
                                            <line x1="12" y1="16" x2="12" y2="8" />
                                        </svg>
                                        Click to view details
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{
                            gridColumn: '1 / -1',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '400px',
                            textAlign: 'center',
                            color: '#6c757d',
                            padding: '40px 20px'
                        }}>
                            <div style={{
                                fontSize: '64px',
                                marginBottom: '20px',
                                opacity: 0.3
                            }}>
                                👥
                            </div>
                            <h4 style={{
                                color: '#495057',
                                marginBottom: '10px',
                                fontWeight: '500'
                            }}>
                                {userList.length === 0 ? 'No users available' : 'No users match the current filters'}
                            </h4>
                            <p style={{
                                margin: '0',
                                fontSize: '14px',
                                maxWidth: '300px',
                                lineHeight: '1.4'
                            }}>
                                {userList.length === 0
                                    ? 'Users will appear here once they are added to the system.'
                                    : 'Try adjusting your filters to see more results.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && currentItems && currentItems.length > 0 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '30px',
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
        </>
    )
}

export default User;