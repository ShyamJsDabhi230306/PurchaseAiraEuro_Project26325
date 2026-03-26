import React from "react";
import { Navbar,  NavDropdown, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const NavigationBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Optional: Clear any auth/session data
    // localStorage.clear();

    alert("Logged out!");
    navigate("/"); // Redirect to login page
  };

  const handleSelect = (eventKey) => {
    alert(`Selected: ${eventKey}`);
    // You can also navigate to a page based on selection
    // navigate(`/division/${eventKey}`);
  };
 
  return (
    <>
    
    <Navbar  variant="dark" expand="lg" className="p-4 bg-secondary  ">
      <Container fluid >
        <Navbar.Brand href="#" 
        
        >Aira Euro Automation Pvt. Ltd</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar" >
         <nav className="text-white  ms-auto mx-2">

            <NavDropdown title="Division" id="division-dropdown" onSelect={handleSelect} >
              <NavDropdown.Item eventKey="marketing">Marketing</NavDropdown.Item>
              <NavDropdown.Item eventKey="godown">Godown</NavDropdown.Item>
            </NavDropdown>  
         </nav>
          

          <nav className="mx-2">
            <Button variant="outline-light" onClick={handleLogout} >
               <i className="bi bi-box-arrow-right me-1"></i>  LOGOUT 
            </Button>
        </nav> 
          
        </Navbar.Collapse>
      </Container>
    </Navbar>
    
    </>
    
  );
};

export default NavigationBar;
