'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import CustomPagination from '@/app/Components/Pagination/pagination';

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
  const [customerType, setCustomerType] = useState('customer');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Customization states
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
    }
  }, [paymentPlan, installmentDetails.months, installmentDetails.interestRate, cart, discountValue, customDownpayment]);

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

    if (!customerType && saleMode === 'inventory') {
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

    if (saleMode === 'custom' && !selectedCustomer) {
      showAlertError({
        icon: "error",
        title: "Customer Required!",
        text: 'Please select a customer for custom orders.',
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
          custID: customerType === 'walk-in' ? null : selectedCustomer.cust_id,
          accID: accountID,
          locID: locId,
          payMethod: paymentMethod,
          subTotal: calculateSubtotal(),
          discount: calculateDiscount(),
          discountValue: discountValue,
          total: calculateTotal(),
          paymentPlan: paymentPlan,
          amountPaid: calculateAmountDueToday(),
          remainingBalance: calculateRemainingBalance()
        };

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
            const transaction = {
              invoice_id: response.data,
              customer: customerType === 'walk-in' ? 'walk-in' : selectedCustomer,
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
              location: locName || 'Agora Showroom Main'
            };

            showReceiptModal(transaction);
            GetInventory();

            // Reset form
            resetForm();

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
      } else if (paymentPlan === 'installment') {
        const list1 = generatePaymentDates().map((date, index) => ({
          paymentNumber: index + 1,
          paymentDate: date,
          amountDue: installmentDetails.monthlyPayment,
        }));

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
          custID: selectedCustomer.cust_id,
          locID: locId,
          accID: accountID,
          prodID: firstProductId,
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
              location: locName || 'Agora Showroom Main'
            };

            showReceiptModal(transaction);
            GetInventory();

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
          custID: selectedCustomer.cust_id,
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
          warehouseID: requestTo
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

            const transaction = {
              invoice_id: response.data,
              customer: selectedCustomer,
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
              location: locName || 'Agora Showroom Main'
            };

            showReceiptModal(transaction);

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
        };

        return;

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
              location: locName || 'Agora Showroom Main'
            };

            showReceiptModal(transaction);

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
    setCustomerType('');
    setSelectedCustomer(null);
    setCustomerSearchTerm('');
    setDiscountValue(0);
    setPaymentPlan('full');
    setDownpaymentAmount(0);
    setCustomDownpayment('');
    setUsePartialPayment(false);
    setPartialPaymentAmount('');
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
                  Payment Successful!
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
                    <div>Invoice #{lastTransaction.invoice_id}</div>
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
                    {lastTransaction.customer === 'walk-in' ? (
                      <div style={{ fontStyle: 'italic', color: '#6b7280' }}>Walk-in Customer</div>
                    ) : (
                      <div>
                        <div style={{ fontWeight: '600' }}>Name: {lastTransaction.customer.cust_name}</div>
                        <div style={{ color: '#6b7280' }}>Phone: {lastTransaction.customer.phone}</div>
                        <div style={{ color: '#6b7280' }}>Email: {lastTransaction.customer.email}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Purchased */}
                <div style={{ marginBottom: '24px' }}>
                  <h5 style={{ fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                    Items Purchased
                  </h5>
                  <div style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    {lastTransaction.items.map((item, index) => (
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

                {/* Payment Summary */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    {lastTransaction.payment_plan === 'installment' ? (
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
                    background: lastTransaction.payment_plan === 'installment' ? '#fff7ed' : '#f0fdf4',
                    border: `1px solid ${lastTransaction.payment_plan === 'installment' ? '#fed7aa' : '#bbf7d0'}`,
                    borderRadius: '8px'
                  }}>
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
                            maxHeight: '120px',
                            overflowY: 'auto',
                            fontSize: '12px'
                          }}>
                            {lastTransaction.installment_details.payment_dates.map((date, index) => (
                              <div
                                key={index}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  marginBottom: '4px'
                                }}
                              >
                                <span>Payment #{index + 1}: {date}</span>
                                <span style={{ fontWeight: '600' }}>
                                  ₱{lastTransaction.installment_details.monthly_payment.toLocaleString()}
                                </span>
                              </div>
                            ))}
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
                        ${lastTransaction.customer === 'walk-in'
                        ? '<div style="font-style: italic; color: #666;">Walk-in Customer</div>'
                        : `
                            <div><strong>Name:</strong> ${lastTransaction.customer.cust_name}</div>
                            <div><strong>Phone:</strong> ${lastTransaction.customer.phone}</div>
                            <div><strong>Email:</strong> ${lastTransaction.customer.email}</div>
                          `
                      }
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
                             </div>`
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
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                A.G POS System
              </h1>
              <p style={{ color: '#6b7280', margin: '8px 0' }}>
                Location: {location_Name} | Date: {new Date().toLocaleDateString()} |
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
                  📦 Inventory Sales
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
                  ✨ Custom Orders
                </button>
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
                      📦 Create Full Custom Product
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
                          minHeight: '200px',
                          height: '200px'
                        }}
                        onClick={() => addToCart(product)}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <h3 style={{ fontWeight: '600', fontSize: '16px', margin: 0 }}>{product.product_name}</h3>
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
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                  🛒 Cart
                </h2>

                {/* Customer Type Selection */}


                {/* Customer Search and Selection */}
                {(customerType === 'customer' || saleMode === 'custom') && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '20px', fontWeight: '500', marginBottom: '8px' }}>
                      Select Customer
                    </label>
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                      <input
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

                        {/* Payment Schedule Preview */}
                        <div style={{
                          marginTop: '8px',
                          paddingTop: '8px',
                          borderTop: '1px solid #fde68a'
                        }}>
                          <div style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#92400e',
                            marginBottom: '4px'
                          }}>
                            Payment Schedule:
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: '#78350f',
                            maxHeight: '60px',
                            overflowY: 'auto'
                          }}>
                            {generatePaymentDates().map((date, index) => (
                              <div key={index} style={{ marginBottom: '1px' }}>
                                Payment #{index + 1}: {date} - ₱{installmentDetails.monthlyPayment.toLocaleString()}
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
                          ? `No interest for 3-month plan. Pay ₱${installmentDetails.monthlyPayment.toLocaleString()} monthly for ${installmentDetails.months} months`
                          : `Customer pays downpayment today, then ₱${installmentDetails.monthlyPayment.toLocaleString()} monthly for ${installmentDetails.months} months with ${installmentDetails.interestRate}% annual interest`
                        }
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div style={{
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
                      🏭 Send Request To Warehouse *
                    </label>
                    <select
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
                </div>

                {/* Process Button */}
                <button
                  onClick={proceedPurchase}
                  disabled={
                    cart.length === 0 ||
                    (saleMode === 'inventory' && !customerType) ||
                    ((customerType === 'customer' || saleMode === 'custom') && !selectedCustomer) ||
                    (paymentPlan === 'full' && usePartialPayment && (!partialPaymentAmount || partialPaymentAmount < calculateMinimumPartialPayment()))
                  }
                  style={{
                    width: '100%',
                    marginTop: '24px',
                    background: (cart.length === 0 ||
                      (saleMode === 'inventory' && !customerType) ||
                      ((customerType === 'customer' || saleMode === 'custom') && !selectedCustomer) ||
                      (paymentPlan === 'full' && usePartialPayment && (!partialPaymentAmount || partialPaymentAmount < calculateMinimumPartialPayment()))
                    ) ? '#d1d5db' : '#7c3aed',
                    color: 'white',
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: (cart.length === 0 ||
                      (saleMode === 'inventory' && !customerType) ||
                      ((customerType === 'customer' || saleMode === 'custom') && !selectedCustomer) ||
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
      `}</style>
      </div>
    </>
  );
}