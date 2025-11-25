'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import CustomPagination from '@/app/Components/Pagination/pagination';

// Note: useEffect is already imported above and will be used by the CustomizeManagementModal component

export default function CombinedSalePage() {
  const [user_id, setUser_id] = useState('');
  const [location_id, setLocation_id] = useState('');
  const [location_Name, setLocation_Name] = useState('');

  const [requestTo, setRequestTo] = useState('');




  // Mode selection: 'inventory' or 'custom'
  const [saleMode, setSaleMode] = useState('inventory');

  useEffect(() => {
    setUser_id(sessionStorage.getItem("user_id"));
    setLocation_id(sessionStorage.getItem("location_id"));
    setLocation_Name(sessionStorage.getItem("location_name"));
    GetInventory();
    GetCustomer();
    GetProduct();
    GetLocation();
    GetInstallmentD(); // Fetch installment details for payment functionality
  }, []);

  const [locationList, setLocationList] = useState([]);
  const GetLocation = async () => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'location.php';

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
    }
  };

  // Change location function
  const changeLocation = async (newLocation) => {
    if (!newLocation || !newLocation.location_id) {
      showAlertError({
        icon: "error",
        title: "Invalid Location!",
        text: 'Please select a valid location.',
        button: 'Okay'
      });
      return;
    }

    // Check if cart is empty before changing location
    if (cart.length > 0) {
      showAlertError({
        icon: "warning",
        title: "Cart Not Empty!",
        text: 'Please clear the cart before changing location.',
        button: 'Okay'
      });
      return;
    }

    try {
      // Update sessionStorage
      sessionStorage.setItem('location_id', newLocation.location_id);
      sessionStorage.setItem('location_name', newLocation.location_name);

      // Update state
      setLocation_id(newLocation.location_id);
      setLocation_Name(newLocation.location_name);

      // Refresh data for new location
      GetInventory();
      GetCustomer();
      GetProduct();
      
      // Close modal
      setShowLocationChangeModal(false);

      // Show success message
      AlertSucces(
        `Location changed to ${newLocation.location_name}`,
        "success",
        true,
        'Okay'
      );

      // Log activity
      const accountID = parseInt(sessionStorage.getItem('user_id'));
      const activity = `Changed location to ${newLocation.location_name}`;
      Logs(accountID, activity);

    } catch (error) {
      console.error("Error changing location:", error);
      showAlertError({
        icon: "error",
        title: "Error!",
        text: 'Failed to change location. Please try again.',
        button: 'Okay'
      });
    }
  };

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

  // All products for customization
  const [allProducts, setAllProducts] = useState([]);
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

      setAllProducts(response.data);
    } catch (error) {
      console.error("Error fetching product list:", error);
    }
  };

  // Inventory products
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerType, setCustomerType] = useState('customer'); // Default to customer, all sales require a customer
  const [customerMode, setCustomerMode] = useState('old'); // 'old' or 'new'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  
  // New customer form fields
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  
  // Validation states for real-time feedback
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [mainPOSCashAmount, setMainPOSCashAmount] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);

  // Payment plan states
  const [paymentPlan, setPaymentPlan] = useState('full');
  const [installmentDetails, setInstallmentDetails] = useState({
    months: 3,
    interestRate: 0,
    monthlyPayment: 0,
    totalWithInterest: 0
  });
  const [downpaymentAmount, setDownpaymentAmount] = useState(0);
  const [customDownpayment, setCustomDownpayment] = useState('');

  // Partial payment states
  const [partialPaymentAmount, setPartialPaymentAmount] = useState('');
  const [usePartialPayment, setUsePartialPayment] = useState(false);

  // Delivery states
  const [needsDelivery, setNeedsDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Customization states
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [customizationType, setCustomizationType] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Installment Payment states
  const [showInstallmentPaymentModal, setShowInstallmentPaymentModal] = useState(false);
  const [installmentList, setInstallmentList] = useState([]);
  const [installmentDList, setInstallmentDList] = useState([]);
  const [selectedInstallmentForPayment, setSelectedInstallmentForPayment] = useState(null);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [payAllUnpaid, setPayAllUnpaid] = useState(false);
  const [manualAdjustment, setManualAdjustment] = useState(false);
  const [adjustedAmount, setAdjustedAmount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [editingCartItem, setEditingCartItem] = useState(null);

  // Customization Management Modal
  const [showCustomizeManagementModal, setShowCustomizeManagementModal] = useState(false);
  const [customization, setCustomization] = useState({
    product_name: '',
    description: '',
    modifications: '',
    price: 0,
    quantity: 1,
    isCustom: false
  });

  // Exchange Modal States
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeSelectedCustomer, setExchangeSelectedCustomer] = useState(null);
  const [exchangeCustomerSearchTerm, setExchangeCustomerSearchTerm] = useState('');
  const [customerTransactions, setCustomerTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedOldItem, setSelectedOldItem] = useState(null);
  const [selectedNewItem, setSelectedNewItem] = useState(null);
  const [exchangeQuantity, setExchangeQuantity] = useState(1);
  const [exchangeSearchTerm, setExchangeSearchTerm] = useState('');
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Location Change Modal States
  const [showLocationChangeModal, setShowLocationChangeModal] = useState(false);

  // Cart highlight effect
  const [highlightCart, setHighlightCart] = useState(false);
  const cartRef = React.useRef(null);
  
  // Refs for form fields
  const customerSearchRef = React.useRef(null);
  const newCustomerNameRef = React.useRef(null);
  const newCustomerEmailRef = React.useRef(null);
  const newCustomerPhoneRef = React.useRef(null);
  const newCustomerAddressRef = React.useRef(null);
  const deliveryAddressRef = React.useRef(null);
  const warehouseSelectRef = React.useRef(null);
  const partialPaymentRef = React.useRef(null);

  // Function to scroll and highlight cart
  const focusOnCart = () => {
    if (cartRef.current) {
      cartRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHighlightCart(true);
      setTimeout(() => setHighlightCart(false), 1000); // Remove highlight after 1 second
    }
  };

  // Function to scroll to and focus on a field
  const scrollToField = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        if (ref.current) {
          ref.current.focus();
          // Add a temporary highlight effect
          const originalBorder = ref.current.style.border;
          ref.current.style.border = '2px solid #7c3aed';
          setTimeout(() => {
            if (ref.current) {
              ref.current.style.border = originalBorder;
            }
          }, 2000);
        }
      }, 500);
    }
  };

  // Check if sale can be processed
  const canProcessSale = () => {
    // For old customer mode, need selectedCustomer
    // For new customer mode, need all fields filled and validated
    const hasCustomer = customerMode === 'old' 
      ? selectedCustomer !== null
      : (newCustomerName.trim() && 
         newCustomerEmail.trim() && 
         validateEmailFormat(newCustomerEmail).valid &&
         newCustomerPhone.trim() && 
         validatePhoneNumber(newCustomerPhone).valid &&
         newCustomerAddress.trim() &&
         !customerList.some(c => c.cust_name.toLowerCase().trim() === newCustomerName.toLowerCase().trim()) &&
         !customerList.some(c => c.email.toLowerCase().trim() === newCustomerEmail.toLowerCase().trim()) &&
         !emailError && !phoneError);

    const checks = {
      hasItems: cart.length > 0,
      hasCustomer: hasCustomer, // All sales require a customer (old or new)
      hasValidPartialPayment: paymentPlan === 'full' && usePartialPayment 
        ? (partialPaymentAmount >= calculateMinimumPartialPayment())
        : true,
      hasDeliveryAddress: needsDelivery ? deliveryAddress.trim() !== '' : true,
      hasWarehouse: saleMode === 'custom' ? requestTo !== '' : true
    };
    return checks;
  };

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
        store_inventory_id: item.store_inventory_id,
        product_preview_image: item.product_preview_image || '/uploads/products/defualt.jpg'
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

  // Installment Payment Functions
  const GetInstallmentD = async () => {
    try {
      const baseURL = sessionStorage.getItem('baseURL');
      const response = await axios.get(`${baseURL}installment.php`, {
        params: {
          json: JSON.stringify([]),
          operation: "GetInstallmentD1"
        }
      });
      
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

  const GetInstallment = async (custId) => {
    if (!custId) return;
    try {
      const baseURL = sessionStorage.getItem('baseURL');
      const locationID = sessionStorage.getItem('location_id');
      const response = await axios.get(`${baseURL}installment.php`, {
        params: {
          json: JSON.stringify({ locID: locationID, custID: custId }),
          operation: "GetInstallment"
        }
      });
      
      if (Array.isArray(response.data)) {
        setInstallmentList(response.data);
      } else {
        setInstallmentList([]);
      }
    } catch (error) {
      console.error("Error fetching installments:", error);
      setInstallmentList([]);
    }
  };

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
        graceDaysLeft = 2 - daysDifference;
        const graceDayNumber = daysDifference + 1;
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

  const openInstallmentPaymentModal = () => {
    setShowInstallmentPaymentModal(true);
  };

  const handleInstallmentSelection = (installment) => {
    setSelectedInstallmentForPayment(installment);
    setPaymentAmount('');
    setCashAmount('');
    // Filter installment details to only those for the selected customer's installments
    const customerInstallmentIds = installmentList.filter(inst => 
      inst.cust_id === selectedCustomer?.cust_id
    ).map(inst => inst.installment_sales_id);
    
    const customerInstallmentDetails = installmentDList.filter(detail =>
      customerInstallmentIds.includes(detail.installment_id)
    );

    const installmentSchedules = customerInstallmentDetails.filter(schedule =>
      schedule.installment_id === installment.installment_sales_id
    );

    const today = new Date();
    const unpaidPayments = installmentSchedules
      .filter(payment => payment.status !== 'Paid')
      .map(payment => calculateOverduePenalty(payment))
      .sort((a, b) => parseInt(a.payment_number) - parseInt(b.payment_number));

    // Always require all overdue payments
    const overduePayments = unpaidPayments.filter(payment => payment.days_overdue >= 3);
    
    // If there are overdue payments, require all of them
    // Otherwise, require at least the next due payment
    if (overduePayments.length > 0) {
      // All overdue payments are required
      setSelectedPayments(overduePayments.map(p => p.ips_id));
    } else if (unpaidPayments.length > 0) {
      // At least the next payment is required
      setSelectedPayments([unpaidPayments[0].ips_id]);
    } else {
      setSelectedPayments([]);
    }
  };

  const handlePaymentSelection = (ipsId) => {
    // Filter installment details to only those for the selected customer's installments
    const customerInstallmentIds = installmentList.filter(inst => 
      inst.cust_id === selectedCustomer?.cust_id
    ).map(inst => inst.installment_sales_id);
    
    const customerInstallmentDetails = installmentDList.filter(detail =>
      customerInstallmentIds.includes(detail.installment_id)
    );
    
    const installmentSchedules = customerInstallmentDetails.filter(schedule =>
      schedule.installment_id === selectedInstallmentForPayment.installment_sales_id
    );

    const today = new Date();
    const unpaidPayments = installmentSchedules
      .filter(payment => payment.status !== 'Paid')
      .map(payment => calculateOverduePenalty(payment))
      .sort((a, b) => parseInt(a.payment_number) - parseInt(b.payment_number));

    const overduePayments = unpaidPayments.filter(payment => payment.days_overdue >= 3);

    if (payAllUnpaid) {
      setPayAllUnpaid(false);
    }

    const payment = unpaidPayments.find(p => p.ips_id === ipsId);
    if (!payment) return; // Safety check
    
    const paymentNumber = parseInt(payment.payment_number);

    setSelectedPayments(prev => {
      // Check if payment is already selected
      const isCurrentlySelected = prev.includes(ipsId);
      
      if (isCurrentlySelected) {
        // Unchecking: Remove this payment and all payments after it
        const updatedSelections = prev.filter(id => {
          const p = unpaidPayments.find(payment => payment.ips_id === id);
          if (!p) return false; // Safety check
          return parseInt(p.payment_number) < paymentNumber;
        });
        return updatedSelections;
      } else {
        // Checking: Add this payment and ensure all overdue payments and payments before this are selected
        const newSelections = [...prev];

        // Always include all overdue payments
        overduePayments.forEach(overduePayment => {
          if (!newSelections.includes(overduePayment.ips_id)) {
            newSelections.push(overduePayment.ips_id);
          }
        });

        // Fill in all payments up to and including the selected payment number
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

    // Filter installment details to only those for the selected customer's installments
    const customerInstallmentIds = installmentList.filter(inst => 
      inst.cust_id === selectedCustomer?.cust_id
    ).map(inst => inst.installment_sales_id);
    
    const customerInstallmentDetails = installmentDList.filter(detail =>
      customerInstallmentIds.includes(detail.installment_id)
    );

    const installmentSchedules = customerInstallmentDetails.filter(schedule =>
      schedule.installment_id === selectedInstallmentForPayment.installment_sales_id
    );

    const today = new Date();
    const unpaidPayments = installmentSchedules
      .filter(p => p.status !== 'Paid')
      .map(p => calculateOverduePenalty(p))
      .sort((a, b) => parseInt(a.payment_number) - parseInt(b.payment_number));

    const overduePayments = unpaidPayments.filter(p => p.days_overdue >= 3);

    const allOverdueSelected = overduePayments.every(overduePayment =>
      selectedPayments.includes(overduePayment.ips_id)
    );

    if (overduePayments.length > 0 && !allOverdueSelected) {
      return payment.days_overdue >= 3;
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

  const RecordInstallmentPayment = async () => {
    try {
      const baseURL = sessionStorage.getItem('baseURL');
      const accountID = parseInt(sessionStorage.getItem('user_id'));
      const locationID = parseInt(sessionStorage.getItem('location_id'));
      const locName = sessionStorage.getItem('location_name');

      if (!accountID || isNaN(accountID)) {
        showAlertError({
          icon: "error",
          title: "Invalid Session!",
          text: 'User session is invalid. Please log in again.',
          button: 'OK'
        });
        return;
      }

      if (!locationID || isNaN(locationID)) {
        showAlertError({
          icon: "error",
          title: "Location Missing!",
          text: 'Location information is missing. Please log in again.',
          button: 'OK'
        });
        return;
      }

      // Filter installment details to only those for the selected customer's installments
      const customerInstallmentIds = installmentList.filter(inst => 
        inst.cust_id === selectedCustomer?.cust_id
      ).map(inst => inst.installment_sales_id);
      
      const customerInstallmentDetails = installmentDList.filter(detail =>
        customerInstallmentIds.includes(detail.installment_id)
      );

      const customerInstallmentSchedules = customerInstallmentDetails.filter(schedule =>
        schedule.installment_id === selectedInstallmentForPayment.installment_sales_id
      );

      const unpaidPayments = customerInstallmentSchedules
        .filter(payment => payment.status !== 'Paid')
        .map(payment => calculateOverduePenalty(payment))
        .sort((a, b) => parseInt(a.payment_number) - parseInt(b.payment_number));

      // Calculate required payments (overdue + next due)
      const overduePayments = unpaidPayments.filter(payment => payment.days_overdue >= 3);
      const requiredPayments = overduePayments.length > 0 
        ? overduePayments 
        : (unpaidPayments.length > 0 ? [unpaidPayments[0]] : []);
      
      const selectedPaymentsList = requiredPayments;
      const totalAmountDue = selectedPaymentsList.reduce((sum, payment) => sum + payment.total_amount, 0);
      const enteredAmount = parseFloat(paymentAmount) || 0;

      // Validate payment amount
      if (!paymentAmount || enteredAmount <= 0) {
        showAlertError({
          icon: "error",
          title: "Payment Amount Required!",
          text: 'Please enter the payment amount.',
          button: 'OK'
        });
        return;
      }

      if (enteredAmount < totalAmountDue) {
        showAlertError({
          icon: "error",
          title: "Insufficient Amount!",
          text: `Payment amount (${formatCurrency(enteredAmount)}) is less than the required amount (${formatCurrency(totalAmountDue)}).`,
          button: 'OK'
        });
        return;
      }

      // Validate cash amount
      if (!cashAmount || cashAmountNum <= 0) {
        showAlertError({
          icon: "error",
          title: "Cash Amount Required!",
          text: 'Please enter the cash amount received.',
          button: 'OK'
        });
        return;
      }

      if (cashAmountNum < enteredAmount) {
        showAlertError({
          icon: "error",
          title: "Insufficient Cash!",
          text: `Cash received (${formatCurrency(cashAmountNum)}) is less than the payment amount (${formatCurrency(enteredAmount)}).`,
          button: 'OK'
        });
        return;
      }

      let paymentsToRecord = [];
      let excessAmount = enteredAmount - totalAmountDue;

      // Handle excess payment - credit to next payment if available
      if (excessAmount > 0) {
        // Find the next unpaid payment (lowest payment number that's not in selectedPaymentsList)
        const maxSelectedPaymentNumber = selectedPaymentsList.length > 0
          ? Math.max(...selectedPaymentsList.map(p => parseInt(p.payment_number)))
          : 0;
        
        const nextPayment = unpaidPayments.find(p => 
          parseInt(p.payment_number) > maxSelectedPaymentNumber
        );

        if (nextPayment) {
          // Apply excess to next payment as a PARTIAL payment only
          // Always leave at least 0.01 remaining to ensure it's treated as partial/unpaid
          // This prevents the next payment from being marked as fully paid
          const maxPartialCredit = nextPayment.total_amount - 0.01; // Leave at least 0.01 unpaid
          const amountToCreditNextPayment = Math.min(excessAmount, maxPartialCredit);
          
          // Only credit if there's a meaningful amount to credit (at least 0.01)
          if (amountToCreditNextPayment >= 0.01) {
            paymentsToRecord = [
              // Record selected payments with their full amounts
              ...selectedPaymentsList.map(payment => ({
                ips_id: payment.ips_id,
                amount: payment.total_amount
              })),
              // Record next payment with PARTIAL excess amount credited (never full amount)
              {
                ips_id: nextPayment.ips_id,
                amount: amountToCreditNextPayment
              }
            ];
            
            excessAmount = enteredAmount - totalAmountDue - amountToCreditNextPayment;
            
            // If there's still excess after crediting, inform the user
            if (excessAmount > 0) {
              showAlertError({
                icon: "info",
                title: "Partial Credit Applied",
                text: `Excess payment of ${formatCurrency(amountToCreditNextPayment)} has been credited to Payment #${nextPayment.payment_number}. Remaining excess: ${formatCurrency(excessAmount)}.`,
                button: 'OK'
              });
            }
          } else {
            // Excess is too small to credit meaningfully
            paymentsToRecord = selectedPaymentsList.map(payment => ({
              ips_id: payment.ips_id,
              amount: payment.total_amount
            }));
            
            // Warn about excess
            if (excessAmount >= nextPayment.total_amount) {
              showAlertError({
                icon: "info",
                title: "Excess Payment Notice",
                text: `Your excess payment (${formatCurrency(excessAmount)}) would fully pay the next payment (${formatCurrency(nextPayment.total_amount)}). To avoid marking it as paid, only partial credits are allowed. Please process the next payment separately.`,
                button: 'OK'
              });
            }
          }
        } else {
          // No next payment available, just record selected payments
          paymentsToRecord = selectedPaymentsList.map(payment => ({
            ips_id: payment.ips_id,
            amount: payment.total_amount
          }));
          
          // Warn about excess but still proceed
          if (excessAmount > 0) {
            showAlertError({
              icon: "warning",
              title: "Excess Payment!",
              text: `Payment amount exceeds required amount by ${formatCurrency(excessAmount)}. No next payment found to credit the excess.`,
              button: 'OK'
            });
          }
        }
      } else {
        // Exact amount - record selected payments
        paymentsToRecord = selectedPaymentsList.map(payment => ({
          ips_id: payment.ips_id,
          amount: payment.total_amount
        }));
      }

      // Handle manual adjustment override
      if (manualAdjustment && adjustedAmount) {
        const totalAdjusted = parseFloat(adjustedAmount);
        const numberOfPayments = selectedPaymentsList.length;
        const amountPerPayment = totalAdjusted / numberOfPayments;
        
        paymentsToRecord = selectedPaymentsList.map(payment => ({
          ips_id: payment.ips_id,
          amount: amountPerPayment
        }));
        
        excessAmount = 0; // Manual adjustment doesn't allow excess
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
        // Calculate total amount actually recorded (may include next payment if excess was applied)
        const recordedTotal = paymentsToRecord.reduce((sum, p) => sum + p.amount, 0);

        // Get payment details for receipt
        const paymentDetailsForReceipt = paymentsToRecord.map(record => {
          const payment = customerInstallmentSchedules.find(p => p.ips_id === record.ips_id);
          if (payment) {
            const processed = calculateOverduePenalty(payment);
            return {
              ...processed,
              amount_paid: record.amount // Actual amount paid (may differ from total_amount if excess credited)
            };
          }
          return null;
        }).filter(Boolean);

        const transaction = {
          receipt_id: response.data,
          customer: selectedInstallmentForPayment,
          payments: paymentDetailsForReceipt,
          total_amount: enteredAmount,
          amount_applied: recordedTotal,
          excess_amount: excessAmount > 0 && paymentsToRecord.length > selectedPaymentsList.length ? excessAmount : 0,
          payment_method: 'cash',
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          location: locName || 'Store',
          recorded_by: sessionStorage.getItem('user_name') || 'Staff',
          wasAdjusted: manualAdjustment,
          payment_type: 'Installment Payment'
        };

        setLastTransaction(transaction);
        setShowReceipt(true);
        
        // Refresh data
        GetInstallmentD();
        GetInstallment(selectedCustomer.cust_id);
        
        // Reset modal
        setShowInstallmentPaymentModal(false);
        setSelectedInstallmentForPayment(null);
        setSelectedPayments([]);
        setPayAllUnpaid(false);
        setManualAdjustment(false);
        setAdjustedAmount('');
        setPaymentAmount('');
        setCashAmount('');

        Logs(accountID, `Recorded installment payment for ${selectedInstallmentForPayment.cust_name}`);
      } else {
        showAlertError({
          icon: "error",
          title: "Payment Failed!",
          text: 'Error recording payment: ' + response.data,
          button: 'OK'
        });
      }
    } catch (error) {
      console.error("Error recording payment:", error);
      showAlertError({
        icon: "error",
        title: "Payment Error!",
        text: 'Error recording payment: ' + error.message,
        button: 'OK'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Fetch customer transactions for exchange
  const GetCustomerTransactions = async (customerId) => {
    if (!customerId) {
      showAlertError({
        icon: "error",
        title: "Customer Required!",
        text: 'Please select a customer first.',
        button: 'Okay'
      });
      return;
    }

    setLoadingTransactions(true);
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'sales.php';

    try {
      // Try GetCustomerTransactions first (should return customer_sales with items from customer_sales_details)
      let response = await axios.get(url, {
        params: {
          json: JSON.stringify({ cust_id: customerId }),
          operation: "GetCustomerTransactions"
        }
      });

      console.log("GetCustomerTransactions response:", response.data);

      // If that doesn't work, try GetCustomerSales
      if (!response.data || (Array.isArray(response.data) && response.data.length === 0) || response.data === null || response.data === "") {
        console.log("Trying GetCustomerSales...");
        response = await axios.get(url, {
          params: {
            json: JSON.stringify({ cust_id: customerId }),
            operation: "GetCustomerSales"
          }
        });
        console.log("GetCustomerSales response:", response.data);
      }

      // Process the response data
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Check if items are already included in the response
        const hasItems = response.data[0].items || response.data[0].details || response.data[0].customer_sales_details;
        
        if (hasItems) {
          // Items are already included, format them
          const transactions = response.data.map(transaction => {
            // Handle different possible item field names
            const items = transaction.items || transaction.details || transaction.customer_sales_details || [];
            
            return {
              invoice_id: transaction.invoice_id,
              customer_sales_id: transaction.customer_sales_id,
              date: transaction.date || transaction.sale_date || transaction.created_at || new Date().toLocaleDateString(),
              total: transaction.final_total_amount || transaction.total_amount || transaction.total,
              discount: transaction.discount || 0,
              payment_method: transaction.payment_method || 'cash',
              payment_status: transaction.payment_status || 'Paid',
              items: Array.isArray(items) ? items.map(item => ({
                product_id: item.product_id,
                product_name: item.product_name || item.description || '',
                description: item.description || item.product_name || '',
                price: parseFloat(item.price_per_qty || item.price || 0),
                quantity: parseInt(item.qty || item.quantity || 1),
                total_price: parseFloat(item.total_price || (item.price_per_qty * item.qty) || 0)
              })) : []
            };
          });
          
          setCustomerTransactions(transactions);
        } else {
          // Items are not included, fetch them separately using customer_sales_id
          const transactionsWithItems = await Promise.all(
            response.data.map(async (transaction) => {
              try {
                // Try to get items by customer_sales_id
                const itemsResponse = await axios.get(url, {
                  params: {
                    json: JSON.stringify({ 
                      customer_sales_id: transaction.customer_sales_id || transaction.c_sale_id 
                    }),
                    operation: "GetCustomerSalesDetails"
                  }
                });
                
                console.log(`Items for customer_sales_id ${transaction.customer_sales_id}:`, itemsResponse.data);
                
                // If that doesn't work, try by invoice_id
                let items = [];
                if (itemsResponse.data && Array.isArray(itemsResponse.data) && itemsResponse.data.length > 0) {
                  items = itemsResponse.data;
                } else {
                  const invoiceItemsResponse = await axios.get(url, {
                    params: {
                      json: JSON.stringify({ invoice_id: transaction.invoice_id }),
                      operation: "GetSalesItems"
                    }
                  });
                  
                  if (invoiceItemsResponse.data && Array.isArray(invoiceItemsResponse.data)) {
                    items = invoiceItemsResponse.data;
                  }
                }
                
                return {
                  invoice_id: transaction.invoice_id,
                  customer_sales_id: transaction.customer_sales_id,
                  date: transaction.date || transaction.sale_date || transaction.created_at || new Date().toLocaleDateString(),
                  total: transaction.final_total_amount || transaction.total_amount || transaction.total,
                  discount: transaction.discount || 0,
                  payment_method: transaction.payment_method || 'cash',
                  payment_status: transaction.payment_status || 'Paid',
                  items: items.map(item => ({
                    product_id: item.product_id,
                    product_name: item.product_name || item.description || '',
                    description: item.description || item.product_name || '',
                    price: parseFloat(item.price_per_qty || item.price || 0),
                    quantity: parseInt(item.qty || item.quantity || 1),
                    total_price: parseFloat(item.total_price || (item.price_per_qty * item.qty) || 0)
                  }))
                };
              } catch (itemError) {
                console.error(`Error fetching items for customer_sales_id ${transaction.customer_sales_id}:`, itemError);
                return {
                  invoice_id: transaction.invoice_id,
                  customer_sales_id: transaction.customer_sales_id,
                  date: transaction.date || transaction.sale_date || transaction.created_at || new Date().toLocaleDateString(),
                  total: transaction.final_total_amount || transaction.total_amount || transaction.total,
                  discount: transaction.discount || 0,
                  payment_method: transaction.payment_method || 'cash',
                  payment_status: transaction.payment_status || 'Paid',
                  items: []
                };
              }
            })
          );
          
          setCustomerTransactions(transactionsWithItems);
        }
      } else {
        console.log("No transactions found. Response data:", response.data);
        setCustomerTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching customer transactions:", error);
      console.error("Error details:", error.response?.data || error.message);
      showAlertError({
        icon: "error",
        title: "Error!",
        text: `Failed to fetch customer transactions: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        button: 'Okay'
      });
      setCustomerTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Open exchange modal
  const openExchangeModal = () => {
    setShowExchangeModal(true);
    setExchangeSelectedCustomer(null);
    setExchangeCustomerSearchTerm('');
    setSelectedTransaction(null);
    setSelectedOldItem(null);
    setSelectedNewItem(null);
    setExchangeQuantity(1);
    setExchangeSearchTerm('');
    setCustomerTransactions([]);
  };

  // Handle customer selection in exchange modal
  const handleExchangeCustomerSelect = (customer) => {
    setExchangeSelectedCustomer(customer);
    setSelectedTransaction(null);
    setSelectedOldItem(null);
    setSelectedNewItem(null);
    setExchangeQuantity(1);
    setExchangeSearchTerm('');
    GetCustomerTransactions(customer.cust_id);
  };

  // Calculate exchange difference
  const calculateExchangeDifference = () => {
    if (!selectedOldItem || !selectedNewItem) return 0;
    const oldTotal = (selectedOldItem.price || 0) * exchangeQuantity;
    const newTotal = (selectedNewItem.price || 0) * exchangeQuantity;
    return newTotal - oldTotal;
  };

  // Process exchange
  const processExchange = async () => {
    if (!exchangeSelectedCustomer) {
      showAlertError({
        icon: "error",
        title: "Customer Required!",
        text: 'Please select a customer first.',
        button: 'Okay'
      });
      return;
    }

    if (!selectedTransaction || !selectedOldItem || !selectedNewItem) {
      showAlertError({
        icon: "error",
        title: "Selection Required!",
        text: 'Please select a transaction, old item, and new item.',
        button: 'Okay'
      });
      return;
    }

    if (exchangeQuantity <= 0 || exchangeQuantity > selectedOldItem.quantity) {
      showAlertError({
        icon: "error",
        title: "Invalid Quantity!",
        text: `Exchange quantity must be between 1 and ${selectedOldItem.quantity}.`,
        button: 'Okay'
      });
      return;
    }

    const difference = calculateExchangeDifference();
    
    // If new item is more expensive, customer must pay
    if (difference > 0) {
      if (paymentMethod === 'cash' && (!mainPOSCashAmount || parseFloat(mainPOSCashAmount) < difference)) {
        showAlertError({
          icon: "error",
          title: "Insufficient Payment!",
          text: `Please pay the difference of ${formatCurrency(difference)}.`,
          button: 'Okay'
        });
        return;
      }
    }

    const accountID = parseInt(sessionStorage.getItem('user_id'));
    const locId = parseInt(sessionStorage.getItem('location_id'));
    const locName = sessionStorage.getItem('location_name');
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'sales.php';

    // Get current inventory for old and new items
    const oldItemInventory = products.find(p => p.product_id === selectedOldItem.product_id);
    const newItemInventory = products.find(p => p.product_id === selectedNewItem.product_id);
    
    // Prepare inventory updates
    const inventoryUpdates = [];
    const inventoryReports = [];
    
    // Add old item back to inventory
    if (oldItemInventory) {
      const oldCurrentStock = inventory[selectedOldItem.product_id] || oldItemInventory.stock || 0;
      const oldNewStock = oldCurrentStock + exchangeQuantity;
      
      inventoryUpdates.push({
        prodID: selectedOldItem.product_id,
        newQty: oldNewStock
      });
      
      inventoryReports.push({
        prodID: selectedOldItem.product_id,
        pastBalance: oldCurrentStock,
        qty: exchangeQuantity,
        currentBalance: oldNewStock
      });
    }
    
    // Deduct new item from inventory
    if (newItemInventory) {
      const newCurrentStock = inventory[selectedNewItem.product_id] || newItemInventory.stock || 0;
      const newNewStock = Math.max(0, newCurrentStock - exchangeQuantity);
      
      // Check if enough stock
      if (newCurrentStock < exchangeQuantity) {
        showAlertError({
          icon: "error",
          title: "Insufficient Stock!",
          text: `Not enough stock for ${selectedNewItem.product_name || selectedNewItem.description}. Available: ${newCurrentStock}, Required: ${exchangeQuantity}`,
          button: 'Okay'
        });
        return;
      }
      
      inventoryUpdates.push({
        prodID: selectedNewItem.product_id,
        newQty: newNewStock
      });
      
      inventoryReports.push({
        prodID: selectedNewItem.product_id,
        pastBalance: newCurrentStock,
        qty: -exchangeQuantity,
        currentBalance: newNewStock
      });
    }

    const exchangeDetails = {
      invoice_id: selectedTransaction.invoice_id,
      customer_sales_id: selectedTransaction.customer_sales_id,
      old_item: {
        product_id: selectedOldItem.product_id,
        quantity: exchangeQuantity,
        price: selectedOldItem.price,
        total: selectedOldItem.price * exchangeQuantity,
        c_sale_details: selectedOldItem.c_sale_details || null
      },
      new_item: {
        product_id: selectedNewItem.product_id,
        quantity: exchangeQuantity,
        price: selectedNewItem.price,
        total: selectedNewItem.price * exchangeQuantity
      },
      difference: difference,
      customer_id: exchangeSelectedCustomer.cust_id,
      account_id: accountID,
      location_id: locId,
      payment_method: difference > 0 ? paymentMethod : 'exchange',
      cash_amount: difference > 0 ? parseFloat(mainPOSCashAmount) || 0 : 0,
      updateInventory: inventoryUpdates,
      reportInventory: inventoryReports
    };

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(exchangeDetails),
          updateIn: JSON.stringify(inventoryUpdates),
          reportInventory: JSON.stringify(inventoryReports),
          operation: "ProcessExchange"
        }
      });

      if (response.data && response.data.success !== false) {
        AlertSucces(
          `Exchange processed successfully!\nInvoice #${selectedTransaction.invoice_id}`,
          "success",
          true,
          'Okay'
        );

        // Update inventory if needed
        if (saleMode === 'inventory') {
          GetInventory();
        }

        // Reset exchange form
        setShowExchangeModal(false);
        setSelectedTransaction(null);
        setSelectedOldItem(null);
        setSelectedNewItem(null);
        setExchangeQuantity(1);
        setExchangeSearchTerm('');
        setMainPOSCashAmount('');
        
        // Log activity
        const activity = `Processed an exchange for Invoice #${selectedTransaction.invoice_id} at ${locName}`;
        Logs(accountID, activity);
      } else {
        showAlertError({
          icon: "error",
          title: "Exchange Failed!",
          text: response.data?.message || 'Failed to process the exchange.',
          button: 'Try Again'
        });
      }
    } catch (error) {
      console.error("Error processing exchange:", error);
      showAlertError({
        icon: "error",
        title: "Error!",
        text: 'An error occurred while processing the exchange.',
        button: 'Try Again'
      });
    }
  };

  // Get products based on mode
  const getProductsList = () => {
    return saleMode === 'inventory' ? products : allProducts;
  };

  const filteredProducts = getProductsList().filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.color && product.color.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination for products
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to page 1 when search term or mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, saleMode]);

  const filteredCustomers = customerList.filter(customer =>
    customer.cust_name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );


  // Customization functions
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
      if (!customization.description.trim() || customization.price <= 0) {
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
    
    // Focus on cart after adding item
    setTimeout(() => focusOnCart(), 100);
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

  const addToCart = (product) => {
    // For inventory mode, check stock
    if (saleMode === 'inventory') {
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
      
      // Focus on cart after adding item
      setTimeout(() => focusOnCart(), 100);
    } else {
      // For custom mode, directly open customization
      openCustomization('semi', product);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Check stock only for inventory mode and non-custom items
    const item = cart.find(i => i.product_id === productId);
    if (saleMode === 'inventory' && !item?.isCustom && newQuantity > inventory[productId]) {
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
      return 0;
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
      
      // Auto-enable delivery for installment plans
      setNeedsDelivery(true);
    }
  }, [paymentPlan, installmentDetails.months, installmentDetails.interestRate, cart, discountValue, customDownpayment]);

  // Auto-enable delivery for custom sales mode
  useEffect(() => {
    if (saleMode === 'custom') {
      setNeedsDelivery(true);
    }
  }, [saleMode]);

  const showReceiptModal = (transaction) => {
    setLastTransaction(transaction);
    setShowReceipt(true);
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setLastTransaction(null);
  };

  // Validate Philippine phone number
  const validatePhoneNumber = (phone) => {
    if (!phone || !phone.trim()) {
      return { valid: false, error: 'Phone number is required' };
    }

    // Remove all spaces, dashes, and parentheses
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Philippine mobile phone patterns:
    // 09XXXXXXXXX (11 digits, starts with 09)
    // +639XXXXXXXXX (with +63 country code)
    // 639XXXXXXXXX (without + but with 63 country code)
    
    // Check if it starts with +63
    if (cleanPhone.startsWith('+63')) {
      const number = cleanPhone.substring(3); // Remove +63
      if (/^9\d{9}$/.test(number)) {
        return { valid: true, error: '' };
      }
      return { valid: false, error: 'Invalid format. Should be +639XXXXXXXXX' };
    }
    
    // Check if it starts with 63 (without +)
    if (cleanPhone.startsWith('63') && cleanPhone.length === 12) {
      const number = cleanPhone.substring(2); // Remove 63
      if (/^9\d{9}$/.test(number)) {
        return { valid: true, error: '' };
      }
      return { valid: false, error: 'Invalid format. Should be 639XXXXXXXXX' };
    }
    
    // Check if it starts with 09 (11 digits)
    if (/^09\d{9}$/.test(cleanPhone)) {
      return { valid: true, error: '' };
    }
    
    // Check if it's 9XXXXXXXXX (10 digits, starts with 9)
    if (/^9\d{9}$/.test(cleanPhone) && cleanPhone.length === 10) {
      return { valid: true, error: '' };
    }
    
    return { 
      valid: false, 
      error: 'Invalid Philippine phone format. Use: 09XXXXXXXXX, +639XXXXXXXXX, or 639XXXXXXXXX' 
    };
  };

  // Validate email format
  const validateEmailFormat = (email) => {
    if (!email || !email.trim()) {
      return { valid: false, error: 'Email is required' };
    }

    // Enhanced email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email.trim())) {
      return { valid: false, error: 'Invalid email format. Example: name@example.com' };
    }

    // Additional checks
    if (email.trim().length > 254) {
      return { valid: false, error: 'Email address is too long (max 254 characters)' };
    }

    const parts = email.trim().split('@');
    if (parts.length !== 2) {
      return { valid: false, error: 'Invalid email format' };
    }

    const [localPart, domain] = parts;
    if (localPart.length === 0 || localPart.length > 64) {
      return { valid: false, error: 'Email local part is invalid' };
    }

    if (!domain || domain.length === 0 || !domain.includes('.')) {
      return { valid: false, error: 'Email domain is invalid' };
    }

    return { valid: true, error: '' };
  };

  // Real-time email validation
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setNewCustomerEmail(email);
    
    if (!email.trim()) {
      setEmailError('');
      return;
    }

    const emailValidation = validateEmailFormat(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error);
    } else {
      // Check if email already exists
      const emailExists = customerList.some(customer => 
        customer.email.toLowerCase().trim() === email.toLowerCase().trim()
      );
      if (emailExists) {
        setEmailError('A customer with this email already exists');
      } else {
        setEmailError('');
      }
    }
  };

  // Real-time phone validation
  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    setNewCustomerPhone(phone);
    
    if (!phone.trim()) {
      setPhoneError('');
      return;
    }

    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      setPhoneError(phoneValidation.error);
    } else {
      setPhoneError('');
    }
  };

  // Validate new customer data
  const validateNewCustomer = () => {
    if (!newCustomerName.trim()) {
      showAlertError({
        icon: "error",
        title: "Customer Name Required!",
        text: 'Please enter customer name.',
        button: 'Okay'
      });
      scrollToField(newCustomerNameRef);
      return false;
    }

    if (!newCustomerEmail.trim()) {
      showAlertError({
        icon: "error",
        title: "Customer Email Required!",
        text: 'Please enter customer email.',
        button: 'Okay'
      });
      scrollToField(newCustomerEmailRef);
      return false;
    }

    // Validate email format
    const emailValidation = validateEmailFormat(newCustomerEmail);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error);
      showAlertError({
        icon: "error",
        title: "Invalid Email!",
        text: emailValidation.error,
        button: 'Okay'
      });
      scrollToField(newCustomerEmailRef);
      return false;
    }

    // Check if email already exists
    const emailExists = customerList.some(customer => 
      customer.email.toLowerCase().trim() === newCustomerEmail.toLowerCase().trim()
    );
    if (emailExists) {
      setEmailError('A customer with this email already exists');
      showAlertError({
        icon: "error",
        title: "Email Already Exists!",
        text: 'A customer with this email already exists. Please select from existing customers or use a different email.',
        button: 'Okay'
      });
      scrollToField(newCustomerEmailRef);
      return false;
    }

    if (!newCustomerPhone.trim()) {
      showAlertError({
        icon: "error",
        title: "Customer Phone Required!",
        text: 'Please enter customer phone number.',
        button: 'Okay'
      });
      scrollToField(newCustomerPhoneRef);
      return false;
    }

    // Validate phone number format
    const phoneValidation = validatePhoneNumber(newCustomerPhone);
    if (!phoneValidation.valid) {
      setPhoneError(phoneValidation.error);
      showAlertError({
        icon: "error",
        title: "Invalid Phone Number!",
        text: phoneValidation.error,
        button: 'Okay'
      });
      scrollToField(newCustomerPhoneRef);
      return false;
    }

    if (!newCustomerAddress.trim()) {
      showAlertError({
        icon: "error",
        title: "Customer Address Required!",
        text: 'Please enter customer address.',
        button: 'Okay'
      });
      scrollToField(newCustomerAddressRef);
      return false;
    }

    // Check if customer name already exists
    const nameExists = customerList.some(customer => 
      customer.cust_name.toLowerCase().trim() === newCustomerName.toLowerCase().trim()
    );

    if (nameExists) {
      showAlertError({
        icon: "error",
        title: "Customer Already Exists!",
        text: 'A customer with this name already exists. Please select from existing customers or use a different name.',
        button: 'Okay'
      });
      scrollToField(newCustomerNameRef);
      return false;
    }

    return true;
  };

  // Create new customer
  const createNewCustomer = async () => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'customer.php';
    const customerDetails = {
      custName: newCustomerName.trim(),
      custPhone: newCustomerPhone.trim(),
      custEmail: newCustomerEmail.trim(),
      custAddress: newCustomerAddress.trim()
    };

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(customerDetails),
          operation: "AddCustomer"
        }
      });

      if (response.data === 'Success') {
        // Refresh customer list
        await GetCustomer();
        
        // Find and select the newly created customer
        const updatedResponse = await axios.get(url, {
          params: {
            json: JSON.stringify([]),
            operation: "GetCustomer"
          }
        });

        const newCustomer = updatedResponse.data.find(customer => 
          customer.cust_name.toLowerCase().trim() === newCustomerName.toLowerCase().trim() &&
          customer.email.toLowerCase().trim() === newCustomerEmail.toLowerCase().trim()
        );

        if (newCustomer) {
          setSelectedCustomer(newCustomer);
          AlertSucces(
            "New customer created successfully!",
            "success",
            true,
            'Okay'
          );
          return newCustomer;
        } else {
          throw new Error('Customer created but not found in list');
        }
      } else {
        throw new Error(response.data || 'Failed to create customer');
      }
    } catch (error) {
      console.error("Error creating new customer:", error);
      showAlertError({
        icon: "error",
        title: "Failed to Create Customer!",
        text: error.response?.data || error.message || 'Failed to create new customer. Please try again.',
        button: 'Try Again'
      });
      return null;
    }
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

    // Determine the customer to use for this purchase
    let customerToUse = null;

    // Handle new customer creation
    if (customerMode === 'new') {
      if (!validateNewCustomer()) {
        return;
      }

      const newCustomer = await createNewCustomer();
      if (!newCustomer) {
        return; // Error already shown in createNewCustomer
      }
      // Use the newly created customer
      customerToUse = newCustomer;
    } else {
      // Old customer mode - must have selected customer
      if (!selectedCustomer) {
        showAlertError({
          icon: "error",
          title: "Customer Required!",
          text: 'Please select a customer to proceed.',
          button: 'Okay'
        });
        scrollToField(customerSearchRef);
        return;
      }
      customerToUse = selectedCustomer;
    }

    // Ensure we have a customer at this point
    if (!customerToUse) {
      showAlertError({
        icon: "error",
        title: "Customer Error!",
        text: 'Unable to proceed without a customer. Please try again.',
        button: 'Okay'
      });
      return;
    }

    if (paymentPlan === 'full' && usePartialPayment && (!partialPaymentAmount || partialPaymentAmount < calculateMinimumPartialPayment())) {
      showAlertError({
        icon: "error",
        title: "Invalid Partial Payment!",
        text: 'Partial payment must be at least 50% of the total amount.',
        button: 'Okay'
      });
      return;
    }

    // Validate cash amount for cash payments
    if (paymentMethod === 'cash') {
      const cashAmountNum = parseFloat(mainPOSCashAmount) || 0;
      const amountDue = calculateAmountDueToday();
      
      if (!mainPOSCashAmount || cashAmountNum <= 0) {
        showAlertError({
          icon: "error",
          title: "Cash Amount Required!",
          text: 'Please enter the cash amount received.',
          button: 'Okay'
        });
        return;
      }

      if (cashAmountNum < amountDue) {
        showAlertError({
          icon: "error",
          title: "Insufficient Cash!",
          text: `Cash received (₱${cashAmountNum.toLocaleString()}) is less than the amount due (₱${amountDue.toLocaleString()}).`,
          button: 'Okay'
        });
        return;
      }
    }

    // Validate delivery information
    if (needsDelivery && !deliveryAddress.trim()) {
      showAlertError({
        icon: "error",
        title: "Delivery Address Required!",
        text: 'Please provide a delivery address.',
        button: 'Okay'
      });
      return;
    }

    const accountID = parseInt(sessionStorage.getItem('user_id'));
    const locId = parseInt(sessionStorage.getItem('location_id'));
    const locName = sessionStorage.getItem('location_name');
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'sales.php';

    // Determine if this is a custom sale
    const isCustomSale = saleMode === 'custom' || cart.some(item => item.isCustom);

    if (saleMode === 'inventory' && !isCustomSale) {
      // Original inventory-based sales logic
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

      if (paymentPlan === 'full') {
        const PurchaseDetails = {
          custID: customerToUse.cust_id, // All sales require a customer
          accID: accountID,
          locID: locId,
          payMethod: paymentMethod,
          subTotal: calculateSubtotal(),
          discount: calculateDiscount(),
          discountValue: discountValue,
          total: calculateTotal(),
          paymentPlan: paymentPlan,
          amountPaid: calculateAmountDueToday(),
          remainingBalance: calculateRemainingBalance(),
          needsDelivery: needsDelivery,
          deliveryAddress: deliveryAddress,
          preferredDeliveryTime: preferredDeliveryTime
        };

        try {
          const operation = "customerSale"; // All sales are customer sales

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
            // Calculate change for cash payments
            const cashAmountNum = paymentMethod === 'cash' ? parseFloat(mainPOSCashAmount) || 0 : 0;
            const amountDue = calculateAmountDueToday();
            const change = cashAmountNum > amountDue ? cashAmountNum - amountDue : 0;

            const transaction = {
              invoice_id: response.data,
              customer: customerToUse,
              items: [...cart],
              subtotal: calculateSubtotal(),
              discount: calculateDiscount(),
              total: calculateTotal(),
              payment_method: paymentMethod,
              payment_plan: paymentPlan,
              amount_paid: calculateAmountDueToday(),
              remainingBalance: calculateRemainingBalance(),
              installment_details: null,
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString(),
              location: locName || 'Agora Showroom Main',
              cash_received: cashAmountNum,
              change: change
            };

            showReceiptModal(transaction);
            GetInventory();

            // Send notification to Inventory Manager about products sold
            try {
              const notificationUrl = baseURL + 'notifications.php';
              
              // Create a detailed message with all products sold
              const productDetails = cart.map(item => 
                `${item.product_name} (Qty: ${item.quantity})`
              ).join(', ');
              
              const notificationData = {
                type: 'inventory_sold',
                title: 'Products Sold',
                message: `Products sold at ${locName}. Invoice #${response.data}. Customer: ${customerToUse.cust_name}. Items: ${productDetails}`,
                locationId: locId,
                targetRole: 'Inventory Manager',
                productId: cart[0]?.product_id || null,
                customerId: customerToUse.cust_id,
                referenceId: response.data
              };

              await axios.get(notificationUrl, {
                params: {
                  json: JSON.stringify(notificationData),
                  operation: "CreateNotification"
                }
              });

              console.log('Inventory Manager notification sent successfully');
            } catch (notificationError) {
              console.error("Error sending inventory notification:", notificationError);
              // Don't block the sale if notification fails
            }

            // Reset form
            resetForm();

            const activity = `Processed a customer sale at ${locName}, Invoice #${response.data}`;
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
      } else if (paymentPlan === 'installment') {
        // Payment schedule will ALWAYS be created after delivery, not at purchase time
        const list1 = [];

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
          custID: customerToUse.cust_id,
          locID: locId,
          accID: accountID,
          prodID: firstProductId,
          needsDelivery: needsDelivery,
          deliveryAddress: deliveryAddress,
          preferredDeliveryTime: preferredDeliveryTime
        };

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
            // Calculate change for cash payments
            const cashAmountNum = paymentMethod === 'cash' ? parseFloat(mainPOSCashAmount) || 0 : 0;
            const amountDue = calculateDownpayment();
            const change = cashAmountNum > amountDue ? cashAmountNum - amountDue : 0;

            const transaction = {
              remainingBal: installmentDetails.monthlyPayment * installmentDetails.months,
              downpaymentAmount: calculateDownpayment(),
              invoice_id: response.data,
              customer: customerToUse,
              items: [...cart],
              subtotal: calculateSubtotal(),
              discount: calculateDiscount(),
              total: calculateTotal(),
              payment_method: paymentMethod,
              payment_plan: paymentPlan,
              amount_paid: calculateDownpayment(),
              remainingBalance: installmentDetails.monthlyPayment * installmentDetails.months,
              installment_details: {
                monthly_payment: installmentDetails.monthlyPayment,
                months: installmentDetails.months,
                interest_rate: installmentDetails.interestRate,
                total_with_interest: installmentDetails.totalWithInterest
              },
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString(),
              location: locName || 'Agora Showroom Main',
              cash_received: cashAmountNum,
              change: change
            };

            showReceiptModal(transaction);
            GetInventory();

            // Send notification to Inventory Manager about products sold
            try {
              const notificationUrl = baseURL + 'notifications.php';
              
              // Create a detailed message with all products sold
              const productDetails = cart.map(item => 
                `${item.product_name} (Qty: ${item.quantity})`
              ).join(', ');
              
              const notificationData = {
                type: 'inventory_sold',
                title: 'Products Sold (Installment)',
                message: `Products sold via installment at ${locName}. Invoice #${response.data}. Customer: ${customerToUse.cust_name}. Items: ${productDetails}`,
                locationId: locId,
                targetRole: 'Inventory Manager',
                productId: cart[0]?.product_id || null,
                customerId: customerToUse.cust_id,
                referenceId: response.data
              };

              await axios.get(notificationUrl, {
                params: {
                  json: JSON.stringify(notificationData),
                  operation: "CreateNotification"
                }
              });

              console.log('Inventory Manager notification sent successfully for installment sale');
            } catch (notificationError) {
              console.error("Error sending inventory notification:", notificationError);
              // Don't block the sale if notification fails
            }

            // Reset form
            resetForm();

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
      }
    } else {

      if (requestTo == '') {
        showAlertError({
          icon: "warning",
          title: "Choose a warehouse first!",
          text: 'Select a warehouse to request this customized purchase.',
          button: 'Okay'
        });
        return;
      }
      // Custom sales logic
      if (paymentPlan === 'full') {
        const PurchaseDetails = {
          custID: customerToUse.cust_id,
          accID: accountID,
          locID: locId,
          payMethod: paymentMethod,
          subTotal: calculateSubtotal(),
          discount: calculateDiscount(),
          discountValue: discountValue,
          total: calculateTotal(),
          paymentPlan: paymentPlan,
          amountPaid: calculateAmountDueToday(),
          remainingBalance: calculateRemainingBalance(),
          warehouseID: requestTo,
          needsDelivery: needsDelivery,
          deliveryAddress: deliveryAddress,
          preferredDeliveryTime: preferredDeliveryTime
        };

        const semiBasedProducts = [];

        cart.map(item => {
          if (item.baseProduct) {
            semiBasedProducts.push(item.baseProduct);
          }
        });

        // console.log(cart);
        // console.log(semiBasedProducts);
        // console.log(PurchaseDetails);


        // return;

        try {
          const operation = "CustomeSalesFull";

          const response = await axios.get(url, {
            params: {
              salesDetails: JSON.stringify(cart),
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

            // Calculate change for cash payments
            const cashAmountNum = paymentMethod === 'cash' ? parseFloat(mainPOSCashAmount) || 0 : 0;
            const amountDue = calculateAmountDueToday();
            const change = cashAmountNum > amountDue ? cashAmountNum - amountDue : 0;

            const transaction = {
              invoice_id: response.data,
              customer: customerToUse,
              items: [...cart],
              subtotal: calculateSubtotal(),
              discount: calculateDiscount(),
              total: calculateTotal(),
              payment_method: paymentMethod,
              payment_plan: paymentPlan,
              amount_paid: calculateAmountDueToday(),
              remainingBalance: calculateRemainingBalance(),
              installment_details: null,
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString(),
              location: locName || 'Agora Showroom Main',
              cash_received: cashAmountNum,
              change: change
            };

            showReceiptModal(transaction);

            // Send notification to warehouse
            try {
              const notificationUrl = baseURL + 'notifications.php';
              const warehouseName = locationList.find(l => l.location_id == requestTo)?.location_name || 'Warehouse';
              
              const notificationData = {
                type: 'custom_order',
                title: 'New Customization Order',
                message: `New customization order from ${locName}. Invoice #${response.data}. Customer: ${customerToUse.cust_name}. ${cart.length} item(s) ordered.`,
                locationId: requestTo,
                targetRole: 'Warehouse Representative',
                productId: null,
                customerId: customerToUse.cust_id,
                referenceId: response.data
              };

              await axios.get(notificationUrl, {
                params: {
                  json: JSON.stringify(notificationData),
                  operation: "CreateNotification"
                }
              });

              console.log('Warehouse notification sent successfully');
            } catch (notificationError) {
              console.error("Error sending warehouse notification:", notificationError);
              // Don't block the sale if notification fails
            }

            // Reset form
            resetForm();

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
      } else if (paymentPlan === 'installment') {
        // Payment schedule will ALWAYS be created after delivery, not at purchase time
        const list1 = [];

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
          custID: customerToUse.cust_id,
          locID: locId,
          accID: accountID,
          warehouseID: requestTo,
          needsDelivery: needsDelivery,
          deliveryAddress: deliveryAddress,
          preferredDeliveryTime: preferredDeliveryTime
        };

        // return;

        try {
          const operation = 'CustomizeinstallmentPlan';

          const response = await axios.get(url, {
            params: {
              dateDue: JSON.stringify(list1),
              salesDetails: JSON.stringify(cart),
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

            // Calculate change for cash payments
            const cashAmountNum = paymentMethod === 'cash' ? parseFloat(mainPOSCashAmount) || 0 : 0;
            const amountDue = calculateDownpayment();
            const change = cashAmountNum > amountDue ? cashAmountNum - amountDue : 0;

            const transaction = {
              remainingBal: installmentDetails.monthlyPayment * installmentDetails.months,
              downpaymentAmount: calculateDownpayment(),
              invoice_id: response.data,
              customer: customerToUse,
              items: [...cart],
              subtotal: calculateSubtotal(),
              discount: calculateDiscount(),
              total: calculateTotal(),
              payment_method: paymentMethod,
              payment_plan: paymentPlan,
              amount_paid: calculateDownpayment(),
              remainingBalance: installmentDetails.monthlyPayment * installmentDetails.months,
              installment_details: {
                monthly_payment: installmentDetails.monthlyPayment,
                months: installmentDetails.months,
                interest_rate: installmentDetails.interestRate,
                total_with_interest: installmentDetails.totalWithInterest
              },
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString(),
              location: locName || 'Agora Showroom Main',
              cash_received: cashAmountNum,
              change: change
            };

            showReceiptModal(transaction);

            // Send notification to warehouse for installment custom order
            try {
              const notificationUrl = baseURL + 'notifications.php';
              const warehouseName = locationList.find(l => l.location_id == requestTo)?.location_name || 'Warehouse';
              
              const notificationData = {
                type: 'custom_order_installment',
                title: 'New Customization Installment Order',
                message: `New customization INSTALLMENT order from ${locName}. Invoice #${response.data}. Customer: ${customerToUse.cust_name}. ${cart.length} item(s) ordered. ${installmentDetails.months}-month plan.`,
                locationId: requestTo,
                targetRole: 'Warehouse Representative',
                productId: null,
                customerId: customerToUse.cust_id,
                referenceId: response.data
              };

              await axios.get(notificationUrl, {
                params: {
                  json: JSON.stringify(notificationData),
                  operation: "CreateNotification"
                }
              });

              console.log('Warehouse notification sent successfully for installment order');
            } catch (notificationError) {
              console.error("Error sending warehouse notification:", notificationError);
              // Don't block the sale if notification fails
            }

            // Reset form
            resetForm();

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
    }
  };

  const resetForm = () => {
    setCart([]);
    setPaymentMethod("cash");
    setMainPOSCashAmount('');
    // Keep customerType as 'customer' - all sales require a customer
    setCustomerMode('old'); // Reset to old customer mode
    setSelectedCustomer(null);
    setCustomerSearchTerm('');
    // Reset new customer fields
    setNewCustomerName('');
    setNewCustomerEmail('');
    setNewCustomerPhone('');
    setNewCustomerAddress('');
    setEmailError('');
    setPhoneError('');
    setDiscountValue(0);
    setPaymentPlan('full');
    setDownpaymentAmount(0);
    setCustomDownpayment('');
    setUsePartialPayment(false);
    setPartialPaymentAmount('');
    setNeedsDelivery(false);
    setDeliveryAddress('');
    setPreferredDeliveryTime('');
    setInstallmentDetails({
      months: 3,
      interestRate: 0,
      monthlyPayment: 0,
      totalWithInterest: 0
    });
  };

  if (loading) {
    return (
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
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Loading...</h2>
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
    );
  }

  return (
    <>
      <div className='customer-main'>
        {/* Receipt Modal */}
        {showReceipt && lastTransaction && (
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
            zIndex: 2000,
            padding: '16px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                  <span style={{ color: '#10b981', marginRight: '8px' }}>✓</span>
                  {lastTransaction.payment_type === 'Balance Payment' ? 'Balance Payment Receipt!' : 'Payment Successful!'}
                </h3>
                <button
                  onClick={closeReceipt}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{
                padding: '24px',
                overflowY: 'auto',
                flex: 1
              }}>
                {/* Transaction Header */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '24px',
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>
                    A.G HOME APPLIANCE AND FURNITURE SHOWROOM
                  </h4>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    <div>{lastTransaction.payment_type === 'Installment Payment' ? `Receipt #${lastTransaction.receipt_id}` : `Invoice #${lastTransaction.invoice_id}`}</div>
                    <div>{lastTransaction.date} • {lastTransaction.time}</div>
                    <div>{lastTransaction.location}</div>
                  </div>
                </div>

                {/* Customer Information */}
                <div style={{ marginBottom: '24px' }}>
                  <h5 style={{ fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                    Customer Information
                  </h5>
                  <div style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>Name: {lastTransaction.customer.cust_name}</div>
                      <div style={{ color: '#6b7280' }}>Phone: {lastTransaction.customer.phone}</div>
                      <div style={{ color: '#6b7280' }}>Email: {lastTransaction.customer.email}</div>
                    </div>
                  </div>
                </div>

                {/* Items Purchased or Payments Recorded */}
                {lastTransaction.payment_type === 'Installment Payment' ? (
                  <div style={{ marginBottom: '24px' }}>
                    <h5 style={{ fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                      Payments Recorded
                    </h5>
                    <div style={{
                      padding: '12px',
                      background: '#f9fafb',
                      borderRadius: '8px'
                    }}>
                      {lastTransaction.payments && lastTransaction.payments.map((payment, index) => (
                        <div
                          key={index}
                          style={{
                            paddingTop: index > 0 ? '12px' : 0,
                            paddingBottom: '12px',
                            borderBottom: index < lastTransaction.payments.length - 1 ? '1px solid #e5e7eb' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                Payment #{payment.payment_number}
                              </div>
                              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                                Due: {formatDate(payment.due_date)}
                              </div>
                              {payment.has_penalty && (
                                <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '4px' }}>
                                  Penalty: {formatCurrency(payment.penalty_amount)}
                                </div>
                              )}
                              {payment.amount_paid && payment.amount_paid !== payment.total_amount && (
                                <div style={{ fontSize: '12px', color: '#059669', marginBottom: '4px', fontStyle: 'italic' }}>
                                  💰 Partial: {formatCurrency(payment.amount_paid)} of {formatCurrency(payment.total_amount)}
                                </div>
                              )}
                            </div>
                            <div style={{ fontWeight: '600', textAlign: 'right', color: '#10b981' }}>
                              {payment.amount_paid ? formatCurrency(payment.amount_paid) : formatCurrency(payment.total_amount)}
                              {payment.amount_paid && payment.amount_paid < payment.total_amount && (
                                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '400' }}>
                                  of {formatCurrency(payment.total_amount)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '24px' }}>
                    <h5 style={{ fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                      Items Purchased
                    </h5>
                    <div style={{
                      padding: '12px',
                      background: '#f9fafb',
                      borderRadius: '8px'
                    }}>
                      {lastTransaction.items && lastTransaction.items.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          paddingTop: index > 0 ? '12px' : 0,
                          paddingBottom: '12px',
                          borderBottom: index < lastTransaction.items.length - 1 ? '1px solid #e5e7eb' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                              {item.product_name}
                              {item.isCustom && (
                                <span style={{
                                  marginLeft: '8px',
                                  fontSize: '10px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: item.customizationType === 'full' ? '#f59e0b' : '#7c3aed',
                                  color: 'white'
                                }}>
                                  {item.customizationType === 'full' ? 'FULL CUSTOM' : 'SEMI-CUSTOM'}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                              {item.description}
                            </div>
                            {item.modifications && (
                              <div style={{
                                fontSize: '12px',
                                color: '#7c3aed',
                                fontStyle: 'italic',
                                marginBottom: '4px'
                              }}>
                                Modifications: {item.modifications}
                              </div>
                            )}
                            {item.color && item.color !== 'N/A' && (
                              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                Color: {item.color}
                              </div>
                            )}
                            <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                              ₱{item.price.toLocaleString()} × {item.quantity}
                            </div>
                          </div>
                          <div style={{ fontWeight: '600', textAlign: 'right' }}>
                            ₱{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Summary */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    {lastTransaction.payment_type === 'Balance Payment' ? (
                      <>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span>Original Invoice:</span>
                          <span>#{lastTransaction.original_invoice}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span>Total Order Amount:</span>
                          <span>₱{(lastTransaction.total_price || 0).toLocaleString()}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span>Total Paid:</span>
                          <span style={{ color: '#10b981' }}>₱{(lastTransaction.total_paid || 0).toLocaleString()}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '16px',
                          fontWeight: '600',
                          paddingTop: '8px',
                          borderTop: '2px solid #e5e7eb',
                          color: lastTransaction.new_balance > 0 ? '#dc2626' : '#10b981'
                        }}>
                          <span>Remaining Balance:</span>
                          <span>₱{(lastTransaction.new_balance || 0).toLocaleString()}</span>
                        </div>
                      </>
                    ) : lastTransaction.payment_plan === 'installment' ? (
                      <>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '18px',
                          fontWeight: '600'
                        }}>
                          <span>ORIGINAL PRICE:</span>
                          <span style={{ color: '#7c3aed' }}>
                            ₱{lastTransaction.total.toLocaleString()}
                          </span>
                        </div>
                        {lastTransaction.payment_method === 'cash' && lastTransaction.cash_received && (
                          <>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginTop: '8px'
                            }}>
                              <span>Cash Received:</span>
                              <span>₱{lastTransaction.cash_received.toLocaleString()}</span>
                            </div>
                            {lastTransaction.change > 0 && (
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#10b981',
                                marginTop: '8px',
                                paddingTop: '8px',
                                borderTop: '1px solid #e5e7eb'
                              }}>
                                <span>Change:</span>
                                <span>₱{lastTransaction.change.toLocaleString()}</span>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    ) : lastTransaction.payment_type === 'Installment Payment' ? (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#10b981'
                      }}>
                        <span>Total Amount Paid:</span>
                        <span>
                          {formatCurrency(lastTransaction.total_amount)}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span>Subtotal:</span>
                          <span>₱{lastTransaction.subtotal.toLocaleString()}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                          color: '#ef4444'
                        }}>
                          <span>Discount:</span>
                          <span>-₱{lastTransaction.discount.toLocaleString()}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '18px',
                          fontWeight: '600',
                          paddingTop: '8px',
                          borderTop: '2px solid #e5e7eb'
                        }}>
                          <span>Total:</span>
                          <span style={{ color: '#7c3aed' }}>
                            ₱{lastTransaction.total.toLocaleString()}
                          </span>
                        </div>
                        {lastTransaction.payment_method === 'cash' && lastTransaction.cash_received && (
                          <>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginTop: '8px'
                            }}>
                              <span>Cash Received:</span>
                              <span>₱{lastTransaction.cash_received.toLocaleString()}</span>
                            </div>
                            {lastTransaction.change > 0 && (
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#10b981',
                                marginTop: '8px',
                                paddingTop: '8px',
                                borderTop: '1px solid #e5e7eb'
                              }}>
                                <span>Change:</span>
                                <span>₱{lastTransaction.change.toLocaleString()}</span>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div style={{ marginBottom: '24px' }}>
                  <h5 style={{ fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                    Payment Details
                  </h5>
                  <div style={{
                    padding: '12px',
                    background: lastTransaction.payment_type === 'Balance Payment' ? '#eff6ff' : (lastTransaction.payment_plan === 'installment' ? '#fff7ed' : '#f0fdf4'),
                    border: `1px solid ${lastTransaction.payment_type === 'Balance Payment' ? '#bfdbfe' : (lastTransaction.payment_plan === 'installment' ? '#fed7aa' : '#bbf7d0')}`,
                    borderRadius: '8px'
                  }}>
                    {lastTransaction.payment_type === 'Balance Payment' ? (
                      <>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontWeight: '500' }}>Payment Type:</span>
                          <span>{lastTransaction.payment_type}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontWeight: '500' }}>Previous Balance:</span>
                          <span style={{ color: '#dc2626' }}>₱{(lastTransaction.previous_balance || 0).toLocaleString()}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#10b981'
                        }}>
                          <span>Amount Paid Today:</span>
                          <span>₱{(lastTransaction.amount_paid || 0).toLocaleString()}</span>
                        </div>
                      </>
                    ) : lastTransaction.payment_type === 'Installment Payment' ? (
                      <>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontWeight: '500' }}>Payment Type:</span>
                          <span style={{ color: '#10b981', fontWeight: '600' }}>Installment Payment</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontWeight: '500' }}>Installment ID:</span>
                          <span>{lastTransaction.customer.installment_sales_id}</span>
                        </div>
                        {lastTransaction.wasAdjusted && (
                          <div style={{
                            marginTop: '8px',
                            padding: '8px',
                            background: '#dbeafe',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#1e40af',
                            fontWeight: '500'
                          }}>
                            ⚠️ Amount manually adjusted by clerk
                          </div>
                        )}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#10b981',
                          marginTop: '8px',
                          paddingTop: '8px',
                          borderTop: '1px solid #e5e7eb'
                        }}>
                          <span>Amount Received:</span>
                          <span>{formatCurrency(lastTransaction.total_amount)}</span>
                        </div>
                        {lastTransaction.excess_amount > 0 && (
                          <div style={{
                            marginTop: '8px',
                            padding: '8px',
                            background: '#dbeafe',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#1e40af',
                            fontWeight: '500'
                          }}>
                            ℹ️ Excess amount of {formatCurrency(lastTransaction.excess_amount)} was credited to the next payment
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontWeight: '500' }}>Payment Method:</span>
                          <span style={{ textTransform: 'uppercase' }}>
                            {lastTransaction.payment_method}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontWeight: '500' }}>Payment Plan:</span>
                          <span>
                            {lastTransaction.payment_plan === 'full' ? 'Full Payment' : 'Installment Plan'}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: lastTransaction.payment_plan === 'installment' ? '#f59e0b' : '#10b981'
                        }}>
                          <span>Amount Paid Today:</span>
                          <span>₱{(lastTransaction.amount_paid || 0).toLocaleString()}</span>
                        </div>
                        {lastTransaction.payment_method === 'cash' && lastTransaction.cash_received && (
                          <>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginTop: '8px'
                            }}>
                              <span style={{ fontWeight: '500' }}>Cash Received:</span>
                              <span>₱{lastTransaction.cash_received.toLocaleString()}</span>
                            </div>
                            {lastTransaction.change > 0 && (
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#10b981',
                                marginTop: '8px',
                                paddingTop: '8px',
                                borderTop: '1px solid #e5e7eb'
                              }}>
                                <span>Change:</span>
                                <span>₱{lastTransaction.change.toLocaleString()}</span>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {lastTransaction.remainingBalance > 0 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                        color: '#dc2626',
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px dashed #fde68a'
                      }}>
                        <span style={{ fontWeight: '500' }}>Remaining Balance:</span>
                        <span style={{ fontWeight: '600' }}>
                          ₱{lastTransaction.remainingBalance.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {lastTransaction.payment_plan === 'installment' && lastTransaction.installment_details && (
                      <div style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid #fed7aa',
                        fontSize: '13px'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          marginBottom: '8px',
                          color: '#92400e'
                        }}>
                          Installment Schedule:
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                          <span>Monthly Payment: </span>
                          <span style={{ fontWeight: '600' }}>
                            ₱{lastTransaction.installment_details.monthly_payment.toLocaleString()}
                          </span>
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                          <span>Term: </span>
                          <span style={{ fontWeight: '600' }}>
                            {lastTransaction.installment_details.months} months
                          </span>
                        </div>
                        {lastTransaction.installment_details.months !== 3 && (
                          <>
                            <div style={{ marginBottom: '4px' }}>
                              <span>Interest Rate: </span>
                              <span style={{ fontWeight: '600' }}>
                                {lastTransaction.installment_details.interest_rate}%
                              </span>
                            </div>
                            <div style={{
                              marginTop: '8px',
                              paddingTop: '8px',
                              borderTop: '1px dashed #fde68a'
                            }}>
                              <span>Total with Interest: </span>
                              <span style={{ fontWeight: '700', color: '#dc2626' }}>
                                ₱{lastTransaction.installment_details.total_with_interest.toLocaleString()}
                              </span>
                            </div>
                          </>
                        )}

                        <div style={{
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: '1px dashed #fde68a'
                        }}>
                          <div style={{ fontWeight: '600', marginBottom: '8px', color: '#92400e' }}>
                            Payment Schedule:
                          </div>
                          <div style={{
                            padding: '14px',
                            background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
                            border: '2px solid #3b82f6',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: '#1e40af'
                          }}>
                            <div style={{ 
                              fontWeight: '700', 
                              marginBottom: '8px',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span style={{ fontSize: '18px' }}>📅</span>
                              Schedule Will Be Created After Delivery
                            </div>
                            <div style={{ 
                              fontSize: '12px', 
                              lineHeight: '1.6',
                              marginBottom: '10px',
                              color: '#1e3a8a'
                            }}>
                              The payment schedule will be automatically generated once the item is delivered to the customer. 
                              The first monthly payment will be due <strong>one month from the delivery date</strong>.
                            </div>
                            <div style={{ 
                              background: 'rgba(255, 255, 255, 0.7)',
                              padding: '10px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600',
                              color: '#1e3a8a'
                            }}>
                              💰 Monthly Payment: ₱{lastTransaction.installment_details.monthly_payment.toLocaleString()} × {lastTransaction.installment_details.months} months
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Message */}
                <div style={{
                  padding: '12px',
                  background: '#d1fae5',
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                    ✓ Transaction completed successfully
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#065f46' }}>
                    {saleMode === 'custom'
                      ? 'Order has been sent to warehouse'
                      : 'Inventory has been updated automatically'}
                  </p>
                  {lastTransaction.payment_plan === 'installment' && (
                    <p style={{
                      margin: '8px 0 0 0',
                      fontSize: '13px',
                      color: '#dc2626',
                      fontWeight: '600'
                    }}>
                      ⚠️ Customer has outstanding installment balance
                    </p>
                  )}
                </div>
              </div>

              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    const receiptHTML = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <title>Receipt #${lastTransaction.invoice_id}</title>
                      <style>
                        body {
                          font-family: Arial, sans-serif;
                          padding: 20px;
                          max-width: 800px;
                          margin: 0 auto;
                        }
                        .header {
                          text-align: center;
                          margin-bottom: 20px;
                          padding-bottom: 15px;
                          border-bottom: 2px solid #000;
                        }
                        .header h1 {
                          margin: 0 0 10px 0;
                          font-size: 24px;
                        }
                        .info-section {
                          margin-bottom: 20px;
                        }
                        .info-section h3 {
                          margin: 0 0 10px 0;
                          font-size: 16px;
                          border-bottom: 1px solid #ddd;
                          padding-bottom: 5px;
                        }
                        .info-row {
                          display: flex;
                          justify-content: space-between;
                          margin-bottom: 5px;
                        }
                        .items-table {
                          width: 100%;
                          border-collapse: collapse;
                          margin-bottom: 20px;
                        }
                        .items-table th, .items-table td {
                          border: 1px solid #ddd;
                          padding: 8px;
                          text-align: left;
                        }
                        .items-table th {
                          background-color: #f0f0f0;
                          font-weight: bold;
                        }
                        .totals {
                          margin-top: 20px;
                          padding-top: 15px;
                          border-top: 2px solid #000;
                        }
                        .total-row {
                          display: flex;
                          justify-content: space-between;
                          margin-bottom: 8px;
                        }
                        .total-row.grand-total {
                          font-size: 18px;
                          font-weight: bold;
                          padding-top: 10px;
                          border-top: 1px solid #ddd;
                        }
                        .payment-info {
                          background-color: #f9f9f9;
                          padding: 15px;
                          margin-top: 20px;
                          border: 1px solid #ddd;
                          border-radius: 5px;
                        }
                        .installment-schedule {
                          margin-top: 15px;
                          font-size: 12px;
                        }
                        .badge {
                          display: inline-block;
                          padding: 2px 8px;
                          border-radius: 3px;
                          font-size: 10px;
                          font-weight: bold;
                          margin-left: 5px;
                        }
                        .badge-custom {
                          background-color: #f59e0b;
                          color: white;
                        }
                        .badge-semi {
                          background-color: #7c3aed;
                          color: white;
                        }
                        .footer {
                          text-align: center;
                          margin-top: 30px;
                          padding-top: 15px;
                          border-top: 1px solid #ddd;
                          font-size: 12px;
                          color: #666;
                        }
                        @media print {
                          body { padding: 10px; }
                        }
                      </style>
                    </head>
                    <body>
                      <div class="header">
                        <h1>A.G HOME APPLIANCE AND FURNITURE SHOWROOM</h1>
                        <div>Invoice #${lastTransaction.invoice_id}</div>
                        <div>${lastTransaction.date} • ${lastTransaction.time}</div>
                        <div>${lastTransaction.location}</div>
                      </div>

                      <div class="info-section">
                        <h3>Customer Information</h3>
                        <div><strong>Name:</strong> ${lastTransaction.customer.cust_name}</div>
                        <div><strong>Phone:</strong> ${lastTransaction.customer.phone}</div>
                        <div><strong>Email:</strong> ${lastTransaction.customer.email}</div>
                      </div>

                      <div class="info-section">
                        <h3>Items Purchased</h3>
                        <table class="items-table">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th style="text-align: center;">Qty</th>
                              <th style="text-align: right;">Price</th>
                              <th style="text-align: right;">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${lastTransaction.items.map(item => `
                              <tr>
                                <td>
                                  <strong>${item.product_name}</strong>
                                  ${item.isCustom ? `<span class="badge badge-${item.customizationType === 'full' ? 'custom' : 'semi'}">${item.customizationType === 'full' ? 'FULL CUSTOM' : 'SEMI-CUSTOM'}</span>` : ''}
                                  <div style="font-size: 12px; color: #666; margin-top: 3px;">${item.description}</div>
                                  ${item.modifications ? `<div style="font-size: 11px; color: #7c3aed; font-style: italic; margin-top: 3px;">Modifications: ${item.modifications}</div>` : ''}
                                  ${item.color && item.color !== 'N/A' ? `<div style="font-size: 11px; color: #666; margin-top: 2px;">Color: ${item.color}</div>` : ''}
                                </td>
                                <td style="text-align: center;">${item.quantity}</td>
                                <td style="text-align: right;">₱${item.price.toLocaleString()}</td>
                                <td style="text-align: right;"><strong>₱${(item.price * item.quantity).toLocaleString()}</strong></td>
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>
                      </div>

                      <div class="totals">
                        ${lastTransaction.payment_plan === 'installment'
                        ? `<div class="total-row grand-total">
                               <span>ORIGINAL PRICE:</span>
                               <span>₱${lastTransaction.total.toLocaleString()}</span>
                             </div>
                             ${lastTransaction.payment_method === 'cash' && lastTransaction.cash_received ? `
                             <div class="total-row">
                               <span>Cash Received:</span>
                               <span>₱${lastTransaction.cash_received.toLocaleString()}</span>
                             </div>
                             ${lastTransaction.change > 0 ? `
                             <div class="total-row" style="font-size: 16px; font-weight: bold; color: #10b981; padding-top: 8px; border-top: 1px solid #ddd; margin-top: 8px;">
                               <span>Change:</span>
                               <span>₱${lastTransaction.change.toLocaleString()}</span>
                             </div>
                             ` : ''}
                             ` : ''}`
                        : `
                            <div class="total-row">
                              <span>Subtotal:</span>
                              <span>₱${lastTransaction.subtotal.toLocaleString()}</span>
                            </div>
                            <div class="total-row" style="color: #ef4444;">
                              <span>Discount:</span>
                              <span>-₱${lastTransaction.discount.toLocaleString()}</span>
                            </div>
                            <div class="total-row grand-total">
                              <span>TOTAL:</span>
                              <span>₱${lastTransaction.total.toLocaleString()}</span>
                            </div>
                            ${lastTransaction.payment_method === 'cash' && lastTransaction.cash_received ? `
                            <div class="total-row">
                              <span>Cash Received:</span>
                              <span>₱${lastTransaction.cash_received.toLocaleString()}</span>
                            </div>
                            ${lastTransaction.change > 0 ? `
                            <div class="total-row" style="font-size: 16px; font-weight: bold; color: #10b981; padding-top: 8px; border-top: 1px solid #ddd; margin-top: 8px;">
                              <span>Change:</span>
                              <span>₱${lastTransaction.change.toLocaleString()}</span>
                            </div>
                            ` : ''}
                            ` : ''}
                          `
                      }
                      </div>

                      <div class="payment-info">
                        <h3 style="margin-top: 0;">Payment Details</h3>
                        <div class="info-row">
                          <span><strong>Payment Method:</strong></span>
                          <span style="text-transform: uppercase;">${lastTransaction.payment_method}</span>
                        </div>
                        <div class="info-row">
                          <span><strong>Payment Plan:</strong></span>
                          <span>${lastTransaction.payment_plan === 'full' ? 'Full Payment' : 'Installment Plan'}</span>
                        </div>
                        <div class="info-row" style="font-size: 16px; font-weight: bold; color: ${lastTransaction.payment_plan === 'installment' ? '#f59e0b' : '#10b981'};">
                          <span>Amount Paid Today:</span>
                          <span>₱${(lastTransaction.amount_paid || 0).toLocaleString()}</span>
                        </div>

                        ${lastTransaction.payment_method === 'cash' && lastTransaction.cash_received ? `
                        <div class="info-row">
                          <span><strong>Cash Received:</strong></span>
                          <span>₱${lastTransaction.cash_received.toLocaleString()}</span>
                        </div>
                        ${lastTransaction.change > 0 ? `
                        <div class="info-row" style="font-size: 16px; font-weight: bold; color: #10b981; padding-top: 8px; border-top: 1px dashed #ddd; margin-top: 8px;">
                          <span>Change:</span>
                          <span>₱${lastTransaction.change.toLocaleString()}</span>
                        </div>
                        ` : ''}
                        ` : ''}

                        ${lastTransaction.remainingBalance > 0 ? `
                          <div class="info-row" style="color: #dc2626; font-weight: bold; padding-top: 8px; border-top: 1px dashed #ddd; margin-top: 8px;">
                            <span>Remaining Balance:</span>
                            <span>₱${lastTransaction.remainingBalance.toLocaleString()}</span>
                          </div>
                        ` : ''}

                        ${lastTransaction.payment_plan === 'installment' && lastTransaction.installment_details ? `
                          <div class="installment-schedule">
                            <h4 style="margin: 15px 0 8px 0; padding-top: 10px; border-top: 1px solid #ddd;">Installment Schedule</h4>
                            <div class="info-row">
                              <span>Monthly Payment:</span>
                              <span><strong>₱${lastTransaction.installment_details.monthly_payment.toLocaleString()}</strong></span>
                            </div>
                            <div class="info-row">
                              <span>Term:</span>
                              <span><strong>${lastTransaction.installment_details.months} months</strong></span>
                            </div>
                            ${lastTransaction.installment_details.months !== 3 ? `
                             
                              
                            ` : ''}
                            
                            <h5 style="margin: 10px 0 5px 0;">Payment Schedule:</h5>
                            <table style="width: 100%; font-size: 11px;">
                              ${lastTransaction.installment_details.payment_dates.map((date, index) => `
                                <tr>
                                  <td>Payment #${index + 1}:</td>
                                  <td>${date}</td>
                                  <td style="text-align: right;"><strong>₱${lastTransaction.installment_details.monthly_payment.toLocaleString()}</strong></td>
                                </tr>
                              `).join('')}
                            </table>
                          </div>
                        ` : ''}
                      </div>

                      <div class="footer">
                        <p><strong>Thank you for your business!</strong></p>
                        <p>This is an official receipt. Please keep for your records.</p>
                        ${lastTransaction.payment_plan === 'installment' ? '<p style="color: #dc2626; font-weight: bold;">⚠️ Customer has outstanding installment balance</p>' : ''}
                      </div>
                    </body>
                    </html>
                  `;

                    printWindow.document.write(receiptHTML);
                    printWindow.document.close();

                    // Wait for content to load before printing
                    printWindow.onload = function () {
                      printWindow.print();
                    };
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🖨️ Print Receipt
                </button>
                <button
                  onClick={closeReceipt}
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
                  ✓ Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Installment Payment Modal */}
        {showInstallmentPaymentModal && (
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
            zIndex: 2000,
            padding: '16px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                  Record Installment Payment
                </h3>
                <button
                  onClick={() => {
                    setShowInstallmentPaymentModal(false);
                    setSelectedInstallmentForPayment(null);
                    setSelectedPayments([]);
                    setPayAllUnpaid(false);
                    setManualAdjustment(false);
                    setAdjustedAmount('');
                    setPaymentAmount('');
                    setCashAmount('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{
                padding: '24px',
                overflowY: 'auto',
                flex: 1
              }}>
                {!selectedInstallmentForPayment ? (
                  <div>
                    {/* Customer Search Section */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
                        Search Customer *
                      </label>
                      <input
                        type="text"
                        placeholder="Search customers by name, email, or phone..."
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          marginBottom: '12px'
                        }}
                      />
                      
                      <div style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        background: '#f9fafb'
                      }}>
                        {filteredCustomers.length === 0 ? (
                          <div style={{
                            padding: '12px',
                            textAlign: 'center',
                            color: '#6b7280',
                            fontSize: '14px'
                          }}>
                            {customerSearchTerm
                              ? 'No customers found matching your search.'
                              : 'Type to search for customers...'}
                          </div>
                        ) : (
                          filteredCustomers.map(customer => (
                            <div
                              key={customer.cust_id}
                              onClick={() => {
                                setSelectedCustomer(customer);
                                GetInstallment(customer.cust_id);
                                setCustomerSearchTerm('');
                                setPaymentAmount(''); // Reset payment amount when selecting customer
                                setCashAmount(''); // Reset cash amount when selecting customer
                              }}
                              style={{
                                padding: '12px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #e5e7eb',
                                background: selectedCustomer?.cust_id === customer.cust_id ? '#e0e7ff' : 'transparent',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (selectedCustomer?.cust_id !== customer.cust_id) {
                                  e.currentTarget.style.background = '#f3f4f6';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedCustomer?.cust_id !== customer.cust_id) {
                                  e.currentTarget.style.background = 'transparent';
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
                      
                      {selectedCustomer && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          background: '#e0e7ff',
                          borderRadius: '8px',
                          border: '1px solid #c7d2fe'
                        }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
                            Selected Customer: {selectedCustomer.cust_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#3730a3' }}>
                            {selectedCustomer.phone} • {selectedCustomer.email}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Installment Plans Section */}
                    {selectedCustomer && (() => {
                      // Filter installments to only show those for the selected customer
                      const customerInstallments = installmentList.filter(inst => 
                        inst.cust_id === selectedCustomer.cust_id
                      );
                      
                      // Filter installment details to only show details for this customer's installments
                      const customerInstallmentIds = customerInstallments.map(inst => inst.installment_sales_id);
                      const customerInstallmentDetails = installmentDList.filter(detail =>
                        customerInstallmentIds.includes(detail.installment_id)
                      );
                      
                      return (
                        <>
                          <h5 style={{ marginBottom: '16px' }}>Select Installment Plan</h5>
                          {customerInstallments.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                              No active installment plans found for this customer.
                            </div>
                          ) : (
                            <div style={{
                              display: 'grid',
                              gap: '12px'
                            }}>
                              {customerInstallments.map((installment) => {
                                const schedules = customerInstallmentDetails.filter(s => s.installment_id === installment.installment_sales_id);
                                const unpaidCount = schedules.filter(s => s.status !== 'Paid').length;
                                const paidCount = schedules.filter(s => s.status === 'Paid').length;
                                return (
                            <div
                              key={installment.installment_sales_id}
                              onClick={() => handleInstallmentSelection(installment)}
                              style={{
                                padding: '16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: '#f9fafb'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#7c3aed';
                                e.currentTarget.style.background = '#f3f4f6';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.background = '#f9fafb';
                              }}
                            >
                              <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                                Installment ID: {installment.installment_sales_id}
                              </div>
                              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                <div>Balance: {formatCurrency(installment.balance)}</div>
                                <div>Progress: {paidCount} / {schedules.length} payments</div>
                                {unpaidCount > 0 && (
                                  <div style={{ color: '#dc2626', marginTop: '4px' }}>
                                    {unpaidCount} unpaid payment{unpaidCount > 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                            </div>
                          )}
                        </>
                      );
                    })()}
                    
                    {!selectedCustomer && (
                      <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#6b7280',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px dashed #e5e7eb'
                      }}>
                        Please search and select a customer to view their installment plans.
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f9ff', borderRadius: '8px' }}>
                      <div style={{ fontWeight: '600' }}>Installment ID: {selectedInstallmentForPayment.installment_sales_id}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>Customer: {selectedInstallmentForPayment.cust_name}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>Balance: {formatCurrency(selectedInstallmentForPayment.balance)}</div>
                    </div>

                    {(() => {
                      // Filter installment details to only those for the selected customer's installments
                      const customerInstallmentIds = installmentList.filter(inst => 
                        inst.cust_id === selectedCustomer?.cust_id
                      ).map(inst => inst.installment_sales_id);
                      
                      const customerInstallmentDetails = installmentDList.filter(detail =>
                        customerInstallmentIds.includes(detail.installment_id)
                      );

                      const installmentSchedules = customerInstallmentDetails.filter(schedule =>
                        schedule.installment_id === selectedInstallmentForPayment.installment_sales_id
                      );

                      const unpaidPayments = installmentSchedules
                        .filter(payment => payment.status !== 'Paid')
                        .map(payment => calculateOverduePenalty(payment))
                        .sort((a, b) => parseInt(a.payment_number) - parseInt(b.payment_number));

                      // Calculate overdue payments (required payments)
                      const overduePayments = unpaidPayments.filter(payment => payment.days_overdue >= 3);
                      
                      // Required payments: all overdue + next due payment (if no overdue)
                      const requiredPayments = overduePayments.length > 0 
                        ? overduePayments 
                        : (unpaidPayments.length > 0 ? [unpaidPayments[0]] : []);
                      
                      // Calculate minimum amount due (required payments)
                      const minimumAmountDue = requiredPayments.reduce((sum, payment) => sum + payment.total_amount, 0);
                      
                      // Use required payments as selected payments
                      const selectedPaymentsList = requiredPayments;
                      
                      const totalAmount = minimumAmountDue;
                      
                      // Calculate change
                      const paymentAmountNum = parseFloat(paymentAmount) || 0;
                      const cashAmountNum = parseFloat(cashAmount) || 0;
                      const change = cashAmountNum > paymentAmountNum ? cashAmountNum - paymentAmountNum : 0;

                      return (
                        <>
                          {/* Payment List - Read Only */}
                          <div style={{
                            maxHeight: '300px',
                            overflowY: 'auto',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            marginBottom: '16px'
                          }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead style={{ background: '#f9fafb', position: 'sticky', top: 0 }}>
                                <tr>
                                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Payment #</th>
                                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Due Date</th>
                                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Amount</th>
                                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Total</th>
                                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {unpaidPayments.map((payment) => {
                                  const isRequired = requiredPayments.some(p => p.ips_id === payment.ips_id);
                                  return (
                                    <tr
                                      key={payment.ips_id}
                                      style={{
                                        background: isRequired ? '#fef2f2' : 'white',
                                        borderLeft: isRequired ? '4px solid #dc2626' : 'none'
                                      }}
                                    >
                                      <td style={{ padding: '12px' }}>
                                        {payment.payment_number}
                                        {payment.days_overdue >= 3 && (
                                          <span style={{ marginLeft: '8px', padding: '2px 6px', background: '#dc2626', color: 'white', borderRadius: '4px', fontSize: '11px' }}>
                                            OVERDUE
                                          </span>
                                        )}
                                      </td>
                                      <td style={{ padding: '12px' }}>{formatDate(payment.due_date)}</td>
                                      <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(payment.original_amount)}</td>
                                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: payment.has_penalty ? '#dc2626' : '#10b981' }}>
                                        {formatCurrency(payment.total_amount)}
                                        {payment.has_penalty && (
                                          <div style={{ fontSize: '11px', color: '#dc2626' }}>
                                            +{formatCurrency(payment.penalty_amount)} penalty
                                          </div>
                                        )}
                                      </td>
                                      <td style={{ padding: '12px', textAlign: 'center' }}>
                                        {isRequired && (
                                          <span style={{ 
                                            padding: '4px 8px', 
                                            background: '#dc2626', 
                                            color: 'white', 
                                            borderRadius: '4px', 
                                            fontSize: '11px',
                                            fontWeight: '600'
                                          }}>
                                            REQUIRED
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          
                          {overduePayments.length > 0 && (
                            <div style={{
                              padding: '12px',
                              background: '#fef2f2',
                              border: '1px solid #dc2626',
                              borderRadius: '8px',
                              marginBottom: '16px'
                            }}>
                              <div style={{ color: '#dc2626', fontWeight: '600', fontSize: '14px' }}>
                                ⚠️ {overduePayments.length} Overdue Payment{overduePayments.length > 1 ? 's' : ''} Must Be Paid
                              </div>
                            </div>
                          )}

                          <div style={{
                            padding: '16px',
                            background: '#f0fdf4',
                            borderRadius: '8px',
                            border: '1px solid #10b981',
                            marginBottom: '16px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <span style={{ fontWeight: '600', fontSize: '16px' }}>Minimum Amount Due:</span>
                              <span style={{ fontWeight: '700', fontSize: '20px', color: '#10b981' }}>
                                {formatCurrency(minimumAmountDue)}
                              </span>
                            </div>
                            
                            {/* Payment Amount Input */}
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #bbf7d0' }}>
                              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#065f46' }}>
                                Amount to Pay *
                              </label>
                              <input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                                    setPaymentAmount(value);
                                  }
                                }}
                                placeholder={`Minimum: ${formatCurrency(minimumAmountDue)}`}
                                min={minimumAmountDue}
                                step="0.01"
                                style={{
                                  width: '100%',
                                  padding: '12px',
                                  border: paymentAmount && parseFloat(paymentAmount) >= minimumAmountDue ? '2px solid #10b981' : '2px solid #dc2626',
                                  borderRadius: '8px',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  boxSizing: 'border-box'
                                }}
                              />
                              {paymentAmount && parseFloat(paymentAmount) > 0 && (
                                <div style={{ marginTop: '8px', fontSize: '13px' }}>
                                  {parseFloat(paymentAmount) >= minimumAmountDue ? (
                                    <div style={{ color: '#10b981', fontWeight: '600' }}>
                                      ✓ Payment Amount: {formatCurrency(parseFloat(paymentAmount))}
                                    </div>
                                  ) : (
                                    <div style={{ color: '#dc2626', fontWeight: '600' }}>
                                      ⚠️ Amount is less than required. Minimum: {formatCurrency(minimumAmountDue)}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Cash Amount Input */}
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #bbf7d0' }}>
                              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#065f46' }}>
                                Cash Received *
                              </label>
                              <input
                                type="number"
                                value={cashAmount}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                                    setCashAmount(value);
                                  }
                                }}
                                placeholder="Enter cash amount"
                                min={paymentAmountNum}
                                step="0.01"
                                style={{
                                  width: '100%',
                                  padding: '12px',
                                  border: cashAmountNum >= paymentAmountNum ? '2px solid #10b981' : '2px solid #e5e7eb',
                                  borderRadius: '8px',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  boxSizing: 'border-box'
                                }}
                              />
                              {cashAmount && parseFloat(cashAmount) > 0 && (
                                <div style={{ marginTop: '8px', fontSize: '13px' }}>
                                  {cashAmountNum >= paymentAmountNum ? (
                                    <div style={{ color: '#10b981', fontWeight: '600' }}>
                                      ✓ Cash: {formatCurrency(cashAmountNum)}
                                      {change > 0 && (
                                        <span style={{ marginLeft: '8px', color: '#059669' }}>
                                          | Change: {formatCurrency(change)}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div style={{ color: '#dc2626', fontWeight: '600' }}>
                                      ⚠️ Cash is less than payment amount. Short: {formatCurrency(paymentAmountNum - cashAmountNum)}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {selectedPaymentsList.some(p => p.has_penalty) && (
                              <div style={{ marginTop: '12px', fontSize: '13px', color: '#dc2626', padding: '8px', background: '#fef2f2', borderRadius: '6px' }}>
                                Includes penalty fees for overdue payments
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div style={{
                padding: '16px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px'
              }}>
                <button
                  onClick={() => {
                    setShowInstallmentPaymentModal(false);
                    setSelectedInstallmentForPayment(null);
                    setSelectedPayments([]);
                    setPayAllUnpaid(false);
                    setManualAdjustment(false);
                    setAdjustedAmount('');
                    setPaymentAmount('');
                    setCashAmount('');
                  }}
                  style={{
                    padding: '10px 24px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                {selectedInstallmentForPayment && (() => {
                  // Calculate total amount due for button state
                  const customerInstallmentIds = installmentList.filter(inst => 
                    inst.cust_id === selectedCustomer?.cust_id
                  ).map(inst => inst.installment_sales_id);
                  
                  const customerInstallmentDetails = installmentDList.filter(detail =>
                    customerInstallmentIds.includes(detail.installment_id)
                  );

                  const installmentSchedules = customerInstallmentDetails.filter(schedule =>
                    schedule.installment_id === selectedInstallmentForPayment.installment_sales_id
                  );

                  const unpaidPayments = installmentSchedules
                    .filter(payment => payment.status !== 'Paid')
                    .map(payment => calculateOverduePenalty(payment))
                    .sort((a, b) => parseInt(a.payment_number) - parseInt(b.payment_number));

                  const selectedPaymentsList = payAllUnpaid ? unpaidPayments : unpaidPayments.filter(p =>
                    selectedPayments.includes(p.ips_id)
                  );

                  // Calculate required payments
                  const overduePayments = unpaidPayments.filter(payment => payment.days_overdue >= 3);
                  const requiredPayments = overduePayments.length > 0 
                    ? overduePayments 
                    : (unpaidPayments.length > 0 ? [unpaidPayments[0]] : []);
                  const totalAmountDue = requiredPayments.reduce((sum, payment) => sum + payment.total_amount, 0);
                  
                  const paymentAmountNum = parseFloat(paymentAmount || 0);
                  const cashAmountNum = parseFloat(cashAmount || 0);
                  
                  const isDisabled = !paymentAmount || 
                                     paymentAmountNum < totalAmountDue ||
                                     !cashAmount ||
                                     cashAmountNum < paymentAmountNum;

                  return (
                    <button
                      onClick={RecordInstallmentPayment}
                      disabled={isDisabled}
                      style={{
                        padding: '10px 24px',
                        background: isDisabled ? '#d1d5db' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Record Payment
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Customization Modal */}
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
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {editingCartItem
                    ? 'Edit Item'
                    : (customizationType === 'semi' ? 'Semi-Customization' : 'Full Customization')}
                </h2>
                <button
                  onClick={() => {
                    setShowCustomizationModal(false);
                    resetCustomization();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: '16px' }} hidden={customizationType === 'full'}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
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
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
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
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  {customizationType === 'semi'
                    ? 'Customizations/Modifications *'
                    : 'Additional Details'}
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
                    : 'Any additional specifications or notes'}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
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
                  <div style={{
                    fontSize: '12px',
                    color: '#92400e',
                    marginTop: '4px',
                    fontWeight: '500'
                  }}>
                    Price: ₱{customization.price.toLocaleString()}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Quantity
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setCustomization({
                      ...customization,
                      quantity: Math.max(1, customization.quantity - 1)
                    })}
                    style={{
                      padding: '8px 16px',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '18px'
                    }}
                  >
                    −
                  </button>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    minWidth: '40px',
                    textAlign: 'center'
                  }}>
                    {customization.quantity}
                  </span>
                  <button
                    onClick={() => setCustomization({
                      ...customization,
                      quantity: customization.quantity + 1
                    })}
                    style={{
                      padding: '8px 16px',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '18px'
                    }}
                  >
                    +
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

        {/* Main Content */}
        <div style={{ minHeight: '100vh', background: 'transparent', padding: '16px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              padding: '24px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0
                }}>
                  A.G Home POS System
                </h1>
                {/* <button
                  onClick={() => setShowLocationChangeModal(true)}
                  style={{
                    padding: '8px 16px',
                    background: '#0e74f0ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0c63d4';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0e74f0ff';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Change Location
                </button> */}
              </div>
              <p style={{ color: '#6b7280', margin: '8px 0' }}>
                Location: <strong style={{ color: '#0e74f0ff' }}>{location_Name}</strong> | Date: {new Date().toLocaleDateString()} |
                {saleMode === 'inventory' ? ` Stock Products: ${products.length}` : ` All Products: ${allProducts.length}`}
              </p>

              {/* Mode Selector */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '16px',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <button
                  onClick={() => {
                    setSaleMode('inventory');
                    setCart([]);
                    setSearchTerm('');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: saleMode === 'inventory' ? '#0e74f0ff' : 'white',
                    color: saleMode === 'inventory' ? 'white' : '#1f2937',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Inventory Sales
                </button>
                <button
                  onClick={() => {
                    setSaleMode('custom');
                    setCart([]);
                    setSearchTerm('');
                    setCustomerType('customer');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: saleMode === 'custom' ? '#0e74f0ff' : 'white',
                    color: saleMode === 'custom' ? 'white' : '#1f2937',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Custom Orders
                </button>
              </div>

              {/* Customization Management Button */}
              <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowCustomizeManagementModal(true)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #7c3aed',
                    background: 'white',
                    color: '#7c3aed',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#7c3aed';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#7c3aed';
                  }}
                >
                  Manage Customization Orders
                </button>
                {/* <button
                  onClick={openExchangeModal}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #f59e0b',
                    background: 'white',
                    color: '#f59e0b',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f59e0b';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#f59e0b';
                  }}
                >
                  Process Exchange
                </button> */}
              </div>

              {saleMode === 'custom' && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: '#f0f9ff',
                  borderRadius: '8px',
                  border: '1px solid #bae6fd'
                }}>
                  <p style={{
                    fontSize: '13px',
                    color: '#0369a1',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    <strong>Custom Mode:</strong> Select base products to customize or create fully custom items.
                    Orders will be sent to warehouse for fulfillment.
                  </p>
                </div>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth > 1024 ? '2fr 1fr' : '1fr',
              gap: '24px',
              alignItems: 'start'
            }}>
              {/* Products Section */}




              <div style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                padding: '24px',
                height: 'fit-content',
                minHeight: window.innerWidth > 1024 ? '800px' : 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {saleMode === 'custom' && (
                  <div style={{ marginBottom: '24px' }}>
                    <button
                      onClick={() => openCustomization('full')}
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '16px',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      Create Full Custom Product
                    </button>
                  </div>
                )}

                <div style={{ position: 'relative', marginBottom: '24px' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    opacity: 0.5
                  }}>
                    🔍
                  </div>

                  <input
                    type="text"
                    placeholder={saleMode === 'inventory'
                      ? "Search inventory products..."
                      : "Search products to customize..."}
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
                      boxSizing: 'border-box'
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
                        fontSize: '20px',
                        opacity: 0.5
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth > 768 ? 'repeat(2, 1fr)' : '1fr',
                  gap: '16px',
                  minHeight: '600px',
                  maxHeight: '600px',
                  overflowY: 'auto',
                  flex: 1
                }}>
                  {currentProducts.length === 0 ? (
                    <div style={{
                      gridColumn: 'span 2',
                      textAlign: 'center',
                      padding: '48px',
                      color: '#6b7280'
                    }}>
                      {searchTerm ? 'No products found matching your search.' : 'No products available.'}
                    </div>
                  ) : (
                    currentProducts.map(product => (
                      <div
                        key={product.product_id}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '16px',
                          cursor: 'pointer',
                          opacity: (saleMode === 'inventory' && inventory[product.product_id] <= 0) ? 0.5 : 1,
                          transition: 'box-shadow 0.3s',
                          display: 'flex',
                          flexDirection: 'column',
                          minHeight: '320px',
                          height: '320px'
                        }}
                        onClick={() => addToCart(product)}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                      >
                        {/* Product Image */}
                        <div style={{
                          width: '100%',
                          height: '140px',
                          marginBottom: '12px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          backgroundColor: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <img
                            src={product.product_preview_image || '/uploads/products/defualt.jpg'}
                            alt={product.product_name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.target.src = '/uploads/products/defualt.jpg';
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-start' }}>
                          <h3 style={{ fontWeight: '600', fontSize: '16px', margin: 0, flex: 1 }}>{product.product_name}</h3>
                          {saleMode === 'inventory' && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              height: 'fit-content',
                              background: inventory[product.product_id] > 5
                                ? '#d1fae5'
                                : inventory[product.product_id] > 0
                                  ? '#fed7aa'
                                  : '#fee2e2',
                              color: inventory[product.product_id] > 5
                                ? '#065f46'
                                : inventory[product.product_id] > 0
                                  ? '#92400e'
                                  : '#991b1b'
                            }}>
                              Stock: {inventory[product.product_id]}
                            </span>
                          )}
                        </div>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0 0 4px 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {product.description}
                        </p>
                        {product.color && product.color !== 'N/A' && (
                          <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 8px 0' }}>
                            Color: {product.color}
                          </p>
                        )}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 'auto',
                          paddingTop: '12px'
                        }}>
                          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#7c3aed' }}>
                            ₱{parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <button
                            style={{
                              background: (saleMode === 'inventory' && inventory[product.product_id] <= 0)
                                ? '#d1d5db'
                                : '#7c3aed',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              border: 'none',
                              cursor: (saleMode === 'inventory' && inventory[product.product_id] <= 0)
                                ? 'not-allowed'
                                : 'pointer',
                              minWidth: '100px',
                              whiteSpace: 'nowrap'
                            }}
                            disabled={saleMode === 'inventory' && inventory[product.product_id] <= 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                          >
                            {saleMode === 'custom' ? 'Customize' : 'Add +'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && currentProducts.length > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    paddingTop: '16px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <CustomPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      color="purple"
                    />
                  </div>
                )}

                {/* Products count info */}
                <div style={{
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  Showing {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
                  {searchTerm && ` (filtered from ${getProductsList().length} total)`}
                </div>
              </div>

              {/* Cart Section */}
              <div 
                ref={cartRef}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: highlightCart 
                    ? '0 0 0 4px rgba(124, 58, 237, 0.3), 0 10px 25px rgba(0,0,0,0.1)' 
                    : '0 10px 25px rgba(0,0,0,0.1)',
                  padding: '24px',
                  height: 'fit-content',
                  minHeight: window.innerWidth > 1024 ? '800px' : 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.3s ease-in-out',
                  position: 'relative'
                }}
              >
                {/* Pay Installment Button - Highlighted Above Cart */}
                <button
                  onClick={openInstallmentPaymentModal}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '20px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  
                  <span>Pay Installment</span>
                </button>

                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  marginBottom: '16px',
                  color: highlightCart ? '#7c3aed' : '#1f2937',
                  transition: 'color 0.3s ease-in-out'
                }}>
                  🛒 Cart
                  {highlightCart && (
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '14px',
                      color: '#10b981',
                      fontWeight: 'normal',
                      animation: 'fadeIn 0.3s ease-in-out'
                    }}>
                      ✓ Item added!
                    </span>
                  )}
                </h2>

                {/* Customer Type Selection - HIDDEN: All sales require a customer */}

                {/* Customer Selection Mode Toggle */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '20px', fontWeight: '500', marginBottom: '12px' }}>
                    Customer Selection *
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <button
                      onClick={() => {
                        setCustomerMode('old');
                        setSelectedCustomer(null);
                        setCustomerSearchTerm('');
                        setNewCustomerName('');
                        setNewCustomerEmail('');
                        setNewCustomerPhone('');
                        setNewCustomerAddress('');
                        setEmailError('');
                        setPhoneError('');
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: customerMode === 'old' ? '#7c3aed' : '#f3f4f6',
                        color: customerMode === 'old' ? 'white' : '#1f2937',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                    >
                      Existing Customer
                    </button>
                    <button
                      onClick={() => {
                        setCustomerMode('new');
                        setSelectedCustomer(null);
                        setCustomerSearchTerm('');
                        setNewCustomerName('');
                        setNewCustomerEmail('');
                        setNewCustomerPhone('');
                        setNewCustomerAddress('');
                        setEmailError('');
                        setPhoneError('');
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: customerMode === 'new' ? '#10b981' : '#f3f4f6',
                        color: customerMode === 'new' ? 'white' : '#1f2937',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                    >
                      New Customer
                    </button>
                  </div>
                </div>

                {/* Old Customer Search and Selection */}
                {customerMode === 'old' && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
                      Search Existing Customer *
                    </label>
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                      <input
                        ref={customerSearchRef}
                        type="text"
                        placeholder="Search customers by name, email, or phone..."
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{
                      maxHeight: '150px',
                      overflowY: 'auto',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      background: '#f9fafb'
                    }}>
                      {filteredCustomers.length === 0 ? (
                        <div style={{
                          padding: '12px',
                          textAlign: 'center',
                          color: '#6b7280',
                          fontSize: '14px'
                        }}>
                          {customerSearchTerm
                            ? 'No customers found matching your search.'
                            : `${customerList.length} customers available`}
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
                          >
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{customer.cust_name}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {customer.phone} • {customer.email}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

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

                {/* New Customer Form */}
                {customerMode === 'new' && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      padding: '16px',
                      background: '#f0fdf4',
                      borderRadius: '8px',
                      border: '2px solid #bbf7d0',
                      marginBottom: '12px'
                    }}>
                      <p style={{
                        margin: '0 0 12px 0',
                        fontSize: '13px',
                        color: '#166534',
                        fontWeight: '600'
                      }}>
                        ℹ️ Enter customer information. Customer will be created when you proceed with purchase.
                      </p>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                        Customer Name * <span style={{ color: '#dc2626' }}>(Must be unique)</span>
                      </label>
                      <input
                        ref={newCustomerNameRef}
                        type="text"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        placeholder="Enter customer full name"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                      {newCustomerName && customerList.some(customer => 
                        customer.cust_name.toLowerCase().trim() === newCustomerName.toLowerCase().trim()
                      ) && (
                        <div style={{
                          marginTop: '4px',
                          fontSize: '12px',
                          color: '#dc2626',
                          fontWeight: '500'
                        }}>
                          ⚠️ A customer with this name already exists!
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                        Email Address * <span style={{ color: '#dc2626' }}>(Must be unique)</span>
                      </label>
                      <input
                        ref={newCustomerEmailRef}
                        type="email"
                        value={newCustomerEmail}
                        onChange={handleEmailChange}
                        placeholder="Enter customer email (e.g., name@example.com)"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: emailError ? '2px solid #dc2626' : '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s'
                        }}
                        onBlur={() => {
                          if (newCustomerEmail.trim()) {
                            const emailValidation = validateEmailFormat(newCustomerEmail);
                            if (!emailValidation.valid) {
                              setEmailError(emailValidation.error);
                            } else {
                              const emailExists = customerList.some(customer => 
                                customer.email.toLowerCase().trim() === newCustomerEmail.toLowerCase().trim()
                              );
                              setEmailError(emailExists ? 'A customer with this email already exists' : '');
                            }
                          }
                        }}
                      />
                      {emailError && (
                        <div style={{
                          marginTop: '6px',
                          padding: '8px',
                          fontSize: '12px',
                          color: '#dc2626',
                          fontWeight: '500',
                          background: '#fee2e2',
                          borderRadius: '6px',
                          border: '1px solid #fecaca'
                        }}>
                          ⚠️ {emailError}
                        </div>
                      )}
                      {newCustomerEmail && !emailError && validateEmailFormat(newCustomerEmail).valid && (
                        <div style={{
                          marginTop: '6px',
                          fontSize: '12px',
                          color: '#10b981',
                          fontWeight: '500'
                        }}>
                          ✓ Valid email format
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                        Phone Number * <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '400' }}>(Philippine format)</span>
                      </label>
                      <input
                        ref={newCustomerPhoneRef}
                        type="tel"
                        value={newCustomerPhone}
                        onChange={handlePhoneChange}
                        placeholder="Enter phone number (e.g., 09123456789, +639123456789)"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: phoneError ? '2px solid #dc2626' : '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s'
                        }}
                        onBlur={() => {
                          if (newCustomerPhone.trim()) {
                            const phoneValidation = validatePhoneNumber(newCustomerPhone);
                            if (!phoneValidation.valid) {
                              setPhoneError(phoneValidation.error);
                            } else {
                              setPhoneError('');
                            }
                          }
                        }}
                      />
                      {phoneError && (
                        <div style={{
                          marginTop: '6px',
                          padding: '8px',
                          fontSize: '12px',
                          color: '#dc2626',
                          fontWeight: '500',
                          background: '#fee2e2',
                          borderRadius: '6px',
                          border: '1px solid #fecaca'
                        }}>
                          ⚠️ {phoneError}
                        </div>
                      )}
                      {newCustomerPhone && !phoneError && validatePhoneNumber(newCustomerPhone).valid && (
                        <div style={{
                          marginTop: '6px',
                          fontSize: '12px',
                          color: '#10b981',
                          fontWeight: '500'
                        }}>
                          ✓ Valid Philippine phone number
                        </div>
                      )}
                      <div style={{
                        marginTop: '6px',
                        fontSize: '11px',
                        color: '#6b7280',
                        fontStyle: 'italic'
                      }}>
                        Acceptable formats: 09XXXXXXXXX, +639XXXXXXXXX, or 639XXXXXXXXX
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                        Address *
                      </label>
                      <textarea
                        ref={newCustomerAddressRef}
                        value={newCustomerAddress}
                        onChange={(e) => setNewCustomerAddress(e.target.value)}
                        placeholder="Enter customer address"
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>

                    {newCustomerName && newCustomerEmail && newCustomerPhone && newCustomerAddress && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: '#e0e7ff',
                        borderRadius: '6px',
                        border: '1px solid #c7d2fe'
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#1e40af', marginBottom: '4px' }}>
                          ✓ Customer Information Ready
                        </div>
                        <div style={{ fontSize: '12px', color: '#3730a3' }}>
                          Customer will be created when you proceed with purchase.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Cart Items */}
                <div style={{ marginBottom: '16px', maxHeight: '200px', overflowY: 'auto' }}>
                  {cart.length === 0 ? (
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '32px 0' }}>
                      Cart is empty
                    </p>
                  ) : (
                    cart.map(item => (
                      <div
                        key={item.product_id}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px',
                          marginBottom: '12px',
                          background: item.isCustom
                            ? (item.customizationType === 'full' ? '#fef3c7' : '#ddd6fe')
                            : 'white'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <h4 style={{ fontWeight: '600', margin: 0, fontSize: '14px' }}>
                                {item.product_name ? item.product_name : 'Custom Product'}
                              </h4>
                              {item.isCustom && (
                                <span style={{
                                  fontSize: '10px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: item.customizationType === 'full' ? '#f59e0b' : '#7c3aed',
                                  color: 'white'
                                }}>
                                  {item.customizationType === 'full' ? 'FULL' : 'SEMI'}
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0' }}>
                              {item.description}
                            </p>
                            {item.modifications && (
                              <p style={{
                                fontSize: '12px',
                                color: '#7c3aed',
                                fontStyle: 'italic',
                                margin: '4px 0'
                              }}>
                                <strong>Mods:</strong> {item.modifications}
                              </p>
                            )}
                            <p style={{ fontSize: '14px', color: '#1f2937', margin: '4px 0' }}>
                              ₱{item.price.toLocaleString()} each
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                            {item.isCustom && (
                              <button
                                onClick={() => openEditCartItem(item)}
                                style={{
                                  color: '#7c3aed',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  fontSize: '16px'
                                }}
                                title="Edit item"
                              >
                                ✏️
                              </button>
                            )}
                            <button
                              onClick={() => removeFromCart(item.product_id)}
                              style={{
                                color: '#ef4444',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                fontSize: '16px'
                              }}
                              title="Remove item"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              style={{
                                padding: '4px 8px',
                                background: '#f3f4f6',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              −
                            </button>
                            <span style={{ width: '48px', textAlign: 'center' }}>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              style={{
                                padding: '4px 8px',
                                background: '#f3f4f6',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              +
                            </button>
                          </div>
                          <span style={{ fontWeight: '600' }}>
                            ₱{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Discount - Hidden for installments */}
                {paymentPlan !== 'installment' && (
                  <div style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '16px',
                    marginBottom: '16px'
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: '20px',
                      fontWeight: '500',
                      marginBottom: '8px'
                    }}>
                      Discount (%)
                    </label>

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
                      <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#16a34a',
                        fontWeight: '500'
                      }}>
                        Discount Amount: -₱{calculateDiscount().toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Plan Selection */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '20px',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Payment Plan
                  </label>
                  <button
                    onClick={() => {
                      const newPlan = paymentPlan === 'full' ? 'installment' : 'full';
                      setPaymentPlan(newPlan);

                      if (newPlan === 'installment') {
                        if (saleMode === 'inventory') {
                          setCustomerType('customer');
                        }
                        setDiscountValue(0);
                        setCustomDownpayment('');
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
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {paymentPlan === 'full'
                      ? 'Switch to Installment Payment'
                      : 'Switch to Full Payment'}
                  </button>

                  {/* Partial Payment for Full Payment - Only for Custom Items */}
                  {paymentPlan === 'full' && cart.length > 0 && (saleMode === 'custom' || cart.some(item => item.isCustom)) && (
                    <div style={{
                      marginTop: '12px',
                      background: '#f0fdf4',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <input
                          type="checkbox"
                          id="partialPayment"
                          checked={usePartialPayment}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setUsePartialPayment(isChecked);
                            if (isChecked) {
                              setPartialPaymentAmount(calculateMinimumPartialPayment());
                            } else {
                              setPartialPaymentAmount('');
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <label
                          htmlFor="partialPayment"
                          style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#166534',
                            cursor: 'pointer'
                          }}
                        >
                          Pay Partial Amount (Min 50%) - Custom Orders Only
                        </label>
                      </div>

                      {usePartialPayment && (
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '500',
                            marginBottom: '6px',
                            color: '#166534'
                          }}>
                            Payment Amount (Min 50%: ₱{calculateMinimumPartialPayment().toLocaleString()})
                          </label>
                          <input
                            ref={partialPaymentRef}
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
                            <div style={{
                              marginTop: '8px',
                              padding: '8px',
                              background: '#dcfce7',
                              borderRadius: '6px'
                            }}>
                              <div style={{ fontSize: '12px', color: '#166534' }}>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  marginBottom: '4px'
                                }}>
                                  <span>Paying Today:</span>
                                  <span style={{ fontWeight: '600' }}>
                                    ₱{parseFloat(partialPaymentAmount).toLocaleString()}
                                  </span>
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

                  {/* Installment Configuration */}
                  {paymentPlan === 'installment' && (
                    <div style={{
                      background: '#fff7ed',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #fed7aa',
                      marginTop: '12px'
                    }}>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: '500',
                          marginBottom: '6px',
                          color: '#92400e'
                        }}>
                          Payment Period
                        </label>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: '6px'
                        }}>
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
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {month} mo{month === 3 ? ' (0%)' : ''}
                            </button>
                          ))}
                        </div>
                      </div>

                      {installmentDetails.months !== 3 && (
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '500',
                            marginBottom: '6px',
                            color: '#92400e'
                          }}>
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
                              background: '#fefbf6',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      )}

                      <div style={{ marginBottom: '12px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: '500',
                          marginBottom: '6px',
                          color: '#92400e'
                        }}>
                          Downpayment Amount (Minimum 20%: ₱{(calculateTotal() * 0.2).toLocaleString()})
                        </label>
                        <input
                          type="number"
                          value={customDownpayment || ''}
                          onChange={(e) => {
                            const inputValue = e.target.value;

                            if (inputValue === '') {
                              setCustomDownpayment('');
                              return;
                            }

                            const numValue = parseFloat(inputValue);

                            if (!isNaN(numValue) && numValue >= 0) {
                              setCustomDownpayment(numValue);
                            }
                          }}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            const total = calculateTotal();
                            const minimum = total * 0.2;

                            if (value > 0 && value < minimum) {
                              setCustomDownpayment(minimum);
                            } else if (value > total) {
                              setCustomDownpayment(total);
                            } else if (value === 0 || e.target.value === '') {
                              setCustomDownpayment(minimum);
                            }
                          }}
                          placeholder={`Minimum: ₱${(calculateTotal() * 0.2).toLocaleString()}`}
                          min={calculateTotal() * 0.2}
                          max={calculateTotal()}
                          step="100"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #fed7aa',
                            borderRadius: '6px',
                            fontSize: '13px',
                            background: '#fefbf6',
                            boxSizing: 'border-box'
                          }}
                        />
                        {customDownpayment > 0 && (
                          <div style={{
                            fontSize: '12px',
                            color: '#92400e',
                            marginTop: '4px',
                            fontWeight: '500'
                          }}>
                            Downpayment: ₱{parseFloat(customDownpayment).toLocaleString()}
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
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '4px'
                          }}>
                            <span style={{ color: '#78350f' }}>Downpayment Today:</span>
                            <span style={{ fontWeight: '600', color: '#92400e' }}>
                              ₱{calculateDownpayment().toLocaleString()}
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '4px'
                          }}>
                            <span style={{ color: '#78350f' }}>Remaining Balance:</span>
                            <span style={{ fontWeight: '600', color: '#92400e' }}>
                              ₱{(calculateTotal() - calculateDownpayment()).toLocaleString()}
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '4px'
                          }}>
                            <span style={{ color: '#78350f' }}>Monthly Payment:</span>
                            <span style={{ fontWeight: '600', color: '#92400e' }}>
                              ₱{installmentDetails.monthlyPayment.toLocaleString()}
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '4px'
                          }}>
                            <span style={{ color: '#78350f' }}>Payment Duration:</span>
                            <span style={{ fontWeight: '600', color: '#92400e' }}>
                              {installmentDetails.months} months
                            </span>
                          </div>

                          {installmentDetails.months !== 3 && (
                            <>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '4px'
                              }}>
                                <span style={{ color: '#78350f' }}>Interest Rate:</span>
                                <span style={{ fontWeight: '600', color: '#92400e' }}>
                                  {installmentDetails.interestRate}%
                                </span>
                              </div>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingTop: '6px',
                                borderTop: '1px solid #fde68a',
                                marginTop: '6px'
                              }}>
                                <span style={{ color: '#78350f', fontWeight: '500' }}>
                                  Total with Interest:
                                </span>
                                <span style={{ fontWeight: '700', color: '#dc2626' }}>
                                  ₱{installmentDetails.totalWithInterest.toLocaleString()}
                                </span>
                              </div>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '11px',
                                color: '#78350f'
                              }}>
                                <span>Interest Amount:</span>
                                <span>
                                  ₱{(installmentDetails.totalWithInterest - calculateTotal()).toLocaleString()}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Payment Schedule Info */}
                        <div style={{
                          marginTop: '8px',
                          paddingTop: '8px',
                          borderTop: '1px solid #fde68a'
                        }}>
                          <div style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#92400e',
                            marginBottom: '6px'
                          }}>
                            Payment Schedule:
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: '#78350f',
                            padding: '6px 8px',
                            background: 'rgba(254, 243, 199, 0.5)',
                            borderRadius: '4px',
                            lineHeight: '1.4'
                          }}>
                            📅 Schedule will be created after delivery. First payment due one month from delivery date.
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
                          ? `No interest for 3-month plan. Pay ₱${installmentDetails.monthlyPayment.toLocaleString()} monthly for ${installmentDetails.months} months`
                          : `Customer pays downpayment today, then ₱${installmentDetails.monthlyPayment.toLocaleString()} monthly for ${installmentDetails.months} months with ${installmentDetails.interestRate}% annual interest`
                        }
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                {/* <div style={{
                  marginBottom: '16px',
                  opacity: ((!customerType && saleMode === 'inventory') || ((customerType === 'customer' || saleMode === 'custom') && !selectedCustomer)) ? 0.5 : 1,
                  pointerEvents: ((!customerType && saleMode === 'inventory') || ((customerType === 'customer' || saleMode === 'custom') && !selectedCustomer)) ? 'none' : 'auto'
                }}>
                  <label style={{
                    display: 'block',
                    fontSize: '20px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    color: '#374151'
                  }}>
                    Payment Method
                    {((!customerType && saleMode === 'inventory') || ((customerType === 'customer' || saleMode === 'custom') && !selectedCustomer)) && (
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
                </div> */}

                {/* Delivery Option */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    background: '#f0f9ff',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <input
                        type="checkbox"
                        id="deliveryOption"
                        checked={needsDelivery}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setNeedsDelivery(isChecked);
                          if (!isChecked) {
                            setDeliveryAddress('');
                            setPreferredDeliveryTime('');
                          }
                        }}
                        disabled={paymentPlan === 'installment' || saleMode === 'custom'}
                        style={{ 
                          cursor: (paymentPlan === 'installment' || saleMode === 'custom') ? 'not-allowed' : 'pointer',
                          width: '16px',
                          height: '16px'
                        }}
                      />
                      <label
                        htmlFor="deliveryOption"
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#0369a1',
                          cursor: (paymentPlan === 'installment' || saleMode === 'custom') ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Customer wants delivery
                        {(paymentPlan === 'installment' || saleMode === 'custom') && (
                          <span style={{ fontSize: '12px', color: '#f59e0b', marginLeft: '8px' }}>
                            (Required)
                          </span>
                        )}
                      </label>
                    </div>

                    {needsDelivery && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '500',
                            marginBottom: '6px',
                            color: '#0c4a6e'
                          }}>
                            Delivery Address / Note *
                          </label>
                          <textarea
                            ref={deliveryAddressRef}
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            rows={3}
                            placeholder="Enter complete delivery address and any special instructions..."
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #bae6fd',
                              borderRadius: '6px',
                              fontSize: '13px',
                              resize: 'vertical',
                              boxSizing: 'border-box',
                              fontFamily: 'inherit'
                            }}
                          />
                        </div>

                        {/* Show preferred time only for non-custom orders */}
                        {saleMode !== 'custom' && (
                          <div>
                            <label style={{
                              display: 'block',
                              fontSize: '13px',
                              fontWeight: '500',
                              marginBottom: '6px',
                              color: '#0c4a6e'
                            }}>
                              Preferred Delivery Time (Optional)
                            </label>
                            <input
                              type="datetime-local"
                              value={preferredDeliveryTime}
                              onChange={(e) => setPreferredDeliveryTime(e.target.value)}
                              min={new Date().toISOString().slice(0, 16)}
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #bae6fd',
                                borderRadius: '6px',
                                fontSize: '13px',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        )}

                        {saleMode === 'custom' && (
                          <div style={{
                            fontSize: '12px',
                            color: '#0369a1',
                            fontStyle: 'italic',
                            marginTop: '8px',
                            padding: '8px',
                            background: '#e0f2fe',
                            borderRadius: '4px'
                          }}>
                            ℹ️ Custom orders will be delivered once completed. Delivery time will be communicated separately.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Warehouse Selection for Custom Orders */}
                {saleMode === 'custom' && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      color: '#374151'
                    }}>
                      Send Request To Warehouse *
                    </label>
                    <select
                      ref={warehouseSelectRef}
                      value={requestTo}
                      onChange={(e) => setRequestTo(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: requestTo ? '1px solid #e5e7eb' : '2px solid #ef4444',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: 'white',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                      onBlur={(e) => e.target.style.borderColor = requestTo ? '#e5e7eb' : '#ef4444'}
                    >
                      <option value="">-- Select Warehouse Location --</option>
                      {locationList
                        .filter((r) => r.name === "Warehouse")
                        .map((r) => (
                          <option key={r.location_id} value={r.location_id}>
                            {r.location_name}
                          </option>
                        ))}
                    </select>
                    {!requestTo && cart.length > 0 && (
                      <div style={{
                        fontSize: '12px',
                        color: '#dc2626',
                        marginTop: '4px',
                        fontWeight: '500'
                      }}>
                        ⚠️ Please select a warehouse to fulfill this custom order
                      </div>
                    )}
                    {requestTo && (
                      <div style={{
                        fontSize: '12px',
                        color: '#10b981',
                        marginTop: '4px',
                        fontWeight: '500'
                      }}>
                        ✓ Order will be sent to {locationList.find(l => l.location_id == requestTo)?.location_name}
                      </div>
                    )}
                  </div>
                )}
                <div>

                </div>

                {/* Totals */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span>Subtotal:</span>
                    <span>₱{parseFloat(calculateSubtotal()).toLocaleString()}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    color: '#ef4444'
                  }}>
                    <span>Discount:</span>
                    <span>₱{parseFloat(calculateDiscount()).toLocaleString()}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '8px'
                  }}>
                    <span>Total:</span>
                    <span style={{ color: '#7c3aed' }}>
                      ₱{parseFloat(calculateTotal()).toLocaleString()}
                    </span>
                  </div>

                  {/* Payment Summary */}
                  <div style={{
                    background: paymentPlan === 'installment' ? '#fff7ed' : (usePartialPayment ? '#fef3c7' : '#f0fdf4'),
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: paymentPlan === 'installment' ? '1px solid #fed7aa' : (usePartialPayment ? '1px solid #fde68a' : '1px solid #bbf7d0')
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      <span>Amount Due Today:</span>
                      <span style={{
                        color: paymentPlan === 'installment' ? '#f59e0b' : (usePartialPayment ? '#f59e0b' : '#10b981')
                      }}>
                        ₱{calculateAmountDueToday().toLocaleString()}
                      </span>
                    </div>
                    {(paymentPlan === 'installment' || (paymentPlan === 'full' && usePartialPayment && partialPaymentAmount > 0)) && (
                      <>
                        <div style={{ fontSize: '12px', color: '#78350f', marginBottom: '4px' }}>
                          {paymentPlan === 'installment'
                            ? `Monthly: ₱${installmentDetails.monthlyPayment.toLocaleString()} × ${installmentDetails.months} months`
                            : 'Partial Payment'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>
                          Balance: ₱{(paymentPlan === 'installment'
                            ? (calculateTotal() - calculateDownpayment())
                            : calculateRemainingBalance()).toLocaleString()}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Cash Input - Only for Cash Payment */}
                  {paymentMethod === 'cash' && (
                    <div style={{
                      background: '#f0fdf4',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        color: '#065f46'
                      }}>
                        Cash Received *
                      </label>
                      <input
                        type="number"
                        value={mainPOSCashAmount}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                            setMainPOSCashAmount(value);
                          }
                        }}
                        placeholder={`Enter cash amount (min: ₱${calculateAmountDueToday().toLocaleString()})`}
                        min={calculateAmountDueToday()}
                        step="0.01"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: (() => {
                            const cashNum = parseFloat(mainPOSCashAmount) || 0;
                            const amountDue = calculateAmountDueToday();
                            return cashNum >= amountDue ? '2px solid #10b981' : '2px solid #e5e7eb';
                          })(),
                          borderRadius: '6px',
                          fontSize: '16px',
                          fontWeight: '600',
                          boxSizing: 'border-box'
                        }}
                      />
                      {mainPOSCashAmount && parseFloat(mainPOSCashAmount) > 0 && (() => {
                        const cashNum = parseFloat(mainPOSCashAmount);
                        const amountDue = calculateAmountDueToday();
                        const change = cashNum - amountDue;
                        return (
                          <div style={{ marginTop: '8px', fontSize: '13px' }}>
                            {cashNum >= amountDue ? (
                              <div style={{ color: '#10b981', fontWeight: '600' }}>
                                ✓ Cash: ₱{cashNum.toLocaleString()}
                                {change > 0 && (
                                  <span style={{ marginLeft: '8px', color: '#059669' }}>
                                    | Change: ₱{change.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div style={{ color: '#dc2626', fontWeight: '600' }}>
                                ⚠️ Cash is less than amount due. Short: ₱{(amountDue - cashNum).toLocaleString()}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Sales Processing Guide/Checklist */}
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
                  borderRadius: '12px',
                  border: '2px solid #bae6fd'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px',
                    gap: '8px'
                  }}>
               
                    <h3 style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1e40af'
                    }}>
                      Before You Process
                    </h3>
                  </div>

                  {(() => {
                    const checks = canProcessSale();
                    const allComplete = Object.values(checks).every(Boolean);

                    return (
                      <>
                        {/* Cart Items */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 0',
                          borderBottom: '1px solid #dbeafe'
                        }}>
                          <span style={{ fontSize: '16px' }}>
                            {checks.hasItems ? '✅' : '⚠️'}
                          </span>
                          <span style={{
                            fontSize: '13px',
                            color: checks.hasItems ? '#065f46' : '#dc2626',
                            fontWeight: checks.hasItems ? '500' : '600'
                          }}>
                            {checks.hasItems
                              ? `${cart.length} item${cart.length > 1 ? 's' : ''} in cart`
                              : 'Add items to cart'}
                          </span>
                        </div>

                        {/* Customer Selection - Required for all sales */}
                        <div 
                          onClick={() => {
                            if (!checks.hasCustomer) {
                              if (customerMode === 'old') {
                                scrollToField(customerSearchRef);
                              } else {
                                // For new customer mode, focus on the first empty field
                                if (!newCustomerName.trim()) {
                                  scrollToField(newCustomerNameRef);
                                } else if (!newCustomerEmail.trim()) {
                                  scrollToField(newCustomerEmailRef);
                                } else if (!newCustomerPhone.trim()) {
                                  scrollToField(newCustomerPhoneRef);
                                } else if (!newCustomerAddress.trim()) {
                                  scrollToField(newCustomerAddressRef);
                                } else {
                                  scrollToField(newCustomerNameRef);
                                }
                              }
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 0',
                            borderBottom: '1px solid #dbeafe',
                            cursor: !checks.hasCustomer ? 'pointer' : 'default',
                            transition: 'background 0.2s',
                            borderRadius: '4px',
                            paddingLeft: '4px',
                            paddingRight: '4px'
                          }}
                          onMouseEnter={(e) => {
                            if (!checks.hasCustomer) {
                              e.currentTarget.style.background = '#f0f9ff';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <span style={{ fontSize: '16px' }}>
                            {checks.hasCustomer ? '✅' : '⚠️'}
                          </span>
                          <span style={{
                            fontSize: '13px',
                            color: checks.hasCustomer ? '#065f46' : '#dc2626',
                            fontWeight: checks.hasCustomer ? '500' : '600'
                          }}>
                            {checks.hasCustomer
                              ? customerMode === 'new'
                                ? `New Customer: ${newCustomerName}`
                                : `Customer: ${selectedCustomer?.cust_name}`
                              : customerMode === 'new'
                                ? 'Complete customer information'
                                : 'Select a customer'}
                            {!checks.hasCustomer && (
                              <span style={{ fontSize: '11px', marginLeft: '6px', color: '#0369a1' }}>
                                (click to focus)
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Warehouse (Custom Mode Only) */}
                        {saleMode === 'custom' && (
                          <div 
                            onClick={() => !checks.hasWarehouse && scrollToField(warehouseSelectRef)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 0',
                              borderBottom: '1px solid #dbeafe',
                              cursor: !checks.hasWarehouse ? 'pointer' : 'default',
                              transition: 'background 0.2s',
                              borderRadius: '4px',
                              paddingLeft: '4px',
                              paddingRight: '4px'
                            }}
                            onMouseEnter={(e) => {
                              if (!checks.hasWarehouse) {
                                e.currentTarget.style.background = '#f0f9ff';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <span style={{ fontSize: '16px' }}>
                              {checks.hasWarehouse ? '✅' : '⚠️'}
                            </span>
                            <span style={{
                              fontSize: '13px',
                              color: checks.hasWarehouse ? '#065f46' : '#dc2626',
                              fontWeight: checks.hasWarehouse ? '500' : '600'
                            }}>
                              {checks.hasWarehouse
                                ? `Warehouse: ${locationList.find(l => l.location_id == requestTo)?.location_name}`
                                : 'Select warehouse location'}
                              {!checks.hasWarehouse && (
                                <span style={{ fontSize: '11px', marginLeft: '6px', color: '#0369a1' }}>
                                  (click to focus)
                                </span>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Delivery Address */}
                        {needsDelivery && (
                          <>
                            <div 
                              onClick={() => !checks.hasDeliveryAddress && scrollToField(deliveryAddressRef)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 0',
                                borderBottom: '1px solid #dbeafe',
                                cursor: !checks.hasDeliveryAddress ? 'pointer' : 'default',
                                transition: 'background 0.2s',
                                borderRadius: '4px',
                                paddingLeft: '4px',
                                paddingRight: '4px'
                              }}
                              onMouseEnter={(e) => {
                                if (!checks.hasDeliveryAddress) {
                                  e.currentTarget.style.background = '#f0f9ff';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <span style={{ fontSize: '16px' }}>
                                {checks.hasDeliveryAddress ? '✅' : '⚠️'}
                              </span>
                              <span style={{
                                fontSize: '13px',
                                color: checks.hasDeliveryAddress ? '#065f46' : '#dc2626',
                                fontWeight: checks.hasDeliveryAddress ? '500' : '600'
                              }}>
                                {checks.hasDeliveryAddress
                                  ? 'Delivery address provided'
                                  : 'Add delivery address'}
                                {!checks.hasDeliveryAddress && (
                                  <span style={{ fontSize: '11px', marginLeft: '6px', color: '#0369a1' }}>
                                    (click to focus)
                                  </span>
                                )}
                              </span>
                            </div>
                          </>
                        )}

                        {/* Partial Payment Validation */}
                        {paymentPlan === 'full' && usePartialPayment && (
                          <div 
                            onClick={() => !checks.hasValidPartialPayment && scrollToField(partialPaymentRef)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 0',
                              borderBottom: '1px solid #dbeafe',
                              cursor: !checks.hasValidPartialPayment ? 'pointer' : 'default',
                              transition: 'background 0.2s',
                              borderRadius: '4px',
                              paddingLeft: '4px',
                              paddingRight: '4px'
                            }}
                            onMouseEnter={(e) => {
                              if (!checks.hasValidPartialPayment) {
                                e.currentTarget.style.background = '#f0f9ff';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <span style={{ fontSize: '16px' }}>
                              {checks.hasValidPartialPayment ? '✅' : '⚠️'}
                            </span>
                            <span style={{
                              fontSize: '13px',
                              color: checks.hasValidPartialPayment ? '#065f46' : '#dc2626',
                              fontWeight: checks.hasValidPartialPayment ? '500' : '600'
                            }}>
                              {checks.hasValidPartialPayment
                                ? `Partial payment: ₱${parseFloat(partialPaymentAmount).toLocaleString()}`
                                : 'Partial payment must be ≥50% of total'}
                              {!checks.hasValidPartialPayment && (
                                <span style={{ fontSize: '11px', marginLeft: '6px', color: '#0369a1' }}>
                                  (click to focus)
                                </span>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Overall Status */}
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          background: allComplete ? '#d1fae5' : '#fef3c7',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: allComplete ? '#065f46' : '#92400e'
                          }}>
                            {allComplete
                              ? '🎉 Ready to Process!'
                              : '⏳ Complete the items above to proceed'}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Process Button */}
                <button
                  onClick={proceedPurchase}
                  disabled={
                    cart.length === 0 ||
                    (customerMode === 'old' && !selectedCustomer) ||
                    (customerMode === 'new' && (
                      !newCustomerName.trim() || 
                      !newCustomerEmail.trim() || 
                      !validateEmailFormat(newCustomerEmail).valid ||
                      !newCustomerPhone.trim() || 
                      !validatePhoneNumber(newCustomerPhone).valid ||
                      !newCustomerAddress.trim() ||
                      emailError ||
                      phoneError ||
                      customerList.some(c => c.cust_name.toLowerCase().trim() === newCustomerName.toLowerCase().trim()) ||
                      customerList.some(c => c.email.toLowerCase().trim() === newCustomerEmail.toLowerCase().trim())
                    )) ||
                    (paymentPlan === 'full' && usePartialPayment && (!partialPaymentAmount || partialPaymentAmount < calculateMinimumPartialPayment())) ||
                    (paymentMethod === 'cash' && (!mainPOSCashAmount || parseFloat(mainPOSCashAmount) < calculateAmountDueToday()))
                  }
                  style={{
                    width: '100%',
                    marginTop: '24px',
                    background: (cart.length === 0 ||
                      (customerMode === 'old' && !selectedCustomer) ||
                      (customerMode === 'new' && (
                        !newCustomerName.trim() || 
                        !newCustomerEmail.trim() || 
                        !validateEmailFormat(newCustomerEmail).valid ||
                        !newCustomerPhone.trim() || 
                        !validatePhoneNumber(newCustomerPhone).valid ||
                        !newCustomerAddress.trim() ||
                        emailError ||
                        phoneError ||
                        customerList.some(c => c.cust_name.toLowerCase().trim() === newCustomerName.toLowerCase().trim()) ||
                        customerList.some(c => c.email.toLowerCase().trim() === newCustomerEmail.toLowerCase().trim())
                      )) ||
                      (paymentPlan === 'full' && usePartialPayment && (!partialPaymentAmount || partialPaymentAmount < calculateMinimumPartialPayment()))
                    ) ? '#d1d5db' : '#7c3aed',
                    color: 'white',
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: (cart.length === 0 ||
                      (customerMode === 'old' && !selectedCustomer) ||
                      (customerMode === 'new' && (
                        !newCustomerName.trim() || 
                        !newCustomerEmail.trim() || 
                        !validateEmailFormat(newCustomerEmail).valid ||
                        !newCustomerPhone.trim() || 
                        !validatePhoneNumber(newCustomerPhone).valid ||
                        !newCustomerAddress.trim() ||
                        emailError ||
                        phoneError ||
                        customerList.some(c => c.cust_name.toLowerCase().trim() === newCustomerName.toLowerCase().trim()) ||
                        customerList.some(c => c.email.toLowerCase().trim() === newCustomerEmail.toLowerCase().trim())
                      )) ||
                      (paymentPlan === 'full' && usePartialPayment && (!partialPaymentAmount || partialPaymentAmount < calculateMinimumPartialPayment()))
                    ) ? 'not-allowed' : 'pointer',
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
                  {paymentPlan === 'full'
                    ? (usePartialPayment && partialPaymentAmount > 0
                      ? `Collect Partial Payment (₱${parseFloat(partialPaymentAmount).toLocaleString()})`
                      : 'Process Full Payment')
                    : `Collect Downpayment (₱${calculateDownpayment().toLocaleString()})`
                  }
                </button>
              </div>
            </div>
          </div>
        </div>

        <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          0% { 
            opacity: 0; 
            transform: scale(0.8);
          }
          100% { 
            opacity: 1; 
            transform: scale(1);
          }
        }
      `}</style>

      {/* Customization Management Modal */}
      {/* Exchange Modal */}
      {showExchangeModal && (
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
          zIndex: 2000,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '1200px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                🔄 Process Exchange
              </h2>
              <button
                onClick={() => {
                  setShowExchangeModal(false);
                  setExchangeSelectedCustomer(null);
                  setExchangeCustomerSearchTerm('');
                  setSelectedTransaction(null);
                  setSelectedOldItem(null);
                  setSelectedNewItem(null);
                  setExchangeQuantity(1);
                  setExchangeSearchTerm('');
                  setCustomerTransactions([]);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{
              padding: '24px',
              overflowY: 'auto',
              flex: 1
            }}>
              {/* Step 0: Select Customer */}
              {!exchangeSelectedCustomer && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                    Step 1: Select Customer
                  </h3>
                  <div style={{ marginBottom: '12px' }}>
                    <input
                      type="text"
                      placeholder="Search customers by name, phone, or email..."
                      value={exchangeCustomerSearchTerm}
                      onChange={(e) => setExchangeCustomerSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    {customerList
                      .filter(customer =>
                        customer.cust_name.toLowerCase().includes(exchangeCustomerSearchTerm.toLowerCase()) ||
                        (customer.phone && customer.phone.includes(exchangeCustomerSearchTerm)) ||
                        (customer.email && customer.email.toLowerCase().includes(exchangeCustomerSearchTerm.toLowerCase()))
                      )
                      .map((customer) => (
                        <div
                          key={customer.cust_id}
                          onClick={() => handleExchangeCustomerSelect(customer)}
                          style={{
                            padding: '16px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #e5e7eb',
                            background: 'white',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f9fafb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                          }}
                        >
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                            {customer.cust_name}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            {customer.phone && `Phone: ${customer.phone}`}
                            {customer.phone && customer.email && ' • '}
                            {customer.email && `Email: ${customer.email}`}
                          </div>
                        </div>
                      ))}
                    {customerList.filter(customer =>
                      customer.cust_name.toLowerCase().includes(exchangeCustomerSearchTerm.toLowerCase()) ||
                      (customer.phone && customer.phone.includes(exchangeCustomerSearchTerm)) ||
                      (customer.email && customer.email.toLowerCase().includes(exchangeCustomerSearchTerm.toLowerCase()))
                    ).length === 0 && (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                        No customers found.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              {exchangeSelectedCustomer && (
                <div style={{
                  padding: '16px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      Customer: {exchangeSelectedCustomer.cust_name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Phone: {exchangeSelectedCustomer.phone} | Email: {exchangeSelectedCustomer.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setExchangeSelectedCustomer(null);
                      setExchangeCustomerSearchTerm('');
                      setSelectedTransaction(null);
                      setSelectedOldItem(null);
                      setSelectedNewItem(null);
                      setExchangeQuantity(1);
                      setExchangeSearchTerm('');
                      setCustomerTransactions([]);
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Change Customer
                  </button>
                </div>
              )}

              {/* Step 1: Select Transaction */}
              {exchangeSelectedCustomer && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                    Step 2: Select Transaction
                  </h3>
                {loadingTransactions ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    Loading transactions...
                  </div>
                ) : customerTransactions.length === 0 ? (
                  <div style={{
                    padding: '24px',
                    background: '#fef3c7',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: '#92400e'
                  }}>
                    No transactions found for this customer.
                  </div>
                ) : (
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    {customerTransactions.map((transaction) => (
                      <div
                        key={transaction.invoice_id}
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setSelectedOldItem(null);
                          setSelectedNewItem(null);
                          setExchangeQuantity(1);
                        }}
                        style={{
                          padding: '16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #e5e7eb',
                          background: selectedTransaction?.invoice_id === transaction.invoice_id ? '#eff6ff' : 'white',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedTransaction?.invoice_id !== transaction.invoice_id) {
                            e.currentTarget.style.background = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedTransaction?.invoice_id !== transaction.invoice_id) {
                            e.currentTarget.style.background = 'white';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: '600' }}>
                              Invoice #{transaction.invoice_id}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              {transaction.date} • {formatCurrency(transaction.total || transaction.final_total_amount || 0)}
                            </div>
                          </div>
                          {selectedTransaction?.invoice_id === transaction.invoice_id && (
                            <span style={{ color: '#0e74f0ff', fontSize: '20px' }}>✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}

              {/* Step 3: Select Old Item */}
              {exchangeSelectedCustomer && selectedTransaction && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                    Step 3: Select Item to Exchange
                  </h3>
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    {selectedTransaction.items && selectedTransaction.items.length > 0 ? (
                      selectedTransaction.items.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedOldItem(item);
                            setSelectedNewItem(null);
                            setExchangeQuantity(1);
                          }}
                          style={{
                            padding: '16px',
                            cursor: 'pointer',
                            borderBottom: index < selectedTransaction.items.length - 1 ? '1px solid #e5e7eb' : 'none',
                            background: selectedOldItem?.product_id === item.product_id ? '#eff6ff' : 'white',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedOldItem?.product_id !== item.product_id) {
                              e.currentTarget.style.background = '#f9fafb';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedOldItem?.product_id !== item.product_id) {
                              e.currentTarget.style.background = 'white';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: '600' }}>
                                {item.product_name || item.description}
                              </div>
                              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                Qty: {item.quantity} × {formatCurrency(item.price)} = {formatCurrency(item.price * item.quantity)}
                              </div>
                            </div>
                            {selectedOldItem?.product_id === item.product_id && (
                              <span style={{ color: '#0e74f0ff', fontSize: '20px' }}>✓</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
                        No items found in this transaction.
                      </div>
                    )}
                  </div>
                  {selectedOldItem && (
                    <div style={{ marginTop: '12px', padding: '12px', background: '#f0f9ff', borderRadius: '8px' }}>
                      <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                        <strong>Selected:</strong> {selectedOldItem.product_name || selectedOldItem.description}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label style={{ fontSize: '14px' }}>Exchange Quantity:</label>
                        <input
                          type="number"
                          min="1"
                          max={selectedOldItem.quantity}
                          value={exchangeQuantity}
                          onChange={(e) => {
                            const qty = parseInt(e.target.value) || 1;
                            setExchangeQuantity(Math.max(1, Math.min(qty, selectedOldItem.quantity)));
                          }}
                          style={{
                            width: '80px',
                            padding: '8px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          (Max: {selectedOldItem.quantity})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Select New Item */}
              {exchangeSelectedCustomer && selectedOldItem && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                    Step 4: Select New Item
                  </h3>
                  <div style={{ marginBottom: '12px' }}>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={exchangeSearchTerm}
                      onChange={(e) => setExchangeSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '12px',
                    padding: '12px'
                  }}>
                    {getProductsList()
                      .filter(product =>
                        product.product_name.toLowerCase().includes(exchangeSearchTerm.toLowerCase()) ||
                        product.description.toLowerCase().includes(exchangeSearchTerm.toLowerCase())
                      )
                      .map((product) => (
                        <div
                          key={product.product_id}
                          onClick={() => setSelectedNewItem(product)}
                          style={{
                            padding: '12px',
                            border: selectedNewItem?.product_id === product.product_id ? '2px solid #0e74f0ff' : '1px solid #e5e7eb',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: selectedNewItem?.product_id === product.product_id ? '#eff6ff' : 'white',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                            {product.product_name || product.description}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {formatCurrency(product.price)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Exchange Summary */}
              {exchangeSelectedCustomer && selectedOldItem && selectedNewItem && (
                <div style={{
                  padding: '20px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    Exchange Summary
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Old Item Total:</span>
                      <span style={{ fontWeight: '600' }}>
                        {formatCurrency(selectedOldItem.price * exchangeQuantity)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>New Item Total:</span>
                      <span style={{ fontWeight: '600' }}>
                        {formatCurrency(selectedNewItem.price * exchangeQuantity)}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: '12px',
                      borderTop: '2px solid #e5e7eb',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: calculateExchangeDifference() > 0 ? '#dc2626' : '#10b981'
                    }}>
                      <span>Difference:</span>
                      <span>
                        {calculateExchangeDifference() > 0
                          ? `+${formatCurrency(calculateExchangeDifference())} (Customer Pays)`
                          : calculateExchangeDifference() < 0
                            ? `${formatCurrency(Math.abs(calculateExchangeDifference()))} (No Refund)`
                            : '₱0.00 (Even Exchange)'}
                      </span>
                    </div>
                  </div>

                  {/* Payment Input (if difference > 0) */}
                  {calculateExchangeDifference() > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          marginBottom: '12px'
                        }}
                      >
                        <option value="cash">Cash</option>
                        <option value="gcash">GCash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                      {paymentMethod === 'cash' && (
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                            Cash Amount
                          </label>
                          <input
                            type="number"
                            value={mainPOSCashAmount}
                            onChange={(e) => setMainPOSCashAmount(e.target.value)}
                            placeholder={`Enter amount (min: ${formatCurrency(calculateExchangeDifference())})`}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '14px'
                            }}
                          />
                          {mainPOSCashAmount && parseFloat(mainPOSCashAmount) >= calculateExchangeDifference() && (
                            <div style={{ marginTop: '8px', fontSize: '14px', color: '#10b981' }}>
                              Change: {formatCurrency(parseFloat(mainPOSCashAmount) - calculateExchangeDifference())}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => {
                  setShowExchangeModal(false);
                  setExchangeSelectedCustomer(null);
                  setExchangeCustomerSearchTerm('');
                  setSelectedTransaction(null);
                  setSelectedOldItem(null);
                  setSelectedNewItem(null);
                  setExchangeQuantity(1);
                  setExchangeSearchTerm('');
                  setCustomerTransactions([]);
                }}
                style={{
                  padding: '12px 24px',
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
                onClick={processExchange}
                disabled={!exchangeSelectedCustomer || !selectedTransaction || !selectedOldItem || !selectedNewItem || (calculateExchangeDifference() > 0 && paymentMethod === 'cash' && (!mainPOSCashAmount || parseFloat(mainPOSCashAmount) < calculateExchangeDifference()))}
                style={{
                  padding: '12px 24px',
                  background: (!exchangeSelectedCustomer || !selectedTransaction || !selectedOldItem || !selectedNewItem || (calculateExchangeDifference() > 0 && paymentMethod === 'cash' && (!mainPOSCashAmount || parseFloat(mainPOSCashAmount) < calculateExchangeDifference()))) ? '#d1d5db' : '#0e74f0ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: (!exchangeSelectedCustomer || !selectedTransaction || !selectedOldItem || !selectedNewItem || (calculateExchangeDifference() > 0 && paymentMethod === 'cash' && (!mainPOSCashAmount || parseFloat(mainPOSCashAmount) < calculateExchangeDifference()))) ? 'not-allowed' : 'pointer'
                }}
              >
                Process Exchange
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Change Modal */}
      {showLocationChangeModal && (
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
          zIndex: 2000,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                Change Location
              </h2>
              <button
                onClick={() => setShowLocationChangeModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{
              padding: '24px',
              overflowY: 'auto',
              flex: 1
            }}>
              <p style={{ marginBottom: '16px', color: '#6b7280' }}>
                Select a new location. The cart will be cleared when changing locations.
              </p>
              
              {cart.length > 0 && (
                <div style={{
                  padding: '12px',
                  background: '#fef3c7',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  border: '1px solid #fbbf24'
                }}>
                  <div style={{ fontSize: '14px', color: '#92400e', fontWeight: '500' }}>
                    ⚠️ Warning: You have {cart.length} item(s) in your cart. The cart will be cleared when you change location.
                  </div>
                </div>
              )}

              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                {locationList.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                    No locations available.
                  </div>
                ) : (
                  locationList
                  .filter(location => location.name != 'Warehouse')
                  .map((location) => (
                    <div
                      key={location.location_id}
                      onClick={() => {
                        if (cart.length > 0) {
                          // Clear cart first
                          setCart([]);
                        }
                        changeLocation(location);
                      }}
                      style={{
                        padding: '16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #e5e7eb',
                        background: location_id == location.location_id ? '#eff6ff' : 'white',
                        transition: 'background 0.2s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => {
                        if (location_id != location.location_id) {
                          e.currentTarget.style.background = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (location_id != location.location_id) {
                          e.currentTarget.style.background = 'white';
                        }
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {location.location_name}
                        </div>
                        {location.location_id == location_id && (
                          <div style={{ fontSize: '12px', color: '#0e74f0ff' }}>
                            Current Location
                          </div>
                        )}
                      </div>
                      {location_id == location.location_id && (
                        <span style={{ color: '#0e74f0ff', fontSize: '20px' }}>✓</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowLocationChangeModal(false)}
                style={{
                  padding: '12px 24px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCustomizeManagementModal && (
        <CustomizeManagementModal
          show={showCustomizeManagementModal}
          onClose={() => setShowCustomizeManagementModal(false)}
          location_id={location_id}
          user_id={user_id}
        />
      )}
      </div>
    </>
  );
}

// Customization Management Modal Component
function CustomizeManagementModal({ show, onClose, location_id, user_id }) {
  // Data states
  const [customizeSales, setCustomizeSales] = useState([]);
  const [customizeRequest, setCustomizeRequest] = useState([]);
  const [semiDetails, setSemiDetails] = useState([]);
  const [fullDetails, setFullDetails] = useState([]);
  const [customizeTracking, setCustomizeTracking] = useState([]);
  const [invoiceRecords, setInvoiceRecords] = useState([]);
  const [customizePaymentRecords, setCustomizePaymentRecords] = useState([]);
  
  // Filter states
  const [customerFilter, setCustomerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Removed expandedCustomers state - no longer needed as each sale is its own card
  
  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  
  // Selected items
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedTracking, setSelectedTracking] = useState([]);
  const [selectedPaymentHistory, setSelectedPaymentHistory] = useState([]);
  
  // Payment form
  const [paymentAmount, setPaymentAmount] = useState('');
  
  // Alert state
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [showAlert, setShowAlert] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  
  // Progress steps - "Completed" removed as it just means delivered to store (already covered by "Delivered")
  const steps = ["Pending", "On Going", "On Delivery", "Delivered", "On Delivery to Customer", "Delivered to Customer"];
  
  // Helper functions
  const getBaseURL = () => sessionStorage.getItem('baseURL') || '';
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return '';
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
    setAlertMessage(`Error occurred while ${context}. Please try again.`);
    setAlertType('danger');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };
  
  const showSuccess = (msg) => {
    setAlertMessage(msg);
    setAlertType('success');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };
  
  // Process each sale as individual card
  const processedSales = React.useMemo(() => {
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
      
      return {
        ...sale,
        request,
        semiItems,
        fullItems,
        invoices,
        requestStatus,
        trackingProgress,
        hasBalance: parseFloat(sale.balance) > 0
      };
    });
    
    // Filter out "Delivered to Customer" orders with zero balance (they go to archive)
    // Keep orders that are delivered but still have balance in active view
    const activeOrders = enrichedSales.filter(sale => 
      !(sale.requestStatus === 'Delivered to Customer' && parseFloat(sale.balance) === 0)
    );
    
    // Sort by date and time (oldest first - old requests at the top)
    const sortedSales = activeOrders.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
    
    return sortedSales;
  }, [customizeSales, customizeRequest, semiDetails, fullDetails, invoiceRecords, customizeTracking]);
  
  // Get archived sales (Delivered to Customer AND fully paid - zero balance)
  const archivedSales = React.useMemo(() => {
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
      
      return {
        ...sale,
        request,
        semiItems,
        fullItems,
        invoices,
        requestStatus,
        trackingProgress,
        hasBalance: parseFloat(sale.balance) > 0
      };
    });
    
    // Filter only "Delivered to Customer" orders with zero balance (fully paid)
    const archived = enrichedSales.filter(sale => 
      sale.requestStatus === 'Delivered to Customer' && parseFloat(sale.balance) === 0
    );
    
    // Sort by date (newest to oldest in archive)
    return archived.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
  }, [customizeSales, customizeRequest, semiDetails, fullDetails, invoiceRecords, customizeTracking]);
  
  // Apply filters to individual sales
  const filteredSales = React.useMemo(() => {
    let filtered = [...processedSales];
    
    if (customerFilter) {
      filtered = filtered.filter(sale => 
        sale.cust_name?.toLowerCase().includes(customerFilter.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(sale => 
        sale.requestStatus === statusFilter
      );
    }
    
    if (searchFilter) {
      const search = searchFilter.toLowerCase();
      filtered = filtered.filter(sale =>
        sale.cust_name?.toLowerCase().includes(search) ||
        sale.invoice_id?.toString().includes(search) ||
        sale.customize_type?.toLowerCase().includes(search) ||
        sale.customize_sales_id?.toString().includes(search)
      );
    }
    
    return filtered;
  }, [processedSales, customerFilter, statusFilter, searchFilter]);
  
  // Pagination
  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  // Get unique customers for filter
  const getUniqueCustomers = () => {
    const customers = [...new Set(customizeSales.map(item => item.cust_name).filter(Boolean))];
    return customers.sort();
  };
  
  // API Functions
  const GetCustomizeSales = async () => {
    const url = `${getBaseURL()}customizeProducts.php`;
    const ID = { locID: location_id };
    
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
    const ID = {
      locID: location_id,
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
  
  const GetCustomizePaymentRecords = async () => {
    const url = `${getBaseURL()}customizeProducts.php`;
    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify([]),
          operation: "GetcustomizePaymentRecord"
        }
      });
      
      setCustomizePaymentRecords(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      handleError(error, 'fetching payment records');
      setCustomizePaymentRecords([]);
    }
  };
  
  // Event handlers
  const handleTrackRequest = (sale) => {
    setSelectedSale(sale);
    setSelectedRequest(sale.request);
    setSelectedTracking(sale.trackingProgress);
    setShowTrackingModal(true);
  };
  
  const handleViewPaymentHistory = (sale) => {
    setSelectedSale(sale);
    // Filter payment records for this specific customize_sales_id (use == for type coercion)
    const paymentHistory = customizePaymentRecords.filter(
      payment => payment.customize_sales_id == sale.customize_sales_id
    );
    setSelectedPaymentHistory(paymentHistory);
    setShowInvoiceModal(true);
  };
  
  const handleRecordPayment = (sale) => {
    setSelectedSale(sale);
    setPaymentAmount(sale.balance); // Default to remaining balance
    setShowPaymentModal(true);
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setLastTransaction(null);
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
      account_id: user_id
    };
    
    try {
      // Create FormData for PHP POST
      const formData = new FormData();
      formData.append('json', JSON.stringify(paymentData));
      formData.append('operation', 'RecordPayment');
      
      const response = await axios.post(url, formData);
      
      if (response.data.success) {
        // Create payment receipt data
        const currentDate = new Date();
        const locationName = sessionStorage.getItem('location_name') || 'Store Location';
        const paymentReceipt = {
          invoice_id: response.data.invoice_id,
          date: currentDate.toISOString().split('T')[0],
          time: currentDate.toTimeString().split(' ')[0].substring(0, 5),
          location: locationName,
          customer: {
            cust_name: selectedSale.cust_name,
            phone: 'N/A',
            email: 'N/A'
          },
          payment_type: 'Balance Payment',
          original_invoice: selectedSale.invoice_id,
          customize_sales_id: selectedSale.customize_sales_id,
          amount_paid: parseFloat(paymentAmount),
          previous_balance: parseFloat(selectedSale.balance),
          new_balance: response.data.new_balance,
          total_price: parseFloat(selectedSale.total_price),
          total_paid: parseFloat(selectedSale.down_payment) + parseFloat(paymentAmount),
          items: [
            ...(selectedSale.semiItems || []).map(item => ({
              product_name: item.product_name,
              description: item.description,
              modifications: item.modifications,
              price: parseFloat(item.orig_price),
              quantity: parseInt(item.qty),
              isCustom: true,
              customizationType: 'semi'
            })),
            ...(selectedSale.fullItems || []).map(item => ({
              product_name: 'Custom Item',
              description: item.description,
              modifications: item.additional_description,
              price: parseFloat(item.price),
              quantity: parseInt(item.qty),
              isCustom: true,
              customizationType: 'full'
            }))
          ]
        };

        showSuccess('Payment recorded successfully');
        setShowPaymentModal(false);
        setPaymentAmount('');
        
        // Show payment receipt
        setLastTransaction(paymentReceipt);
        setShowReceipt(true);
        
        // Refresh data
        GetCustomizeSales();
        GetInvoiceRecords();
        GetCustomizePaymentRecords();
      } else {
        handleError(null, response.data.message || 'recording payment');
      }
    } catch (error) {
      handleError(error, 'recording payment');
    }
  };
  
  const clearAllFilters = () => {
    setCustomerFilter('');
    setStatusFilter('');
    setSearchFilter('');
    setCurrentPage(1);
  };
  
  // Get progress percentage
  const getProgressPercentage = (status) => {
    // Handle "Completed" status (legacy) - treat it as "Delivered" (item at store)
    let normalizedStatus = status;
    if (status === 'Completed') {
      normalizedStatus = 'Delivered';
    }
    
    const index = steps.indexOf(normalizedStatus);
    // Pending (index 0) = 0%, Delivered to Customer (index 5) = 100%
    return index >= 0 ? (index / (steps.length - 1)) * 100 : 0;
  };
  
  // Effects
  useEffect(() => {
    if (show && location_id) {
      GetCustomizeSales();
      GetCustomizeRequests();
      GetSemiDetails();
      GetFullDetails();
      GetCustomizeTracking();
      GetInvoiceRecords();
      GetCustomizePaymentRecords();
    }
  }, [show, location_id]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [customerFilter, statusFilter, searchFilter]);
  
  if (!show) return null;
  
  return (
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
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '95%',
        maxWidth: '1400px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '2px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
            🛠️ Customization Management
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setShowArchiveModal(true)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid white',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '600',
                color: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseOver={(e) => e.currentTarget.style.color = '#7c3aed'}
              onMouseOut={(e) => e.currentTarget.style.color = 'white'}
            >
              📦 Archive ({archivedSales.length})
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#7c3aed'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Alert */}
        {showAlert && (
          <div style={{
            position: 'absolute',
            top: '80px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            background: alertType === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10000,
            animation: 'slideIn 0.3s ease-out'
          }}>
            {alertMessage}
          </div>
        )}
        
        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* Filters */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>
                  Customer
                </label>
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}
                >
                  <option value="">All Customers</option>
                  {getUniqueCustomers().map((customer, index) => (
                    <option key={index} value={customer}>{customer}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>
                  Request Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}
                >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="On Going">On Going</option>
                <option value="On Delivery">On Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="On Delivery to Customer">On Delivery to Customer</option>
                <option value="Delivered to Customer">Delivered to Customer</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search customer, invoice..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '15px', 
              paddingTop: '15px', 
              borderTop: '1px solid #e5e7eb' 
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                Showing {filteredSales.length} of {processedSales.length} orders
              </div>
              <button 
                onClick={clearAllFilters} 
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#7c3aed', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Order Cards - Each customize_sales_id is its own card */}
          <div>
            {currentItems.map((sale, index) => {
              const progressPercentage = getProgressPercentage(sale.requestStatus);
              
              return (
                <div 
                  key={index}
                  style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '20px',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    marginBottom: '16px'
                  }}
                >
                  {/* Order Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    paddingBottom: '16px',
                    borderBottom: '2px solid #f3f4f6'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, fontWeight: 'bold', fontSize: '18px', color: '#1f2937' }}>
                          Invoice #{sale.invoice_id}
                        </h4>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: '#ddd6fe',
                          color: '#7c3aed'
                        }}>
                          ID: {sale.customize_sales_id}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>👤</span>
                          <strong>{sale.cust_name}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>📅</span>
                          <span>{sale.date} • {sale.time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>🔧</span>
                          <span>{sale.customize_type}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: sale.status === 'Paid' ? '#10b981' : '#f59e0b',
                        color: 'white',
                        display: 'inline-block',
                        marginBottom: '8px'
                      }}>
                        {sale.status}
                      </span>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>
                        Status: <span style={{ color: '#7c3aed' }}>{sale.requestStatus === 'Completed' ? 'Delivered' : sale.requestStatus}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Info */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total</div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>₱{parseFloat(sale.total_price).toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Paid</div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#10b981' }}>₱{parseFloat(sale.down_payment).toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Balance</div>
                      <div style={{ 
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: parseFloat(sale.balance) > 0 ? '#dc2626' : '#10b981'
                      }}>
                        ₱{parseFloat(sale.balance).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Quantity</div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{sale.total_qty} item(s)</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {sale.request && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '8px' 
                      }}>
                        <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                          📊 Request Progress
                        </span>
                        <span style={{ fontSize: '13px', color: '#7c3aed', fontWeight: '700' }}>
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '10px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{
                          width: `${progressPercentage}%`,
                          height: '100%',
                          background: progressPercentage === 100 
                            ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' 
                            : 'linear-gradient(90deg, #7c3aed 0%, #5b21b6 100%)',
                          transition: 'width 0.5s ease',
                          boxShadow: '0 0 10px rgba(124, 58, 237, 0.5)'
                        }} />
                      </div>
                    </div>
                  )}
                  
                  {/* Items Summary */}
                  {(sale.semiItems?.length > 0 || sale.fullItems?.length > 0) && (
                    <div style={{ 
                      marginBottom: '16px',
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h6 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: '#1f2937' }}>
                        📦 Order Items
                      </h6>
                      {sale.semiItems?.map((item, i) => (
                        <div key={`semi-${i}`} style={{ 
                          fontSize: '13px', 
                          marginBottom: '10px',
                          paddingLeft: '12px',
                          borderLeft: '4px solid #3b82f6',
                          paddingTop: '6px',
                          paddingBottom: '6px',
                          backgroundColor: 'white',
                          borderRadius: '4px',
                          padding: '8px 8px 8px 12px'
                        }}>
                          <strong style={{ color: '#1f2937' }}>{item.product_name}</strong> - {item.description}<br/>
                          <small style={{ color: '#6b7280' }}>✏️ Modifications: {item.modifications}</small>
                        </div>
                      ))}
                      {sale.fullItems?.map((item, i) => (
                        <div key={`full-${i}`} style={{ 
                          fontSize: '13px', 
                          marginBottom: '10px',
                          paddingLeft: '12px',
                          borderLeft: '4px solid #10b981',
                          paddingTop: '6px',
                          paddingBottom: '6px',
                          backgroundColor: 'white',
                          borderRadius: '4px',
                          padding: '8px 8px 8px 12px'
                        }}>
                          <strong style={{ color: '#1f2937' }}>✨ Custom:</strong> {item.description}<br/>
                          <small style={{ color: '#6b7280' }}>{item.additional_description}</small>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Action Buttons - Track requests and manage payments */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: '10px',
                    paddingTop: '16px',
                    borderTop: '2px solid #f3f4f6'
                  }}>
                    {/* 1. Track Request - View order progress timeline */}
                    {sale.request && (
                      <button
                        onClick={() => handleTrackRequest(sale)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#0ea5e9',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 4px rgba(14, 165, 233, 0.2)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                      >
                        📍 Track Request
                      </button>
                    )}
                    
                    {/* 2. View Payment History - Review all payment records */}
                    <button
                      onClick={() => handleViewPaymentHistory(sale)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(107, 114, 128, 0.2)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
                    >
                      💳 Payment History
                    </button>
                    
                    {/* 3. Pay Balance - Record additional payments for partial payment orders */}
                    {sale.hasBalance && parseFloat(sale.balance) > 0 && (
                      <button
                        onClick={() => handleRecordPayment(sale)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                      >
                        💰 Pay Balance
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {currentItems.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: '#f9fafb',
                borderRadius: '16px',
                border: '2px dashed #d1d5db'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📦</div>
                <h4 style={{ color: '#4b5563', marginBottom: '8px' }}>No customization orders found</h4>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Try adjusting your filters or add new customization orders.</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: '24px',
              paddingBottom: '20px'
            }}>
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                color="#7c3aed"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tracking Modal */}
      {showTrackingModal && (
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
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                Request Tracking - Invoice #{selectedSale?.invoice_id}
              </h3>
              <button
                onClick={() => setShowTrackingModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            {selectedRequest && (
              <>
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '8px', 
                  marginBottom: '20px' 
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                    <div><strong>Request ID:</strong> #{selectedRequest.customize_req_id}</div>
                    <div><strong>Status:</strong> {selectedRequest.status === 'Completed' ? 'Delivered' : selectedRequest.status}</div>
                    <div><strong>From:</strong> {selectedRequest.reqFrom}</div>
                    <div><strong>To:</strong> {selectedRequest.reqTo}</div>
                  </div>
                </div>
                
                <div style={{ position: 'relative', paddingLeft: '45px', paddingTop: '5px' }}>
                  {steps.map((step, index) => {
                    // Handle "Completed" status mapping to "Delivered"
                    const trackingItem = selectedTracking.find(t => 
                      t.status === step || (step === 'Delivered' && t.status === 'Completed')
                    );
                    const isActive = selectedTracking.some(t => 
                      t.status === step || (step === 'Delivered' && t.status === 'Completed')
                    );
                    const nextStepIsActive = index < steps.length - 1 && selectedTracking.some(t => {
                      const nextStep = steps[index + 1];
                      return t.status === nextStep || (nextStep === 'Delivered' && t.status === 'Completed');
                    });
                    
                    return (
                      <div key={index} style={{ 
                        position: 'relative',
                        marginBottom: '0px'
                      }}>
                        {/* Vertical connecting line - goes from center of this circle to center of next circle */}
                        {index < steps.length - 1 && (
                          <div style={{
                            position: 'absolute',
                            left: '-37px',
                            top: '10px',
                            width: '2px',
                            height: 'calc(100% + 10px)',
                            backgroundColor: nextStepIsActive ? '#10b981' : '#e5e7eb',
                            zIndex: 1,
                            transform: 'translateX(-50%)'
                          }} />
                        )}
                        
                        {/* Circle indicator - centered */}
                        <div style={{
                          position: 'absolute',
                          left: '-37px',
                          top: '0px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: isActive ? '#10b981' : 'white',
                          border: '3px solid ' + (isActive ? '#10b981' : '#d1d5db'),
                          zIndex: 2,
                          transform: 'translateX(-50%)',
                          boxShadow: isActive ? '0 0 0 4px rgba(16, 185, 129, 0.1)' : '0 0 0 2px rgba(209, 213, 219, 0.1)'
                        }} />
                        
                        {/* Status card */}
                        <div style={{
                          padding: '16px 20px',
                          marginBottom: '20px',
                          backgroundColor: isActive ? '#f0fdf4' : 'white',
                          borderRadius: '10px',
                          border: '2px solid ' + (isActive ? '#10b981' : '#e5e7eb'),
                          minHeight: '70px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          opacity: isActive ? 1 : 0.5,
                          transition: 'all 0.3s ease',
                          boxShadow: isActive ? '0 2px 8px rgba(16, 185, 129, 0.1)' : 'none'
                        }}>
                          <h6 style={{ 
                            margin: '0 0 6px 0', 
                            fontWeight: 'bold',
                            fontSize: '16px',
                            color: isActive ? '#059669' : '#6b7280' 
                          }}>
                            {step}
                          </h6>
                          {trackingItem && (
                            <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>
                              {formatDateTime(trackingItem.date, trackingItem.time)}
                            </p>
                          )}
                          {!trackingItem && (
                            <p style={{ 
                              margin: '0', 
                              fontSize: '13px', 
                              color: '#9ca3af', 
                              fontStyle: 'italic' 
                            }}>
                              ⏳ Pending...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showInvoiceModal && (
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
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#1f2937' }}>
                  💳 Payment History
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                  Order ID: {selectedSale?.customize_sales_id} | Invoice: #{selectedSale?.invoice_id}
                </p>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            {selectedPaymentHistory?.length > 0 ? (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  marginBottom: '24px',
                  padding: '20px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Payments</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                      {selectedPaymentHistory.length}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Paid</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
                      {formatCurrency(selectedPaymentHistory.reduce((sum, p) => sum + parseFloat(p.amount), 0))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Remaining Balance</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: parseFloat(selectedSale?.balance || 0) > 0 ? '#ef4444' : '#10b981' }}>
                      {formatCurrency(selectedSale?.balance || 0)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedPaymentHistory.map((payment, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '16px',
                        backgroundColor: '#ffffff',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#7c3aed'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              backgroundColor: '#dbeafe',
                              color: '#1e40af'
                            }}>
                              Payment #{i + 1}
                            </span>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>
                              📅 {formatDateTime(payment.date, payment.time)}
                            </span>
                          </div>
                          <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '8px' }}>
                            <span style={{ fontWeight: '500' }}>Processed by:</span>{' '}
                            <strong style={{ color: '#1f2937' }}>
                              {payment.fname} {payment.mname} {payment.lname}
                            </strong>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Amount</div>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                            {formatCurrency(payment.amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>💳</div>
                <h5 style={{ color: '#6b7280', marginBottom: '8px', fontSize: '16px' }}>No Payment Records Found</h5>
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>No payments have been recorded for this order yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
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
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold' }}>
              Record Payment - Invoice #{selectedSale?.invoice_id}
            </h3>
            
            {selectedSale && (
              <>
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: '#f0f9ff', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  border: '1px solid #bae6fd'
                }}>
                  <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                    <strong>Customer:</strong> {selectedSale.cust_name}
                  </div>
                  <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                    <strong>Total Amount:</strong> {formatCurrency(selectedSale.total_price)}
                  </div>
                  <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                    <strong>Paid Amount:</strong> {formatCurrency(selectedSale.down_payment)}
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    <strong>Remaining Balance:</strong> 
                    <span style={{ color: '#dc2626', fontWeight: 'bold', marginLeft: '5px', fontSize: '16px' }}>
                      {formatCurrency(selectedSale.balance)}
                    </span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>
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
                      padding: '10px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </>
            )}
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={RecordPayment}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: !paymentAmount || parseFloat(paymentAmount) <= 0 ? '#d1d5db' : '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: !paymentAmount || parseFloat(paymentAmount) <= 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal - Delivered to Customer */}
      {showArchiveModal && (
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
          zIndex: 10001,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '1200px',
            width: '95%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Archive Header */}
            <div style={{
              padding: '24px',
              borderBottom: '2px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
                  📦 Delivered Orders Archive
                </h2>
                <p style={{ margin: '5px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                  Fully paid orders that have been successfully delivered to customers
                </p>
              </div>
              <button
                onClick={() => setShowArchiveModal(false)}
                style={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: '#10b981'
                }}
              >
                ×
              </button>
            </div>

            {/* Archive Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {archivedSales.length > 0 ? (
                <div>
                  <div style={{ 
                    padding: '16px', 
                    backgroundColor: '#f0fdf4', 
                    borderRadius: '12px', 
                    marginBottom: '20px',
                    border: '1px solid #86efac'
                  }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#166534' }}>
                      Total Archived Orders: {archivedSales.length}
                    </div>
                  </div>

                  {archivedSales.map((sale, index) => (
                    <div
                      key={index}
                      style={{
                        border: '2px solid #86efac',
                        borderRadius: '12px',
                        padding: '20px',
                        backgroundColor: '#f0fdf4',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        marginBottom: '16px'
                      }}
                    >
                      {/* Order Header */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '16px',
                        paddingBottom: '16px',
                        borderBottom: '2px solid white'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h4 style={{ margin: 0, fontWeight: 'bold', fontSize: '18px', color: '#166534' }}>
                              Invoice #{sale.invoice_id}
                            </h4>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              backgroundColor: '#dcfce7',
                              color: '#166534'
                            }}>
                              ID: {sale.customize_sales_id}
                            </span>
                            <span style={{
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: '#10b981',
                              color: 'white'
                            }}>
                              ✓ Delivered & Fully Paid
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#166534', marginTop: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>👤</span>
                              <strong>{sale.cust_name}</strong>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>📅</span>
                              <span>{sale.date} • {sale.time}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>🔧</span>
                              <span>{sale.customize_type}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14px', color: '#166534', marginBottom: '4px' }}>Total Amount</div>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
                            {formatCurrency(sale.total_price)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Payment Info */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '12px',
                        padding: '16px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        marginBottom: '16px'
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>Payment Status</div>
                          <div style={{ 
                            fontWeight: 'bold', 
                            fontSize: '14px',
                            color: sale.status === 'Paid' ? '#10b981' : '#f59e0b'
                          }}>
                            {sale.status}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>Paid Amount</div>
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>₱{parseFloat(sale.down_payment).toLocaleString()}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>Balance</div>
                          <div style={{ 
                            fontWeight: 'bold',
                            fontSize: '14px',
                            color: parseFloat(sale.balance) > 0 ? '#dc2626' : '#10b981'
                          }}>
                            ₱{parseFloat(sale.balance).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>Quantity</div>
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{sale.total_qty} item(s)</div>
                        </div>
                      </div>
                      
                      {/* Items Summary */}
                      {(sale.semiItems?.length > 0 || sale.fullItems?.length > 0) && (
                        <div style={{ 
                          marginBottom: '16px',
                          padding: '16px',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          border: '1px solid #dcfce7'
                        }}>
                          <h6 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: '#166534' }}>
                            📦 Delivered Items
                          </h6>
                          {sale.semiItems?.map((item, i) => (
                            <div key={`semi-${i}`} style={{ 
                              fontSize: '13px', 
                              marginBottom: '10px',
                              paddingLeft: '12px',
                              borderLeft: '4px solid #3b82f6',
                              paddingTop: '6px',
                              paddingBottom: '6px',
                              backgroundColor: '#f0fdf4',
                              borderRadius: '4px',
                              padding: '8px 8px 8px 12px'
                            }}>
                              <strong style={{ color: '#166534' }}>{item.product_name}</strong> - {item.description}<br/>
                              <small style={{ color: '#166534' }}>✏️ Modifications: {item.modifications}</small>
                            </div>
                          ))}
                          {sale.fullItems?.map((item, i) => (
                            <div key={`full-${i}`} style={{ 
                              fontSize: '13px', 
                              marginBottom: '10px',
                              paddingLeft: '12px',
                              borderLeft: '4px solid #10b981',
                              paddingTop: '6px',
                              paddingBottom: '6px',
                              backgroundColor: '#f0fdf4',
                              borderRadius: '4px',
                              padding: '8px 8px 8px 12px'
                            }}>
                              <strong style={{ color: '#166534' }}>✨ Custom:</strong> {item.description}<br/>
                              <small style={{ color: '#166534' }}>{item.additional_description}</small>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        gap: '10px',
                        paddingTop: '16px',
                        borderTop: '2px solid white'
                      }}>
                        {sale.request && (
                          <button
                            onClick={() => handleTrackRequest(sale)}
                            style={{
                              padding: '10px 20px',
                              backgroundColor: '#0ea5e9',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 4px rgba(14, 165, 233, 0.2)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                          >
                            📍 View Timeline
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleViewPaymentHistory(sale)}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(107, 114, 128, 0.2)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
                        >
                          💳 Payment History
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '16px',
                  border: '2px dashed #86efac'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📦</div>
                  <h4 style={{ color: '#166534', marginBottom: '8px' }}>No Archived Orders Yet</h4>
                  <p style={{ color: '#059669', fontSize: '14px' }}>Fully paid orders delivered to customers will appear here.</p>
                </div>
              )}
            </div>

            {/* Archive Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: '2px solid #e5e7eb',
              background: '#f9fafb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                Total Archived: {archivedSales.length} order(s)
              </div>
              <button
                onClick={() => setShowArchiveModal(false)}
                style={{
                  padding: '10px 24px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Close Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {showReceipt && lastTransaction && lastTransaction.payment_type === 'Balance Payment' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10002,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                <span style={{ marginRight: '8px' }}>✓</span>
                Payment Receipt
              </h3>
              <button
                onClick={closeReceipt}
                style={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
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

            <div style={{
              padding: '24px',
              overflowY: 'auto',
              flex: 1
            }}>
              {/* Store Header */}
              <div style={{
                textAlign: 'center',
                marginBottom: '24px',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>
                  A.G HOME APPLIANCE AND FURNITURE SHOWROOM
                </h4>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  <div>Payment Invoice #{lastTransaction.invoice_id}</div>
                  <div>{lastTransaction.date} • {lastTransaction.time}</div>
                  <div>{lastTransaction.location}</div>
                </div>
              </div>

              {/* Customer Info */}
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                  Customer Information
                </h5>
                <div style={{
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontWeight: '600' }}>Name: {lastTransaction.customer.cust_name}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                    Order ID: {lastTransaction.customize_sales_id}
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                  Payment Summary
                </h5>
                <div style={{
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span>Original Invoice:</span>
                    <span>#{lastTransaction.original_invoice}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span>Total Order Amount:</span>
                    <span>₱{(lastTransaction.total_price || 0).toLocaleString()}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span>Previous Balance:</span>
                    <span style={{ color: '#dc2626' }}>₱{(lastTransaction.previous_balance || 0).toLocaleString()}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #e5e7eb',
                    color: '#10b981'
                  }}>
                    <span>Payment Today:</span>
                    <span>₱{(lastTransaction.amount_paid || 0).toLocaleString()}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: lastTransaction.new_balance > 0 ? '#dc2626' : '#10b981'
                  }}>
                    <span>New Balance:</span>
                    <span>₱{(lastTransaction.new_balance || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {lastTransaction.new_balance === 0 && (
                <div style={{
                  padding: '16px',
                  background: '#f0fdf4',
                  border: '2px solid #86efac',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#166534',
                  fontWeight: '600'
                }}>
                  🎉 Fully Paid! Thank you for your payment!
                </div>
              )}
            </div>

            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb',
              display: 'flex',
              justifyContent: 'center',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px'
            }}>
              <button
                onClick={closeReceipt}
                style={{
                  padding: '12px 32px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}