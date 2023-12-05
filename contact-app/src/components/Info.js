import React from 'react'
import { Link, Navigate } from 'react-router-dom';
import Header from './Header';
import ToggleBar from './ToggleBar/ToggleBar';
import Footer from './Footer';
class Info extends React.Component{
    constructor(props){
        super(props);
        this.state = {

        }
    }
    render(){
        return(
            <>
            <Header />
            <ToggleBar />
            <div className='container'>
            






                <center><h1 className='pt-1'>Project Overview: Full Stack Contact App</h1></center>
                <h2>Technologies Used:</h2>
                <h3>Frontend:</h3>
                <p>React (JavaScript library for building UI) <br />Bootstrap (Front-end component library for styling)</p>
                
                <h3>Backend:</h3>
                <p>Django Rest Framework (DRF) (Python framework for building RESTful APIs)<br /> PostgreSQL (Relational Database Management System)</p>

                <h2>Features:</h2>
                <p><b>User Authentication:</b> Implement user registration and login functionalities using Django Rest Framework's authentication system.</p>
                <p><b>Contact Management:</b> Create, read, update, and delete (CRUD) operations for managing contacts. Users can add, view, edit, and delete their contacts.</p>
                <p><b>Download:</b> Users can download the excel sheet of their contacts.</p>
                <p><b>API Endpoints:</b> Develop RESTful APIs using Django Rest Framework for communication between frontend and backend.</p>
                <p><b>Database Integration:</b> Utilize PostgreSQL as the database to store user information and contacts data.</p>
                <p><b>Responsive UI:</b> Implement a responsive and user-friendly interface using React and Bootstrap to ensure optimal user experience across devices.</p>
                <p><b>Search and Filter:</b> Enable users to search for contacts and implement filters based on different contact attributes.</p>
                <p><b>Authorization and Permissions:</b> Implement access control to ensure users can only manipulate their own contacts.</p>

            </div>
            <div className='container'>
                <div className='row justify-content-center'>
                    <div className='col-lg-4'>
                        <Link to='/home'><button className='btn btn-outline-warning w-100'>Back</button></Link>
                    </div>
                </div>
            </div>
            <div style={{height:"150px"}}></div>
            <Footer />
            </>
        )
    }
}

export default Info;