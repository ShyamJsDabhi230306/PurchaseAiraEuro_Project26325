import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import Sidebar from './Sidebar';
import DivisionTabs from './Division/DivisionTabs';
import ItemMasterTabs from './ItemMaster/ItemMasterTabs';
import PartyAccountTabs from './PartyAccout/PartyAccountTabs';
import CompanyMasterTabs from './Company/CompanyMasterTabs';
import UsersTabs from './User/UsersTabs';
import LocationsTabs from './Location/LocationsTabs';
import DepartmentTabs from './Department/DepartmentTabs';
import UserRightsTabs from './UserRights/UserRightsTabs';
import ContractorTabs from './Contractor/ContractorTabs';
import OutWardTabs from './OutWard/OutWardTabs';
import InwardTabs from './InWard/InwardTabs';
import SecondInWardTabs from './SecondInWard/SecondInWardTabs';
import OperatorTabs from './Operator/OperatorTabs';
import InwardOutwardReport from './InwardOutwardReport/InwardOutwardReport';

// const CreateAccount = () => <h2>Create Party Account</h2>;
// const AccountRecords = () => <h2>Party Account Records</h2>;

const Dashboard = () => {
    return (
        <>
            <NavigationBar />
            <div className="d-flex" style={{ height: 'calc(100vh - 56px)' }}>
                {/* Assuming NavigationBar height ~56px */}
                <Sidebar />
                <div className='  object-fit-fill'>


                </div>
                <div className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
                    <Routes>
                        <Route index element={<h4 className='text-secondary mx-2 px-3'>Welcome to Aira Euro Automation 
                            <div>
                                <img
                                    src="src/assets/Img/Product-Banner-2.webp"
                                    alt="Product Banner"
                                    className="img-fluid rounded mt-4"
                                />
                            </div>

                        </h4>} />
                        <Route path="companymaster/*" element={<CompanyMasterTabs />} />
                        <Route path="division/*" element={<DivisionTabs />} />
                        <Route path="itemmaster/*" element={<ItemMasterTabs />} />
                        <Route path="partyaccountmaster/*" element={<PartyAccountTabs />} />
                        <Route path="users/*" element={<UsersTabs />} />
                        <Route path="locationMaster/*" element={<LocationsTabs />} />
                        <Route path="departmentMaster/*" element={<DepartmentTabs />} />
                        <Route path="userrights/*" element={<UserRightsTabs />} />
                        <Route path="contractors/*" element={<ContractorTabs />} />
                        <Route path="outward/*" element={<OutWardTabs />} />
                        <Route path="inward/*" element={<InwardTabs />} />
                        <Route path="secondinward/*" element={<SecondInWardTabs />} />
                        <Route path="operator/*" element={<OperatorTabs />} />
                        <Route path="InwardOutwardReport/*" element={<InwardOutwardReport />} />

                        
                       
                        {/* <Route path="*" element={<h2>Page Not Found</h2>} /> */}
                    </Routes>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
