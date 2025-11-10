'use client';
import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { User, Calendar, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

const PaymentBehavior = () => {
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerList, setCustomerList] = useState([]);
    const [installmentList, setInstallmentList] = useState([]);
    const [installmentDList, setInstallmentDList] = useState([]);
    const [paymentRecord, setPaymentRecord] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPenaltyBreakdown, setShowPenaltyBreakdown] = useState(false);
    const [selectedPaymentForBreakdown, setSelectedPaymentForBreakdown] = useState(null);
    const [planStatusFilter, setPlanStatusFilter] = useState('all');
    const [showCompletedInstallmentsModal, setShowCompletedInstallmentsModal] = useState(false);
    const [completedInstallmentsSearchTerm, setCompletedInstallmentsSearchTerm] = useState('');
    const [completedInstallmentsPage, setCompletedInstallmentsPage] = useState(1);

    useEffect(() => {
        GetCustomer();
        GetInstallment();
        GetInstallmentD();
        GetPaymentRecord();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, planStatusFilter]);

    useEffect(() => {
        setCompletedInstallmentsPage(1);
    }, [completedInstallmentsSearchTerm]);

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

        // Grace period includes due date: day 0 (due date) = grace day 1, days 0-2 = grace period (3 days total)
        // Penalty applies from day 3 onwards (daysDifference >= 3)
        if (payment.status !== 'Paid' && daysDifference >= 0) {
            if (daysDifference >= 0 && daysDifference < 3) {
                // Grace period: due date (0), +1 day (1), +2 days (2)
                graceDaysLeft = 2 - daysDifference; // If 0 days (due date), 2 days left. If 1 day, 1 day left. If 2 days, 0 days left.
                const graceDayNumber = daysDifference + 1; // Grace day 1, 2, or 3
                penaltyDescription = `${daysDifference === 0 ? 'Due today (Grace day 1)' : daysDifference === 1 ? '1 day overdue (Grace day 2)' : '2 days overdue (Grace day 3)'} - ${graceDaysLeft} day${graceDaysLeft !== 1 ? 's' : ''} left`;
            } else if (daysDifference >= 3) {
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
            is_in_grace_period: daysDifference >= 0 && daysDifference < 3,
            grace_days_left: daysDifference >= 0 && daysDifference < 3 ? (2 - daysDifference) : 0,
            severity_level: daysDifference < 3 ? 'grace' : 'penalty'
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
            
            // Validate that response.data is an array
            if (Array.isArray(response.data)) {
                setInstallmentList(response.data);
            } else {
                console.error("Installments response is not an array:", response.data);
                setInstallmentList([]);
            }
        } catch (error) {
            console.error("Error fetching installments:", error);
            setInstallmentList([]);
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
            
            // Validate that response.data is an array
            if (Array.isArray(response.data)) {
                setInstallmentDList(response.data);
            } else {
                console.error("Installment details response is not an array:", response.data);
                setInstallmentDList([]);
            }
        } catch (error) {
            console.error("Error fetching installment details:", error);
            setInstallmentDList([]);
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
            
            // Validate that response.data is an array
            if (Array.isArray(response.data)) {
                setPaymentRecord(response.data);
            } else {
                console.error("Payment records response is not an array:", response.data);
                setPaymentRecord([]); // Set empty array as fallback
            }
        } catch (error) {
            console.error("Error fetching payment records:", error);
            setPaymentRecord([]); // Set empty array on error
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
            
            // Validate that response.data is an array
            if (Array.isArray(response.data)) {
                setCustomerList(response.data);
            } else {
                console.error("Customer list response is not an array:", response.data);
                setCustomerList([]);
            }
        } catch (error) {
            console.error("Error fetching customer list:", error);
            setCustomerList([]);
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
            totalPaid,
            overdueCount,
            latePaymentCount,
            onTimePaymentRate,
            consecutiveBadPayments
        } = paymentBehavior;

        // No payment history
        if (totalPaid === 0 && overdueCount === 0) {
            return {
                level: 'unknown',
                color: 'secondary',
                label: 'No Payment History',
                payerType: 'No History',
                payerColor: 'secondary'
            };
        }

        // BAD PAYER: Has a CONSECUTIVE streak of 3 or more bad payments
        // (consecutive past grace period or late paid payments)
        if (consecutiveBadPayments >= 3) {
            return {
                level: 'bad',
                color: 'danger',
                label: 'Bad Payer',
                payerType: 'Bad Payer',
                payerColor: 'danger',
                consecutiveStreak: consecutiveBadPayments
            };
        }

        // GOOD PAYER: 70% or more of payments are on time (paid within 3 days of due date)
        if (totalPaid > 0 && onTimePaymentRate >= 70) {
            return {
                level: 'good',
                color: 'success',
                label: 'Good Payer',
                payerType: 'Good Payer',
                payerColor: 'success'
            };
        }

        // AVERAGE PAYER: Everything in between
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
                // Penalty applies from day 3 onwards (due date is day 0)
                return daysDiff >= 3;
            });

            const pendingOverdueSchedules = customerPaymentSchedules.filter(schedule => {
                if (schedule.status.toLowerCase() === 'paid') return false;
                const dueDate = new Date(schedule.due_date);
                const daysDiff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                // Grace period includes due date: days 0-2 (due date + 2 days after)
                return daysDiff >= 0 && daysDiff < 3;
            });

            const latePaymentSchedules = customerPaymentSchedules.filter(schedule => {
                if (schedule.status.toLowerCase() !== 'paid') return false;
                const paymentRecord = customerPaymentRecords.find(record => record.ips_id === schedule.ips_id);
                if (!paymentRecord) return false;
                const dueDate = new Date(schedule.due_date);
                const paymentDate = new Date(paymentRecord.date);
                const daysDiff = Math.floor((paymentDate - dueDate) / (1000 * 60 * 60 * 24));
                // Paid late if paid on day 3 or later (due date is day 0)
                return daysDiff >= 3;
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

            // Calculate on-time payments (paid within 3 days of due date)
            const onTimePaymentCount = totalPaid - latePaymentCount;
            const onTimePaymentRate = totalPaid > 0 ? ((onTimePaymentCount / totalPaid) * 100) : 0;

            // Calculate consecutive bad payments (straight overdue or late payments)
            // Sort all schedules by payment number or due date
            const sortedSchedules = [...customerPaymentSchedules].sort((a, b) => {
                const numA = parseInt(a.payment_number) || 0;
                const numB = parseInt(b.payment_number) || 0;
                return numA - numB;
            });

            let maxConsecutiveBadPayments = 0;
            let currentStreak = 0;

            sortedSchedules.forEach(schedule => {
                let isBadPayment = false;

                // Check if currently overdue (past grace period)
                if (schedule.status.toLowerCase() !== 'paid') {
                    const dueDate = new Date(schedule.due_date);
                    const daysDiff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                    // Penalty applies from day 3 onwards (due date is day 0)
                    if (daysDiff >= 3) {
                        isBadPayment = true; // Currently overdue past grace period
                    }
                } else {
                    // Check if paid late (day 3 or later after due date, where due date is day 0)
                    const paymentRecord = customerPaymentRecords.find(record => record.ips_id === schedule.ips_id);
                    if (paymentRecord) {
                        const dueDate = new Date(schedule.due_date);
                        const paymentDate = new Date(paymentRecord.date);
                        const daysDiff = Math.floor((paymentDate - dueDate) / (1000 * 60 * 60 * 24));
                        if (daysDiff >= 3) {
                            isBadPayment = true; // Paid late
                        }
                    }
                }

                if (isBadPayment) {
                    currentStreak++;
                    maxConsecutiveBadPayments = Math.max(maxConsecutiveBadPayments, currentStreak);
                } else {
                    currentStreak = 0; // Reset streak if payment is on time
                }
            });

            const paymentBehavior = {
                totalScheduled,
                totalPaid,
                overdueCount,
                pendingOverdueCount,
                latePaymentCount,
                currentOverduePayments,
                onTimePaymentCount,
                onTimePaymentRate: parseFloat(onTimePaymentRate.toFixed(1)),
                completionRate: parseFloat(completionRate.toFixed(1)),
                overdueRate: parseFloat(overdueRate.toFixed(1)),
                totalDebt,
                totalPayments: totalPaymentsWithoutPenalties,
                totalPenalties,
                currentOverduePenalties,
                totalPenaltiesAccrued: totalPenalties + currentOverduePenalties,
                consecutiveBadPayments: maxConsecutiveBadPayments
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

    const completedInstallmentsList = useMemo(() => {
        const completed = [];
        customersWithInstallments.forEach(customer => {
            customer.installments
                .filter(inst => inst.status === 'Complete')
                .forEach(installment => {
                    const planSchedules = customer.paymentSchedules.filter(
                        schedule => schedule.installment_id === installment.installment_sales_id
                    );
                    const planPaymentRecords = customer.paymentRecords.filter(record =>
                        planSchedules.some(schedule => schedule.ips_id === record.ips_id)
                    );
                    
                    const totalPaid = planSchedules
                        .filter(s => s.status.toLowerCase() === 'paid')
                        .reduce((sum, s) => sum + parseFloat(s.amount_due || 0), 0);
                    
                    const totalPenalties = planSchedules.reduce((sum, schedule) => {
                        const processed = calculateOverduePenalty(schedule);
                        if (schedule.status.toLowerCase() === 'paid' && processed.has_penalty) {
                            return sum + processed.penalty_amount;
                        }
                        return sum;
                    }, 0);

                    completed.push({
                        ...installment,
                        customer: {
                            cust_id: customer.cust_id,
                            cust_name: customer.cust_name,
                            email: customer.email,
                            phone: customer.phone,
                            address: customer.address
                        },
                        paymentSchedules: planSchedules,
                        paymentRecords: planPaymentRecords,
                        totalPaid,
                        totalPenalties,
                        totalAmount: totalPaid + totalPenalties
                    });
                });
        });
        return completed;
    }, [customersWithInstallments]);

    const filteredCompletedInstallments = useMemo(() => {
        let filtered = completedInstallmentsList;

        if (completedInstallmentsSearchTerm.trim()) {
            filtered = filtered.filter(inst =>
                inst.customer.cust_name.toLowerCase().includes(completedInstallmentsSearchTerm.toLowerCase()) ||
                inst.customer.email.toLowerCase().includes(completedInstallmentsSearchTerm.toLowerCase()) ||
                inst.customer.phone.includes(completedInstallmentsSearchTerm) ||
                inst.customer.address.toLowerCase().includes(completedInstallmentsSearchTerm.toLowerCase()) ||
                inst.installment_sales_id.toString().includes(completedInstallmentsSearchTerm)
            );
        }

        return filtered;
    }, [completedInstallmentsList, completedInstallmentsSearchTerm]);

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

        // Always exclude completed installments from customer data (they're shown in modal)
        filtered = filtered.map(customer => {
                // Filter out completed installments from the customer's installments array
                const ongoingInstallments = customer.installments.filter(inst => inst.status !== 'Complete');
                
                // Only include customers who have at least one ongoing installment
                if (ongoingInstallments.length === 0) {
                    return null;
                }

                // Filter payment schedules to only include those from ongoing installments
                const ongoingInstallmentIds = ongoingInstallments.map(inst => inst.installment_sales_id);
                const ongoingPaymentSchedules = customer.paymentSchedules.filter(schedule =>
                    ongoingInstallmentIds.includes(schedule.installment_id)
                );
                const ongoingPaymentRecords = customer.paymentRecords.filter(record =>
                    ongoingPaymentSchedules.some(schedule => schedule.ips_id === record.ips_id)
                );

                // Recalculate payment behavior based only on ongoing installments
                const totalScheduled = ongoingPaymentSchedules.length;
                const totalPaid = ongoingPaymentSchedules.filter(schedule =>
                    schedule.status.toLowerCase() === 'paid'
                ).length;

                const today = new Date();
                const overdueSchedules = ongoingPaymentSchedules.filter(schedule => {
                    if (schedule.status.toLowerCase() === 'paid') return false;
                    const dueDate = new Date(schedule.due_date);
                    const daysDiff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                    return daysDiff >= 3;
                });

                const pendingOverdueSchedules = ongoingPaymentSchedules.filter(schedule => {
                    if (schedule.status.toLowerCase() === 'paid') return false;
                    const dueDate = new Date(schedule.due_date);
                    const daysDiff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                    return daysDiff >= 0 && daysDiff < 3;
                });

                const latePaymentSchedules = ongoingPaymentSchedules.filter(schedule => {
                    if (schedule.status.toLowerCase() !== 'paid') return false;
                    const paymentRecord = ongoingPaymentRecords.find(record => record.ips_id === schedule.ips_id);
                    if (!paymentRecord) return false;
                    const dueDate = new Date(schedule.due_date);
                    const paymentDate = new Date(paymentRecord.date);
                    const daysDiff = Math.floor((paymentDate - dueDate) / (1000 * 60 * 60 * 24));
                    return daysDiff >= 3;
                });

                const overdueCount = overdueSchedules.length;
                const pendingOverdueCount = pendingOverdueSchedules.length;
                const latePaymentCount = latePaymentSchedules.length;
                const completionRate = totalScheduled > 0 ? ((totalPaid / totalScheduled) * 100) : 0;
                const overdueRate = totalScheduled > 0 ? ((overdueCount / totalScheduled) * 100) : 0;

                let totalPenalties = 0;
                let currentOverduePenalties = 0;

                ongoingPaymentSchedules.forEach(schedule => {
                    const processed = calculateOverduePenalty(schedule);
                    if (schedule.status.toLowerCase() === 'paid' && processed.has_penalty) {
                        totalPenalties += processed.penalty_amount;
                    } else if (schedule.status.toLowerCase() === 'unpaid' && processed.has_penalty) {
                        currentOverduePenalties += processed.penalty_amount;
                    }
                });

                const totalDebt = ongoingInstallments.reduce((sum, inst) =>
                    sum + parseFloat(inst.balance || 0), 0
                );
                const totalPaymentsWithoutPenalties = ongoingPaymentSchedules.reduce((sum, schedule) =>
                    schedule.status.toLowerCase() === 'paid' ? sum + parseFloat(schedule.amount_due || 0) : sum, 0
                );

                const onTimePaymentCount = totalPaid - latePaymentCount;
                const onTimePaymentRate = totalPaid > 0 ? ((onTimePaymentCount / totalPaid) * 100) : 0;

                // Calculate consecutive bad payments for ongoing installments only
                const sortedSchedules = [...ongoingPaymentSchedules].sort((a, b) => {
                    const numA = parseInt(a.payment_number) || 0;
                    const numB = parseInt(b.payment_number) || 0;
                    return numA - numB;
                });

                let maxConsecutiveBadPayments = 0;
                let currentStreak = 0;

                sortedSchedules.forEach(schedule => {
                    let isBadPayment = false;

                    if (schedule.status.toLowerCase() !== 'paid') {
                        const dueDate = new Date(schedule.due_date);
                        const daysDiff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                        if (daysDiff >= 3) {
                            isBadPayment = true;
                        }
                    } else {
                        const paymentRecord = ongoingPaymentRecords.find(record => record.ips_id === schedule.ips_id);
                        if (paymentRecord) {
                            const dueDate = new Date(schedule.due_date);
                            const paymentDate = new Date(paymentRecord.date);
                            const daysDiff = Math.floor((paymentDate - dueDate) / (1000 * 60 * 60 * 24));
                            if (daysDiff >= 3) {
                                isBadPayment = true;
                            }
                        }
                    }

                    if (isBadPayment) {
                        currentStreak++;
                        maxConsecutiveBadPayments = Math.max(maxConsecutiveBadPayments, currentStreak);
                    } else {
                        currentStreak = 0;
                    }
                });

                const paymentBehavior = {
                    totalScheduled,
                    totalPaid,
                    overdueCount,
                    pendingOverdueCount,
                    latePaymentCount,
                    currentOverduePayments: overdueCount,
                    onTimePaymentCount,
                    onTimePaymentRate: parseFloat(onTimePaymentRate.toFixed(1)),
                    completionRate: parseFloat(completionRate.toFixed(1)),
                    overdueRate: parseFloat(overdueRate.toFixed(1)),
                    totalDebt,
                    totalPayments: totalPaymentsWithoutPenalties,
                    totalPenalties,
                    currentOverduePenalties,
                    totalPenaltiesAccrued: totalPenalties + currentOverduePenalties,
                    consecutiveBadPayments: maxConsecutiveBadPayments
                };

                const risk = getRiskLevel(paymentBehavior);

                return {
                    ...customer,
                    installments: ongoingInstallments,
                    paymentSchedules: ongoingPaymentSchedules,
                    paymentRecords: ongoingPaymentRecords,
                    paymentBehavior,
                    risk,
                    totalInstallmentPlans: ongoingInstallments.length
                };
        }).filter(customer => customer !== null);

        return filtered;
    }, [customersWithInstallments, searchTerm, planStatusFilter]);

    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const completedInstallmentsTotalPages = Math.ceil(filteredCompletedInstallments.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const completedInstallmentsStartIndex = (completedInstallmentsPage - 1) * ITEMS_PER_PAGE;
    const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const paginatedCompletedInstallments = filteredCompletedInstallments.slice(completedInstallmentsStartIndex, completedInstallmentsStartIndex + ITEMS_PER_PAGE);

    const openCustomerModal = (customer) => {
        setSelectedCustomer(customer);
        setShowCustomerModal(true);
    };

    const closeCustomerModal = () => {
        setShowCustomerModal(false);
        setSelectedCustomer(null);
    };

    const openCompletedInstallmentModal = (completedInstallment) => {
        // Find the customer from customersWithInstallments
        const customer = customersWithInstallments.find(c => 
            c.cust_id === completedInstallment.customer.cust_id
        );
        if (customer) {
            setSelectedCustomer(customer);
            setShowCustomerModal(true);
        }
    };

    const openCompletedInstallmentsModal = () => {
        setShowCompletedInstallmentsModal(true);
        setCompletedInstallmentsPage(1);
        setCompletedInstallmentsSearchTerm('');
    };

    const closeCompletedInstallmentsModal = () => {
        setShowCompletedInstallmentsModal(false);
        setCompletedInstallmentsPage(1);
        setCompletedInstallmentsSearchTerm('');
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
            const paidAmount = parseFloat(paymentRecord.amount || schedule.amount_due);

            // Paid on time if paid within grace period (due date day 0-2, so < 3)
            if (daysDifference < 3) {
                return (
                    <div>
                        <span className="badge bg-success mb-1">PAID ON TIME</span>
                        <div className="small text-success">
                            <strong>Paid:</strong> {formatDate(paymentRecord.date)}
                            <div className="mt-1 fw-bold">
                                <strong>Amount:</strong> {formatCurrency(paidAmount)}
                            </div>
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
                            <div className="text-success mt-1 fw-bold">
                                <strong>Amount:</strong> {formatCurrency(paidAmount)}
                            </div>
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

        // For unpaid/pending payments, check if overdue
        const daysDiff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        
        // OVERDUE (day 3 or later, where due date is day 0) - applies to any non-paid status
        if (daysDiff >= 3) {
            const penaltyAmount = parseFloat(schedule.amount_due) * 0.05;
            const totalWithPenalty = parseFloat(schedule.amount_due) + penaltyAmount;

            return (
                <div>
                    <span className="badge bg-danger mb-1">OVERDUE</span>
                    <div className="small text-danger">
                        <strong>Due:</strong> {formatDate(schedule.due_date)}
                        <div className="text-muted mt-1">
                            <strong>Original Amount:</strong> {formatCurrency(schedule.amount_due)}
                        </div>
                        <div className="text-danger mt-1">
                            <strong>Penalty (5%):</strong> {formatCurrency(penaltyAmount)}
                        </div>
                        <div className="text-danger mt-1 fw-bold">
                            <strong>Total Amount:</strong> {formatCurrency(totalWithPenalty)}
                        </div>
                    </div>
                </div>
            );
        }

        // GRACE PERIOD (due date day 0 + days 1-2, total 3 days grace) - applies to any non-paid status
        if (daysDiff >= 0 && daysDiff < 3) {
            const graceDaysLeft = 2 - daysDiff; // If due date (0), 2 days left. If +1 day (1), 1 day left. If +2 days (2), 0 days left.
            const potentialPenalty = parseFloat(schedule.amount_due) * 0.05;
            const totalWithPenalty = parseFloat(schedule.amount_due) + potentialPenalty;
            
            return (
                <div>
                    <span className="badge bg-warning mb-1">OVERDUE - GRACE PERIOD</span>
                    <div className="small text-warning">
                        <strong>Due:</strong> {formatDate(schedule.due_date)}
                        <div className="text-warning fw-bold mt-1">
                            <small>{graceDaysLeft} day{graceDaysLeft > 1 ? 's' : ''} left</small>
                        </div>
                        <div className="text-muted mt-1">
                            <strong>Current Amount:</strong> {formatCurrency(schedule.amount_due)}
                        </div>
                        <div className="text-danger mt-1">
                            <strong>Penalty if not paid:</strong> {formatCurrency(potentialPenalty)}
                        </div>
                        <div className="text-danger fw-bold mt-1">
                            <strong>Total after grace:</strong> {formatCurrency(totalWithPenalty)}
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
            <style>
                {`
                    @keyframes pulse {
                        0%, 100% {
                            transform: scale(1);
                            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
                        }
                        50% {
                            transform: scale(1.05);
                            box-shadow: 0 6px 20px rgba(40, 167, 69, 0.6);
                        }
                    }

                    /* Mobile Responsiveness */
                    @media (max-width: 768px) {
                        .mobile-record-btn {
                            font-size: 13px !important;
                            padding: 10px 16px !important;
                        }
                        
                        .mobile-record-btn svg {
                            width: 16px !important;
                            height: 16px !important;
                        }
                        
                        .mobile-view-pay-btn {
                            font-size: 13px !important;
                            padding: 10px !important;
                        }
                        
                        .mobile-view-pay-btn svg {
                            width: 16px !important;
                            height: 16px !important;
                        }
                        
                        .mobile-modal-title svg {
                            width: 16px !important;
                            height: 16px !important;
                        }

                        .mobile-plan-record-btn {
                            font-size: 14px !important;
                            padding: 10px 18px !important;
                        }

                        .mobile-plan-record-btn svg {
                            width: 18px !important;
                            height: 18px !important;
                        }

                        .modal-title {
                            font-size: 16px !important;
                        }

                        .modal-header svg,
                        .modal-body svg {
                            max-width: 18px !important;
                            max-height: 18px !important;
                        }
                    }

                    @media (max-width: 576px) {
                        .mobile-record-btn {
                            font-size: 12px !important;
                            padding: 8px 12px !important;
                        }
                        
                        .mobile-record-btn svg {
                            width: 14px !important;
                            height: 14px !important;
                        }
                        
                        .mobile-view-pay-btn {
                            font-size: 12px !important;
                            padding: 8px !important;
                        }
                        
                        .mobile-view-pay-btn svg {
                            width: 14px !important;
                            height: 14px !important;
                        }
                        
                        .mobile-modal-title svg {
                            width: 14px !important;
                            height: 14px !important;
                        }

                        .mobile-plan-record-btn {
                            font-size: 12px !important;
                            padding: 8px 14px !important;
                        }

                        .mobile-plan-record-btn svg {
                            width: 16px !important;
                            height: 16px !important;
                        }

                        .modal-title {
                            font-size: 14px !important;
                        }

                        .modal-header svg,
                        .modal-body svg {
                            max-width: 16px !important;
                            max-height: 16px !important;
                        }

                        .form-control-lg {
                            font-size: 1rem !important;
                        }
                    }

                    /* Large Tablets and Small Desktops (992px - 1200px) */
                    @media (max-width: 1200px) {
                        .dash-main h1 {
                            font-size: 1.75rem !important;
                        }
                    }

                    /* Tablets (768px - 991px) */
                    @media (max-width: 991px) {
                        .dash-main h1 {
                            font-size: 1.5rem !important;
                        }
                        
                        .modal-dialog {
                            margin: 0.5rem !important;
                        }
                        
                        .modal-xl {
                            max-width: 95% !important;
                        }

                        .col-lg-3 {
                            flex: 0 0 50% !important;
                            max-width: 50% !important;
                        }
                    }

                    /* Enhanced Mobile Responsiveness (768px and below) */
                    @media (max-width: 768px) {
                        .dash-main h1 {
                            font-size: 1.25rem !important;
                        }

                        .dash-main .mb-4 {
                            flex-direction: column !important;
                            align-items: flex-start !important;
                            gap: 15px !important;
                        }

                        .dash-main .mb-4 button {
                            width: 100% !important;
                            font-size: 13px !important;
                            padding: 10px !important;
                        }

                        .modal-xl {
                            max-width: 98% !important;
                        }

                        .modal-body {
                            padding: 1rem !important;
                            max-height: calc(100vh - 150px) !important;
                        }

                        .modal-body[style*="maxHeight"] {
                            max-height: calc(100vh - 150px) !important;
                        }

                        .modal-header {
                            padding: 0.75rem 1rem !important;
                        }

                        .modal-footer {
                            padding: 0.75rem 1rem !important;
                        }

                        .card-body {
                            padding: 1rem !important;
                        }

                        .table-responsive {
                            font-size: 0.875rem !important;
                        }

                        .pagination {
                            flex-wrap: wrap !important;
                        }

                        .page-link {
                            padding: 0.375rem 0.5rem !important;
                            font-size: 0.875rem !important;
                        }

                        /* Force single column for grid layouts on mobile */
                        div[style*="grid"] {
                            grid-template-columns: 1fr !important;
                        }

                        .col-lg-3,
                        .col-md-4 {
                            flex: 0 0 100% !important;
                            max-width: 100% !important;
                        }

                        .col-sm-6 {
                            flex: 0 0 100% !important;
                            max-width: 100% !important;
                        }
                    }

                    /* Enhanced Small Mobile (576px and below) */
                    @media (max-width: 576px) {
                        .dash-main h1 {
                            font-size: 1.1rem !important;
                            line-height: 1.3 !important;
                        }

                        .modal-xl {
                            max-width: 100% !important;
                            margin: 0 !important;
                        }

                        .modal-content {
                            border-radius: 0 !important;
                            height: 100vh !important;
                            max-height: 100vh !important;
                            margin: 0 !important;
                        }

                        .modal-body {
                            padding: 0.75rem !important;
                            max-height: calc(100vh - 120px) !important;
                        }

                        .modal-body[style*="maxHeight"] {
                            max-height: calc(100vh - 120px) !important;
                        }

                        .modal-header {
                            padding: 0.75rem !important;
                        }

                        .modal-footer {
                            padding: 0.75rem !important;
                        }

                        .card {
                            margin-bottom: 1rem !important;
                        }

                        .card-body {
                            padding: 0.75rem !important;
                        }

                        .card h6 {
                            font-size: 0.9rem !important;
                        }

                        .badge {
                            font-size: 0.7rem !important;
                            padding: 0.25rem 0.5rem !important;
                        }

                        .table {
                            font-size: 0.75rem !important;
                        }

                        .table th,
                        .table td {
                            padding: 0.5rem !important;
                        }

                        .pagination {
                            margin: 0.5rem 0 !important;
                        }

                        .page-link {
                            padding: 0.25rem 0.4rem !important;
                            font-size: 0.75rem !important;
                        }

                        .btn {
                            font-size: 0.875rem !important;
                            padding: 0.5rem 0.75rem !important;
                        }

                        .btn-lg {
                            font-size: 0.875rem !important;
                            padding: 0.5rem 0.75rem !important;
                        }

                        .progress {
                            height: 6px !important;
                        }

                        input[type="text"],
                        select {
                            font-size: 14px !important;
                            padding: 6px 10px !important;
                        }

                        label {
                            font-size: 13px !important;
                        }

                        .col-lg-3,
                        .col-md-4,
                        .col-sm-6 {
                            padding: 0.25rem !important;
                        }
                    }

                    /* Extra Small Mobile (480px and below) */
                    @media (max-width: 480px) {
                        .dash-main h1 {
                            font-size: 1rem !important;
                        }

                        .modal-title {
                            font-size: 13px !important;
                        }

                        .card-body {
                            padding: 0.5rem !important;
                        }

                        .card h6 {
                            font-size: 0.85rem !important;
                        }

                        small {
                            font-size: 0.75rem !important;
                        }

                        .table {
                            font-size: 0.7rem !important;
                        }

                        .table th,
                        .table td {
                            padding: 0.4rem !important;
                        }

                        .btn {
                            font-size: 0.8rem !important;
                            padding: 0.4rem 0.6rem !important;
                        }

                        .page-link {
                            padding: 0.2rem 0.3rem !important;
                            font-size: 0.7rem !important;
                            min-width: 32px !important;
                        }

                        .col-lg-3,
                        .col-md-4,
                        .col-sm-6 {
                            padding: 0.25rem !important;
                        }

                        input[type="text"],
                        select {
                            font-size: 13px !important;
                            padding: 5px 8px !important;
                        }

                        label {
                            font-size: 12px !important;
                        }

                        svg {
                            width: 14px !important;
                            height: 14px !important;
                        }
                    }
                `}
            </style>

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

            <Modal show={showCustomerModal} onHide={closeCustomerModal} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <User className="me-2 mobile-modal-title" size={24} />
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
                                            <div className="mb-3"><small className="text-muted">Total Payments:</small><div className="h5 text-success">{formatCurrency(selectedCustomer.paymentBehavior.totalPayments)}</div></div>
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
                                                            <h6 className="mb-0">Plan #{index + 1} -INSTALLMENT ID {installment.installment_sales_id}</h6>
                                                            <small className="text-muted">{formatDate(installment.date)} • {installment.payment_plan} months</small>
                                                        </div>
                                                        <div className="text-end">
                                                            <span className={`badge bg-${installment.status === 'ON GOING' ? 'primary' : installment.status === 'Complete' ? 'success' : 'danger'} mb-2`}>
                                                                {installment.status.toUpperCase()}
                                                            </span>
                                                            <div><small>{formatCurrency(installment.balance)} remaining</small></div>
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

            <Modal show={showCompletedInstallmentsModal} onHide={closeCompletedInstallmentsModal} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <CheckCircle size={24} className="me-2 mobile-modal-title" />
                        Completed Installments ({completedInstallmentsList.length})
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: '1px solid #e9ecef'
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
                                    Search Completed Installments
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
                                        placeholder="Search by customer name, email, phone, or installment ID..."
                                        value={completedInstallmentsSearchTerm}
                                        onChange={(e) => setCompletedInstallmentsSearchTerm(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px 8px 35px',
                                            border: '1px solid #ced4da',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                    {completedInstallmentsSearchTerm && (
                                        <button type="button" onClick={() => setCompletedInstallmentsSearchTerm('')} style={{
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
                        </div>
                    </div>

                    {filteredCompletedInstallments.length === 0 ? (
                        <div className="text-center py-5">
                            <h5 className="text-muted">No completed installments found</h5>
                            {completedInstallmentsSearchTerm && (
                                <Button variant="outline-primary" onClick={() => setCompletedInstallmentsSearchTerm('')}>Clear Search</Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="row">
                                {paginatedCompletedInstallments.map((installment) => (
                                    <div key={installment.installment_sales_id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                                        <div className="card h-100 border-success">
                                            <div className="card-body d-flex flex-column">
                                                <div className="mb-3">
                                                    <span className="badge bg-success mb-2">COMPLETED</span>
                                                    <h6 className="mb-1">Installment ID: {installment.installment_sales_id}</h6>
                                                    <small className="text-muted d-block">Customer: {installment.customer.cust_name}</small>
                                                    <small className="text-muted d-block">{installment.customer.email}</small>
                                                    <small className="text-muted">{installment.customer.phone}</small>
                                                </div>
                                                <div className="mb-3 flex-grow-1">
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <small className="text-muted">Start Date:</small>
                                                        <small>{formatDate(installment.date)}</small>
                                                    </div>
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <small className="text-muted">Duration:</small>
                                                        <small>{installment.payment_plan} months</small>
                                                    </div>
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <small className="text-muted">Total Paid:</small>
                                                        <small className="text-success">{formatCurrency(installment.totalPaid)}</small>
                                                    </div>
                                                    {installment.totalPenalties > 0 && (
                                                        <div className="d-flex justify-content-between mb-1">
                                                            <small className="text-muted">Penalties:</small>
                                                            <small className="text-danger">{formatCurrency(installment.totalPenalties)}</small>
                                                        </div>
                                                    )}
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <small className="text-muted">Total Amount:</small>
                                                        <small className="fw-bold">{formatCurrency(installment.totalAmount)}</small>
                                                    </div>
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <small className="text-muted">Payments:</small>
                                                        <small>{installment.paymentSchedules.filter(s => s.status.toLowerCase() === 'paid').length} / {installment.paymentSchedules.length}</small>
                                                    </div>
                                                </div>
                                                <Button 
                                                    variant="info" 
                                                    size="lg" 
                                                    onClick={() => {
                                                        openCompletedInstallmentModal(installment);
                                                        closeCompletedInstallmentsModal();
                                                    }} 
                                                    className="w-100 fw-bold shadow"
                                                    style={{
                                                        fontSize: '15px',
                                                        padding: '12px',
                                                        background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                                                        border: 'none',
                                                        boxShadow: '0 4px 12px rgba(23, 162, 184, 0.3)',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(23, 162, 184, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(23, 162, 184, 0.3)';
                                                    }}
                                                >
                                                    <Eye size={18} className="me-2" />
                                                    VIEW DETAILS
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {completedInstallmentsTotalPages > 1 && (
                                <nav className="mt-4">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${completedInstallmentsPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCompletedInstallmentsPage(completedInstallmentsPage - 1)}>Previous</button>
                                        </li>
                                        {[...Array(completedInstallmentsTotalPages)].map((_, i) => (
                                            <li key={i + 1} className={`page-item ${completedInstallmentsPage === i + 1 ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => setCompletedInstallmentsPage(i + 1)}>{i + 1}</button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${completedInstallmentsPage === completedInstallmentsTotalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCompletedInstallmentsPage(completedInstallmentsPage + 1)}>Next</button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeCompletedInstallmentsModal}>Close</Button>
                </Modal.Footer>
            </Modal>

            <div className='dash-main'>
                <div className="mb-4 d-flex justify-content-between align-items-center">
                    <h1>CUSTOMER INSTALLMENT MANAGEMENT</h1>
                    <Button
                        variant="outline-primary"
                        onClick={openCompletedInstallmentsModal}
                        style={{
                            fontSize: '14px',
                            padding: '10px 20px',
                            fontWeight: 'bold'
                        }}
                    >
                        <CheckCircle size={18} className="me-2" />
                        View Completed Installments ({completedInstallmentsList.length})
                    </Button>
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
                                                    <Button 
                                                        variant="success" 
                                                        size="lg" 
                                                        onClick={() => openCustomerModal(customer)} 
                                                        className="w-100 fw-bold shadow mobile-view-pay-btn"
                                                        style={{
                                                            fontSize: '15px',
                                                            padding: '12px',
                                                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                                            border: 'none',
                                                            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(40, 167, 69, 0.4)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                                                        }}
                                                    >
                                                        VIEW
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

export default PaymentBehavior;