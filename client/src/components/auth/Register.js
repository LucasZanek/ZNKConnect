import React, { Fragment, useState } from "react";
import axios from "axios";

const Register = () => {
  const userData = {
    name: "",
    email: "",
    password: "",
    password2: ""
  };

  const [formData, setFormData] = useState(userData);

  const onChange = event =>
    setFormData({ ...formData, [event.target.name]: event.target.value });

  const onSubmit = async event => {
    event.preventDefault();
    if (password !== password2) {
      console.log("The passwords do not match");
    } else {
      try {
        await testRequestProcess();
      } catch (error) {
        console.error(error.response.data);
      }
    }
  };

  const testRequestProcess = async () => {
    //* Using the react hooks for the state we can access for the user data in this method
    // TODO: ONLY for testing the connection with the api, Remove this request and implement REDUX
    const newUser = {
      name,
      email,
      password
    };

    const config = {
      headers: {
        "Content-Type": "application/json"
      }
    };

    const body = JSON.stringify(newUser);
    console.log(body);
    const response = await axios.post("/api/users", body, config);
  };

  const { name, email, password, password2 } = formData;

  return (
    <Fragment>
      <h1 className="large text-primary">Sign Up</h1>
      <p className="lead">
        <i className="fas fa-user"></i> Create Your Account
      </p>
      <form className="form" onSubmit={event => onSubmit(event)}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={name}
            onChange={event => onChange(event)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={event => onChange(event)}
            required
          />
          <small className="form-text">
            This site uses Gravatar so if you want a profile image, use a
            Gravatar email
          </small>
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            minLength="6"
            value={password}
            onChange={event => onChange(event)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="password2"
            minLength="6"
            value={password2}
            onChange={event => onChange(event)}
            required
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account? <a href="login.html">Sign In</a>
      </p>
    </Fragment>
  );
};

export default Register;
