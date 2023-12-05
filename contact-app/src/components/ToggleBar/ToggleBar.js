import React from 'react';
import darkMode from './darkMode.png';
import lightMode from './lightMode.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faUserEdit, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'; // Import the necessary FontAwesome icons
import Cookies from 'js-cookie';
import Dropdown from 'react-bootstrap/Dropdown';
import userImage from '../RegisterForm/user.png';
import {Link, Navigate } from 'react-router-dom'; 
import { ToastContainer, toast } from 'react-toastify';
class ToggleBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDarkTheme: Cookies.get('darkTheme'),
      page: Cookies.get('page'),
      userImage: Cookies.get('userImage'),
      toLogin: false
    };
    // Cookies.set('darkTheme', false);
  }
  toggleTheme = () => {
    const newTheme = !this.state.isDarkTheme; // Toggle the theme
    this.setState({ isDarkTheme: newTheme });

    // Set the cookie to store the theme preference
    Cookies.set('darkTheme', newTheme);

    // Set body background and text color based on the theme
    if (newTheme) {
      document.body.style.backgroundColor = 'black';
      document.body.style.color = 'white';
    } else {
      document.body.style.backgroundColor = 'white';
      document.body.style.color = 'black';
    }
  };


  LogoutConfirmation = () =>{
    toast.warn(
      <div>
        <p>Are you sure you want to logout?</p>
        <button
          className='btn btn-outline-warning m-1'
          style={{ float: 'right' }}
          onClick={() => toast.dismiss()} // Dismiss the toast on "No" button click
        >
          No
        </button>
        <button
          className='btn btn-warning m-1'
          style={{ float: 'right' }}
          onClick={this.handleLogout} 
        >
          Yes
        </button>
      </div>,
      {
        position: toast.POSITION.TOP_CENTER,
        autoClose: false,
        closeButton: false,
      }
    );
  }
  handleLogout = () => {
    Cookies.set('id','');
    Cookies.set('email','');
    Cookies.set('userImage','');
    this.setState({toLogin:true, userImage:null});
    toast.dismiss();
  }
  render() {
    return (
      <>
      <ToastContainer />
      {this.state.toLogin && <Navigate to='/' />}
      <div className='w-100 bg-warning bg-gradient'>
        <div className="toggle-bar container-fluid">
          <div className='row'>
            <div className='col-12 d-flex justify-content-end align-items-center'>
              <button onClick={this.toggleTheme} className='btn btn-light m-1 p-1' title='Theme'>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={this.state.isDarkTheme ? lightMode : darkMode} alt="theme" style={{ width: "27px", height: "27px" }} />
                </div>
              </button>

              <Link to='/info'>

              <button onClick={this.toggleTheme} className='btn btn-info m-1' title='Theme'>
                <i className="fas fa-info-circle"></i>
              </button>
              </Link>
              {console.log("userImage", this.state.userImage)}
              {this.state.page === 'home' && (
                <Dropdown align="end">
                  <Dropdown.Toggle style={{ backgroundColor: 'transparent', border: 'none' }} id="dropdown-basic">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border:"2px solid gray", borderRadius:"50%" }}>
                      <img src={this.state.userImage==='null'?userImage:this.state.userImage} alt="user" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
                    </div>
                  </Dropdown.Toggle>

                  <style>
                    {`.dropdown-toggle::after { display: none !important; }`}
                  </style>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => console.log('Edit Profile clicked')}>
                      <FontAwesomeIcon icon={faUserEdit} /> &nbsp; Edit Profile
                    </Dropdown.Item>
                    <Dropdown.Item onClick={this.LogoutConfirmation}>
                      <FontAwesomeIcon icon={faSignOutAlt} /> &nbsp; Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }
}

export default ToggleBar;
