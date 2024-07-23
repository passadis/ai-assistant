import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [genres, setGenres] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const photoInputRef = useRef(null);

  const handleGenreChange = (e) => {
    const options = e.target.options;
    const selectedGenres = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedGenres.push(options[i].value);
      }
    }
    setGenres(selectedGenres);
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Reset error message
    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('emailAddress', emailAddress);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('age', age);
    formData.append('genres', JSON.stringify(genres));

    if (photoInputRef.current && photoInputRef.current.files[0]) {
      formData.append('photo', photoInputRef.current.files[0]);
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Registration successful! You can now log in! Welcome!'); // Alert the user
      navigate('/');
      console.log(response.data);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message); // Use server-provided error message
      } else {
        setErrorMessage('Error registering. Please try again.'); // Generic error message for other cases
      }
      console.error("Error registering:", error.response);
    }
  };

  const handlePhotoChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setPhoto(URL.createObjectURL(event.target.files[0]));
    }
  };

  return (
    <div className="Register">
      <h1>Sign Up</h1>
      <form onSubmit={handleRegistration}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
<select multiple={true} value={genres} onChange={handleGenreChange}>
  <option value="Classics">Classics</option>
  <option value="Fiction">Fiction</option>
  <option value="Historical Fiction">Historical Fiction</option>
  <option value="School">School</option>
  <option value="Literature">Literature</option>
  <option value="Young Adult">Young Adult</option>
  <option value="Historical">Historical</option>
  <option value="Fantasy">Fantasy</option>
  <option value="Magic">Magic</option>
  <option value="Childrens">Childrens</option>
  <option value="Middle Grade">Middle Grade</option>
  <option value="Romance">Romance</option>
  <option value="Audiobook">Audiobook</option>
  <option value="Nonfiction">Nonfiction</option>
  <option value="History">History</option>
  <option value="Biography">Biography</option>
  <option value="Memoir">Memoir</option>
  <option value="Holocaust">Holocaust</option>
  <option value="Dystopia">Dystopia</option>
  <option value="Politics">Politics</option>
  <option value="Science Fiction">Science Fiction</option>
  <option value="Novels">Novels</option>
  <option value="Coming Of Age">Coming Of Age</option>
  <option value="Adventure">Adventure</option>
  <option value="Science Fiction Fantasy">Science Fiction Fantasy</option>
  <option value="Epic Fantasy">Epic Fantasy</option>
  <option value="High Fantasy">High Fantasy</option>
  <option value="War">War</option>
  <option value="World War II">World War II</option>
  <option value="Christian">Christian</option>
  <option value="Drama">Drama</option>
  <option value="Contemporary">Contemporary</option>
  <option value="Picture Books">Picture Books</option>
  <option value="Poetry">Poetry</option>
  <option value="Animals">Animals</option>
  <option value="Realistic Fiction">Realistic Fiction</option>
  <option value="Feminism">Feminism</option>
  <option value="LGBT">LGBT</option>
  <option value="African American">African American</option>
  <option value="American">American</option>
  <option value="France">France</option>
  <option value="Japan">Japan</option>
  <option value="Africa">Africa</option>
  <option value="Asia">Asia</option>
  <option value="India">India</option>
  <option value="New York">New York</option>
  <option value="Spain">Spain</option>
  <option value="Medieval">Medieval</option>
  <option value="Arthurian">Arthurian</option>
  <option value="Gothic">Gothic</option>
  <option value="Mental Health">Mental Health</option>
  <option value="Self Help">Self Help</option>
  <option value="Humor">Humor</option>
  <option value="Short Stories">Short Stories</option>
  <option value="Christianity">Christianity</option>
  <option value="Theology">Theology</option>
  <option value="Writing">Writing</option>
  <option value="Spirituality">Spirituality</option>
  <option value="Religion">Religion</option>
  <option value="Psychology">Psychology</option>
  <option value="Nature">Nature</option>
  <option value="Fairy Tales">Fairy Tales</option>
  <option value="Mythology">Mythology</option>
  <option value="Read For School">Read For School</option>
  <option value="Travel">Travel</option>
  <option value="Book Club">Book Club</option>
  <option value="Holocaust">Holocaust</option>
  <option value="True Crime">True Crime</option>
  <option value="Sociology">Sociology</option>
  <option value="Economics">Economics</option>
  <option value="Philosophy">Philosophy</option>
  <option value="Autobiography">Autobiography</option>
  <option value="Thriller">Thriller</option>
  <option value="Crime">Crime</option>
  <option value="Mystery">Mystery</option>
  <option value="Mystery Thriller">Mystery Thriller</option>
  <option value="Suspense">Suspense</option>
  <option value="Speculative Fiction">Speculative Fiction</option>
  <option value="Space Opera">Space Opera</option>
  <option value="Vampires">Vampires</option>
  <option value="Paranormal">Paranormal</option>
  <option value="Paranormal Romance">Paranormal Romance</option>
  <option value="Russian Literature">Russian Literature</option>
  <option value="French Literature">French Literature</option>
  <option value="German Literature">German Literature</option>
  <option value="Italian Literature">Italian Literature</option>
  <option value="Spanish Literature">Spanish Literature</option>
  <option value="Magical Realism">Magical Realism</option>
  <option value="Historical Romance">Historical Romance</option>
  <option value="Chick Lit">Chick Lit</option>
  <option value="Queer">Queer</option>
  <option value="Graphic Novels">Graphic Novels</option>
  <option value="Comics">Comics</option>
  <option value="Graphic Novels Comics">Graphic Novels Comics</option>
  <option value="Comic Book">Comic Book</option>
  <option value="Horror">Horror</option>
  <option value="Mental Illness">Mental Illness</option>
  <option value="Magical Realism">Magical Realism</option>
  <option value="Teen">Teen</option>
  <option value="High School">High School</option>
  <option value="Victorian">Victorian</option>
  <option value="Middle Grade">Middle Grade</option>
  <option value="Fairy Tales">Fairy Tales</option>
  <option value="Reference">Reference</option>
  <option value="British Literature">British Literature</option>
  <option value="Irish Literature">Irish Literature</option>
  <option value="Canadian Literature">Canadian Literature</option>
  <option value="Indian Literature">Indian Literature</option>
</select>

        <input
          type="file"
          ref={photoInputRef} // Add the ref to the file input
          onChange={handlePhotoChange}
        />
        <div className="photo-preview">
          {photo && <img src={photo} alt="Preview" />}
        </div>
        <button type="submit">Register Account</button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default Register;
