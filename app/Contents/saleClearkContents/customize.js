'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Search, ShoppingCart, Edit, Package } from 'lucide-react';
import axios from 'axios';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import EmailForm from '@/app/Components/sendEmail/sendEmail';
import Head from 'next/head';
import Modal from 'react-bootstrap/Modal';
import { Button } from 'react-bootstrap';
import { ReceiptModal } from '@/app/Components/recieptModal/receiptModal';


export default function CustomizablePOSSystem() {

    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [location_Name, setLocation_Name] = useState('');

    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptTransaction, setReceiptTransaction] = useState(null);



    useEffect(() => {
        setUser_id(sessionStorage.getItem("user_id"));
        setLocation_id(sessionStorage.getItem("location_id"));
        setLocation_Name(sessionStorage.getItem("location_name"));
        GetProduct();
        GetCustomer();
    }, []);

    const [products, setProducts] = useState([]);

    const GetProduct = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetProduct"
                }
            });

            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching product list:", error);
        }
    }

    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [customerType, setCustomerType] = useState('customer');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [paymentPlan, setPaymentPlan] = useState('full');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [discountValue, setDiscountValue] = useState(0);

    const [partialPaymentAmount, setPartialPaymentAmount] = useState('');
    const [usePartialPayment, setUsePartialPayment] = useState(false);

    const [showCustomizationModal, setShowCustomizationModal] = useState(false);
    const [customizationType, setCustomizationType] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editingCartItem, setEditingCartItem] = useState(null);
    const [customization, setCustomization] = useState({
        product_name: '',
        description: '',
        modifications: '',
        price: 0,
        quantity: 1,
        isCustom: false
    });

    const [installmentDetails, setInstallmentDetails] = useState({
        months: 3,
        interestRate: 0,
        monthlyPayment: 0,
        totalWithInterest: 0
    });
    const [customDownpayment, setCustomDownpayment] = useState('');

    const [customerList, setCustomerList] = useState([]);

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
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching customer list:", error);
        }
    };

    const filteredProducts = products.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCustomers = customerList.filter(customer =>
        customer.cust_name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.phone.includes(customerSearchTerm)
    );

    const openCustomization = (type, product = null) => {
        setCustomizationType(type);
        setSelectedProduct(product);
        setEditingCartItem(null);

        if (type === 'semi' && product) {
            setCustomization({
                product_name: product.product_name,
                description: product.description,
                modifications: '',
                price: product.price,
                quantity: 1,
                isCustom: true,
                baseProduct: product
            });
        } else {
            setCustomization({
                product_name: '',
                description: '',
                modifications: '',
                price: 0,
                quantity: 1,
                isCustom: true,
                baseProduct: null
            });
        }

        setShowCustomizationModal(true);
    };

    const openEditCartItem = (cartItem) => {
        setEditingCartItem(cartItem);
        setCustomizationType(cartItem.customizationType);
        setSelectedProduct(cartItem.baseProduct);

        setCustomization({
            product_name: cartItem.product_name,
            description: cartItem.description,
            modifications: cartItem.modifications || '',
            price: cartItem.price,
            quantity: cartItem.quantity,
            isCustom: cartItem.isCustom,
            baseProduct: cartItem.baseProduct
        });

        setShowCustomizationModal(true);
    };

    const addCustomizedToCart = () => {
        if (customizationType === 'semi') {
            if (!customization.modifications.trim()) {
                showAlertError({
                    icon: "warning",
                    title: "Oppsss!",
                    text: 'Please add modifications/customization details',
                    button: 'Okay'
                });
                return;
            }
        } else {
            if (!customization.product_name.trim() || !customization.description.trim() || customization.price <= 0) {
                showAlertError({
                    icon: "warning",
                    title: "Oppsss!",
                    text: 'Please fill in all required fields (Name, Description, Price)',
                    button: 'Okay'
                });
                return;
            }
        }

        const customItem = {
            product_id: editingCartItem ? editingCartItem.product_id : `custom_${Date.now()}`,
            product_name: customization.product_name,
            description: customization.description,
            modifications: customization.modifications,
            price: Number(parseFloat(customization.price).toFixed(2)),
            quantity: customization.quantity,
            isCustom: true,
            customizationType: customizationType,
            baseProduct: customization.baseProduct,
        };

        if (editingCartItem) {
            setCart(cart.map(item =>
                item.product_id === editingCartItem.product_id ? customItem : item
            ));
        } else {
            setCart([...cart, customItem]);
        }

        setShowCustomizationModal(false);
        resetCustomization();
    };

    const resetCustomization = () => {
        setCustomization({
            product_name: '',
            description: '',
            modifications: '',
            price: 0,
            quantity: 1,
            isCustom: false
        });
        setSelectedProduct(null);
        setEditingCartItem(null);
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(cart.map(item =>
            item.product_id === productId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    const calculateSubtotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        if (paymentPlan === 'full' && discountValue > 0) {
            const discountAmount = subtotal * (discountValue / 100);
            return subtotal - discountAmount;
        }
        return subtotal;
    };

    const calculateDiscountAmount = () => {
        const subtotal = calculateSubtotal();
        return subtotal * (discountValue / 100);
    };

    const calculateDownpayment = () => {
        const total = calculateTotal();
        const minimumDownpayment = total * 0.2;

        if (customDownpayment > 0 && customDownpayment >= minimumDownpayment) {
            return Math.min(customDownpayment, total);
        }

        return minimumDownpayment;
    };

    const calculateMinimumPartialPayment = () => {
        const total = calculateTotal();
        return total * 0.5;
    };

    const calculateAmountDueToday = () => {
        if (paymentPlan === 'installment') {
            return calculateDownpayment();
        }

        if (paymentPlan === 'full' && usePartialPayment && partialPaymentAmount > 0) {
            return partialPaymentAmount;
        }

        return calculateTotal();
    };

    const calculateRemainingBalance = () => {
        if (paymentPlan === 'full' && usePartialPayment && partialPaymentAmount > 0) {
            return calculateTotal() - partialPaymentAmount;
        }
        return 0;
    };

    const calculateInstallmentPayment = () => {
        const total = calculateTotal();
        const downpayment = calculateDownpayment();
        const remainingBalance = total - downpayment;
        const months = installmentDetails.months;

        if (months === 3) {
            return remainingBalance / months;
        }

        const interestRate = installmentDetails.interestRate / 100;
        const interestAmount = remainingBalance * interestRate;
        const totalAmountToPay = remainingBalance + interestAmount;

        return totalAmountToPay / months;
    };

    const calculateTotalWithInterest = () => {
        const downpayment = calculateDownpayment();
        const monthlyPayment = calculateInstallmentPayment();
        return downpayment + (monthlyPayment * installmentDetails.months);
    };

    const generatePaymentDates = () => {
        const dates = [];
        const startDate = new Date();

        for (let i = 1; i <= installmentDetails.months; i++) {
            const paymentDate = new Date(startDate);
            paymentDate.setMonth(startDate.getMonth() + i);
            dates.push(paymentDate.toLocaleDateString());
        }

        return dates;
    };

    useEffect(() => {
        if (paymentPlan === 'installment') {
            const monthlyPayment = calculateInstallmentPayment();
            const totalWithInterest = calculateTotalWithInterest();

            setInstallmentDetails(prev => ({
                ...prev,
                monthlyPayment,
                totalWithInterest
            }));
        }
    }, [paymentPlan, installmentDetails.months, installmentDetails.interestRate, cart, customDownpayment]);

    const proceedPurchase = async () => {

        if (calculateRemainingBalance() < 0) {
            showAlertError({
                icon: "warning",
                title: "Oppsss!",
                text: 'Remaining balance is negative, adjust the downpayment',
                button: 'Okay'
            });
        }
        if (cart.length === 0) {
            alert('Please add items to cart before proceeding.');
            return;
        }

        if (!selectedCustomer) {
            alert('Please select a customer.');
            return;
        }

        if (paymentPlan === 'full' && usePartialPayment && (!partialPaymentAmount || partialPaymentAmount < calculateMinimumPartialPayment())) {
            alert('Partial payment must be at least 50% of the total amount.');
            return;
        }

        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const locId = parseInt(sessionStorage.getItem('location_id'));
        const locName = sessionStorage.getItem('location_name');
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'sales.php';


        if (paymentPlan === 'full') {

            const PurchaseDetails = {
                custID: selectedCustomer.cust_id,
                accID: accountID,
                locID: locId,
                payMethod: paymentMethod,
                subTotal: calculateSubtotal(),
                discount: calculateDiscountAmount(),
                discountValue: discountValue,
                total: calculateTotal(),
                paymentPlan: paymentPlan,
                amountPaid: calculateAmountDueToday(),
                remainingBalance: calculateRemainingBalance()
            };

            try {
                const operation = "CustomeSalesFull";

                const response = await axios.get(url, {
                    params: {
                        salesDetails: JSON.stringify(cart),
                        //   updateIn: JSON.stringify(updateInventory),
                        //   reportInventory: JSON.stringify(report),
                        json: JSON.stringify(PurchaseDetails),
                        operation: operation
                    }
                });

                if (!isNaN(response.data) && response.data !== null && response.data !== "") {

                    AlertSucces(
                        "INVOICE #" + response.data + "\nThe order has been sent to warehouse",
                        "success",
                        true,
                        'Okay'
                    );

                    const transaction = {
                        invoice_id: response.data,
                        customer: selectedCustomer,
                        items: [...cart],
                        subtotal: calculateSubtotal(),
                        discount: calculateDiscountAmount(),
                        total: calculateTotal(),
                        payment_method: paymentMethod,
                        payment_plan: paymentPlan,
                        amount_paid: calculateAmountDueToday(),
                        remainingBalance: calculateRemainingBalance(),
                        installment_details: null,
                        date: new Date().toLocaleDateString(),
                        time: new Date().toLocaleTimeString(),
                        location: location_Name || 'Agora Showroom Main'
                    };

                    showReceiptModalHandler(transaction);

                    showReceiptModalHandler(transaction);


                    // Create transaction object for receipt
                    // const transaction = {
                    //   invoice_id: response.data,
                    //   customer: customerType === 'walk-in' ? 'walk-in' : selectedCustomer,
                    //   items: [...cart],
                    //   subtotal: calculateSubtotal(),
                    //   discount: calculateDiscount(),
                    //   total: calculateTotal(),
                    //   payment_method: paymentMethod,
                    //   payment_plan: paymentPlan,
                    //   amount_paid: amountPaid,
                    //   installment_details: null,
                    //   date: new Date().toLocaleDateString(),
                    //   time: new Date().toLocaleTimeString(),
                    //   location: locName || 'Agora Showroom Main'
                    // };

                    // Show receipt modal
                    // showReceiptModal(transaction);



                    // Reset form
                    // setCart([]);
                    // setPaymentMethod("cash");
                    // setCustomerType('');
                    // setSelectedCustomer(null);
                    // setCustomerSearchTerm('');
                    // setDiscountValue(0);
                    // setPaymentPlan('full');
                    // setDownpaymentAmount(0);
                    // setCustomDownpayment(0);
                    // setInstallmentDetails({
                    //   months: 3,
                    //   interestRate: 0,
                    //   monthlyPayment: 0,
                    //   totalWithInterest: 0
                    // });


                } else {
                    console.log(response.data);
                    showAlertError({
                        icon: "error",
                        title: "Something Went Wrong!",
                        text: 'Failed to process the sale!',
                        button: 'Try Again'
                    });
                }

            } catch (error) {
                console.error("Error processing the sale:", error);
                showAlertError({
                    icon: "error",
                    title: "Error!",
                    text: 'An error occurred while processing the sale.',
                    button: 'Try Again'
                });
            }

            console.log(cart);
            console.log(PurchaseDetails);
        } else if (paymentPlan === 'installment') {

            const list1 = generatePaymentDates().map((date, index) => ({
                paymentNumber: index + 1,
                paymentDate: date,
                amountDue: installmentDetails.monthlyPayment,
            }));

            const total = calculateTotal();
            const installmentDetails1 = {
                origPrice: total,
                downPayment: calculateDownpayment(),
                downPercentage: (calculateDownpayment() / calculateTotal()) * 100,
                remainingBal: total - calculateDownpayment(),
                interestRate: installmentDetails.months == '3' ? 0 : installmentDetails.interestRate,
                interestAmount: (installmentDetails.monthlyPayment * installmentDetails.months) - (total - calculateDownpayment()),
                totalSales: installmentDetails.totalWithInterest,
                installmentPlan: installmentDetails.months,
                monthlyPayment: installmentDetails.monthlyPayment,
                totalPayment: installmentDetails.monthlyPayment * installmentDetails.months,
                balance: installmentDetails.monthlyPayment * installmentDetails.months,
                custID: selectedCustomer.cust_id,
                locID: locId,
                accID: accountID,
                // prodID: firstProductId,
            };

            console.log(installmentDetails1);
            console.log(list1);

            try {
                const operation = 'CustomizeinstallmentPlan';

                const response = await axios.get(url, {
                    params: {
                        dateDue: JSON.stringify(list1),
                        salesDetails: JSON.stringify(cart),
                        // updateIn: JSON.stringify(updateInventory),
                        // reportInventory: JSON.stringify(report),
                        json: JSON.stringify(installmentDetails1),
                        operation: operation
                    }
                });

                if (!isNaN(response.data) && response.data !== null && response.data !== "") {
                    AlertSucces(
                        "INVOICE #" + response.data + "\nThe order has been sent to warehouse",
                        "success",
                        true,
                        'Okay'
                    );

                    const transaction = {
                        remainingBal: installmentDetails.monthlyPayment * installmentDetails.months,
                        downpaymentAmount: calculateDownpayment(),
                        invoice_id: response.data,
                        customer: selectedCustomer,
                        items: [...cart],
                        subtotal: calculateSubtotal(),
                        discount: calculateDiscountAmount(),
                        total: calculateTotal(),
                        payment_method: paymentMethod,
                        payment_plan: paymentPlan,
                        amount_paid: calculateDownpayment(),
                        remainingBalance: installmentDetails.monthlyPayment * installmentDetails.months,
                        installment_details: {
                            monthly_payment: installmentDetails.monthlyPayment,
                            months: installmentDetails.months,
                            interest_rate: installmentDetails.interestRate,
                            total_with_interest: installmentDetails.totalWithInterest,
                            payment_dates: generatePaymentDates()
                        },
                        date: new Date().toLocaleDateString(),
                        time: new Date().toLocaleTimeString(),
                        location: location_Name || 'Agora Showroom Main'
                    };

                    showReceiptModalHandler(transaction);

                    showReceiptModalHandler(transaction);
                    // Create transaction object for receipt
                    // const transaction = {
                    //     remainingBal: installmentDetails.monthlyPayment * installmentDetails.months,
                    //     downpaymentAmount: calculateDownpayment(),
                    //     invoice_id: response.data,
                    //     customer: selectedCustomer,
                    //     items: [...cart],
                    //     subtotal: calculateSubtotal(),
                    //     discount: calculateDiscount(),
                    //     total: calculateTotal(),
                    //     payment_method: paymentMethod,
                    //     payment_plan: paymentPlan,
                    //     amount_paid: calculateDownpayment(),
                    //     installment_details: {
                    //         monthly_payment: installmentDetails.monthlyPayment,
                    //         months: installmentDetails.months,
                    //         interest_rate: installmentDetails.interestRate,
                    //         total_with_interest: installmentDetails.totalWithInterest,
                    //         payment_dates: generatePaymentDates()
                    //     },
                    //     date: new Date().toLocaleDateString(),
                    //     time: new Date().toLocaleTimeString(),
                    //     location: locName || 'Agora Showroom Main'
                    // };

                    // Show receipt modal
                    // showReceiptModal(transaction);



                    // Reset form
                    // setCart([]);
                    // setPaymentMethod("cash");
                    // setCustomerType('');
                    // setSelectedCustomer(null);
                    // setCustomerSearchTerm('');
                    // setDiscountValue(0);
                    // setPaymentPlan('full');
                    // setDownpaymentAmount(0);
                    // setCustomDownpayment(0);
                    // setInstallmentDetails({
                    //     months: 3,
                    //     interestRate: 0,
                    //     monthlyPayment: 0,
                    //     totalWithInterest: 0
                    // });

                    // const activity = `Processed an installment sale at ${locName}, Invoice #${response.data}`;

                    // Logs(accountID, activity);

                } else {
                    console.log(response.data);
                    showAlertError({
                        icon: "error",
                        title: "Something Went Wrong!",
                        text: 'Failed to process the sale!',
                        button: 'Try Again'
                    });
                }

            } catch (error) {
                console.error("Error processing the sale:", error);
                showAlertError({
                    icon: "error",
                    title: "Error!",
                    text: 'An error occurred while processing the sale.',
                    button: 'Try Again'
                });
            }




        }





        setCart([]);
        setSelectedCustomer(null);
        setPaymentPlan('full');
        setPaymentMethod('cash');
        setCustomDownpayment('');
        setDiscountValue(0);
        setUsePartialPayment(false);
        setPartialPaymentAmount('');
    };



    const showReceiptModalHandler = (transaction) => {
        setReceiptTransaction(transaction);
        setShowReceiptModal(true);
    };

    const closeReceipt = () => {
        setShowReceiptModal(false);
        setReceiptTransaction(null);
    };

    return (
        <>
            <div className='customer-main'>
                <div style={{ minHeight: '100vh', padding: '16px' }}>
                    {showCustomizationModal && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '16px'
                        }}>
                            <div style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '24px',
                                maxWidth: '600px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                                        {editingCartItem ? 'Edit Item' : (customizationType === 'semi' ? 'Semi-Customization' : 'Full Customization')}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowCustomizationModal(false);
                                            resetCustomization();
                                        }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                                        Product Name {customizationType === 'full' && '*'}
                                    </label>
                                    <input
                                        type="text"
                                        value={customization.product_name}
                                        onChange={(e) => setCustomization({ ...customization, product_name: e.target.value })}
                                        disabled={customizationType === 'semi'}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            background: customizationType === 'semi' ? '#f3f4f6' : 'white',
                                            boxSizing: 'border-box'
                                        }}
                                        placeholder={customizationType === 'full' ? 'Enter product name' : ''}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                                        Base Description {customizationType === 'full' && '*'}
                                    </label>
                                    <textarea
                                        value={customization.description}
                                        onChange={(e) => setCustomization({ ...customization, description: e.target.value })}
                                        disabled={customizationType === 'semi'}
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            background: customizationType === 'semi' ? '#f3f4f6' : 'white',
                                            resize: 'vertical',
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit'
                                        }}
                                        placeholder={customizationType === 'full' ? 'Enter product description' : ''}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                                        {customizationType === 'semi' ? 'Customizations/Modifications *' : 'Additional Details'}
                                    </label>
                                    <textarea
                                        value={customization.modifications}
                                        onChange={(e) => setCustomization({ ...customization, modifications: e.target.value })}
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            resize: 'vertical',
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit'
                                        }}
                                        placeholder={customizationType === 'semi'
                                            ? 'e.g., Add extra cushions, change fabric to leather, remove armrest, etc.'
                                            : 'Any additional specifications or notes'
                                        }
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                                        Price * {customizationType === 'semi' && '(Adjust if needed)'}
                                    </label>
                                    <input
                                        type="number"
                                        value={customization.price || ''}
                                        onChange={(e) => {
                                            const inputValue = e.target.value;

                                            if (inputValue === '') {
                                                setCustomization({ ...customization, price: 0 });
                                                return;
                                            }

                                            const numValue = parseFloat(inputValue);

                                            if (!isNaN(numValue) && numValue >= 0) {
                                                setCustomization({ ...customization, price: numValue });
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const value = parseFloat(e.target.value) || 0;
                                            setCustomization({ ...customization, price: parseFloat(value.toFixed(2)) });
                                        }}
                                        min="0"
                                        step="100"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                        placeholder="Enter price (e.g., 15000.00)"
                                    />
                                    {customization.price > 0 && (
                                        <div style={{ fontSize: '12px', color: '#92400e', marginTop: '4px', fontWeight: '500' }}>
                                            Price: {new Intl.NumberFormat("en-PH", {
                                                style: "currency",
                                                currency: "PHP",
                                            }).format(customization.price)}
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                                        Quantity
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <button
                                            onClick={() => setCustomization({ ...customization, quantity: Math.max(1, customization.quantity - 1) })}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#f3f4f6',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span style={{ fontSize: '18px', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>
                                            {customization.quantity}
                                        </span>
                                        <button
                                            onClick={() => setCustomization({ ...customization, quantity: customization.quantity + 1 })}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#f3f4f6',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => {
                                            setShowCustomizationModal(false);
                                            resetCustomization();
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: '#f3f4f6',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addCustomizedToCart}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: '#7c3aed',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {editingCartItem ? 'Update Item' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '16px' }}>
                            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', margin: 0 }}>
                                A.G Custom POS System
                            </h1>

                            <p style={{ color: '#6b7280', margin: '8px 0 0 0' }}>
                                Create custom or semi-custom products for your customers
                            </p>
                            <p style={{ color: '#6b7280' }}>
                                Location: {location_Name} | Date: {new Date().toLocaleDateString()} | Products: {products.length}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 1024 ? '2fr 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
                            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '24px' }}>
                                <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <button
                                        onClick={() => openCustomization('full')}
                                        style={{
                                            padding: '16px',
                                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <Package size={20} />
                                        Full Customization
                                    </button>
                                </div>

                                <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                                    <p style={{ fontSize: '13px', color: '#0369a1', margin: 0, lineHeight: 1.5 }}>
                                        <strong>Semi-Customization:</strong> Select a base product and add modifications<br />
                                        <strong>Full Customization:</strong> Create a completely custom product from scratch
                                    </p>
                                </div>

                                <div style={{ position: 'relative', marginBottom: '24px' }}>
                                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                        <Search size={20} style={{ opacity: 0.5 }} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search base products for semi-customization..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 48px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? 'repeat(2, 1fr)' : '1fr', gap: '16px', maxHeight: '600px', overflowY: 'auto' }}>
                                    {filteredProducts.map(product => (
                                        <div
                                            key={product.product_id}
                                            style={{
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '12px',
                                                padding: '16px',
                                                transition: 'box-shadow 0.3s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                                        >
                                            <h3 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px', margin: '0 0 8px 0' }}>{product.product_name}</h3>
                                            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', margin: '0 0 8px 0' }}>{product.description}</p>
                                            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '12px', margin: '0 0 12px 0' }}>Color: {product.color}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#7c3aed' }}>
                                                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(product.price)}
                                                </span>
                                                <button
                                                    onClick={() => openCustomization('semi', product)}
                                                    style={{
                                                        background: '#7c3aed',
                                                        color: 'white',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    Customize
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <ShoppingCart size={24} />
                                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Cart</h2>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Select Customer</label>
                                    <input
                                        type="text"
                                        placeholder="Search customers..."
                                        value={customerSearchTerm}
                                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            marginBottom: '8px',
                                            boxSizing: 'border-box'
                                        }}
                                    />

                                    <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                                        {filteredCustomers.map(customer => (
                                            <div
                                                key={customer.cust_id}
                                                onClick={() => setSelectedCustomer(customer)}
                                                style={{
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    background: selectedCustomer?.cust_id === customer.cust_id ? '#e0e7ff' : 'transparent',
                                                    borderBottom: '1px solid #e5e7eb'
                                                }}
                                            >
                                                <div style={{ fontSize: '14px', fontWeight: '500' }}>{customer.cust_name}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{customer.phone}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedCustomer && (
                                        <div style={{ marginTop: '8px', padding: '8px', background: '#e0e7ff', borderRadius: '6px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: '500' }}>Selected: {selectedCustomer.cust_name}</div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: '16px', maxHeight: '250px', overflowY: 'auto' }}>
                                    {cart.length === 0 ? (
                                        <p style={{ color: '#6b7280', textAlign: 'center', padding: '32px 0', margin: 0 }}>Cart is empty</p>
                                    ) : (
                                        cart.map(item => (
                                            <div key={item.product_id} style={{
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                marginBottom: '12px',
                                                background: item.customizationType === 'full' ? '#fef3c7' : '#ddd6fe'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                            <h4 style={{ fontWeight: '600', margin: 0, fontSize: '14px' }}>{item.product_name}</h4>
                                                            <span style={{
                                                                fontSize: '10px',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                background: item.customizationType === 'full' ? '#f59e0b' : '#7c3aed',
                                                                color: 'white'
                                                            }}>
                                                                {item.customizationType === 'full' ? 'FULL' : 'SEMI'}
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0' }}>{item.description}</p>
                                                        {item.modifications && (
                                                            <p style={{ fontSize: '12px', color: '#7c3aed', fontStyle: 'italic', margin: '4px 0' }}>
                                                                <strong>Mods:</strong> {item.modifications}
                                                            </p>
                                                        )}
                                                        <p style={{ fontSize: '14px', color: '#1f2937', margin: '4px 0' }}>
                                                            ₱{item.price.toLocaleString()} each
                                                        </p>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                                                        <button
                                                            onClick={() => openEditCartItem(item)}
                                                            style={{
                                                                color: '#7c3aed',
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '4px',
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}
                                                            title="Edit item"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => removeFromCart(item.product_id)}
                                                            style={{
                                                                color: '#ef4444',
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '4px',
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}
                                                            title="Remove item"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <button
                                                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                            style={{ padding: '4px 8px', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span style={{ width: '40px', textAlign: 'center' }}>{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                            style={{ padding: '4px 8px', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <span style={{ fontWeight: '600' }}>₱{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {paymentPlan !== 'installment' && (
                                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Discount (%)</label>

                                        <input
                                            type="number"
                                            value={discountValue || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '') {
                                                    setDiscountValue(0);
                                                } else {
                                                    const numericValue = parseFloat(value);
                                                    if (!isNaN(numericValue) && numericValue >= 0) {
                                                        setDiscountValue(numericValue);
                                                    }
                                                }
                                            }}
                                            placeholder="Enter discount %"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                boxSizing: 'border-box'
                                            }}
                                        />

                                        {discountValue > 0 && (
                                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                                                Discount Amount: -₱{calculateDiscountAmount().toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Payment Plan</label>
                                    <button
                                        onClick={() => {
                                            const newPlan = paymentPlan === 'full' ? 'installment' : 'full';
                                            setPaymentPlan(newPlan);
                                            if (newPlan === 'installment') {
                                                setCustomerType('customer');
                                                setCustomDownpayment('');
                                                setDiscountValue(0);
                                                setUsePartialPayment(false);
                                                setPartialPaymentAmount('');
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: paymentPlan === 'installment' ? '#f59e0b' : '#10b981',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            fontSize: '14px'
                                        }}
                                    >
                                        {paymentPlan === 'full' ? 'Switch to Installment' : 'Switch to Full Payment'}
                                    </button>

                                    {paymentPlan === 'full' && cart.length > 0 && (
                                        <div style={{ marginTop: '12px', background: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <input
                                                    type="checkbox"
                                                    id="partialPayment"
                                                    checked={usePartialPayment}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        setUsePartialPayment(isChecked);
                                                        if (isChecked) {
                                                            // Automatically set to 50% when checked
                                                            setPartialPaymentAmount(calculateMinimumPartialPayment());
                                                        } else {
                                                            setPartialPaymentAmount('');
                                                        }
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <label htmlFor="partialPayment" style={{ fontSize: '14px', fontWeight: '500', color: '#166534', cursor: 'pointer' }}>
                                                    Pay Partial Amount (Min 50%)
                                                </label>
                                            </div>

                                            {usePartialPayment && (
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#166534' }}>
                                                        Payment Amount (Min 50%: ₱{calculateMinimumPartialPayment().toLocaleString()})
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={partialPaymentAmount}
                                                        onChange={(e) => {
                                                            const value = parseFloat(e.target.value) || '';
                                                            setPartialPaymentAmount(value);
                                                        }}
                                                        onBlur={(e) => {
                                                            const value = parseFloat(e.target.value) || 0;
                                                            const total = calculateTotal();
                                                            const minimum = calculateMinimumPartialPayment();

                                                            if (value > 0 && value < minimum) {
                                                                setPartialPaymentAmount(minimum);
                                                            } else if (value > total) {
                                                                setPartialPaymentAmount(total);
                                                            }
                                                        }}
                                                        min={calculateMinimumPartialPayment()}
                                                        max={calculateTotal()}
                                                        step="100"
                                                        placeholder="Enter payment amount"
                                                        style={{
                                                            width: '100%',
                                                            padding: '8px',
                                                            border: '1px solid #bbf7d0',
                                                            borderRadius: '6px',
                                                            fontSize: '13px',
                                                            boxSizing: 'border-box'
                                                        }}
                                                    />

                                                    {partialPaymentAmount > 0 && (
                                                        <div style={{ marginTop: '8px', padding: '8px', background: '#dcfce7', borderRadius: '6px' }}>
                                                            <div style={{ fontSize: '12px', color: '#166534' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                                    <span>Paying Today:</span>
                                                                    <span style={{ fontWeight: '600' }}>₱{parseFloat(partialPaymentAmount).toLocaleString()}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <span>Remaining Balance:</span>
                                                                    <span style={{ fontWeight: '600', color: '#dc2626' }}>
                                                                        ₱{(calculateTotal() - partialPaymentAmount).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {paymentPlan === 'installment' && (
                                        <div style={{ background: '#fff7ed', padding: '16px', borderRadius: '8px', border: '1px solid #fed7aa', marginTop: '12px' }}>
                                            <div style={{ marginBottom: '12px' }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#92400e' }}>
                                                    Payment Period
                                                </label>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                                                    {[3, 6, 12, 18].map(month => (
                                                        <button
                                                            key={month}
                                                            onClick={() => {
                                                                setInstallmentDetails(prev => ({ ...prev, months: month }));
                                                                setCustomDownpayment('');
                                                            }}
                                                            style={{
                                                                padding: '8px 4px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                background: installmentDetails.months === month ? '#f59e0b' : '#fef3c7',
                                                                color: installmentDetails.months === month ? 'white' : '#92400e',
                                                                cursor: 'pointer',
                                                                fontSize: '12px',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            {month} mo
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {installmentDetails.months !== 3 && (
                                                <div style={{ marginBottom: '12px' }}>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#92400e' }}>
                                                        Interest Rate (%)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={installmentDetails.interestRate}
                                                        onChange={(e) => setInstallmentDetails(prev => ({
                                                            ...prev,
                                                            interestRate: Math.max(0, Math.min(50, parseFloat(e.target.value) || 0))
                                                        }))}
                                                        min="0"
                                                        max="50"
                                                        step="0.5"
                                                        style={{
                                                            width: '100%',
                                                            padding: '8px',
                                                            border: '1px solid #fed7aa',
                                                            borderRadius: '6px',
                                                            fontSize: '13px',
                                                            boxSizing: 'border-box'
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            <div style={{ marginBottom: '12px' }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#92400e' }}>
                                                    Downpayment (Min 20%: ₱{(calculateTotal() * 0.2).toLocaleString()})
                                                </label>
                                                <input
                                                    type="number"
                                                    value={customDownpayment}
                                                    onChange={(e) => setCustomDownpayment(parseFloat(e.target.value) || '')}
                                                    onBlur={(e) => {
                                                        const value = parseFloat(e.target.value) || 0;
                                                        const total = calculateTotal();
                                                        const minimum = total * 0.2;
                                                        if (value > 0 && value < minimum) {
                                                            setCustomDownpayment(minimum);
                                                        } else if (value > total) {
                                                            setCustomDownpayment(total);
                                                        }
                                                    }}
                                                    min={calculateTotal() * 0.2}
                                                    max={calculateTotal()}
                                                    step="100"
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px',
                                                        border: '1px solid #fed7aa',
                                                        borderRadius: '6px',
                                                        fontSize: '13px',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                            </div>

                                            <div style={{ background: '#fefbf6', padding: '12px', borderRadius: '6px', border: '1px solid #fde68a' }}>
                                                <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span>Downpayment Today:</span>
                                                        <span style={{ fontWeight: '600' }}>₱{calculateDownpayment().toLocaleString()}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span>Monthly Payment:</span>
                                                        <span style={{ fontWeight: '600' }}>₱{installmentDetails.monthlyPayment.toLocaleString()}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span>Duration:</span>
                                                        <span style={{ fontWeight: '600' }}>{installmentDetails.months} months</span>
                                                    </div>
                                                    {installmentDetails.months !== 3 && (
                                                        <>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                                <span>Interest Rate:</span>
                                                                <span style={{ fontWeight: '600' }}>{installmentDetails.interestRate}%</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid #fde68a', marginTop: '6px' }}>
                                                                <span style={{ fontWeight: '500' }}>Total with Interest:</span>
                                                                <span style={{ fontWeight: '700', color: '#dc2626' }}>₱{installmentDetails.totalWithInterest.toLocaleString()}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #fde68a' }}>
                                                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#92400e', marginBottom: '6px' }}>
                                                        Payment Schedule:
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: '#78350f', maxHeight: '100px', overflowY: 'auto' }}>
                                                        {generatePaymentDates().map((date, index) => (
                                                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', padding: '4px', background: '#fffbeb', borderRadius: '4px' }}>
                                                                <span>Payment #{index + 1}: {date}</span>
                                                                <span style={{ fontWeight: '600' }}>₱{installmentDetails.monthlyPayment.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Payment Method</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <button
                                            onClick={() => setPaymentMethod('cash')}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: paymentMethod === 'cash' ? '#7c3aed' : '#f3f4f6',
                                                color: paymentMethod === 'cash' ? 'white' : 'black',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cash
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('card')}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: paymentMethod === 'card' ? '#7c3aed' : '#f3f4f6',
                                                color: paymentMethod === 'card' ? 'white' : 'black',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Card
                                        </button>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                                        <span>Total:</span>
                                        <span style={{ color: '#7c3aed' }}>₱{calculateTotal().toLocaleString()}</span>
                                    </div>

                                    <div style={{
                                        background: paymentPlan === 'installment' ? '#fff7ed' : (usePartialPayment ? '#fef3c7' : '#f0fdf4'),
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: paymentPlan === 'installment' ? '1px solid #fed7aa' : (usePartialPayment ? '1px solid #fde68a' : '1px solid #bbf7d0')
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '600' }}>
                                            <span>Amount Due Today:</span>
                                            <span style={{ color: paymentPlan === 'installment' ? '#f59e0b' : (usePartialPayment ? '#f59e0b' : '#10b981') }}>
                                                ₱{calculateAmountDueToday().toLocaleString()}
                                            </span>
                                        </div>
                                        {(paymentPlan === 'installment' || (paymentPlan === 'full' && usePartialPayment && partialPaymentAmount > 0)) && (
                                            <div style={{ fontSize: '12px', color: paymentPlan === 'installment' ? '#78350f' : '#92400e', marginTop: '4px' }}>
                                                Balance: ₱{(paymentPlan === 'installment' ? (calculateTotal() - calculateDownpayment()) : calculateRemainingBalance()).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={proceedPurchase}
                                    disabled={
                                        cart.length === 0 ||
                                        !selectedCustomer ||
                                        (paymentPlan === 'full' && usePartialPayment && (!partialPaymentAmount || partialPaymentAmount < calculateMinimumPartialPayment()))
                                    }
                                    style={{
                                        width: '100%',
                                        background: (cart.length === 0 || !selectedCustomer ||
                                            (paymentPlan === 'full' && usePartialPayment && (!partialPaymentAmount || partialPaymentAmount < calculateMinimumPartialPayment())))
                                            ? '#d1d5db' : '#7c3aed',
                                        color: 'white',
                                        padding: '14px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontWeight: '600',
                                        fontSize: '16px',
                                        cursor: (cart.length === 0 || !selectedCustomer ||
                                            (paymentPlan === 'full' && usePartialPayment && (!partialPaymentAmount || partialPaymentAmount < calculateMinimumPartialPayment())))
                                            ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {paymentPlan === 'full'
                                        ? (usePartialPayment && partialPaymentAmount > 0
                                            ? `Collect Partial Payment (₱${parseFloat(partialPaymentAmount).toLocaleString()})`
                                            : 'Process Full Payment')
                                        : `Collect Downpayment (₱${calculateDownpayment().toLocaleString()})`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Receipt Modal */}
                {showReceiptModal && receiptTransaction && (
                    <Modal
                        show={showReceiptModal}
                        onHide={closeReceipt}
                        size="lg"
                        className="receipt-modal"
                        centered
                        style={{ maxHeight: '90vh' }}
                    >
                        <Modal.Header closeButton style={{ position: 'sticky', top: 0, zIndex: 1050, backgroundColor: 'white', borderBottom: '1px solid #dee2e6' }}>
                            <Modal.Title className="d-flex align-items-center">
                                <span className="text-success me-2">✓</span>
                                Payment Successful!
                            </Modal.Title>
                        </Modal.Header>

                        <Modal.Body style={{
                            maxHeight: '60vh',
                            overflowY: 'auto',
                            padding: '1.5rem'
                        }}>
                            {/* Transaction Header */}
                            <div className="text-center mb-4 p-3" style={{ backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <h4 className="fw-semibold mb-2">A.G Custom Furniture</h4>
                                <div className="text-muted small">
                                    <div>Invoice #{receiptTransaction.invoice_id}</div>
                                    <div>{receiptTransaction.date} • {receiptTransaction.time}</div>
                                    <div>{receiptTransaction.location}</div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="mb-4">
                                <h5 className="fw-semibold mb-2 text-dark">Customer Information</h5>
                                <div className="p-3 rounded" style={{ backgroundColor: '#f9fafb' }}>
                                    <div>
                                        <div className="fw-bold">Name: {receiptTransaction.customer.cust_name}</div>
                                        <div className="text-muted">PHONE#: {receiptTransaction.customer.phone}</div>
                                        <div className="text-muted">EMAIL ADDRESS: {receiptTransaction.customer.email}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Items Purchased */}
                            <div className="mb-4">
                                <h5 className="fw-semibold mb-2 text-dark">Items Purchased</h5>
                                <div className="p-3 rounded" style={{ backgroundColor: '#f9fafb' }}>
                                    {receiptTransaction.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`py-3 ${index < receiptTransaction.items.length - 1 ? 'border-bottom' : ''}`}
                                        >
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div className="flex-grow-1">
                                                    <div className="fw-bold text-dark">{item.product_name}</div>
                                                    <div className="text-muted small mb-1">{item.description}</div>
                                                    {item.isCustom && (
                                                        <div className="small mb-1">
                                                            <span className="badge" style={{
                                                                backgroundColor: item.customizationType === 'full' ? '#f59e0b' : '#7c3aed',
                                                                color: 'white'
                                                            }}>
                                                                {item.customizationType === 'full' ? 'Full Custom' : 'Semi-Custom'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {item.modifications && (
                                                        <div className="text-muted small mb-1" style={{ fontStyle: 'italic', color: '#7c3aed' }}>
                                                            Mods: {item.modifications}
                                                        </div>
                                                    )}
                                                    <div className="text-muted small">
                                                        ₱{item.price.toLocaleString()} × {item.quantity} {item.quantity > 1 ? 'pieces' : 'piece'}
                                                    </div>
                                                </div>
                                                <div className="fw-bold text-end">
                                                    <div>₱{(item.price * item.quantity).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="mb-4">
                                <div className="p-3 rounded" style={{ backgroundColor: '#f9fafb' }}>
                                    {paymentPlan === 'installment' ? (
                                        <div className="d-flex justify-content-between fs-5 fw-bold">
                                            <span>ORIGINAL PRICE:</span>
                                            <span style={{ color: '#7c3aed' }}>₱{receiptTransaction.total.toLocaleString()}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Subtotal:</span>
                                                <span>₱{receiptTransaction.subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2 text-danger">
                                                <span>Discount:</span>
                                                <span>-₱{receiptTransaction.discount.toLocaleString()}</span>
                                            </div>
                                            <div className="d-flex justify-content-between fs-5 fw-bold pt-2 border-top">
                                                <span>Total:</span>
                                                <span style={{ color: '#7c3aed' }}>₱{receiptTransaction.total.toLocaleString()}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="mb-4">
                                <h5 className="fw-semibold mb-2 text-dark">Payment Details</h5>
                                <div
                                    className="p-3 rounded border"
                                    style={{
                                        backgroundColor: receiptTransaction.payment_plan === 'installment' ? '#fff7ed' : '#f0fdf4',
                                        borderColor: receiptTransaction.payment_plan === 'installment' ? '#fed7aa' : '#bbf7d0'
                                    }}
                                >
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="fw-medium">Payment Method:</span>
                                        <span className="text-capitalize">{receiptTransaction.payment_method}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="fw-medium">Payment Plan:</span>
                                        <span>
                                            {receiptTransaction.payment_plan === 'full' ? 'Full Payment' : 'Installment Plan'}
                                        </span>
                                    </div>
                                    <div
                                        className="d-flex justify-content-between fs-6 fw-semibold mb-2"
                                        style={{ color: receiptTransaction.payment_plan === 'installment' ? '#f59e0b' : '#10b981' }}
                                    >
                                        <span>Amount Paid Today:</span>
                                        <span>₱{(receiptTransaction.amount_paid || 0).toLocaleString()}</span>
                                    </div>

                                    {receiptTransaction.payment_plan === 'installment' && receiptTransaction.installment_details && (
                                        <div className="mt-3 pt-3 border-top small" style={{ borderColor: '#fed7aa' }}>
                                            <div className="mb-3 fw-medium" style={{ color: '#92400e' }}>
                                                Installment Schedule:
                                            </div>
                                            <div className="row mb-2">
                                                <div className="col-8">Monthly Payment:</div>
                                                <div className="col-4 text-end fw-semibold">
                                                    ₱{receiptTransaction.installment_details.monthly_payment.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="row mb-2">
                                                <div className="col-8">Payment Duration:</div>
                                                <div className="col-4 text-end fw-semibold">
                                                    {receiptTransaction.installment_details.months} months
                                                </div>
                                            </div>
                                            {receiptTransaction.installment_details.months !== 3 && (
                                                <div className="row mb-2">
                                                    <div className="col-8">Interest Rate:</div>
                                                    <div className="col-4 text-end fw-semibold">
                                                        {receiptTransaction.installment_details.interest_rate}%
                                                    </div>
                                                </div>
                                            )}
                                            <div className="row pt-2 mt-2 border-top text-danger" style={{ borderColor: '#fde68a' }}>
                                                <div className="col-8 fw-medium">Remaining Balance:</div>
                                                <div className="col-4 text-end fw-bold">
                                                    ₱{(receiptTransaction.remainingBalance || 0).toLocaleString()}
                                                </div>
                                            </div>

                                            {/* Payment Schedule */}
                                            <div className="mt-3 pt-2 border-top" style={{ borderColor: '#fde68a' }}>
                                                <div className="fw-medium mb-2" style={{ color: '#92400e' }}>Payment Schedule:</div>
                                                <div style={{ maxHeight: '120px', overflowY: 'auto', fontSize: '12px' }}>
                                                    {receiptTransaction.installment_details.payment_dates.map((date, index) => (
                                                        <div key={index} className="d-flex justify-content-between mb-1">
                                                            <span>Payment #{index + 1}: {date}</span>
                                                            <span>₱{receiptTransaction.installment_details.monthly_payment.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status Message */}
                            <div className="alert alert-success text-center mb-4" role="alert">
                                <p className="mb-2 fw-medium">✓ Transaction completed successfully</p>
                                <p className="mb-0 small">Order has been sent to warehouse</p>
                                {receiptTransaction.payment_plan === 'installment' && (
                                    <p className="mt-2 mb-0 small text-danger fw-medium">
                                        ⚠️ Customer has outstanding installment balance
                                    </p>
                                )}
                            </div>
                        </Modal.Body>

                        <Modal.Footer style={{ position: 'sticky', bottom: 0, backgroundColor: 'white', borderTop: '1px solid #dee2e6' }}>
                            <div className="d-flex gap-2 w-100">
                                <Button
                                    variant="secondary"
                                    className="flex-fill"
                                    onClick={() => {
                                        // Print functionality
                                        const printContent = document.createElement('div');
                                        printContent.innerHTML = `
                            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; width: 148mm; max-width: 148mm; margin: 0 auto; padding: 10mm; font-size: 10px; line-height: 1.3; color: #333;">
                                <div style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 8px;">
                                    <h1 style="margin: 0; font-size: 14px; font-weight: bold;">A.G Custom Furniture</h1>
                                    <div style="font-size: 9px; color: #666; margin-top: 3px;">
                                        <div>📄 Invoice #${receiptTransaction.invoice_id}</div>
                                        <div>📅 ${receiptTransaction.date} • ⏰ ${receiptTransaction.time}</div>
                                        <div>📍 ${receiptTransaction.location}</div>
                                    </div>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <div style="font-weight: bold; margin-bottom: 4px; font-size: 11px;">👤 CUSTOMER INFORMATION</div>
                                    <div style="background: #f8f9fa; padding: 6px; border-radius: 4px; border-left: 3px solid #007bff;">
                                        <div style="font-weight: bold; margin-bottom: 2px;">${receiptTransaction.customer.cust_name}</div>
                                        <div style="color: #666; font-size: 9px; margin-bottom: 1px;">📞 ${receiptTransaction.customer.phone}</div>
                                        <div style="color: #666; font-size: 9px;">📧 ${receiptTransaction.customer.email}</div>
                                    </div>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <div style="font-weight: bold; margin-bottom: 4px; font-size: 11px;">🛍️ ITEMS PURCHASED</div>
                                    <div style="background: #f8f9fa; padding: 6px; border-radius: 4px; border-left: 3px solid #28a745;">
                                        ${receiptTransaction.items.map((item, index) => `
                                            <div style="padding: 6px 0; ${index < receiptTransaction.items.length - 1 ? 'border-bottom: 1px dashed #ccc;' : ''} margin-bottom: ${index < receiptTransaction.items.length - 1 ? '6px' : '0'};">
                                                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                                    <div style="flex: 1; margin-right: 10px;">
                                                        <div style="font-weight: bold; font-size: 10px; margin-bottom: 2px;">${item.product_name}</div>
                                                        <div style="color: #666; font-size: 9px; margin-bottom: 1px;">${item.description}</div>
                                                        ${item.isCustom ? `<div style="font-size: 8px; color: ${item.customizationType === 'full' ? '#f59e0b' : '#7c3aed'}; margin-bottom: 1px;">${item.customizationType === 'full' ? 'Full Custom' : 'Semi-Custom'}</div>` : ''}
                                                        ${item.modifications ? `<div style="color: #7c3aed; font-size: 8px; margin-bottom: 2px; font-style: italic;">Mods: ${item.modifications}</div>` : ''}
                                                        <div style="font-size: 9px; color: #888;">₱${item.price.toLocaleString()} × ${item.quantity} ${item.quantity > 1 ? 'pcs' : 'pc'}</div>
                                                    </div>
                                                    <div style="font-weight: bold; text-align: right; font-size: 10px;">₱${(item.price * item.quantity).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
                                        ${receiptTransaction.payment_plan === 'installment' ?
                                                `<div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12px;">
                                                <span>ORIGINAL PRICE:</span>
                                                <span>₱${receiptTransaction.total.toLocaleString()}</span>
                                            </div>` :
                                                `<div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                                <span>Subtotal:</span>
                                                <span>₱${receiptTransaction.subtotal.toLocaleString()}</span>
                                            </div>
                                            <div style="display: flex; justify-content: space-between; margin-bottom: 3px; color: #dc3545;">
                                                <span>Discount:</span>
                                                <span>-₱${receiptTransaction.discount.toLocaleString()}</span>
                                            </div>
                                            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; border-top: 2px solid #333; padding-top: 6px; margin-top: 6px;">
                                                <span>TOTAL:</span>
                                                <span>₱${receiptTransaction.total.toLocaleString()}</span>
                                            </div>`
                                            }
                                    </div>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <div style="font-weight: bold; margin-bottom: 4px; font-size: 11px;">💳 PAYMENT DETAILS</div>
                                    <div style="background: ${receiptTransaction.payment_plan === 'installment' ? '#fff7ed' : '#f0fdf4'}; padding: 8px; border-radius: 4px; border: 1px solid ${receiptTransaction.payment_plan === 'installment' ? '#fed7aa' : '#bbf7d0'};">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                            <span><strong>Payment Method:</strong></span>
                                            <span style="text-transform: uppercase;">${receiptTransaction.payment_method}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                            <span><strong>Payment Plan:</strong></span>
                                            <span>${receiptTransaction.payment_plan === 'full' ? 'Full Payment' : 'Installment Plan'}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; font-weight: bold; color: ${receiptTransaction.payment_plan === 'installment' ? '#f59e0b' : '#10b981'}; font-size: 11px; margin-bottom: 6px;">
                                            <span>Amount Paid Today:</span>
                                            <span>₱${(receiptTransaction.amount_paid || 0).toLocaleString()}</span>
                                        </div>
                                        
                                        ${receiptTransaction.payment_plan === 'installment' && receiptTransaction.installment_details ? `
                                            <div style="border-top: 1px dashed #fed7aa; padding-top: 6px; margin-top: 6px;">
                                                <div style="font-weight: bold; margin-bottom: 4px; color: #dc3545; font-size: 10px;">📋 INSTALLMENT SCHEDULE:</div>
                                                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                                    <span>Monthly Payment:</span>
                                                    <span style="font-weight: bold;">₱${receiptTransaction.installment_details.monthly_payment.toLocaleString()}</span>
                                                </div>
                                                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                                    <span>Duration:</span>
                                                    <span style="font-weight: bold;">${receiptTransaction.installment_details.months} months</span>
                                                </div>
                                                ${receiptTransaction.installment_details.months !== 3 ?
                                                    `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                                        <span>Interest Rate:</span>
                                                        <span style="font-weight: bold;">${receiptTransaction.installment_details.interest_rate}%</span>
                                                    </div>` :
                                                    `<div style="display: flex; justify-content: space-between; margin-bottom: 2px; color: #10b981;">
                                                        <span>Special Offer:</span>
                                                        <span style="font-weight: bold;">0% Interest (3 months)</span>
                                                    </div>`
                                                }
                                                <div style="display: flex; justify-content: space-between; font-weight: bold; color: #dc3545; border-top: 1px solid #fde68a; padding-top: 3px; margin-top: 3px;">
                                                    <span>Remaining Balance:</span>
                                                    <span>₱${(receiptTransaction.remainingBalance || 0).toLocaleString()}</span>
                                                </div>
                                                
                                                <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #fde68a;">
                                                    <div style="font-weight: bold; margin-bottom: 4px; color: #92400e; font-size: 9px;">PAYMENT SCHEDULE:</div>
                                                    ${receiptTransaction.installment_details.payment_dates ?
                                                    receiptTransaction.installment_details.payment_dates.map((date, index) =>
                                                        `<div style="display: flex; justify-content: space-between; font-size: 8px; margin-bottom: 1px;">
                                                                <span>#${index + 1}: ${date}</span>
                                                                <span>₱${receiptTransaction.installment_details.monthly_payment.toLocaleString()}</span>
                                                            </div>`
                                                    ).join('') : ''
                                                }
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                                
                                <div style="text-align: center; margin-top: 15px; padding-top: 8px; border-top: 2px solid #333; font-size: 9px; color: #666;">
                                    <div style="font-weight: bold; margin-bottom: 6px; font-size: 11px;">✅ TRANSACTION COMPLETED SUCCESSFULLY</div>
                                    <div style="margin-bottom: 3px;">Thank you for choosing A.G Custom Furniture!</div>
                                    <div style="margin-bottom: 3px;">📋 Please keep this receipt for your records</div>
                                    ${receiptTransaction.payment_plan === 'installment' ?
                                                '<div style="color: #dc3545; font-weight: bold;">⚠️ Outstanding installment balance - Payment reminders will be sent</div>' : ''
                                            }
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
                                <title>Receipt - Invoice #${receiptTransaction.invoice_id}</title>
                                <style>
                                    @page { size: A4; margin: 10mm; }
                                    @media print {
                                        body { margin: 0; -webkit-print-color-adjust: exact; color-adjust: exact; }
                                        * { -webkit-print-color-adjust: exact; color-adjust: exact; }
                                    }
                                    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                                </style>
                            </head>
                            <body>${printContent.innerHTML}</body>
                            </html>
                        `);
                                        printWindow.document.close();
                                        printWindow.print();
                                    }}
                                >
                                    🖨️ Print Receipt
                                </Button>
                                <Button variant="primary" className="flex-fill" onClick={closeReceipt}>
                                    ✓ Close
                                </Button>
                            </div>
                        </Modal.Footer>
                    </Modal>
                )}
            </div>
        </>
    );
}