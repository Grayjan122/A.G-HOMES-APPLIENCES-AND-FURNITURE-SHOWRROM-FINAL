'use client';

import '../../css/sidebar.css';
import Image from 'next/image';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';

// Components
import Dashboard from '@/app/Contents/admin-contents/Dashboard/page';
import Products from '@/app/Contents/admin-contents/Products/page';
import Sale from '@/app/Contents/admin-contents/Sale/page';
import Analytics from '@/app/Contents/admin-contents/Analytics/page';
import Inventory from '@/app/Contents/admin-contents/Inventory/page';
import Location from '@/app/Contents/admin-contents/Location/page';
import Delivery from '@/app/Contents/admin-contents/Delivery/page';

import User from '@/app/Contents/admin-contents/User/page';
import Setting from '@/app/Contents/admin-contents/Setting/page';
import InventoryIM from '@/app/Contents/inventory-contents/Inventory/page';
import DeliveryDriver from '@/app/Contents/driver-contens/Delivery/page';
import PosSale from '@/app/Contents/saleClreck-contents/pos';
import SalePage from '@/app/Contents/saleClearkContents/pos';
import Customer from '@/app/Contents/admin-contents/customerPage';
import InstallmentSC from '@/app/Contents/saleClearkContents/installments';
import DashboardSalesClerk from '@/app/Contents/saleClearkContents/dashboardSC';
import PaymentBehavior from '@/app/Contents/saleClearkContents/paymentBehavior';
import CustomizeSalePage from '@/app/Contents/saleClearkContents/customize';
import CombinedSalePage from '@/app/Contents/saleClearkContents/posSC';

const SidebarSaleClerk = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [expandedParent, setExpandedParent] = useState(null);
  const [user_id, setUser_id] = useState('');

  useEffect(() => {
    setUser_id(sessionStorage.getItem('user_id'));
  }, []);

  const [mainSize, setMainSize] = useState('755px');
  useEffect(() => {
    const ua = navigator.userAgent;

    if (ua.includes("Edg")) {
      setMainSize('755px');
    } else if (ua.includes("Chrome")) {
      setMainSize('715px');
    }
  }, []);

  // Handle page change
  const handlePageChange = (pageKey) => {
    setActivePage(pageKey);
  };

  const pages = [
    { 
      key: 'dashboard', 
      label: 'DASHBOARD', 
      icon: '/assets/images/dashboard.png', 
      component: <DashboardSalesClerk />,
      children: []
    },
    // { key: 'products', label: 'PRODUCTS', icon: '/assets/images/product1.png', component: <Products /> },
    // { 
    //   key: 'pos', 
    //   label: 'POS', 
    //   icon: '/assets/images/sale.png', 
    //   component: <SalePage />,
    //   children: []
    // },
     { 
      key: 'pos1', 
      label: 'POS', 
      icon: '/assets/images/sale.png', 
      component: <CombinedSalePage />,
      children: []
    },
    // { 
    //   key: 'customize', 
    //   label: 'CUSTOMIZE', 
    //   icon: '/assets/images/sale.png', 
    //   component: <CustomizeSalePage />,
    //   children: []
    // },
    { 
      key: 'installments', 
      label: 'INSTALLMENTS', 
      icon: '/assets/images/dash-icons/ag-11.png', 
      component: <PaymentBehavior />,
      // component: <InstallmentSC />,
      children: []
    },

    // { key: 'analytics', label: 'ANALYTICS', icon: '/assets/images/anal1.png', component: <Analytics /> },
    // { key: 'inventory', label: 'INVENTORY', icon: '/assets/images/inventory.png', component: <InventoryIM /> },
    // { key: 'locations', label: 'LOCATIONS', icon: '/assets/images/warehouse.png', component: <Location /> },
    // { key: 'delivery', label: 'DELIVERY', icon: '/assets/images/delivery-removebg-preview.png', component: <DeliveryDriver/> },
    {
      key: 'customer', 
      label: 'CUSTOMER', 
      icon: '/assets/images/customer.png', 
      component: <Customer />, 
      children: [
        // {
        //   key: 'PaymentBehavior',
        //   label: 'Payment Behavior',
        //   component: <PaymentBehavior />,
        // },
      ]
    },
    // { key: 'users', label: 'USERS', icon: '/assets/images/user-removebg-preview.png', component: <User /> },
    // { key: 'setting', label: 'SETTING', icon: '/assets/images/setting.png', component: <Setting /> },
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

  const renderContent = () => {
    // First check for direct page match
    for (const page of pages) {
      if (page.key === activePage) return page.component;
      
      // Then check for child page match
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
    document.title = "Sales Clerk - " + getPageLabel();
  }, [activePage]);

  return (
    <>
      <div className="container-layout">
        <aside className="sidebar1">
          <h2 className="sidebar-title">SALES CLERK</h2>
          <p className='line'>_________________</p>
          {/* <p>{user_id}</p> */}
          <nav className="sidebar-nav">
            {pages.map((page) => (
              <div key={page.key}>
                <p
                  className={`sidebar-item ${isParentActive(page) ? 'active' : ''}`}
                  onClick={() => {
                    toggleExpand(page.key, page.children && page.children.length > 0);
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

        <section className="main-content">
          {renderContent()}
        </section>
      </div>
    </>
  );
};

export default SidebarSaleClerk;