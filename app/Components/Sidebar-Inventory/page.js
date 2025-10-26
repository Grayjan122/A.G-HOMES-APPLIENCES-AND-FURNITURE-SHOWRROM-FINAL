'use client';

import '../../css/sidebar.css';
import Image from 'next/image';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { Col, Row, Container } from 'react-bootstrap';
import 'sweetalert2/dist/sweetalert2.all';
import Swal from 'sweetalert2';
import Head from "next/head";

// Components
import DashboardIM from '@/app/Contents/inventory-contents/dashboardIM';




import InventoryIM from '@/app/Contents/inventory-contents/inventoryIM';
import TrackRequestIM from '@/app/Contents/inventory-contents/trackRequest';
import RequestStockIM from '@/app/Contents/inventory-contents/requestStockIM';
import ReceiveStockIM from '@/app/Contents/inventory-contents/receiveStock';
import InventoryLedgerIM from '@/app/Contents/inventory-contents/inventoryAudit';
import CustomizeInventorySC from '@/app/Contents/saleClearkContents/customizInventory';
import ProfileSetting from '@/app/Components/profileSetting/userProfilePage';

const SidebarInventory = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [expandedParent, setExpandedParent] = useState(null);
  const [user_id, setUser_id] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted) return;

    setUser_id(sessionStorage.getItem('user_id'));
    document.title = 'Jan';

    const user_id = sessionStorage.getItem("user_id");
    if (!user_id) {
      return;
    }

    // Check if there's a stored activePage (for Profile navigation)
    const storedPage = sessionStorage.getItem('activePage');
    if (storedPage) {
      setActivePage(storedPage);
      sessionStorage.removeItem('activePage'); // Clear after use
    } else {
      setActivePage('dashboard');
    }

    // const Toast = Swal.mixin({
    //   toast: true,
    //   position: "top-end",
    //   showConfirmButton: false,
    //   timer: 5000,
    //   timerProgressBar: true,
    //   didOpen: (toast) => {
    //     toast.onmouseenter = Swal.stopTimer;
    //     toast.onmouseleave = Swal.resumeTimer;
    //   }
    // });

    // Toast.fire({
    //   icon: "success",
    //   title: "Signed in successfully"
    // });



  }, [isMounted]);

  const yawa = () => {0
    document.title = 'Jan Page'
  }



  const pages = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: '/assets/images/dash-icons/last-dash1.png',
      component: <DashboardIM />,
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
          component: <InventoryLedgerIM />,
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
      key: 'profileSetting',
      label: 'Profile Setting',
      icon: '/assets/images/dash-icons/last-profile1.png',
      component: <ProfileSetting />,
      children: []
    }

  ];

  const toggleExpand = (key, hasChildren) => {
    setActivePage(key);

    if (hasChildren) {
      // Only change expandedParent if you're clicking a different one
      if (expandedParent !== key) {
        setExpandedParent(key);
      }
      // Don't collapse it if clicking the same parent again
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
    document.title = "IM - " + getPageLabel();

  }, [activePage]); // <-- run every time activePage changes

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
          <h2 className="sidebar-title">INVENTORY PAGE</h2>
          {/* <button className="close-sidebar" onClick={closeSidebar} aria-label="Close Menu">
            ✕
          </button> */}
        </div>
        <p className='line'>_________________</p>
        <nav className="sidebar-nav">
          {pages.map((page) => (
            <div key={page.key}>
              <p
                className={`sidebar-item ${activePage === page.key ? 'active' : ''}`}
                onClick={() => {
                  sessionStorage.setItem('once', "false");
                  toggleExpand(page.key, !!page.children, page.component);
                  if (!page.children) {
                    closeSidebar();
                  }
                }}
              >
                <Image src={page.icon} width={40} height={40} alt={page.label} />
                {page.label}
              </p>

              {/* Child Items */}
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
    </>
  );
};

export default SidebarInventory;


