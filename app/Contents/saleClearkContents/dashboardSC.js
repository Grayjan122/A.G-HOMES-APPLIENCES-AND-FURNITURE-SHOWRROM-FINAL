'use client';

import "../../css/dashboard.css";
import axios from 'axios';
import { useEffect, useState } from 'react';
import Router from "next/router";

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
import { AlertSucces } from "@/app/Components/SweetAlert/success";
import { showAlertError } from "@/app/Components/SweetAlert/error";

const DashboardSalesClerk = () => {
    const [counts, setCounts] = useState({
        prodCount: '0',
        categoryCount: '0',
        locationCount: '0',
        userCount: '0',
        customerCount: '0',
        ongoingDelivery: '0',
        montlySales: '0.00',
        dailySales: '0.00',
        // Collection counts
        dailyCollection: '0.00',
        weeklyCollection: '0.00',
        monthlyCollection: '0.00',
        totalCustomersWithDue: '0',
        dailyDueCustomers: '0',
        weeklyDueCustomers: '0',
        monthlyDueCustomers: '0',
        // Add overdue amount
        overdueAmount: '0.00'
    });

    const countConfigs = [
        { id: 'product_id', from: 'products', name: 'product_count', stateKey: 'prodCount' },
        { id: 'category_id', from: 'category', name: 'category_count', stateKey: 'categoryCount' },
        { id: 'location_id', from: 'location', name: 'location_count', stateKey: 'locationCount' },
        { id: 'account_id', from: 'account', name: 'user_count', stateKey: 'userCount' },
        { id: 'cust_id', from: 'customers', name: 'customer_count', stateKey: 'customerCount' },
        // Add more here if needed
    ];

    const [installmentList, setInstallmentList] = useState([]);
    const [overdueCustomers, setOverdueCustomers] = useState([]); // Add this state

    const [customerList, setCustomerList] = useState([]);

    const [sendingEmails, setSendingEmails] = useState(false);
    const [emailResults, setEmailResults] = useState(null);
    const [selectedCollection, setSelectedCollection] = useState(null); // 'daily', 'weekly', 'monthly'
    const [showCollectionModal, setShowCollectionModal] = useState(false);

    useEffect(() => {
        const user_id = sessionStorage.getItem("user_id");
        if (!user_id) {
            return;
        }
        GetCustomer();
        GetInstallment();
        countConfigs.forEach(config => fetchCount(config));
        
        // Auto-send notifications on dashboard load (optional - run once per day)
        checkAndSendNotifications();
    }, []);

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
            // console.log(response.data);

            setCustomerList(response.data);
        } catch (error) {
            console.error("Error fetching customer list:", error);
        }
    };

    const GetCustName = (custID) => {
        // alert(custID);
        const cust = customerList.find(custs => custs.cust_id == custID);
        return cust ? cust.cust_name : "Unknown Customer";
    };


    const GetInstallment = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const accountID = sessionStorage.getItem('user_id');
            const locationID = sessionStorage.getItem('location_id');
            const locName = sessionStorage.getItem('location_name');

            const response = await axios.get(`${baseURL}installment.php`, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetAllInstallmentD"
                }
            });

            setInstallmentList(response.data);

            // Calculate collections after fetching installments
            calculateCollections(response.data);

            // Calculate overdue customers
            calculateOverdueCustomers(response.data);

            // Logs(accountID, 'Viewed installment management for ' + locName);
        } catch (error) {
            console.error("Error fetching installments:", error);
        }
    };

    const calculateOverdueCustomers = (installments) => {
        if (!installments || installments.length === 0) {
            setOverdueCustomers([]);
            return;
        }

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const GRACE_PERIOD_DAYS = 3;

        const overdue = installments.filter(installment => {
            return installment.status === 'UNPAID' && installment.due_date < todayStr;
        }).map(installment => {
            const dueDate = new Date(installment.due_date);
            const daysPastDue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
            const hasPenalty = daysPastDue > GRACE_PERIOD_DAYS;
            const daysUntilPenalty = hasPenalty ? 0 : GRACE_PERIOD_DAYS - daysPastDue;
            const baseAmount = parseFloat(installment.amount_due) || 0;
            const amountWithPenalty = hasPenalty ? baseAmount * 1.05 : baseAmount;

            return {
                ...installment,
                daysPastDue,
                hasPenalty,
                daysUntilPenalty,
                baseAmount,
                amountWithPenalty
            };
        }).sort((a, b) => b.daysPastDue - a.daysPastDue);

        setOverdueCustomers(overdue);

        const totalOverdue = overdue.reduce((sum, customer) => {
            return sum + (customer.amountWithPenalty || 0);
        }, 0);

        setCounts(prev => ({
            ...prev,
            overdueAmount: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalOverdue)
        }));
    };

    const calculateCollections = (installments) => {
        console.log("Calculating collections with data:", installments);

        if (!installments || installments.length === 0) {
            console.log("No installments data available");
            return;
        }

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        console.log("Today's date:", todayStr);

        // Calculate start of week (Sunday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

        // Calculate end of week (Saturday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

        // Calculate start and end of month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
        const endOfMonthStr = endOfMonth.toISOString().split('T')[0];

        console.log("Date ranges:", {
            today: todayStr,
            weekStart: startOfWeekStr,
            weekEnd: endOfWeekStr,
            monthStart: startOfMonthStr,
            monthEnd: endOfMonthStr
        });

        let dailyCollection = 0;
        let weeklyCollection = 0;
        let monthlyCollection = 0;
        let dailyDueCustomers = new Set();
        let weeklyDueCustomers = new Set();
        let monthlyDueCustomers = new Set();
        let totalCustomersWithDue = new Set();

        installments.forEach(installment => {
            const dueDate = installment.due_date;
            const amount = parseFloat(installment.amount_due) || 0;

            console.log("Processing installment:", {
                installment_id: installment.installment_id,
                due_date: dueDate,
                amount_due: amount,
                status: installment.status
            });

            // Only count UNPAID installments
            if (installment.status === 'UNPAID') {
                totalCustomersWithDue.add(installment.installment_id);

                // Daily collection (due today)
                if (dueDate === todayStr) {
                    dailyCollection += amount;
                    dailyDueCustomers.add(installment.installment_id);
                    console.log("Added to daily collection:", amount);
                }

                // Weekly collection (due this week)
                if (dueDate >= startOfWeekStr && dueDate <= endOfWeekStr) {
                    weeklyCollection += amount;
                    weeklyDueCustomers.add(installment.installment_id);
                    console.log("Added to weekly collection:", amount);
                }

                // Monthly collection (due this month)
                if (dueDate >= startOfMonthStr && dueDate <= endOfMonthStr) {
                    monthlyCollection += amount;
                    monthlyDueCustomers.add(installment.installment_id);
                    console.log("Added to monthly collection:", amount);
                }
            }
        });

        console.log("Final calculations:", {
            dailyCollection: dailyCollection.toFixed(2),
            weeklyCollection: weeklyCollection.toFixed(2),
            monthlyCollection: monthlyCollection.toFixed(2),
            totalCustomersWithDue: totalCustomersWithDue.size,
            dailyDueCustomers: dailyDueCustomers.size,
            weeklyDueCustomers: weeklyDueCustomers.size,
            monthlyDueCustomers: monthlyDueCustomers.size
        });

        setCounts(prev => ({
            ...prev,
            // dailyCollection: dailyCollection.toFixed(2),
            dailyCollection: new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP'
            }).format(dailyCollection),
            weeklyCollection: new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP'
            }).format(weeklyCollection),
            monthlyCollection: new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP'
            }).format(monthlyCollection),
            totalCustomersWithDue: totalCustomersWithDue.size.toString(),
            dailyDueCustomers: dailyDueCustomers.size.toString(),
            weeklyDueCustomers: weeklyDueCustomers.size.toString(),
            monthlyDueCustomers: monthlyDueCustomers.size.toString()
        }));
    };

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
            
            // Show detailed results
            let message = `Email Notification Results:\n\n`;
            message += `✅ 1 Week Reminders: ${results.one_week}\n`;
            message += `✅ 3 Day Reminders: ${results.three_day}\n`;
            message += `✅ 1 Day Reminders: ${results.one_day}\n`;
            message += `✅ Overdue Notices: ${results.overdue}\n`;
            message += `\nTotal Emails Sent: ${results.total}\n\n`;
            
            if (results.total === 0) {
              
            } else {
                message += '🎉 Emails sent successfully!';
            }
            
            AlertSucces(
                message,           // title
                results.total > 0 ? "success" : "info",  // icon
                true,             // draggable
                'OK'              // button text
            );
            
            console.log('=== MANUAL SEND NOTIFICATIONS COMPLETED ===');
        } catch (error) {
            console.error('=== ERROR IN MANUAL SEND ===');
            console.error('Error details:', error);
            console.error('Error message:', error.message);
            console.error('Error response:', error.response);
            
            let errorMessage = 'Failed to send email notifications.\n\n';
            errorMessage += 'Error: ' + (error.response?.data || error.message) + '\n\n';
            errorMessage += 'Check browser console (F12) for full details.';
            
            showAlertError({
                icon: 'error',
                title: '❌ Email Sending Failed',
                text: errorMessage,
                button: 'OK'
            });
        } finally {
            setSendingEmails(false);
        }
    };

    const router = useRouter();

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
                return installment.status === 'UNPAID' && 
                       installment.due_date >= startDate && 
                       installment.due_date <= endDate;
            })
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    };

    const dashboardCards = [
        // Basic counts
        {
            title: 'Total Products',
            value: counts.prodCount,
            icon: '📦',
            color: '#4CAF50',
            path: '/products'
        },
        {
            title: 'Categories',
            value: counts.categoryCount,
            icon: '🏷️',
            color: '#FF9800',
            path: '/categories'
        },
        {
            title: 'Total Customers',
            value: counts.customerCount,
            icon: '👥',
            color: '#2196F3',
            path: '/customers'
        },
        // {
        //     title: 'Locations',
        //     value: counts.locationCount,
        //     icon: '📍',
        //     color: '#9C27B0',
        //     path: '/locations'
        // },
        // {
        //     title: 'Users',
        //     value: counts.userCount,
        //     icon: '👤',
        //     color: '#607D8B',
        //     path: '/users'
        // },

        // Collection cards
        {
            title: 'Daily Collection',
            value: `${counts.dailyCollection}`,
            subtitle: `${counts.dailyDueCustomers} customers due today`,
            icon: '💰',
            color: '#46f436ff',
            urgent: true,
            path: '/collections/daily',
            collectionType: 'daily'
        },
        {
            title: 'Weekly Collection',
            value: `${counts.weeklyCollection}`,
            subtitle: `${counts.weeklyDueCustomers} customers due this week`,
            icon: '📅',
            color: '#46f436ff',
            path: '/collections/weekly',
            collectionType: 'weekly'
        },
        {
            title: 'Monthly Collection',
            value: `${counts.monthlyCollection}`,
            subtitle: `${counts.monthlyDueCustomers} customers due this month`,
            icon: '📊',
            color: '#46f436ff',
            path: '/collections/monthly',
            collectionType: 'monthly'
        },
        {
            title: 'Customers with Dues',
            value: counts.totalCustomersWithDue,
            subtitle: 'Total customers with unpaid installments',
            icon: '⚠️',
            color: '#FF9800',
            path: '/customers/dues'
        }
    ];

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

            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    {dashboardCards.map((card, index) => (
                        <div
                            key={index}
                            onClick={() => handleCardClick(card.path, card.collectionType)}
                            className="card1"
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '24px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                borderLeft: `5px solid ${card.color}`,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                // transform: card.urgent ? 'scale(1.02)' : 'scale(1)',
                                // animation: card.urgent ? 'pulse 2s infinite' : 'none'
                            }}

                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{
                                    fontSize: '2.5em',
                                    minWidth: '60px',
                                    textAlign: 'center',
                                    color: card.color
                                }}>
                                    {card.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '1.1em',
                                        color: '#666',
                                        fontWeight: '500'
                                    }}>
                                        {card.title}
                                    </h3>
                                    <div style={{
                                        fontSize: '2.2em',
                                        fontWeight: 'bold',
                                        margin: '0 0 8px 0',
                                        lineHeight: '1',
                                        color: card.color
                                    }}>
                                        {card.value}
                                    </div>
                                    {card.subtitle && (
                                        <div style={{
                                            fontSize: '0.9em',
                                            color: '#888',
                                            marginTop: '4px',
                                            lineHeight: '1.3'
                                        }}>
                                            {card.subtitle}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary section */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    marginTop: '20px'
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

                {/* Overdue Customers Board */}
                {overdueCustomers.length > 0 && (
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
                            🚨 Overdue Customers ({overdueCustomers.length})
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
                                    {overdueCustomers.slice(0, 10).map((customer, index) => (
                                        <tr key={index} style={{
                                            borderBottom: '1px solid #eee',
                                            backgroundColor: customer.daysPastDue > 30 ? '#ffebee' :
                                                customer.daysPastDue > 3 ? '#fff3e0' : '#e8f5e9',
                                            cursor: 'pointer'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    customer.daysPastDue > 30 ? '#ffebee' :
                                                        customer.daysPastDue > 3 ? '#fff3e0' : '#e8f5e9';
                                            }}
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
                                                color: '#666'
                                            }}>
                                                Payment {customer.payment_number || 'N/A'}
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                color: '#666'
                                            }}>
                                                {new Date(customer.due_date).toLocaleDateString()}
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'right'
                                            }}>
                                                <div style={{
                                                    fontWeight: 'bold',
                                                    color: customer.hasPenalty ? '#E91E63' : '#4CAF50'
                                                }}>
                                                    {new Intl.NumberFormat('en-PH', {
                                                        style: 'currency',
                                                        currency: 'PHP'
                                                    }).format(customer.amountWithPenalty)}
                                                </div>
                                                {customer.hasPenalty ? (
                                                    <div style={{
                                                        fontSize: '0.75em',
                                                        color: '#E91E63',
                                                        fontWeight: 'normal'
                                                    }}>
                                                        +5% penalty applied
                                                    </div>
                                                ) : (
                                                    <div style={{
                                                        fontSize: '0.75em',
                                                        color: '#2e7d32',
                                                        fontWeight: 'bold',
                                                        backgroundColor: '#c8e6c9',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        display: 'inline-block'
                                                    }}>
                                                        {customer.daysUntilPenalty} {customer.daysUntilPenalty === 1 ? 'day' : 'days'} left
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: customer.daysPastDue > 30 ? '#d32f2f' :
                                                    customer.daysPastDue > 3 ? '#f57c00' : '#388e3c'
                                            }}>
                                                {customer.daysPastDue} days
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
                                                    backgroundColor: customer.daysPastDue > 30 ? '#ffcdd2' :
                                                        customer.daysPastDue > 3 ? '#fff3e0' : '#c8e6c9',
                                                    color: customer.daysPastDue > 30 ? '#d32f2f' :
                                                        customer.daysPastDue > 3 ? '#f57c00' : '#2e7d32'
                                                }}>
                                                    {customer.daysPastDue > 30 ? 'CRITICAL' :
                                                        customer.daysPastDue > 3 ? 'OVERDUE' : 'GRACE PERIOD'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {overdueCustomers.length > 10 && (
                                <div style={{
                                    padding: '12px',
                                    textAlign: 'center',
                                    backgroundColor: '#f8f9fa',
                                    borderTop: '1px solid #ddd',
                                    color: '#666'
                                }}>
                                    Showing 10 of {overdueCustomers.length} overdue customers
                                    <button style={{
                                        marginLeft: '10px',
                                        padding: '4px 12px',
                                        border: '1px solid #E91E63',
                                        backgroundColor: 'white',
                                        color: '#E91E63',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8em'
                                    }}
                                        onClick={() => {/* Add view all functionality */ }}>
                                        View All
                                    </button>
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
            </div>

            {/* CSS Animations in style tag */}
            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1.02); }
                    50% { transform: scale(1.04); }
                    100% { transform: scale(1.02); }
                }
                
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0.7; }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default DashboardSalesClerk;