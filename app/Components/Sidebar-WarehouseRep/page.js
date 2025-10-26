'use client';

import '../../css/sidebar.css';
import Image from 'next/image';
import { useState, useEffect } from 'react';

// Components
import Dashboard from '@/app/Contents/admin-contents/Dashboard/page';

import RequestManagementWR from '@/app/Contents/warehouse-contents/requestManagement';
import StockRequestWR from '@/app/Contents/warehouse-contents/stockRequest';
import InventoryWR from '@/app/Contents/warehouse-contents/inventoryWR';
import InventoryLedgerWR from '@/app/Contents/warehouse-contents/inventoryAuditWR';
import DeliveryWR from '@/app/Contents/warehouse-contents/delivery';
import StockInWR from '@/app/Contents/warehouse-contents/stockin';
import DashboardWR from '@/app/Contents/warehouse-contents/dashboardWR';
import CustomizeRequest from '@/app/Contents/warehouse-contents/customizeReq';
import CombinedRequests from '@/app/Contents/warehouse-contents/requestPage';
import RequestManagementCustomizeWR from '@/app/Contents/warehouse-contents/requestManagementCustomize';
import UnifiedRequestManagement from '@/app/Contents/warehouse-contents/combineRequestManagement';
import DeliveryCustomizeWR from '@/app/Contents/warehouse-contents/customizeDelivery';
import ProfileSetting from '@/app/Components/profileSetting/userProfilePage';
import InventoryIM from '@/app/Contents/inventory-contents/inventoryIM';

const SidebarWarehouseRep = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [expandedParent, setExpandedParent] = useState(null);
  const [locName, setLocName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted) return;

    const user_id = sessionStorage.getItem("user_id");

    if (!user_id){
      return;
    }
    setLocName(sessionStorage.getItem('location_name'));

    // Check if there's a stored activePage (for Profile navigation)
    const storedPage = sessionStorage.getItem('activePage');
    if (storedPage) {
      setActivePage(storedPage);
      sessionStorage.removeItem('activePage'); // Clear after use
    }
  }, [isMounted]);

  const pages = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: '/assets/images/dashboard.png',
      component: <DashboardWR setActivePage={setActivePage} setExpandedParent={setExpandedParent} />,
    },
    {
      key: 'inventory',
      label: 'Inventory',
      icon: '/assets/images/inventory.png',
      component: <InventoryWR />,
      children: [
        {
          key: 'inventory-stockin',
          label: 'Stock In',
          component: <StockInWR />,
        },
        {
          key: 'inventory-ledger',
          label: 'Inventory Ledger',
          component: <InventoryLedgerWR />,
        },
      ],
    },
     {
      key: 'combineRequestManagement',
      label: 'Request Management',
      icon: '/assets/images/req-mng.png',
      component: <UnifiedRequestManagement />,
      children: [
        {
          key: 'request-all',
          label: 'Product Requests',
          component: <CombinedRequests />,
        },
       
      ],
    },
    // {
    //   key: 'requestmanagement',
    //   label: 'Request Management',
    //   icon: '/assets/images/req-mng.png',
    //   component: <RequestManagementWR />,
    //   children: [
    //     // {
    //     //   key: 'inventory-transfer-request',
    //     //   label: 'Stock Request',
    //     //   component: <StockRequestWR />,
    //     // },
    //     //  {
    //     //   key: 'customize-request',
    //     //   label: 'Customize Request',
    //     //   component: <CustomizeRequest />,
    //     // },
    //     //  {
    //     //   key: 'request-all',
    //     //   label: 'Product Requests',
    //     //   component: <CombinedRequests />,
    //     // },
    //   ],
    // },
    //  {
    //   key: 'requestmanagementcustomize',
    //   label: 'Request Management Customize',
    //   icon: '/assets/images/req-mng.png',
    //   component: <RequestManagementCustomizeWR />,
    //   children: [
    //     // {
    //     //   key: 'inventory-transfer-request',
    //     //   label: 'Stock Request',
    //     //   component: <StockRequestWR />,
    //     // },
    //     //  {
    //     //   key: 'customize-request',
    //     //   label: 'Customize Request',
    //     //   component: <CustomizeRequest />,
    //     // },
       
    //   ],
    // },
    // {
    //   key: 'delivery',
    //   label: 'Delivery',
    //   icon: '/assets/images/delivery-removebg-preview.png',
    //   component: <DeliveryWR />,
    // },
     {
      key: 'deliverycustomize',
      label: 'Delivery',
      icon: '/assets/images/delivery-removebg-preview.png',
      component: <DeliveryCustomizeWR />,
    },
    {
      key: 'profileSetting',
      label: 'Profile Setting',
      icon: '/assets/images/customer.png',
      component: <ProfileSetting />,
      children: []
    }
  ];

  // Helper function to check if a parent should be active
  const isParentActive = (page) => {
    // Parent is active if it's directly selected
    if (activePage === page.key) return true;
    
    // Parent is also active if any of its children are selected
    if (page.children) {
      return page.children.some(child => child.key === activePage);
    }
    
    return false;
  };

  const toggleExpand = (key, hasChildren) => {
    setActivePage(key);

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
      if (page.children) {
        const child = page.children.find(child => child.key === activePage);
        if (child) return child.component;
      }
    }
    return null;
  };

  const getPageLabel = () => {
    const parent = pages.find((p) => p.key === activePage);
    if (parent) return parent.label;

    for (const p of pages) {
      if (p.children) {
        const child = p.children.find((c) => c.key === activePage);
        if (child) return child.label;
      }
    }
    return "dashboard";
  };

  useEffect(() => {
    document.title = "WR - " + getPageLabel();
  }, [activePage]);

  return (
    <>
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
          <h2 className="sidebar-title">{locName.toUpperCase()}</h2>
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
                  toggleExpand(page.key, !!page.children, page.component);
                  sessionStorage.setItem('once', "false");
                  if (!page.children) {
                    closeSidebar();
                  }
                }}
              >
                <Image src={page.icon} width={40} height={40} alt={page.label} />
                {page.label}
              </p>

              {page.children && expandedParent === page.key && (
                <div className="child-menu">
                  {page.children.map((child) => (
                    <p
                      key={child.key}
                      className={`sidebar-child-item ${activePage === child.key ? 'active' : ''}`}
                      onClick={() => {
                        setActivePage(child.key);
                        sessionStorage.setItem('once', "false");
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

      <section className="main-content">
        {renderContent()}
      </section>
      {/* <InventoryIM /> */}
    </>
  );
};

export default SidebarWarehouseRep;