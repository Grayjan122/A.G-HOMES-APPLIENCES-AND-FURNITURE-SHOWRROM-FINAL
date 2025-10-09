'use client';
import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { User, Calendar, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

const PaymentBehaviorAdmin = () => {
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerList, setCustomerList] = useState([]);
    const [installmentList, setInstallmentList] = useState([]);
    const [installmentDList, setInstallmentDList] = useState([]);
    const [paymentRecord, setPaymentRecord] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [recordPaymentVisible, setRecordPaymentVisible] = useState(false);
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [payAllUnpaid, setPayAllUnpaid] = useState(false);
    const [selectedInstallmentForPayment, setSelectedInstallmentForPayment] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastTransaction, setLastTransaction] = useState(null);
    const [showPenaltyBreakdown, setShowPenaltyBreakdown] = useState(false);
    const [selectedPaymentForBreakdown, setSelectedPaymentForBreakdown] = useState(null);
    const [planStatusFilter, setPlanStatusFilter] = useState('all');

    useEffect(() => {
        GetCustomer();
        GetInstallment();
        GetInstallmentD();
        GetPaymentRecord();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, planStatusFilter]);

    const calculateOverduePenalty = (payment) => {
        const today = new Date();
        const dueDate = new Date(payment.due_date);
        const timeDifference = today.getTime() - dueDate.getTime();
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const originalAmount = parseFloat(payment.amount_due || 0);

        let penaltyAmount = 0;
        let penaltyDescription = '';
        let penaltyBreakdown = [];
        let graceDaysLeft = 0;

        if (payment.status !== 'Paid' && daysDifference > 0) {
            if (daysDifference >= 1 && daysDifference <= 3) {
                graceDaysLeft = 3 - daysDifference;
                penaltyDescription = `${daysDifference} day${daysDifference > 1 ? 's' : ''} overdue (Grace: ${graceDaysLeft} day${graceDaysLeft > 1 ? 's' : ''} left)`;
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
            penalty_description: penaltyDescription,
            penalty_breakdown: penaltyBreakdown,
            penalty_rate: hasPenalty ? '5%' : '0%',
            is_in_grace_period: daysDifference >= 1 && daysDifference <= 3,
            grace_days_left: graceDaysLeft,
            severity_level: daysDifference <= 3 ? 'grace' : 'penalty'
        };
    };

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
                        Grace: {processed.grace_days_left} day{processed.grace_days_left > 1 ? 's' : ''} left
                    </div>
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
            </div>
        );
    };

    const GetInstallment = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const locationID = sessionStorage.getItem('location_id');
            const response = await axios.get(`${baseURL}installment.php`, {
                params: {
                    json: JSON.stringify({ locID: locationID }),
                    operation: "GetInstallment"
                }
            });
            setInstallmentList(response.data);
        } catch (error) {
            console.error("Error fetching installments:", error);
        }
    };

    const GetInstallmentD = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const response = await axios.get(`${baseURL}installment.php`, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetInstallmentD1"
                }
            });
            setInstallmentDList(response.data);
        } catch (error) {
            console.error("Error fetching installment details:", error);
        }
    };

    const GetPaymentRecord = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const response = await axios.get(`${baseURL}installment.php`, {
                params: {
                    json: JSON.stringify([]),
                    operation: "PaymentRecords"
                }
            });
            setPaymentRecord(response.data);
        } catch (error) {
            console.error("Error fetching payment records:", error);
        }
    };

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

            const customerInstallmentSchedules = installmentDList.filter(schedule =>
                schedule.installment_id === selectedInstallmentForPayment.installment_sales_id
            );

            const unpaidPayments = customerInstallmentSchedules
                .filter(payment => payment.status !== 'Paid')
                .map(payment => calculateOverduePenalty(payment))
                .sort((a, b) => parseInt(a.payment_number) - parseInt(b.payment_number));

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
                installmentID: selectedInstallmentForPayment.installment_sales_id,
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
                const selectedPaymentTotal = payAllUnpaid
                    ? unpaidPayments.reduce((sum, payment) => sum + payment.total_amount, 0)
                    : selectedPayments.reduce((sum, ipsId) => {
                        const payment = unpaidPayments.find(p => p.ips_id === ipsId);
                        return sum + (payment ? payment.total_amount : 0);
                    }, 0);

                const transaction = {
                    receipt_id: response.data,
                    customer: selectedInstallmentForPayment,
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
                GetInstallmentD();
                GetInstallment();
                GetPaymentRecord();
                setRecordPaymentVisible(false);
                setSelectedPayments([]);
                setPayAllUnpaid(false);
            } else {
                alert('Error recording payment: ' + response.data);
            }
        } catch (error) {
            console.error("Error recording payment:", error);
            alert('Error recording payment: ' + error);
        }
    };

    const handleRecordPaymentClick = (installment) => {
        setSelectedInstallmentForPayment(installment);
        setShowCustomerModal(false);
        setRecordPaymentVisible(true);

        const installmentSchedules = installmentDList.filter(schedule =>
            schedule.installment_id === installment.installment_sales_id
        );

        const today = new Date();
        const overduePayments = installmentSchedules
            .filter(payment => {
                if (payment.status === 'Paid') return false;
                const dueDate = new Date(payment.due_date);
                const daysDiff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                return daysDiff > 3;
            })
            .map(payment => calculateOverduePenalty(payment))
            .sort((a, b) => parseInt(a.payment_number) - parseInt(b.payment_number));

        if (overduePayments.length > 0) {
            setSelectedPayments(overduePayments.map(p => p.ips_id));
        } else {
            const unpaidPayments = installmentSchedules
                .filter(payment => payment.status !== 'Paid')
                .map(payment => calculateOverduePenalty(payment))
                .sort((a, b) => parseInt(a.payment_number) - parseInt(b.payment_number));

            if (unpaidPayments.length > 0) {
                setSelectedPayments([unpaidPayments[0].ips_id]);
            } else {
                setSelectedPayments([]);
            }
        }
        setPayAllUnpaid(false);
    };

    const handlePaymentSelection = (ipsId) => {
        const installmentSchedules = installmentDList.filter(schedule =>
            schedule.installment_id === selectedInstallmentForPayment.installment_sales_id
        );

        const today = new Date();
        const unpaidPayments = installmentSchedules
            .filter(payment => payment.status !== 'Paid')
            .map(payment => calculateOverduePenalty(payment))
            .sort((a, b) => parseInt(a.payment_number) - parseInt(b.payment_number));

        const overduePayments = unpaidPayments.filter(payment => payment.days_overdue > 3);

        if (payAllUnpaid) {
            setPayAllUnpaid(false);
        }

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

                overduePayments.forEach(overduePayment => {
                    if (!newSelections.includes(overduePayment.ips_id)) {
                        newSelections.push(overduePayment.ips_id);
                    }
                });

                for (let i = 1; i <= paymentNumber; i++) {
                    const targetPayment = unpaidPayments.find(p => parseInt(p.payment_number) === i);
                    if (targetPayment && !newSelections.includes(targetPayment.ips_id)) {
                        newSelections.push(targetPayment.ips_id);
                    }
                }

                return newSelections;
            }
        });
    };

    const canSelectPayment = (payment) => {
        if (payAllUnpaid) return false;

        const installmentSchedules = installmentDList.filter(schedule =>
            schedule.installment_id === selectedInstallmentForPayment.installment_sales_id
        );

        const today = new Date();
        const unpaidPayments = installmentSchedules
            .filter(p => p.status !== 'Paid')
            .map(p => calculateOverduePenalty(p))
            .sort((a, b) => parseInt(a.payment_number) - parseInt(b.payment_number));

        const overduePayments = unpaidPayments.filter(p => p.days_overdue > 3);

        const allOverdueSelected = overduePayments.every(overduePayment =>
            selectedPayments.includes(overduePayment.ips_id)
        );

        if (overduePayments.length > 0 && !allOverdueSelected) {
            return payment.days_overdue > 3;
        }

        const paymentNumber = parseInt(payment.payment_number);
        for (let i = 1; i < paymentNumber; i++) {
            const lowerPayment = unpaidPayments.find(p => parseInt(p.payment_number) === i);
            if (lowerPayment && !selectedPayments.includes(lowerPayment.ips_id)) {
                return false;
            }
        }

        return true;
    };

    const handlePayAllUnpaid = () => {
        setPayAllUnpaid(!payAllUnpaid);
        if (!payAllUnpaid) {
            setSelectedPayments([]);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getRiskLevel = (paymentBehavior) => {
        const {
            totalScheduled,
            totalPaid,
            overdueCount,
            completionRate,
            latePaymentCount,
            currentOverduePayments
        } = paymentBehavior;

        if (totalScheduled === 0) {
            return {
                level: 'unknown',
                color: 'secondary',
                label: 'No Payment History',
                payerType: 'No History',
                payerColor: 'secondary'
            };
        }

        const combinedOverdueCount = overdueCount + latePaymentCount;
        const combinedOverdueRate = totalScheduled > 0 ? ((combinedOverdueCount / totalScheduled) * 100) : 0;
        const latePaymentRate = totalPaid > 0 ? ((latePaymentCount / totalPaid) * 100) : 0;

        if (currentOverduePayments >= 3 ||
            combinedOverdueRate >= 40 ||
            latePaymentRate >= 50) {
            return {
                level: 'bad',
                color: 'danger',
                label: 'Bad Payer',
                payerType: 'Bad Payer',
                payerColor: 'danger'
            };
        }

        if (combinedOverdueRate >= 20 ||
            latePaymentRate >= 25 ||
            (currentOverduePayments >= 1 && currentOverduePayments < 3)) {
            return {
                level: 'average',
                color: 'warning',
                label: 'Average Payer',
                payerType: 'Average Payer',
                payerColor: 'warning'
            };
        }

        if (completionRate >= 80 &&
            combinedOverdueRate < 20 &&
            latePaymentRate < 25 &&
            currentOverduePayments === 0) {
            return {
                level: 'good',
                color: 'success',
                label: 'Good Payer',
                payerType: 'Good Payer',
                payerColor: 'success'
            };
        }

        if (totalScheduled <= 3 && combinedOverdueRate < 20 && currentOverduePayments === 0) {
            return {
                level: 'new',
                color: 'info',
                label: 'New Customer',
                payerType: 'New Customer',
                payerColor: 'info'
            };
        }

        return {
            level: 'average',
            color: 'warning',
            label: 'Average Payer',
            payerType: 'Average Payer',
            payerColor: 'warning'
        };
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'paid': return <CheckCircle className="text-success" size={20} />;
            case 'unpaid': return <XCircle className="text-danger" size={20} />;
            case 'on going': return <Clock className="text-primary" size={20} />;
            default: return <Clock className="text-secondary" size={20} />;
        }
    };

    const customersWithInstallments = useMemo(() => {
        return customerList.map(customer => {
            const customerInstallments = installmentList.filter(inst => inst.cust_id === customer.cust_id);
            const customerPaymentSchedules = installmentDList.filter(schedule =>
                customerInstallments.some(inst => inst.installment_sales_id === schedule.installment_id)
            );
            const customerPaymentRecords = paymentRecord.filter(record =>
                customerPaymentSchedules.some(schedule => schedule.ips_id === record.ips_id)
            );

            const totalScheduled = customerPaymentSchedules.length;
            const totalPaid = customerPaymentSchedules.filter(schedule =>
                schedule.status.toLowerCase() === 'paid'
            ).length;

            const today = new Date();
            const overdueSchedules = customerPaymentSchedules.filter(schedule => {
                if (schedule.status.toLowerCase() === 'paid') return false;
                const dueDate = new Date(schedule.due_date);
                const daysDiff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                return daysDiff > 3;
            });

            const pendingOverdueSchedules = customerPaymentSchedules.filter(schedule => {
                if (schedule.status.toLowerCase() === 'paid') return false;
                const dueDate = new Date(schedule.due_date);
                const daysDiff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                return daysDiff > 0 && daysDiff <= 3;
            });

            const latePaymentSchedules = customerPaymentSchedules.filter(schedule => {
                if (schedule.status.toLowerCase() !== 'paid') return false;
                const paymentRecord = customerPaymentRecords.find(record => record.ips_id === schedule.ips_id);
                if (!paymentRecord) return false;
                const dueDate = new Date(schedule.due_date);
                const paymentDate = new Date(paymentRecord.date);
                const daysDiff = Math.floor((paymentDate - dueDate) / (1000 * 60 * 60 * 24));
                return daysDiff > 3;
            });

            const overdueCount = overdueSchedules.length;
            const pendingOverdueCount = pendingOverdueSchedules.length;
            const latePaymentCount = latePaymentSchedules.length;
            const currentOverduePayments = overdueSchedules.length;
            const completionRate = totalScheduled > 0 ? ((totalPaid / totalScheduled) * 100) : 0;
            const overdueRate = totalScheduled > 0 ? ((overdueCount / totalScheduled) * 100) : 0;

            let totalPenalties = 0;
            let currentOverduePenalties = 0;

            customerPaymentSchedules.forEach(schedule => {
                const processed = calculateOverduePenalty(schedule);
                if (schedule.status.toLowerCase() === 'paid' && processed.has_penalty) {
                    totalPenalties += processed.penalty_amount;
                } else if (schedule.status.toLowerCase() === 'unpaid' && processed.has_penalty) {
                    currentOverduePenalties += processed.penalty_amount;
                }
            });

            const totalDebt = customerInstallments.reduce((sum, inst) =>
                sum + parseFloat(inst.balance || 0), 0
            );
            const totalPaymentsWithoutPenalties = customerPaymentSchedules.reduce((sum, schedule) =>
                schedule.status.toLowerCase() === 'paid' ? sum + parseFloat(schedule.amount_due || 0) : sum, 0
            );

            const paymentBehavior = {
                totalScheduled,
                totalPaid,
                overdueCount,
                pendingOverdueCount,
                latePaymentCount,
                currentOverduePayments,
                completionRate: parseFloat(completionRate.toFixed(1)),
                overdueRate: parseFloat(overdueRate.toFixed(1)),
                totalDebt,
                totalPayments: totalPaymentsWithoutPenalties,
                totalPenalties,
                currentOverduePenalties,
                totalPenaltiesAccrued: totalPenalties + currentOverduePenalties
            };

            const risk = getRiskLevel(paymentBehavior);

            return {
                ...customer,
                installments: customerInstallments,
                paymentSchedules: customerPaymentSchedules,
                paymentRecords: customerPaymentRecords,
                paymentBehavior,
                risk,
                totalInstallmentPlans: customerInstallments.length
            };
        }).filter(customer => customer.installments.length > 0);
    }, [customerList, installmentList, installmentDList, paymentRecord]);

    const filteredCustomers = useMemo(() => {
        let filtered = customersWithInstallments;

        if (searchTerm.trim()) {
            filtered = filtered.filter(customer =>
                customer.cust_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone.includes(searchTerm) ||
                customer.address.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (planStatusFilter !== 'all') {
            filtered = filtered.filter(customer => {
                if (planStatusFilter === 'ongoing') {
                    return customer.installments.some(inst => inst.status === 'ON GOING');
                } else if (planStatusFilter === 'completed') {
                    return customer.installments.every(inst => inst.status === 'Complete');
                }
                return true;
            });
        }

        return filtered;
    }, [customersWithInstallments, searchTerm, planStatusFilter]);

    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const openCustomerModal = (customer) => {
        setSelectedCustomer(customer);
        setShowCustomerModal(true);
    };

    const closeCustomerModal = () => {
        setShowCustomerModal(false);
        setSelectedCustomer(null);
    };

    const getPaymentStatusBadge = (schedule) => {
        const dueDate = new Date(schedule.due_date);
        const today = new Date();

        const paymentRecord = selectedCustomer?.paymentRecords.find(record =>
            record.ips_id === schedule.ips_id
        );

        if (schedule.status.toLowerCase() === 'paid' && paymentRecord) {
            const paymentDate = new Date(paymentRecord.date);
            const daysDifference = Math.floor((paymentDate - dueDate) / (1000 * 60 * 60 * 24));

            if (daysDifference <= 3) {
                return (
                    <div>
                        <span className="badge bg-success mb-1">PAID ON TIME</span>
                        <div className="small text-success">
                            <strong>Paid:</strong> {formatDate(paymentRecord.date)}
                        </div>
                    </div>
                );
            } else {
                const penaltyAmount = parseFloat(schedule.amount_due) * 0.05;

                return (
                    <div>
                        <span className="badge bg-warning mb-1">PAID LATE</span>
                        <div className="small text-warning">
                            <strong>Paid:</strong> {formatDate(paymentRecord.date)}
                            <div className="text-danger mt-1">
                                <strong>Penalty:</strong> {formatCurrency(penaltyAmount)}
                            </div>
                        </div>
                    </div>
                );
            }
        }

        if (schedule.status.toLowerCase() === 'paid') {
            return <span className="badge bg-success">PAID</span>;
        }

        const daysDiff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        const isOverdue = schedule.status.toLowerCase() === 'unpaid' && daysDiff > 3;

        if (isOverdue) {
            const penaltyAmount = parseFloat(schedule.amount_due) * 0.05;
            const totalWithPenalty = parseFloat(schedule.amount_due) + penaltyAmount;

            return (
                <div>
                    <span className="badge bg-danger mb-1">OVERDUE</span>
                    <div className="small text-danger">
                        <strong>Due:</strong> {formatDate(schedule.due_date)}
                        <div className="text-danger mt-1 fw-bold">
                            <strong>Amount:</strong> {formatCurrency(totalWithPenalty)}
                        </div>
                    </div>
                </div>
            );
        }

        if (daysDiff > 0 && daysDiff <= 3) {
            const graceDaysLeft = 3 - daysDiff;
            return (
                <div>
                    <span className="badge bg-warning mb-1">GRACE PERIOD</span>
                    <div className="small text-warning">
                        <strong>Due:</strong> {formatDate(schedule.due_date)}
                        <div className="text-warning fw-bold">
                            <small>{graceDaysLeft} day{graceDaysLeft > 1 ? 's' : ''} left</small>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div>
                <span className="badge bg-primary mb-1">PENDING</span>
                <div className="small text-primary">
                    <strong>Due:</strong> {formatDate(schedule.due_date)}
                </div>
            </div>
        );
    };

    return (
        <>
            <Modal show={showPenaltyBreakdown} onHide={() => setShowPenaltyBreakdown(false)} size="md" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Penalty Breakdown</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPaymentForBreakdown && (() => {
                        const processed = calculateOverduePenalty(selectedPaymentForBreakdown);
                        return (
                            <>
                                <div className="mb-3">
                                    <h6>Payment Details</h6>
                                    <div>Due Date: {formatDate(selectedPaymentForBreakdown.due_date)}</div>
                                    <div>Days Overdue: {processed.days_overdue}</div>
                                    {processed.is_in_grace_period && (
                                        <div className="text-warning fw-bold">
                                            Grace Period: {processed.grace_days_left} day{processed.grace_days_left > 1 ? 's' : ''} left
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <h6>Amount Breakdown</h6>
                                    <table className="table table-sm">
                                        <tbody>
                                            <tr>
                                                <td>Original Amount</td>
                                                <td className="text-end">{formatCurrency(processed.original_amount)}</td>
                                            </tr>
                                            {processed.penalty_breakdown.map((penalty, index) => (
                                                <tr key={index}>
                                                    <td>{penalty.type}<br /><small className="text-muted">({penalty.days} - {penalty.rate})</small></td>
                                                    <td className="text-end text-danger">+{formatCurrency(penalty.amount)}</td>
                                                </tr>
                                            ))}
                                            <tr className="border-top fw-bold">
                                                <td>Total Amount Due</td>
                                                <td className="text-end">{formatCurrency(processed.total_amount)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        );
                    })()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPenaltyBreakdown(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showReceipt} onHide={closeReceipt} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Payment Recorded Successfully</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {lastTransaction && (
                        <>
                            <div className="text-center mb-4 p-3 bg-light rounded">
                                <h4>A.G HOME APPLIANCE AND FURNITURE SHOWROOM</h4>
                                <div className="text-muted">
                                    <div>Receipt #{lastTransaction.receipt_id}</div>
                                    <div>{lastTransaction.date} • {lastTransaction.time}</div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <h5>Customer Information</h5>
                                <div className="p-3 bg-light rounded">
                                    <div><strong>Installment ID:</strong> {lastTransaction.customer.installment_sales_id}</div>
                                    <div><strong>Customer:</strong> {lastTransaction.customer.cust_name}</div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <h5>Payments Recorded</h5>
                                <div className="p-3 bg-light rounded">
                                    {lastTransaction.payments.map((payment, index) => (
                                        <div key={index} className={`py-2 ${index < lastTransaction.payments.length - 1 ? 'border-bottom' : ''}`}>
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <div><strong>Payment #{payment.payment_number}</strong></div>
                                                    <div className="text-muted small">Due: {formatDate(payment.due_date)}</div>
                                                    {payment.has_penalty && (
                                                        <div className="text-danger small">Penalty: {formatCurrency(payment.penalty_amount)}</div>
                                                    )}
                                                </div>
                                                <div className="fw-bold">{formatCurrency(payment.total_amount)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-3 bg-light rounded">
                                <div className="d-flex justify-content-between fs-5 fw-bold">
                                    <span>Total Amount Paid:</span>
                                    <span className="text-success">{formatCurrency(lastTransaction.total_amount)}</span>
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeReceipt}>Close</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={recordPaymentVisible} onHide={() => setRecordPaymentVisible(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Record Payment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedInstallmentForPayment && (() => {
                        const installmentSchedules = installmentDList.filter(schedule =>
                            schedule.installment_id === selectedInstallmentForPayment.installment_sales_id
                        );

                        const unpaidPayments = installmentSchedules
                            .filter(payment => payment.status !== 'Paid')
                            .map(payment => calculateOverduePenalty(payment))
                            .sort((a, b) => parseInt(a.payment_number) - parseInt(b.payment_number));

                        const overduePayments = unpaidPayments.filter(payment => payment.days_overdue > 3);

                        const selectedPaymentTotal = payAllUnpaid
                            ? unpaidPayments.reduce((sum, payment) => sum + payment.total_amount, 0)
                            : selectedPayments.reduce((sum, ipsId) => {
                                const payment = unpaidPayments.find(p => p.ips_id === ipsId);
                                return sum + (payment ? payment.total_amount : 0);
                            }, 0);

                        return (
                            <>
                                <div className="mb-3">
                                    <div><strong>Installment ID:</strong> {selectedInstallmentForPayment.installment_sales_id}</div>
                                    <div><strong>Customer:</strong> {selectedInstallmentForPayment.cust_name}</div>
                                </div>

                                {overduePayments.length > 0 && (
                                    <div className="alert alert-warning mb-3">
                                        <strong>OVERDUE PAYMENTS DETECTED</strong>
                                        <div>This customer has {overduePayments.length} payment{overduePayments.length > 1 ? 's' : ''} past grace period. ALL overdue payments must be paid together.</div>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label>
                                        <input type="checkbox" checked={payAllUnpaid} onChange={handlePayAllUnpaid} disabled={unpaidPayments.length === 0} className="me-2" />
                                        Pay All Unpaid ({unpaidPayments.length} payments)
                                    </label>
                                </div>

                                <div className="table-responsive mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <table className="table table-sm">
                                        <thead className="sticky-top bg-white">
                                            <tr>
                                                <th>Select</th>
                                                <th>Payment #</th>
                                                <th>Amount</th>
                                                <th>Due Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {unpaidPayments.map((payment) => (
                                                <tr key={payment.ips_id} style={{
                                                    backgroundColor: (payAllUnpaid || selectedPayments.includes(payment.ips_id)) ? '#e3f2fd' :
                                                        !canSelectPayment(payment) ? '#f5f5f5' : 'transparent',
                                                    opacity: !canSelectPayment(payment) && !payAllUnpaid ? 0.6 : 1
                                                }}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={payAllUnpaid || selectedPayments.includes(payment.ips_id)}
                                                            onChange={() => handlePaymentSelection(payment.ips_id)}
                                                            disabled={payAllUnpaid || !canSelectPayment(payment)}
                                                        />
                                                    </td>
                                                    <td>
                                                        {payment.payment_number}
                                                        {payment.days_overdue > 3 && <span className="badge bg-danger ms-2">OVERDUE</span>}
                                                    </td>
                                                    <td><AmountDisplayCell payment={payment} /></td>
                                                    <td>
                                                        <div>{formatDate(payment.due_date)}</div>
                                                        {payment.is_in_grace_period && (
                                                            <small className="text-warning">Grace: {payment.grace_days_left} day{payment.grace_days_left > 1 ? 's' : ''}</small>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${payment.days_overdue > 3 ? 'bg-danger' : 'bg-warning'}`}>
                                                            {payment.days_overdue > 3 ? 'OVERDUE' : payment.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-3 bg-light rounded">
                                    <div className="d-flex justify-content-between">
                                        <strong>
                                            {payAllUnpaid ? `All Unpaid (${unpaidPayments.length})` : `Selected (${selectedPayments.length})`}
                                        </strong>
                                        <strong className="text-success">Total: {formatCurrency(selectedPaymentTotal)}</strong>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setRecordPaymentVisible(false)}>Cancel</Button>
                    <Button variant="success" onClick={RecordPayment} disabled={!payAllUnpaid && selectedPayments.length === 0}>
                        Record Payment{(payAllUnpaid || selectedPayments.length > 1) ? 's' : ''}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showCustomerModal} onHide={closeCustomerModal} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <User className="me-2" size={24} />
                        {selectedCustomer?.cust_name} - Payment Analysis
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {selectedCustomer && (
                        <>
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <div className="card">
                                        <div className="card-body">
                                            <h6>Customer Information</h6>
                                            <div className="mb-2"><small className="text-muted">Email:</small><div>{selectedCustomer.email}</div></div>
                                            <div className="mb-2"><small className="text-muted">Phone:</small><div>{selectedCustomer.phone}</div></div>
                                            <div className="mb-2"><small className="text-muted">Total Loan:</small><div className="h5 text-danger">{formatCurrency(selectedCustomer.paymentBehavior.totalDebt)}</div></div>
                                            <div><small className="text-muted">Total Payments:</small><div className="h5 text-success">{formatCurrency(selectedCustomer.paymentBehavior.totalPayments)}</div></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-8">
                                    <div className="card">
                                        <div className="card-body">
                                            <h6>Payment Behavior Analysis</h6>
                                            <div className="row text-center mb-3">
                                                <div className="col-3">
                                                    <div className="h4 text-primary">{selectedCustomer.totalInstallmentPlans}</div>
                                                    <small>Plans</small>
                                                </div>
                                                <div className="col-3">
                                                    <div className="h4 text-success">{selectedCustomer.paymentBehavior.totalPaid}</div>
                                                    <small>Paid</small>
                                                </div>
                                                <div className="col-3">
                                                    <div className="h4 text-danger">{selectedCustomer.paymentBehavior.overdueCount}</div>
                                                    <small>Overdue</small>
                                                </div>
                                                <div className="col-3">
                                                    <div className="h4 text-warning">{selectedCustomer.paymentBehavior.pendingOverdueCount}</div>
                                                    <small>In Grace</small>
                                                </div>
                                            </div>
                                            <div className="card mb-3">
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span>Credit Assessment</span>
                                                        <span className={`badge bg-${selectedCustomer.risk.payerColor} fs-5`}>
                                                            {selectedCustomer.risk.payerType.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="mb-3">
                                                        <div className="d-flex justify-content-between mb-1">
                                                            <small>Payment Completion</small>
                                                            <strong className={selectedCustomer.paymentBehavior.completionRate >= 80 ? 'text-success' : selectedCustomer.paymentBehavior.completionRate >= 60 ? 'text-warning' : 'text-danger'}>
                                                                {selectedCustomer.paymentBehavior.completionRate}%
                                                            </strong>
                                                        </div>
                                                        <div className="progress mb-2" style={{ height: '8px' }}>
                                                            <div className={`progress-bar ${selectedCustomer.paymentBehavior.completionRate >= 80 ? 'bg-success' : selectedCustomer.paymentBehavior.completionRate >= 60 ? 'bg-warning' : 'bg-danger'}`}
                                                                style={{ width: `${selectedCustomer.paymentBehavior.completionRate}%` }}></div>
                                                        </div>
                                                        <small className="text-muted">{selectedCustomer.paymentBehavior.totalPaid} of {selectedCustomer.paymentBehavior.totalScheduled} completed</small>
                                                    </div>
                                                    <div>
                                                        <div className="d-flex justify-content-between mb-1">
                                                            <small>Combined Overdue Rate</small>
                                                            <strong className={
                                                                ((selectedCustomer.paymentBehavior.overdueCount + selectedCustomer.paymentBehavior.latePaymentCount) / selectedCustomer.paymentBehavior.totalScheduled * 100) >= 40 ? 'text-danger' :
                                                                    ((selectedCustomer.paymentBehavior.overdueCount + selectedCustomer.paymentBehavior.latePaymentCount) / selectedCustomer.paymentBehavior.totalScheduled * 100) >= 20 ? 'text-warning' : 'text-success'
                                                            }>
                                                                {(((selectedCustomer.paymentBehavior.overdueCount + selectedCustomer.paymentBehavior.latePaymentCount) / selectedCustomer.paymentBehavior.totalScheduled * 100) || 0).toFixed(1)}%
                                                            </strong>
                                                        </div>
                                                        <div className="progress mb-2" style={{ height: '8px' }}>
                                                            <div className={`progress-bar ${((selectedCustomer.paymentBehavior.overdueCount + selectedCustomer.paymentBehavior.latePaymentCount) / selectedCustomer.paymentBehavior.totalScheduled * 100) >= 40 ? 'bg-danger' :
                                                                ((selectedCustomer.paymentBehavior.overdueCount + selectedCustomer.paymentBehavior.latePaymentCount) / selectedCustomer.paymentBehavior.totalScheduled * 100) >= 20 ? 'bg-warning' : 'bg-success'
                                                                }`}
                                                                style={{ width: `${((selectedCustomer.paymentBehavior.overdueCount + selectedCustomer.paymentBehavior.latePaymentCount) / selectedCustomer.paymentBehavior.totalScheduled * 100) || 0}%` }}></div>
                                                        </div>
                                                        <small className="text-muted">
                                                            {selectedCustomer.paymentBehavior.overdueCount} past grace + {selectedCustomer.paymentBehavior.latePaymentCount} paid late
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <h6>Installment Plans ({selectedCustomer.installments.length})</h6>
                                </div>
                                <div className="card-body">
                                    {selectedCustomer.installments.map((installment, index) => {
                                        const planSchedules = selectedCustomer.paymentSchedules.filter(
                                            schedule => schedule.installment_id === installment.installment_sales_id
                                        );
                                        const hasUnpaid = planSchedules.some(s => s.status !== 'Paid');

                                        return (
                                            <div key={installment.installment_sales_id} className="card mb-3">
                                                <div className="card-header">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h6 className="mb-0">Plan #{index + 1} - ID {installment.installment_sales_id}</h6>
                                                            <small className="text-muted">{formatDate(installment.date)} • {installment.payment_plan} months</small>
                                                        </div>
                                                        <div className="text-end">
                                                            <span className={`badge bg-${installment.status === 'ON GOING' ? 'primary' : installment.status === 'Complete' ? 'success' : 'danger'} mb-2`}>
                                                                {installment.status.toUpperCase()}
                                                            </span>
                                                            <div><small>{formatCurrency(installment.balance)} remaining</small></div>
                                                            {hasUnpaid && (
                                                                <Button size="sm" variant="success" onClick={() => handleRecordPaymentClick(installment)}>
                                                                    Record Payment
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    <table className="table table-sm">
                                                        <thead>
                                                            <tr>
                                                                <th>Payment #</th>
                                                                <th>Due Date</th>
                                                                <th>Amount</th>
                                                                <th>Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {planSchedules.map((schedule) => (
                                                                <tr key={schedule.ips_id}>
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            {getStatusIcon(schedule.status)}
                                                                            <span className="ms-2">#{schedule.payment_number}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td>{formatDate(schedule.due_date)}</td>
                                                                    <td>{formatCurrency(schedule.amount_due)}</td>
                                                                    <td>{getPaymentStatusBadge(schedule)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeCustomerModal}>Close</Button>
                </Modal.Footer>
            </Modal>

            <div className='dash-main'>
                <div className="mb-4">
                    <h1>CUSTOMER INSTALLMENT MANAGEMENT</h1>
                </div>

                <div style={{
                    padding: '15px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    margin: '10px 0 20px 0',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                                Search Customers
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
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name, email, phone, or address..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px 8px 35px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                                {searchTerm && (
                                    <button type="button" onClick={() => setSearchTerm('')} style={{
                                        position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: '#6c757d', cursor: 'pointer',
                                        padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }} title="Clear search">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Plan Status
                            </label>
                            <select value={planStatusFilter} onChange={(e) => setPlanStatusFilter(e.target.value)} style={{
                                width: '100%', padding: '8px 12px', border: '1px solid #ced4da',
                                borderRadius: '4px', fontSize: '14px', backgroundColor: 'white'
                            }}>
                                <option value="all">All Plans</option>
                                <option value="ongoing">Ongoing Plans</option>
                                <option value="completed">Completed Plans</option>
                            </select>
                        </div>
                    </div>
                </div>

                {filteredCustomers.length === 0 && (searchTerm || planStatusFilter !== 'all') ? (
                    <div className="text-center py-5">
                        <h5 className="text-muted">No customers found</h5>
                        <Button variant="outline-primary" onClick={() => { setSearchTerm(''); setPlanStatusFilter('all'); }}>Clear Filters</Button>
                    </div>
                ) : (
                    <>
                        <div className="row">
                            {paginatedCustomers.map((customer) => (
                                <div key={customer.cust_id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                                    <div className="card h-100">
                                        <div className="card-body d-flex flex-column">
                                            <div className="d-flex justify-content-between mb-3">
                                                <div className="flex-grow-1">
                                                    <div className="text-start" style={{marginBottom: '20px'}}>
                                                        <span className={`badge bg-${customer.risk.payerColor}`}>
                                                            {customer.risk.payerType.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <h6 className="mb-1">{customer.cust_name}</h6>
                                                    <small className="text-muted d-block">{customer.email}</small>
                                                    <small className="text-muted">{customer.phone}</small>
                                                </div>

                                            </div>
                                            <div className="mb-3 flex-grow-1">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <small className="text-muted">Loan:</small>
                                                    <small>{formatCurrency(customer.paymentBehavior.totalDebt)}</small>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <small className="text-muted">Paid:</small>
                                                    <small className="text-success">{formatCurrency(customer.paymentBehavior.totalPayments)}</small>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <small className="text-muted">Completion:</small>
                                                    <small className={customer.paymentBehavior.completionRate >= 80 ? 'text-success' : customer.paymentBehavior.completionRate >= 60 ? 'text-warning' : 'text-danger'}>
                                                        {customer.paymentBehavior.completionRate}%
                                                    </small>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <small className="text-muted">Overdue:</small>
                                                    <small className="text-danger">
                                                        {customer.paymentBehavior.overdueCount} past grace
                                                    </small>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <small className="text-muted">In Grace:</small>
                                                    <small className="text-warning">
                                                        {customer.paymentBehavior.pendingOverdueCount} pending
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <small className="text-muted d-block mb-1">Payment Completion</small>
                                                <div className="progress" style={{ height: '8px' }}>
                                                    <div className={`progress-bar ${customer.paymentBehavior.completionRate >= 80 ? 'bg-success' : customer.paymentBehavior.completionRate >= 60 ? 'bg-warning' : 'bg-danger'}`}
                                                        style={{ width: `${customer.paymentBehavior.completionRate}%` }}></div>
                                                </div>
                                            </div>
                                            <Button variant="primary" size="sm" onClick={() => openCustomerModal(customer)} className="w-100">
                                                <Eye size={16} className="me-1" /> View & Record Payment
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <nav>
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default PaymentBehaviorAdmin;