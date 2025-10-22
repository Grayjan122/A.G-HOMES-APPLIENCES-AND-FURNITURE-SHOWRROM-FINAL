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

const Sidebar = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [expandedParent, setExpandedParent] = useState(null);
  const [user_id, setUser_id] = useState('');
  const [salesFilterData, setSalesFilterData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setUser_id(sessionStorage.getItem('user_id'));
  }, []);

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
      icon: '/assets/images/dash-icons/ag-1.png',
      component: <DashboardAdmin onNavigateToSales={handleNavigateToSales} />,
      children: []
    },
    {
      key: 'products',
      label: 'PRODUCTS',
      icon: '/assets/images/dash-icons/ag-2.png',
      component: <ProductsAdmin />,
      children: [
         {
          key: 'categories',
          label: 'Category',
          component: <CategoryAdmin />,
        },
      ]
    },
    {
      key: 'sales',
      label: 'SALES',
      icon: '/assets/images/dash-icons/ag-3.png',
      component: <SaleAdmin initialFilters={salesFilterData} />,
      children: []
    },
    {
      key: 'inventory',
      label: 'INVENTORY',
      icon: '/assets/images/dash-icons/ag-4.png',
      component: <InventoryIM />,
      children: [
        {
          key: 'inventory-ledger',
          label: 'Inventory Ledger',
          component: <InventoryLedgerAdmin />,
        },
      ],
    },
    {
      key: 'locations',
      label: 'LOCATIONS',
      icon: '/assets/images/dash-icons/ag-5.png',
      component: <Location />,
      children: [
          {
          key: 'branch-management',
          label: 'Branch',
          component: <BranchAdmin />,
        },
      ]
    },
    {
      key: 'delivery',
      label: 'DELIVERY',
      icon: '/assets/images/dash-icons/ag-6.png',
      component: <DeliveryAdmin />,
      children: []
    },
    {
      key: 'customer',
      label: 'CUSTOMER',
      icon: '/assets/images/dash-icons/ag-7.png',
      component: <Customer />,
      children: []
    },
    {
      key: 'users',
      label: 'USERS',
      icon: '/assets/images/dash-icons/ag-8.png',
      component: <User />,
      children: []
    },
    {
      key: 'audit',
      label: 'AUDIT LOG',
      icon: '/assets/images/dash-icons/ag-9.png',
      component: <Audit />,
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
                  <Image src={page.icon} width={50} height={50} alt={page.label} />
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