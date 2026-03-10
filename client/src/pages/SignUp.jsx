// SignUp.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'

export default function SignUp() {
  const [formData, setFormData] = useState({}) ;
  const [error,setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData(
      {
      ...formData,  // keep existing form data
      [e.target.id]: e.target.value, // update the changed input field by its id
      }); 
  };
  const  handleSubmit =  async (e) => {
    e.preventDefault();  // stop the page from refreshing when the form submits
    try {
    setLoading(true); // show loading state
    const res = await fetch('/api/auth/signup',
      { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // telling server data is JSON
        },
        body: JSON.stringify(formData),
      });

     const data = await res.json(); // wait and parse JSON response from server
     console.log(data);               // log the server response (for debugging)
     if(data.success === false) {       // if backend responds with failure
      setLoading(false);             // stop loading spinner
       setError(data.message);       // show error message
      return;             // stop further code execution
     }
     setLoading(false);     // stop loading if success
     setError(null);             // clear previous errors
     navigate('/sign-in');      // redirect to sign-in page after success

    } catch (error) {
      setLoading(false);         // stop loading on error
      setError(error.message);   // show error message

    }
  };

  
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input type="text" placeholder='username' 
         className='border p-3 rounded-lg' id='username' onChange={handleChange} />
        <input type="email" placeholder='email' 
         className='border p-3 rounded-lg' id='email' onChange={handleChange}/>
        <input type="password" placeholder='password' 
         className='border p-3 rounded-lg' id='password' onChange={handleChange}/>

         <button disabled={loading} className='bg-slate-700 text-white p-3 
         rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
         >
          {loading ? 'Loading...' : 'Sign Up'}
         </button>
      </form>
      <div className='flex gap-2 mt-5'>
        <p>Have an account?</p>
        <Link to={"/sign-in"}>
        <span className='text-blue-700'>Sign in</span>
        </Link>
      </div>
      {error && <p className='text-red-500 mt -5'>{error}</p>}
    </div>
  );
}
