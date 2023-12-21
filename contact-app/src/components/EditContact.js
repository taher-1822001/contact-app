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

const EditContact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category_id: '',
    image:'',
    // created_by:Cookies.get('email')
  });
console.log("created by: ", formData.created_by);
  const [image, setImage] = useState(null); // State for image source
  const [imgFile, setImgFile] = useState(null); // State for image file
  const [id, setId] = useState(Cookies.get('id'));
  const [created_by, setCreatedBy] = useState(Cookies.get('email'));
  const [setLoading, setSetLoading] = useState(false);
  const [route, setRoute] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
  
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });
      setImage(file); // Set the image preview
    } else {
      // If no file is selected, keep the existing image
      if (!formData.image || typeof(formData.image) === 'string') {
        // If the existing image is a URL (string), keep it
        setFormData({
          ...formData,
          image: formData.image,
        });
      } else {
        // If the existing image is not a URL, reset to empty string
        setFormData({
          ...formData,
          image: '',
        });
        setImage(''); // Reset image preview
      }
    }
  };
  
  const ContactFormHandler = async (e) => {
    e.preventDefault();
    try {
      setSetLoading(true);
      const formData1 = new FormData();
  
      formData1.append('name', formData.name);
      formData1.append('email', formData.email);
      formData1.append('phone', formData.phone);
      formData1.append('category_id', formData.category_id);
  
      if (formData.image) {
        formData1.append('image', formData.image); // Use updated image if there's a change
      } else {
        // If no new image selected, use the image data from the database
        // Assuming the existing image data is stored in formData.image
        formData1.append('image', image);
      }
  
      formData1.append('user_id', id);
      formData1.append('created_by', created_by);
  
      let url = `${BASE_URL}/contacts/${params.id}`;
      const response = await axios.put(url, formData1);
      
      console.log('Update successful:', response.data);
      toast.success('Update successful');
      setRoute(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        category_id: '',
        image: ''
      });
      setImage('');
    } catch (error) {
      console.error('Contact creation failure:', error);
      toast.error('Contact update failure');
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
      getContactData(params.id);
    }
 
  }, [params.id]); // Empty dependency array ensures it runs only once on mount

  useEffect(() => {
    // ...
  
    return () => {
      // Cleanup object URL to avoid memory leaks
      URL.revokeObjectURL(image);
    };
  }, []);
  const getContactData = (id) => {
    let url = `${BASE_URL}/contacts/${id}`;
    axios.get(url)
      .then(response => {
        let data = response.data.data;
        
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          category_id: data.category_id,
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
  return (
    <>
    {console.log("image path", formData.image)}
      <ToastContainer />
      {route && <Navigate to='/home' />}
      {setLoading && <LoadingSpinner />}
      {/* Assuming formData.toLogin and formData.setLoading are defined */}
      {formData.toLogin && <Navigate to="/" />}
      {formData.setLoading && <LoadingSpinner />}
      {console.log(Cookies.get('email'))}
      <Header />
      <ToggleBar />

      <div className="container align-items-center">
        <h2 className="text-center mt-3">Edit Contact</h2>
        <hr />
        <form onSubmit={ContactFormHandler}>
          <center>
            {/* Image upload */}
            <input type="file" onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} id="fileInput" />
            <div style={{ width: '200px', height: '200px', borderRadius: '50%', cursor: 'pointer', border: '5px solid yellow' }}>
  <img
    src={
      (formData.image === '' || formData.image === null || formData.image === "null") ? userImage :
      (typeof(formData.image) === 'string') ? formData.image : URL.createObjectURL(formData.image)
    }
    alt="Preview"
    style={{ width: '100%', height: 'auto', borderRadius: '50%', overflow: "auto" }}
    onClick={handleClickImage}
  />
</div>
          </center>

          {/* Name field */}
          <div className="form-group row justify-content-center">
            <div className="col-md-4">
              <label htmlFor="Name">Name<span className="text-danger">*</span></label>
              <input type="text" className="form-control" id="Name" aria-describedby="emailHelp" placeholder="Enter Name" value={formData.name} required name="name" onChange={handleChange} />
            </div>
          </div>

          {/* Email field */}
          <div className="form-group row justify-content-center">
            <div className="col-md-4">
              <label htmlFor="exampleInputEmail1">Email address</label>
              <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" value={formData.email} name="email" onChange={handleChange} />
              <small id="emailHelp" className="form-text text-muted">We'll never share your contact's email with anyone else.</small>
            </div>
          </div>

          {/* Phone field */}
          <div className="form-group row justify-content-center">
            <div className="col-md-4">
              <label htmlFor="InputPhone">Phone<span className="text-danger">*</span></label>
              <input type="number" className="form-control" id="InputPhone" aria-describedby="emailHelp" placeholder="Enter phone number" required value={formData.phone} name="phone" onChange={handleChange} />
              <small id="emailHelp" className="form-text text-muted">We'll never share your contact's phone number with anyone else.</small>
            </div>
          </div>

          {/* Category selection */}
          <div className="form-group row justify-content-center">
            <div className="col-md-4">
              <label htmlFor="inputGroupSelect">Category<span className="text-danger">*</span></label>
              <select
            className="custom-select w-100 rounded p-2"
            id="inputGroupSelect"
            style={{ border: '1px solid gray', background: 'none' }}
            value={formData.category_id} // Bind value to formData.category_id
            name="category_id"
            onChange={handleCategoryChange} // Call handleCategoryChange on change
          >
            {/* Add a default option with an empty value */}
            <option value="">Choose...</option>
            {categoryData.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
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

        <div style={{ height: '150px' }} id="border_div"></div>
      </div>
      <Footer />
    </>
  );
};

export default EditContact;
