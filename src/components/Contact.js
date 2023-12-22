import React from 'react';
import userImage from './RegisterForm/userImage.png';
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSort, faDownload, faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { faSortAlphaDown, faSortAlphaUp, faCalendar } from '@fortawesome/free-solid-svg-icons';
import Dropdown from 'react-bootstrap/Dropdown';
import BASE_URL from './config';
class Contact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contacts: [],
            categoryNames: {},
            selectedIDs: [],
            excelData: [],
            delete: false
        }
    }
    getCategory = (category_id) => {
        let url = `${BASE_URL}/contacts/category/${category_id}`;
        axios(url)
            .then(response => {
                const categoryNames = { ...this.state.categoryNames };
                categoryNames[category_id] = response.data.data.name;
                this.setState({ categoryNames });
            })
            .catch(error => {
                console.error('Error fetching category:', error);
            });
    }

    handleDelete = (contactId) => {
        toast.warn(
            <div>
                <p>Are you sure you want to delete this contact?</p>
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
                    onClick={() => this.deleteContact(contactId)} // Trigger delete function on "Yes" button click
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
    };

    deleteContact = (contactId) => {
        let url = `${BASE_URL}/contacts/${contactId}`;
        axios.delete(url)
            .then(response => {
                const updatedContactList = this.state.contacts.filter(contact => contact.id !== contactId);
                this.setState({ contacts: updatedContactList, delete: false });
                toast.dismiss();
                toast.success('Contact Deleted Successfully');
            })
            .catch(error => {
                toast.error('Failed to Delete Contact');
                console.error('Error deleting contact:', error);
            });
    };

    handleListDelete = (contactId) => {
        toast.warn(
            <div>
                <p>Are you sure you want to delete these contacts?</p>
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
                    onClick={() => this.deleteListContacts(contactId)} // Trigger delete function on "Yes" button click
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
    };

    deleteListContacts = async () => {
        try {
            const { selectedIDs, contacts } = this.state;

            // Array to store promises for each delete request
            const deletePromises = [];

            for (let i = 0; i < selectedIDs.length; i++) {
                const url = `${BASE_URL}/contacts/${selectedIDs[i]}`;
                deletePromises.push(axios.delete(url));
            }

            // Wait for all delete requests to resolve
            await Promise.all(deletePromises);

            // Filter out deleted contacts from the state's contacts array
            const updatedContacts = contacts.filter((contact) => !selectedIDs.includes(contact.id));

            // Update the state with the updated contacts array
            this.setState({
                contacts: updatedContacts,
                selectedIDs: [], // Clear selected IDs after deletion
            });

            // Dismiss the toast notification after deletion is successful
            toast.dismiss();
            toast.success('Deletion successful');
        } catch (error) {
            toast.error('Deletion failed');
            console.error('Error deleting contacts:', error);
        }
    };

    excelSheetDownload = async () => {
        const { selectedIDs } = this.state;

        try {
            const contactsData = await Promise.all(
                selectedIDs.map(async (contactId) => {
                    const url = `${BASE_URL}/contacts/${contactId}`;
                    const response = await axios.get(url);
                    return response.data.data;
                })
            );

            const workbook = XLSX.utils.book_new();
            const worksheetData = contactsData.map(({ name, email, phone }) => [name, email, phone]);

            // Create the worksheet
            const worksheet = XLSX.utils.aoa_to_sheet([['Name', 'Email', 'Phone'], ...worksheetData]);

            // Set column widths (adjust width as needed)
            worksheet['!cols'] = [
                { wch: 30 }, // Width for Name column
                { wch: 30 }, // Width for Email column
                { wch: 20 }, // Width for Phone column
            ];

            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const excelBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
            saveAs(excelBlob, 'contacts.xlsx');

            toast.success('Excel Sheet Generated Successfully');
            this.setState({ selectedIDs: [] })
        } catch (error) {
            toast.error('Failed to download Excel Sheet');
            console.error('Error downloading Excel:', error);
        }
    };

    componentDidMount() {

        // Fetch category names for each contact
        this.state.contacts.forEach(contact => {
            this.getCategory(contact.category_id);
        });
    }
    componentDidUpdate(prevProps) {
        if (prevProps.contactList !== this.props.contactList) {
            this.setState({ contacts: this.props.contactList });

            // Fetch category names for each contact in the updated list
            this.props.contactList.forEach(contact => {
                if (!this.state.categoryNames[contact.category_id]) {
                    this.getCategory(contact.category_id);
                }
            });
        }
    }
    handleCheckboxChange = (id) => {
        this.setState(prevState => {
            const selectedIDs = [...prevState.selectedIDs];
            const index = selectedIDs.indexOf(id);

            if (index === -1) {
                selectedIDs.push(id);
            } else {
                selectedIDs.splice(index, 1);
            }

            return { selectedIDs };
        });
    };
    handleSelectAll = () => {
        if (this.state.selectedIDs.length === this.state.contacts.length) {
            // All contacts are already selected, so deselect all
            this.setState({ selectedIDs: [] });
        } else {
            // Not all contacts are selected, so select all
            const allContactIDs = this.state.contacts.map(contact => contact.id);
            this.setState({ selectedIDs: allContactIDs });
        }
    };
    sortByNameAZ = () => {
        const sortedContacts = this.state.contacts.slice().sort((a, b) => a.name.localeCompare(b.name));
        this.setState({ contacts: sortedContacts });
    };

    // Sort contacts by name Z-A
    sortByNameZA = () => {
        const sortedContacts = this.state.contacts.slice().sort((a, b) => b.name.localeCompare(a.name));
        this.setState({ contacts: sortedContacts });
    };

    // Sort contacts by date created
    sortByDateCreated = () => {
        const sortedContacts = this.state.contacts.slice().sort((a, b) => new Date(a.created_on) - new Date(b.created_on));
        this.setState({ contacts: sortedContacts });
    };


    render() {

        console.log("this is contacts", this.state.contacts);
        return (
            <>

                {console.log("ids", this.state.selectedIDs)}
                <ToastContainer />
                <div className='container-fluid mt-2'>
                    <div className='row'>
                        <div className='col'>
                            <button className='btn btn-secondary m-1 select-all' onClick={this.handleSelectAll}>
                                <FontAwesomeIcon icon={faCheckSquare} />
                            </button>

                            <Dropdown className='d-inline-block' >
                                <Dropdown.Toggle variant="primary" id="dropdown-basic" >
                                    <FontAwesomeIcon icon={faSortAlphaDown} />
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={this.sortByNameAZ}>
                                        <FontAwesomeIcon icon={faSortAlphaDown} />
                                        &nbsp; A-Z
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={this.sortByNameZA}>
                                        <FontAwesomeIcon icon={faSortAlphaUp} />
                                        &nbsp; Z-A
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={this.sortByDateCreated}>
                                        <FontAwesomeIcon icon={faCalendar} />
                                        &nbsp; Date Created
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <button className='btn btn-warning m-1' onClick={this.excelSheetDownload}  disabled={this.state.selectedIDs.length < 2}> <FontAwesomeIcon icon={faDownload} /></button>

                        </div>
                        <div className='col justify-content-end' >
                            <button className='btn btn-danger m-1' style={{ float: "right" }}  disabled={this.state.selectedIDs.length < 2} onClick={() => this.handleListDelete()}>
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <Link to='/contact'> <button className='btn btn-success m-1 ' style={{ float: "right" }}><FontAwesomeIcon icon={faPlus} /></button></Link>
                        </div>
                    </div>
                </div>
                <hr />
                <div className='container-fluid '>
                    <div className='row'>
                        {this.state.contacts.map((contact) => (
                            <div className="col-lg-3 col-md-6" key={contact.id} >
                                <div className="card m-2 rounded" style={{ border: "1px solid yellow", background: "none" }}>
                                    <div className="card-body shadow">
                                        <div style={{ float: 'right' }}>
                                            <input type='checkbox' onChange={() => this.handleCheckboxChange(contact.id)}
                                                checked={this.state.selectedIDs.includes(contact.id)} />
                                        </div>
                                        <center>
                                            <div style={{
                                                width: "150px",
                                                height: "150px",
                                                border: "2px solid yellow",
                                                backgroundImage: `url(${contact.image===null || contact.image==='null' || contact.image===''?userImage: contact.image})`,
                                                borderRadius: "50%",
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                overflow: "hidden"
                                            }}>
                                                {/* Show a fallback image if contact.image is null */}
                                                {contact.image === null && (
                                                    <img
                                                        src={userImage}
                                                        alt="avatar"
                                                        className="rounded-circle img-fluid"
                                                        style={{ width: "100%", height: "auto", visibility: "hidden" }}
                                                    />
                                                )}
                                            </div>
                                        </center>
                                        <hr />
                                        <p><b>Name: </b>{contact.name}</p>
                                        <p><b>Phone: </b>{contact.phone}</p>
                                        <p><b>Email: </b>{contact.email}</p>
                                        <p><b>Category: </b>{this.state.categoryNames[contact.category_id]}</p>
                                        <div className='m-1' style={{ float: "right" }}>
                                            <Link to={`/contact/edit/${contact.id}`}>
                                                <button className='btn btn-primary m-1' >
                                                    <i className="fas fa-pencil-alt"></i>
                                                </button>
                                            </Link>
                                            <button className='btn btn-danger m-1 delete' onClick={() => this.handleDelete(contact.id)} disabled={this.state.selectedIDs.length > 0 ? true : false}><i className="fas fa-trash-alt"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        ))}
                    </div>
                </div>
            </>
        );
    }
}
export default Contact; 
