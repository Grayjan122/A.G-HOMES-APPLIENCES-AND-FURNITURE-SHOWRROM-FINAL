'use client';
import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const ITEMS_PER_PAGE = 8;

const SaleAdmin = () => {
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');

    const [salesByInvoice, setSalesByInvoice] = useState([]);
    const [locationList, setLocationList] = useState([]);

    // Filter states
    const [locationFilter, setLocationFilter] = useState('');
    const [salesFromFilter, setSalesFromFilter] = useState('');
    const [dateFilter, setDateFilter] = useState(''); // 'daily', 'monthly', or ''
    const [specificDate, setSpecificDate] = useState('');
    const [specificMonth, setSpecificMonth] = useState('');

    const [currentPage, setCurrentPage] = useState(1);

    // Report states
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportDateFrom, setReportDateFrom] = useState('');
    const [reportDateTo, setReportDateTo] = useState('');
    const [reportLocationFilter, setReportLocationFilter] = useState('');
    const [reportSalesTypeFilter, setReportSalesTypeFilter] = useState(''); // New filter
    const [reportData, setReportData] = useState([]);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportType, setReportType] = useState('date_range'); // 'date_range' or 'monthly'
    const [reportMonth, setReportMonth] = useState('');

    // Function to categorize sales type
    const categorizeSalesType = (salesFrom) => {
        if (!salesFrom) return 'Other';
        const salesFromLower = salesFrom.toLowerCase();
        
        if (salesFromLower === 'walk-in sales' || salesFromLower === 'customer sales') {
            return 'Full Payment Sales';
        } else if (salesFromLower === 'installment payment' || salesFromLower === 'installment downpayment') {
            return 'Installment Sales';
        }
        return salesFrom; // Keep original if doesn't match categories
    };

    // Get unique sales from values with categorization
    const uniqueSalesFrom = [...new Set(salesByInvoice.map(sale => sale.sales_from))].filter(Boolean);
    const salesTypeOptions = [
        { value: 'Full Payment Sales', label: 'Full Payment Sales' },
        { value: 'Installment Sales', label: 'Installment Sales' },
        ...uniqueSalesFrom
            .filter(source => {
                const lower = source.toLowerCase();
                return !(lower === 'walk-in sales' || lower === 'customer sales' || 
                        lower === 'installment payment' || lower === 'installment downpayment');
            })
            .map(source => ({ value: source, label: source }))
    ];

    // Sort sales by date and time in descending order (newest first)
    const sortedSales = [...salesByInvoice].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB - dateA; // Descending order
    });

    // Filter the sales data
    const filteredSales = sortedSales.filter(sale => {
        // Location filter
        if (locationFilter && sale.location_id != locationFilter) {
            return false;
        }

        // Sales from filter with categorization
        if (salesFromFilter) {
            const saleCategory = categorizeSalesType(sale.sales_from);
            if (salesFromFilter === 'Full Payment Sales' || salesFromFilter === 'Installment Sales') {
                if (saleCategory !== salesFromFilter) {
                    return false;
                }
            } else if (sale.sales_from !== salesFromFilter) {
                return false;
            }
        }

        // Date filters
        if (dateFilter === 'daily' && specificDate) {
            const saleDate = new Date(sale.date).toDateString();
            const filterDate = new Date(specificDate).toDateString();
            if (saleDate !== filterDate) {
                return false;
            }
        }

        if (dateFilter === 'monthly' && specificMonth) {
            const saleMonth = new Date(sale.date).toISOString().slice(0, 7); // YYYY-MM format
            if (saleMonth !== specificMonth) {
                return false;
            }
        }

        return true;
    });

    // Calculate total sales for filtered data
    const totalSales = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.amount || 0), 0);

    // Pagination for filtered data
    const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));

        GetLocation();
        GetSalesByInvoice();
    }, []);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [locationFilter, salesFromFilter, dateFilter, specificDate, specificMonth]);

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

    const GetSalesByInvoice = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const response = await axios.get(`${baseURL}sales.php`, {
                params: {
                    json: JSON.stringify([]),
                    operation: "SalesByInvoice"
                }
            });
            setSalesByInvoice(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching sales invoice:", error);
        }
    };

    const clearAllFilters = () => {
        setLocationFilter('');
        setSalesFromFilter('');
        setDateFilter('');
        setSpecificDate('');
        setSpecificMonth('');
    };

    const removeFilter = (filterType) => {
        switch (filterType) {
            case 'location':
                setLocationFilter('');
                break;
            case 'salesFrom':
                setSalesFromFilter('');
                break;
            case 'date':
                setDateFilter('');
                setSpecificDate('');
                setSpecificMonth('');
                break;
        }
    };

    // Report Functions
    const generateReport = () => {
        // Validation based on report type
        if (reportType === 'date_range') {
            if (!reportDateFrom || !reportDateTo) {
                showAlertError({
                    icon: "error",
                    title: "Opss!",
                    text: 'Please select both start and end dates for the report.',
                    button: 'Okay'
                });
                return;
            }

            if (new Date(reportDateFrom) > new Date(reportDateTo)) {
                showAlertError({
                    icon: "error",
                    title: "Opss!",
                    text: 'Start date cannot be later than end date.',
                    button: 'Okay'
                });
                return;
            }
        } else if (reportType === 'monthly') {
            if (!reportMonth) {
                showAlertError({
                    icon: "error",
                    title: "Opss!",
                    text: 'Please select a month for the report.',
                    button: 'Okay'
                });
                return;
            }
        }

        setIsGeneratingReport(true);

        // Filter sales data based on report type
        const reportSales = sortedSales.filter(sale => {
            const saleDate = new Date(sale.date);
            let inDateRange = false;

            if (reportType === 'date_range') {
                const fromDate = new Date(reportDateFrom);
                const toDate = new Date(reportDateTo);

                // Set time to start and end of day for proper comparison
                fromDate.setHours(0, 0, 0, 0);
                toDate.setHours(23, 59, 59, 999);

                inDateRange = saleDate >= fromDate && saleDate <= toDate;
            } else if (reportType === 'monthly') {
                const saleMonth = saleDate.toISOString().slice(0, 7); // YYYY-MM format
                inDateRange = saleMonth === reportMonth;
            }

            // Check location filter
            const locationMatch = reportLocationFilter === '' || sale.location_id === reportLocationFilter;

            // Check sales type filter
            let salesTypeMatch = true;
            if (reportSalesTypeFilter) {
                const saleCategory = categorizeSalesType(sale.sales_from);
                if (reportSalesTypeFilter === 'Full Payment Sales' || reportSalesTypeFilter === 'Installment Sales') {
                    salesTypeMatch = saleCategory === reportSalesTypeFilter;
                } else {
                    salesTypeMatch = sale.sales_from === reportSalesTypeFilter;
                }
            }

            return inDateRange && locationMatch && salesTypeMatch;
        });

        // Group sales by location and sales_from, with categorization
        const groupedData = reportSales.reduce((acc, sale) => {
            const locationName = locationList.find(loc => loc.location_id === sale.location_id)?.location_name || 'Unknown Location';
            const salesCategory = categorizeSalesType(sale.sales_from);
            
            const key = `${locationName}_${salesCategory}`;

            if (!acc[key]) {
                acc[key] = {
                    location: locationName,
                    salesFrom: salesCategory,
                    totalAmount: 0,
                    totalTransactions: 0,
                    transactions: []
                };
            }

            acc[key].totalAmount += parseFloat(sale.amount || 0);
            acc[key].totalTransactions += 1;
            acc[key].transactions.push(sale);

            return acc;
        }, {});

        // Calculate date range for monthly reports
        let dateRangeForReport;
        if (reportType === 'monthly') {
            const firstDay = reportMonth + '-01';
            const lastDay = new Date(new Date(firstDay).getFullYear(), new Date(firstDay).getMonth() + 1, 0).toISOString().slice(0, 10);
            dateRangeForReport = { from: firstDay, to: lastDay };
        } else {
            dateRangeForReport = { from: reportDateFrom, to: reportDateTo };
        }

        setReportData({
            sales: reportSales,
            grouped: Object.values(groupedData),
            totalSales: reportSales.reduce((sum, sale) => sum + parseFloat(sale.amount || 0), 0),
            totalTransactions: reportSales.length,
            dateRange: dateRangeForReport,
            locationFilter: reportLocationFilter,
            salesTypeFilter: reportSalesTypeFilter,
            reportType: reportType,
            reportMonth: reportMonth
        });

        setIsGeneratingReport(false);
    };

    const printReport = () => {
        const printWindow = window.open('', '_blank');
        const locationFilterText = reportLocationFilter
            ? locationList.find(loc => loc.location_id === reportLocationFilter)?.location_name || 'Selected Location'
            : 'All Locations';

        const salesTypeFilterText = reportData.salesTypeFilter || 'All Sales Types';

        const periodText = reportData.reportType === 'monthly'
            ? `Month: ${new Date(reportData.dateRange.from).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`
            : `Period: ${new Date(reportData.dateRange.from).toLocaleDateString()} - ${new Date(reportData.dateRange.to).toLocaleDateString()}`;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sales Report - ${reportData.reportType === 'monthly' ? new Date(reportData.dateRange.from).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : reportData.dateRange.from + ' to ' + reportData.dateRange.to}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        color: #333; 
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 30px; 
                        border-bottom: 2px solid #007bff;
                        padding-bottom: 15px;
                    }
                    .summary { 
                        background-color: #f8f9fa; 
                        padding: 15px; 
                        border-radius: 8px; 
                        margin-bottom: 20px; 
                        border-left: 4px solid #28a745;
                    }
                    .summary-item { 
                        margin: 8px 0; 
                        font-size: 16px;
                    }
                    .group-section { 
                        margin: 20px 0; 
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    .group-header { 
                        background-color: #007bff; 
                        color: white; 
                        padding: 12px 15px; 
                        font-weight: bold;
                        font-size: 18px;
                    }
                    .group-content { 
                        padding: 15px; 
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 10px;
                    }
                    th, td { 
                        border: 1px solid #dee2e6; 
                        padding: 8px 12px; 
                        text-align: left; 
                    }
                    th { 
                        background-color: #f8f9fa; 
                        font-weight: bold;
                    }
                    .total-row { 
                        background-color: #e8f5e8; 
                        font-weight: bold; 
                    }
                    .print-date { 
                        text-align: right; 
                        color: #6c757d; 
                        font-size: 12px; 
                        margin-top: 20px; 
                    }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>A.G HOMES SALES REPORT</h1>
                    <h3>${periodText}</h3>
                    <h4>Location: ${locationFilterText}</h4>
                    <h4>Sales Type: ${salesTypeFilterText}</h4>
                </div>
                
                <div class="summary">
                    <h3 style="margin-top: 0; color: #28a745;">Summary</h3>
                    <div class="summary-item"><strong>Location Filter:</strong> ${locationFilterText}</div>
                    <div class="summary-item"><strong>Sales Type Filter:</strong> ${salesTypeFilterText}</div>
                    <div class="summary-item"><strong>Total Sales:</strong> ₱${reportData.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div class="summary-item"><strong>Total Transactions:</strong> ${reportData.totalTransactions}</div>
                    <div class="summary-item"><strong>Average Transaction:</strong> ₱${reportData.totalTransactions > 0 ? (reportData.totalSales / reportData.totalTransactions).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</div>
                </div>

                ${reportData.grouped.map(group => `
                    <div class="group-section">
                        <div class="group-header">
                            ${group.location} - ${group.salesFrom}
                        </div>
                        <div class="group-content">
                            <p><strong>Total Sales:</strong> ₱${group.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p><strong>Total Transactions:</strong> ${group.totalTransactions}</p>
                            
                            <table>
                                <thead>
                                    <tr>
                                        <th>Invoice #</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Sale Type</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${group.transactions.map(transaction => `
                                        <tr>
                                            <td>${transaction.invoice_id}</td>
                                            <td>${transaction.date}</td>
                                            <td>${transaction.time}</td>
                                            <td>${transaction.sales_from || 'N/A'}</td>
                                            <td>₱${parseFloat(transaction.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    `).join('')}
                                    <tr class="total-row">
                                        <td colspan="4"><strong>Subtotal</strong></td>
                                        <td><strong>₱${group.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `).join('')}

                <div class="print-date">
                    Generated on: ${new Date().toLocaleString()}
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    return (
        <>
            <div className='customer-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>SALES MANAGEMENT</h1>
                    <div>
                        <button className='add-cust-bttn' onClick={() => setShowReportModal(true)}>Generate Sales Report</button>
                    </div>
                </div>

                {/* Filter Controls */}
                <div style={{
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    margin: '15px 0',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '20px',
                        alignItems: 'end'
                    }}>
                        {/* Location Filter */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '600', 
                                fontSize: '14px',
                                color: '#374151'
                            }}>
                                Filter by Location
                            </label>
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    backgroundColor: '#ffffff',
                                    transition: 'all 0.2s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                <option value="">All Locations</option>
                                {locationList.map((location) => (
                                    <option key={location.location_id} value={location.location_id}>
                                        {location.location_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sales Type Filter */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '600', 
                                fontSize: '14px',
                                color: '#374151'
                            }}>
                                Filter by Sales Type
                            </label>
                            <select
                                value={salesFromFilter}
                                onChange={(e) => setSalesFromFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    backgroundColor: '#ffffff',
                                    transition: 'all 0.2s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                <option value="">All Sales Types</option>
                                {salesTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter Type */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '600', 
                                fontSize: '14px',
                                color: '#374151'
                            }}>
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
                                    padding: '12px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    backgroundColor: '#ffffff',
                                    transition: 'all 0.2s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                <option value="">All Dates</option>
                                <option value="daily">Daily Sales</option>
                                <option value="monthly">Monthly Sales</option>
                            </select>
                        </div>

                        {/* Specific Date Input */}
                        {dateFilter === 'daily' && (
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '8px', 
                                    fontWeight: '600', 
                                    fontSize: '14px',
                                    color: '#374151'
                                }}>
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    value={specificDate}
                                    onChange={(e) => setSpecificDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff',
                                        transition: 'all 0.2s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        )}

                        {/* Specific Month Input */}
                        {dateFilter === 'monthly' && (
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '8px', 
                                    fontWeight: '600', 
                                    fontSize: '14px',
                                    color: '#374151'
                                }}>
                                    Select Month
                                </label>
                                <input
                                    type="month"
                                    value={specificMonth}
                                    onChange={(e) => setSpecificMonth(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff',
                                        transition: 'all 0.2s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Total Sales Summary */}
                <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '12px',
                    margin: '15px 0',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)'
                }}>
                    <div>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>Total Sales Amount</div>
                        <div style={{ fontSize: '28px', fontWeight: '700' }}>
                            ₱{totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '5px' }}>
                            {filteredSales.length} of {salesByInvoice.length} transactions
                        </div>
                    </div>
                </div>

                {/* Active Filters */}
                <div style={{
                    padding: '15px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    margin: '15px 0',
                    fontSize: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <strong style={{ color: '#1f2937' }}>Active Filters:</strong>

                        {locationFilter && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                                borderRadius: '20px',
                                fontSize: '13px',
                                border: '1px solid #bfdbfe',
                                fontWeight: '500'
                            }}>
                                Location: {locationList.find(loc => loc.location_id === locationFilter)?.location_name || locationFilter}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('location')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#1e40af',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#ef4444';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#1e40af';
                                    }}
                                    title="Remove location filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {salesFromFilter && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                backgroundColor: '#dcfce7',
                                color: '#166534',
                                borderRadius: '20px',
                                fontSize: '13px',
                                border: '1px solid #bbf7d0',
                                fontWeight: '500'
                            }}>
                                Sales Type: {salesFromFilter}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('salesFrom')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#166534',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#ef4444';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#166534';
                                    }}
                                    title="Remove sales type filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {dateFilter && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                borderRadius: '20px',
                                fontSize: '13px',
                                border: '1px solid #fde68a',
                                fontWeight: '500'
                            }}>
                                Date: {dateFilter === 'daily' && specificDate && `${new Date(specificDate).toLocaleDateString()}`}
                                {dateFilter === 'monthly' && specificMonth && `${new Date(specificMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`}
                                {dateFilter && !specificDate && !specificMonth && `${dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}`}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('date')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#92400e',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#ef4444';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#92400e';
                                    }}
                                    title="Remove date filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {!locationFilter && !salesFromFilter && !dateFilter && (
                            <span style={{ color: '#6b7280', fontStyle: 'italic' }}>None applied</span>
                        )}
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={clearAllFilters}
                            style={{
                                padding: "10px 18px",
                                backgroundColor: "#6b7280",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#4b5563';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#6b7280';
                            }}
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>

                {/* Enhanced Table Container */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{ height: '400px', overflowY: 'auto' }}>
                        {currentItems && currentItems.length > 0 ? (
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '14px'
                            }}>
                                <thead style={{
                                    position: 'sticky',
                                    top: 0,
                                    backgroundColor: '#f8fafc',
                                    zIndex: 10
                                }}>
                                    <tr>
                                        <th style={{
                                            padding: '16px 20px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '13px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            borderBottom: '2px solid #e5e7eb'
                                        }}>
                                            Invoice #
                                        </th>
                                        <th style={{
                                            padding: '16px 20px',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '13px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            borderBottom: '2px solid #e5e7eb'
                                        }}>
                                            Sales Type
                                        </th>
                                        <th style={{
                                            padding: '16px 20px',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '13px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            borderBottom: '2px solid #e5e7eb'
                                        }}>
                                            Amount
                                        </th>
                                        <th style={{
                                            padding: '16px 20px',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '13px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            borderBottom: '2px solid #e5e7eb'
                                        }}>
                                            Date
                                        </th>
                                        <th style={{
                                            padding: '16px 20px',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '13px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            borderBottom: '2px solid #e5e7eb'
                                        }}>
                                            Time
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((sale, i) => (
                                        <tr 
                                            key={i} 
                                            style={{
                                                borderBottom: '1px solid #f3f4f6',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f9fafb';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <td style={{
                                                padding: '16px 20px',
                                                fontWeight: '600',
                                                color: '#1f2937'
                                            }}>
                                                {sale.invoice_id}
                                            </td>
                                            <td style={{
                                                padding: '16px 20px',
                                                textAlign: 'center'
                                            }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    backgroundColor: categorizeSalesType(sale.sales_from) === 'Full Payment Sales' 
                                                        ? '#dcfce7' 
                                                        : categorizeSalesType(sale.sales_from) === 'Installment Sales'
                                                        ? '#dbeafe'
                                                        : '#f3f4f6',
                                                    color: categorizeSalesType(sale.sales_from) === 'Full Payment Sales'
                                                        ? '#166534'
                                                        : categorizeSalesType(sale.sales_from) === 'Installment Sales'
                                                        ? '#1e40af'
                                                        : '#374151'
                                                }}>
                                                    {categorizeSalesType(sale.sales_from)}
                                                </span>
                                            </td>
                                            <td style={{
                                                padding: '16px 20px',
                                                textAlign: 'center',
                                                fontWeight: '600',
                                                color: '#059669',
                                                fontSize: '15px'
                                            }}>
                                                ₱{parseFloat(sale.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td style={{
                                                padding: '16px 20px',
                                                textAlign: 'center',
                                                color: '#6b7280'
                                            }}>
                                                {new Date(sale.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td style={{
                                                padding: '16px 20px',
                                                textAlign: 'center',
                                                color: '#6b7280',
                                                fontFamily: 'monospace'
                                            }}>
                                                {sale.time}
                                            </td>
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
                                height: '400px',
                                textAlign: 'center',
                                color: '#6b7280',
                                padding: '40px 20px'
                            }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '32px',
                                    marginBottom: '20px'
                                }}>
                                    📊
                                </div>
                                <h3 style={{
                                    color: '#374151',
                                    marginBottom: '12px',
                                    fontWeight: '600',
                                    fontSize: '18px'
                                }}>
                                    {salesByInvoice.length === 0 ? 'No sales data available' : 'No sales match the current filters'}
                                </h3>
                                <p style={{
                                    margin: '0',
                                    fontSize: '14px',
                                    maxWidth: '400px',
                                    lineHeight: '1.5',
                                    color: '#9ca3af'
                                }}>
                                    {salesByInvoice.length === 0
                                        ? 'Sales transactions will appear here once they are recorded in the system.'
                                        : 'Try adjusting your filters to see more results, or clear all filters to view all sales data.'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {totalPages > 1 && currentItems && currentItems.length > 0 && (
                    <div style={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '20px'
                    }}>
                        <CustomPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            color="green"
                        />
                    </div>
                )}

                {/* Sales Report Modal */}
                {showReportModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '0',
                            maxWidth: '95%',
                            maxHeight: '95%',
                            width: reportData.sales ? '1200px' : '600px',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Modal Header */}
                            <div style={{
                                padding: '24px 30px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700' }}>
                                        Sales Report Generator
                                    </h3>
                                    <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                                        Generate detailed sales analytics and reports
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowReportModal(false);
                                        setReportData([]);
                                        setReportDateFrom('');
                                        setReportDateTo('');
                                        setReportLocationFilter('');
                                        setReportSalesTypeFilter('');
                                        setReportType('date_range');
                                        setReportMonth('');
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '28px',
                                        cursor: 'pointer',
                                        padding: '0',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div style={{
                                flex: 1,
                                overflow: 'auto',
                                padding: '30px'
                            }}>
                                {!reportData.sales ? (
                                    // Report Configuration
                                    <div>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: reportType === 'date_range' ? 'repeat(4, 1fr)' : 'repeat(4, 1fr)',
                                            gap: '25px',
                                            marginBottom: '35px'
                                        }}>
                                            {/* Report Type Selection */}
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '10px',
                                                    fontWeight: '600',
                                                    color: '#374151',
                                                    fontSize: '14px'
                                                }}>
                                                    Report Type *
                                                </label>
                                                <select
                                                    value={reportType}
                                                    onChange={(e) => {
                                                        setReportType(e.target.value);
                                                        if (e.target.value === 'monthly') {
                                                            setReportDateFrom('');
                                                            setReportDateTo('');
                                                        } else {
                                                            setReportMonth('');
                                                        }
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        border: '2px solid #e5e7eb',
                                                        borderRadius: '10px',
                                                        fontSize: '14px',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                >
                                                    <option value="date_range">Date Range</option>
                                                    <option value="monthly">Monthly Report</option>
                                                </select>
                                            </div>

                                            {/* Date Range Fields */}
                                            {reportType === 'date_range' ? (
                                                <>
                                                    <div>
                                                        <label style={{
                                                            display: 'block',
                                                            marginBottom: '10px',
                                                            fontWeight: '600',
                                                            color: '#374151',
                                                            fontSize: '14px'
                                                        }}>
                                                            From Date *
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={reportDateFrom}
                                                            onChange={(e) => setReportDateFrom(e.target.value)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '12px 16px',
                                                                border: '2px solid #e5e7eb',
                                                                borderRadius: '10px',
                                                                fontSize: '14px'
                                                            }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label style={{
                                                            display: 'block',
                                                            marginBottom: '10px',
                                                            fontWeight: '600',
                                                            color: '#374151',
                                                            fontSize: '14px'
                                                        }}>
                                                            To Date *
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={reportDateTo}
                                                            onChange={(e) => setReportDateTo(e.target.value)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '12px 16px',
                                                                border: '2px solid #e5e7eb',
                                                                borderRadius: '10px',
                                                                fontSize: '14px'
                                                            }}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <div>
                                                    <label style={{
                                                        display: 'block',
                                                        marginBottom: '10px',
                                                        fontWeight: '600',
                                                        color: '#374151',
                                                        fontSize: '14px'
                                                    }}>
                                                        Select Month *
                                                    </label>
                                                    <input
                                                        type="month"
                                                        value={reportMonth}
                                                        onChange={(e) => setReportMonth(e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px 16px',
                                                            border: '2px solid #e5e7eb',
                                                            borderRadius: '10px',
                                                            fontSize: '14px'
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {/* Location Filter */}
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '10px',
                                                    fontWeight: '600',
                                                    color: '#374151',
                                                    fontSize: '14px'
                                                }}>
                                                    Location Filter
                                                </label>
                                                <select
                                                    value={reportLocationFilter}
                                                    onChange={(e) => setReportLocationFilter(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        border: '2px solid #e5e7eb',
                                                        borderRadius: '10px',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    <option value="">All Locations</option>
                                                    {locationList.map((location) => (
                                                        <option key={location.location_id} value={location.location_id}>
                                                            {location.location_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Sales Type Filter */}
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '10px',
                                                    fontWeight: '600',
                                                    color: '#374151',
                                                    fontSize: '14px'
                                                }}>
                                                    Sales Type Filter
                                                </label>
                                                <select
                                                    value={reportSalesTypeFilter}
                                                    onChange={(e) => setReportSalesTypeFilter(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        border: '2px solid #e5e7eb',
                                                        borderRadius: '10px',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    <option value="">All Sales Types</option>
                                                    {salesTypeOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            gap: '15px'
                                        }}>
                                            <button
                                                onClick={() => {
                                                    setShowReportModal(false);
                                                    setReportDateFrom('');
                                                    setReportDateTo('');
                                                    setReportLocationFilter('');
                                                    setReportSalesTypeFilter('');
                                                    setReportType('date_range');
                                                    setReportMonth('');
                                                }}
                                                style={{
                                                    padding: '12px 24px',
                                                    backgroundColor: '#6b7280',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                onClick={generateReport}
                                                disabled={isGeneratingReport ||
                                                    (reportType === 'date_range' && (!reportDateFrom || !reportDateTo)) ||
                                                    (reportType === 'monthly' && !reportMonth)
                                                }
                                                style={{
                                                    padding: '12px 30px',
                                                    backgroundColor: (
                                                        (reportType === 'date_range' && (!reportDateFrom || !reportDateTo)) ||
                                                        (reportType === 'monthly' && !reportMonth)
                                                    ) ? '#d1d5db' : '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    cursor: (
                                                        (reportType === 'date_range' && (!reportDateFrom || !reportDateTo)) ||
                                                        (reportType === 'monthly' && !reportMonth)
                                                    ) ? 'not-allowed' : 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Report Display
                                    <div>
                                        <div style={{
                                            textAlign: 'center',
                                            marginBottom: '35px',
                                            paddingBottom: '25px',
                                            borderBottom: '3px solid #667eea'
                                        }}>
                                            <h2 style={{
                                                margin: '0 0 15px 0',
                                                color: '#1f2937',
                                                fontSize: '28px',
                                                fontWeight: '700'
                                            }}>
                                                Sales Analytics Report
                                            </h2>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                gap: '30px',
                                                flexWrap: 'wrap'
                                            }}>
                                                <div style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#dbeafe',
                                                    color: '#1e40af',
                                                    borderRadius: '20px',
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}>
                                                    {reportData.reportType === 'monthly'
                                                        ? `Month: ${new Date(reportData.dateRange.from).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`
                                                        : `Period: ${new Date(reportData.dateRange.from).toLocaleDateString()} - ${new Date(reportData.dateRange.to).toLocaleDateString()}`
                                                    }
                                                </div>
                                                <div style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#dcfce7',
                                                    color: '#166534',
                                                    borderRadius: '20px',
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}>
                                                    Location: {reportLocationFilter
                                                        ? locationList.find(loc => loc.location_id === reportLocationFilter)?.location_name || 'Selected Location'
                                                        : 'All Locations'
                                                    }
                                                </div>
                                                <div style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#fef3c7',
                                                    color: '#92400e',
                                                    borderRadius: '20px',
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}>
                                                    Sales Type: {reportData.salesTypeFilter || 'All Sales Types'}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{
                                            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                            padding: '25px',
                                            borderRadius: '16px',
                                            marginBottom: '35px',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <h3 style={{
                                                margin: '0 0 20px 0',
                                                color: '#1f2937',
                                                fontSize: '20px',
                                                fontWeight: '600'
                                            }}>
                                                Executive Summary
                                            </h3>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                gap: '20px'
                                            }}>
                                                <div style={{
                                                    padding: '20px',
                                                    backgroundColor: 'white',
                                                    borderRadius: '12px',
                                                    textAlign: 'center',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}>
                                                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Total Sales</div>
                                                    <div style={{ fontSize: '24px', color: '#059669', fontWeight: 'bold' }}>
                                                        ₱{reportData.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    padding: '20px',
                                                    backgroundColor: 'white',
                                                    borderRadius: '12px',
                                                    textAlign: 'center',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}>
                                                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Transactions</div>
                                                    <div style={{ fontSize: '24px', color: '#3b82f6', fontWeight: 'bold' }}>
                                                        {reportData.totalTransactions}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    padding: '20px',
                                                    backgroundColor: 'white',
                                                    borderRadius: '12px',
                                                    textAlign: 'center',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}>
                                                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Average Sale</div>
                                                    <div style={{ fontSize: '24px', color: '#8b5cf6', fontWeight: 'bold' }}>
                                                        ₱{reportData.totalTransactions > 0 ? (reportData.totalSales / reportData.totalTransactions).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {reportData.grouped.map((group, index) => (
                                            <div key={index} style={{
                                                marginBottom: '30px',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                                            }}>
                                                <div style={{
                                                    background: group.salesFrom === 'Full Payment Sales' 
                                                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                                        : group.salesFrom === 'Installment Sales'
                                                        ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                                                        : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                                                    color: 'white',
                                                    padding: '20px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '600' }}>
                                                            {group.location} - {group.salesFrom}
                                                        </h4>
                                                        <div style={{ fontSize: '14px', opacity: 0.9 }}>
                                                            {group.totalTransactions} transactions
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                                            ₱{group.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ padding: '20px' }}>
                                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                        <table style={{
                                                            width: '100%',
                                                            borderCollapse: 'collapse',
                                                            fontSize: '14px'
                                                        }}>
                                                            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc' }}>
                                                                <tr>
                                                                    <th style={{
                                                                        border: '1px solid #e5e7eb',
                                                                        padding: '12px',
                                                                        textAlign: 'left',
                                                                        fontWeight: '600',
                                                                        color: '#374151',
                                                                        backgroundColor: '#f8fafc'
                                                                    }}>Invoice #</th>
                                                                    <th style={{
                                                                        border: '1px solid #e5e7eb',
                                                                        padding: '12px',
                                                                        textAlign: 'left',
                                                                        fontWeight: '600',
                                                                        color: '#374151',
                                                                        backgroundColor: '#f8fafc'
                                                                    }}>Date</th>
                                                                    <th style={{
                                                                        border: '1px solid #e5e7eb',
                                                                        padding: '12px',
                                                                        textAlign: 'left',
                                                                        fontWeight: '600',
                                                                        color: '#374151',
                                                                        backgroundColor: '#f8fafc'
                                                                    }}>Time</th>
                                                                    <th style={{
                                                                        border: '1px solid #e5e7eb',
                                                                        padding: '12px',
                                                                        textAlign: 'left',
                                                                        fontWeight: '600',
                                                                        color: '#374151',
                                                                        backgroundColor: '#f8fafc'
                                                                    }}>Sale Type</th>
                                                                    <th style={{
                                                                        border: '1px solid #e5e7eb',
                                                                        padding: '12px',
                                                                        textAlign: 'right',
                                                                        fontWeight: '600',
                                                                        color: '#374151',
                                                                        backgroundColor: '#f8fafc'
                                                                    }}>Amount</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {group.transactions.map((transaction, tIndex) => (
                                                                    <tr key={tIndex} style={{
                                                                        borderBottom: '1px solid #f3f4f6'
                                                                    }}>
                                                                        <td style={{ 
                                                                            border: '1px solid #e5e7eb', 
                                                                            padding: '12px',
                                                                            fontWeight: '500'
                                                                        }}>
                                                                            {transaction.invoice_id}
                                                                        </td>
                                                                        <td style={{ border: '1px solid #e5e7eb', padding: '12px' }}>
                                                                            {new Date(transaction.date).toLocaleDateString()}
                                                                        </td>
                                                                        <td style={{ 
                                                                            border: '1px solid #e5e7eb', 
                                                                            padding: '12px',
                                                                            fontFamily: 'monospace'
                                                                        }}>
                                                                            {transaction.time}
                                                                        </td>
                                                                        <td style={{ border: '1px solid #e5e7eb', padding: '12px' }}>
                                                                            <span style={{
                                                                                padding: '3px 8px',
                                                                                borderRadius: '12px',
                                                                                fontSize: '12px',
                                                                                fontWeight: '500',
                                                                                backgroundColor: categorizeSalesType(transaction.sales_from) === 'Full Payment Sales' 
                                                                                    ? '#dcfce7' 
                                                                                    : categorizeSalesType(transaction.sales_from) === 'Installment Sales'
                                                                                    ? '#dbeafe'
                                                                                    : '#f3f4f6',
                                                                                color: categorizeSalesType(transaction.sales_from) === 'Full Payment Sales'
                                                                                    ? '#166534'
                                                                                    : categorizeSalesType(transaction.sales_from) === 'Installment Sales'
                                                                                    ? '#1e40af'
                                                                                    : '#374151'
                                                                            }}>
                                                                                {transaction.sales_from || 'N/A'}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{
                                                                            border: '1px solid #e5e7eb',
                                                                            padding: '12px',
                                                                            textAlign: 'right',
                                                                            fontWeight: '600',
                                                                            color: '#059669'
                                                                        }}>
                                                                            ₱{parseFloat(transaction.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                <tr style={{
                                                                    backgroundColor: '#f0fdf4',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    <td colSpan="4" style={{
                                                                        border: '1px solid #e5e7eb',
                                                                        padding: '12px',
                                                                        color: '#166534'
                                                                    }}>
                                                                        Subtotal
                                                                    </td>
                                                                    <td style={{
                                                                        border: '1px solid #e5e7eb',
                                                                        padding: '12px',
                                                                        textAlign: 'right',
                                                                        color: '#166534'
                                                                    }}>
                                                                        ₱{group.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {reportData.grouped.length === 0 && (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '60px 40px',
                                                color: '#6b7280',
                                                backgroundColor: '#f9fafb',
                                                borderRadius: '16px',
                                                border: '2px dashed #d1d5db'
                                            }}>
                                                <div style={{ 
                                                    fontSize: '64px', 
                                                    marginBottom: '20px',
                                                    opacity: 0.5 
                                                }}>📋</div>
                                                <h4 style={{ 
                                                    color: '#374151',
                                                    marginBottom: '12px',
                                                    fontSize: '20px'
                                                }}>No Data Found</h4>
                                                <p style={{ 
                                                    margin: 0,
                                                    fontSize: '16px',
                                                    lineHeight: '1.5'
                                                }}>
                                                    No sales records match the selected criteria. Try adjusting your filters or date range.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            {reportData.sales && (
                                <div style={{
                                    padding: '25px 30px',
                                    backgroundColor: '#f8fafc',
                                    borderTop: '1px solid #e5e7eb',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ 
                                        color: '#6b7280', 
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        Generated: {new Date().toLocaleString()}
                                    </div>

                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <button
                                            onClick={() => {
                                                setReportData([]);
                                                setReportDateFrom('');
                                                setReportDateTo('');
                                                setReportLocationFilter('');
                                                setReportSalesTypeFilter('');
                                                setReportType('date_range');
                                                setReportMonth('');
                                            }}
                                            style={{
                                                padding: '12px 20px',
                                                backgroundColor: '#6b7280',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Generate New Report
                                        </button>

                                        <button
                                            onClick={printReport}
                                            style={{
                                                padding: '12px 24px',
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Print Report
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </>
    )
}

export default SaleAdmin;