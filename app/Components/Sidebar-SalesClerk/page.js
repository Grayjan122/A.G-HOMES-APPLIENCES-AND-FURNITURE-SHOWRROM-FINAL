'use client';

import '../../css/sidebar.css';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Components
import DashboardSalesClerk from '@/app/Contents/saleClearkContents/dashboardSC';
import CombinedSalePage from '@/app/Contents/saleClearkContents/posSC';
import PaymentBehavior from '@/app/Contents/saleClearkContents/paymentBehavior';
import DeliveryTracking from '@/app/Contents/saleClearkContents/deliveryTracking';
import CustomizeInventorySC from '@/app/Contents/saleClearkContents/customizInventory';
import ReceiveCustomizeSC from '@/app/Contents/saleClearkContents/receiveCustomize';
import CustomizeManagementSC from '@/app/Contents/saleClearkContents/customizeManagement';
import Customer from '@/app/Contents/admin-contents/customerPage';
import ProfileSetting from '../profileSetting/userProfilePage';
import InventoryIM from '@/app/Contents/inventory-contents/inventoryIM';

const SidebarSaleClerk = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [expandedParent, setExpandedParent] = useState(null);
  const [user_id, setUser_id] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ Get user_id and check if there's a stored active page
  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted) return;

    setUser_id(sessionStorage.getItem('user_id'));

    const savedPage = sessionStorage.getItem('activePage');
    if (savedPage) {
      setActivePage(savedPage);
      sessionStorage.removeItem('activePage'); // clear it after switching
    }
  }, [isMounted]);

  const [mainSize, setMainSize] = useState('755px');
  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted) return;

    const ua = navigator.userAgent;
    if (ua.includes('Edg')) {
      setMainSize('755px');
    } else if (ua.includes('Chrome')) {
      setMainSize('715px');
    }
  }, [isMounted]);

  // 📌 handle page change
  const handlePageChange = (pageKey) => {
    setActivePage(pageKey);
  };

  // 📃 list of all pages in sidebar
  const pages = [
    {
      key: 'dashboard',
      label: 'DASHBOARD',
      icon: '/assets/images/dash-icons/last-dash1.png',
      component: <DashboardSalesClerk />,
      children: []
    },
    {
      key: 'pos1',
      label: 'POS',
      icon: '/assets/images/dash-icons/last-pos1.png',
      component: <CombinedSalePage />,
      children: []
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
    // {
    //   key: 'customizemanagement',
    //   label: 'CUSTOMIZE MANAGEMENT',
    //   icon: '/assets/images/dash-icons/ag-13.png',
    //   component: <CustomizeManagementSC />,
    //   children: []
    // },
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
      key: 'customer',
      label: 'CUSTOMER',
      icon: '/assets/images/dash-icons/last-customer.png',
      component: <Customer />,
      children: []
    },
    {
      key: 'profileSetting',
      label: 'PROFILE SETTING',
      icon: '/assets/images/dash-icons/last-profile1.png',
      component: <ProfileSetting />,
      children: []
    // 64px
    }
  ];

  // 🧠 check if parent should be active
  const isParentActive = (page) => {
    if (activePage === page.key) return true;
    if (page.children && page.children.length > 0) {
      return page.children.some((child) => child.key === activePage);
    }
    return false;
  };

  // 📌 toggle expand for menu with children
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

  // 🧭 render selected content
  const renderContent = () => {
    for (const page of pages) {
      if (page.key === activePage) return page.component;
      if (page.children && page.children.length > 0) {
        const child = page.children.find((child) => child.key === activePage);
        if (child) return child.component;
      }
    }
    return null;
  };

  // 📝 get page label for document.title
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
    if (!label) label = 'dashboard';
    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  };

  useEffect(() => {
    document.title = 'Sales Clerk - ' + getPageLabel();
  }, [activePage]);

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
            <h2 className="sidebar-title">SALES CLERK</h2>
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
                        <Image src={'/assets/images/arrow.png'} alt="arrow" height={40} width={40} />
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
