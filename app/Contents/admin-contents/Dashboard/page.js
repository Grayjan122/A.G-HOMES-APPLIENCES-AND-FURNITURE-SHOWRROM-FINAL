'use client';

import "../../../css/dashboard.css";
import axios from 'axios';
import { useEffect, useState } from 'react';
import Router from "next/router";


import { useRouter } from "next/navigation";

const Dashboard = () => {
    const [counts, setCounts] = useState({
        prodCount: '0',
        categoryCount: '0',
        locationCount: '0',
        userCount: '0',
        customerCount: '0',
        ongoingDelivery: '0',
        montlySales: '0.00',
        dailySales: '0.00',

    });

    const countConfigs = [
        { id: 'product_id', from: 'products', name: 'product_count', stateKey: 'prodCount' },
        { id: 'category_id', from: 'category', name: 'category_count', stateKey: 'categoryCount' },
        { id: 'location_id', from: 'location', name: 'location_count', stateKey: 'locationCount' },
        { id: 'account_id', from: 'account', name: 'user_count', stateKey: 'userCount' },
        { id: 'cust_id', from: 'customers', name: 'customer_count', stateKey: 'customerCount' },

        // Add more here if needed
    ];
    const [mainSize, setMainSize] = useState('0');

    useEffect(() => {
        const ua = navigator.userAgent;

        if (ua.includes("Edg")) {
            // setMainSize('720px');
        } else if (ua.includes("Chrome")) {
            // setMainSize('680px');
        }
    }, []);


    useEffect(() => {
        const user_id = sessionStorage.getItem("user_id");
        if (!user_id) {
            return;
        }
        countConfigs.forEach(config => fetchCount(config));
    }, []);

    const fetchCount = async ({ id, from, name, stateKey }) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'counts.php';

        const countDetails = { ID: id, tFrom: from, tName: name };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(countDetails),
                    operation: 'Count'
                }
            });

            const countValue = response.data?.[0]?.[name] || '0';

            setCounts(prev => ({
                ...prev,
                [stateKey]: countValue
            }));
        } catch (error) {
            console.error(`Error fetching ${stateKey}:`, error);
        }
    };
    const cards = [
        { title: 'TOTAL PRODUCT(S)', value: counts.prodCount, path: '/Contents/Products', image: '/assets/images/products.png' },
        { title: 'TOTAL CATEGORY', value: counts.categoryCount, path: '/Contents/Products', image: '/assets/images/category.png' },
        { title: 'TOTAL SALES (DAILY)', value: 'PHP' + counts.dailySales, path: '/Contents/Sale', image: '/assets/images/daily.png' },
        { title: 'TOTAL SALES (MONTHLY)', value: 'PHP' + counts.montlySales, path: '/Contents/Sale', image: '/assets/images/monthly.png' },
        { title: 'SOLD OUT ITEM(S)', value: '0', path: '/Contents/Inventory', image: '/assets/images/soldout.png' },
        { title: 'TOTAL LOCATION(S)', value: counts.locationCount, path: '/Contents/Location', image: '/assets/images/locations1.png' },
        { title: 'ONGOING DELIVERY', value: counts.ongoingDelivery, path: '/Contents/Delivery', image: '/assets/images/ongoing-delivery.png' },
        { title: 'TOTAL CUSTOMER(S)', value: counts.customerCount, path: '/Contents/Customer', image: '/assets/images/customers1.png' },
        { title: 'TOTAL USER(S)', value: counts.userCount, path: '/Contents/User', image: '/assets/images/users.png' },
    ];

    const router = useRouter();

    const handleCardClick = (path) => {
        // if (path) router.push(path);
    };


    return (
        <div className='dash-main' >
            <h1 className='h-dashboard'>DASHBOARD</h1>
            <div className='container'>
                {cards.map((card, index) => (
                    <div key={index} className='card'
                        // onClick={() => router.push(card.path)} 
                        style={{ cursor: 'pointer' }}
                    >
                        <div className='cardText'>
                            <p className='title'>{card.title}</p>

                        </div>
                        <div className="icon-and-val">
                            <div>
                                <h2 className='value'>{card.value}</h2>

                            </div>
                            <div>
                                <img src={card.image} alt="icon" className='icon' />

                            </div>

                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
};

export default Dashboard;
