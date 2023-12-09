import React from 'react';
import 'cropperjs/dist/cropper.css';
import LoginForm from '../LoginForm';
import './addUser.png'
import userImage from './addUser.png';
import Header from '../Header';
import ToggleBar from '../ToggleBar/ToggleBar';
import Footer from '../Footer';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import Cookies from 'js-cookie';
import BASE_URL from '../config'
class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            LoginFormState: false,
            RegisterFormState: true,
            image: userImage,
            firstName:'',
            lastName:'',
            email:'',
            phone:'',
            password1:'',
            password2:'',
            profile:'',
            redirect:'',
            passwordError:false,
            emailError:false,
            setLoading:false,
            route:false,
            img_path:'',
            fname:'',
            imgf:'',
            pswdStatus:"password",
            id:'',
            otp:''
        };
        Cookies.set('page', 'register')
    }
// ... (other code remains the same)

uploadImageToDropbox = () => {
    const { imgf, email, fname } = this.state;

    const formData = new FormData();
    formData.append('file', imgf);
    formData.append('email', email);
    formData.append('name', fname); // Include the file name

    axios.post(`${BASE_URL}/users/image`, formData)
        .then(response => {
            this.setState({ img_path: response.data.path });
            this.delayedCall();
        })
        .catch(error => {
            console.log("Image upload error", error);
        });
}

handleImageChange = (e) => {
    const file = e.target.files[0];
    this.setState({ imgf: file });
    this.setState({ fname: file.name });
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            // Convert file to base64 string
            const base64String = reader.result;
            this.setState({ image: base64String });
        };
        reader.readAsDataURL(file);
    } else {
        this.setState({ image: userImage });
    }
};

// ... (rest of your code remains the same)

    handleClickImage = () => {
        // Trigger click on the file input when clicking on the image
        document.getElementById('fileInput').click();
    };
    

          changeHandler = (e) =>{
        this.setState({[e.target.name]: e.target.value, passwordError:false})
    }
    emailChangeHandler = (e) =>{
        this.setState({[e.target.name]:e.target.value, emailError:false})
    }
    passwordViewStateFunction = () =>{
        if(this.state.pswdStatus==="password")
        {
            this.setState({pswdStatus:"text"})
        }
        else{
            this.setState({pswdStatus:"password"})
        }
    }
    registerFormHandler = (e) =>{
        e.preventDefault();
        console.log(this.state)
        this.setState({setLoading:true})
        const { firstName, lastName, email, phone, password1, password2, image, imgf } = this.state;

  const formData = new FormData();
  formData.append('first_name', firstName);
  formData.append('last_name', lastName);
  formData.append('email', email);
  formData.append('phone', phone);
  formData.append('password1', password1);
  formData.append('password2', password2);

  if (image && image !== userImage) {
    // this.uploadImageToDropbox();
    // If an image is selected (and not the default userImage), include it in the formData
    formData.append('image', imgf);
  }
        axios.post(`${BASE_URL}/users/`, formData)
        .then(response => {
            
            console.log('Registration successful:', response.data);
            console.log("status", response.status)
            
            toast.success('OTP sent to your email');
            this.otpValidation();
            this.setState({
                setLoading: false,
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                password1: '',
                password2: '',
                image: userImage,
                passwordError: false,
                emailError: false,
                pswdStatus:"password",
                id:response.data.data.id,
                otp:response.data.data.otp
            
              });
            //   this.delayedCall();
            
        })
        .catch(error => {
            console.error('Error during registration:', error);
            toast.error("Registration unsuccessful");
            console.log("this is error",error.response)
            this.setState({setLoading:false})
            let pswdError = error?.response?.data?.password;
            let mailError = error?.response?.data?.email;
            if(pswdError)
            {
                this.setState({passwordError:true})
            }
            if(mailError)
            {
                this.setState({emailError:true})
            }
            // Handle error states or display an error message to the user
        })
        
    }

  otpValidation = () => {
    let otp = null; // Define a local variable to store the input value
  
    toast.warn(
      <div>
        <p>Enter Six digit OTP</p>
        <form>
          <input
            type="text"
            className="form-control m-1"
            id="yes"
            aria-describedby="emailHelp"
            placeholder="XXXXXX"
            // Use the local variable for value instead of formData.yes
            value={otp}
    
            name="yes"
            onChange={(e) => {
              otp= e.target.value; // Update the local variable
            }}
          />
        </form>
        <button
          className="btn btn-outline-warning m-1"
          style={{ float: 'right' }}
          onClick={() => toast.dismiss()}
        >
          Cancel
        </button>
        <button
          className="btn btn-warning m-1"
          style={{ float: 'right' }}
          onClick={() => this.otpVerification(otp)} // Pass the local variable to handleDeleteConfirmation
        >
          Submit
        </button>
      </div>,
      {
        position: toast.POSITION.TOP_CENTER,
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
      }
    );
  };
 otpVerification= (otp) => {
    if (otp === this.state.otp) {
      toast.dismiss();
      const url = `${BASE_URL}/users/register/${this.state.id}`
      let formData = new FormData();
      formData.append('active',true);
      axios.patch(url, formData)
      .then(response =>{
        toast.success('Registration Successful');
        this.delayedCall();

      })
    } else {
      toast.error(`Invalid OTP: ${otp}`);
    }
  };
    delayedCall = () => {
        // Simulating a function call after a delay
        setTimeout(() => {
          // Replace the below log with the function call or component rendering you want after the delay
          this.setState({route:true})
        }, 3000); // Delay time is specified in milliseconds (5 seconds in this case)
      };
    
    render() {
        const { image, RegisterFormState, firstName, lastName, email, phone, password1, password2 } = this.state;
     
       

        if (RegisterFormState) {
            return (
                <>
                {this.state.setLoading &&
               <LoadingSpinner />

                }
                {this.state.route &&
                <Navigate to="/" />
                }
                 <Header />
                 <ToggleBar />  
                 <ToastContainer />
                <div className='container align-items-center mt-5  register-form' >
                <h2 className="text-center">Registration Form</h2>
          
                <form onSubmit={this.registerFormHandler}>
                    <div className="form-group row justify-content-center">
                    <hr className='mt-2 mb-2'/>

                        <center>
                                    <input type="file" onChange={this.handleImageChange} accept="image/*" style={{ display: "none" }} id="fileInput"  />
                                   
                                    <div style={{ width: '200px', height: '200px', borderRadius: '50%',marginBottom:"45px", cursor:"pointer", border:"4px solid yellow" }}>
                                        <img src={image} alt="Preview" style={{ width: '100%', height: 'auto',borderRadius:"50%" }} onClick={this.handleClickImage} onChange={this.changeHandler} />
                                    </div>
                                </center>

                        <div className='col-lg-6'>
                        <label htmlFor="firstName">First Name<span className='text-danger'>*</span></label>
                        <input type="text" className="form-control" id="firstName" name="firstName" aria-describedby="fnHelp" placeholder="Enter First Name" required value={firstName} onChange={this.changeHandler} />
                        
    
                        </div>
                        <div className='col-lg-6'>
                        <label htmlFor="lastName">Last Name<span className='text-danger'>*</span></label>
                        <input type="text" className="form-control" id="lastName" name="lastName" aria-describedby="lnHelp" placeholder="Enter Last Name" required onChange={this.changeHandler} value={lastName}/>
                        
                        </div>
                        <div className='col-lg-6'>
                        <label htmlFor="email">Email<span className='text-danger'>*</span></label>
                        <input type="email" className="form-control" id="email" name="email" aria-describedby="emailHelp" placeholder="Enter Email" required onChange={this.emailChangeHandler} value={email}/>
                        {this.state.emailError && <small className='text-danger'>Email already exists</small>}
                        </div>
                        <div className='col-lg-6'>
                            
                        <label htmlFor="phone">Phone<span className='text-danger'>*</span></label>
                        <input type="number" className="form-control" id="phone" name="phone" aria-describedby="phHelp" placeholder="Enter Phone Number" required onChange={this.changeHandler} value={phone} />
                        
                        </div>
                        <div className='col-lg-6'>
                        <label htmlFor="password1">Password<span className='text-danger'>*</span></label>
                        <input type={this.state.pswdStatus} className="form-control" id="password1" aria-describedby="psHelp" name="password1" placeholder="Enter Password" required value={password1} onChange={this.changeHandler} />
                        
                        </div>
                        <div className='col-lg-6'>
                        <label htmlFor="password2">Repeat Password<span className='text-danger'>*</span></label>
                        <input type={this.state.pswdStatus} className="form-control" id="password2" name="password2" aria-describedby="psHelp" placeholder="Enter Password Again" required value={password2} onChange={this.changeHandler} />
                        {this.state.passwordError && <small className='text-danger' style={{display:'block'}}>Password don't match</small>}
                        <span><input type='checkbox' value='Show Password'className='border-primary pt-2'onClick={this.passwordViewStateFunction} style={{cursor:"pointer"}}/><label><small> Show Password</small></label></span>
                        </div>
    
                        <div className='col-lg-6 mt-3 mb-2'>
                        <button type="submit" className="btn btn-warning w-100 mt-2 mb-2" >Register</button>
                        </div>
                        
                        <hr />
                    </div>
                    </form>
              
                    <div className="container" >
                        <div className='row justify-content-center'>
                            <div className='col-lg-6'>
                           <Link to="/"> <button className="btn btn-outline-warning w-100 mt-2 mb-2" >Back</button></Link>
                            {/* onClick={this.LoginFormSateFunction} */}
                   

                            </div>
                        </div>
                    </div>
               
                    </div>
                    <div style={{height:"150px"}} id="border_div"></div>
                    <Footer />
                </>
            );
        } else {
            return (
                <LoginForm />
            );
        }
    }
}

export default RegisterForm;