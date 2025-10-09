'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { Alert } from 'react-bootstrap';
import "../../css/inventory-css/inventory.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const ITEMS_PER_PAGE = 8;
const MODAL_ITEMS_PER_PAGE = 5;
const InstallmentSC = () => {
    // Core states
    const [installmentList, setInstallmentList] = useState([]);
    const [installmentDList, setInstallmentDList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter states
    const [filterSearch, setFilterSearch] = useState('');
    const [filterBalance, setFilterBalance] = useState('');

    // Sorting states
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');

    // Modal state and selected installment data
    const [installmentDVisible, setInstallmentsDVisible] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState(null);

    // Modal pagination states
    const [currentModalPage, setCurrentModalPage] = useState(1);

    // Record Payment Modal states
    const [recordPaymentVisible, setRecordPaymentVisible] = useState(false);
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [payAllUnpaid, setPayAllUnpaid] = useState(false);

    // Receipt Modal states
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastTransaction, setLastTransaction] = useState(null);

    // Penalty Breakdown Modal states
    const [showPenaltyBreakdown, setShowPenaltyBreakdown] = useState(false);
    const [selectedPaymentForBreakdown, setSelectedPaymentForBreakdown] = useState(null);

    // Enhanced penalty calculation function with 3-day grace period
    const calculateOverduePenalty = (payment) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(payment.due_date);
        dueDate.setHours(0, 0, 0, 0);

        const timeDifference = today.getTime() - dueDate.getTime();
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        const originalAmount = parseFloat(payment.amount_due || 0);

        let penaltyAmount = 0;
        let penaltyDescription = '';
        let penaltyBreakdown = [];
        let graceDaysLeft = 0;
        let isInGracePeriod = false;

        if (payment.status !== 'Paid' && daysDifference > 0) {
            if (daysDifference >= 1 && daysDifference <= 3) {
                graceDaysLeft = 3 - daysDifference;
                isInGracePeriod = true;
                penaltyDescription = `${daysDifference} day${daysDifference > 1 ? 's' : ''} overdue (${graceDaysLeft} day${graceDaysLeft !== 1 ? 's' : ''} grace left)`;
            } else if (daysDifference > 3) {
                penaltyAmount = originalAmount * 0.05;
                penaltyDescription = `${daysDifference} days overdue (5% penalty)`;
                penaltyBreakdown.push({
                    type: 'Late Payment Penalty',
                    days: `${daysDifference} days`,
                    rate: '5%',
                    amount: penaltyAmount
                });
            }
        }

        const totalAmount = originalAmount + penaltyAmount;
        const hasPenalty = penaltyAmount > 0;

        return {
            ...payment,
            original_amount: originalAmount,
            penalty_amount: penaltyAmount,
            total_amount: totalAmount,
            has_penalty: hasPenalty,
            days_overdue: Math.max(0, daysDifference),
            grace_days_left: graceDaysLeft,
            penalty_description: penaltyDescription,
            penalty_breakdown: penaltyBreakdown,
            penalty_rate: hasPenalty ? '5%' : '0%',
            is_in_grace_period: isInGracePeriod,
            severity_level: daysDifference <= 3 ? 'grace' : 'penalty'
        };
    };

    // Enhanced display function for penalty information
    const formatPenaltyDisplay = (payment) => {
        if (!payment.has_penalty && !payment.is_in_grace_period) {
            return {
                mainAmount: payment.original_amount,
                displayText: 'On Time',
                className: 'text-success'
            };
        }

        if (payment.is_in_grace_period) {
            return {
                mainAmount: payment.original_amount,
                displayText: payment.penalty_description,
                graceDaysLeft: payment.grace_days_left,
                className: 'text-warning'
            };
        }

        return {
            mainAmount: payment.total_amount,
            penaltyAmount: payment.penalty_amount,
            originalAmount: payment.original_amount,
            displayText: payment.penalty_description,
            className: 'text-danger',
            breakdown: payment.penalty_breakdown
        };
    };

    // Calculate customer payment performance metrics
    const calculateCustomerPerformance = (payments) => {
        const totalPayments = payments.length;
        const paidPayments = payments.filter(p => p.status === 'Paid').length;
        const overduePayments = payments.filter(p => {
            const processed = calculateOverduePenalty(p);
            return p.status !== 'Paid' && processed.days_overdue > 3;
        }).length;
        
        const paymentCompletionRate = totalPayments > 0 ? (paidPayments / totalPayments) * 100 : 0;
        const overdueRate = totalPayments > 0 ? (overduePayments / totalPayments) * 100 : 0;
        
        const isBadPayer = overdueRate >= 40;
        
        return {
            totalPayments,
            paidPayments,
            overduePayments,
            paymentCompletionRate: paymentCompletionRate.toFixed(1),
            overdueRate: overdueRate.toFixed(1),
            isBadPayer,
            payerStatus: isBadPayer ? 'Bad Payer' : 'Good Payer',
            payerStatusColor: isBadPayer ? '#dc3545' : '#28a745'
        };
    };

    // Function to calculate total penalties for reporting
    const calculatePenaltySummary = (payments) => {
        const summary = {
            totalPayments: payments.length,
            onTimePayments: 0,
            gracePeriodPayments: 0,
            penalizedPayments: 0,
            totalPenaltyAmount: 0,
            totalOriginalAmount: 0,
            totalAmountWithPenalties: 0,
            averageDaysOverdue: 0,
            severityBreakdown: {
                grace: 0,
                penalty: 0
            }
        };

        let totalDaysOverdue = 0;

        payments.forEach(payment => {
            const processed = calculateOverduePenalty(payment);

            summary.totalOriginalAmount += processed.original_amount;
            summary.totalAmountWithPenalties += processed.total_amount;
            summary.totalPenaltyAmount += processed.penalty_amount;

            if (processed.days_overdue === 0) {
                summary.onTimePayments++;
            } else if (processed.is_in_grace_period) {
                summary.gracePeriodPayments++;
            } else if (processed.has_penalty) {
                summary.penalizedPayments++;
            }

            summary.severityBreakdown[processed.severity_level]++;
            totalDaysOverdue += processed.days_overdue;
        });

        summary.averageDaysOverdue = payments.length > 0 ?
            (totalDaysOverdue / payments.length).toFixed(1) : 0;

        summary.penaltyRate = summary.totalOriginalAmount > 0 ?
            ((summary.totalPenaltyAmount / summary.totalOriginalAmount) * 100).toFixed(2) + '%' : '0%';

        return summary;
    };

    // Updated table display component for amount column
    const AmountDisplayCell = ({ payment }) => {
        const processed = calculateOverduePenalty(payment);
        const display = formatPenaltyDisplay(processed);

        if (!processed.has_penalty && !processed.is_in_grace_period) {
            return (
                <div style={{ textAlign: 'center' }}>
                    <div className={display.className}>
                        ₱{display.mainAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}
                    </div>
                    <div style={{ fontSize: '10px', color: '#28a745', fontWeight: '500' }}>
                        {display.displayText}
                    </div>
                </div>
            );
        }

        if (processed.is_in_grace_period) {
            return (
                <div style={{ textAlign: 'center' }}>
                    <div>
                        ₱{display.mainAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}
                    </div>
                    <div style={{ fontSize: '10px', color: '#ffc107', fontWeight: '500' }}>
                        {display.displayText}
                    </div>
                    {display.graceDaysLeft > 0 && (
                        <div style={{ 
                            fontSize: '9px', 
                            color: '#ff9800', 
                            fontWeight: '600',
                            marginTop: '2px',
                            padding: '2px 4px',
                            backgroundColor: '#fff3e0',
                            borderRadius: '3px',
                            display: 'inline-block'
                        }}>
                            ⚠ {display.graceDaysLeft} day{display.graceDaysLeft !== 1 ? 's' : ''} until penalty
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '2px' }}>
                    Original: ₱{display.originalAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </div>
                <div style={{ fontSize: '10px', color: '#dc3545', marginBottom: '2px' }}>
                    + ₱{display.penaltyAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })} ({processed.penalty_rate})
                </div>
                <div style={{ fontSize: '10px', color: '#dc3545', marginBottom: '4px' }}>
                    ________________________________
                </div>
                <div style={{ fontWeight: 'bold', color: '#dc3545', fontSize: '12px' }}>
                    ₱{display.mainAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </div>
                {processed.penalty_breakdown.length > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPaymentForBreakdown(payment);
                            setShowPenaltyBreakdown(true);
                        }}
                        style={{
                            fontSize: '8px',
                            padding: '2px 6px',
                            marginTop: '2px',
                            background: 'none',
                            border: '1px solid #dc3545',
                            color: '#dc3545',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                        title="View penalty breakdown"
                    >
                        View Details
                    </button>
                )}
            </div>
        );
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [filterSearch, filterBalance]);

    const filteredAndSortedData = useMemo(() => {
        let filtered = [...installmentList];

        if (filterSearch.trim()) {
            const searchTerm = filterSearch.toLowerCase();
            filtered = filtered.filter(item =>
                item.cust_name?.toLowerCase().includes(searchTerm) ||
                `${item.fname} ${item.mname} ${item.lname}`.toLowerCase().includes(searchTerm)
            );
        }

        if (filterBalance) {
            filtered = filtered.filter(item => {
                const balance = parseFloat(item.balance) || 0;
                switch (filterBalance) {
                    case 'low':
                        return balance < 1000;
                    case 'medium':
                        return balance >= 1000 && balance < 5000;
                    case 'high':
                        return balance >= 5000;
                    case 'zero':
                        return balance === 0;
                    default:
                        return true;
                }
            });
        }

        if (sortField) {
            filtered.sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];

                if (sortField === 'balance') {
                    aVal = parseFloat(aVal) || 0;
                    bVal = parseFloat(bVal) || 0;
                } else if (sortField === 'cust_name') {
                    aVal = (aVal || '').toLowerCase();
                    bVal = (bVal || '').toLowerCase();
                } else if (sortField === 'staff_name') {
                    aVal = `${a.fname || ''} ${a.mname || ''} ${a.lname || ''}`.toLowerCase();
                    bVal = `${b.fname || ''} ${b.mname || ''} ${b.lname || ''}`.toLowerCase();
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
    }, [installmentList, filterSearch, filterBalance, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const processedInstallmentDList = useMemo(() => {
        return installmentDList.map(payment => calculateOverduePenalty(payment));
    }, [installmentDList]);

    const totalModalPages = Math.ceil(processedInstallmentDList.length / MODAL_ITEMS_PER_PAGE);
    const modalStartIndex = (currentModalPage - 1) * MODAL_ITEMS_PER_PAGE;
    const currentModalItems = processedInstallmentDList.slice(modalStartIndex, modalStartIndex + MODAL_ITEMS_PER_PAGE);

    const unpaidPayments = useMemo(() => {
        return processedInstallmentDList
            .filter(payment => payment.status !== 'Paid')
            .sort((a, b) => parseInt(a.payment_number) - parseInt(b.payment_number));
    }, [processedInstallmentDList]);

    const overduePayments = useMemo(() => {
        return unpaidPayments.filter(payment => payment.days_overdue > 3);
    }, [unpaidPayments]);

    const hasOverduePayments = overduePayments.length > 0;

    const selectedPaymentTotal = useMemo(() => {
        if (payAllUnpaid) {
            return unpaidPayments.reduce((sum, payment) => sum + payment.total_amount, 0);
        }
        return selectedPayments.reduce((sum, ipsId) => {
            const payment = unpaidPayments.find(p => p.ips_id === ipsId);
            return sum + (payment ? payment.total_amount : 0);
        }, 0);
    }, [selectedPayments, unpaidPayments, payAllUnpaid]);

    const customerPerformance = useMemo(() => {
        return calculateCustomerPerformance(processedInstallmentDList);
    }, [processedInstallmentDList]);

    const penaltySummary = useMemo(() => {
        return calculatePenaltySummary(processedInstallmentDList);
    }, [processedInstallmentDList]);

    useEffect(() => {
        GetInstallment();
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

    const GetInstallment = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const accountID = sessionStorage.getItem('user_id');
            const locationID = sessionStorage.getItem('location_id');
            const locName = sessionStorage.getItem('location_name');

            const response = await axios.get(`${baseURL}installment.php`, {
                params: {
                    json: JSON.stringify({ locID: locationID }),
                    operation: "GetInstallment"
                }
            });

            setInstallmentList(response.data);
            Logs(accountID, 'Viewed installment management for ' + locName);
        } catch (error) {
            console.error("Error fetching installments:", error);
        }
    };

    const GetInstallmentD = async (id) => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');

            const response = await axios.get(`${baseURL}installment.php`, {
                params: {
                    json: JSON.stringify({ installmentID: id }),
                    operation: "GetInstallmentD"
                }
            });

            setInstallmentDList(response.data);
        } catch (error) {
            console.error("Error fetching installment details:", error);
        }
    };

    const showReceiptModal = (transaction) => {
        setLastTransaction(transaction);
        setShowReceipt(true);
    };

    const closeReceipt = () => {
        setShowReceipt(false);
        setLastTransaction(null);
    };

    const RecordPayment = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const accountID = sessionStorage.getItem('user_id');
            const locationID = sessionStorage.getItem('location_id');
            const locName = sessionStorage.getItem('location_name');

            let paymentsToRecord = [];

            if (payAllUnpaid) {
                paymentsToRecord = unpaidPayments.map(payment => ({
                    ips_id: payment.ips_id,
                    amount: payment.total_amount
                }));
            } else {
                paymentsToRecord = selectedPayments.map(ipsId => {
                    const payment = unpaidPayments.find(p => p.ips_id === ipsId);
                    return {
                        ips_id: ipsId,
                        amount: payment.total_amount
                    };
                });
            }
            const pdaytails = {
                installmentID: selectedInstallment.installment_sales_id,
                recordedBy: accountID,
                locID: locationID
            }

            const response = await axios.get(`${baseURL}installment.php`, {
                params: {
                    payments: JSON.stringify(paymentsToRecord),
                    json: JSON.stringify(pdaytails),
                    operation: "PayInstallment"
                }
            });

            if (!isNaN(response.data) && response.data !== null && response.data !== "") {
                const transaction = {
                    receipt_id: response.data,
                    customer: selectedInstallment,
                    payments: payAllUnpaid ? unpaidPayments : selectedPayments.map(ipsId =>
                        unpaidPayments.find(p => p.ips_id === ipsId)
                    ),
                    total_amount: selectedPaymentTotal,
                    payment_method: 'cash',
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                    location: locName || 'Agora Showroom Main',
                    recorded_by: sessionStorage.getItem('user_name') || 'Staff'
                };

                showReceiptModal(transaction);
                GetInstallmentD(selectedInstallment.installment_sales_id);
                GetInstallment();
                setRecordPaymentVisible(false);
                setSelectedPayments([]);
                setPayAllUnpaid(false);

            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Record the payment! +' + response.data,
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error recording payment:", error);
            showAlertError({
                icon: "error",
                title: "Something Went Wrong!",
                text: 'Record the payment! +' + error,
                button: 'Try Again'
            });
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleModalPageChange = (page) => {
        if (page >= 1 && page <= totalModalPages) {
            setCurrentModalPage(page);
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ opacity: 0.3, marginLeft: '5px' }}
            >
                <path d="m7 14 5-5 5 5" />
                <path d="m7 10 5 5 5-5" />
            </svg>
        );
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
                <path d="m7 14 5-5 5 5" />
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
                <path d="m7 10 5 5 5-5" />
            </svg>
        );
    };

    const clearAllFilters = () => {
        setFilterSearch('');
        setFilterBalance('');
        setSortField('');
        setSortDirection('asc');
        setCurrentPage(1);
    };

    const handleRowClick = (installment) => {
        setSelectedInstallment(installment);
        setInstallmentsDVisible(true);
        setCurrentModalPage(1);
        GetInstallmentD(installment.installment_sales_id);
    };

    const handleRecordPaymentClick = () => {
        setInstallmentsDVisible(false);
        setRecordPaymentVisible(true);

        if (unpaidPayments.length === 1) {
            setSelectedPayments([unpaidPayments[0].ips_id]);
        } else {
            setSelectedPayments([]);
        }
        setPayAllUnpaid(false);
    };

    const handlePaymentSelection = (ipsId) => {
        if (payAllUnpaid) {
            setPayAllUnpaid(false);
        }

        if (hasOverduePayments) {
            const payment = unpaidPayments.find(p => p.ips_id === ipsId);
            const isOverdue = payment.days_overdue > 3;

            if (isOverdue) {
                setSelectedPayments(prev => {
                    if (prev.includes(ipsId)) {
                        return prev.filter(id => id !== ipsId);
                    } else {
                        return [...prev, ipsId];
                    }
                });
            } else {
                const allOverdueSelected = overduePayments.every(od => 
                    selectedPayments.includes(od.ips_id)
                );

                if (!allOverdueSelected) {
                    return;
                }

                const paymentNumber = parseInt(payment.payment_number);
                setSelectedPayments(prev => {
                    if (prev.includes(ipsId)) {
                        const updatedSelections = prev.filter(id => {
                            const p = unpaidPayments.find(payment => payment.ips_id === id);
                            return parseInt(p.payment_number) < paymentNumber;
                        });
                        return updatedSelections;
                    } else {
                        const newSelections = [...prev];

                        const highestOverdueNumber = Math.max(
                            ...overduePayments.map(p => parseInt(p.payment_number))
                        );

                        for (let i = highestOverdueNumber + 1; i <= paymentNumber; i++) {
                            const targetPayment = unpaidPayments.find(p => parseInt(p.payment_number) === i);
                            if (targetPayment && !newSelections.includes(targetPayment.ips_id)) {
                                newSelections.push(targetPayment.ips_id);
                            }
                        }

                        return newSelections;
                    }
                });
            }
        } else {
            const payment = unpaidPayments.find(p => p.ips_id === ipsId);
            const paymentNumber = parseInt(payment.payment_number);

            setSelectedPayments(prev => {
                if (prev.includes(ipsId)) {
                    const updatedSelections = prev.filter(id => {
                        const p = unpaidPayments.find(payment => payment.ips_id === id);
                        return parseInt(p.payment_number) < paymentNumber;
                    });
                    return updatedSelections;
                } else {
                    const newSelections = [...prev];

                    for (let i = 1; i <= paymentNumber; i++) {
                        const targetPayment = unpaidPayments.find(p => parseInt(p.payment_number) === i);
                        if (targetPayment && !newSelections.includes(targetPayment.ips_id)) {
                            newSelections.push(targetPayment.ips_id);
                        }
                    }

                    return newSelections;
                }
            });
        }
    };

    const canSelectPayment = (payment) => {
        if (payAllUnpaid) return false;

        const isOverdue = payment.days_overdue > 3;

        if (hasOverduePayments) {
            if (isOverdue) {
                return true;
            } else {
                const allOverdueSelected = overduePayments.every(od => 
                    selectedPayments.includes(od.ips_id)
                );
                
                if (!allOverdueSelected) {
                    return false;
                }

                const paymentNumber = parseInt(payment.payment_number);
                const highestOverdueNumber = Math.max(
                    ...overduePayments.map(p => parseInt(p.payment_number))
                );

                for (let i = highestOverdueNumber + 1; i < paymentNumber; i++) {
                    const lowerPayment = unpaidPayments.find(p => parseInt(p.payment_number) === i);
                    if (lowerPayment && !selectedPayments.includes(lowerPayment.ips_id)) {
                        return false;
                    }
                }

                return true;
            }
        } else {
            const paymentNumber = parseInt(payment.payment_number);

            for (let i = 1; i < paymentNumber; i++) {
                const lowerPayment = unpaidPayments.find(p => parseInt(p.payment_number) === i);
                if (lowerPayment && !selectedPayments.includes(lowerPayment.ips_id)) {
                    return false;
                }
            }

            return true;
        }
    };

    const getNextRequiredPayment = () => {
        if (hasOverduePayments) {
            const unselectedOverdue = overduePayments.find(p => !selectedPayments.includes(p.ips_id));
            if (unselectedOverdue) {
                return `${unselectedOverdue.payment_number} (OVERDUE - Must pay all overdue first)`;
            }
        }

        for (let i = 1; i <= unpaidPayments.length; i++) {
            const payment = unpaidPayments.find(p => parseInt(p.payment_number) === i);
            if (payment && !selectedPayments.includes(payment.ips_id)) {
                return i;
            }
        }
        return null;
    };

    const handlePayAllUnpaid = () => {
        setPayAllUnpaid(!payAllUnpaid);
        if (!payAllUnpaid) {
            setSelectedPayments([]);
        }
    };

    return (
        <>
            {/* Penalty Breakdown Modal */}
            <Modal
                show={showPenaltyBreakdown}
                onHide={() => setShowPenaltyBreakdown(false)}
                size="md"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Penalty Breakdown - Payment #{selectedPaymentForBreakdown?.payment_number}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPaymentForBreakdown && (() => {
                        const processed = calculateOverduePenalty(selectedPaymentForBreakdown);
                        return (
                            <>
                                <div style={{ marginBottom: '15px' }}>
                                    <h6>Payment Details</h6>
                                    <div>Due Date: {new Date(selectedPaymentForBreakdown.due_date).toLocaleDateString()}</div>
                                    <div>Days Overdue: {processed.days_overdue}</div>
                                    <div>Severity Level: {processed.severity_level.toUpperCase()}</div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <h6>Amount Breakdown</h6>
                                    <table className="table table-sm">
                                        <tbody>
                                            <tr>
                                                <td>Original Amount</td>
                                                <td className="text-end">₱{processed.original_amount.toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}</td>
                                            </tr>
                                            {processed.penalty_breakdown.map((penalty, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        {penalty.type}
                                                        <br />
                                                        <small className="text-muted">({penalty.days} - {penalty.rate})</small>
                                                    </td>
                                                    <td className="text-end text-danger">
                                                        +₱{penalty.amount.toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="border-top fw-bold">
                                                <td>Total Amount Due</td>
                                                <td className="text-end">₱{processed.total_amount.toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {processed.has_penalty && (
                                    <div className="alert alert-warning">
                                        <strong>Total Penalty Rate:</strong> {processed.penalty_rate} of original amount
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPenaltyBreakdown(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Receipt Modal */}
            <Modal
                show={showReceipt}
                onHide={closeReceipt}
                size="lg"
                className="receipt-modal"
                centered
                style={{ maxHeight: '90vh' }}
            >
                <Modal.Header closeButton style={{ position: 'sticky', top: 0, zIndex: 1050, backgroundColor: 'white', borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title className="d-flex align-items-center">
                        <span className="text-success me-2">✓</span>
                        Payment Recorded Successfully!
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body style={{
                    maxHeight: '60vh',
                    overflowY: 'auto',
                    padding: '1.5rem'
                }}>
                    {lastTransaction && (
                        <>
                            <div className="text-center mb-4 p-3" style={{ backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <h4 className="fw-semibold mb-2">A.G HOME APPLIANCE AND FURNITURE SHOWROOM</h4>
                                <div className="text-muted small">
                                    <div>Payment Receipt #{lastTransaction.receipt_id}</div>
                                    <div>{lastTransaction.date} • {lastTransaction.time}</div>
                                    <div>{lastTransaction.location}</div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h5 className="fw-semibold mb-2 text-dark">Customer Information</h5>
                                <div className="p-3 rounded" style={{ backgroundColor: '#f9fafb' }}>
                                    <div className="fw-bold">Installment ID: {lastTransaction.customer.installment_sales_id}</div>
                                    <div className="fw-bold">Customer: {lastTransaction.customer.cust_name}</div>
                                    <div className="text-muted">Processed by: {`${lastTransaction.customer.fname || ''} ${lastTransaction.customer.mname || ''} ${lastTransaction.customer.lname || ''}`.trim()}</div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h5 className="fw-semibold mb-2 text-dark">Payments Recorded</h5>
                                <div className="p-3 rounded" style={{ backgroundColor: '#f9fafb' }}>
                                    {lastTransaction.payments.map((payment, index) => (
                                        <div
                                            key={index}
                                            className={`py-3 ${index < lastTransaction.payments.length - 1 ? 'border-bottom' : ''}`}
                                        >
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div className="flex-grow-1">
                                                    <div className="fw-bold text-dark">Payment #{payment.payment_number}</div>
                                                    <div className="text-muted small mb-1">Due Date: {new Date(payment.due_date).toLocaleDateString()}</div>
                                                    {payment.has_penalty && (
                                                        <div className="text-muted small mb-1">
                                                            Original Amount: ₱{payment.original_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </div>
                                                    )}
                                                    {payment.has_penalty && (
                                                        <div className="text-danger small mb-1">
                                                            Penalty ({payment.penalty_rate}): ₱{payment.penalty_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </div>
                                                    )}
                                                    {payment.days_overdue > 0 && (
                                                        <div className="text-danger small mb-1">
                                                            {payment.days_overdue} day{payment.days_overdue > 1 ? 's' : ''} overdue
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="fw-bold text-end">
                                                    <div style={{ color: payment.has_penalty ? '#dc3545' : '#28a745' }}>
                                                        ₱{payment.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </div>
                                                    {payment.has_penalty && (
                                                        <div className="text-danger small">With Penalty</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="p-3 rounded" style={{ backgroundColor: '#f9fafb' }}>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Number of Payments:</span>
                                        <span>{lastTransaction.payments.length}</span>
                                    </div>
                                    <div className="d-flex justify-content-between fs-5 fw-bold pt-2 border-top">
                                        <span>Total Amount Paid:</span>
                                        <span style={{ color: '#28a745' }}>₱{lastTransaction.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h5 className="fw-semibold mb-2 text-dark">Payment Details</h5>
                                <div className="p-3 rounded border" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="fw-medium">Payment Method:</span>
                                        <span className="text-capitalize">{lastTransaction.payment_method}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="fw-medium">Recorded By:</span>
                                        <span>{lastTransaction.recorded_by}</span>
                                    </div>
                                    <div className="d-flex justify-content-between fs-6 fw-semibold" style={{ color: '#10b981' }}>
                                        <span>Amount Received:</span>
                                        <span>₱{lastTransaction.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="alert alert-success text-center mb-4" role="alert">
                                <p className="mb-2 fw-medium">
                                    ✓ Payment(s) recorded successfully
                                </p>
                                <p className="mb-0 small">
                                    Customer balance has been updated automatically
                                </p>
                            </div>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer style={{ position: 'sticky', bottom: 0, backgroundColor: 'white', borderTop: '1px solid #dee2e6' }}>
                    <div className="d-flex gap-2 w-100">
                        <Button
                            variant="secondary"
                            className="flex-fill"
                            onClick={() => {
                                if (lastTransaction) {
                                    const printContent = document.createElement('div');
                                    printContent.innerHTML = `
                                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                                                    width: 148mm; 
                                                    max-width: 148mm; 
                                                    margin: 0 auto; 
                                                    padding: 10mm;
                                                    font-size: 10px;
                                                    line-height: 1.3;
                                                    color: #333;">
                                          
                                          <div style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 8px;">
                                            <h1 style="margin: 0; font-size: 14px; font-weight: bold;">A.G HOME APPLIANCE AND FURNITURE SHOWROOM</h1>
                                            <div style="font-size: 9px; color: #666; margin-top: 3px;">
                                              <div>Payment Receipt #${lastTransaction.receipt_id}</div>
                                              <div>${lastTransaction.date} • ${lastTransaction.time}</div>
                                              <div>${lastTransaction.location}</div>
                                            </div>
                                          </div>
                                          
                                          <div style="margin-bottom: 12px;">
                                            <div style="font-weight: bold; margin-bottom: 4px; font-size: 11px;">CUSTOMER INFORMATION</div>
                                            <div style="background: #f8f9fa; padding: 6px; border-radius: 4px; border-left: 3px solid #007bff;">
                                              <div style="font-weight: bold; margin-bottom: 2px;">Installment ID: ${lastTransaction.customer.installment_sales_id}</div>
                                              <div style="font-weight: bold; margin-bottom: 2px;">${lastTransaction.customer.cust_name}</div>
                                              <div style="color: #666; font-size: 9px;">Processed by: ${`${lastTransaction.customer.fname || ''} ${lastTransaction.customer.mname || ''} ${lastTransaction.customer.lname || ''}`.trim()}</div>
                                            </div>
                                          </div>
                                          
                                          <div style="margin-bottom: 12px;">
                                            <div style="font-weight: bold; margin-bottom: 4px; font-size: 11px;">PAYMENTS RECORDED</div>
                                            <div style="background: #f8f9fa; padding: 6px; border-radius: 4px; border-left: 3px solid #28a745;">
                                              ${lastTransaction.payments.map((payment, index) =>
                                        `<div style="padding: 6px 0; ${index < lastTransaction.payments.length - 1 ? 'border-bottom: 1px dashed #ccc;' : ''} margin-bottom: ${index < lastTransaction.payments.length - 1 ? '6px' : '0'};">
                                                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                                    <div style="flex: 1; margin-right: 10px;">
                                                      <div style="font-weight: bold; font-size: 10px; margin-bottom: 2px;">Payment #${payment.payment_number}</div>
                                                      <div style="color: #666; font-size: 9px; margin-bottom: 1px;">Due: ${new Date(payment.due_date).toLocaleDateString()}</div>
                                                      ${payment.has_penalty ?
                                            `<div style="color: #666; font-size: 9px; margin-bottom: 1px;">Original: ₱${payment.original_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                         <div style="color: #dc3545; font-size: 9px; margin-bottom: 1px;">Penalty: ₱${payment.penalty_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>` : ''
                                        }
                                                      ${payment.days_overdue > 0 ?
                                            `<div style="color: #dc3545; font-size: 9px;">${payment.days_overdue} day${payment.days_overdue > 1 ? 's' : ''} overdue</div>` : ''
                                        }
                                                    </div>
                                                    <div style="font-weight: bold; text-align: right; font-size: 10px; color: ${payment.has_penalty ? '#dc3545' : '#28a745'};">
                                                      ₱${payment.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </div>
                                                  </div>
                                                </div>`
                                    ).join('')}
                                            </div>
                                          </div>
                                          
                                          <div style="margin-bottom: 12px;">
                                            <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
                                              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                                <span>Number of Payments:</span>
                                                <span>${lastTransaction.payments.length}</span>
                                              </div>
                                              <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; 
                                                          border-top: 2px solid #333; padding-top: 6px; margin-top: 6px;">
                                                <span>TOTAL AMOUNT PAID:</span>
                                                <span style="color: #28a745;">₱${lastTransaction.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div style="margin-bottom: 12px;">
                                            <div style="font-weight: bold; margin-bottom: 4px; font-size: 11px;">PAYMENT DETAILS</div>
                                            <div style="background: #f0fdf4; padding: 8px; border-radius: 4px; border: 1px solid #bbf7d0;">
                                              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                                <span><strong>Payment Method:</strong></span>
                                                <span style="text-transform: uppercase;">${lastTransaction.payment_method}</span>
                                              </div>
                                              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                                <span><strong>Recorded By:</strong></span>
                                                <span>${lastTransaction.recorded_by}</span>
                                              </div>
                                              <div style="display: flex; justify-content: space-between; font-weight: bold; 
                                                          color: #10b981; font-size: 11px;">
                                                <span>Amount Received:</span>
                                                <span>₱${lastTransaction.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div style="text-align: center; margin-top: 15px; padding-top: 8px; border-top: 2px solid #333;">
                                            <div style="font-weight: bold; margin-bottom: 6px; font-size: 11px;">PAYMENT RECORDED SUCCESSFULLY</div>
                                            <div style="font-size: 9px; color: #666; margin-bottom: 3px;">
                                              Thank you for your payment!
                                            </div>
                                            <div style="font-size: 9px; color: #666; margin-bottom: 3px;">
                                              Please keep this receipt for your records
                                            </div>
                                            <div style="font-size: 9px; color: #28a745; font-weight: bold;">
                                              Customer balance updated automatically
                                            </div>
                                            <div style="margin-top: 8px; font-size: 8px; color: #999;">
                                              Powered by A.G POS System | Printed on ${new Date().toLocaleString()}
                                            </div>
                                          </div>
                                        </div>
                                    `;

                                    const printWindow = window.open('', '_blank');
                                    printWindow.document.write(`
                                        <!DOCTYPE html>
                                        <html>
                                        <head>
                                          <title>Payment Receipt - #${lastTransaction.receipt_id}</title>
                                          <style>
                                            @page {
                                              size: A4;
                                              margin: 10mm;
                                            }
                                            @media print {
                                              body { 
                                                margin: 0; 
                                                -webkit-print-color-adjust: exact;
                                                color-adjust: exact;
                                              }
                                              * {
                                                -webkit-print-color-adjust: exact;
                                                color-adjust: exact;
                                              }
                                            }
                                            body {
                                              margin: 0;
                                              padding: 0;
                                              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                            }
                                          </style>
                                        </head>
                                        <body>
                                          ${printContent.innerHTML}
                                        </body>
                                        </html>
                                    `);
                                    printWindow.document.close();
                                    printWindow.print();
                                }
                            }}
                        >
                            Print Receipt
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-fill"
                            onClick={closeReceipt}
                        >
                            Close
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Installment Details Modal */}
            <Modal show={installmentDVisible} onHide={() => { setInstallmentsDVisible(false); }} size='lg' className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Installment Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    {selectedInstallment && (
                        <div className="r-details-head">
                            <div className='r-d-div'>
                                <div className='r-1'><strong>INSTALLMENT ID:</strong> {selectedInstallment.installment_sales_id}</div>
                            </div>
                            <div><strong>CUSTOMER NAME:</strong> {selectedInstallment.cust_name}</div>
                            <div><strong>BALANCE:</strong> ₱{parseFloat(selectedInstallment.balance || 0).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}</div>
                            <div><strong>TRANSACTION FROM:</strong> {selectedInstallment.location_name}</div>
                            <div><strong>PROCESSED BY:</strong> {`${selectedInstallment.fname || ''} ${selectedInstallment.mname || ''} ${selectedInstallment.lname || ''}`.trim()}</div>
                            {selectedInstallment.created_at && (
                                <div><strong>CREATED ON:</strong> {new Date(selectedInstallment.created_at).toLocaleDateString()}</div>
                            )}

                            {/* Customer Performance Metrics */}
                            <div style={{
                                marginTop: '15px',
                                padding: '12px',
                                backgroundColor: customerPerformance.isBadPayer ? '#ffebee' : '#e8f5e9',
                                borderRadius: '6px',
                                border: `2px solid ${customerPerformance.payerStatusColor}`
                            }}>
                                <div style={{ 
                                    fontWeight: 'bold', 
                                    marginBottom: '8px',
                                    color: customerPerformance.payerStatusColor,
                                    fontSize: '16px'
                                }}>
                                    CUSTOMER STATUS: {customerPerformance.payerStatus}
                                </div>
                                <div style={{ fontSize: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <div>
                                        <strong>Payment Completion:</strong> {customerPerformance.paymentCompletionRate}%
                                        <div style={{ 
                                            height: '8px', 
                                            backgroundColor: '#e0e0e0', 
                                            borderRadius: '4px',
                                            marginTop: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ 
                                                height: '100%', 
                                                width: `${customerPerformance.paymentCompletionRate}%`,
                                                backgroundColor: '#4caf50',
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <strong>Overdue Rate:</strong> {customerPerformance.overdueRate}%
                                        <div style={{ 
                                            height: '8px', 
                                            backgroundColor: '#e0e0e0', 
                                            borderRadius: '4px',
                                            marginTop: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ 
                                                height: '100%', 
                                                width: `${customerPerformance.overdueRate}%`,
                                                backgroundColor: customerPerformance.isBadPayer ? '#f44336' : '#ff9800',
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '8px', fontSize: '13px' }}>
                                    <div><strong>Paid Payments:</strong> {customerPerformance.paidPayments} / {customerPerformance.totalPayments}</div>
                                    <div><strong>Overdue Payments:</strong> {customerPerformance.overduePayments}</div>
                                </div>
                                {customerPerformance.isBadPayer && (
                                    <div style={{
                                        marginTop: '8px',
                                        padding: '6px',
                                        backgroundColor: '#fff',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        color: '#d32f2f',
                                        fontWeight: '500'
                                    }}>
                                        Warning: Customer has {customerPerformance.overdueRate}% overdue rate (≥40% threshold)
                                    </div>
                                )}
                            </div>

                            {/* Penalty Summary */}
                            {penaltySummary.totalPenaltyAmount > 0 && (
                                <div style={{
                                    marginTop: '15px',
                                    padding: '10px',
                                    backgroundColor: '#fff3cd',
                                    borderRadius: '6px',
                                    border: '1px solid #ffeaa7'
                                }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>PENALTY SUMMARY:</div>
                                    <div style={{ fontSize: '14px' }}>
                                        <div>Total Penalties: ₱{penaltySummary.totalPenaltyAmount.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}</div>
                                        <div>Penalized Payments: {penaltySummary.penalizedPayments} of {penaltySummary.totalPayments}</div>
                                        <div>Average Days Overdue: {penaltySummary.averageDaysOverdue}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className='tableContainer1' style={{ height: '30vh' }}>
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th className='t2'>PAYMENT #</th>
                                    <th className='th1'>AMOUNT</th>
                                    <th className='th1'>DUE DATE</th>
                                    <th className='th1'>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentModalItems.length > 0 ? (
                                    currentModalItems.map((p, i) => (
                                        <tr className='table-row' key={i}>
                                            <td className='td-name'>{p.payment_number}</td>
                                            <td>
                                                <AmountDisplayCell payment={p} />
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div>{new Date(p.due_date).toLocaleDateString()}</div>
                                                {p.days_overdue > 0 && p.status !== 'Paid' && (
                                                    <div style={{
                                                        fontSize: '10px',
                                                        color: p.days_overdue > 3 ? '#dc3545' : '#ffc107',
                                                        fontWeight: '500'
                                                    }}>
                                                        {p.days_overdue} day{p.days_overdue > 1 ? 's' : ''} overdue
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    backgroundColor: p.status === 'Paid' ? '#d4edda' :
                                                        p.status === 'Overdue' ? '#f8d7da' : '#fff3cd',
                                                    color: p.status === 'Paid' ? '#155724' :
                                                        p.status === 'Overdue' ? '#721c24' : '#856404'
                                                }}>
                                                    {p.status}
                                                </span>
                                                {p.has_penalty && (
                                                    <div style={{
                                                        fontSize: '10px',
                                                        color: '#dc3545',
                                                        marginTop: '2px',
                                                        fontWeight: '500'
                                                    }}>
                                                        With Penalty
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center", padding: "15px", fontStyle: "italic" }}>
                                            No payment details found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalModalPages > 1 && (
                        <div style={{ justifyContent: 'center', marginTop: '15px', display: 'flex' }}>
                            <CustomPagination
                                currentPage={currentModalPage}
                                totalPages={totalModalPages}
                                onPageChange={handleModalPageChange}
                                color="green"
                            />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => { setInstallmentsDVisible(false); }}>
                        Close
                    </Button>
                    {unpaidPayments.length > 0 && (
                        <Button variant="primary" onClick={handleRecordPaymentClick}>
                            Record Payment
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Record Payment Modal */}
            <Modal show={recordPaymentVisible} onHide={() => { setRecordPaymentVisible(false); }} size='lg' className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Record Payment</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    {selectedInstallment && (
                        <div className="r-details-head" style={{ marginBottom: '20px' }}>
                            <div><strong>INSTALLMENT ID:</strong> {selectedInstallment.installment_sales_id}</div>
                            <div><strong>CUSTOMER NAME:</strong> {selectedInstallment.cust_name}</div>
                        </div>
                    )}

                    <div style={{ marginBottom: '15px', marginLeft: '30px' }}>
                        <h5>Select Payments to Record:</h5>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={payAllUnpaid}
                                    onChange={handlePayAllUnpaid}
                                    disabled={unpaidPayments.length === 0}
                                />
                                <span>Pay All Unpaid ({unpaidPayments.length} payments)</span>
                            </label>
                        </div>

                        {hasOverduePayments && !payAllUnpaid && (
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#ffebee',
                                borderRadius: '6px',
                                fontSize: '14px',
                                marginBottom: '10px',
                                border: '2px solid #f44336'
                            }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#c62828', fontSize: '15px' }}>
                                    OVERDUE PAYMENTS DETECTED
                                </div>
                                <div style={{ color: '#d32f2f', marginBottom: '6px' }}>
                                    <strong>Required Action:</strong> You must pay ALL {overduePayments.length} overdue payment{overduePayments.length > 1 ? 's' : ''} together before paying any other payments.
                                </div>
                                <div style={{ color: '#d32f2f', fontSize: '13px' }}>
                                    Overdue payments (past 3-day grace period):
                                    <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                                        {overduePayments.map(p => (
                                            <li key={p.ips_id}>
                                                Payment #{p.payment_number} - {p.days_overdue} days overdue
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {!payAllUnpaid && unpaidPayments.length > 1 && !hasOverduePayments && (
                            <div style={{
                                padding: '10px',
                                backgroundColor: '#e3f2fd',
                                borderRadius: '6px',
                                fontSize: '14px',
                                marginBottom: '10px',
                                border: '1px solid #bbdefb'
                            }}>
                                <div style={{ fontWeight: '500', marginBottom: '5px', color: '#1976d2' }}>
                                    Payment Order Rule:
                                </div>
                                <div style={{ color: '#0d47a1' }}>
                                    Payments must be recorded in sequence. You must select Payment #{getNextRequiredPayment() || 1} before selecting higher numbered payments.
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='tableContainer1' style={{ height: '25vh', marginBottom: '15px' }}>
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th className='t2' style={{ width: '50px' }}>SELECT</th>
                                    <th className='t2'>PAYMENT #</th>
                                    <th className='th1'>AMOUNT</th>
                                    <th className='th1'>DUE DATE</th>
                                    <th className='th1'>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unpaidPayments.length > 0 ? (
                                    unpaidPayments.map((payment) => {
                                        const isOverdue = payment.days_overdue > 3;
                                        const isDisabled = !canSelectPayment(payment) && !payAllUnpaid;
                                        
                                        return (
                                            <tr
                                                key={payment.ips_id}
                                                className='table-row'
                                                style={{
                                                    backgroundColor: (payAllUnpaid || selectedPayments.includes(payment.ips_id)) ? '#e3f2fd' :
                                                        isOverdue ? '#ffebee' :
                                                        isDisabled ? '#f5f5f5' : 'transparent',
                                                    opacity: isDisabled ? 0.6 : 1,
                                                    borderLeft: isOverdue ? '4px solid #f44336' : 'none'
                                                }}
                                                onClick={() => !isDisabled && handlePaymentSelection(payment.ips_id)}
                                            >
                                                <td style={{ textAlign: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={payAllUnpaid || selectedPayments.includes(payment.ips_id)}
                                                        onChange={() => handlePaymentSelection(payment.ips_id)}
                                                        disabled={payAllUnpaid || isDisabled}
                                                        title={isDisabled ?
                                                            (hasOverduePayments ? 'Must pay all overdue payments first' : `You must select Payment #${getNextRequiredPayment()} first`) : ''}
                                                    />
                                                </td>
                                                <td className='td-name' style={{
                                                    color: isDisabled ? '#999' : 'inherit'
                                                }}>
                                                    {payment.payment_number}
                                                    {isOverdue && (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            color: '#fff',
                                                            backgroundColor: '#f44336',
                                                            marginLeft: '5px',
                                                            padding: '2px 6px',
                                                            borderRadius: '3px',
                                                            fontWeight: '600'
                                                        }}>
                                                            OVERDUE
                                                        </span>
                                                    )}
                                                    {isDisabled && !isOverdue && (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            color: '#dc3545',
                                                            marginLeft: '5px',
                                                            fontWeight: '500'
                                                        }}>
                                                            (Locked)
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <AmountDisplayCell payment={payment} />
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div>{new Date(payment.due_date).toLocaleDateString()}</div>
                                                    {payment.days_overdue > 0 && (
                                                        <div style={{
                                                            fontSize: '10px',
                                                            color: payment.days_overdue > 3 ? '#f44336' : '#ff9800',
                                                            fontWeight: '600'
                                                        }}>
                                                            {payment.days_overdue} day{payment.days_overdue > 1 ? 's' : ''} overdue
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        backgroundColor: '#f8d7da',
                                                        color: '#721c24'
                                                    }}>
                                                        {payment.status}
                                                    </span>
                                                    {payment.has_penalty && (
                                                        <div style={{
                                                            fontSize: '10px',
                                                            color: '#dc3545',
                                                            marginTop: '2px',
                                                            fontWeight: '500'
                                                        }}>
                                                            With Penalty
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center", padding: "15px", fontStyle: "italic" }}>
                                            No unpaid payments found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                        marginLeft: '30px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong>
                                    {payAllUnpaid
                                        ? `All Unpaid Payments (${unpaidPayments.length})`
                                        : `Selected Payments (${selectedPayments.length})`
                                    }
                                </strong>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                                Total: ₱{selectedPaymentTotal.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => { setRecordPaymentVisible(false); }}>
                        Cancel
                    </Button>
                    <Button
                        variant="success"
                        onClick={RecordPayment}
                        disabled={!payAllUnpaid && selectedPayments.length === 0}
                    >
                        Record Payment{(payAllUnpaid || selectedPayments.length > 1) ? 's' : ''}
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='customer-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>INSTALLMENT MANAGEMENT</h1>
                </div>

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
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: '500',
                                fontSize: '14px'
                            }}>
                                Search Customer/Staff
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
                                    placeholder="Search customer or staff name..."
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

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: '500',
                                fontSize: '14px'
                            }}>
                                Filter by Balance
                            </label>
                            <select
                                value={filterBalance}
                                onChange={(e) => setFilterBalance(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="">All Balances</option>
                                <option value="zero">Fully Paid (₱0)</option>
                                <option value="low">Below ₱1,000</option>
                                <option value="medium">₱1,000 - ₱4,999</option>
                                <option value="high">₱5,000 and above</option>
                            </select>
                        </div>
                    </div>
                </div>

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
                                        height: '18px'
                                    }}
                                    title="Remove search filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {filterBalance && (
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
                                Balance: {filterBalance === 'zero' ? '₱0 (Fully Paid)' :
                                    filterBalance === 'low' ? 'Below ₱1,000' :
                                        filterBalance === 'medium' ? '₱1,000 - ₱4,999' :
                                            filterBalance === 'high' ? '₱5,000 and above' : filterBalance}
                                <button
                                    type="button"
                                    onClick={() => setFilterBalance('')}
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
                                        height: '18px'
                                    }}
                                    title="Remove balance filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {!filterSearch && !filterBalance && (
                            <span style={{ color: '#6c757d' }}>None</span>
                        )}

                        <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                            ({filteredAndSortedData.length} of {installmentList.length} records shown)
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
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>

                <div className='tableContainer' style={{ height: '40vh', overflowY: 'auto' }}>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th className='t2'>
                                    <span>INSTALLMENT ID</span>
                                </th>
                                <th
                                    className='t3'
                                    onClick={() => handleSort('cust_name')}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                    title="Click to sort by customer name"
                                >
                                    <span>CUSTOMER NAME {getSortIcon('cust_name')}</span>
                                </th>
                                <th
                                    className='th1'
                                    onClick={() => handleSort('balance')}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                    title="Click to sort by balance"
                                >
                                    <span>BALANCE {getSortIcon('balance')}</span>
                                </th>
                                <th
                                    className='th1'
                                    onClick={() => handleSort('staff_name')}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                    title="Click to sort by staff name"
                                >
                                    <span>DONE BY {getSortIcon('staff_name')}</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((item, i) => (
                                    <tr className='table-row' key={i}
                                        onClick={() => handleRowClick(item)}
                                        style={{ cursor: 'pointer' }}>
                                        <td className='td-name'>{item.installment_sales_id}</td>
                                        <td className='td-name'>{item.cust_name}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            ₱{parseFloat(item.balance || 0).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {`${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.trim()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: "center", padding: "15px", fontStyle: "italic" }}>
                                        {installmentList.length === 0 ?
                                            "No installment records found" :
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

export default InstallmentSC;