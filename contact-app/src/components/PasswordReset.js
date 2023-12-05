import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';

const PasswordReset = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        image: '',
        // created_by:Cookies.get('email')
    });
    const [type, setType] = useState("password");
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');

    const handleShowPassword = () => {
        setType(type === 'password' ? 'text' : 'password');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'password1') {
            setPassword1(value);
        } else if (name === 'password2') {
            setPassword2(value);
        }
    };

    return (
        <>
            <Header />
            {console.log(password1, password2)}
            <div className='container mt-5'>
                <div className='row justify-content-center '>
                    <div className='col-lg-4'>
                        <h2 style={{ textAlign: "center" }}>Password Reset</h2>
                        <hr />
                        <form>
                            <input
                                type={type}
                                className="form-control mt-2"
                                id="password1"
                                aria-describedby="psHelp"
                                name="password1"
                                placeholder="Enter Password"
                                required
                                value={password1}
                                onChange={handleChange}
                            />
                            <input
                                type={type}
                                className="form-control mt-2"
                                id="password2"
                                aria-describedby="psHelp"
                                name="password2"
                                placeholder="Enter Password Again"
                                required
                                value={password2}
                                onChange={handleChange}
                            />
                            <small className='text-danger' style={{display:'block'}}>password don't match</small>
                            <span>
                                <input
                                    type='checkbox'
                                    value='Show Password'
                                    className='border-primary pt-2'
                                    onClick={handleShowPassword}
                                    style={{ cursor: "pointer" }}
                                />
                                <label><small> Show Password</small></label>
                            </span>

                            <button className='btn btn-warning w-100 ml-1'>Reset Password</button>
                        </form>
                        <hr />
                    </div>
                </div>
            </div>
            <div style={{ height: "150px" }}></div>
            <Footer />
        </>
    )
}

export default PasswordReset;
