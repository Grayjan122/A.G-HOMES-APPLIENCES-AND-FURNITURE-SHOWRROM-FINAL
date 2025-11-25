'use client';
import React from 'react';
import "../../css/location.css";
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const ITEMS_PER_PAGE = 8;

const Location = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const [message, setMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [branchFilter, setBranchFilter] = useState('');
  const [locationSearchFilter, setLocationSearchFilter] = useState('');

  // Modal visibility states
  const [addLocationVisible, setAddLocationVisible] = useState(true);
  const [viewLocationVisible, setViewLocationVisible] = useState(true);
  const [editLocationVisible, setEditLocationVisible] = useState(true);

  // Data arrays
  const [branchList, setBranchList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [locationTypeList, setLocationTypeList] = useState([]);

  // Location inputs
  const [locID, setLocID] = useState('');
  const [locName, setLocName] = useState('');
  const [locContactPerson, setLocContactPerson] = useState('');
  const [locPhone, setLocPhone] = useState('');
  const [locEmail, setLocEmail] = useState('');
  const [locAddress, setLocAddress] = useState('');
  const [locBranchID, setLocBranchID] = useState('');
  const [locBranchName, setLocBranchName] = useState('');
  const [locTypeID, setLocTypeID] = useState('');
  const [locTypeName, setLocTypeName] = useState('');

  // Filter locations
  const filteredLocations = useMemo(() => {
    return locationList.filter(location => {
      // Branch filter
      if (branchFilter && location.branch_id != branchFilter) {
        return false;
      }

      // Search filter
      if (locationSearchFilter.trim()) {
        const searchTerm = locationSearchFilter.toLowerCase();
        return location.location_name.toLowerCase().includes(searchTerm) ||
               location.address.toLowerCase().includes(searchTerm) ||
               location.branch_name.toLowerCase().includes(searchTerm) ||
               location.contact_person.toLowerCase().includes(searchTerm);
      }

      return true;
    });
  }, [locationList, branchFilter, locationSearchFilter]);

  // Pagination
  const totalPagesLocations = Math.ceil(filteredLocations.length / ITEMS_PER_PAGE);
  const startIndexLocations = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentLocationItems = filteredLocations.slice(startIndexLocations, startIndexLocations + ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [branchFilter, locationSearchFilter]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPagesLocations) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    GetBranch();
    GetLocation();
    GetLocationType();
  }, []);

  const GetBranch = async () => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'GetDropDown.php';

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify([]),
          operation: "GetBranch"
        }
      });

      setBranchList(response.data);
    } catch (error) {
      console.error("Error fetching branch list:", error);
    }
  }

  const GetLocationType = async () => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'GetDropDown.php';

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify([]),
          operation: "GetLocationType"
        }
      });

      if (Array.isArray(response.data) && response.data.length > 0) {
        setLocationTypeList(response.data);
        console.log('✅ Location types loaded:', response.data.length, 'types');
      } else {
        console.warn('⚠️ No location types found or invalid response:', response.data);
        showAlertError({
          icon: "warning",
          title: "No Location Types Available",
          text: 'No location types found. Please add location types first before adding locations.',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error("Error fetching location type list:", error);
      showAlertError({
        icon: "error",
        title: "Error Loading Location Types",
        text: 'Failed to load location types. Please refresh the page and try again.',
        button: 'OK'
      });
    }
  }

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
  }

  const resetForm = () => {
    setLocID('');
    setLocName('');
    setLocContactPerson('');
    setLocPhone('');
    setLocEmail('');
    setLocAddress('');
    setLocBranchID('');
    setLocBranchName('');
    setLocTypeID('');
    setLocTypeName('');
    setModalTitle('');
    setMessage('');
  };

  const close_modal = () => {
    setShow(false);
    setAddLocationVisible(true);
    setViewLocationVisible(true);
    setEditLocationVisible(true);
    resetForm();
  }

  const addLocation = async () => {
    if (
      !locName.trim() ||
      !locContactPerson.trim() ||
      !locPhone.trim() ||
      !locEmail.trim() ||
      !locAddress.trim() ||
      !locBranchID.trim() ||
      !locTypeID.trim()
    ) {
     
       showAlertError({
          icon: "warning",
          title: "Location Details Incomplete!",
          text: 'Please fill all the required details!',
          button: 'Try Again'
        });
      return;
    }

    // Validate location type ID exists in the list
    const locTypeIDInt = parseInt(locTypeID, 10);
    if (isNaN(locTypeIDInt)) {
      showAlertError({
        icon: "error",
        title: "Invalid Location Type!",
        text: 'Please select a valid location type.',
        button: 'OK'
      });
      return;
    }

    // Check if the location type exists in the list
    const locationTypeExists = locationTypeList.some(lt => parseInt(lt.loc_type_id, 10) === locTypeIDInt);
    if (!locationTypeExists) {
      showAlertError({
        icon: "error",
        title: "Location Type Not Found!",
        text: 'The selected location type is invalid. Please refresh the page and try again.',
        button: 'OK'
      });
      return;
    }

    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'location.php';
    const locationDetails = {
      locName: locName,
      contactPerson: locContactPerson,
      phone: locPhone,
      email: locEmail,
      address: locAddress,
      branchID: parseInt(locBranchID, 10), // Ensure it's an integer
      locTypeID: locTypeIDInt // Ensure it's an integer
    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(locationDetails),
          operation: "AddLocation"
        }
      });

      if (response.data == 'Success') {
        GetLocation();
        close_modal();
        AlertSucces(
          "New location is successfully added!",
          "success",
          true,
          'Okay'
        );
      } else {
        // Check if it's a foreign key constraint error
        const errorMessage = response.data?.message || response.data || 'Unknown error';
        const errorStr = typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage);
        
        if (errorStr.includes('foreign key') || errorStr.includes('loc_type_id') || errorStr.includes('Integrity constraint')) {
          showAlertError({
            icon: "error",
            title: "Invalid Location Type!",
            text: 'The selected location type is invalid or does not exist in the database. Please select a valid location type from the dropdown.',
            button: 'OK'
          });
        } else {
          showAlertError({
            icon: "error",
            title: "Something Went Wrong!",
            text: errorStr || 'Failed to add new location!',
            button: 'Try Again'
          });
        }
        console.log('Error response:', response.data);
      }
    } catch (error) {
      console.error("Error adding new location", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add location';
      const errorStr = typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage);
      
      if (errorStr.includes('foreign key') || errorStr.includes('loc_type_id') || errorStr.includes('Integrity constraint')) {
        showAlertError({
          icon: "error",
          title: "Invalid Location Type!",
          text: 'The selected location type is invalid or does not exist in the database. Please select a valid location type from the dropdown.',
          button: 'OK'
        });
      } else {
        showAlertError({
          icon: "error",
          title: "Error",
          text: errorStr,
          button: 'OK'
        });
      }
    }
  }

  const GetLocationDetails = async (loc_id) => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'location.php';
    const locationDetails = {
      locID: loc_id
    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(locationDetails),
          operation: "GetLocationDetails"
        }
      });

      console.log('📍 Location Details Response:', response.data[0]);
      console.log('🔍 Checking for location type name in:');
      console.log('  - location_type_name:', response.data[0].location_type_name);
      console.log('  - loc_type_name:', response.data[0].loc_type_name);
      console.log('  - type_name:', response.data[0].type_name);
      console.log('  - name:', response.data[0].name);
      console.log('  - loc_type_id:', response.data[0].loc_type_id);
      
      setLocName(response.data[0].location_name);
      setLocID(response.data[0].location_id);
      setLocContactPerson(response.data[0].contact_person);
      setLocPhone(response.data[0].phone);
      setLocEmail(response.data[0].email);
      setLocBranchName(response.data[0].branch_name);
      setLocAddress(response.data[0].address);
      setLocBranchID(response.data[0].branch_id);
      
      // Set location type name - check multiple possible column names
      const typeName = response.data[0].location_type_name 
                    || response.data[0].loc_type_name 
                    || response.data[0].type_name 
                    || response.data[0].name
                    || '';
      
      console.log('✅ Selected typeName:', typeName);
      setLocTypeName(typeName);
      
      // Set location type ID - get from response or find by name
      let typeID = response.data[0].loc_type_id || '';
      
      console.log('🆔 loc_type_id from backend:', typeID);
      console.log('📋 locationTypeList:', locationTypeList);
      
      // If no ID from backend but we have a name, find the ID from locationTypeList
      if (!typeID && typeName && locationTypeList.length > 0) {
        console.log('⚠️ No ID from backend, searching by name...');
        const foundType = locationTypeList.find(lt => lt.name === typeName);
        if (foundType) {
          typeID = foundType.loc_type_id;
          console.log('✅ Found ID by name:', typeID);
        } else {
          console.log('❌ Could not find type by name');
        }
      }
      
      setLocTypeID(typeID);
      
      console.log('🎯 Final Location Type ID:', typeID);
      console.log('🎯 Final Location Type Name:', typeName);

    } catch (error) {
      console.error("Error fetching location details:", error);
    }
  }

  const updateLocation = async () => {
    // Validate location type ID exists in the list
    const locTypeIDInt = parseInt(locTypeID, 10);
    if (isNaN(locTypeIDInt)) {
      showAlertError({
        icon: "error",
        title: "Invalid Location Type!",
        text: 'Please select a valid location type.',
        button: 'OK'
      });
      return;
    }

    // Check if the location type exists in the list
    const locationTypeExists = locationTypeList.some(lt => parseInt(lt.loc_type_id, 10) === locTypeIDInt);
    if (!locationTypeExists) {
      showAlertError({
        icon: "error",
        title: "Location Type Not Found!",
        text: 'The selected location type is invalid. Please refresh the page and try again.',
        button: 'OK'
      });
      return;
    }

    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'location.php';
    const locationDetails = {
      locName: locName,
      contactPerson: locContactPerson,
      phone: locPhone,
      email: locEmail,
      address: locAddress,
      branchID: parseInt(locBranchID, 10), // Ensure it's an integer
      locID: parseInt(locID, 10), // Ensure it's an integer
      locTypeID: locTypeIDInt // Ensure it's an integer
    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(locationDetails),
          operation: "UpdateLocationDetails"
        }
      });

      if (response.data == 'Success') {
        GetLocation();
        close_modal();
        AlertSucces(
          "Location details is successfully updated!",
          "success",
          true,
          'Okay'
        );
      } else {
        // Check if it's a foreign key constraint error
        const errorMessage = response.data?.message || response.data || 'Unknown error';
        const errorStr = typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage);
        
        if (errorStr.includes('foreign key') || errorStr.includes('loc_type_id') || errorStr.includes('Integrity constraint')) {
          showAlertError({
            icon: "error",
            title: "Invalid Location Type!",
            text: 'The selected location type is invalid or does not exist in the database. Please select a valid location type from the dropdown.',
            button: 'OK'
          });
        } else {
          showAlertError({
            icon: "error",
            title: "Something Went Wrong!",
            text: errorStr || 'Failed to update location details!',
            button: 'Try Again'
          });
        }
        console.log('Error response:', response.data);
      }
    } catch (error) {
      console.error("Error updating location details:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update location';
      const errorStr = typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage);
      
      if (errorStr.includes('foreign key') || errorStr.includes('loc_type_id') || errorStr.includes('Integrity constraint')) {
        showAlertError({
          icon: "error",
          title: "Invalid Location Type!",
          text: 'The selected location type is invalid or does not exist in the database. Please select a valid location type from the dropdown.',
          button: 'OK'
        });
      } else {
        showAlertError({
          icon: "error",
          title: "Error",
          text: errorStr,
          button: 'OK'
        });
      }
    }
  }

  const triggerModal = (operation, id, e) => {
    switch (operation) {
      case 'addLocation':
        setAddLocationVisible(false);
        break;
      case 'viewLocation':
        GetLocationDetails(id);
        setViewLocationVisible(false);
        break;
      case 'editLocation':
        GetLocationDetails(id);
        setEditLocationVisible(false);
        break;
    }
  }

  return (
    <>
      <Modal show={show} onHide={handleClose} size='sm'>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Location Modal */}
      <Modal show={!addLocationVisible} onHide={close_modal} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Add Location</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-add-product-body'>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Location Name</label>
            <input
              className='prod-name-input'
              type='text'
              value={locName}
              onChange={(e) => setLocName(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Contact Person</label>
            <input
              className='prod-name-input'
              type='text'
              value={locContactPerson}
              onChange={(e) => setLocContactPerson(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Phone</label>
            <input
              className='prod-name-input'
              type='text'
              value={locPhone}
              onChange={(e) => setLocPhone(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Email</label>
            <input
              className='prod-name-input'
              type='email'
              value={locEmail}
              onChange={(e) => setLocEmail(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Location Address</label>
            <input
              className='prod-name-input'
              type='text'
              value={locAddress}
              onChange={(e) => setLocAddress(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Branch</label>
            <select className='category-dropdown' onChange={(e) => setLocBranchID(e.target.value)} value={locBranchID}>
              <option value="" disabled hidden>
                Select Branch
              </option>
              {branchList.map((branch) => (
                <option key={branch.branch_id} value={branch.branch_id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Location Type</label>
            <select className='category-dropdown' onChange={(e) => setLocTypeID(e.target.value)} value={locTypeID}>
              <option value="" disabled hidden>
                Select Location Type
              </option>
              {locationTypeList.map((locType) => (
                <option key={locType.loc_type_id} value={locType.loc_type_id}>
                  {locType.name}
                </option>
              ))}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close_modal}>
            Close
          </Button>
          <Button variant="primary" onClick={addLocation}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Location Modal */}
      <Modal show={!viewLocationVisible} onHide={close_modal} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Location Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-add-product-body'>
          <div className='div-input-add-prod' style={{ paddingBottom: '20px' }}>
            <label className='add-prod-label'>Location ID</label>
            <input className='prod-name-input' disabled={true} value={locID} />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Location Name</label>
            <input className='prod-name-input' value={locName} disabled={true} />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Contact Person</label>
            <input className='prod-name-input' value={locContactPerson} disabled={true} />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Phone</label>
            <input value={locPhone} className='prod-name-input' disabled={true} />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Email</label>
            <input className='prod-name-input' type='email' disabled={true} value={locEmail} />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Location Address</label>
            <input className='prod-name-input' disabled={true} value={locAddress} />
          </div>
          <div className='div-input-add-cat'>
            <label className='add-prod-label'>Branch Name</label>
            <select className='drop-role' disabled={true}>
              <option>{locBranchName}</option>
            </select>
          </div>
          <div className='div-input-add-cat'>
            <label className='add-prod-label'>Location Type</label>
            <select className='drop-role' disabled={true} value={locTypeName || ''}>
              <option value="">{locTypeName || 'Not Set'}</option>
            </select>
          </div>
        </Modal.Body>
      </Modal>

      {/* Edit Location Modal */}
      <Modal show={!editLocationVisible} onHide={close_modal} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Edit Location</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-add-product-body'>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Location Name</label>
            <input
              className='prod-name-input'
              type='text'
              value={locName}
              onChange={(e) => setLocName(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Contact Person</label>
            <input
              className='prod-name-input'
              type='text'
              value={locContactPerson}
              onChange={(e) => setLocContactPerson(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Phone</label>
            <input
              className='prod-name-input'
              type='text'
              value={locPhone}
              onChange={(e) => setLocPhone(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Email</label>
            <input
              className='prod-name-input'
              type='email'
              value={locEmail}
              onChange={(e) => setLocEmail(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Location Address</label>
            <input
              className='prod-name-input'
              type='text'
              value={locAddress}
              onChange={(e) => setLocAddress(e.target.value)}
            />
          </div>
          <div className='div-input-add-cat'>
            <label className='add-prod-label'>Branch Name</label>
            <select className='drop-role' value={locBranchName} onChange={(e) => {
              const selectedBranchName = e.target.value;
              setLocBranchName(selectedBranchName);
              const branch = branchList.find(b => b.branch_name === selectedBranchName);
              setLocBranchID(branch.branch_id);
            }}>
              <option value="" disabled hidden>
                {locBranchName}
              </option>
              {branchList.map((branch) => (
                <option key={branch.branch_id} value={branch.branch_name}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>
          <div className='div-input-add-cat'>
            <label className='add-prod-label'>Location Type</label>
            <select className='drop-role' value={locTypeID} onChange={(e) => {
              const selectedTypeID = e.target.value;
              setLocTypeID(selectedTypeID);
              const locType = locationTypeList.find(lt => lt.loc_type_id == selectedTypeID);
              if (locType) {
                setLocTypeName(locType.name);
              }
            }}>
              {!locTypeID && (
                <option value="" disabled>
                  Select Location Type
                </option>
              )}
              {locationTypeList.map((locType) => (
                <option key={locType.loc_type_id} value={locType.loc_type_id}>
                  {locType.name}
                </option>
              ))}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close_modal}>
            Close
          </Button>
          <Button variant="primary" onClick={updateLocation}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <div className='customer-main'>
        <div className='product-header'>
          <div className='head'>
            <h1 className='h-customer'>LOCATION MANAGEMENT</h1>
          </div>
          <div>
            <button 
              className='add-cust-bttn' 
              onClick={() => triggerModal('addLocation', '0')}
            >
              ADD LOCATION+
            </button>
          </div>
        </div>

        {/* Location Filters */}
        <div style={{
          padding: '15px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          margin: '10px 0',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            alignItems: 'end'
          }}>
            {/* Branch Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                Filter by Branch
              </label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Branches</option>
                {branchList.map((branch) => (
                  <option key={branch.branch_id} value={branch.branch_id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                Search Locations
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                  color: '#6c757d'
                }}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>

                <input
                  type="text"
                  placeholder="Search by name, address, or contact..."
                  value={locationSearchFilter}
                  onChange={(e) => setLocationSearchFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 35px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />

                {locationSearchFilter && (
                  <button
                    type="button"
                    onClick={() => setLocationSearchFilter('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#6c757d',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Clear search"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Locations Cards */}
        <div style={{
          padding: '20px 0',
          minHeight: '40vh'
        }}>
          {currentLocationItems && currentLocationItems.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: '20px',
              padding: '0 10px'
            }}>
              {currentLocationItems.map((location, index) => (
                <div
                  key={index}
                  onClick={() => triggerModal('viewLocation', location.location_id)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e9ecef',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Location Header */}
                  <div style={{
                    height: '120px',
                    background: 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    color: 'white'
                  }}>
                    <div style={{
                      fontSize: '48px',
                      opacity: 0.8
                    }}>
                      📍
                    </div>

                    {/* Branch Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: '15px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#495057',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      {location.branch_name}
                    </div>

                    {/* Edit Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerModal('editLocation', location.location_id, e);
                      }}
                      style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '16px',
                        transition: 'all 0.2s ease',
                        color: '#495057'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#007bff';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.color = '#495057';
                      }}
                      title="Edit Location"
                    >
                      ✏️
                    </button>
                  </div>

                  {/* Location Information */}
                  <div style={{ padding: '25px' }}>
                    <h3 style={{
                      margin: '0 0 15px 0',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#212529',
                      lineHeight: '1.3'
                    }}>
                      {location.location_name}
                    </h3>

                    <p style={{
                      margin: '0 0 20px 0',
                      fontSize: '15px',
                      color: '#6c757d',
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {location.address}
                    </p>

                    {/* Contact Information */}
                    <div style={{
                      marginBottom: '20px',
                      padding: '15px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '10px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '16px' }}>👤</span>
                          <span style={{
                            fontSize: '14px',
                            color: '#495057',
                            fontWeight: '500'
                          }}>
                            {location.contact_person}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '16px' }}>📞</span>
                          <span style={{
                            fontSize: '14px',
                            color: '#495057'
                          }}>
                            {location.phone}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '16px' }}>📧</span>
                          <span style={{
                            fontSize: '14px',
                            color: '#495057'
                          }}>
                            {location.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location Stats */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '15px',
                      borderTop: '1px solid #e9ecef'
                    }}>
                      <div style={{
                        fontSize: '12px',
                        color: '#adb5bd',
                        fontStyle: 'italic'
                      }}>
                        Location ID: {location.location_id}
                      </div>

                      <div style={{
                        fontSize: '12px',
                        color: '#adb5bd',
                        fontStyle: 'italic'
                      }}>
                        Click to view details
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              color: '#6c757d',
              padding: '60px 20px',
              minHeight: '400px'
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '24px',
                opacity: 0.3
              }}>
                📍
              </div>
              <h3 style={{
                color: '#495057',
                marginBottom: '12px',
                fontWeight: '600',
                fontSize: '24px'
              }}>
                {locationList.length === 0 ? 'No locations available' : 'No locations match the current filters'}
              </h3>
              <p style={{
                margin: '0 0 20px 0',
                fontSize: '16px',
                maxWidth: '400px',
                lineHeight: '1.5',
                color: '#6c757d'
              }}>
                {locationList.length === 0
                  ? 'Start by adding your first location using the "ADD LOCATION+" button above.'
                  : 'Try adjusting your search terms or filters to see more locations.'
                }
              </p>
              {locationList.length === 0 && (
                <button
                  onClick={() => triggerModal('addLocation', '0')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0056b3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#007bff';
                  }}
                >
                  Add Your First Location
                </button>
              )}
            </div>
          )}
        </div>

        {/* Location Pagination */}
        {totalPagesLocations > 1 && currentLocationItems && currentLocationItems.length > 0 && (
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px'
          }}>
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPagesLocations}
              onPageChange={handlePageChange}
              color="blue"
            />
          </div>
        )}
      </div>
    </>
  )
}

export default Location;