import React from 'react'
import userImage from './RegisterForm/addUser.png'
import Header from './Header';
import ToggleBar from './ToggleBar/ToggleBar';
import Footer from './Footer';
import { Link } from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from './LoadingSpinner/LoadingSpinner';
import { Navigate } from 'react-router-dom';
import BASE_URL from './config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

class AddContact extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: Cookies.get('id'),
      setLoading: false,
      image: userImage,
      imgf: '',
      categoryData: [],
      formData: {
        name: '',
        email: '',
        phone: '',
        category_id: '',
        path: '',
        created_by: Cookies.get('email'),
        userEmail: Cookies.get('email'),
        userId: Cookies.get('id'),
        toLogin: false,
        isDarkTheme:Cookies.get('darkTheme')==='false'
      }
    }
  }
  handleLoginCheck() {
    const { userEmail, userId } = this.state;
    if (userEmail === '' || userId === '') {
      this.setState({ toLogin: true });
    }
  }

  handleChange = (e) => {
    const { name, value } = e.target;

    // Update category and category_id based on the selected value
    if (name === 'category') {
      const selectedCategory = this.state.categoryData.find(category => category.name === value);
      if (selectedCategory) {
        this.setState(prevState => ({
          formData: {
            ...prevState.formData,
            category: value,
            category_id: selectedCategory.id // Set the category_id based on the selected category's id
          }
        }));
      }
    } else {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          [name]: value
        }
      }));
    }
  };


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
  handleClickImage = () => {
    // Trigger click on the file input when clicking on the image
    document.getElementById('fileInput').click();
  };


  changeHandler = (e) => {
    this.setState({ [e.target.name]: e.target.value, passwordError: false })
  }
  getCategories = () => {


    axios.get(`${BASE_URL}/contacts/category`)
      .then(response => {
        // Handle successful response here
        console.log('Data:', response.data.data);
        this.setState({ categoryData: response.data.data });
      })
      .catch(error => {
        // Handle error
        console.error('Error fetching data:', error);
      });
  }
  componentDidMount() {
    // Fetch categories when the component mounts
    this.getCategories();
    this.handleLoginCheck();
    this.toggleTheme();
  }
  ContactFormHandler = (e) => {
    e.preventDefault();
    this.setState({ setLoading: true });
  
    const { formData, image, imgf, id } = this.state;
    const formData1 = new FormData();
  
    formData1.append('name', formData.name);
    formData1.append('email', formData.email);
    formData1.append('phone', formData.phone);
    formData1.append('category_id', formData.category_id);
    formData1.append('user_id', id);
    formData1.append('created_by', formData.created_by);
  
    if (image && image !== userImage) {
      formData1.append('image', imgf);
    }
  
    axios.post(`${BASE_URL}/contacts/`, formData1)
      .then(response => {
        console.log('Contact Added:', response.data);
  
        this.setState({
          setLoading: false,
          formData: {
            name: '',
            email: '',
            phone: '',
            category_id: '',
            image:'',
          },
        });
  
        toast.success('Contact Added');
        this.delayedCall();
      })
      .catch(error => {
        console.error('Failed to add contact:', error);
  
        // toast.error('Failed To Add Contact');
        this.setState({ setLoading: false });
      });
  };

  toggleTheme = () => {
    if(this.state.isDarkTheme){
      document.body.style.backgroundColor = 'black';
      document.body.style.color = 'white';
  
      // Update input field color for light theme
      const inputs = document.getElementsByTagName('input');
      for (let i = 0; i < inputs.length; i++) {
        inputs[i].style.color = 'white';
      }
    }
    else{
      document.body.style.backgroundColor = 'white';
    document.body.style.color = 'black';

    // Update input field color for light theme
    const inputs = document.getElementsByTagName('input');
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].style.color = 'black';
    }
    }
  };
 handleRemoveImage = (e) => {
    e.preventDefault(); // Prevents form submission
  
    this.setState({formData:{image:''},image:userImage})
  };
  
  render() {
    const { image, categoryData, formData } = this.state

    return (
      <>
        <ToastContainer />
        {this.state.toLogin && <Navigate to='/' />}
        {this.state.setLoading &&
          <LoadingSpinner />

        }
        <Header />
        <ToggleBar />

        <div className='container align-items-center' >
          <h2 className="text-center">Add Contact</h2>
          <form onSubmit={this.ContactFormHandler}>
            <center>
              <div className='row justify-content-center'>
                <div className='col-md-4 '>
                  <hr />
                </div>
              </div>
              <input type="file" onChange={this.handleImageChange} accept="image/*" style={{ display: "none" }} id="fileInput" />

              <div style={{ width: '200px', height: '200px', borderRadius: '50%', cursor: "pointer", border: "5px solid yellow" }}>
                <img src={image} alt="Preview" style={{ width: '100%', height: 'auto', borderRadius: "50%", }} onClick={this.handleClickImage} onChange={this.changeHandler} />
              </div>
              <button onClick={this.handleRemoveImage} className="btn btn-danger mt-2">
    <FontAwesomeIcon icon={faTrashAlt} />
  </button>
            </center>
            <div className="form-group row justify-content-center">
              <div className='col-md-4 '>
                <label for="Name">Name<span className='text-danger'>*</span></label>
                <input type="text" className="form-control" id="Name" aria-describedby="emailHelp" placeholder="Enter Name" value={formData.name} required name='name' onChange={this.handleChange} />

              </div>
            </div>
            <div className="form-group row justify-content-center">
              <div className='col-md-4'>
                <label for="exampleInputEmail1">Email address</label>
                <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" value={formData.email} name='email' onChange={this.handleChange} />
                <small id="emailHelp" className="form-text text-muted">We'll never share your contact's email with anyone else.</small>
              </div>
            </div>
            <div className="form-group row justify-content-center">
              <div className='col-md-4'>
                <label for="InputPhone">Phone<span className='text-danger'>*</span></label>
                <input type="number" className="form-control" id="InputPhone" aria-describedby="emailHelp" placeholder="Enter phone number" required value={formData.phone} name='phone' onChange={this.handleChange} />
                <small id="emailHelp" className="form-text text-muted">We'll never share your contact's phone number with anyone else.</small>
              </div>
            </div>
            <div className='form-group row justify-content-center'>
              <div className='col-md-4'>
                <label for="inputGroupSelect">Category<span className='text-danger'>*</span></label>
                <select className="custom-select w-100 rounded p-2" id="inputGroupSelect" style={{ border: "1px solid gray", background: "none" }} value={formData.category_id} name='category_id' onChange={this.handleChange}>
  <option value="">Choose...</option>
  {categoryData.map((category) => (
    <option key={category.id} value={category.id}>{category.name}</option>
  ))}
</select>
              </div>
            </div>

            <div className="form-group row justify-content-center">
              <div className="col-md-4">
                <button type="submit" className="btn btn-primary w-100 mt-2">Add</button>
                <hr />
              </div>
            </div>
          </form>
          <div className="container" >
            <div className='row justify-content-center'>
              <div className='col-lg-4'>
                <Link to="/home">
                  <button className="btn btn-outline-warning w-100 mt-2 mb-2">Back</button>
                </Link>

              </div>
            </div>
          </div>

          <div style={{ height: "150px" }} id="border_div"></div>
        </div>
        <Footer />
      </>

    )
  }
}

export default AddContact;