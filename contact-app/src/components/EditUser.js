import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom'; // Assuming you're using React Router
import Header from './Header';
import ToggleBar from './ToggleBar/ToggleBar';
import Footer from './Footer';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner/LoadingSpinner';
import Cookies from 'js-cookie'
import userImage from './RegisterForm/addUser.png'
import { useParams } from 'react-router-dom';
import BASE_URL from './config';
// Assuming you have other necessary components imported as well

const EditUser = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    image: '',
    yes:''
    // created_by:Cookies.get('email')
  });
  const [image, setImage] = useState(null); // State for image source
  const [imgFile, setImgFile] = useState(null); // State for image file
  const [id, setId] = useState(Cookies.get('id'));
  const [created_by, setCreatedBy] = useState(Cookies.get('email'));
  const [setLoading, setSetLoading] = useState(false);
  const [route, setRoute] = useState(false);
  const [route1, setRoute1] = useState(false);
  const [show, setShow] = useState("password");
  // const [yes, setYes] = useState('');
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Create a URL for the selected image file
      // const imageUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        image: file // Set the image URL directly to formData.image
      });
      setImage(file); // Set the image preview
    } else {
      setFormData({
        ...formData,
        image: '' // Reset image if no file selected
      });
      setImage(''); // Reset image preview
    }
  };

  // const handleYesChange = (e) => {
  //   setYes(e.target.value);
  // };

  const ContactFormHandler = async (e) => {
    e.preventDefault();
    try {
      setSetLoading(true);
      const formData1 = new FormData();

      formData1.append('first_name', formData.firstName);
      formData1.append('last_name', formData.lastName);
      formData1.append('email', formData.email);
      formData1.append('phone', formData.phone);
      formData1.append('password', formData.password);

      if (formData.image) {
        formData1.append('image', formData.image); // Use updated image if there's a change
      } else {
        // If no new image selected, use the image data from the database
        // Assuming the existing image data is stored in formData.image
        formData1.append('image', image);
      }

      formData1.append('created_by', created_by);

      let url = `${BASE_URL}/users/${params.id}`;
      const response = await axios.put(url, formData1);

      console.log('Update successful:', response.data);
      toast.success('Update successful');
      setRoute(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        image: ''
      });
      setImage('');
    } catch (error) {
      console.error('user update failure:', error);
      toast.error('user update failure');
      // Handle error (e.g., show error message)
    } finally {
      // Set loading state to false
      setSetLoading(false);
    }
  };

  const handleClickImage = () => {
    document.getElementById('fileInput').click();
  };

  // Assuming you have categoryData defined as an array
  // Initialize or get the category data array
  const [categoryData, setCategoryData] = useState([]);

  // Function to fetch categories
  const getCategories = () => {
    axios.get(`${BASE_URL}/contacts/category`)
      .then(response => {
        // Handle successful response here
        console.log('Data:', response.data.data);
        setCategoryData(response.data.data);
      })
      .catch(error => {
        // Handle error
        console.error('Error fetching data:', error);
      });
  };

  // Fetch categories on component mount
  const params = useParams();
  useEffect(() => {
    getCategories();
    console.log("use params", params)
    if (params.id) {
      getUserData(params.id);
    }

  }, [params.id]); // Empty dependency array ensures it runs only once on mount

  useEffect(() => {
    // ...

    return () => {
      // Cleanup object URL to avoid memory leaks
      URL.revokeObjectURL(image);
    };
  }, []);
  const getUserData = (id) => {
    let url = `${BASE_URL}/users/${id}`;
    axios.get(url)
      .then(response => {
        let data = response.data.data;

        setFormData({
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          image: data.image // Create object URL for the blob data
        });
        setImage(data.image); // Set image state with the object URL
      })
      .catch(error => {
        console.error('Error fetching contact data:', error);
      });
  };

  const handleCategoryChange = (e) => {
    setFormData({
      ...formData,
      category_id: e.target.value // Update category_id in the state
    });
  };
  const passwordViewStateFunction = () => {
    if (show === "password") {
      setShow("text")
    }
    else {
      setShow("password")
    }
  }
  const deleteNotification = () => {
    toast.warn(
      <div>
        <p>Are you sure you want to delete your account?</p>
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
          onClick={handleDelete}
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
  const handleDelete = () => {
    let deleteConfirmation = null; // Define a local variable to store the input value
  
    toast.warn(
      <div>
        <p>Enter "yes" to delete</p>
        <form>
          <input
            type="text"
            className="form-control m-1"
            id="yes"
            aria-describedby="emailHelp"
            placeholder="Enter yes"
            // Use the local variable for value instead of formData.yes
            value={deleteConfirmation}
    
            name="yes"
            onChange={(e) => {
              deleteConfirmation= e.target.value; // Update the local variable
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
          onClick={() => handleDeleteConfirmation(deleteConfirmation)} // Pass the local variable to handleDeleteConfirmation
        >
          Delete
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
  
  const handleDeleteConfirmation = (confirmation) => {
    if (confirmation.toLowerCase() === 'yes') {
      const url = `${BASE_URL}/users/${params.id}`
      axios.delete(url)
      .then(response =>{
        toast.success('Account deleted successfully');
        Cookies.set('email','');
        Cookies.set('userImage','');
        Cookies.set('id','');
        setRoute1(true)

      })
    } else {
      toast.error(`Invalid input: ${confirmation}`);
    }
  };
  return (
    <>
      {console.log("image path", formData.image)}
      <ToastContainer />
      {route && <Navigate to='/home' />}
      {route1 && <Navigate to='/' />}
      {setLoading && <LoadingSpinner />}
      {/* Assuming formData.toLogin and formData.setLoading are defined */}
      {formData.toLogin && <Navigate to="/" />}
      {formData.setLoading && <LoadingSpinner />}
      {console.log(Cookies.get('email'))}
      <Header />
      <ToggleBar />

      <div className="container align-items-center">
        <h2 className="text-center">Edit Profile</h2>
        <hr />
        <form onSubmit={ContactFormHandler}>
          <center>
            {/* Image upload */}
            <input type="file" onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} id="fileInput" />
            <div style={{ width: '200px', height: '200px', borderRadius: '50%', cursor: 'pointer', border: '5px solid yellow' }}>
              <img src={typeof (formData.image) == 'string' ? formData.image : formData.image === '' || formData.image === null ? userImage : URL.createObjectURL(formData.image)} alt="Preview" style={{ width: '100%', height: 'auto', borderRadius: '50%', overflow: "auto" }} onClick={handleClickImage} />
            </div>
          </center>

          {/* firstName field */}
          <div className="form-group row justify-content-center">
            <div className="col-md-4">
              <label htmlFor="firstName">First Name<span className="text-danger">*</span></label>
              <input type="text" className="form-control" id="firstName" aria-describedby="emailHelp" placeholder="Enter First Name" value={formData.firstName} required name="firstName" onChange={handleChange} />
            </div>
          </div>
          {/* lastName field */}
          <div className="form-group row justify-content-center">
            <div className="col-md-4">
              <label htmlFor="lastName">Last Name<span className="text-danger">*</span></label>
              <input type="text" className="form-control" id="lastName" aria-describedby="emailHelp" placeholder="Enter Last Name" value={formData.lastName} required name="lastName" onChange={handleChange} />
            </div>
          </div>

          {/* Email field */}
          <div className="form-group row justify-content-center">
            <div className="col-md-4">
              <label htmlFor="exampleInputEmail1">Email address</label>
              <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" value={formData.email} name="email" onChange={handleChange} />
            </div>
          </div>

          {/* Phone field */}
          <div className="form-group row justify-content-center">
            <div className="col-md-4">
              <label htmlFor="InputPhone">Phone<span className="text-danger">*</span></label>
              <input type="number" className="form-control" id="InputPhone" aria-describedby="emailHelp" placeholder="Enter phone number" required value={formData.phone} name="phone" onChange={handleChange} />
            </div>
          </div>

          {/* Password field */}
          <div className="form-group row justify-content-center">
            <div className="col-md-4">
              <label htmlFor="InputPassword">Password<span className="text-danger">*</span></label>
              <input type={show} className="form-control" id="InputPassword" aria-describedby="emailHelp" placeholder="Enter password" required value={formData.password} name="password" onChange={handleChange} />
              <span><input type='checkbox' value='Show Password' className='border-primary pt-2' onClick={passwordViewStateFunction} style={{ cursor: "pointer" }} /><label><small> Show Password</small></label></span>

            </div>
          </div>



          {/* Submit button */}
          <div className="form-group row justify-content-center">
            <div className="col-md-4">
              <button type="submit" className="btn btn-primary w-100 mt-2">Update</button>
            </div>
          </div>
        </form>

        {/* Back button */}
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-4">
              <Link to="/home">
                <button className="btn btn-outline-warning w-100 mt-2 mb-2">Back</button>
              </Link>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-4">

              <button className="btn btn-outline-danger w-100 mt-2 mb-2" onClick={deleteNotification}>Delete Account</button>

            </div>
          </div>
        </div>

        <div style={{ height: '150px' }} id="border_div"></div>
      </div>
      <Footer />
    </>
  );
};

export default EditUser;
