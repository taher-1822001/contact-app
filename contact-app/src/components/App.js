import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm/RegisterForm'
import HomePage from './HomePage';
import AddContact from './AddContact';
import EditContact from './EditContact';
import { useParams } from 'react-router-dom';
import Info from './Info';
import PasswordReset from './PasswordReset';
class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDarkTheme: false,
    };
  }

  toggleTheme = () => {
    this.setState((prevState) => ({
      isDarkTheme: !prevState.isDarkTheme,
    }));
  };

  componentDidMount() {
    // Set the initial theme when the component mounts
    this.updateBodyClass();
  }

  componentDidUpdate() {
    // Update the theme when it changes
    this.updateBodyClass();
  }

  updateBodyClass() {
    // Add or remove 'dark-theme' class to the body based on the theme state
    document.body.classList.toggle('dark-theme', this.state.isDarkTheme);
  }
  render()
  {
    
    
  return (
    <div className="app" >
     
      <Router>
  <Routes>
    <Route exact path="/" element={<LoginForm />} />
    <Route path="/register" element={<RegisterForm />} />
    <Route path="/home" element={<HomePage />} />
    <Route path="/contact" element={<AddContact />} />
    <Route path="/editcontact/:id" element={<EditContact />} />
    <Route path="/info" element={<Info />} />
    <Route path="/passwordreset" element={<PasswordReset />} />
  </Routes>
</Router>
     
    </div>
  );
}
}

export default App;
