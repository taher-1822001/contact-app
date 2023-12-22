import React from 'react'
import './App.css'
import Header from './Header';
import Footer from './Footer';
import { Link, Navigate } from 'react-router-dom'; 
import ToggleBar from './ToggleBar/ToggleBar';
import  axios  from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';
import BASE_URL from './config';
class LoginForm extends React.Component
{
    
    constructor(props)
    {
        super(props);
        this.state = {
            passwordState:true,
            newUserState:true,
            title:"Login",
            loginFormState:true,
            showPasswordState:"",
            backButtonState:false,
            buttonText:"Login",
            passwordViewState:"password",
            email:'',
            password:'',
            id:'',
            route:false,
            pError:false,
            eError:false,
            userEmail:Cookies.get('email'),
            userImage:Cookies.get('userImage'),
            userId:Cookies.get('id'),
            toHome:false,
            usrId:''
        };
        Cookies.set('page', 'login');
       
    }
    // handleLoginCheck(){
    //     const {userEmail, userImage, userId} = this.state;
    //     if((userEmail!==undefined || userEmail!=='') && (userImage!==undefined || userImage !=='') && (userId!==undefined || userId!==''))
    //     {
    //         this.setState({toHome:true})
    //     }
    // }
    sendPasswordResetLink = async (e) => {
        e.preventDefault();
    
        // Retrieve the usrId using getId function
        const usrId = await this.getId();
        
        // Check if usrId is valid before proceeding
        if (usrId) {
            let pUrl = `https://contact-app-kappa-vert.vercel.app/passwordreset/${usrId}`;
            let formData = new FormData();
            formData.append('url', pUrl);
            formData.append('email', this.state.email);
            let url = `${BASE_URL}/users/pswdemail`;
        
            axios.post(url, formData)
                .then(response => {
                    toast.success('Password reset link sent to your email');
                })
                .catch(error => {
                    console.error('Error sending password reset link:', error);
                    toast.error('Failed to send password reset link');
                    
                });
        } else {
            console.error('Invalid usrId');
            toast.error('Failed to send password reset link');
        }
    };
    
    getId = async () => {
        try {
            let url = `${BASE_URL}/users/getid?email=${encodeURIComponent(this.state.email)}`;
            const response = await axios.get(url);
            this.setState({ usrId: response.data.id }); // Set usrId state with the retrieved user ID
            console.log("User ID:", response.data.id);
            return response.data.id; // Return the user ID
        } catch (error) {
            console.error("Error fetching user ID:", error);
            const emailError = error?.response?.data?.email
            console.log("email error",error.response.email)
            if(emailError){
                this.setState({eError:true});
            }
        }
    };
    
    LoginLinkFunction = () =>{
        if(this.state.passwordState===true && this.state.newUserState===true)
        {
            this.setState({passwordState: false, newUserState: false, title:"Forgot Password", backButtonState: true, buttonText: "Send Password Reset Link", });
        }
    }
    forgotPasswordStateFunction = () => {
        this.setState({loginFormState:false, newUserState:true})
    }
    newUserStateFunction = () =>{
        if(this.state.loginFormState===true)
        {
            this.setState({loginFormState:false});
        }
    }

    backStateFunction = () =>{
        this.setState({passwordState: true, newUserState: true, title:"Login", backButtonState: false, buttonText:"Login",});
    }

    passwordViewStateFunction = () =>{
        if(this.state.passwordViewState==="password")
        {
            this.setState({passwordViewState:"text"})
        }
        else{
            this.setState({passwordViewState:"password"})
        }
    }
    handleEmailChange = (e) =>{
        this.setState({[e.target.name]:e.target.value, eError:false})
    }
    handlePasswordChange = (e) =>{
        this.setState({[e.target.name]:e.target.value, pError:false})
    }
    login = (e) => {
        e.preventDefault(); // Prevents the default form submission behavior
    
        const { email, password } = this.state;
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
    
        axios.post(`${BASE_URL}/users/login`, formData)
          .then(response => {
            let id = response.data.id;
            let email = response.data.email;
            let userImage = response.data.image;
            Cookies.set('id', id);
            Cookies.set('email', email);
            Cookies.set('userImage', userImage);
            Cookies.set('notificationMessage', 'Login Success');
            Cookies.set('notificationStatus', 'true')
            this.setState({ route: true });
            toast.success('Login Success')
          })
          .catch(error => {
            // Handle login errors and show feedback to the user
            // For example, display a toast message using react-toastify
            // toast.error('Login failed. Please check your credentials.');
            const pswdError = error?.response?.data?.password;
            const emailError = error?.response?.data?.email;
   
            if(pswdError)
            {
                this.setState({pError:true})
            }
            if(emailError)
            {
                this.setState({eError:true})
            }
            toast.error('login failed')
          });
      };
      componentDidMount(){
        this.handleLoginCheck();
      }
    render(){
       
            return(
                <>
                <Header />
                <ToggleBar />
                <ToastContainer />
              {this.state.route && <Navigate to='/home' />}
              {this.state.toHome && <Navigate to='/home' />}
              {console.log("userEmail ",this.state.userEmail, "userImage ",this.state.userImage, "userId ",this.state.userId)}
            <div className='container align-items-center mt-5 login'>
            <h2 className="text-center">{this.state.title}</h2>
          
                <form onSubmit={this.state.passwordState ? this.login : this.sendPasswordResetLink}>
                <div className="form-group row justify-content-center">
                    <div className='col-md-4 '>
                    <hr className='mt-2 mb-2'/>
                    <label for="Email">Email<span className='text-danger'>*</span></label>
                    <input type="email" className="form-control border-2" id="Email" aria-describedby="emailHelp" placeholder="Enter Email" name='email' onChange={this.handleEmailChange}/>
                    {this.state.eError && <small className='text-danger'>Email not found</small>}
                    </div>
                </div>

               {this.state.passwordState ===true && 
                 <div className="form-group row justify-content-center">
                 <div className='col-md-4'>
                 <label for="pswd">Password<span className='text-danger'>*</span></label>
                 <input type={this.state.passwordViewState} data-toggle="password" className="form-control border" id="pswd" aria-describedby="emailHelp" placeholder="Enter Password" name='password' onChange={this.handlePasswordChange}/>
                 {this.state.pError && <small className='text-danger' style={{display:'block'}}>Incorrect Password</small>}
                 <span><input type='checkbox' value='Show Password'className='border-primary pt-2'onClick={this.passwordViewStateFunction} style={{cursor:"pointer"}}/><label><small> Show Password</small></label></span>
                 {/* <input type='checkbox' className='form-control w-0' style={{float:"left"}} value="show password" /> */}
                 <small id="Register" className="form-text text-primary mb-2" style={{float:"right", textDecoration:"underline", cursor:"pointer"}}><a  onClick={this.LoginLinkFunction}>Forgot password?</a></small>
 
                 </div>
             </div>
               }
               
                
                <div className="form-group row justify-content-center mb-2">
                    <div className="col-md-4">
                    <button type="submit" className="btn btn-warning w-100 mt-2 mb-2">{this.state.buttonText}</button>
                    <hr className='mt-2 mb-2'/>
                    </div>
                </div> 

                {this.state.backButtonState === true &&
                    <div className="form-group row justify-content-center mb-2">
                        <div className="col-md-4">
                            <button type="submit" className="btn btn-outline-warning w-100 mt-2 mb-2" onClick={this.backStateFunction}>Back</button>
                            
                            </div>
                    </div> 
                
                }
    
                {/* <div className='form-group row justify-content-center mt-1'>
                    <div className='col-md-4 align-items-center'>
                      
                    </div>
                </div> */}
    
            </form>
           { this.state.newUserState ===true && 
             <center>
             <small id="Register" className="form-text " >New user? <span className='text-primary text-bold pe-auto text-decoration-underline'  style={{cursor:"pointer"}} ><Link to="/register">Click Here</Link></span> to register</small>
             </center>
           }
            </div>
            <Footer />
            </>
            );
        
       
    }
}

export default LoginForm;