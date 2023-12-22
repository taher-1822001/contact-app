import React from 'react';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header';
import ToggleBar from './ToggleBar/ToggleBar';
import Footer from './Footer';
import Contact from './Contact';
import AddContact from './AddContact';
import axios from 'axios';
import { Navigate } from 'react-router-dom'; 
import BASE_URL from './config';
class HomePage extends React.Component{
    constructor(props)
    {
        super(props)
        this.state = {
            id: props.id,
            NotificationMessage:Cookies.get('message'),
            NotificationStatus:Cookies.get('notificationStatus'),
            contactList:[],
            userEmail:Cookies.get('email'),
            userId:Cookies.get('id'),
           toLogin:false
        }
        Cookies.set('page', 'home')
    }
    getContacts = () =>{
     let url = `${BASE_URL}/contacts/getcontactbyuserid/${Cookies.get('id')}`;
      axios.get(url)
      .then(response =>
        {

          this.setState({contactList:response.data.data})
          console.log("contacts", response.data.data)
        })
        .catch(error =>{
          console.log("error", error)
        })
    }
  //   handleLoginCheck(){
  //     const {userEmail, userImage, userId} = this.state;
  //     if((userEmail!==undefined || userEmail!=='') && (userImage!==undefined || userImage !=='') && (userId!==undefined || userId!==''))
  //     {
  //         this.setState({toHome:true})
  //     }
  // }
    componentDidMount(){
      this.getContacts();
      this.handleLoginCheck();
    }
    render(){
        return(
        <>
        {this.state.toLogin && <Navigate to='/' />}
        {this.state.NotificationStatus && (
          <>
            <ToastContainer />
          </>
        )}

       <Header />
        <ToggleBar />

         
       <Contact contactList={this.state.contactList} />
       
 
       <div style={{height:"150px"}} id="border_div"></div>
        <Footer />
      </>
        )
    }
}

export default HomePage;