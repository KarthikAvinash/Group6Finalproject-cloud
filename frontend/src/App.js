
// App.js
import React, { useState, useEffect } from 'react';
import iiitLogo from './iiit_dharwad_logo.png';

// Import team member images and LinkedIn icon
import karthikImage from './karthik.jpg';
import tejasImage from './tejas.jpg';
import chaturthImage from './chaturth.jpg';
import ekanshImage from './ekansh.jpg';
import jaishanaImage from './jaishana.jpg';
import linkedinIcon from './linkedin.png';

function App() {
  // State variables
  const [view, setView] = useState('signin'); // 'signin', 'signup', 'courses'
  const [tab, setTab] = useState('catalogue'); // 'catalogue', 'mycourses', 'team'
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [courses, setCourses] = useState([]);
  const [courseData, setCourseData] = useState({ title: '', details: '', semester: '', enrollStatus: false });
  const [editCourseId, setEditCourseId] = useState(null);
  const [message, setMessage] = useState('');
  const [googleError, setGoogleError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL;

  // Define team members data
  const teamMembers = [
    {
      name: 'Karthik Avinash',
      rollNumber: '21bcs052',
      image: karthikImage,
      linkedin: 'https://www.linkedin.com/in/karthik-avinash-04b51022b/'
    },
    {
      name: 'Tejas S',
      rollNumber: '21bcs125',
      image: tejasImage,
      linkedin: 'https://www.linkedin.com/in/tejas-s-568326228/'
    },
    {
      name: 'Chaturth R',
      rollNumber: '21bcs025',
      image: chaturthImage,
      linkedin: 'https://www.linkedin.com/in/chaturth-r-745b3a22a/'
    },
    {
      name: 'Ekansh Thakur',
      rollNumber: '21bcs037',
      image: ekanshImage,
      linkedin: 'https://www.linkedin.com/in/ekanshthakur/'
    },
    {
      name: 'Jaishana Bindu Priya',
      rollNumber: '21bcs045',
      image: jaishanaImage,
      linkedin: 'https://www.linkedin.com/in/jaishana-bindhu-priya/'
    }
  ];

  useEffect(() => {
    document.title = 'Group6Finalproject'; // Set the browser tab title
    fetch(`${API_URL}/courses`, { credentials: 'include' })
      .then(res => {
        if (res.ok) {
          setView('courses');
          return res.json();
        } else {
          throw new Error('Not authenticated');
        }
      })
      .then(data => {
        setCourses(data);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCourseInputChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message || 'Signup successful');
        setView('signin');
      })
      .catch(err => console.log(err));
  };

  const handleSignin = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include'
    })
      .then(res => {
        if (res.ok) {
          setView('courses');
          fetchCourses();
        } else {
          return res.json().then(data => { throw new Error(data.message); });
        }
      })
      .catch(err => {
        setMessage(err.message);
      });
  };

  const fetchCourses = () => {
    fetch(`${API_URL}/courses`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.log(err));
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    const url = editCourseId ? `${API_URL}/course/${editCourseId}` : `${API_URL}/course`;
    const method = editCourseId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (editCourseId) {
          // Update course in state
          setCourses(courses.map(c => c.id === editCourseId ? data : c));
          setEditCourseId(null);
        } else {
          // Add new course to state
          setCourses([...courses, data]);
        }
        setCourseData({ title: '', details: '', semester: '', enrollStatus: false });
      })
      .catch(err => console.log(err));
  };

  const handleDeleteCourse = (id) => {
    fetch(`${API_URL}/course/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setCourses(courses.filter(c => c.id !== id));
      })
      .catch(err => console.log(err));
  };

  const handleEditCourse = (course) => {
    setEditCourseId(course.id);
    setCourseData({
      title: course.title,
      details: course.details,
      semester: course.semester,
      enrollStatus: course.enrollStatus
    });
  };

  const handleLogout = () => {
    fetch(`${API_URL}/auth/logout`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setView('signin');
        setMessage(data.message);
      })
      .catch(err => console.log(err));
  };

    const handleGoogleSignin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const switchTab = (tabName) => {
    setTab(tabName);
  };

  // Filter enrolled courses
  const enrolledCourses = courses.filter(c => c.enrollStatus === 'true' || c.enrollStatus === true);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src={iiitLogo} alt="IIIT Dharwad Logo" style={styles.logo} />
        <h1 style={styles.title}>My Courses App</h1>
      </header>
      {message && <p style={styles.message}>{message}</p>}
      {googleError && <p style={styles.error}>{googleError}</p>}

      {view === 'signup' && (
        <div style={styles.authContainer}>
          <h2>Sign Up</h2>
          <form onSubmit={handleSignup} style={styles.form}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.primaryButton}>Sign Up</button>
          </form>
          <p>
            Already have an account?{' '}
            <button onClick={() => setView('signin')} style={styles.linkButton}>Sign In</button>
          </p>
        </div>
      )}

      {view === 'signin' && (
        <div style={styles.authContainer}>
          <h2>Sign In</h2>
          <form onSubmit={handleSignin} style={styles.form}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.primaryButton}>Sign In</button>
          </form>
          <button onClick={handleGoogleSignin} style={styles.googleButton}>Sign In with Google</button>
          <p>
            Don't have an account?{' '}
            <button onClick={() => setView('signup')} style={styles.linkButton}>Sign Up</button>
          </p>
        </div>
      )}

      {view === 'courses' && (
        <div>
          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
          <div style={styles.navBar}>
            <button onClick={() => switchTab('catalogue')} style={tab === 'catalogue' ? styles.activeTab : styles.tab}>Course Catalogue</button>
            <button onClick={() => switchTab('mycourses')} style={tab === 'mycourses' ? styles.activeTab : styles.tab}>My Courses</button>
            <button onClick={() => switchTab('team')} style={tab === 'team' ? styles.activeTab : styles.tab}>Our Team</button>
          </div>

          {tab === 'catalogue' && (
            <div>
              <h2>Course Catalogue</h2>
              <div style={styles.courseGrid}>
                {courses.map((course, index) => (
                  <div key={index} style={styles.courseCard}>
                    <h3>{course.title}</h3>
                    <p><strong>Details:</strong> {course.details}</p>
                    <p><strong>Semester:</strong> {course.semester}</p>
                    <p><strong>Enroll Status:</strong> {course.enrollStatus ? 'Enrolled' : 'Not Enrolled'}</p>
                    <div style={styles.cardButtons}>
                      <button onClick={() => handleEditCourse(course)} style={styles.editButton}>Edit</button>
                      <button onClick={() => handleDeleteCourse(course.id)} style={styles.deleteButton}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
              <h3>{editCourseId ? 'Edit Course' : 'Add a New Course'}</h3>
              <form onSubmit={handleAddCourse} style={styles.form}>
                <input
                  type="text"
                  name="title"
                  placeholder="Course Title"
                  value={courseData.title}
                  onChange={handleCourseInputChange}
                  required
                  style={styles.input}
                />
                <textarea
                  name="details"
                  placeholder="Course Details"
                  value={courseData.details}
                  onChange={handleCourseInputChange}
                  required
                  style={{ ...styles.input, height: '100px' }}
                ></textarea>
                <input
                  type="text"
                  name="semester"
                  placeholder="Semester"
                  value={courseData.semester}
                  onChange={handleCourseInputChange}
                  required
                  style={styles.input}
                />
                <label style={styles.label}>
                  Enroll Status:
                  <select name="enrollStatus" value={courseData.enrollStatus} onChange={handleCourseInputChange} style={styles.input}>
                    <option value={false}>Not Enrolled</option>
                    <option value={true}>Enrolled</option>
                  </select>
                </label>
                <button type="submit" style={styles.primaryButton}>{editCourseId ? 'Update Course' : 'Add Course'}</button>
                {editCourseId && (
                  <button onClick={() => {
                    setEditCourseId(null);
                    setCourseData({ title: '', details: '', semester: '', enrollStatus: false });
                  }} style={styles.cancelButton}>Cancel</button>
                )}
              </form>
            </div>
          )}

          {tab === 'mycourses' && (
            <div>
              <h2>My Courses</h2>
              {enrolledCourses.length > 0 ? (
                <div style={styles.courseGrid}>
                  {enrolledCourses.map((course, index) => (
                    <div key={index} style={styles.courseCard}>
                      <h3>{course.title}</h3>
                      <p><strong>Details:</strong> {course.details}</p>
                      <p><strong>Semester:</strong> {course.semester}</p>
                      <p><strong>Enroll Status:</strong> {course.enrollStatus ? 'Enrolled' : 'Not Enrolled'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>You have not enrolled in any courses.</p>
              )}
            </div>
          )}

          {tab === 'team' && (
            <div>
              <h2>Our Team</h2>
              <div style={styles.teamGrid}>
                {teamMembers.map((member, index) => (
                  <div key={index} style={styles.teamMemberCard}>
                    <img src={member.image} alt={member.name} style={styles.teamMemberImage} />
                    <h3>{member.name}</h3>
                    <p><strong>Roll Number:</strong> {member.rollNumber}</p>
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                      <img src={linkedinIcon} alt="LinkedIn Profile" style={styles.linkedinIcon} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Define your styles here
const styles = {
  container: {
    padding: '20px',
    fontFamily: "'Roboto', sans-serif",
    maxWidth: '1000px',
    margin: '0 auto',
    backgroundColor: '#f0f2f5',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  logo: {
    height: '60px',
    marginRight: '15px',
  },
  title: {
    textAlign: 'left',
    color: '#333',
    fontSize: '32px',
    fontWeight: 'bold',
  },
  message: {
    color: 'green',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  authContainer: {
    border: '1px solid #ccc',
    padding: '30px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    marginTop: '20px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '15px',
  },
  input: {
    padding: '12px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    width: '100%',
    boxSizing: 'border-box',
  },
  label: {
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  primaryButton: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '10px',
    transition: 'background-color 0.3s',
  },
  editButton: {
    padding: '10px',
    backgroundColor: '#ffc107',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    marginRight: '10px',
    transition: 'background-color 0.3s',
  },
  deleteButton: {
    padding: '10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  cancelButton: {
    padding: '12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.3s',
  },
  googleButton: {
    padding: '12px',
    backgroundColor: '#db4437',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '15px',
    transition: 'background-color 0.3s',
  },
  logoutButton: {
    padding: '10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    float: 'right',
    marginTop: '10px',
    transition: 'background-color 0.3s',
  },
  linkButton: {
    background: 'none',
    color: '#007bff',
    border: 'none',
    padding: '0',
    fontSize: '16px',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  courseGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: '20px',
    justifyContent: 'space-between',
  },
  courseCard: {
    backgroundColor: '#fff',
    padding: '20px',
    margin: '10px 0',
    borderRadius: '8px',
    width: 'calc(48% - 20px)',
    boxSizing: 'border-box',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  navBar: {
    marginTop: '20px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
  tab: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    marginRight: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
  },
  activeTab: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    marginRight: '10px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  cardButtons: {
    marginTop: '15px',
  },
  teamGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '20px',
  },
  teamMemberCard: {
    backgroundColor: '#fff',
    padding: '20px',
    margin: '10px',
    borderRadius: '8px',
    width: '200px',
    boxSizing: 'border-box',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  teamMemberImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '50%',
    marginBottom: '15px',
  },
  linkedinIcon: {
    width: '24px',
    height: '24px',
    marginTop: '10px',
  },
};

export default App;
