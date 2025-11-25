'use client';

import '../../css/sidebar.css';
import Image from 'next/image';
import { useState } from 'react';
import { useEffect } from 'react';

// Components
import Dashboard from '@/app/Contents/admin-contents/Dashboard/page';
import Products from '@/app/Contents/admin-contents/Products/page';
import Sale from '@/app/Contents/admin-contents/Sale/page';
import Analytics from '@/app/Contents/admin-contents/Analytics/page';
import Delivery from '@/app/Contents/admin-contents/Delivery/page';
import Setting from '@/app/Contents/admin-contents/Setting/page';

import { LogInSuccess } from '../SweetAlert/logIn';

import InventoryIM from '@/app/Contents/inventory-contents/inventoryIM';
import SaleAdmin from '@/app/Contents/admin-contents/sale';
import Location from '@/app/Contents/admin-contents/locationPage';
import DeliveryAdmin from '@/app/Contents/admin-contents/deliveryPage';
import Customer from '@/app/Contents/admin-contents/customerPage';
import User from '@/app/Contents/admin-contents/userPage';
import Audit from '@/app/Contents/admin-contents/auditLogsPage';
import InventoryLedgerIM from '@/app/Contents/inventory-contents/inventoryAudit';
import InventoryLedgerAdmin from '@/app/Contents/admin-contents/inventryAudit';
import ProductsAdmin from '@/app/Contents/admin-contents/products';
import CategoryAdmin from '@/app/Contents/admin-contents/category';
import BranchAdmin from '@/app/Contents/admin-contents/branch';
import SidebarInventory from '../Sidebar-Inventory/page';
import DashboardAdmin from '@/app/Contents/admin-contents/dashboardAdmin';
import ProfileSetting from '@/app/Components/profileSetting/userProfilePage';
import OrdersManagement from '@/app/Contents/admin-contents/Orders/page';
import ProductTypeAdmin from '@/app/Contents/admin-contents/productType';
import ProductPartsAssignment from '@/app/Contents/admin-contents/productPartsAssignment';
import DiscountController from '@/app/Contents/admin-contents/discountController';
import CustomizeInventorySC from '@/app/Contents/saleClearkContents/customizInventory';
import ReceiveStockIM from '@/app/Contents/inventory-contents/receiveStock';
import RequestStockIM from '@/app/Contents/inventory-contents/requestStockIM';
import TrackRequestIM from '@/app/Contents/inventory-contents/trackRequest';
import TransferRequestManagement from '@/app/Contents/inventory-contents/transferRequestManagement';
import UnifiedRequestManagement from '@/app/Contents/warehouse-contents/combineRequestManagement';
import CombinedRequests from '@/app/Contents/warehouse-contents/requestPage';
import DeliveryCustomizeWR from '@/app/Contents/warehouse-contents/customizeDelivery';
import CombinedSalePage from '@/app/Contents/saleClearkContents/posSC';
import TransferStock from '@/app/Contents/inventory-contents/transferStock';
import ReceiveTransferDelivery from '@/app/Contents/inventory-contents/receiveTransferDelivery';
import PaymentBehavior from '@/app/Contents/saleClearkContents/paymentBehavior';
import DeliveryTracking from '@/app/Contents/saleClearkContents/deliveryTracking';
import ReceiveCustomizeSC from '@/app/Contents/saleClearkContents/receiveCustomize';

const Sidebar = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [expandedParent, setExpandedParent] = useState(null);
  const [user_id, setUser_id] = useState('');
  const [salesFilterData, setSalesFilterData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && isMounted) {
      setUser_id(sessionStorage.getItem('user_id'));
      
      // Check if there's a stored activePage (for Profile navigation)
      const storedPage = sessionStorage.getItem('activePage');
      if (storedPage) {
        setActivePage(storedPage);
        sessionStorage.removeItem('activePage'); // Clear after use
      }
    }
  }, [isMounted]);

  // Navigation handler for sales with filters
  const handleNavigateToSales = (filterData) => {
    console.log('Navigating to sales with filters:', filterData);
    setSalesFilterData(filterData);
    setActivePage('sales');
    setExpandedParent(null);
  };

  // Clear filter data when navigating away from sales
  const handlePageChange = (pageKey) => {
    if (pageKey !== 'sales') {
      setSalesFilterData(null);
    }
    setActivePage(pageKey);
  };

  const pages = [
    {
      key: 'dashboard',
      label: 'DASHBOARD',
      icon: '/assets/images/dash-icons/last-dash1.png',
      component: <DashboardAdmin onNavigateToSales={handleNavigateToSales} />,
      children: []
    },
    {
      key: 'products',
      label: 'PRODUCTS',
      icon: '/assets/images/dash-icons/last-product.png',
      component: <ProductsAdmin />,
      children: [
         {
          key: 'categories',
          label: 'Category',
          component: <CategoryAdmin />,
        },
        {
          key: 'product-types',
          label: 'Product Types',
          component: <ProductTypeAdmin />,
        },
        {
          key: 'product-parts',
          label: 'Parts Assignment',
          component: <ProductPartsAssignment />,
        },
      ]
    },
    {
      key: 'sales',
      label: 'SALES',
      icon: '/assets/images/dash-icons/last-sale.png',
      component: <SaleAdmin initialFilters={salesFilterData} />,
      children: []
    },
    {
      key: 'inventory',
      label: 'Inventory',
      icon: '/assets/images/dash-icons/last-inventory.png',
      component: <InventoryIM />,
      children: [
        {
          key: 'receive-stock',
          label: 'Receive Stock',
          component: <ReceiveStockIM />,
        },
      
        // {
        //   key: 'request-stock',
        //   label: 'Request Stock',
        //   component: <RequestStockIM />,
        // },

        // {
        //   // key: 'transfer-request',
        //   // label: 'Transfer Request',
        //   // component: <TransferRequestWR />,
        // },
        {
          key: 'inventory-ledger',
          label: 'Inventory Ledger',
          component: <InventoryLedgerIM/>,
        },
        {
          key: 'customize-inventory',
          label: 'Customize Inventory',
          component: <CustomizeInventorySC />,
        },
      ],
    },
    {
      key: 'request-management',
      label: 'Request Stock',
      icon: '/assets/images/dash-icons/last-request.png',
      component: <RequestStockIM />,
      children: [
        {
          key: 'track-request',
          label: 'Track Request',
          component: <TrackRequestIM />,
        },
      ],
    },
    {
      key: 'transfer-request-list',
        label: 'Transfer Request List',
      icon: '/assets/images/dash-icons/transfer.png',
      component: <TransferRequestManagement />,
      children: [
       
      ],
    },
    {
      key: 'locations',
      label: 'LOCATIONS',
      icon: '/assets/images/dash-icons/last-location.png',
      component: <Location />,
      children: [
          {
          key: 'branch-management',
          label: 'Branch',
          component: <BranchAdmin />,
        },
      ]
    },
    // {
    //   key: 'delivery',
    //   label: 'DELIVERY',
    //   icon: '/assets/images/dash-icons/ag-6.png',
    //   component: <DeliveryAdmin />,
    //   children: []
    // },
    {
      key: 'orders',
      label: 'ORDERS',
      icon: '/assets/images/dash-icons/orders.png',
      component: <OrdersManagement />,
      children: []
    },
    {
      key: 'discount',
      label: 'DISCOUNT',
      icon: '/assets/images/dash-icons/discount.png',
      component: <DiscountController />,
      children: []
    },
    {
      key: 'customer',
      label: 'CUSTOMER',
      icon: '/assets/images/dash-icons/last-customer.png',
      component: <Customer />,
      children: []
    },
    {
      key: 'users',
      label: 'USERS',
      icon: '/assets/images/dash-icons/last-user4.png',
      component: <User />,
      children: []
    },
    {
      key: 'combineRequestManagement',
      label: 'Request Management',
      icon: '/assets/images/dash-icons/last-req-management.png',
      component: <UnifiedRequestManagement />,
      children: [
        {
          key: 'request-all',
          label: 'Product Requests',
          component: <CombinedRequests />,
        },
       
      ],
    },
    {
      key: 'deliverycustomize',
      label: 'Delivery',
      icon: '/assets/images/dash-icons/last-track-delivery1.png',
      component: <DeliveryCustomizeWR />,
    },
    {
      key: 'pos1',
      label: 'POS',
      icon: '/assets/images/dash-icons/last-pos1.png',
      component: <CombinedSalePage />,
      children: []
    },
    {
      key: 'transfer-stock',
      label: 'Transfer Stock',
      icon: '/assets/images/dash-icons/transfer.png',
      component: <TransferStock />,
      children: [
        // {
        //   key: 'transfer-request-list',
        //   label: 'Transfer Request List',
        //   component: <TransferRequestManagement />,
        // },
        {
          key: 'receive-transfer-delivery',
          label: 'Receive Transfer Delivery',
          component: <ReceiveTransferDelivery />,
        },
      ],
    },
    {
      key: 'installments',
      label: 'INSTALLMENTS',
      icon: '/assets/images/dash-icons/last-installment1.png',
      component: <PaymentBehavior />,
      children: []
    },
    {
      key: 'delivery',
      label: 'DELIVERY TRACKING',
      icon: '/assets/images/dash-icons/last-track-delivery1.png',
      component: <DeliveryTracking />,
      children: []
    },
    {
      key: 'customize',
      label: 'CUSTOMIZE INVENTORY',
      icon: '/assets/images/dash-icons/last-customer1.png',
      component: <CustomizeInventorySC />,
      children: [
        {
          key: 'customizeRecieve',
          label: 'Receive Customize',
          icon: '/assets/images/sale.png',
          component: <ReceiveCustomizeSC />
        }
      ]
    },




    {
      key: 'audit',
      label: 'AUDIT LOG',
      icon: '/assets/images/dash-icons/last-log2.png',
      component: <Audit />,
      children: []
    },
    {
      key: 'profileSetting',
      label: 'PROFILE SETTING',
      icon: '/assets/images/dash-icons/last-profile1.png',
      component: <ProfileSetting />,
      children: []
    }
  ];

  // Helper function to check if a parent should be active
  const isParentActive = (page) => {
    // Parent is active if it's directly selected
    if (activePage === page.key) return true;
    
    // Parent is also active if any of its children are selected
    if (page.children && page.children.length > 0) {
      return page.children.some(child => child.key === activePage);
    }
    
    return false;
  };

  const toggleExpand = (key, hasChildren) => {
    handlePageChange(key);

    if (hasChildren) {
      if (expandedParent !== key) {
        setExpandedParent(key);
      }
    } else {
      setExpandedParent(null);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    for (const page of pages) {
      if (page.key === activePage) return page.component;
      if (page.children && page.children.length > 0) {
        const child = page.children.find(child => child.key === activePage);
        if (child) return child.component;
      }
    }
    return null;
  };

  const getPageLabel = () => {
    const parent = pages.find((p) => p.key === activePage);
    let label = parent?.label;

    if (!label) {
      for (const p of pages) {
        if (p.children && p.children.length > 0) {
          const child = p.children.find((c) => c.key === activePage);
          if (child) {
            label = child.label;
            break;
          }
        }
      }
    }

    // fallback
    if (!label) label = "dashboard";

    // Capitalize: first letter uppercase, rest lowercase
    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  };

  useEffect(() => {
    document.title = "Admin - " + getPageLabel();
  }, [activePage]); // <-- run every time activePage changes

  return (
    <>
      <div className="container-layout">
        {/* Hamburger Menu Button for Mobile */}
        <button className="hamburger-menu" onClick={toggleSidebar} aria-label="Toggle Menu" hidden={isSidebarOpen}>
          <span className={`hamburger-line ${isSidebarOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isSidebarOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isSidebarOpen ? 'open' : ''}`}></span>
        </button>

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

        <aside className={`sidebar1 ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-header">
            <h2 className="sidebar-title">ADMIN PAGE</h2>
            {/* <button className="close-sidebar" onClick={closeSidebar} aria-label="Close Menu">
              ✕
            </button> */}
          </div>
          <p className="line">_________________</p>
          <nav className="sidebar-nav">
            {pages.map((page) => (
              <div key={page.key}>
                <p
                  className={`sidebar-item ${isParentActive(page) ? 'active' : ''}`}
                  onClick={() => {
                    toggleExpand(page.key, page.children && page.children.length > 0);
                    if (!page.children || page.children.length === 0) {
                      closeSidebar();
                    }
                  }}
                >
                  <Image src={page.icon} width={40} height={40} alt={page.label} />
                  {page.label}
                </p>

                {page.children && page.children.length > 0 && expandedParent === page.key && (
                  <div className="child-menu">
                    {page.children.map((child) => (
                      <p
                        key={child.key}
                        className={`sidebar-child-item ${activePage === child.key ? 'active' : ''}`}
                        onClick={() => {
                          handlePageChange(child.key);
                          closeSidebar();
                        }}
                      >
                        &nbsp;&nbsp;
                        <Image src={'/assets/images/arrow.png'} alt='arrow' height={40} width={40} />
                        {child.label}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <section className="main-content">{renderContent()}</section>
      </div>
    </>
  );
};

export default Sidebar;