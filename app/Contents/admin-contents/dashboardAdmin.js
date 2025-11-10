'use client';

import "../../css/dashboard.css";
import axios from 'axios';
import { useEffect, useState } from 'react';
import Router from "next/router";
import { TrendingUp, TrendingDown, DollarSign, Calendar, MapPin, Users, BarChart3, PieChart } from 'lucide-react';

// import Dashboard from '@/app/Contents/Dashboard/page';
import Products from '@/app/Contents/admin-contents/Products/page';
import Sale from '@/app/Contents/admin-contents/Sale/page';
import Analytics from '@/app/Contents/admin-contents/Analytics/page';
import Inventory from '@/app/Contents/admin-contents/Inventory/page';
import Location from '@/app/Contents/admin-contents/Location/page';
import Delivery from '@/app/Contents/admin-contents/Delivery/page';
import Customer from '@/app/Contents/admin-contents/Customer/page';
import User from '@/app/Contents/admin-contents/User/page';
import Setting from '@/app/Contents/admin-contents/Setting/page';
import { useRouter } from "next/navigation";

const DashboardAdmin = ({ onNavigateToSales }) => {

    const PesoSign = ({ size = 24, color = '#007bff' }) => (
        <span style={{
            width: 32,
            fontSize: `${size}px`,
            color: color,
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            ₱
        </span>
    );

    const [installmentList, setInstallmentList] = useState([]);
    const [overdueCustomers, setOverdueCustomers] = useState([]);
    const [groupedOverdueCustomers, setGroupedOverdueCustomers] = useState([]); // Grouped by customer
    const [customerList, setCustomerList] = useState([]);

    // Email notification states
    const [sendingEmails, setSendingEmails] = useState(false);
    const [emailResults, setEmailResults] = useState(null);
    const [selectedCollection, setSelectedCollection] = useState(null); // 'daily', 'weekly', 'monthly'
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [showCustomerPaymentsModal, setShowCustomerPaymentsModal] = useState(false);

    const [counts, setCounts] = useState({
        prodCount: '0',
        categoryCount: '0',
        locationCount: '0',
        userCount: '0',
        customerCount: '0',
        ongoingDelivery: '0',
        montlySales: '0.00',
        dailySales: '0.00',
        weeklySales: '0.00',

        dailyCollection: '0.00',
        weeklyCollection: '0.00',
        monthlyCollection: '0.00',
        totalCustomersWithDue: '0',
        dailyDueCustomers: '0',
        weeklyDueCustomers: '0',
        monthlyDueCustomers: '0',
        overdueAmount: '0.00'
    });

    const GetCustomer = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customer.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetCustomer"
                }
            });
            setCustomerList(response.data);
        } catch (error) {
            console.error("Error fetching customer list:", error);
        }
    };

    const GetCustName = (custID) => {
        const cust = customerList.find(custs => custs.cust_id == custID);
        return cust ? cust.cust_name : "Unknown Customer";
    };

    const GetInstallment = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            console.log("=== FETCHING INSTALLMENT DATA (ADMIN) ===");
            console.log("Base URL:", baseURL);
            
            const response = await axios.get(`${baseURL}installment.php`, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetAllInstallmentD"
                }
            });

            console.log("=== RAW RESPONSE ===");
            console.log("Response data:", response.data);
            console.log("Data type:", typeof response.data);
            console.log("Is array:", Array.isArray(response.data));
            console.log("Number of installments:", response.data ? response.data.length : 0);
            
            if (response.data && response.data.length > 0) {
                console.log("Sample installment structure:", response.data[0]);
                console.log("Sample fields:", {
                    status: response.data[0].status,
                    due_date: response.data[0].due_date,
                    amount_due: response.data[0].amount_due,
                    cust_id: response.data[0].cust_id
                });
            }

            const installmentData = response.data || [];
            console.log("Setting installment list with", installmentData.length, "items");
            
            setInstallmentList(installmentData);
            calculateCollections(installmentData);
            calculateOverdueCustomers(installmentData);
        } catch (error) {
            console.error("=== ERROR FETCHING INSTALLMENTS ===");
            console.error("Error:", error);
            console.error("Error message:", error.message);
            console.error("Error response:", error.response);
            setInstallmentList([]);
        }
    };

    const calculateCollections = (installments) => {
        if (!installments || installments.length === 0) return;

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Week calculation
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        // Month calculation
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        let dailyCollection = 0, weeklyCollection = 0, monthlyCollection = 0;
        let dailyDueCustomers = new Set(), weeklyDueCustomers = new Set(), monthlyDueCustomers = new Set();
        let totalCustomersWithDue = new Set();

        installments.forEach(installment => {
            // Only count UNPAID installments (case-insensitive check for not paid)
            if (installment.status && installment.status.toLowerCase() !== 'paid') {
                const dueDate = installment.due_date;
                const amount = parseFloat(installment.amount_due) || 0;

                totalCustomersWithDue.add(installment.installment_id);

                if (dueDate === todayStr) {
                    dailyCollection += amount;
                    dailyDueCustomers.add(installment.installment_id);
                }

                if (dueDate >= startOfWeek.toISOString().split('T')[0] &&
                    dueDate <= endOfWeek.toISOString().split('T')[0]) {
                    weeklyCollection += amount;
                    weeklyDueCustomers.add(installment.installment_id);
                }

                if (dueDate >= startOfMonth.toISOString().split('T')[0] &&
                    dueDate <= endOfMonth.toISOString().split('T')[0]) {
                    monthlyCollection += amount;
                    monthlyDueCustomers.add(installment.installment_id);
                }
            }
        });

        setCounts(prev => ({
            ...prev,
            dailyCollection: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(dailyCollection),
            weeklyCollection: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(weeklyCollection),
            monthlyCollection: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(monthlyCollection),
            totalCustomersWithDue: totalCustomersWithDue.size.toString(),
            dailyDueCustomers: dailyDueCustomers.size.toString(),
            weeklyDueCustomers: weeklyDueCustomers.size.toString(),
            monthlyDueCustomers: monthlyDueCustomers.size.toString()
        }));
    };

    const calculateOverdueCustomers = (installments) => {
        console.log("=== CALCULATING OVERDUE CUSTOMERS (ADMIN) ===");
        console.log("Installments received:", installments ? installments.length : 0);
        
        if (!installments || installments.length === 0) {
            console.log("No installments to process");
            setOverdueCustomers([]);
            setCounts(prev => ({
                ...prev,
                overdueAmount: '₱0.00'
            }));
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate comparison
        const todayStr = today.toISOString().split('T')[0];
        const GRACE_PERIOD_DAYS = 3;

        console.log("Today's date (for comparison):", todayStr);
        console.log("All installments:", installments.map(inst => ({
            status: inst.status,
            due_date: inst.due_date,
            amount: inst.amount_due
        })));

        // First, let's see all unpaid installments
        const unpaidInstallments = installments.filter(installment => {
            const isNotPaid = installment.status && installment.status.toLowerCase() !== 'paid';
            if (isNotPaid) {
                console.log("Unpaid installment found:", {
                    cust_id: installment.cust_id,
                    status: installment.status,
                    due_date: installment.due_date,
                    amount: installment.amount_due,
                    isPastDue: installment.due_date < todayStr
                });
            }
            return isNotPaid;
        });

        console.log("Total unpaid installments:", unpaidInstallments.length);

        const overdue = unpaidInstallments.filter(installment => {
            const isPastDue = installment.due_date < todayStr;
            
            if (isPastDue) {
                console.log("✓ OVERDUE installment:", {
                    cust_id: installment.cust_id,
                    status: installment.status,
                    due_date: installment.due_date,
                    today: todayStr,
                    amount: installment.amount_due
                });
            }
            
            return isPastDue;
        }).map(installment => {
            const dueDate = new Date(installment.due_date);
            dueDate.setHours(0, 0, 0, 0);
            const daysPastDue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
            const hasPenalty = daysPastDue > GRACE_PERIOD_DAYS;
            const daysUntilPenalty = hasPenalty ? 0 : GRACE_PERIOD_DAYS - daysPastDue;
            const baseAmount = parseFloat(installment.amount_due) || 0;
            const amountWithPenalty = hasPenalty ? baseAmount * 1.05 : baseAmount;

            console.log("Processing overdue customer:", {
                cust_id: installment.cust_id,
                daysPastDue,
                hasPenalty,
                baseAmount,
                amountWithPenalty
            });

            return {
                ...installment,
                daysPastDue,
                hasPenalty,
                daysUntilPenalty,
                baseAmount,
                amountWithPenalty
            };
        }).sort((a, b) => b.daysPastDue - a.daysPastDue);

        console.log("=== OVERDUE SUMMARY ===");
        console.log("Total overdue customers found:", overdue.length);
        console.log("Overdue list:", overdue);
        
        setOverdueCustomers(overdue);

        // Group overdue installments by customer
        const grouped = overdue.reduce((acc, installment) => {
            const custId = installment.cust_id;
            
            if (!acc[custId]) {
                acc[custId] = {
                    cust_id: custId,
                    installments: [],
                    totalAmount: 0,
                    totalAmountWithPenalty: 0,
                    maxDaysPastDue: 0,
                    paymentCount: 0
                };
            }
            
            acc[custId].installments.push(installment);
            acc[custId].totalAmount += installment.baseAmount || 0;
            acc[custId].totalAmountWithPenalty += installment.amountWithPenalty || 0;
            acc[custId].maxDaysPastDue = Math.max(acc[custId].maxDaysPastDue, installment.daysPastDue || 0);
            acc[custId].paymentCount += 1;
            
            return acc;
        }, {});

        // Convert to array and sort by total amount with penalty (highest first)
        const groupedArray = Object.values(grouped)
            .map(customer => ({
                ...customer,
                hasPenalty: customer.maxDaysPastDue > GRACE_PERIOD_DAYS
            }))
            .sort((a, b) => b.totalAmountWithPenalty - a.totalAmountWithPenalty);

        setGroupedOverdueCustomers(groupedArray);

        const totalOverdue = overdue.reduce((sum, customer) => {
            return sum + (customer.amountWithPenalty || 0);
        }, 0);

        console.log("Total overdue amount:", totalOverdue);

        setCounts(prev => ({
            ...prev,
            overdueAmount: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalOverdue)
        }));
    };

    // Email notification functions
    const checkAndSendNotifications = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        if (!baseURL) return;

        // Check if we've already sent notifications today
        const lastSent = localStorage.getItem('lastNotificationCheck');
        const today = new Date().toDateString();

        if (lastSent === today) {
            console.log('Notifications already sent today');
            return;
        }

        try {
            // Send installment reminders (1 week, 3 days, 1 day before)
            await sendInstallmentReminders();
            
            // Send overdue notifications (after grace period)
            await sendOverdueNotifications();
            
            // Mark as sent for today
            localStorage.setItem('lastNotificationCheck', today);
        } catch (error) {
            console.error('Error checking notifications:', error);
        }
    };

    const sendInstallmentReminders = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'installment-notifications.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({}),
                    operation: 'SendInstallmentReminders'
                }
            });

            console.log('Installment reminders sent:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error sending installment reminders:', error);
            throw error;
        }
    };

    const sendOverdueNotifications = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'installment-notifications.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({}),
                    operation: 'SendOverdueNotifications'
                }
            });

            console.log('Overdue notifications sent:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error sending overdue notifications:', error);
            throw error;
        }
    };

    const manualSendNotifications = async () => {
        console.log('=== MANUAL SEND NOTIFICATIONS STARTED ===');
        setSendingEmails(true);
        setEmailResults(null);

        try {
            console.log('Calling sendInstallmentReminders...');
            const reminders = await sendInstallmentReminders();
            console.log('Reminders response:', reminders);
            
            console.log('Calling sendOverdueNotifications...');
            const overdue = await sendOverdueNotifications();
            console.log('Overdue response:', overdue);

            const results = {
                one_week: reminders.one_week_reminders || 0,
                three_day: reminders.three_day_reminders || 0,
                one_day: reminders.one_day_reminders || 0,
                overdue: overdue.overdue_notifications || 0,
                total: (reminders.one_week_reminders || 0) + 
                       (reminders.three_day_reminders || 0) + 
                       (reminders.one_day_reminders || 0) + 
                       (overdue.overdue_notifications || 0)
            };

            console.log('Final results:', results);
            setEmailResults(results);
            
            // Update last sent timestamp
            localStorage.setItem('lastNotificationCheck', new Date().toDateString());
            
            // Show success message
            alert(`Email Notification Results:\n\n✅ 1 Week Reminders: ${results.one_week}\n✅ 3 Day Reminders: ${results.three_day}\n✅ 1 Day Reminders: ${results.one_day}\n✅ Overdue Notices: ${results.overdue}\n\nTotal Emails Sent: ${results.total}`);
            
            console.log('=== MANUAL SEND NOTIFICATIONS COMPLETED ===');
        } catch (error) {
            console.error('=== ERROR IN MANUAL SEND ===');
            console.error('Error details:', error);
            alert('Failed to send email notifications. Check console for details.');
        } finally {
            setSendingEmails(false);
        }
    };

    // Collection modal functions
    const handleCardClick = (path, collectionType = null) => {
        if (collectionType) {
            setSelectedCollection(collectionType);
            setShowCollectionModal(true);
        }
    };

    const getCollectionCustomers = () => {
        if (!selectedCollection || !installmentList.length) return [];

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        let startDate, endDate;

        if (selectedCollection === 'daily') {
            startDate = endDate = todayStr;
        } else if (selectedCollection === 'weekly') {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            startDate = startOfWeek.toISOString().split('T')[0];

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endDate = endOfWeek.toISOString().split('T')[0];
        } else if (selectedCollection === 'monthly') {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            startDate = startOfMonth.toISOString().split('T')[0];
            endDate = endOfMonth.toISOString().split('T')[0];
        }

        return installmentList
            .filter(installment => {
                return installment.status && installment.status.toLowerCase() !== 'paid' && 
                       installment.due_date >= startDate && 
                       installment.due_date <= endDate;
            })
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    };

    const getCustomerPayments = (custId) => {
        if (!custId || !overdueCustomers.length) return [];
        
        return overdueCustomers
            .filter(installment => installment.cust_id === custId)
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    };

    const handleCustomerClick = (custId) => {
        setSelectedCustomerId(custId);
        setShowCustomerPaymentsModal(true);
    };

    const countConfigs = [
        { id: 'product_id', from: 'products', name: 'product_count', stateKey: 'prodCount' },
        { id: 'category_id', from: 'category', name: 'category_count', stateKey: 'categoryCount' },
        { id: 'location_id', from: 'location', name: 'location_count', stateKey: 'locationCount' },
        { id: 'account_id', from: 'account', name: 'user_count', stateKey: 'userCount' },
        { id: 'cust_id', from: 'customers', name: 'customer_count', stateKey: 'customerCount' },
    ];

    const [salesByInvoice, setSalesByInvoice] = useState([]);

    // Debug useEffect to monitor state changes
    useEffect(() => {
        console.log("=== STATE CHANGED ===");
        console.log("Installment List:", installmentList.length);
        console.log("Overdue Customers:", overdueCustomers.length);
        console.log("Counts:", counts);
    }, [installmentList, overdueCustomers, counts]);

    useEffect(() => {
        const user_id = sessionStorage.getItem("user_id");
        console.log("=== ADMIN DASHBOARD USEEFFECT ===");
        console.log("User ID:", user_id);
        
        if (!user_id) {
            console.log("No user_id - exiting useEffect");
            return;
        }

        // Your existing calls
        console.log("Calling GetSalesByInvoice...");
        GetSalesByInvoice();
        
        console.log("Fetching counts...");
        countConfigs.forEach(config => fetchCount(config));

        // ADD THESE NEW CALLS:
        console.log("Calling GetCustomer...");
        GetCustomer();
        
        console.log("Calling GetInstallment...");
        GetInstallment();

        // Auto-send notifications on dashboard load (optional - run once per day)
        checkAndSendNotifications();
    }, []);

    // useEffect(() => {
    //     countConfigs.forEach(config => fetchCount(config));
    // }, []);

    const fetchCount = async ({ id, from, name, stateKey }) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'counts.php';

        const countDetails = { ID: id, tFrom: from, tName: name };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(countDetails),
                    operation: 'Count'
                }
            });

            const countValue = response.data?.[0]?.[name] || '0';

            setCounts(prev => ({
                ...prev,
                [stateKey]: countValue
            }));
        } catch (error) {
            console.error(`Error fetching ${stateKey}:`, error);
        }
    };

    // Sales calculation functions
    const calculateDailySales = (salesData) => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        const dailyTotal = salesData
            .filter(sale => sale.date === todayStr)
            .reduce((total, sale) => total + (parseFloat(sale.amount) || 0), 0);

        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(dailyTotal);
    };

    const calculateWeeklySales = (salesData) => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const weeklyTotal = salesData
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= startOfWeek && saleDate <= endOfWeek;
            })
            .reduce((total, sale) => total + (parseFloat(sale.amount) || 0), 0);



        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(weeklyTotal);
    };

    const calculateMonthlySales = (salesData) => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const monthlyTotal = salesData
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
            })
            .reduce((total, sale) => total + (parseFloat(sale.amount) || 0), 0);


        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(monthlyTotal);


    };

    const getSalesByLocation = (salesData, period = 'monthly') => {
        let filteredData = [];

        if (period === 'daily') {
            const today = new Date().toISOString().split('T')[0];
            filteredData = salesData.filter(sale => sale.date === today);
        } else if (period === 'weekly') {
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            filteredData = salesData.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= startOfWeek && saleDate <= endOfWeek;
            });
        } else {
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();

            filteredData = salesData.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
            });
        }

        const locationSales = {};
        filteredData.forEach(sale => {
            const locationName = sale.location_name || 'Unknown Location';
            if (!locationSales[locationName]) {
                locationSales[locationName] = 0;
            }
            locationSales[locationName] += parseFloat(sale.amount || 0);
        });

        return locationSales;
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

            if (response.data && response.data.length > 0) {
                const dailyTotal = calculateDailySales(response.data);
                const weeklyTotal = calculateWeeklySales(response.data);
                const monthlyTotal = calculateMonthlySales(response.data);

                setCounts(prev => ({
                    ...prev,
                    dailySales: dailyTotal,
                    weeklySales: weeklyTotal,
                    montlySales: monthlyTotal
                }));

                console.log('Daily sales by location:', getSalesByLocation(response.data, 'daily'));
                console.log('Weekly sales by location:', getSalesByLocation(response.data, 'weekly'));
                console.log('Monthly sales by location:', getSalesByLocation(response.data, 'monthly'));
            }
        } catch (error) {
            console.error("Error fetching sales invoice:", error);
        }
    };

    const router = useRouter();

    // Navigation handlers for sales cards
    const handleSalesCardClick = (filterType) => {
        const today = new Date();
        let filterData = {};

        switch (filterType) {
            case 'daily':
                filterData = {
                    dateFilter: 'daily',
                    specificDate: today.toISOString().split('T')[0]
                };
                break;
            case 'weekly':
                // No specific date needed for weekly, just set the filter
                filterData = {
                    dateFilter: 'weekly'
                };
                break;
            case 'monthly':
                filterData = {
                    dateFilter: 'monthly',
                    specificMonth: today.toISOString().slice(0, 7) // YYYY-MM format
                };
                break;
        }

        // Call the navigation function passed from parent
        if (onNavigateToSales) {
            onNavigateToSales(filterData);
        }
    };

    // Enhanced Chart Components with better legends and labels
    const BarChart = ({ data, title }) => {
        if (!data || data.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body" style={{ padding: '24px' }}>
                        <h5 className="card-title" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>{title}</h5>
                        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '48px', color: '#e9ecef', marginBottom: '16px' }}>📊</div>
                                <p className="text-muted" style={{ fontSize: '16px', margin: 0 }}>No data available</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        const validData = data.filter(item => item && typeof item.sales === 'number' && !isNaN(item.sales));
        if (validData.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body" style={{ padding: '24px' }}>
                        <h5 className="card-title" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>{title}</h5>
                        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '48px', color: '#e9ecef', marginBottom: '16px' }}>⚠️</div>
                                <p className="text-muted" style={{ fontSize: '16px', margin: 0 }}>No valid data available</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        const maxValue = Math.max(...validData.map(item => item.sales));
        const minValue = Math.min(...validData.map(item => item.sales));
        const average = validData.reduce((sum, item) => sum + item.sales, 0) / validData.length;
        const total = validData.reduce((sum, item) => sum + item.sales, 0);

        // Enhanced color palette for bars
        const getBarColor = (value, index) => {
            const intensity = value / maxValue;
            if (intensity >= 0.8) return '#10b981'; // High performance - Green
            if (intensity >= 0.6) return '#3b82f6'; // Good performance - Blue
            if (intensity >= 0.4) return '#f59e0b'; // Average performance - Orange
            return '#ef4444'; // Low performance - Red
        };

        return (
            <div className="card shadow" style={{ marginBottom: '20px', transition: 'all 0.3s ease' }}>
                <div className="card-body" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                        <div>
                            <h5 className="card-title" style={{ fontSize: '18px', fontWeight: '600', margin: 0, marginBottom: '4px' }}>
                                {title}
                            </h5>
                            <p style={{ color: '#6c757d', fontSize: '14px', margin: 0 }}>
                                Daily performance overview
                            </p>
                        </div>
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef',
                            textAlign: 'center',
                            minWidth: '120px'
                        }}>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#495057', lineHeight: '1' }}>
                                ₱{(total / 1000000).toFixed(1)}M
                            </div>
                            <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: '500', marginTop: '2px' }}>
                                Total Revenue
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Chart Container */}
                    <div style={{ height: '420px', display: 'flex', gap: '16px' }}>
                        {/* Y-axis with better spacing and formatting */}
                        <div style={{
                            width: '90px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            paddingRight: '12px',
                            paddingTop: '24px',
                            paddingBottom: '60px',
                            position: 'relative'
                        }}>
                            {/* Y-axis line */}
                            <div style={{
                                position: 'absolute',
                                right: '12px',
                                top: '24px',
                                bottom: '60px',
                                width: '1px',
                                backgroundColor: '#dee2e6'
                            }}></div>

                            {[1, 0.75, 0.5, 0.25, 0].map((ratio, index) => (
                                <div key={index} style={{
                                    textAlign: 'right',
                                    position: 'relative'
                                }}>
                                    <small style={{
                                        color: index === 0 || index === 4 ? '#495057' : '#6c757d',
                                        fontSize: '11px',
                                        fontWeight: index === 0 || index === 4 ? '600' : '400'
                                    }}>
                                        ₱{((maxValue * ratio) / 1000000).toFixed(1)}M
                                    </small>
                                    {/* Grid line indicator */}
                                    <div style={{
                                        position: 'absolute',
                                        right: '-12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '8px',
                                        height: '1px',
                                        backgroundColor: '#dee2e6'
                                    }}></div>
                                </div>
                            ))}
                        </div>

                        {/* Enhanced Chart Area */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                height: '340px',
                                display: 'flex',
                                alignItems: 'end',
                                gap: '8px',
                                paddingTop: '24px',
                                paddingLeft: '8px',
                                paddingRight: '8px',
                                position: 'relative'
                            }}>
                                {/* Horizontal grid lines */}
                                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            position: 'absolute',
                                            left: '0',
                                            right: '0',
                                            bottom: `${60 + (ratio * 316)}px`,
                                            height: '1px',
                                            backgroundColor: index === 0 ? '#dee2e6' : '#f1f3f4',
                                            opacity: index === 0 ? 1 : 0.7,
                                            zIndex: 1
                                        }}
                                    />
                                ))}

                                {/* Average line indicator */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: '0',
                                        right: '0',
                                        bottom: `${60 + ((average / maxValue) * 316)}px`,
                                        height: '2px',
                                        backgroundColor: '#8b5cf6',
                                        opacity: 0.6,
                                        zIndex: 2
                                    }}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        bottom: `${65 + ((average / maxValue) * 316)}px`,
                                        backgroundColor: '#8b5cf6',
                                        color: 'white',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        zIndex: 3
                                    }}
                                >
                                    AVG: ₱{(average / 1000).toFixed(0)}K
                                </div>

                                {/* Enhanced Bars */}
                                {validData.map((item, index) => {
                                    const barHeight = maxValue > 0 ? ((item.sales || 0) / maxValue) * 316 : 8;
                                    const barColor = getBarColor(item.sales, index);

                                    return (
                                        <div key={index} style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            flex: '1',
                                            position: 'relative',
                                            zIndex: 10
                                        }}>
                                            {/* Value label on top of bar */}
                                            {barHeight > 30 && (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: `${barHeight + 8}px`,
                                                        backgroundColor: 'white',
                                                        color: barColor,
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        border: `1px solid ${barColor}`,
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                        whiteSpace: 'nowrap',
                                                        zIndex: 15
                                                    }}
                                                >
                                                    ₱{(item.sales / 1000).toFixed(0)}K
                                                </div>
                                            )}

                                            {/* Enhanced Bar */}
                                            <div
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '60px',
                                                    backgroundColor: barColor,
                                                    borderRadius: '6px 6px 0 0',
                                                    height: `${Math.max(barHeight, 8)}px`,
                                                    position: 'relative',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    backgroundImage: `linear-gradient(180deg, ${barColor}dd, ${barColor})`,
                                                    overflow: 'hidden'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'scaleY(1.05)';
                                                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'scaleY(1)';
                                                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                                }}
                                                title={`${item.day}: ₱${(item.sales || 0).toLocaleString()}`}
                                            >
                                                {/* Subtle highlight effect */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '30%',
                                                    background: 'linear-gradient(180deg, rgba(255,255,255,0.3), transparent)',
                                                    borderRadius: '6px 6px 0 0'
                                                }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Enhanced X-axis labels */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '16px',
                                paddingLeft: '8px',
                                paddingRight: '8px',
                                paddingTop: '12px',
                                borderTop: '1px solid #e9ecef'
                            }}>
                                {validData.map((item, index) => (
                                    <div key={index} style={{
                                        textAlign: 'center',
                                        flex: '1',
                                        maxWidth: '60px'
                                    }}>
                                        <div style={{
                                            color: '#495057',
                                            fontWeight: '600',
                                            fontSize: '13px',
                                            marginBottom: '2px'
                                        }}>
                                            {item.day}
                                        </div>
                                        <div style={{
                                            color: '#6c757d',
                                            fontSize: '10px',
                                            fontWeight: '400'
                                        }}>
                                            {((item.sales / total) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Legend and Statistics */}
                    <div style={{
                        marginTop: '24px',
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                        border: '1px solid #e9ecef'
                    }}>
                        <div className="row">
                            <div className="col-md-12">
                                <div style={{ marginBottom: '16px' }}>
                                    <h6 style={{ color: '#495057', fontWeight: '600', fontSize: '14px', margin: 0, marginBottom: '12px' }}>
                                        Performance Legend
                                    </h6>
                                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                        {[
                                            { color: '#10b981', label: 'Excellent (80%+)', range: '80%+' },
                                            { color: '#3b82f6', label: 'Good (60-80%)', range: '60-80%' },
                                            { color: '#f59e0b', label: 'Average (40-60%)', range: '40-60%' },
                                            { color: '#ef4444', label: 'Below Average (<40%)', range: '<40%' }
                                        ].map((item, index) => (
                                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    backgroundColor: item.color,
                                                    borderRadius: '2px'
                                                }}></div>
                                                <span style={{
                                                    fontSize: '11px',
                                                    color: '#6c757d',
                                                    fontWeight: '500'
                                                }}>
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h6 style={{ color: '#495057', fontWeight: '600', fontSize: '14px', margin: 0, marginBottom: '8px' }}>
                                        Key Statistics
                                    </h6>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                        <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                                                ₱{(maxValue / 1000).toFixed(0)}K
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: '500' }}>Peak Day</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#ef4444' }}>
                                                ₱{(minValue / 1000).toFixed(0)}K
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: '500' }}>Lowest Day</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#8b5cf6' }}>
                                                ₱{(average / 1000).toFixed(0)}K
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: '500' }}>Daily Average</div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const LineChart = ({ data, title }) => {
        if (!data || data.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body" style={{ padding: '24px' }}>
                        <h5 className="card-title" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>{title}</h5>
                        <div style={{ height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '48px', color: '#e9ecef', marginBottom: '16px' }}>📈</div>
                                <p className="text-muted" style={{ fontSize: '16px', margin: 0 }}>No data available</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        const validData = data.filter(item => item && typeof item.sales === 'number' && !isNaN(item.sales));
        if (validData.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body" style={{ padding: '24px' }}>
                        <h5 className="card-title" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>{title}</h5>
                        <div style={{ height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '48px', color: '#e9ecef', marginBottom: '16px' }}>⚠️</div>
                                <p className="text-muted" style={{ fontSize: '16px', margin: 0 }}>No valid data available</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Enhanced data calculations
        const salesValues = validData.map(item => item.sales);
        const maxValue = Math.max(...salesValues);
        const minValue = Math.min(...salesValues);
        const range = maxValue - minValue || 1;
        const average = salesValues.reduce((sum, val) => sum + val, 0) / salesValues.length;
        const total = salesValues.reduce((sum, val) => sum + val, 0);

        // Calculate trend (growth/decline) - handle edge cases
        const trend = validData.length > 1 && validData[0].sales > 0 ?
            ((validData[validData.length - 1].sales - validData[0].sales) / validData[0].sales * 100) :
            validData.length > 1 ?
                ((validData[validData.length - 1].sales - validData[0].sales) / Math.max(validData[0].sales, 1) * 100) : 0;
        // alert(trend);

        // Enhanced points calculation with better spacing
        const chartWidth = 420;
        const chartHeight = 300;
        const padding = 40;

        const points = validData.map((item, index) => {
            const x = validData.length > 1 ? padding + (index / (validData.length - 1)) * (chartWidth - 2 * padding) : chartWidth / 2;
            const y = chartHeight - padding - ((item.sales - minValue) / range) * (chartHeight - 2 * padding);

            return {
                x: isNaN(x) ? chartWidth / 2 : x,
                y: isNaN(y) ? chartHeight - padding : y,
                ...item,
                isHighest: item.sales === maxValue,
                isLowest: item.sales === minValue
            };
        });

        const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');

        // Calculate volatility
        const volatility = salesValues.length > 1 ?
            Math.sqrt(salesValues.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / salesValues.length) : 0;

        return (
            <div className="card shadow" style={{ marginBottom: '20px', minHeight: '650px' }}>
                <div className="card-body" style={{ padding: '24px' }}>
                    {/* Enhanced Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '32px',
                        paddingBottom: '16px',
                        borderBottom: '2px solid #e9ecef'
                    }}>
                        <div>
                            <h5 className="card-title" style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                margin: 0,
                                marginBottom: '4px'
                            }}>
                                {title}
                            </h5>
                            <p style={{
                                color: '#6c757d',
                                fontSize: '14px',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <span>Trend analysis over {validData.length} periods</span>

                            </p>
                        </div>

                        {/* Quick Stats Display */}
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textAlign: 'center',
                                border: '1px solid #e9ecef',
                                minWidth: '120px'
                            }}>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981', lineHeight: '1' }}>
                                    ₱{(total / 1000000).toFixed(1)}M
                                </div>
                                <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: '500', marginTop: '2px' }}>
                                    Total Revenue
                                </div>
                            </div>

                            <div style={{
                                backgroundColor: '#f8f9fa',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textAlign: 'center',
                                border: '1px solid #e9ecef',
                                minWidth: '120px'
                            }}>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6', lineHeight: '1' }}>
                                    ₱{(average / 1000).toFixed(0)}K
                                </div>
                                <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: '500', marginTop: '2px' }}>
                                    Daily Average
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Chart Container */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                        {/* Enhanced Y-axis labels */}
                        <div style={{
                            width: '100px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            paddingRight: '16px',
                            height: `${chartHeight}px`,
                            paddingTop: `${padding}px`,
                            paddingBottom: `${padding}px`,
                            position: 'relative'
                        }}>
                            {/* Y-axis line */}
                            <div style={{
                                position: 'absolute',
                                right: '16px',
                                top: `${padding}px`,
                                bottom: `${padding}px`,
                                width: '2px',
                                backgroundColor: '#dee2e6'
                            }}></div>

                            {[1, 0.75, 0.5, 0.25, 0].map((ratio, index) => (
                                <div key={index} style={{
                                    textAlign: 'right',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end'
                                }}>
                                    <div style={{
                                        backgroundColor: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <small style={{
                                            color: index === 0 || index === 4 ? '#495057' : '#6c757d',
                                            fontSize: '11px',
                                            fontWeight: index === 0 || index === 4 ? '600' : '400'
                                        }}>
                                            ₱{((minValue + range * ratio) / 1000).toFixed(0)}K
                                        </small>
                                    </div>
                                    {/* Grid line indicator */}
                                    <div style={{
                                        position: 'absolute',
                                        right: '-16px',
                                        width: '12px',
                                        height: '2px',
                                        backgroundColor: '#dee2e6'
                                    }}></div>
                                </div>
                            ))}
                        </div>

                        {/* Enhanced Chart Area */}
                        <div style={{ flex: 1, position: 'relative' }}>
                            <svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>
                                <defs>
                                    {/* Enhanced gradients */}
                                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#4f46e5', stopOpacity: 0.3 }} />
                                        <stop offset="100%" style={{ stopColor: '#4f46e5', stopOpacity: 0.05 }} />
                                    </linearGradient>

                                    {/* Drop shadow for line and points */}
                                    <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.15" />
                                    </filter>

                                    {/* Glow effect for highest/lowest points */}
                                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#fbbf24" floodOpacity="0.6" />
                                    </filter>
                                </defs>

                                {/* Enhanced grid lines */}
                                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                                    <line
                                        key={index}
                                        x1={padding}
                                        y1={padding + (1 - ratio) * (chartHeight - 2 * padding)}
                                        x2={chartWidth - padding}
                                        y2={padding + (1 - ratio) * (chartHeight - 2 * padding)}
                                        stroke={index === 0 || index === 4 ? "#dee2e6" : "#f1f3f4"}
                                        strokeWidth={index === 0 || index === 4 ? "2" : "1"}
                                        strokeDasharray={index === 0 || index === 4 ? "none" : "3,3"}
                                        opacity={index === 0 || index === 4 ? 1 : 0.7}
                                    />
                                ))}

                                {/* Average line */}
                                <line
                                    x1={padding}
                                    y1={chartHeight - padding - ((average - minValue) / range) * (chartHeight - 2 * padding)}
                                    x2={chartWidth - padding}
                                    y2={chartHeight - padding - ((average - minValue) / range) * (chartHeight - 2 * padding)}
                                    stroke="#8b5cf6"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                    opacity="0.7"
                                />

                                {/* Area fill */}
                                {validData.length > 1 && (
                                    <polygon
                                        points={`${padding},${chartHeight - padding} ${pathPoints} ${chartWidth - padding},${chartHeight - padding}`}
                                        fill="url(#areaGradient)"
                                    />
                                )}

                                {/* Main trend line */}
                                {validData.length > 1 && (
                                    <polyline
                                        points={pathPoints}
                                        fill="none"
                                        stroke="#4f46e5"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ filter: 'url(#dropshadow)' }}
                                    />
                                )}

                                {/* Enhanced data points */}
                                {points.map((point, index) => (
                                    <g key={index}>
                                        {/* Point glow for highest/lowest */}
                                        {(point.isHighest || point.isLowest) && (
                                            <circle
                                                cx={point.x}
                                                cy={point.y}
                                                r="12"
                                                fill={point.isHighest ? "#10b981" : "#ef4444"}
                                                opacity="0.2"
                                            />
                                        )}

                                        {/* Main point */}
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r={point.isHighest || point.isLowest ? "8" : "6"}
                                            fill={point.isHighest ? "#10b981" : point.isLowest ? "#ef4444" : "#4f46e5"}
                                            stroke="white"
                                            strokeWidth="3"
                                            style={{
                                                cursor: 'pointer',
                                                filter: point.isHighest || point.isLowest ? 'url(#glow)' : 'url(#dropshadow)'
                                            }}
                                        />

                                        {/* Enhanced value labels */}
                                        <g>
                                            {/* Label background */}
                                            <rect
                                                x={point.x - 25}
                                                y={point.y - 35}
                                                width="50"
                                                height="20"
                                                rx="10"
                                                fill="white"
                                                stroke={point.isHighest ? "#10b981" : point.isLowest ? "#ef4444" : "#4f46e5"}
                                                strokeWidth="1.5"
                                                opacity="0.95"
                                                style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))' }}
                                            />

                                            {/* Label text */}
                                            <text
                                                x={point.x}
                                                y={point.y - 25}
                                                textAnchor="middle"
                                                fontSize="11"
                                                fill={point.isHighest ? "#10b981" : point.isLowest ? "#ef4444" : "#4f46e5"}
                                                fontWeight="700"
                                                dominantBaseline="middle"
                                            >
                                                ₱{(point.sales / 1000).toFixed(0)}K
                                            </text>

                                            {/* Special indicators for highest/lowest */}
                                            {point.isHighest && (
                                                <text
                                                    x={point.x}
                                                    y={point.y + 20}
                                                    textAnchor="middle"
                                                    fontSize="10"
                                                    fill="#10b981"
                                                    fontWeight="600"
                                                >
                                                    ↑ HIGH
                                                </text>
                                            )}
                                            {point.isLowest && (
                                                <text
                                                    x={point.x}
                                                    y={point.y + 20}
                                                    textAnchor="middle"
                                                    fontSize="10"
                                                    fill="#ef4444"
                                                    fontWeight="600"
                                                >
                                                    ↓ LOW
                                                </text>
                                            )}
                                        </g>
                                    </g>
                                ))}

                                {/* Average line label */}
                                <g>
                                    <rect
                                        x={chartWidth - 80}
                                        y={chartHeight - padding - ((average - minValue) / range) * (chartHeight - 2 * padding) - 10}
                                        width="60"
                                        height="16"
                                        rx="8"
                                        fill="#8b5cf6"
                                        opacity="0.9"
                                    />
                                    <text
                                        x={chartWidth - 50}
                                        y={chartHeight - padding - ((average - minValue) / range) * (chartHeight - 2 * padding) - 2}
                                        textAnchor="middle"
                                        fontSize="10"
                                        fill="white"
                                        fontWeight="600"
                                    >
                                        AVG
                                    </text>
                                </g>
                            </svg>

                            {/* Enhanced X-axis labels */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '16px',
                                paddingLeft: `${padding}px`,
                                paddingRight: `${padding}px`,
                                paddingTop: '12px',
                                borderTop: '2px solid #e9ecef'
                            }}>
                                {validData.map((item, index) => (
                                    <div key={index} style={{
                                        textAlign: 'center',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            color: '#495057',
                                            fontWeight: '600',
                                            fontSize: '13px',
                                            marginBottom: '4px'
                                        }}>
                                            {item.day}
                                        </div>
                                        <div style={{
                                            color: '#6c757d',
                                            fontSize: '10px',
                                            fontWeight: '400'
                                        }}>
                                            {((item.sales / total) * 100).toFixed(1)}%
                                        </div>
                                        {/* Indicator line */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '-16px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: '2px',
                                            height: '8px',
                                            backgroundColor: '#dee2e6'
                                        }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Statistics and Legend */}
                    <div style={{
                        padding: '24px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                        border: '1px solid #e9ecef'
                    }}>
                        <div className="row">
                            <div className="col-md-12">
                                <div style={{ marginBottom: '20px' }}>
                                    <h6 style={{
                                        color: '#495057',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        margin: 0,
                                        marginBottom: '16px'
                                    }}>
                                        Chart Legend & Analysis
                                    </h6>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '24px',
                                                height: '4px',
                                                background: 'linear-gradient(90deg, #4f46e5 0%, rgba(79, 70, 229, 0.3) 100%)'
                                            }}></div>
                                            <span style={{ fontSize: '12px', color: '#495057', fontWeight: '500' }}>
                                                Revenue Trend
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                backgroundColor: '#4f46e5',
                                                borderRadius: '50%',
                                                border: '2px solid white',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                            }}></div>
                                            <span style={{ fontSize: '12px', color: '#495057', fontWeight: '500' }}>
                                                Data Points
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '20px',
                                                height: '2px',
                                                backgroundColor: '#8b5cf6',
                                                opacity: 0.7
                                            }}></div>
                                            <span style={{ fontSize: '12px', color: '#495057', fontWeight: '500' }}>
                                                Average Line
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    backgroundColor: '#10b981',
                                                    borderRadius: '50%'
                                                }}></div>
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    backgroundColor: '#ef4444',
                                                    borderRadius: '50%'
                                                }}></div>
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#495057', fontWeight: '500' }}>
                                                High/Low Points
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '12px'
                                    }}>
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '12px',
                                            backgroundColor: 'white',
                                            borderRadius: '8px',
                                            border: '1px solid #dee2e6',
                                            width: '100%'
                                        }}>
                                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
                                                ₱{(maxValue / 1000).toFixed(0)}K
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: '500' }}>
                                                Peak Performance
                                            </div>
                                        </div>

                                        <div style={{
                                            textAlign: 'center',
                                            padding: '12px',
                                            backgroundColor: 'white',
                                            borderRadius: '8px',
                                            border: '1px solid #dee2e6',
                                            width: '100%'
                                        }}>
                                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#ef4444', marginBottom: '4px' }}>
                                                ₱{(minValue / 1000).toFixed(0)}K
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: '500' }}>
                                                Lowest Point
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Monthly Line Chart Component - Enhanced
    const MonthlyLineChart = ({ data, title }) => {
        if (!data || data.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">No data available</p>
                        </div>
                    </div>
                </div>
            );
        }

        const validData = data.filter(item =>
            item &&
            typeof item.sales === 'number' &&
            !isNaN(item.sales) &&
            isFinite(item.sales)
        );

        if (validData.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">No valid data available</p>
                        </div>
                    </div>
                </div>
            );
        }

        const salesValues = validData.map(item => item.sales);
        const maxValue = Math.max(...salesValues);
        const minValue = Math.min(...salesValues);
        const range = maxValue - minValue || 1;

        // Calculate overview statistics
        // Find current month index
        const currentMonthIndex = validData.findIndex(item => item.isCurrentMonth);
        const ytdData = currentMonthIndex >= 0 ? validData.slice(0, currentMonthIndex + 1) : validData;

        const totalSales = ytdData.reduce((sum, item) => sum + item.sales, 0);
        const averageSales = totalSales / ytdData.length;
        const bestMonth = validData.find(item => item.sales === maxValue);
        const worstMonth = validData.find(item => item.sales === minValue);

        // Calculate growth trend (if we have at least 2 data points)
        let growthTrend = 0;
        let trendDirection = 'stable';
        if (validData.length >= 2) {
            const firstHalf = validData.slice(0, Math.ceil(validData.length / 2));
            const secondHalf = validData.slice(Math.floor(validData.length / 2));
            const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.sales, 0) / firstHalf.length;
            const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.sales, 0) / secondHalf.length;

            growthTrend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
            if (Math.abs(growthTrend) < 5) {
                trendDirection = 'stable';
            } else if (growthTrend > 0) {
                trendDirection = 'increasing';
            } else {
                trendDirection = 'decreasing';
            }
        }

        const points = validData.map((item, index) => {
            const x = validData.length > 1 ? (index / (validData.length - 1)) * 350 : 175;
            const y = 180 - ((item.sales - minValue) / range) * 160;

            return {
                x: isNaN(x) ? 175 : x,
                y: isNaN(y) ? 180 : y,
                ...item
            };
        });

        const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');

        return (
            <div className="card shadow" style={{ marginBottom: '20px' }}>
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>

                    <div style={{ display: 'flex' }}>
                        {/* Y-axis labels */}
                        <div style={{ width: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '10px', height: '200px' }}>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{maxValue.toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{(minValue + range * 0.75).toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{(minValue + range * 0.5).toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{(minValue + range * 0.25).toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{minValue.toLocaleString()}</small>
                        </div>

                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <svg width="380" height="200">
                                <defs>
                                    <linearGradient id="monthlyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#28a745', stopOpacity: 0.3 }} />
                                        <stop offset="100%" style={{ stopColor: '#28a745', stopOpacity: 0.05 }} />
                                    </linearGradient>
                                </defs>

                                {/* Grid lines */}
                                {[0, 1, 2, 3, 4].map(i => (
                                    <line
                                        key={i}
                                        x1="0"
                                        y1={i * 40}
                                        x2="350"
                                        y2={i * 40}
                                        stroke="#e9ecef"
                                        strokeWidth="1"
                                    />
                                ))}

                                {validData.length > 1 && (
                                    <polygon
                                        points={`0,180 ${pathPoints} 350,180`}
                                        fill="url(#monthlyGradient)"
                                    />
                                )}

                                {validData.length > 1 && (
                                    <polyline
                                        points={pathPoints}
                                        fill="none"
                                        stroke="#28a745"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                )}

                                {points.map((point, index) => (
                                    <g key={index}>
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r={point.isCurrentMonth ? "6" : "4"}
                                            fill={point.isCurrentMonth ? "#dc3545" : "#28a745"}
                                            stroke="white"
                                            strokeWidth="2"
                                            style={{ cursor: 'pointer' }}
                                        />
                                        {/* Value labels */}
                                        <text
                                            x={point.x}
                                            y={point.y - 12}
                                            textAnchor="middle"
                                            fontSize="9"
                                            fill={point.isCurrentMonth ? "#dc3545" : "#28a745"}
                                            fontWeight="bold"
                                        >
                                            ₱{(point.sales / 1000).toFixed(0)}k
                                        </text>
                                    </g>
                                ))}
                            </svg>

                            <div className="d-flex justify-content-between" style={{ marginTop: '10px', paddingLeft: '15px', paddingRight: '15px' }}>
                                {validData.map((item, index) => (
                                    <small
                                        key={index}
                                        style={{
                                            color: item.isCurrentMonth ? '#dc3545' : '#6c757d',
                                            fontWeight: item.isCurrentMonth ? 'bold' : 'normal',
                                            fontSize: '11px'
                                        }}
                                    >
                                        {item.month || 'N/A'}
                                    </small>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Legend */}
                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                        <div className="row">
                            <div className="col-md-6">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            backgroundColor: '#dc3545',
                                            borderRadius: '50%'
                                        }}></div>
                                        <small style={{ color: '#6c757d' }}>Current Month</small>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            backgroundColor: '#28a745',
                                            borderRadius: '50%'
                                        }}></div>
                                        <small style={{ color: '#6c757d' }}>Monthly Performance</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <small style={{ color: '#495057', fontWeight: 'bold' }}>
                                    YTD Total: ₱{totalSales.toLocaleString()}
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* New Overview Section */}
                    <div style={{ marginTop: '20px', borderTop: '1px solid #dee2e6', paddingTop: '15px' }}>
                        <h6 style={{ color: '#495057', marginBottom: '15px', fontWeight: '600' }}>Performance Overview</h6>

                        <div className="row">
                            {/* Key Metrics */}
                            <div className="col-md-6 mb-3">
                                <div style={{ padding: '15px', backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '8px' }}>
                                    <h6 style={{ color: '#6c757d', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
                                        Key Metrics
                                    </h6>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                                                ₱{(averageSales / 1000).toFixed(0)}k
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#6c757d' }}>Monthly Average</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                                                {ytdData.length}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#6c757d' }}>Months Tracked (YTD)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Highlights */}
                            <div className="col-md-6 mb-3">
                                <div style={{ padding: '15px', backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '8px' }}>
                                    <h6 style={{ color: '#6c757d', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
                                        Performance Highlights
                                    </h6>
                                    <div style={{ fontSize: '11px', lineHeight: '1.4', color: '#495057' }}>
                                        <div style={{ marginBottom: '5px' }}>
                                            <strong style={{ color: '#28a745' }}>Best:</strong> {bestMonth?.month} (₱{(bestMonth?.sales / 1000).toFixed(0)}k)
                                        </div>
                                        <div>
                                            <strong style={{ color: '#dc3545' }}>Lowest:</strong> {worstMonth?.month} (₱{(worstMonth?.sales / 1000).toFixed(0)}k)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trend Analysis */}
                        {/* <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginTop: '10px' }}>
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor:
                                                trendDirection === 'increasing' ? '#28a745' :
                                                    trendDirection === 'decreasing' ? '#dc3545' : '#ffc107'
                                        }}></div>
                                        <small style={{ color: '#495057', fontWeight: '500' }}>
                                            Trend Analysis:
                                            <span style={{
                                                color:
                                                    trendDirection === 'increasing' ? '#28a745' :
                                                        trendDirection === 'decreasing' ? '#dc3545' : '#856404',
                                                fontWeight: 'bold',
                                                marginLeft: '5px'
                                            }}>
                                                {trendDirection === 'increasing' ? '↗️ Growing' :
                                                    trendDirection === 'decreasing' ? '↘️ Declining' : '→ Stable'}
                                            </span>
                                            {validData.length >= 2 && Math.abs(growthTrend) >= 5 && (
                                                <span style={{ marginLeft: '5px', color: '#6c757d' }}>
                                                    ({growthTrend > 0 ? '+' : ''}{growthTrend.toFixed(1)}%)
                                                </span>
                                            )}
                                        </small>
                                    </div>
                                </div>
                                <div className="col-md-4 text-right">
                                    <small style={{ color: '#6c757d', fontSize: '10px' }}>
                                        Range: ₱{((maxValue - minValue) / 1000).toFixed(0)}k variation
                                    </small>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        );
    };

    // Yearly Performance Chart Component - Enhanced
    const YearlyChart = ({ data, title }) => {
        if (!data || data.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">No data available</p>
                        </div>
                    </div>
                </div>
            );
        }

        const validData = data.filter(item =>
            item &&
            typeof item.sales === 'number' &&
            !isNaN(item.sales) &&
            isFinite(item.sales)
        );

        if (validData.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">No valid data available</p>
                        </div>
                    </div>
                </div>
            );
        }

        const salesValues = validData.map(item => item.sales);
        const maxValue = Math.max(...salesValues);
        const minValue = Math.min(...salesValues);
        const range = maxValue - minValue || 1;

        // Calculate overview statistics
        const totalSales = validData.reduce((sum, item) => sum + item.sales, 0);
        const averageSales = totalSales / validData.length;
        const bestYear = validData.find(item => item.sales === maxValue);
        const worstYear = validData.find(item => item.sales === minValue);

        // Calculate CAGR (Compound Annual Growth Rate) if we have at least 2 years
        let cagr = 0;
        let cagr_years = 0;
        if (validData.length >= 2) {
            const firstYear = validData[0];
            const lastYear = validData[validData.length - 1];
            cagr_years = parseInt(lastYear.year) - parseInt(firstYear.year);
            if (cagr_years > 0 && firstYear.sales > 0) {
                cagr = (Math.pow(lastYear.sales / firstYear.sales, 1 / cagr_years) - 1) * 100;
            }
        }

        // Calculate year-over-year growth rates
        const yoyGrowthRates = [];
        for (let i = 1; i < validData.length; i++) {
            const currentYear = validData[i];
            const previousYear = validData[i - 1];
            if (previousYear.sales > 0) {
                const growthRate = ((currentYear.sales - previousYear.sales) / previousYear.sales) * 100;
                yoyGrowthRates.push({
                    year: currentYear.year,
                    growth: growthRate
                });
            }
        }

        // Determine overall trend
        let overallTrend = 'stable';
        if (yoyGrowthRates.length > 0) {
            const avgGrowth = yoyGrowthRates.reduce((sum, item) => sum + item.growth, 0) / yoyGrowthRates.length;
            if (avgGrowth > 5) {
                overallTrend = 'strong growth';
            } else if (avgGrowth > 0) {
                overallTrend = 'moderate growth';
            } else if (avgGrowth > -5) {
                overallTrend = 'stable';
            } else {
                overallTrend = 'declining';
            }
        }

        const points = validData.map((item, index) => {
            const x = validData.length > 1 ? (index / (validData.length - 1)) * 300 : 150;
            const y = 180 - ((item.sales - minValue) / range) * 160;

            return {
                x: isNaN(x) ? 150 : x,
                y: isNaN(y) ? 180 : y,
                ...item
            };
        });

        const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');

        return (
            <div className="card shadow" style={{ marginBottom: '20px' }}>
                <div className="card-body" style={{ padding: '24px' }}>
                    <h5 className="card-title" style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '600' }}>
                        {title}
                    </h5>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        {/* Enhanced Y-axis labels with better spacing */}
                        <div style={{
                            width: '80px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            paddingRight: '12px',
                            height: '240px',
                            paddingTop: '8px',
                            paddingBottom: '8px'
                        }}>
                            <div style={{
                                color: '#495057',
                                fontSize: '11px',
                                fontWeight: '500',
                                textAlign: 'right',
                                lineHeight: '1'
                            }}>
                                ₱{(maxValue / 1000000).toFixed(1)}M
                            </div>
                            <div style={{
                                color: '#6c757d',
                                fontSize: '11px',
                                fontWeight: '400',
                                textAlign: 'right',
                                lineHeight: '1'
                            }}>
                                ₱{((minValue + range * 0.75) / 1000000).toFixed(1)}M
                            </div>
                            <div style={{
                                color: '#6c757d',
                                fontSize: '11px',
                                fontWeight: '400',
                                textAlign: 'right',
                                lineHeight: '1'
                            }}>
                                ₱{((minValue + range * 0.5) / 1000000).toFixed(1)}M
                            </div>
                            <div style={{
                                color: '#6c757d',
                                fontSize: '11px',
                                fontWeight: '400',
                                textAlign: 'right',
                                lineHeight: '1'
                            }}>
                                ₱{((minValue + range * 0.25) / 1000000).toFixed(1)}M
                            </div>
                            <div style={{
                                color: '#495057',
                                fontSize: '11px',
                                fontWeight: '500',
                                textAlign: 'right',
                                lineHeight: '1'
                            }}>
                                ₱{(minValue / 1000000).toFixed(1)}M
                            </div>
                        </div>

                        {/* Enhanced chart area */}
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <svg width="360" height="240" style={{ overflow: 'visible' }}>
                                <defs>
                                    {/* Enhanced gradient with better colors */}
                                    <linearGradient id="yearlyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#4f46e5', stopOpacity: 0.2 }} />
                                        <stop offset="100%" style={{ stopColor: '#4f46e5', stopOpacity: 0.02 }} />
                                    </linearGradient>

                                    {/* Drop shadow for points */}
                                    <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.1" />
                                    </filter>
                                </defs>

                                {/* Enhanced grid lines with alternating opacity */}
                                {[0, 1, 2, 3, 4].map(i => (
                                    <line
                                        key={i}
                                        x1="0"
                                        y1={8 + i * 48}
                                        x2="330"
                                        y2={8 + i * 48}
                                        stroke={i === 0 || i === 4 ? "#dee2e6" : "#f1f3f4"}
                                        strokeWidth={i === 0 || i === 4 ? "1.5" : "1"}
                                        strokeDasharray={i === 0 || i === 4 ? "none" : "2,2"}
                                    />
                                ))}

                                {/* Area fill with enhanced gradient */}
                                {validData.length > 1 && (
                                    <polygon
                                        points={`0,200 ${pathPoints} 330,200`}
                                        fill="url(#yearlyGradient)"
                                    />
                                )}

                                {/* Main line with enhanced styling */}
                                {validData.length > 1 && (
                                    <polyline
                                        points={pathPoints}
                                        fill="none"
                                        stroke="#4f46e5"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{
                                            filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.1))'
                                        }}
                                    />
                                )}

                                {/* Enhanced data points with better visibility */}
                                {points.map((point, index) => (
                                    <g key={index}>
                                        {/* Point shadow/glow effect */}
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r={point.isCurrentYear ? "10" : "8"}
                                            fill={point.isCurrentYear ? "#fbbf24" : "#4f46e5"}
                                            opacity="0.2"
                                        />

                                        {/* Main point */}
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r={point.isCurrentYear ? "7" : "5"}
                                            fill={point.isCurrentYear ? "#f59e0b" : "#4f46e5"}
                                            stroke="white"
                                            strokeWidth="2.5"
                                            style={{
                                                cursor: 'pointer',
                                                filter: 'url(#dropshadow)'
                                            }}
                                        />

                                        {/* Enhanced value labels with background */}
                                        <g>
                                            {/* Label background */}
                                            <rect
                                                x={point.x - 20}
                                                y={point.y - 30}
                                                width="40"
                                                height="16"
                                                rx="8"
                                                fill="white"
                                                stroke={point.isCurrentYear ? "#f59e0b" : "#4f46e5"}
                                                strokeWidth="1"
                                                opacity="0.95"
                                                style={{ filter: 'drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.1))' }}
                                            />

                                            {/* Label text */}
                                            <text
                                                x={point.x}
                                                y={point.y - 20}
                                                textAnchor="middle"
                                                fontSize="11"
                                                fill={point.isCurrentYear ? "#f59e0b" : "#4f46e5"}
                                                fontWeight="600"
                                                dominantBaseline="middle"
                                            >
                                                ₱{(point.sales / 1000000).toFixed(1)}M
                                            </text>
                                        </g>
                                    </g>
                                ))}
                            </svg>

                            {/* Enhanced X-axis labels */}
                            <div
                                className="d-flex justify-content-between"
                                style={{
                                    marginTop: '16px',
                                    paddingLeft: '15px',
                                    paddingRight: '15px',
                                    borderTop: '1px solid #e9ecef',
                                    paddingTop: '12px'
                                }}
                            >
                                {validData.map((item, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            color: item.isCurrentYear ? '#f59e0b' : '#6c757d',
                                            fontWeight: item.isCurrentYear ? '600' : '500',
                                            fontSize: '12px',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div>{item.year || 'N/A'}</div>
                                        {item.isCurrentYear && (
                                            <div style={{
                                                fontSize: '10px',
                                                color: '#f59e0b',
                                                fontWeight: '400',
                                                marginTop: '2px'
                                            }}>
                                                Current
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Legend and Stats */}
                    <div style={{
                        marginTop: '20px',
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                    }}>
                        <div className="row align-items-center">
                            <div className="col-md-8">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '14px',
                                            height: '14px',
                                            backgroundColor: '#f59e0b',
                                            borderRadius: '50%',
                                            border: '2px solid white',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                        }}></div>
                                        <span style={{
                                            color: '#495057',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>
                                            Current Year
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '14px',
                                            height: '14px',
                                            backgroundColor: '#4f46e5',
                                            borderRadius: '50%',
                                            border: '2px solid white',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                        }}></div>
                                        <span style={{
                                            color: '#495057',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>
                                            Historical Data
                                        </span>
                                    </div>

                                    {validData.length > 1 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '20px',
                                                height: '3px',
                                                background: 'linear-gradient(90deg, #4f46e5 0%, rgba(79, 70, 229, 0.2) 100%)'
                                            }}></div>
                                            <span style={{
                                                color: '#495057',
                                                fontSize: '12px',
                                                fontWeight: '500'
                                            }}>
                                                Trend Line
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-4" style={{ textAlign: 'right' }}>
                                {validData.length > 1 && (
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '6px 12px',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #dee2e6'
                                    }}>
                                        <span style={{
                                            color: '#6c757d',
                                            fontSize: '11px',
                                            fontWeight: '500'
                                        }}>
                                            YoY Growth:
                                        </span>
                                        <span style={{
                                            color: ((validData[validData.length - 1].sales - validData[validData.length - 2].sales) / validData[validData.length - 2].sales * 100) >= 0 ? '#10b981' : '#ef4444',
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}>
                                            {((validData[validData.length - 1].sales - validData[validData.length - 2].sales) / validData[validData.length - 2].sales * 100) >= 0 ? '+' : ''}
                                            {((validData[validData.length - 1].sales - validData[validData.length - 2].sales) / validData[validData.length - 2].sales * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* New Comprehensive Overview Section */}
                    <div style={{ marginTop: '24px', borderTop: '1px solid #dee2e6', paddingTop: '20px' }}>
                        <h6 style={{ color: '#495057', marginBottom: '20px', fontWeight: '600', fontSize: '16px' }}>
                            Annual Performance Overview
                        </h6>

                        <div className="row">
                            {/* Key Financial Metrics */}
                            <div className="col-md-4 mb-3">
                                <div style={{
                                    padding: '20px',
                                    backgroundColor: '#fff',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '12px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}>
                                    <h6 style={{
                                        color: '#6c757d',
                                        fontSize: '12px',
                                        textTransform: 'uppercase',
                                        marginBottom: '15px',
                                        letterSpacing: '0.5px',
                                        fontWeight: '600'
                                    }}>
                                        Key Metrics
                                    </h6>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#4f46e5', lineHeight: '1.2' }}>
                                                ₱{(totalSales / 1000000).toFixed(1)}M
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>Total Revenue</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '20px', fontWeight: '600', color: '#10b981', lineHeight: '1.2' }}>
                                                ₱{(averageSales / 1000000).toFixed(1)}M
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>Annual Average</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: '600', color: '#f59e0b', lineHeight: '1.2' }}>
                                                {validData.length} {validData.length === 1 ? 'Year' : 'Years'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>Data Period</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Highlights */}
                            <div className="col-md-4 mb-3">
                                <div style={{
                                    padding: '20px',
                                    backgroundColor: '#fff',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '12px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}>
                                    <h6 style={{
                                        color: '#6c757d',
                                        fontSize: '12px',
                                        textTransform: 'uppercase',
                                        marginBottom: '15px',
                                        letterSpacing: '0.5px',
                                        fontWeight: '600'
                                    }}>
                                        Performance Highlights
                                    </h6>
                                    <div style={{ fontSize: '12px', lineHeight: '1.5', color: '#495057' }}>
                                        <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                                            <div style={{ fontWeight: '600', color: '#16a34a', marginBottom: '2px' }}>🏆 Best Year</div>
                                            <div>{bestYear?.year}: ₱{(bestYear?.sales / 1000000).toFixed(1)}M</div>
                                        </div>
                                        <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
                                            <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '2px' }}>📉 Lowest Year</div>
                                            <div>{worstYear?.year}: ₱{(worstYear?.sales / 1000000).toFixed(1)}M</div>
                                        </div>
                                        <div style={{ padding: '8px', backgroundColor: '#fffbeb', borderRadius: '6px', border: '1px solid #fed7aa' }}>
                                            <div style={{ fontWeight: '600', color: '#d97706', marginBottom: '2px' }}>📊 Range</div>
                                            <div>₱{((maxValue - minValue) / 1000000).toFixed(1)}M variation</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Growth Analysis */}
                            <div className="col-md-4 mb-3">
                                <div style={{
                                    padding: '20px',
                                    backgroundColor: '#fff',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '12px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}>
                                    <h6 style={{
                                        color: '#6c757d',
                                        fontSize: '12px',
                                        textTransform: 'uppercase',
                                        marginBottom: '15px',
                                        letterSpacing: '0.5px',
                                        fontWeight: '600'
                                    }}>
                                        Recent YoY Changes:
                                    </h6>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {yoyGrowthRates.length > 0 && (
                                            <div>

                                                <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                                                    {yoyGrowthRates.slice(-3).map((item, index) => (
                                                        <div key={index} style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            marginBottom: '2px'
                                                        }}>
                                                            <span style={{ color: '#6c757d' }}>{item.year}:</span>
                                                            <span style={{
                                                                color: item.growth >= 0 ? '#16a34a' : '#dc2626',
                                                                fontWeight: '500'
                                                            }}>
                                                                {item.growth >= 0 ? '+' : ''}{item.growth.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const SimplePieChart = ({ data, title }) => {
        if (!data || data.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">No data available</p>
                        </div>
                    </div>
                </div>
            );
        }

        const validData = data.filter(item => item && typeof item.value === 'number' && !isNaN(item.value) && item.value > 0);
        if (validData.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">No valid data available</p>
                        </div>
                    </div>
                </div>
            );
        }

        const total = validData.reduce((sum, item) => sum + item.value, 0);
        let cumulativePercentage = 0;
        const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8'];

        const slices = validData.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const startAngle = cumulativePercentage * 3.6;
            const endAngle = (cumulativePercentage + percentage) * 3.6;
            cumulativePercentage += percentage;

            const largeArcFlag = percentage > 50 ? 1 : 0;
            const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);

            return {
                ...item,
                percentage,
                pathData: `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
                color: colors[index % colors.length]
            };
        });

        return (
            <div className="card shadow" style={{ marginBottom: '20px' }}>
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <div style={{ position: 'relative', textAlign: 'center', padding: '20px 10px', minHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg 
                                    viewBox="0 0 200 200" 
                                    style={{ 
                                        width: '100%', 
                                        height: 'auto', 
                                        maxWidth: '200px',
                                        transform: 'rotate(-90deg)',
                                        overflow: 'visible'
                                    }}
                                >
                                    {slices.map((slice, index) => (
                                        <path
                                            key={index}
                                            d={slice.pathData}
                                            fill={slice.color}
                                            stroke="white"
                                            strokeWidth="2"
                                            style={{ cursor: 'pointer', transition: 'opacity 0.3s ease' }}
                                            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                            onMouseLeave={(e) => e.target.style.opacity = '1'}
                                        >
                                            <title>{slice.name}: ₱{slice.value.toLocaleString()} ({slice.percentage.toFixed(1)}%)</title>
                                        </path>
                                    ))}
                                </svg>
                                {/* Center total */}
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center',
                                    pointerEvents: 'none'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#6c757d', fontWeight: 'bold' }}>Total</div>
                                    <div style={{ fontSize: '14px', color: '#495057', fontWeight: 'bold' }}>
                                        ₱{total >= 1000000
                                            ? (total / 1000000).toFixed(1) + 'M'
                                            : (total / 1000).toFixed(0) + 'k'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                {slices.map((slice, index) => (
                                    <div key={index} className="d-flex align-items-center justify-content-between mb-2" style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                        <div className="d-flex align-items-center">
                                            <div
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    backgroundColor: slice.color,
                                                    borderRadius: '3px',
                                                    marginRight: '8px'
                                                }}
                                            ></div>
                                            <small style={{ color: '#495057', fontWeight: '500' }}>
                                                {slice.name}
                                            </small>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '11px', color: '#6c757d' }}>
                                                {slice.percentage.toFixed(1)}%
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#495057', fontWeight: 'bold' }}>
                                                ₱{slice.value >= 1000000
                                                    ? (slice.value / 1000000).toFixed(1) + 'M'
                                                    : (slice.value / 1000).toFixed(0) + 'k'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                                <small style={{ color: '#495057' }}>
                                    <strong>Locations:</strong> {slices.length} | <strong>Avg:</strong> ₱{
                                        (total / slices.length) >= 1000000
                                            ? ((total / slices.length) / 1000000).toFixed(1) + 'M'
                                            : ((total / slices.length) / 1000).toFixed(0) + 'k'
                                    }
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });









    // Enhanced Recent Sales Table Component
    const RecentSalesTable = ({ salesData, title }) => {
        const recentSales = salesData.slice(-10).reverse();
        const totalAmount = recentSales.reduce((sum, sale) => sum + (parseFloat(sale.amount) || 0), 0);
        const averageAmount = recentSales.length > 0 ? totalAmount / recentSales.length : 0;
        const todaySales = recentSales.filter(sale =>
            new Date(sale.date).toDateString() === new Date().toDateString()
        );

        // Get unique locations and transaction types for stats
        const uniqueLocations = [...new Set(recentSales.map(sale => sale.location_name).filter(Boolean))];
        const uniqueTransactionTypes = [...new Set(recentSales.map(sale => sale.sales_from).filter(Boolean))];

        const getTransactionTypeColor = (type) => {
            const colors = {
                'POS': '#3b82f6',
                'Online': '#10b981',
                'Mobile': '#f59e0b',
                'Walk-in': '#8b5cf6',
                'Delivery': '#ef4444'
            };
            return colors[type] || '#6c757d';
        };

        const getAmountColor = (amount) => {
            if (amount >= averageAmount * 1.5) return '#10b981'; // High value - Green
            if (amount >= averageAmount) return '#10b981'; // Above average - Blue
            if (amount >= averageAmount * 0.5) return '#10b981'; // Below average - Orange
            return '#10b981'; // Low value - Red
        };

        return (
            <div className="card shadow" style={{ marginBottom: '20px', minHeight: '600px' }}>
                <div className="card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Enhanced Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '24px',
                        paddingBottom: '16px',
                        borderBottom: '2px solid #e9ecef'
                    }}>
                        <div>
                            <h5 className="card-title" style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                margin: 0,
                                marginBottom: '4px',
                                color: '#495057'
                            }}>
                                {title}
                            </h5>
                            <p style={{
                                color: '#6c757d',
                                fontSize: '14px',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span>Last 10 transactions</span>
                                {todaySales.length > 0 && (
                                    <span style={{
                                        backgroundColor: '#ffc107',
                                        color: '#000',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: '600'
                                    }}>
                                        {todaySales.length} today
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Quick Stats Cards */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textAlign: 'center',
                                border: '1px solid #e9ecef',
                                minWidth: '100px'
                            }}>
                                <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981', lineHeight: '1' }}>
                                    ₱{(totalAmount / 1000000).toFixed(1)}M
                                </div>
                                <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: '500', marginTop: '2px' }}>
                                    Total Value
                                </div>
                            </div>

                            <div style={{
                                backgroundColor: '#f8f9fa',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textAlign: 'center',
                                border: '1px solid #e9ecef',
                                minWidth: '100px'
                            }}>
                                <div style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6', lineHeight: '1' }}>
                                    ₱{(averageAmount / 1000).toFixed(0)}K
                                </div>
                                <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: '500', marginTop: '2px' }}>
                                    Average
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Table */}
                    <div
                        className="table-responsive"
                        style={{
                            flex: 1,
                            maxHeight: '450px',
                            overflowY: 'auto',
                            border: '1px solid #e9ecef',
                            borderRadius: '8px'
                        }}
                    >
                        <table className="table table-hover mb-0" style={{ fontSize: '13px' }}>
                            <thead style={{
                                position: 'sticky',
                                top: 0,
                                backgroundColor: '#f8f9fa',
                                zIndex: 10,
                                borderBottom: '2px solid #dee2e6'
                            }}>
                                <tr>
                                    <th style={{
                                        border: 'none',
                                        padding: '16px 12px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        color: '#495057',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Date & Time
                                    </th>
                                    <th style={{
                                        border: 'none',
                                        padding: '16px 12px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        color: '#495057',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Location
                                    </th>
                                    <th style={{
                                        border: 'none',
                                        padding: '16px 12px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        color: '#495057',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Type
                                    </th>
                                    <th style={{
                                        border: 'none',
                                        padding: '16px 12px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        color: '#495057',
                                        textAlign: 'right',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Amount
                                    </th>
                                    <th style={{
                                        border: 'none',
                                        padding: '16px 12px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        color: '#495057',
                                        textAlign: 'center',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSales.map((sale, index) => {
                                    const isToday = new Date(sale.date).toDateString() === new Date().toDateString();
                                    const saleAmount = parseFloat(sale.amount) || 0;
                                    const amountColor = getAmountColor(saleAmount);
                                    const transactionColor = getTransactionTypeColor(sale.sales_from);

                                    return (
                                        <tr
                                            key={index}
                                            style={{
                                                backgroundColor: isToday ? '#fff3cd' : (index % 2 === 0 ? '#f8f9fa' : 'white'),
                                                borderLeft: isToday ? '4px solid #ffc107' : 'none',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isToday) {
                                                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isToday) {
                                                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : 'white';
                                                }
                                            }}
                                        >
                                            <td style={{ padding: '16px 12px', border: 'none', borderBottom: '1px solid #f1f3f4' }}>
                                                <div style={{ fontWeight: '600', color: '#495057', marginBottom: '4px' }}>
                                                    {new Date(sale.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                    {isToday && (
                                                        <span style={{
                                                            marginLeft: '8px',
                                                            backgroundColor: '#ffc107',
                                                            color: '#000',
                                                            padding: '1px 6px',
                                                            borderRadius: '8px',
                                                            fontSize: '9px',
                                                            fontWeight: '700'
                                                        }}>
                                                            TODAY
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: '#6c757d',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <span>{new Date(sale.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                    <span style={{ color: '#dee2e6' }}>•</span>
                                                    <span>
                                                        {(() => {
                                                            const [hours, minutes] = sale.time.split(':');
                                                            const date = new Date();
                                                            date.setHours(parseInt(hours), parseInt(minutes));
                                                            return date.toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            });
                                                        })()}
                                                    </span>
                                                </div>
                                            </td>

                                            <td style={{ padding: '16px 12px', border: 'none', borderBottom: '1px solid #f1f3f4' }}>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <div style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        backgroundColor: '#10b981',
                                                        borderRadius: '50%'
                                                    }}></div>
                                                    {sale.location_name || 'Unknown Location'}
                                                </div>
                                            </td>

                                            <td style={{ padding: '16px 12px', border: 'none', borderBottom: '1px solid #f1f3f4' }}>
                                                <span style={{
                                                    textAlign: 'center',
                                                    backgroundColor: `${transactionColor}15`,
                                                    // color: transactionColor,
                                                    // padding: '4px 12px',
                                                    // borderRadius: '16px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    // border: `1px solid ${transactionColor}30`
                                                }}>
                                                    {sale.sales_from || 'Unknown'}
                                                </span>


                                            </td>

                                            <td style={{
                                                padding: '16px 12px',
                                                border: 'none',
                                                borderBottom: '1px solid #f1f3f4',
                                                textAlign: 'right'
                                            }}>
                                                <div style={{
                                                    fontWeight: '700',
                                                    color: amountColor,
                                                    fontSize: '14px',
                                                    marginBottom: '2px'
                                                }}>
                                                    ₱{saleAmount.toLocaleString()}
                                                </div>
                                                <div style={{
                                                    fontSize: '10px',
                                                    color: '#6c757d'
                                                }}>
                                                    {((saleAmount / totalAmount) * 100).toFixed(1)}% of total
                                                </div>
                                            </td>

                                            <td style={{
                                                padding: '16px 12px',
                                                border: 'none',
                                                borderBottom: '1px solid #f1f3f4',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{
                                                        backgroundColor: '#d4edda',
                                                        color: '#155724',
                                                        fontSize: '10px',
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontWeight: '600',
                                                        border: '1px solid #c3e6cb'
                                                    }}>
                                                        ✓ Completed
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Enhanced Summary Section */}
                    <div style={{
                        marginTop: '20px',
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                        border: '1px solid #e9ecef'
                    }}>
                        <div className="row">
                            <div className="col-md-8">
                                <div style={{ marginBottom: '16px' }}>
                                    <h6 style={{
                                        color: '#495057',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        margin: 0,
                                        marginBottom: '12px'
                                    }}>
                                        Transaction Insights
                                    </h6>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '12px',
                                            backgroundColor: 'white',
                                            borderRadius: '8px',
                                            border: '1px solid #dee2e6'
                                        }}>
                                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
                                                ₱{Math.max(...recentSales.map(s => parseFloat(s.amount) || 0)).toLocaleString()}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: '500' }}>
                                                Highest Transaction
                                            </div>
                                        </div>

                                        <div style={{
                                            textAlign: 'center',
                                            padding: '12px',
                                            backgroundColor: 'white',
                                            borderRadius: '8px',
                                            border: '1px solid #dee2e6'
                                        }}>
                                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#ef4444', marginBottom: '4px' }}>
                                                ₱{Math.min(...recentSales.map(s => parseFloat(s.amount) || 0)).toLocaleString()}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: '500' }}>
                                                Lowest Transaction
                                            </div>
                                        </div>

                                        <div style={{
                                            textAlign: 'center',
                                            padding: '12px',
                                            backgroundColor: 'white',
                                            borderRadius: '8px',
                                            border: '1px solid #dee2e6'
                                        }}>
                                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
                                                {uniqueLocations.length}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: '500' }}>
                                                Active Locations
                                            </div>
                                        </div>

                                        <div style={{
                                            textAlign: 'center',
                                            padding: '12px',
                                            backgroundColor: 'white',
                                            borderRadius: '8px',
                                            border: '1px solid #dee2e6'
                                        }}>
                                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>
                                                {uniqueTransactionTypes.length}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: '500' }}>
                                                Payment Methods
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div style={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    padding: '16px',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    border: '2px solid #e9ecef',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px', fontWeight: '600' }}>
                                        PERFORMANCE SUMMARY
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#495057', marginBottom: '8px' }}>
                                        {recentSales.length}/10
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '12px' }}>
                                        Recent Transactions
                                    </div>

                                    {todaySales.length > 0 && (
                                        <div style={{
                                            backgroundColor: '#fff3cd',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ffc107'
                                        }}>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#856404' }}>
                                                ₱{todaySales.reduce((sum, sale) => sum + (parseFloat(sale.amount) || 0), 0).toLocaleString()}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#856404' }}>
                                                Today's Sales
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Prepare chart data
    const weeklyTrendData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dailyAmount = salesByInvoice
            .filter(sale => sale.date === dateStr)
            .reduce((total, sale) => total + (parseFloat(sale.amount) || 0), 0);

        weeklyTrendData.push({
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            sales: isNaN(dailyAmount) ? 0 : dailyAmount,
            date: dateStr
        });
    }

    // Prepare monthly chart data
    const monthlyTrendData = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 12; i++) {
        const monthlyAmount = salesByInvoice
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === i && saleDate.getFullYear() === currentYear;
            })
            .reduce((total, sale) => total + (parseFloat(sale.amount) || 0), 0);

        monthlyTrendData.push({
            month: monthNames[i],
            sales: isNaN(monthlyAmount) ? 0 : monthlyAmount,
            isCurrentMonth: i === currentMonth
        });
    }

    // Prepare yearly chart data
    const yearlyTrendData = [];
    const currentYearValue = new Date().getFullYear();

    const availableYears = [...new Set(salesByInvoice.map(sale => {
        const year = new Date(sale.date).getFullYear();
        return isNaN(year) ? null : year;
    }).filter(year => year !== null))];

    const yearsToShow = availableYears.length > 0 ? availableYears :
        Array.from({ length: 5 }, (_, i) => currentYearValue - 4 + i);

    const sortedYears = [...new Set([...yearsToShow, currentYearValue])].sort();

    sortedYears.forEach(year => {
        const yearlyAmount = salesByInvoice
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getFullYear() === year;
            })
            .reduce((total, sale) => total + (parseFloat(sale.amount) || 0), 0);

        yearlyTrendData.push({
            year: year.toString(),
            sales: isNaN(yearlyAmount) ? 0 : yearlyAmount,
            isCurrentYear: year === currentYearValue
        });
    });

    // Location sales data for pie chart
    const locationSales = salesByInvoice.reduce((acc, sale) => {
        const location = sale.location_name || 'Unknown';
        const amount = parseFloat(sale.amount) || 0;
        acc[location] = (acc[location] || 0) + amount;
        return acc;
    }, {});

    const locationData = Object.entries(locationSales)
        .filter(([name, value]) => !isNaN(value) && value > 0)
        .map(([name, value]) => ({
            name,
            value,
            percentage: (value / Object.values(locationSales).reduce((a, b) => a + b, 0)) * 100
        }));

    // Add this BEFORE the return statement (around line 1234)

    // Prepare monthly sales by location data
    const getMonthlySalesByLocation = (salesData) => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Filter sales for current month
        const monthlyData = salesData.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
        });

        // Group by location
        const locationSales = {};
        monthlyData.forEach(sale => {
            const locationName = sale.location_name || 'Unknown Location';
            if (!locationSales[locationName]) {
                locationSales[locationName] = 0;
            }
            locationSales[locationName] += parseFloat(sale.amount || 0);
        });

        return locationSales;
    };

    const monthlyLocationSales = getMonthlySalesByLocation(salesByInvoice);
    const monthlyLocationData = Object.entries(monthlyLocationSales)
        .filter(([name, value]) => !isNaN(value) && value > 0)
        .map(([name, value]) => ({
            name,
            value
        }));

    return (
        <div className='dash-main'>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <h1 className='h-dashboard' style={{
                    color: '#333',
                    margin: 0,
                    fontSize: '2.5em',
                    fontWeight: 'bold'
                }}>
                    DASHBOARD
                </h1>
                
                <button
                    onClick={manualSendNotifications}
                    disabled={sendingEmails}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: sendingEmails ? '#ccc' : '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: sendingEmails ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        if (!sendingEmails) {
                            e.currentTarget.style.backgroundColor = '#5568d3';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!sendingEmails) {
                            e.currentTarget.style.backgroundColor = '#667eea';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }
                    }}
                >
                    {sendingEmails ? (
                        <>
                            <span style={{ 
                                display: 'inline-block',
                                width: '16px',
                                height: '16px',
                                border: '2px solid white',
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}></span>
                            Sending...
                        </>
                    ) : (
                        <>
                            📧 Send Payment Reminders
                        </>
                    )}
                </button>
            </div>

            <div className="container-fluid" >
                {/* Sales Overview Cards - Now clickable */}
                <div className="row mb-4">
                    <div className="col-md-4 mb-3">
                        <div
                            className="card shadow"
                            style={{
                                borderLeft: '4px solid #007bff',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onClick={() => handleSalesCardClick('daily')}
                            title="Click to view daily sales details"
                        >
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>Daily Sales</p>


                                        <h3 className="font-weight-bold mb-0"> {(counts.dailySales || 0).toLocaleString()}</h3>

                                        <div className="d-flex align-items-center mt-2">
                                            <TrendingUp size={16} color="#28a745" className="me-1" />
                                            <small className="text-success">Today's performance</small>
                                        </div>
                                    </div>
                                    <div style={{ backgroundColor: '#e3f2fd', padding: '12px', borderRadius: '50%' }}>
                                        <PesoSign size={24} color="#007bff" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4 mb-3">
                        <div
                            className="card shadow"
                            style={{
                                borderLeft: '4px solid #28a745',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onClick={() => handleSalesCardClick('weekly')}
                            title="Click to view weekly sales details"
                        >
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>Weekly Sales</p>
                                        <h3 className="font-weight-bold mb-0">{counts.weeklySales}</h3>
                                        <div className="d-flex align-items-center mt-2">
                                            <TrendingUp size={16} color="#28a745" className="me-1" />
                                            <small className="text-success">This week</small>
                                        </div>
                                    </div>
                                    <div style={{ backgroundColor: '#e8f5e8', padding: '12px', borderRadius: '50%' }}>
                                        <Calendar size={24} color="#28a745" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4 mb-3">
                        <div
                            className="card shadow"
                            style={{
                                borderLeft: '4px solid #6f42c1',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onClick={() => handleSalesCardClick('monthly')}
                            title="Click to view monthly sales details"
                        >
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>Monthly Sales</p>
                                        <h3 className="font-weight-bold mb-0">{counts.montlySales}</h3>
                                        <div className="d-flex align-items-center mt-2">
                                            <TrendingUp size={16} color="#6f42c1" className="me-1" />
                                            <small style={{ color: '#6f42c1' }}>This month</small>
                                        </div>
                                    </div>
                                    <div style={{ backgroundColor: '#f3e5f5', padding: '12px', borderRadius: '50%' }}>
                                        <TrendingUp size={24} color="#6f42c1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Stats Cards */}
                <div className="row mb-4">
                    <div className="col-md-3 mb-3">
                        <div className="card shadow" style={{ transition: 'all 0.3s ease' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div style={{ backgroundColor: '#fff3cd', padding: '12px', borderRadius: '50%', marginRight: '15px' }}>
                                        <Users size={24} color="#856404" />
                                    </div>
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>Customers</p>
                                        <h4 className="font-weight-bold mb-0">{counts.customerCount}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 mb-3">
                        <div className="card shadow" style={{ transition: 'all 0.3s ease' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div style={{ backgroundColor: '#f8d7da', padding: '12px', borderRadius: '50%', marginRight: '15px' }}>
                                        <MapPin size={24} color="#721c24" />
                                    </div>
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>Locations</p>
                                        <h4 className="font-weight-bold mb-0">{counts.locationCount}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 mb-3">
                        <div className="card shadow" style={{ transition: 'all 0.3s ease' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div style={{ backgroundColor: '#d1ecf1', padding: '12px', borderRadius: '50%', marginRight: '15px' }}>
                                        <BarChart3 size={24} color="#0c5460" />
                                    </div>
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>Products</p>
                                        <h4 className="font-weight-bold mb-0">{counts.prodCount}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 mb-3">
                        <div className="card shadow" style={{ transition: 'all 0.3s ease' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div style={{ backgroundColor: '#fff3cd', padding: '12px', borderRadius: '50%', marginRight: '15px' }}>
                                        <Users size={24} color="#856404" />
                                    </div>
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>Users</p>
                                        <h4 className="font-weight-bold mb-0">{counts.userCount}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                {salesByInvoice.length > 0 && (
                    <>
                        {/* Monthly & Yearly Charts */}
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <MonthlyLineChart
                                    data={monthlyTrendData}
                                    title={`Monthly Performance (${new Date().getFullYear()})`}
                                />
                            </div>
                            <div className="col-md-6">
                                {locationData.length > 0 && (
                                    <SimplePieChart data={locationData} title="Total Sales by Location" />
                                )}
                                {monthlyLocationData.length > 0 && (
                                    <SimplePieChart
                                        data={monthlyLocationData}
                                        title={`${currentMonthYear} Sales by Location`}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Weekly Trend & Location Sales */}
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <LineChart data={weeklyTrendData} title="Weekly Sales Trend" />
                            </div>
                            <div className="col-md-6">
                                <YearlyChart data={yearlyTrendData} title="Yearly Performance Trend" />

                            </div>
                        </div>

                        {/* Daily Performance & Recent Sales - Now using half width */}
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <BarChart data={weeklyTrendData} title="Daily Sales Performance" />
                            </div>
                            <div className="col-md-6">
                                <RecentSalesTable salesData={salesByInvoice} title="Recent Sales" />
                            </div>
                        </div>
                    </>
                )}

                {/* Summary section */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    marginTop: '20px',
                    marginBottom: '40px'
                }}>
                    <h2 style={{
                        color: '#333',
                        marginBottom: '20px',
                        fontSize: '1.5em'
                    }}>
                        Collection Summary
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '20px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            borderLeft: '4px solid #62f436ff'
                        }}>
                            <span style={{ fontWeight: '500', color: '#666' }}>
                                Total Due Today:
                            </span>
                            <span style={{
                                fontSize: '1.3em',
                                fontWeight: 'bold',
                                color: '#39f436ff',
                                animation: 'blink 2s infinite'
                            }}>
                                {counts.dailyCollection}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            borderLeft: '4px solid #FF5722'
                        }}>
                            <span style={{ fontWeight: '500', color: '#666' }}>
                                Total Due This Week:
                            </span>
                            <span style={{
                                fontSize: '1.3em',
                                fontWeight: 'bold',
                                color: '#39f436ff'
                            }}>
                                {counts.weeklyCollection}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            borderLeft: '4px solid #795548'
                        }}>
                            <span style={{ fontWeight: '500', color: '#666' }}>
                                Total Due This Month:
                            </span>
                            <span style={{
                                fontSize: '1.3em',
                                fontWeight: 'bold',
                                color: '#39f436ff'
                            }}>
                                {counts.monthlyCollection}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Debug Info - Remove after testing */}
                {/* <div className="alert alert-info" style={{ margin: '20px 0' }}>
                    <h6>🔧 Debug Info:</h6>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <p><strong>Installment List Length:</strong> {installmentList.length}</p>
                            <p><strong>Overdue Customers Length:</strong> {overdueCustomers.length}</p>
                            <p><strong>Daily Collection:</strong> {counts.dailyCollection}</p>
                        </div>
                        <div>
                            <p><strong>Total Customers with Dues:</strong> {counts.totalCustomersWithDue}</p>
                            <p><strong>Overdue Amount:</strong> {counts.overdueAmount}</p>
                            <p><strong>Customer List Length:</strong> {customerList.length}</p>
                        </div>
                    </div>
                    {installmentList.length === 0 && (
                        <p style={{color: 'red', fontWeight: 'bold', marginTop: '10px'}}>
                            ⚠️ No installment data loaded - check API response in console!
                        </p>
                    )}
                    {installmentList.length > 0 && overdueCustomers.length === 0 && (
                        <p style={{color: 'green', fontWeight: 'bold', marginTop: '10px'}}>
                            ✅ {installmentList.length} installments loaded, but no overdue customers found (all up to date!)
                        </p>
                    )}
                    <details style={{ marginTop: '10px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#007bff' }}>
                            View Sample Installment Data
                        </summary>
                        {installmentList.length > 0 && (
                            <pre style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '10px', 
                                borderRadius: '5px',
                                fontSize: '12px',
                                maxHeight: '200px',
                                overflow: 'auto',
                                marginTop: '10px'
                            }}>
                                {JSON.stringify(installmentList[0], null, 2)}
                            </pre>
                        )}
                    </details>
                </div> */}

                {/* Collection Insights */}
                <div className="row mb-4">
                    <div className="col-md-8">
                        <div className="card shadow">
                            <div className="card-body">
                                <h5>Collection Summary & Insights</h5>
                                <div className="row">
                                    <div className="col-md-4">
                                        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                                            <span>Total Due Today:</span>
                                            <h4 style={{ color: '#46f436ff' }}>{counts.dailyCollection}</h4>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                                            <span>Total Due This Week:</span>
                                            <h4 style={{ color: '#46f436ff' }}>{counts.weeklyCollection}</h4>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                                            <span>Total Due This Month:</span>
                                            <h4 style={{ color: '#46f436ff' }}>{counts.monthlyCollection}</h4>
                                        </div>
                                    </div>
                                </div>

                                {/* Insights */}
                                <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                                    <h6>Collection Insights</h6>
                                    <p>Priority Focus: {parseInt(counts.dailyDueCustomers) > 10 ? 'High daily collection volume' : 'Manageable daily collections'}</p>
                                    <p>Customer Coverage: {Math.round((parseInt(counts.totalCustomersWithDue) / parseInt(counts.customerCount)) * 100)}% of customers have dues</p>
                                    <p>Recommendation: {overdueCustomers.length > 0 ? 'Address overdue accounts first' : 'Focus on timely collections'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card shadow">
                            <div className="card-body">
                                <h6>Customer Due Status</h6>
                                <div style={{ padding: '12px', background: '#f0fff4', borderRadius: '6px', marginBottom: '10px' }}>
                                    <span>Total Customers with Dues</span>
                                    <h4 style={{ color: '#46f436ff' }}>{counts.totalCustomersWithDue}</h4>
                                </div>
                                {groupedOverdueCustomers.length > 0 && (
                                    <div style={{ padding: '12px', background: '#ffebee', borderRadius: '6px' }}>
                                        <span>Overdue Customers Count</span>
                                        <h4 style={{ color: '#E91E63' }}>{groupedOverdueCustomers.length}</h4>
                                        <small style={{ color: '#E91E63' }}>Total Overdue: {counts.overdueAmount}</small>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* No Overdue Message */}
                {installmentList.length > 0 && groupedOverdueCustomers.length === 0 && (
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        marginTop: '20px',
                        borderTop: '4px solid #4CAF50',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                        <h2 style={{
                            color: '#4CAF50',
                            marginBottom: '12px',
                            fontSize: '1.5em'
                        }}>
                            All Payments Are Up to Date!
                        </h2>
                        <p style={{ color: '#666', fontSize: '1.1em' }}>
                            No overdue customers at this time. All installment payments are current or within the grace period.
                        </p>
                    </div>
                )}

                {/* Overdue Customers Board */}
                {groupedOverdueCustomers.length > 0 && (
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        marginTop: '20px',
                        borderTop: '4px solid #E91E63'
                    }}>
                        <h2 style={{
                            color: '#E91E63',
                            marginBottom: '20px',
                            fontSize: '1.5em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            🚨 Overdue Customers ({groupedOverdueCustomers.length})
                        </h2>

                        {/* Grace Period Info Box */}
                        <div style={{
                            marginBottom: '15px',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                            borderRadius: '8px',
                            borderLeft: '4px solid #4CAF50',
                            marginBottom: '12px'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px'
                            }}>
                                <span style={{ fontSize: '1.2em' }}>ℹ️</span>
                                <strong style={{ color: '#2e7d32', fontSize: '1.05em' }}>
                                    Grace Period Policy
                                </strong>
                            </div>
                            <div style={{ fontSize: '0.9em', color: '#1b5e20', lineHeight: '1.6' }}>
                                Customers have a <strong>3-day grace period</strong> after the due date with <strong>no penalty</strong>.
                                <br />
                                A <strong>5% penalty</strong> will be applied starting on the 4th day after the due date.
                            </div>
                        </div>

                        {/* Total Overdue Amount */}
                        <div style={{
                            marginBottom: '15px',
                            padding: '12px',
                            background: '#ffebee',
                            borderRadius: '8px',
                            borderLeft: '4px solid #E91E63'
                        }}>
                            <strong style={{ color: '#E91E63' }}>
                                Total Overdue Amount: {counts.overdueAmount}
                            </strong>
                        </div>

                        {/* Overdue Customers Table */}
                        <div style={{
                            maxHeight: '400px',
                            overflowY: 'auto',
                            border: '1px solid #ddd',
                            borderRadius: '8px'
                        }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.9em'
                            }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #ddd',
                                            color: '#666',
                                            fontWeight: '600'
                                        }}>
                                            Customer Name
                                        </th>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'center',
                                            borderBottom: '2px solid #ddd',
                                            color: '#666',
                                            fontWeight: '600'
                                        }}>
                                            Overdue Payments
                                        </th>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'right',
                                            borderBottom: '2px solid #ddd',
                                            color: '#666',
                                            fontWeight: '600'
                                        }}>
                                            Total Amount Due
                                        </th>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'center',
                                            borderBottom: '2px solid #ddd',
                                            color: '#666',
                                            fontWeight: '600'
                                        }}>
                                            Max Days Overdue
                                        </th>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'center',
                                            borderBottom: '2px solid #ddd',
                                            color: '#666',
                                            fontWeight: '600'
                                        }}>
                                            Status
                                        </th>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'center',
                                            borderBottom: '2px solid #ddd',
                                            color: '#666',
                                            fontWeight: '600'
                                        }}>
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedOverdueCustomers.slice(0, 10).map((customer, index) => (
                                        <tr key={index} style={{
                                            borderBottom: '1px solid #eee',
                                            backgroundColor: customer.maxDaysPastDue > 30 ? '#ffebee' :
                                                customer.maxDaysPastDue > 3 ? '#fff3e0' : '#e8f5e9',
                                            cursor: 'pointer'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    customer.maxDaysPastDue > 30 ? '#ffebee' :
                                                        customer.maxDaysPastDue > 3 ? '#fff3e0' : '#e8f5e9';
                                            }}
                                            onClick={() => handleCustomerClick(customer.cust_id)}
                                        >
                                            <td style={{
                                                padding: '12px',
                                                fontWeight: '500',
                                                color: '#333'
                                            }}>
                                                {GetCustName(customer.cust_id)}
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'center',
                                                color: '#666',
                                                fontWeight: 'bold'
                                            }}>
                                                {customer.paymentCount} {customer.paymentCount === 1 ? 'payment' : 'payments'}
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'right'
                                            }}>
                                                <div style={{
                                                    fontWeight: 'bold',
                                                    color: customer.hasPenalty ? '#E91E63' : '#4CAF50',
                                                    fontSize: '1.1em'
                                                }}>
                                                    {new Intl.NumberFormat('en-PH', {
                                                        style: 'currency',
                                                        currency: 'PHP'
                                                    }).format(customer.totalAmountWithPenalty)}
                                                </div>
                                                {/* {customer.hasPenalty && (
                                                    <div style={{
                                                        fontSize: '0.75em',
                                                        color: '#E91E63',
                                                        fontWeight: 'normal'
                                                    }}>
                                                        Includes 5% penalty
                                                    </div>
                                                )} */}
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: customer.maxDaysPastDue > 30 ? '#d32f2f' :
                                                    customer.maxDaysPastDue > 3 ? '#f57c00' : '#388e3c'
                                            }}>
                                                {customer.maxDaysPastDue} days
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'center'
                                            }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8em',
                                                    fontWeight: 'bold',
                                                    backgroundColor: customer.maxDaysPastDue > 30 ? '#ffcdd2' :
                                                        customer.maxDaysPastDue > 3 ? '#fff3e0' : '#c8e6c9',
                                                    color: customer.maxDaysPastDue > 30 ? '#d32f2f' :
                                                        customer.maxDaysPastDue > 3 ? '#f57c00' : '#2e7d32'
                                                }}>
                                                    {customer.maxDaysPastDue > 30 ? 'CRITICAL' :
                                                        customer.maxDaysPastDue > 3 ? 'OVERDUE' : 'GRACE PERIOD'}
                                                </span>
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'center'
                                            }}>
                                                <button style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#667eea',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85em',
                                                    fontWeight: '500',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCustomerClick(customer.cust_id);
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#5568d3';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#667eea';
                                                    }}
                                                >
                                                    View All
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {groupedOverdueCustomers.length > 10 && (
                                <div style={{
                                    padding: '12px',
                                    textAlign: 'center',
                                    backgroundColor: '#f8f9fa',
                                    borderTop: '1px solid #ddd',
                                    color: '#666'
                                }}>
                                    Showing 10 of {groupedOverdueCustomers.length} overdue customers
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Collection Details Modal */}
                {showCollectionModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                        onClick={() => setShowCollectionModal(false)}
                    >
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '30px',
                            maxWidth: '1000px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                        }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px'
                            }}>
                                <h2 style={{
                                    margin: 0,
                                    color: '#333',
                                    fontSize: '1.8em'
                                }}>
                                    {selectedCollection === 'daily' && '💰 Daily Collection Details'}
                                    {selectedCollection === 'weekly' && '📅 Weekly Collection Details'}
                                    {selectedCollection === 'monthly' && '📊 Monthly Collection Details'}
                                </h2>
                                <button
                                    onClick={() => setShowCollectionModal(false)}
                                    style={{
                                        background: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '40px',
                                        height: '40px',
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {(() => {
                                const collectionCustomers = getCollectionCustomers();
                                const totalAmount = collectionCustomers.reduce((sum, inst) => 
                                    sum + (parseFloat(inst.amount_due) || 0), 0
                                );

                                return (
                                    <>
                                        <div style={{
                                            padding: '16px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '8px',
                                            marginBottom: '20px',
                                            borderLeft: '4px solid #46f436ff'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div>
                                                    <strong style={{ fontSize: '1.1em', color: '#666' }}>
                                                        Total Amount Due:
                                                    </strong>
                                                    <div style={{
                                                        fontSize: '2em',
                                                        fontWeight: 'bold',
                                                        color: '#46f436ff',
                                                        marginTop: '5px'
                                                    }}>
                                                        {new Intl.NumberFormat('en-PH', {
                                                            style: 'currency',
                                                            currency: 'PHP'
                                                        }).format(totalAmount)}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <strong style={{ fontSize: '1.1em', color: '#666' }}>
                                                        Total Customers:
                                                    </strong>
                                                    <div style={{
                                                        fontSize: '2em',
                                                        fontWeight: 'bold',
                                                        color: '#46f436ff',
                                                        marginTop: '5px'
                                                    }}>
                                                        {collectionCustomers.length}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {collectionCustomers.length === 0 ? (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '40px',
                                                color: '#999',
                                                fontSize: '1.2em'
                                            }}>
                                                No customers with due payments for this period
                                            </div>
                                        ) : (
                                            <div style={{
                                                border: '1px solid #ddd',
                                                borderRadius: '8px',
                                                overflow: 'hidden'
                                            }}>
                                                <table style={{
                                                    width: '100%',
                                                    borderCollapse: 'collapse',
                                                    fontSize: '0.9em'
                                                }}>
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                                            <th style={{
                                                                padding: '12px',
                                                                textAlign: 'left',
                                                                borderBottom: '2px solid #ddd',
                                                                color: '#666',
                                                                fontWeight: '600'
                                                            }}>
                                                                Customer Name
                                                            </th>
                                                            <th style={{
                                                                padding: '12px',
                                                                textAlign: 'left',
                                                                borderBottom: '2px solid #ddd',
                                                                color: '#666',
                                                                fontWeight: '600'
                                                            }}>
                                                                Payment #
                                                            </th>
                                                            <th style={{
                                                                padding: '12px',
                                                                textAlign: 'left',
                                                                borderBottom: '2px solid #ddd',
                                                                color: '#666',
                                                                fontWeight: '600'
                                                            }}>
                                                                Due Date
                                                            </th>
                                                            <th style={{
                                                                padding: '12px',
                                                                textAlign: 'right',
                                                                borderBottom: '2px solid #ddd',
                                                                color: '#666',
                                                                fontWeight: '600'
                                                            }}>
                                                                Amount Due
                                                            </th>
                                                            <th style={{
                                                                padding: '12px',
                                                                textAlign: 'center',
                                                                borderBottom: '2px solid #ddd',
                                                                color: '#666',
                                                                fontWeight: '600'
                                                            }}>
                                                                Status
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {collectionCustomers.map((installment, index) => {
                                                            const dueDate = new Date(installment.due_date);
                                                            const today = new Date();
                                                            const isToday = installment.due_date === today.toISOString().split('T')[0];
                                                            const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

                                                            return (
                                                                <tr key={index} style={{
                                                                    borderBottom: '1px solid #eee',
                                                                    backgroundColor: isToday ? '#e8f5e9' : 'white'
                                                                }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = isToday ? '#e8f5e9' : 'white';
                                                                    }}
                                                                >
                                                                    <td style={{
                                                                        padding: '12px',
                                                                        fontWeight: '500',
                                                                        color: '#333'
                                                                    }}>
                                                                        {GetCustName(installment.cust_id)}
                                                                    </td>
                                                                    <td style={{
                                                                        padding: '12px',
                                                                        color: '#666'
                                                                    }}>
                                                                        Payment {installment.payment_number || 'N/A'}
                                                                    </td>
                                                                    <td style={{
                                                                        padding: '12px',
                                                                        color: '#666'
                                                                    }}>
                                                                        <div>
                                                                            {dueDate.toLocaleDateString('en-US', {
                                                                                weekday: 'short',
                                                                                year: 'numeric',
                                                                                month: 'short',
                                                                                day: 'numeric'
                                                                            })}
                                                                        </div>
                                                                        {daysUntilDue === 0 && (
                                                                            <div style={{
                                                                                fontSize: '0.75em',
                                                                                color: '#4CAF50',
                                                                                fontWeight: 'bold'
                                                                            }}>
                                                                                Due Today
                                                                            </div>
                                                                        )}
                                                                        {daysUntilDue > 0 && (
                                                                            <div style={{
                                                                                fontSize: '0.75em',
                                                                                color: '#666'
                                                                            }}>
                                                                                In {daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td style={{
                                                                        padding: '12px',
                                                                        textAlign: 'right',
                                                                        fontWeight: 'bold',
                                                                        color: '#46f436ff',
                                                                        fontSize: '1.1em'
                                                                    }}>
                                                                        {new Intl.NumberFormat('en-PH', {
                                                                            style: 'currency',
                                                                            currency: 'PHP'
                                                                        }).format(parseFloat(installment.amount_due))}
                                                                    </td>
                                                                    <td style={{
                                                                        padding: '12px',
                                                                        textAlign: 'center'
                                                                    }}>
                                                                        <span style={{
                                                                            padding: '4px 8px',
                                                                            borderRadius: '12px',
                                                                            fontSize: '0.8em',
                                                                            fontWeight: 'bold',
                                                                            backgroundColor: isToday ? '#c8e6c9' : '#fff3e0',
                                                                            color: isToday ? '#2e7d32' : '#f57c00'
                                                                        }}>
                                                                            {isToday ? 'DUE TODAY' : 'UPCOMING'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* Customer Payments Modal */}
                {showCustomerPaymentsModal && selectedCustomerId && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1001
                    }}
                        onClick={() => {
                            setShowCustomerPaymentsModal(false);
                            setSelectedCustomerId(null);
                        }}
                    >
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '30px',
                            maxWidth: '1000px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                        }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px'
                            }}>
                                <h2 style={{
                                    margin: 0,
                                    color: '#333',
                                    fontSize: '1.8em'
                                }}>
                                    💰 All Overdue Payments - {GetCustName(selectedCustomerId)}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowCustomerPaymentsModal(false);
                                        setSelectedCustomerId(null);
                                    }}
                                    style={{
                                        background: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '40px',
                                        height: '40px',
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {(() => {
                                const customerPayments = getCustomerPayments(selectedCustomerId);
                                const totalAmount = customerPayments.reduce((sum, inst) => 
                                    sum + (inst.amountWithPenalty || 0), 0
                                );
                                const today = new Date();
                                const GRACE_PERIOD_DAYS = 3;

                                return (
                                    <>
                                        <div style={{
                                            padding: '16px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '8px',
                                            marginBottom: '20px',
                                            borderLeft: '4px solid #E91E63'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div>
                                                    <strong style={{ fontSize: '1.1em', color: '#666' }}>
                                                        Total Overdue Amount:
                                                    </strong>
                                                    <div style={{
                                                        fontSize: '2em',
                                                        fontWeight: 'bold',
                                                        color: '#E91E63',
                                                        marginTop: '5px'
                                                    }}>
                                                        {new Intl.NumberFormat('en-PH', {
                                                            style: 'currency',
                                                            currency: 'PHP'
                                                        }).format(totalAmount)}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <strong style={{ fontSize: '1.1em', color: '#666' }}>
                                                        Total Payments:
                                                    </strong>
                                                    <div style={{
                                                        fontSize: '2em',
                                                        fontWeight: 'bold',
                                                        color: '#E91E63',
                                                        marginTop: '5px'
                                                    }}>
                                                        {customerPayments.length}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {customerPayments.length === 0 ? (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '40px',
                                                color: '#999',
                                                fontSize: '1.2em'
                                            }}>
                                                No overdue payments found for this customer
                                            </div>
                                        ) : (
                                            <div style={{
                                                border: '1px solid #ddd',
                                                borderRadius: '8px',
                                                overflow: 'hidden'
                                            }}>
                                                <table style={{
                                                    width: '100%',
                                                    borderCollapse: 'collapse',
                                                    fontSize: '0.9em'
                                                }}>
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                                            <th style={{
                                                                padding: '12px',
                                                                textAlign: 'left',
                                                                borderBottom: '2px solid #ddd',
                                                                color: '#666',
                                                                fontWeight: '600'
                                                            }}>
                                                                Payment #
                                                            </th>
                                                            <th style={{
                                                                padding: '12px',
                                                                textAlign: 'left',
                                                                borderBottom: '2px solid #ddd',
                                                                color: '#666',
                                                                fontWeight: '600'
                                                            }}>
                                                                Due Date
                                                            </th>
                                                            <th style={{
                                                                padding: '12px',
                                                                textAlign: 'right',
                                                                borderBottom: '2px solid #ddd',
                                                                color: '#666',
                                                                fontWeight: '600'
                                                            }}>
                                                                Payment Calculation
                                                            </th>
                                                            <th style={{
                                                                padding: '12px',
                                                                textAlign: 'center',
                                                                borderBottom: '2px solid #ddd',
                                                                color: '#666',
                                                                fontWeight: '600'
                                                            }}>
                                                                Days Overdue
                                                            </th>
                                                            <th style={{
                                                                padding: '12px',
                                                                textAlign: 'center',
                                                                borderBottom: '2px solid #ddd',
                                                                color: '#666',
                                                                fontWeight: '600'
                                                            }}>
                                                                Status
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {customerPayments.map((installment, index) => {
                                                            const dueDate = new Date(installment.due_date);
                                                            const daysPastDue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                                                            const hasPenalty = daysPastDue > GRACE_PERIOD_DAYS;
                                                            const originalAmount = parseFloat(installment.baseAmount || installment.amount_due) || 0;
                                                            const penaltyAmount = hasPenalty ? originalAmount * 0.05 : 0;
                                                            const totalAmount = originalAmount + penaltyAmount;
                                                            
                                                            return (
                                                                <tr key={index} style={{
                                                                    borderBottom: '1px solid #eee',
                                                                    backgroundColor: daysPastDue > 30 ? '#ffebee' :
                                                                        daysPastDue > 3 ? '#fff3e0' : '#e8f5e9'
                                                                }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor =
                                                                            daysPastDue > 30 ? '#ffebee' :
                                                                                daysPastDue > 3 ? '#fff3e0' : '#e8f5e9';
                                                                    }}
                                                                >
                                                                    <td style={{
                                                                        padding: '12px',
                                                                        fontWeight: '500',
                                                                        color: '#333'
                                                                    }}>
                                                                        Payment {installment.payment_number || 'N/A'}
                                                                    </td>
                                                                    <td style={{
                                                                        padding: '12px',
                                                                        color: '#666'
                                                                    }}>
                                                                        {dueDate.toLocaleDateString('en-US', {
                                                                            weekday: 'short',
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric'
                                                                        })}
                                                                    </td>
                                                                    <td style={{
                                                                        padding: '12px',
                                                                        textAlign: 'right'
                                                                    }}>
                                                                        <div style={{
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            alignItems: 'flex-end',
                                                                            gap: '4px'
                                                                        }}>
                                                                            <div style={{
                                                                                fontSize: '0.85em',
                                                                                color: '#666'
                                                                            }}>
                                                                                Original: {new Intl.NumberFormat('en-PH', {
                                                                                    style: 'currency',
                                                                                    currency: 'PHP'
                                                                                }).format(originalAmount)}
                                                                            </div>
                                                                            {hasPenalty && (
                                                                                <div style={{
                                                                                    fontSize: '0.85em',
                                                                                    color: '#E91E63',
                                                                                    fontWeight: '500'
                                                                                }}>
                                                                                    + Penalty (5%): {new Intl.NumberFormat('en-PH', {
                                                                                        style: 'currency',
                                                                                        currency: 'PHP'
                                                                                    }).format(penaltyAmount)}
                                                                                </div>
                                                                            )}
                                                                            <div style={{
                                                                                fontSize: '1.1em',
                                                                                fontWeight: 'bold',
                                                                                color: hasPenalty ? '#E91E63' : '#4CAF50',
                                                                                borderTop: hasPenalty ? '1px solid #ddd' : 'none',
                                                                                paddingTop: hasPenalty ? '4px' : '0',
                                                                                marginTop: hasPenalty ? '4px' : '0'
                                                                            }}>
                                                                                = Total: {new Intl.NumberFormat('en-PH', {
                                                                                    style: 'currency',
                                                                                    currency: 'PHP'
                                                                                }).format(totalAmount)}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td style={{
                                                                        padding: '12px',
                                                                        textAlign: 'center',
                                                                        fontWeight: 'bold',
                                                                        color: daysPastDue > 30 ? '#d32f2f' :
                                                                            daysPastDue > 3 ? '#f57c00' : '#388e3c'
                                                                    }}>
                                                                        {daysPastDue} days
                                                                    </td>
                                                                    <td style={{
                                                                        padding: '12px',
                                                                        textAlign: 'center'
                                                                    }}>
                                                                        <span style={{
                                                                            padding: '4px 8px',
                                                                            borderRadius: '12px',
                                                                            fontSize: '0.8em',
                                                                            fontWeight: 'bold',
                                                                            backgroundColor: daysPastDue > 30 ? '#ffcdd2' :
                                                                                daysPastDue > 3 ? '#fff3e0' : '#c8e6c9',
                                                                            color: daysPastDue > 30 ? '#d32f2f' :
                                                                                daysPastDue > 3 ? '#f57c00' : '#2e7d32'
                                                                        }}>
                                                                            {daysPastDue > 30 ? 'CRITICAL' :
                                                                                daysPastDue > 3 ? 'OVERDUE' : 'GRACE PERIOD'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* CSS Animations */}
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default DashboardAdmin;