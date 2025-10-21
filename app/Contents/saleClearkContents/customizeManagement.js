'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import CustomPagination from '@/app/Components/Pagination/pagination';

const ITEMS_PER_PAGE = 6;
const ITEMS_PER_PAGE_DETAILS = 5;

const CustomizeManagementSC = () => {
    // Core state variables
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    
    // Data states
    const [customizeSales, setCustomizeSales] = useState([]);
    const [customizeRequest, setCustomizeRequest] = useState([]);
    const [semiDetails, setSemiDetails] = useState([]);
    const [fullDetails, setFullDetails] = useState([]);
    const [customizeTracking, setCustomizeTracking] = useState([]);
    const [invoiceRecords, setInvoiceRecords] = useState([]);
    
    // Filter states
    const [customerFilter, setCustomerFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');
    
    // Expanded customer cards
    const [expandedCustomers, setExpandedCustomers] = useState([]);
    
    // Modal states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [showConfirmDeliveryModal, setShowConfirmDeliveryModal] = useState(false);
    
    // Selected items
    const [selectedSale, setSelectedSale] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedTracking, setSelectedTracking] = useState([]);
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    
    // Archive state
    const [deliveredToCustomer, setDeliveredToCustomer] = useState([]);
    
    // Payment form
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [paymentNotes, setPaymentNotes] = useState('');
    
    // Delivery form
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState('');
    
    // Alert state
    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    
    // Progress steps
    const steps = ["Pending", "On Going", "On Delivery", "Delivered", "Completed"];
    
    // Helper functions
    const getBaseURL = () => sessionStorage.getItem('baseURL') || '';
    
    // Date and Time Formatting Functions
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };
    
    const formatTime = (timeString) => {
        if (!timeString) return '';
        // Convert 24-hour format to 12-hour format with AM/PM
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };
    
    const formatDateTime = (dateString, timeString) => {
        if (!dateString) return '';
        const formattedDate = formatDate(dateString);
        const formattedTime = timeString ? formatTime(timeString) : '';
        return formattedTime ? `${formattedDate} at ${formattedTime}` : formattedDate;
    };
    
    const formatCurrency = (amount) => {
        return `₱${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    
    const handleError = (error, context) => {
        console.error(`Error ${context}:`, error);
        setMessage(`Error occurred while ${context}. Please try again.`);
        setAlertVariant('danger');
        setAlertBG('#dc7a80');
        setAlert1(true);
        setTimeout(() => setAlert1(false), 3000);
    };
    
    const showSuccess = (msg) => {
        setMessage(msg);
        setAlertVariant('success');
        setAlertBG('#7adc80');
        setAlert1(true);
        setTimeout(() => setAlert1(false), 3000);
    };
    
    // Group sales by customer
    const customerGroupedData = useMemo(() => {
        const enrichedSales = customizeSales.map(sale => {
            const request = customizeRequest.find(req => req.customize_sales_id === sale.customize_sales_id);
            const semiItems = semiDetails.filter(item => item.customize_sales_id === sale.customize_sales_id);
            const fullItems = fullDetails.filter(item => item.customize_sales_id === sale.customize_sales_id);
            const invoices = invoiceRecords.filter(inv => inv.invoice_id === sale.invoice_id);
            
            let requestStatus = 'No Request';
            let trackingProgress = [];
            
            if (request) {
                requestStatus = request.status;
                trackingProgress = customizeTracking
                    .filter(track => track.customize_request_id === request.customize_req_id)
                    .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
            }
            
            // Check if this sale has been delivered to customer
            const isDeliveredToCustomer = deliveredToCustomer.some(
                delivered => delivered.customize_sales_id === sale.customize_sales_id
            );
            
            return {
                ...sale,
                request,
                semiItems,
                fullItems,
                invoices,
                requestStatus,
                trackingProgress,
                isCompleted: requestStatus === 'Completed',
                hasBalance: parseFloat(sale.balance) > 0,
                isDeliveredToCustomer
            };
        });
        
        // Filter out items that have been delivered to customer (archived)
        const activeOnly = enrichedSales.filter(sale => !sale.isDeliveredToCustomer);
        
        // Group by customer
        const grouped = activeOnly.reduce((acc, sale) => {
            const customerId = sale.cust_id;
            if (!acc[customerId]) {
                acc[customerId] = {
                    customerId: customerId,
                    customerName: sale.cust_name,
                    sales: [],
                    totalAmount: 0,
                    totalPaid: 0,
                    totalBalance: 0,
                    totalOrders: 0
                };
            }
            
            acc[customerId].sales.push(sale);
            acc[customerId].totalAmount += parseFloat(sale.total_price || 0);
            acc[customerId].totalPaid += parseFloat(sale.down_payment || 0);
            acc[customerId].totalBalance += parseFloat(sale.balance || 0);
            acc[customerId].totalOrders += 1;
            
            return acc;
        }, {});
        
        return Object.values(grouped);
    }, [customizeSales, customizeRequest, semiDetails, fullDetails, invoiceRecords, customizeTracking, deliveredToCustomer]);
    
    // Get archived sales (delivered to customer)
    const archivedSales = useMemo(() => {
        return customizeSales
            .map(sale => {
                const request = customizeRequest.find(req => req.customize_sales_id === sale.customize_sales_id);
                const semiItems = semiDetails.filter(item => item.customize_sales_id === sale.customize_sales_id);
                const fullItems = fullDetails.filter(item => item.customize_sales_id === sale.customize_sales_id);
                const invoices = invoiceRecords.filter(inv => inv.invoice_id === sale.invoice_id);
                
                const deliveryInfo = deliveredToCustomer.find(
                    delivered => delivered.customize_sales_id === sale.customize_sales_id
                );
                
                return {
                    ...sale,
                    request,
                    semiItems,
                    fullItems,
                    invoices,
                    deliveryInfo
                };
            })
            .filter(sale => 
                deliveredToCustomer.some(
                    delivered => delivered.customize_sales_id === sale.customize_sales_id
                )
            );
    }, [customizeSales, customizeRequest, semiDetails, fullDetails, invoiceRecords, deliveredToCustomer]);
    
    // Apply filters
    const filteredCustomers = useMemo(() => {
        let filtered = [...customerGroupedData];
        
        if (customerFilter) {
            filtered = filtered.filter(customer => 
                customer.customerName?.toLowerCase().includes(customerFilter.toLowerCase())
            );
        }
        
        if (statusFilter) {
            filtered = filtered.filter(customer => 
                customer.sales.some(sale => sale.requestStatus === statusFilter)
            );
        }
        
        if (searchFilter) {
            const search = searchFilter.toLowerCase();
            filtered = filtered.filter(customer =>
                customer.customerName?.toLowerCase().includes(search) ||
                customer.sales.some(sale => 
                    sale.invoice_id?.toString().includes(search) ||
                    sale.customize_type?.toLowerCase().includes(search)
                )
            );
        }
        
        return filtered;
    }, [customerGroupedData, customerFilter, statusFilter, searchFilter]);
    
    // Pagination
    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    // Get unique values for filters
    const getUniqueCustomers = () => {
        const customers = [...new Set(customizeSales.map(item => item.cust_name).filter(Boolean))];
        return customers.sort();
    };
    
    // Toggle customer expansion
    const toggleCustomerExpansion = (customerId) => {
        setExpandedCustomers(prev => {
            if (prev.includes(customerId)) {
                return prev.filter(id => id !== customerId);
            } else {
                return [...prev, customerId];
            }
        });
    };
    
    // API Functions
    const GetCustomizeSales = async () => {
        const locationID = sessionStorage.getItem('location_id') || '';
        const url = `${getBaseURL()}customizeProducts.php`;
        const ID = { locID: locationID };
        
        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetCustomizeSales"
                }
            });
            
            setCustomizeSales(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            handleError(error, 'fetching customize sales');
            setCustomizeSales([]);
        }
    };
    
    const GetCustomizeRequests = async () => {
        const url = `${getBaseURL()}customizeProducts.php`;
        const locationID = sessionStorage.getItem('location_id') || '';
        const ID = {
            locID: locationID,
            requestType: 'From'
        };
        
        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetCustomizeRequest"
                }
            });
            
            setCustomizeRequest(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            handleError(error, 'fetching customize requests');
            setCustomizeRequest([]);
        }
    };
    
    const GetSemiDetails = async () => {
        const url = `${getBaseURL()}customizeProducts.php`;
        try {
            const response = await axios.get(url, {
                params: { 
                    json: JSON.stringify([]), 
                    operation: "GetCustomizeRequestDetailSemi" 
                }
            });
            setSemiDetails(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            handleError(error, 'fetching semi details');
            setSemiDetails([]);
        }
    };
    
    const GetFullDetails = async () => {
        const url = `${getBaseURL()}customizeProducts.php`;
        try {
            const response = await axios.get(url, {
                params: { 
                    json: JSON.stringify([]), 
                    operation: "GetCustomizeRequestDetailFull" 
                }
            });
            setFullDetails(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            handleError(error, 'fetching full details');
            setFullDetails([]);
        }
    };
    
    const GetCustomizeTracking = async () => {
        const url = `${getBaseURL()}customizeProducts.php`;
        try {
            const response = await axios.get(url, {
                params: { 
                    json: JSON.stringify([]), 
                    operation: "GetCustomizeTracking" 
                }
            });
            setCustomizeTracking(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            handleError(error, 'fetching tracking data');
            setCustomizeTracking([]);
        }
    };
    
    const GetInvoiceRecords = async () => {
        const url = `${getBaseURL()}sales.php`;
        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "SalesByInvoice"
                }
            });
            
            setInvoiceRecords(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            handleError(error, 'fetching invoice records');
            setInvoiceRecords([]);
        }
    };
    
    const RecordPayment = async () => {
        if (!selectedSale || !paymentAmount) {
            handleError(null, 'recording payment - missing data');
            return;
        }
        
        const url = `${getBaseURL()}customizeProducts.php`;
        const paymentData = {
            customize_sales_id: selectedSale.customize_sales_id,
            invoice_id: selectedSale.invoice_id,
            amount: paymentAmount,
            payment_method: paymentMethod,
            notes: paymentNotes,
            account_id: user_id
        };
        
        try {
            const response = await axios.post(url, {
                json: JSON.stringify(paymentData),
                operation: "RecordPayment"
            });
            
            if (response.data.success) {
                showSuccess('Payment recorded successfully');
                setShowPaymentModal(false);
                resetPaymentForm();
                GetCustomizeSales();
                GetInvoiceRecords();
            }
        } catch (error) {
            handleError(error, 'recording payment');
        }
    };
    
    const ScheduleDelivery = async () => {
        if (!selectedSale || !deliveryAddress || !deliveryDate) {
            handleError(null, 'scheduling delivery - missing data');
            return;
        }
        
        const url = `${getBaseURL()}customizeProducts.php`;
        const deliveryData = {
            customize_sales_id: selectedSale.customize_sales_id,
            address: deliveryAddress,
            delivery_date: deliveryDate,
            notes: deliveryNotes,
            account_id: user_id
        };
        
        try {
            const response = await axios.post(url, {
                json: JSON.stringify(deliveryData),
                operation: "ScheduleDelivery"
            });
            
            if (response.data.success) {
                showSuccess('Delivery scheduled successfully');
                setShowDeliveryModal(false);
                resetDeliveryForm();
                GetCustomizeSales();
                GetCustomizeRequests();
            }
        } catch (error) {
            handleError(error, 'scheduling delivery');
        }
    };
    
    const ConfirmDeliveryToCustomer = async () => {
        if (!selectedSale) return;
        
        const deliveryData = {
            customize_sales_id: selectedSale.customize_sales_id,
            invoice_id: selectedSale.invoice_id,
            customer_name: selectedSale.cust_name,
            delivery_date: new Date().toISOString().split('T')[0],
            delivery_time: new Date().toTimeString().split(' ')[0],
            status: 'Delivered To Customer'
        };
        
        // Add to delivered list
        setDeliveredToCustomer(prev => [...prev, deliveryData]);
        
        showSuccess('Order marked as delivered to customer and archived');
        setShowConfirmDeliveryModal(false);
        setSelectedSale(null);
    };
    
    // Reset forms
    const resetPaymentForm = () => {
        setPaymentAmount('');
        setPaymentMethod('Cash');
        setPaymentNotes('');
    };
    
    const resetDeliveryForm = () => {
        setDeliveryAddress('');
        setDeliveryDate('');
        setDeliveryNotes('');
    };
    
    // Event handlers
    const handleRecordPayment = (sale) => {
        setSelectedSale(sale);
        setPaymentAmount('');
        setShowPaymentModal(true);
    };
    
    const handleTrackRequest = (sale) => {
        setSelectedSale(sale);
        setSelectedRequest(sale.request);
        setSelectedTracking(sale.trackingProgress);
        setShowTrackingModal(true);
    };
    
    const handleViewInvoices = (sale) => {
        setSelectedSale(sale);
        setSelectedInvoices(sale.invoices);
        setShowInvoiceModal(true);
    };
    
    const handleDeliverToCustomer = (sale) => {
        setSelectedSale(sale);
        setShowDeliveryModal(true);
    };
    
    const clearAllFilters = () => {
        setCustomerFilter('');
        setStatusFilter('');
        setSearchFilter('');
        setCurrentPage(1);
    };
    
    // Get progress percentage
    const getProgressPercentage = (status) => {
        const index = steps.indexOf(status);
        return index >= 0 ? ((index + 1) / steps.length) * 100 : 0;
    };
    
    // Effects
    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id') || '');
        setLocation_id(sessionStorage.getItem('location_id') || '');
    }, []);
    
    useEffect(() => {
        if (location_id) {
            GetCustomizeSales();
            GetCustomizeRequests();
            GetSemiDetails();
            GetFullDetails();
            GetCustomizeTracking();
            GetInvoiceRecords();
        }
    }, [location_id]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [customerFilter, statusFilter, searchFilter]);
    
    return (
        <>
            <Alert
                variant={alertVariant}
                show={alert1}
                style={{ 
                    backgroundColor: alertBG, 
                    position: 'fixed', 
                    top: 20, 
                    right: 20, 
                    zIndex: 9999 
                }}
            >
                {message}
            </Alert>
            
            {/* Main Content */}
            <div className='customer-main'>
                <div className='customer-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className='h-customer'>CUSTOMIZATION MANAGEMENT</h1>
                    <button
                        onClick={() => setShowArchiveModal(true)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        📦 DELIVERED ARCHIVE ({archivedSales.length})
                    </button>
                </div>
                
                {/* Filters Section */}
                <div style={{
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                Customer
                            </label>
                            <select
                                value={customerFilter}
                                onChange={(e) => setCustomerFilter(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '8px', 
                                    borderRadius: '4px', 
                                    border: '1px solid #ced4da' 
                                }}
                            >
                                <option value="">All Customers</option>
                                {getUniqueCustomers().map((customer, index) => (
                                    <option key={index} value={customer}>{customer}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                Request Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '8px', 
                                    borderRadius: '4px', 
                                    border: '1px solid #ced4da' 
                                }}
                            >
                                <option value="">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="On Going">On Going</option>
                                <option value="On Delivery">On Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                Search
                            </label>
                            <input
                                type="text"
                                placeholder="Search customer, invoice..."
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '8px', 
                                    borderRadius: '4px', 
                                    border: '1px solid #ced4da' 
                                }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginTop: '15px', 
                        paddingTop: '15px', 
                        borderTop: '1px solid #dee2e6' 
                    }}>
                        <div style={{ fontSize: '14px', color: '#6c757d' }}>
                            Showing {filteredCustomers.length} of {customerGroupedData.length} customers
                        </div>
                        <button 
                            onClick={clearAllFilters} 
                            style={{ 
                                padding: '6px 12px', 
                                backgroundColor: '#6c757d', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer' 
                            }}
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>
                
                {/* Customer Cards */}
                <div style={{ padding: '10px' }}>
                    {currentItems.map((customer, index) => {
                        const isExpanded = expandedCustomers.includes(customer.customerId);
                        
                        return (
                            <div
                                key={index}
                                style={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    backgroundColor: 'white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    marginBottom: '20px'
                                }}
                            >
                                {/* Customer Header */}
                                <div 
                                    style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        marginBottom: isExpanded ? '20px' : '0'
                                    }}
                                    onClick={() => toggleCustomerExpansion(customer.customerId)}
                                >
                                    <div>
                                        <h4 style={{ margin: 0, fontWeight: 'bold' }}>
                                            {customer.customerName}
                                        </h4>
                                        <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                                            {customer.totalOrders} Order(s) • Total: {formatCurrency(customer.totalAmount)}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '14px', color: '#666' }}>Balance</div>
                                            <div style={{ 
                                                fontSize: '18px', 
                                                fontWeight: 'bold',
                                                color: customer.totalBalance > 0 ? '#dc3545' : '#28a745'
                                            }}>
                                                {formatCurrency(customer.totalBalance)}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: '24px',
                                            color: '#666',
                                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s'
                                        }}>
                                            ▼
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Customer Sales Details */}
                                {isExpanded && (
                                    <div style={{ 
                                        borderTop: '1px solid #e0e0e0', 
                                        paddingTop: '20px' 
                                    }}>
                                        {customer.sales.map((sale, saleIndex) => {
                                            const progressPercentage = getProgressPercentage(sale.requestStatus);
                                            
                                            return (
                                                <div 
                                                    key={saleIndex}
                                                    style={{
                                                        padding: '15px',
                                                        backgroundColor: '#f8f9fa',
                                                        borderRadius: '8px',
                                                        marginBottom: '15px'
                                                    }}
                                                >
                                                    {/* Sale Header */}
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between',
                                                        marginBottom: '15px'
                                                    }}>
                                                        <div>
                                                            <h6 style={{ margin: 0, fontWeight: 'bold' }}>
                                                                Invoice #{sale.invoice_id}
                                                            </h6>
                                                            <p style={{ margin: '2px 0', fontSize: '13px', color: '#666' }}>
                                                                {sale.date} • {sale.time}
                                                            </p>
                                                            <p style={{ margin: '2px 0', fontSize: '13px' }}>
                                                                {sale.customize_type}
                                                            </p>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span style={{
                                                                padding: '4px 12px',
                                                                borderRadius: '20px',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',
                                                                backgroundColor: sale.status === 'Paid' ? '#28a745' : '#ffc107',
                                                                color: 'white'
                                                            }}>
                                                                {sale.status}
                                                            </span>
                                                            <div style={{ marginTop: '5px', fontSize: '13px' }}>
                                                                Status: {sale.requestStatus}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Payment Info */}
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                                        gap: '10px',
                                                        padding: '10px',
                                                        backgroundColor: 'white',
                                                        borderRadius: '4px',
                                                        marginBottom: '15px'
                                                    }}>
                                                        <div>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>Total</div>
                                                            <div style={{ fontWeight: 'bold' }}>₱{parseFloat(sale.total_price).toLocaleString()}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>Paid</div>
                                                            <div style={{ fontWeight: 'bold' }}>₱{parseFloat(sale.down_payment).toLocaleString()}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>Balance</div>
                                                            <div style={{ 
                                                                fontWeight: 'bold',
                                                                color: parseFloat(sale.balance) > 0 ? '#dc3545' : '#28a745'
                                                            }}>
                                                                ₱{parseFloat(sale.balance).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>Quantity</div>
                                                            <div style={{ fontWeight: 'bold' }}>{sale.total_qty} item(s)</div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Progress Bar */}
                                                    {sale.request && (
                                                        <div style={{ marginBottom: '15px' }}>
                                                            <div style={{ 
                                                                display: 'flex', 
                                                                justifyContent: 'space-between', 
                                                                marginBottom: '5px' 
                                                            }}>
                                                                <span style={{ fontSize: '12px', color: '#666' }}>
                                                                    Request Progress
                                                                </span>
                                                                <span style={{ fontSize: '12px', color: '#666' }}>
                                                                    {Math.round(progressPercentage)}%
                                                                </span>
                                                            </div>
                                                            <div style={{
                                                                width: '100%',
                                                                height: '6px',
                                                                backgroundColor: '#e0e0e0',
                                                                borderRadius: '3px',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <div style={{
                                                                    width: `${progressPercentage}%`,
                                                                    height: '100%',
                                                                    backgroundColor: progressPercentage === 100 ? '#28a745' : '#007bff',
                                                                    transition: 'width 0.3s ease'
                                                                }} />
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Items Summary */}
                                                    {(sale.semiItems?.length > 0 || sale.fullItems?.length > 0) && (
                                                        <div style={{ 
                                                            marginBottom: '15px',
                                                            padding: '10px',
                                                            backgroundColor: 'white',
                                                            borderRadius: '4px'
                                                        }}>
                                                            <h6 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                                                                Order Items
                                                            </h6>
                                                            {sale.semiItems?.map((item, i) => (
                                                                <div key={`semi-${i}`} style={{ 
                                                                    fontSize: '13px', 
                                                                    marginBottom: '5px',
                                                                    paddingLeft: '10px',
                                                                    borderLeft: '3px solid #007bff'
                                                                }}>
                                                                    <strong>{item.product_name}</strong> - {item.description}<br/>
                                                                    <small>Modifications: {item.modifications}</small>
                                                                </div>
                                                            ))}
                                                            {sale.fullItems?.map((item, i) => (
                                                                <div key={`full-${i}`} style={{ 
                                                                    fontSize: '13px', 
                                                                    marginBottom: '5px',
                                                                    paddingLeft: '10px',
                                                                    borderLeft: '3px solid #28a745'
                                                                }}>
                                                                    <strong>Custom:</strong> {item.description}<br/>
                                                                    <small>{item.additional_description}</small>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Action Buttons */}
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        flexWrap: 'wrap',
                                                        gap: '8px'
                                                    }}>
                                                        {sale.hasBalance && (
                                                            <button
                                                                onClick={() => handleRecordPayment(sale)}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    backgroundColor: '#28a745',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    fontSize: '12px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                Record Payment
                                                            </button>
                                                        )}
                                                        
                                                        {sale.request && (
                                                            <button
                                                                onClick={() => handleTrackRequest(sale)}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    backgroundColor: '#17a2b8',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    fontSize: '12px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                Track Request
                                                            </button>
                                                        )}
                                                        
                                                        <button
                                                            onClick={() => handleViewInvoices(sale)}
                                                            style={{
                                                                padding: '6px 12px',
                                                                backgroundColor: '#6c757d',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            View Invoices
                                                        </button>
                                                        
                                                        {sale.isCompleted && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleDeliverToCustomer(sale)}
                                                                    style={{
                                                                        padding: '6px 12px',
                                                                        backgroundColor: '#fd7e14',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        fontSize: '12px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    Schedule Delivery
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedSale(sale);
                                                                        setShowConfirmDeliveryModal(true);
                                                                    }}
                                                                    style={{
                                                                        padding: '6px 12px',
                                                                        backgroundColor: '#28a745',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        fontSize: '12px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    Mark as Delivered
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {currentItems.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.3 }}>👥</div>
                            <h4 style={{ color: '#495057', marginBottom: '10px' }}>No customers found</h4>
                            <p style={{ color: '#6c757d' }}>Try adjusting your filters or add new customization orders.</p>
                        </div>
                    )}
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
                            onPageChange={(page) => setCurrentPage(page)}
                            color="#007bff"
                        />
                    </div>
                )}
            </div>
            
            {/* Payment Modal */}
            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Record Payment - Invoice #{selectedSale?.invoice_id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedSale && (
                        <>
                            <div style={{ 
                                padding: '15px', 
                                backgroundColor: '#f8f9fa', 
                                borderRadius: '8px', 
                                marginBottom: '20px' 
                            }}>
                                <div style={{ marginBottom: '10px' }}>
                                    <strong>Customer:</strong> {selectedSale.cust_name}
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <strong>Total Amount:</strong> {formatCurrency(selectedSale.total_price)}
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <strong>Paid Amount:</strong> {formatCurrency(selectedSale.down_payment)}
                                </div>
                                <div>
                                    <strong>Remaining Balance:</strong> 
                                    <span style={{ color: '#dc3545', fontWeight: 'bold', marginLeft: '5px' }}>
                                        {formatCurrency(selectedSale.balance)}
                                    </span>
                                </div>
                            </div>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    Payment Amount *
                                </label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    max={selectedSale.balance}
                                    placeholder="Enter payment amount"
                                    style={{ 
                                        width: '100%', 
                                        padding: '8px', 
                                        border: '1px solid #ced4da', 
                                        borderRadius: '4px' 
                                    }}
                                />
                            </div>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    Payment Method
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    style={{ 
                                        width: '100%', 
                                        padding: '8px', 
                                        border: '1px solid #ced4da', 
                                        borderRadius: '4px' 
                                    }}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Check">Check</option>
                                    <option value="GCash">GCash</option>
                                    <option value="Credit Card">Credit Card</option>
                                </select>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={paymentNotes}
                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                    placeholder="Enter payment notes..."
                                    rows="3"
                                    style={{ 
                                        width: '100%', 
                                        padding: '8px', 
                                        border: '1px solid #ced4da', 
                                        borderRadius: '4px' 
                                    }}
                                />
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="success" 
                        onClick={RecordPayment}
                        disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                    >
                        Record Payment
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Confirm Delivery to Customer Modal */}
            <Modal show={showConfirmDeliveryModal} onHide={() => setShowConfirmDeliveryModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delivery to Customer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedSale && (
                        <>
                            <div style={{ 
                                padding: '15px', 
                                backgroundColor: '#d4edda', 
                                borderRadius: '8px', 
                                marginBottom: '20px' 
                            }}>
                                <h5 style={{ marginBottom: '15px', color: '#155724' }}>
                                    Confirm Final Delivery
                                </h5>
                                <p style={{ marginBottom: '10px' }}>
                                    Are you sure this order has been delivered to the customer?
                                </p>
                                <div style={{ marginBottom: '5px' }}>
                                    <strong>Customer:</strong> {selectedSale.cust_name}
                                </div>
                                <div style={{ marginBottom: '5px' }}>
                                    <strong>Invoice:</strong> #{selectedSale.invoice_id}
                                </div>
                                <div style={{ marginBottom: '5px' }}>
                                    <strong>Total Amount:</strong> {formatCurrency(selectedSale.total_price)}
                                </div>
                                <div>
                                    <strong>Balance:</strong> {formatCurrency(selectedSale.balance)}
                                </div>
                            </div>
                            <div style={{ 
                                padding: '10px', 
                                backgroundColor: '#fff3cd', 
                                borderRadius: '4px',
                                border: '1px solid #ffc107'
                            }}>
                                <small style={{ color: '#856404' }}>
                                    ⚠️ This action will move the order to the delivered archive and remove it from the active orders list.
                                </small>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmDeliveryModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="success" 
                        onClick={ConfirmDeliveryToCustomer}
                    >
                        Confirm Delivery
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Archive Modal - Delivered to Customer */}
            <Modal show={showArchiveModal} onHide={() => setShowArchiveModal(false)} size='xl'>
                <Modal.Header closeButton>
                    <Modal.Title>Delivered to Customer - Archive</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ 
                        padding: '15px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '8px', 
                        marginBottom: '20px' 
                    }}>
                        <h5>Completed Deliveries ({archivedSales.length})</h5>
                        <p style={{ margin: 0, color: '#6c757d' }}>
                            These orders have been successfully delivered to customers.
                        </p>
                    </div>
                    
                    {archivedSales.length > 0 ? (
                        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            {archivedSales.map((sale, index) => (
                                <div
                                    key={index}
                                    style={{
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        marginBottom: '15px',
                                        backgroundColor: '#f8fff9'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                        <div>
                                            <h6 style={{ margin: 0, fontWeight: 'bold' }}>
                                                Invoice #{sale.invoice_id}
                                            </h6>
                                            <p style={{ margin: '5px 0', fontSize: '14px' }}>
                                                <strong>Customer:</strong> {sale.cust_name}
                                            </p>
                                            <p style={{ margin: '5px 0', fontSize: '13px', color: '#666' }}>
                                                Order Date: {formatDateTime(sale.date, sale.time)}
                                            </p>
                                            {sale.deliveryInfo && (
                                                <p style={{ margin: '5px 0', fontSize: '13px', color: '#28a745' }}>
                                                    Delivered: {formatDateTime(sale.deliveryInfo.delivery_date, sale.deliveryInfo.delivery_time)}
                                                </p>
                                            )}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: '#28a745',
                                                color: 'white'
                                            }}>
                                                ✓ Delivered
                                            </span>
                                            <div style={{ marginTop: '10px' }}>
                                                <div style={{ fontSize: '14px', color: '#666' }}>Total</div>
                                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                                    {formatCurrency(sale.total_price)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ 
                                        borderTop: '1px solid #e0e0e0', 
                                        paddingTop: '10px',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                        gap: '10px',
                                        fontSize: '13px'
                                    }}>
                                        <div>
                                            <strong>Type:</strong> {sale.customize_type}
                                        </div>
                                        <div>
                                            <strong>Quantity:</strong> {sale.total_qty} item(s)
                                        </div>
                                        <div>
                                            <strong>Payment:</strong> {sale.status}
                                        </div>
                                        <div>
                                            <strong>Processed by:</strong> {sale.doneFname} {sale.doneLname}
                                        </div>
                                    </div>
                                    
                                    {/* Items Summary */}
                                    {(sale.semiItems?.length > 0 || sale.fullItems?.length > 0) && (
                                        <div style={{ 
                                            marginTop: '15px',
                                            padding: '10px',
                                            backgroundColor: 'white',
                                            borderRadius: '4px'
                                        }}>
                                            <h6 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>
                                                Delivered Items:
                                            </h6>
                                            {sale.semiItems?.map((item, i) => (
                                                <div key={`semi-${i}`} style={{ fontSize: '12px', marginBottom: '5px' }}>
                                                    • {item.product_name} - {item.description}
                                                </div>
                                            ))}
                                            {sale.fullItems?.map((item, i) => (
                                                <div key={`full-${i}`} style={{ fontSize: '12px', marginBottom: '5px' }}>
                                                    • Custom: {item.description}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.3 }}>📦</div>
                            <h4 style={{ color: '#495057', marginBottom: '10px' }}>
                                No Delivered Orders Yet
                            </h4>
                            <p style={{ color: '#6c757d' }}>
                                Orders marked as delivered to customers will appear here.
                            </p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ fontSize: '14px', color: '#6c757d' }}>
                            Total Archived: {archivedSales.length} order(s)
                        </div>
                        <Button variant="secondary" onClick={() => setShowArchiveModal(false)}>
                            Close
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
            
            {/* Tracking Modal */}
            <Modal show={showTrackingModal} onHide={() => setShowTrackingModal(false)} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Request Tracking - Invoice #{selectedSale?.invoice_id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRequest && (
                        <>
                            <div style={{ 
                                padding: '15px', 
                                backgroundColor: '#f8f9fa', 
                                borderRadius: '8px', 
                                marginBottom: '20px' 
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div><strong>Request ID:</strong> #{selectedRequest.customize_req_id}</div>
                                    <div><strong>Status:</strong> {selectedRequest.status}</div>
                                    <div><strong>From:</strong> {selectedRequest.reqFrom}</div>
                                    <div><strong>To:</strong> {selectedRequest.reqTo}</div>
                                </div>
                            </div>
                            
                            <div style={{ position: 'relative', paddingLeft: '40px' }}>
                                {steps.map((step, index) => {
                                    const trackingItem = selectedTracking.find(t => t.status === step);
                                    const isActive = selectedTracking.some(t => t.status === step);
                                    
                                    return (
                                        <div key={index} style={{ 
                                            position: 'relative', 
                                            paddingBottom: index < steps.length - 1 ? '40px' : '0' 
                                        }}>
                                            {index < steps.length - 1 && (
                                                <div style={{
                                                    position: 'absolute',
                                                    left: '-25px',
                                                    top: '25px',
                                                    width: '3px',
                                                    height: '100%',
                                                    backgroundColor: isActive ? '#28a745' : '#e0e0e0'
                                                }} />
                                            )}
                                            
                                            <div style={{
                                                position: 'absolute',
                                                left: '-32px',
                                                top: '5px',
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '50%',
                                                backgroundColor: isActive ? '#28a745' : '#e0e0e0',
                                                border: '3px solid white',
                                                boxShadow: '0 0 0 2px ' + (isActive ? '#28a745' : '#e0e0e0')
                                            }} />
                                            
                                            <div style={{
                                                padding: '15px',
                                                backgroundColor: isActive ? '#f8fff9' : '#f8f9fa',
                                                borderRadius: '8px',
                                                border: '1px solid ' + (isActive ? '#28a745' : '#e0e0e0'),
                                                opacity: isActive ? 1 : 0.6
                                            }}>
                                                <h6 style={{ 
                                                    margin: '0 0 8px 0', 
                                                    fontWeight: 'bold', 
                                                    color: isActive ? '#28a745' : '#666' 
                                                }}>
                                                    {step}
                                                </h6>
                                                {trackingItem && (
                                                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                                                        {formatDateTime(trackingItem.date, trackingItem.time)}
                                                    </p>
                                                )}
                                                {!trackingItem && (
                                                    <p style={{ 
                                                        margin: '4px 0', 
                                                        fontSize: '13px', 
                                                        color: '#999', 
                                                        fontStyle: 'italic' 
                                                    }}>
                                                        Pending...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTrackingModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Invoice Records Modal */}
            <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Invoice Records - #{selectedSale?.invoice_id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedInvoices?.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                                        Invoice ID
                                    </th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                                        Date
                                    </th>
                                   
                                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedInvoices.map((invoice, i) => (
                                    <tr key={i}>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                                            #{invoice.invoice_id}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                                            {formatDateTime(invoice.date, invoice.time)}
                                        </td>
                                        
                                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                                            {formatCurrency(invoice.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            <h5>No invoice records found</h5>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Delivery Modal */}
            <Modal show={showDeliveryModal} onHide={() => setShowDeliveryModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Schedule Delivery - Invoice #{selectedSale?.invoice_id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedSale && (
                        <>
                            <div style={{ 
                                padding: '15px', 
                                backgroundColor: '#d4edda', 
                                borderRadius: '8px', 
                                marginBottom: '20px' 
                            }}>
                                <div style={{ marginBottom: '10px' }}>
                                    <strong>Customer:</strong> {selectedSale.cust_name}
                                </div>
                                <div>
                                    <strong>Item is available in store and ready for delivery</strong>
                                </div>
                            </div>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    Delivery Address *
                                </label>
                                <textarea
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    placeholder="Enter delivery address..."
                                    rows="3"
                                    style={{ 
                                        width: '100%', 
                                        padding: '8px', 
                                        border: '1px solid #ced4da', 
                                        borderRadius: '4px' 
                                    }}
                                />
                            </div>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    Delivery Date *
                                </label>
                                <input
                                    type="date"
                                    value={deliveryDate}
                                    onChange={(e) => setDeliveryDate(e.target.value)}
                                    style={{ 
                                        width: '100%', 
                                        padding: '8px', 
                                        border: '1px solid #ced4da', 
                                        borderRadius: '4px' 
                                    }}
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    Delivery Notes (Optional)
                                </label>
                                <textarea
                                    value={deliveryNotes}
                                    onChange={(e) => setDeliveryNotes(e.target.value)}
                                    placeholder="Enter delivery instructions or notes..."
                                    rows="3"
                                    style={{ 
                                        width: '100%', 
                                        padding: '8px', 
                                        border: '1px solid #ced4da', 
                                        borderRadius: '4px' 
                                    }}
                                />
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeliveryModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="warning" 
                        onClick={ScheduleDelivery}
                        disabled={!deliveryAddress || !deliveryDate}
                    >
                        Schedule Delivery
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CustomizeManagementSC;