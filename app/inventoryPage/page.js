'use client';
import React from 'react'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../Components/Header/page';
import Sidebar from '../Components/Sidebar-Admin/page';

import { useState } from 'react';
import SidebarInventory from '../Components/Sidebar-Inventory/page';
import { LogInSuccess } from '../Components/SweetAlert/logIn';
import InactivityLogout from '../Components/InactivityLogout/inactivityLogout';
import SessionValidator from '../Components/SessionValidator/sessionValidator';


const InventoryPage = () => {

  const router = useRouter();

  const [user_id, setUser_ID] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted) return;

    const user_id = sessionStorage.getItem("user_id");
    const hasReloaded = sessionStorage.getItem("reloaded");

    if (!hasReloaded) {
      // Mark as reloaded so next mount shows alert
      sessionStorage.setItem("reloaded", "true");
      window.location.reload();
    } else {
      // ✅ Show alert only after reload
      const a = sessionStorage.getItem("loginSuccess");
      if (a === "true") {
        setTimeout(() => {
          LogInSuccess({
            icon: "success",
            title:
              "Signed in successfully, Welcome " +
              sessionStorage.getItem("user_fname") +
              "!",
          });
          sessionStorage.setItem("loginSuccess", "false");
          sessionStorage.removeItem("reloaded");
        }, 1000); // ⏱ 1000ms = 1 second delay
      }
    }

    setUser_ID(user_id);

    if (!user_id) {
      router.push('/errorPage');

    }
  }, [isMounted, router]);

  return (
    <>
      <InactivityLogout />
      <SessionValidator />
      <Header />
      <SidebarInventory />



    </>

  )
}

export default InventoryPage