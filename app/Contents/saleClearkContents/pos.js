'use client';

import React, { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import EmailForm from '@/app/Components/sendEmail/sendEmail';
import Head from 'next/head';
import Modal from 'react-bootstrap/Modal';
import { Button } from 'react-bootstrap';


export default function SalePage() {

  const [user_id, setUser_id] = useState('');
  const [location_id, setLocation_id] = useState('');
  const [location_Name, setLocation_Name] = useState('');

  useEffect(() => {
    setUser_id(sessionStorage.getItem("user_id"));
    setLocation_id(sessionStorage.getItem("location_id"));
    setLocation_Name(sessionStorage.getItem("location_name"));
    GetInventory();
    GetCustomer();
  }, []);

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

  const Logs = async (accID, activity) => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'audit-log.php';
    const Details = {
      accID: accID,
      activity: activity
    }
    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(Details),
          operation: "Logs"
        }
      });
    } catch (error) {
      console.error("Error recording logs events:", error);
    }
    return;
  };

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerType, setCustomerType] = useState(''); // 'walk-in' or 'customer'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);

  // Payment plan states - default to full payment
  const [paymentPlan, setPaymentPlan] = useState('full');
  const [installmentDetails, setInstallmentDetails] = useState({
    months: 3,
    interestRate: 0, // percentage
    monthlyPayment: 0,
    totalWithInterest: 0
  });
  const [downpaymentAmount, setDownpaymentAmount] = useState(0);
  const [customDownpayment, setCustomDownpayment] = useState('');

  const GetInventory = async () => {
    const locID = sessionStorage.getItem('location_id');

    setLoading(true);

    try {
      const baseURL = sessionStorage.getItem('baseURL');
      const response = await axios.get(`${baseURL}inventory.php`, {
        params: {
          json: JSON.stringify({ locID }),
          operation: "GetInventory"
        }
      });

      const inventoryData = response.data.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        category: item.category_name,
        description: item.description,
        color: item.color || 'N/A',
        price: parseFloat(item.price),
        stock: parseInt(item.qty),
        location_id: item.location_id,
        store_inventory_id: item.store_inventory_id
      }));

      setProducts(inventoryData);

      const inventoryLookup = inventoryData.reduce((acc, product) => {
        acc[product.product_id] = product.stock;
        return acc;
      }, {});

      setInventory(inventoryLookup);

      console.log('Inventory fetched:', inventoryData);
      console.log('Inventory lookup:', inventoryLookup);

    } catch (error) {
      console.error("Error fetching inventory:", error);
      alert('Failed to load inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.color && product.color.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter customers based on search term
  const filteredCustomers = customerList.filter(customer =>
    customer.cust_name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    if (inventory[product.product_id] <= 0) {
      showAlertError({
        icon: "warning",
        title: "Oppsss!",
        text: 'No stock available for this product',
        button: 'Okay'
      });
      return;
    }

    const existingItem = cart.find(item => item.product_id === product.product_id);

    if (existingItem) {
      if (existingItem.quantity >= inventory[product.product_id]) {
        showAlertError({
          icon: "warning",
          title: "Oppsss!",
          text: 'Not enough stock available!',
          button: 'Okay'
        });
        return;
      }
      updateQuantity(product.product_id, existingItem.quantity + 1);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > inventory[productId]) {
      showAlertError({
        icon: "warning",
        title: "Oppsss!",
        text: 'Not enough stock available!',
        button: 'Okay'
      });
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

  const calculateDiscount = () => {
    if (paymentPlan === 'installment') {
      return 0; // No discount for installments
    }

    const subtotal = calculateSubtotal();

    if (!discountValue || discountValue === '' || isNaN(discountValue) || discountValue < 0) {
      return 0;
    }

    const numericDiscountValue = parseFloat(discountValue);

    if (discountType === 'percentage') {
      const cappedPercentage = Math.min(numericDiscountValue, 100);
      return (subtotal * cappedPercentage) / 100;
    }

    return Math.min(numericDiscountValue, subtotal);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  // Updated downpayment calculation function
  const calculateDownpayment = () => {
    const total = calculateTotal();
    const minimumDownpayment = total * 0.2; // 20% minimum

    // Use custom downpayment if set and valid, otherwise use minimum
    if (customDownpayment > 0 && customDownpayment >= minimumDownpayment) {
      return Math.min(customDownpayment, total); // Can't exceed total
    }

    return minimumDownpayment;
  };

  // Updated installment payment calculation with corrected interest logic
  const calculateInstallmentPayment = () => {
    const total = calculateTotal();
    const downpayment = calculateDownpayment();
    const remainingBalance = total - downpayment;
    const months = installmentDetails.months;

    // No interest for 3 months plan
    if (months === 3) {
      return remainingBalance / months;
    }

    // Simple interest calculation
    const interestRate = installmentDetails.interestRate / 100;
    const interestAmount = remainingBalance * interestRate;
    const totalAmountToPay = remainingBalance + interestAmount;

    // Monthly payment = total amount to pay ÷ number of months
    return totalAmountToPay / months;
  };

  // Updated total with interest calculation
  const calculateTotalWithInterest = () => {
    const downpayment = calculateDownpayment();
    const monthlyPayment = calculateInstallmentPayment();
    return downpayment + (monthlyPayment * installmentDetails.months);
  };

  // Function to generate payment schedule dates
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

  // Update installment calculations when values change
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
  }, [paymentPlan, installmentDetails.months, installmentDetails.interestRate, cart, discountValue, customDownpayment]);

  // Show receipt modal
  const showReceiptModal = (transaction) => {
    setLastTransaction(transaction);
    setShowReceipt(true);
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setLastTransaction(null);
  };

  const proceedPurchase = async () => {
    if (cart.length === 0) {
      showAlertError({
        icon: "error",
        title: "Cart Empty!",
        text: 'Please add items to cart before proceeding.',
        button: 'Okay'
      });
      return;
    }

    if (!customerType) {
      showAlertError({
        icon: "error",
        title: "Customer Type Required!",
        text: 'Please select customer type (Walk-in or Customer).',
        button: 'Okay'
      });
      return;
    }

    if (customerType === 'customer' && !selectedCustomer) {
      showAlertError({
        icon: "error",
        title: "Customer Required!",
        text: 'Please select a customer.',
        button: 'Okay'
      });
      return;
    }

    const report = [];
    const updateInventory = [];

    cart.forEach((invProd) => {
      const match = products.find(delProd =>
        delProd.product_id == invProd.product_id
      );

      if (match) {
        report.push({
          prodID: match.product_id,
          pastBalance: match.stock,
          qty: invProd.quantity,
          currentBalance: match.stock - invProd.quantity
        });

        updateInventory.push({
          prodID: match.product_id,
          newQty: match.stock - invProd.quantity
        });
      }
    });

    const accountID = parseInt(sessionStorage.getItem('user_id'));
    const locId = parseInt(sessionStorage.getItem('location_id'));
    const locName = sessionStorage.getItem('location_name');
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'sales.php';

    if (paymentPlan === 'full') {
      // Full payment works with any payment method (cash, card, gcash, etc.)
      const amountPaid = calculateTotal();

      const PurchaseDetails = {
        custID: customerType === 'walk-in' ? null : selectedCustomer.cust_id,
        accID: accountID,
        locID: locId,
        payMethod: paymentMethod,
        subTotal: calculateSubtotal(),
        discount: calculateDiscount(),
        discountValue: discountValue,
        total: calculateTotal(),
        paymentPlan: paymentPlan,
        amountPaid: amountPaid
      };

      console.log(PurchaseDetails);

      try {
        const operation = customerType === 'walk-in' ? "walkSale" : "customerSale";

        const response = await axios.get(url, {
          params: {
            salesDetails: JSON.stringify(cart),
            updateIn: JSON.stringify(updateInventory),
            reportInventory: JSON.stringify(report),
            json: JSON.stringify(PurchaseDetails),
            operation: operation
          }
        });

        if (!isNaN(response.data) && response.data !== null && response.data !== "") {
          // Create transaction object for receipt
          const transaction = {
            invoice_id: response.data,
            customer: customerType === 'walk-in' ? 'walk-in' : selectedCustomer,
            items: [...cart],
            subtotal: calculateSubtotal(),
            discount: calculateDiscount(),
            total: calculateTotal(),
            payment_method: paymentMethod,
            payment_plan: paymentPlan,
            amount_paid: amountPaid,
            installment_details: null,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            location: locName || 'Agora Showroom Main'
          };

          // Show receipt modal
          showReceiptModal(transaction);

          GetInventory();

          // Reset form
          setCart([]);
          setPaymentMethod("cash");
          setCustomerType('');
          setSelectedCustomer(null);
          setCustomerSearchTerm('');
          setDiscountValue(0);
          setPaymentPlan('full');
          setDownpaymentAmount(0);
          setCustomDownpayment(0);
          setInstallmentDetails({
            months: 3,
            interestRate: 0,
            monthlyPayment: 0,
            totalWithInterest: 0
          });

          const activity = customerType === 'walk-in' ?
            `Processed a walk-in customer sale at ${locName}, Invoice #${response.data}` :
            `Processed a customer sale at ${locName}, Invoice #${response.data}`;

          Logs(accountID, activity);

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

    } else if (paymentPlan == 'installment') {
      if (paymentMethod == 'cash') {
        const total = calculateTotal();

        const list1 = generatePaymentDates().map((date, index) => ({
          paymentNumber: index + 1,
          paymentDate: date,
          amountDue: installmentDetails.monthlyPayment,
        }));

        // Get the first product ID from cart instead of undefined prodID1
        const firstProductId = cart.length > 0 ? cart[0].product_id : null;

        if (!firstProductId) {
          showAlertError({
            icon: "error",
            title: "Product Error!",
            text: 'No products found in cart.',
            button: 'Okay'
          });
          return;
        }

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
          prodID: firstProductId,
        }

        console.log(installmentDetails1);

        try {
          const operation = 'installmentPlan';

          const response = await axios.get(url, {
            params: {
              dateDue: JSON.stringify(list1),
              salesDetails: JSON.stringify(cart),
              updateIn: JSON.stringify(updateInventory),
              reportInventory: JSON.stringify(report),
              json: JSON.stringify(installmentDetails1),
              operation: operation
            }
          });

          if (!isNaN(response.data) && response.data !== null && response.data !== "") {
            // Create transaction object for receipt
            const transaction = {
              remainingBal: installmentDetails.monthlyPayment * installmentDetails.months,
              downpaymentAmount: calculateDownpayment(),
              invoice_id: response.data,
              customer: selectedCustomer,
              items: [...cart],
              subtotal: calculateSubtotal(),
              discount: calculateDiscount(),
              total: calculateTotal(),
              payment_method: paymentMethod,
              payment_plan: paymentPlan,
              amount_paid: calculateDownpayment(),
              installment_details: {
                monthly_payment: installmentDetails.monthlyPayment,
                months: installmentDetails.months,
                interest_rate: installmentDetails.interestRate,
                total_with_interest: installmentDetails.totalWithInterest,
                payment_dates: generatePaymentDates()
              },
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString(),
              location: locName || 'Agora Showroom Main'
            };

            // Show receipt modal
            showReceiptModal(transaction);

            GetInventory();

            // Reset form
            setCart([]);
            setPaymentMethod("cash");
            setCustomerType('');
            setSelectedCustomer(null);
            setCustomerSearchTerm('');
            setDiscountValue(0);
            setPaymentPlan('full');
            setDownpaymentAmount(0);
            setCustomDownpayment(0);
            setInstallmentDetails({
              months: 3,
              interestRate: 0,
              monthlyPayment: 0,
              totalWithInterest: 0
            });

            const activity = `Processed an installment sale at ${locName}, Invoice #${response.data}`;

            Logs(accountID, activity);

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

      } else {
        console.log('Other payment!!');
      }
    }
  };

  if (loading) {
    return (
      <div className='customer-main' style={{ overflow: 'auto' }}>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #f3e7fc, #e0e7ff)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            padding: '48px',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Loading Inventory...</h2>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #7c3aed',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Receipt Modal - Updated with scrollable body and product descriptions */}
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
            Payment Successful!
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          padding: '1.5rem'
        }}>
          {lastTransaction && (
            <>
              {/* Transaction Header */}
              <div className="text-center mb-4 p-3" style={{ backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <h4 className="fw-semibold mb-2">A.G HOME APPLIANCE AND FURNITURE SHOWROOM</h4>
                <div className="text-muted small">
                  <div>Invoice #{lastTransaction.invoice_id}</div>
                  <div>{lastTransaction.date} • {lastTransaction.time}</div>
                  <div>{lastTransaction.location}</div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="mb-4">
                <h5 className="fw-semibold mb-2 text-dark">Customer Information</h5>
                <div className="p-3 rounded" style={{ backgroundColor: '#f9fafb' }}>
                  {lastTransaction.customer === 'walk-in' ? (
                    <div className="fst-italic text-muted">Walk-in Customer</div>
                  ) : (
                    <div>
                      <div className="fw-bold">Name: {lastTransaction.customer.cust_name}</div>
                      <div className="text-muted">PHONE#: {lastTransaction.customer.phone}</div>
                      <div className="text-muted">EMAIL ADDRESS: {lastTransaction.customer.email}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Purchased - Updated with descriptions */}
              <div className="mb-4">
                <h5 className="fw-semibold mb-2 text-dark">Items Purchased</h5>
                <div className="p-3 rounded" style={{ backgroundColor: '#f9fafb' }}>
                  {lastTransaction.items.map((item, index) => (
                    <div
                      key={index}
                      className={`py-3 ${index < lastTransaction.items.length - 1 ? 'border-bottom' : ''}`}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1">
                          <div className="fw-bold text-dark">{item.product_name}</div>
                          <div className="text-muted small mb-1">{item.description}</div>
                          {item.color && item.color !== 'N/A' && (
                            <div className="text-muted small mb-1">Color: {item.color}</div>
                          )}
                          <div className="text-muted small">
                            ₱{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × {item.quantity} {item.quantity > 1 ? 'pieces' : 'piece'}
                          </div>
                        </div>
                        <div className="fw-bold text-end">
                          <div>₱{(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="mb-4">
                <div className="p-3 rounded" style={{ backgroundColor: '#f9fafb' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>₱{lastTransaction.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-danger">
                    <span>Discount:</span>
                    <span>-₱{lastTransaction.discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="d-flex justify-content-between fs-5 fw-bold pt-2 border-top">
                    <span>Total:</span>
                    <span style={{ color: '#7c3aed' }}>₱{lastTransaction.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="mb-4">
                <h5 className="fw-semibold mb-2 text-dark">Payment Details</h5>
                <div
                  className="p-3 rounded border"
                  style={{
                    backgroundColor: lastTransaction.payment_plan === 'installment' ? '#fff7ed' : '#f0fdf4',
                    borderColor: lastTransaction.payment_plan === 'installment' ? '#fed7aa' : '#bbf7d0'
                  }}
                >
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-medium">Payment Method:</span>
                    <span className="text-capitalize">{lastTransaction.payment_method}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-medium">Payment Plan:</span>
                    <span>
                      {lastTransaction.payment_plan === 'full'
                        ? 'Full Payment'
                        : 'Installment Plan'}
                    </span>
                  </div>
                  <div
                    className="d-flex justify-content-between fs-6 fw-semibold mb-2"
                    style={{ color: lastTransaction.payment_plan === 'installment' ? '#f59e0b' : '#10b981' }}
                  >
                    <span>Amount Paid Today:</span>
                    <span>₱{(lastTransaction.amount_paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  {/* Installment Details */}
                  {lastTransaction.payment_plan === 'installment' && lastTransaction.installment_details && (
                    <div className="mt-3 pt-3 border-top small" style={{ borderColor: '#fed7aa' }}>
                      <div className="mb-3 fw-medium" style={{ color: '#92400e' }}>
                        Installment Schedule:
                      </div>
                      <div className="row mb-2">
                        <div className="col-8">Monthly Payment:</div>
                        <div className="col-4 text-end fw-semibold">
                          ₱{lastTransaction.installment_details.monthly_payment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-8">Payment Duration:</div>
                        <div className="col-4 text-end fw-semibold">
                          {lastTransaction.installment_details.months} months
                        </div>
                      </div>
                      {lastTransaction.installment_details.months !== 3 && (
                        <div className="row mb-2">
                          <div className="col-8">Interest Rate:</div>
                          <div className="col-4 text-end fw-semibold">
                            {lastTransaction.installment_details.interest_rate}%
                          </div>
                        </div>
                      )}
                      <div className="row pt-2 mt-2 border-top text-danger" style={{ borderColor: '#fde68a' }}>
                        <div className="col-8 fw-medium">Remaining Balance:</div>
                        <div className="col-4 text-end fw-bold">
                          ₱{(lastTransaction.remainingBal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      {lastTransaction.installment_details.months !== 3 && (
                        <div className="row small" style={{ color: '#78350f' }}>
                          <div className="col-8">Total with Interest:</div>
                          <div className="col-4 text-end">
                            ₱{lastTransaction.installment_details.total_with_interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      )}

                      {/* Payment Schedule */}
                      <div className="mt-3 pt-2 border-top" style={{ borderColor: '#fde68a' }}>
                        <div className="fw-medium mb-2" style={{ color: '#92400e' }}>Payment Schedule:</div>
                        <div style={{ maxHeight: '120px', overflowY: 'auto', fontSize: '12px' }}>
                          {lastTransaction.installment_details.payment_dates.map((date, index) => (
                            <div key={index} className="d-flex justify-content-between mb-1">
                              <span>Payment #{index + 1}: {date}</span>
                              <span>₱{lastTransaction.installment_details.monthly_payment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                <p className="mb-2 fw-medium">
                  ✓ Transaction completed successfully
                </p>
                <p className="mb-0 small">
                  Inventory has been updated automatically
                </p>
                {lastTransaction.payment_plan === 'installment' && (
                  <p className="mt-2 mb-0 small text-danger fw-medium">
                    ⚠️ Customer has outstanding installment balance
                  </p>
                )}
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
                // Print functionality - Updated for better formatting
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
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 8px;">
            <h1 style="margin: 0; font-size: 14px; font-weight: bold;">A.G HOME APPLIANCE AND FURNITURE SHOWROOM</h1>
            <div style="font-size: 9px; color: #666; margin-top: 3px;">
              <div>📄 Invoice #${lastTransaction.invoice_id}</div>
              <div>📅 ${lastTransaction.date} • ⏰ ${lastTransaction.time}</div>
              <div>📍 ${lastTransaction.location}</div>
            </div>
          </div>
          
          <!-- Customer Info -->
          <div style="margin-bottom: 12px;">
            <div style="font-weight: bold; margin-bottom: 4px; font-size: 11px;">👤 CUSTOMER INFORMATION</div>
            <div style="background: #f8f9fa; padding: 6px; border-radius: 4px; border-left: 3px solid #007bff;">
              ${lastTransaction.customer === 'walk-in' ?
                      '<div style="font-style: italic; color: #666;">Walk-in Customer</div>' :
                      `<div style="font-weight: bold; margin-bottom: 2px;">${lastTransaction.customer.cust_name}</div>
                 <div style="color: #666; font-size: 9px; margin-bottom: 1px;">📞 ${lastTransaction.customer.phone}</div>
                 <div style="color: #666; font-size: 9px;">📧 ${lastTransaction.customer.email}</div>`
                    }
            </div>
          </div>
          
          <!-- Items -->
          <div style="margin-bottom: 12px;">
            <div style="font-weight: bold; margin-bottom: 4px; font-size: 11px;">🛍️ ITEMS PURCHASED</div>
            <div style="background: #f8f9fa; padding: 6px; border-radius: 4px; border-left: 3px solid #28a745;">
              ${lastTransaction.items.map((item, index) =>
                      `<div style="padding: 6px 0; ${index < lastTransaction.items.length - 1 ? 'border-bottom: 1px dashed #ccc;' : ''} margin-bottom: ${index < lastTransaction.items.length - 1 ? '6px' : '0'};">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1; margin-right: 10px;">
                      <div style="font-weight: bold; font-size: 10px; margin-bottom: 2px;">${item.product_name}</div>
                      <div style="color: #666; font-size: 9px; margin-bottom: 1px;">${item.description}</div>
                      ${item.color && item.color !== 'N/A' ?
                        `<div style="color: #666; font-size: 9px; margin-bottom: 2px;">Color: ${item.color}</div>` : ''
                      }
                      <div style="font-size: 9px; color: #888;">₱${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × ${item.quantity} ${item.quantity > 1 ? 'pcs' : 'pc'}</div>
                    </div>
                    <div style="font-weight: bold; text-align: right; font-size: 10px;">
                      ₱${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>`
                    ).join('')}
            </div>
          </div>
          
          <!-- Totals - Different for installments vs full payment -->
          <div style="margin-bottom: 12px;">
            <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
              ${lastTransaction.payment_plan === 'installment' ?
                      // For installments, only show original price
                      `<div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12px;">
                  <span>ORIGINAL PRICE:</span>
                  <span>₱${lastTransaction.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>` :
                      // For full payments, show breakdown
                      `<div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                  <span>Subtotal:</span>
                  <span>₱${lastTransaction.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px; color: #dc3545;">
                  <span>Discount:</span>
                  <span>-₱${lastTransaction.discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; 
                            border-top: 2px solid #333; padding-top: 6px; margin-top: 6px;">
                  <span>TOTAL:</span>
                  <span>₱${lastTransaction.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>`
                    }
            </div>
          </div>
          
          <!-- Payment Details -->
          <div style="margin-bottom: 12px;">
            <div style="font-weight: bold; margin-bottom: 4px; font-size: 11px;">💳 PAYMENT DETAILS</div>
            <div style="background: ${lastTransaction.payment_plan === 'installment' ? '#fff7ed' : '#f0fdf4'}; 
                        padding: 8px; border-radius: 4px; 
                        border: 1px solid ${lastTransaction.payment_plan === 'installment' ? '#fed7aa' : '#bbf7d0'};">
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span><strong>Payment Method:</strong></span>
                <span style="text-transform: uppercase;">${lastTransaction.payment_method}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span><strong>Payment Plan:</strong></span>
                <span>${lastTransaction.payment_plan === 'full' ? 'Full Payment' : 'Installment Plan'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: bold; 
                          color: ${lastTransaction.payment_plan === 'installment' ? '#f59e0b' : '#10b981'}; 
                          font-size: 11px; margin-bottom: 6px;">
                <span>Amount Paid Today:</span>
                <span>₱${(lastTransaction.amount_paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              ${lastTransaction.payment_plan === 'installment' && lastTransaction.installment_details ?
                      `<div style="border-top: 1px dashed #fed7aa; padding-top: 6px; margin-top: 6px;">
                  <div style="font-weight: bold; margin-bottom: 4px; color: #dc3545; font-size: 10px;">📋 INSTALLMENT SCHEDULE:</div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <span>Monthly Payment:</span>
                    <span style="font-weight: bold;">₱${lastTransaction.installment_details.monthly_payment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <span>Duration:</span>
                    <span style="font-weight: bold;">${lastTransaction.installment_details.months} months</span>
                  </div>
                  ${lastTransaction.installment_details.months !== 3 ?
                        `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                      <span>Interest Rate:</span>
                      <span style="font-weight: bold;">${lastTransaction.installment_details.interest_rate}% per year</span>
                    </div>` :
                        `<div style="display: flex; justify-content: space-between; margin-bottom: 2px; color: #10b981;">
                      <span>Special Offer:</span>
                      <span style="font-weight: bold;">0% Interest (3 months)</span>
                    </div>`
                      }
                  <div style="display: flex; justify-content: space-between; font-weight: bold; 
                              color: #dc3545; border-top: 1px solid #fde68a; padding-top: 3px; margin-top: 3px;">
                    <span>Remaining Balance:</span>
                    <span>₱${(lastTransaction.remainingBal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  
                  <!-- Payment Schedule -->
                  <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #fde68a;">
                    <div style="font-weight: bold; margin-bottom: 4px; color: #92400e; font-size: 9px;">PAYMENT SCHEDULE:</div>
                    ${lastTransaction.installment_details.payment_dates ?
                        lastTransaction.installment_details.payment_dates.map((date, index) =>
                          `<div style="display: flex; justify-content: space-between; font-size: 8px; margin-bottom: 1px;">
                          <span>#${index + 1}: ${date}</span>
                          <span>₱${lastTransaction.installment_details.monthly_payment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>`
                        ).join('') : ''
                      }
                  </div>
                </div>` : ''
                    }
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 15px; padding-top: 8px; border-top: 2px solid #333;">
            <div style="font-weight: bold; margin-bottom: 6px; font-size: 11px;">✅ TRANSACTION COMPLETED SUCCESSFULLY</div>
            <div style="font-size: 9px; color: #666; margin-bottom: 3px;">
              Thank you for choosing A.G Home Appliance and Furniture Showroom!
            </div>
            <div style="font-size: 9px; color: #666; margin-bottom: 3px;">
              📋 Please keep this receipt for your records
            </div>
            ${lastTransaction.payment_plan === 'installment' ?
                      '<div style="font-size: 9px; color: #dc3545; font-weight: bold;">⚠️ Outstanding installment balance - Payment reminders will be sent</div>' : ''
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
          <title>Receipt - Invoice #${lastTransaction.invoice_id}</title>
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
              🖨️ Print Receipt
            </Button>
            <Button
              variant="primary"
              className="flex-fill"
              onClick={closeReceipt}
            >
              ✓ Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <div className='customer-main' style={{ overflow: 'auto' }}>
        <div style={{ minHeight: '100vh', background: 'transparent', padding: '16px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '16px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>A.G POS System</h1>
              <p style={{ color: '#6b7280' }}>
                Location: {location_Name} | Date: {new Date().toLocaleDateString()} | Products: {products.length}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 1024 ? '2fr 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
              {/* Products Section */}
              <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '24px', height: 'fit-content', minHeight: window.innerWidth > 1024 ? '800px' : 'auto' }}>
                <div style={{
                  position: 'relative',
                  marginBottom: '24px',
                  margin: '0 auto 24px auto'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    opacity: 0.5
                  }}>
                    <svg
                      width="20"
                      height="20"
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
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px 48px 16px 48px',
                      border: '1px solid black',
                      borderRadius: '12px',
                      fontSize: '16px',
                      backgroundColor: '#f8fafc',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.border = '1px solid #3b82f6';
                      e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        e.target.style.backgroundColor = '#f8fafc';
                        e.target.style.border = '1px solid black';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                      }
                    }}
                  />

                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        opacity: 0.5,
                        padding: '4px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'opacity 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                      onMouseLeave={(e) => e.target.style.opacity = '0.5'}
                    >
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
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? 'repeat(2, 1fr)' : '1fr', gap: '16px', maxHeight: '600px', overflowY: 'auto' }}>
                  {filteredProducts.length === 0 ? (
                    <div style={{
                      gridColumn: 'span 2',
                      textAlign: 'center',
                      padding: '48px',
                      color: '#6b7280'
                    }}>
                      {searchTerm ? 'No products found matching your search.' : 'No products available.'}
                    </div>
                  ) : (
                    filteredProducts.map(product => (
                      <div
                        key={product.product_id}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '16px',
                          cursor: 'pointer',
                          opacity: inventory[product.product_id] <= 0 ? 0.5 : 1,
                          transition: 'box-shadow 0.3s'
                        }}
                        onClick={() => addToCart(product)}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <h3 style={{ fontWeight: '600', fontSize: '16px' }}>{product.product_name}</h3>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            background: inventory[product.product_id] > 5 ? '#d1fae5' : inventory[product.product_id] > 0 ? '#fed7aa' : '#fee2e2',
                            color: inventory[product.product_id] > 5 ? '#065f46' : inventory[product.product_id] > 0 ? '#92400e' : '#991b1b'
                          }}>
                            Stock: {inventory[product.product_id]}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>{product.description}</p>
                        {product.color && (
                          <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>Color: {product.color}</p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#7c3aed' }}>₱{parseFloat(product.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <button
                            style={{
                              background: inventory[product.product_id] <= 0 ? '#d1d5db' : '#7c3aed',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              border: 'none',
                              cursor: inventory[product.product_id] <= 0 ? 'not-allowed' : 'pointer'
                            }}
                            disabled={inventory[product.product_id] <= 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                          >
                            Add +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Cart Section */}
              <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '24px', height: 'fit-content', minHeight: window.innerWidth > 1024 ? '800px' : 'auto', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Cart</h2>

                {/* Customer Type Selection */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Customer Type</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <button
                      onClick={() => {
                        if (paymentPlan !== 'installment') {
                          setCustomerType('walk-in');
                          setSelectedCustomer(null);
                          setCustomerSearchTerm('');
                        }
                      }}
                      disabled={paymentPlan === 'installment'}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: paymentPlan === 'installment' ? '#d1d5db' : (customerType === 'walk-in' ? '#7c3aed' : '#f3f4f6'),
                        color: paymentPlan === 'installment' ? '#9ca3af' : (customerType === 'walk-in' ? 'white' : 'black'),
                        cursor: paymentPlan === 'installment' ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        opacity: paymentPlan === 'installment' ? 0.6 : 1
                      }}
                    >
                      Walk-in {paymentPlan === 'installment' && '(Not Available)'}
                    </button>
                    <button
                      onClick={() => {
                        setCustomerType('customer');
                        setSelectedCustomer(null);
                        setCustomerSearchTerm('');
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: customerType === 'customer' ? '#7c3aed' : '#f3f4f6',
                        color: customerType === 'customer' ? 'white' : 'black',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Customer
                    </button>
                  </div>

                  {paymentPlan === 'installment' && (
                    <div style={{
                      background: '#fef3c7',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #fbbf24',
                      fontSize: '13px',
                      color: '#92400e'
                    }}>
                      ⚠️ Installment plans require registered customer information
                    </div>
                  )}

                  {/* Customer Search and Selection */}
                  {customerType === 'customer' && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ position: 'relative', marginBottom: '8px' }}>
                        <div style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 1,
                          color: '#6b7280'
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
                          placeholder="Search customers by name, email, or phone..."
                          value={customerSearchTerm}
                          onChange={(e) => setCustomerSearchTerm(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px 8px 35px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      {/* Customer List */}
                      <div style={{
                        maxHeight: '150px',
                        overflowY: 'auto',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        background: '#f9fafb'
                      }}>
                        {filteredCustomers.length === 0 ? (
                          <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                            {customerSearchTerm ? 'No customers found matching your search.' : `${customerList.length} customers available`}
                          </div>
                        ) : (
                          filteredCustomers.map(customer => (
                            <div
                              key={customer.cust_id}
                              onClick={() => setSelectedCustomer(customer)}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #e5e7eb',
                                background: selectedCustomer?.cust_id === customer.cust_id ? '#e0e7ff' : 'transparent',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (selectedCustomer?.cust_id !== customer.cust_id) {
                                  e.target.style.background = '#f3f4f6';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedCustomer?.cust_id !== customer.cust_id) {
                                  e.target.style.background = 'transparent';
                                }
                              }}
                            >
                              <div style={{ fontSize: '14px', fontWeight: '500' }}>{customer.cust_name}</div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {customer.phone} • {customer.email}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Selected Customer Display */}
                      {selectedCustomer && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px',
                          background: '#e0e7ff',
                          borderRadius: '6px',
                          border: '1px solid #c7d2fe'
                        }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e40af' }}>
                            Selected: {selectedCustomer.cust_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#3730a3' }}>
                            {selectedCustomer.phone} • {selectedCustomer.email}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cart Items */}
                <div style={{ marginBottom: '16px', maxHeight: '200px', overflowY: 'auto' }}>
                  {cart.length === 0 ? (
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '32px 0' }}>Cart is empty</p>
                  ) : (
                    cart.map(item => (
                      <div key={item.product_id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div>
                            <h4 style={{ fontWeight: '600' }}>{item.product_name}</h4>
                            <p style={{ fontSize: '14px', color: '#6b7280' }}>₱{parseFloat(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              style={{ padding: '4px 8px', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              -
                            </button>
                            <span style={{ width: '48px', textAlign: 'center' }}>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              style={{ padding: '4px 8px', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              +
                            </button>
                          </div>
                          <span style={{ fontWeight: '600' }}>₱{parseFloat(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Discount - Hidden for installments */}
                {paymentPlan !== 'installment' && (
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Discount</label>
                    
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
                      placeholder={discountType === 'percentage' ? 'Enter %' : 'Enter amount'}
                      min="0"
                      max={discountType === 'percentage' ? '100' : undefined}
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                )}

                {/* Payment Plan Selection with automatic customer type selection */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Payment Plan</label>
                  <button
                    onClick={() => {
                      const newPlan = paymentPlan === 'full' ? 'installment' : 'full';
                      setPaymentPlan(newPlan);

                      // Auto-select customer type for installments and reset discount
                      if (newPlan === 'installment') {
                        setCustomerType('customer');
                        setDiscountValue(0); // Reset discount for installments
                        setCustomDownpayment(0); // Reset custom downpayment
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
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {paymentPlan === 'full' ? 'Switch to Installment Payment' : 'Switch to Full Payment'}
                  </button>

                  {/* Updated Installment Configuration */}
                  {paymentPlan === 'installment' && (
                    <div style={{
                      background: '#fff7ed',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #fed7aa',
                      marginTop: '12px'
                    }}>
                      {/* Month Selection */}
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
                                setCustomDownpayment(0); // Reset custom downpayment when changing months
                              }}
                              style={{
                                padding: '8px 4px',
                                borderRadius: '6px',
                                border: 'none',
                                background: installmentDetails.months === month ? '#f59e0b' : '#fef3c7',
                                color: installmentDetails.months === month ? 'white' : '#92400e',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {month} mo{month === 3 ? ' (0% Interest)' : ''}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interest Rate Input - Hidden for 3 months */}
                      {installmentDetails.months !== 3 && (
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#92400e' }}>
                            Interest Rate %
                          </label>
                          <input
                            type="number"
                            value={installmentDetails.interestRate}
                            onChange={(e) => setInstallmentDetails(prev => ({
                              ...prev,
                              interestRate: Math.max(0, Math.min(50, parseFloat(e.target.value) || 0))
                            }))}
                            placeholder="0"
                            min="0"
                            max="50"
                            step="0.5"
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #fed7aa',
                              borderRadius: '6px',
                              fontSize: '13px',
                              background: '#fefbf6'
                            }}
                          />
                        </div>
                      )}

                      {/* Custom Downpayment Input */}
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#92400e' }}>
                          Downpayment Amount (Minimum 20%: ₱{(calculateTotal() * 0.2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                        </label>
                        <input
                          type="number"
                          value={customDownpayment || ''} // Use raw number value, not formatted
                          onChange={(e) => {
                            const inputValue = e.target.value;

                            // Allow empty input
                            if (inputValue === '') {
                              setCustomDownpayment('');
                              return;
                            }

                            const numValue = parseFloat(inputValue);

                            // Allow any valid number input
                            if (!isNaN(numValue) && numValue >= 0) {
                              setCustomDownpayment(numValue);
                            }
                          }}
                          onBlur={(e) => {
                            // Apply validation only when user finishes input
                            const value = parseFloat(e.target.value) || 0;
                            const total = calculateTotal();
                            const minimum = total * 0.2;

                            if (value > 0 && value < minimum) {
                              setCustomDownpayment(minimum);
                            } else if (value > total) {
                              setCustomDownpayment(total);
                            } else if (value === 0 || e.target.value === '') {
                              setCustomDownpayment(minimum); // Set to minimum if empty
                            }
                          }}
                          placeholder={`Minimum: ₱${(calculateTotal() * 0.2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                          min={calculateTotal() * 0.2}
                          max={calculateTotal()}
                          step="100"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #fed7aa',
                            borderRadius: '6px',
                            fontSize: '13px',
                            background: '#fefbf6'
                          }}
                        />
                        {/* Optional: Display formatted value below input */}
                        {customDownpayment > 0 && (
                          <div style={{ fontSize: '12px', color: '#92400e', marginTop: '4px', fontWeight: '500' }}>
                            Downpayment Amount: {new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(customDownpayment)}
                          </div>
                        )}
                      </div>

                      {/* Payment Breakdown */}
                      <div style={{
                        background: '#fefbf6',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #fde68a'
                      }}>
                        <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#78350f' }}>Downpayment Today:</span>
                            <span style={{ fontWeight: '600', color: '#92400e' }}>₱{calculateDownpayment().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#78350f' }}>Remaining Balance:</span>
                            <span style={{ fontWeight: '600', color: '#92400e' }}>₱{(calculateTotal() - calculateDownpayment()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#78350f' }}>Monthly Payment:</span>
                            <span style={{ fontWeight: '600', color: '#92400e' }}>₱{installmentDetails.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#78350f' }}>Payment Duration:</span>
                            <span style={{ fontWeight: '600', color: '#92400e' }}>{installmentDetails.months} months</span>
                          </div>

                          {installmentDetails.months !== 3 && (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ color: '#78350f' }}>Interest Rate:</span>
                                <span style={{ fontWeight: '600', color: '#92400e' }}>{installmentDetails.interestRate}%</span>
                              </div>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingTop: '6px',
                                borderTop: '1px solid #fde68a',
                                marginTop: '6px'
                              }}>
                                <span style={{ color: '#78350f', fontWeight: '500' }}>Total with Interest:</span>
                                <span style={{ fontWeight: '700', color: '#dc2626' }}>₱{installmentDetails.totalWithInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#78350f' }}>
                                <span>Interest Amount:</span>
                                <span>₱{(installmentDetails.totalWithInterest - calculateTotal()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Payment Schedule Preview */}
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #fde68a' }}>
                          <div style={{ fontSize: '11px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                            Payment Schedule (First payment due {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}):
                          </div>
                          <div style={{ fontSize: '10px', color: '#78350f', maxHeight: '60px', overflowY: 'auto' }}>
                            {generatePaymentDates().map((date, index) => (
                              <div key={index} style={{ marginBottom: '1px' }}>
                                Payment #{index + 1}: {date} - ₱{installmentDetails.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        fontSize: '11px',
                        color: '#78350f',
                        fontStyle: 'italic',
                        marginTop: '8px',
                        textAlign: 'center'
                      }}>
                        {installmentDetails.months === 3
                          ? `No interest for 3-month plan. Pay ₱${installmentDetails.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} monthly for ${installmentDetails.months} months`
                          : `Customer pays downpayment today, then ₱${installmentDetails.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} monthly for ${installmentDetails.months} months with ${installmentDetails.interestRate}% annual interest`
                        }
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div style={{
                  marginBottom: '16px',
                  opacity: (!customerType || (customerType === 'customer' && !selectedCustomer)) ? 0.5 : 1,
                  pointerEvents: (!customerType || (customerType === 'customer' && !selectedCustomer)) ? 'none' : 'auto'
                }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    color: '#374151'
                  }}>
                    Payment Method
                    {(!customerType || (customerType === 'customer' && !selectedCustomer)) && (
                      <span style={{ color: '#9ca3af', fontSize: '12px', marginLeft: '8px' }}>
                        (Complete customer selection first)
                      </span>
                    )}
                  </label>
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

                {/* Totals */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Subtotal:</span>
                    <span>₱{parseFloat(calculateSubtotal()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#ef4444' }}>
                    <span>Discount:</span>
                    <span>₱{parseFloat(calculateDiscount()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                    <span>Total:</span>
                    <span style={{ color: '#7c3aed' }}>₱{parseFloat(calculateTotal()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  {/* Payment Summary */}
                  <div style={{
                    background: paymentPlan === 'installment' ? '#fff7ed' : '#f0fdf4',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: paymentPlan === 'installment' ? '1px solid #fed7aa' : '1px solid #bbf7d0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                      <span>Amount Due Today:</span>
                      <span style={{ color: paymentPlan === 'installment' ? '#f59e0b' : '#10b981' }}>
                        ₱{(paymentPlan === 'full'
                          ? calculateTotal()
                          : calculateDownpayment()
                        ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {paymentPlan === 'installment' && (
                      <>
                        <div style={{ fontSize: '12px', color: '#78350f', marginBottom: '4px' }}>
                          Monthly: ₱{installmentDetails.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × {installmentDetails.months} months
                        </div>
                        <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>
                          Balance: ₱{(calculateTotal() - calculateDownpayment()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Process Button */}
                <button
                  onClick={proceedPurchase}
                  disabled={cart.length === 0 || !customerType || (customerType === 'customer' && !selectedCustomer)}
                  style={{
                    width: '100%',
                    marginTop: '24px',
                    background: (cart.length === 0 || !customerType || (customerType === 'customer' && !selectedCustomer)) ? '#d1d5db' : '#7c3aed',
                    color: 'white',
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: (cart.length === 0 || !customerType || (customerType === 'customer' && !selectedCustomer)) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.background = '#6d28d9';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.background = '#7c3aed';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {paymentPlan === 'full' ?
                    'Process Full Payment' :
                    `Collect Downpayment (₱${calculateDownpayment().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes focusPulse {
          0% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); }
          100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
        }
        @keyframes focusPulseGreen {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .pulse-focus {
          animation: focusPulse 2s infinite;
        }
        .pulse-focus-green {
          animation: focusPulseGreen 2s infinite;
        }
      `}</style>
    </>
  );
}