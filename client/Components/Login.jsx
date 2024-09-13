import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUsername } from '../Providers/UserProvider';
import scissorsImage from '../Images/scissors.png';

function Login() {
  const [error, setError] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const navigate = useNavigate();

  const { username, setUsername, isAuthenticated, setAuthenticated } =
    useUsername();

  useEffect(() => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    };

    if (isAuthenticated && username) {
      navigate('/home');
    } else if (username) {
      fetch('/api/session/checkStatus', requestOptions)
        .then((session) => {
          if (!session.ok) {
            throw new Error(`HTTP error, status = ${session.status}`);
          } else {
            setAuthenticated(true);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [isAuthenticated, username, navigate, setAuthenticated]);

  const handleUsernameChange = (e) => {
    setUsernameInput(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPasswordInput(e.target.value);
  };
  const sendLogin = async (e) => {
    e.preventDefault();
    setError(false);
    const loginBody = JSON.stringify({
      username: usernameInput,
      password: passwordInput,
    });
    try {
      const post = await fetch('/api/session', {
        method: 'POST',
        body: loginBody,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!post.ok) {
        throw new Error(`HTTP error, status = ${post.status}`);
      }
      const { verifiedUser } = await post.json();
      setUsername(verifiedUser);
      // eslint-disable-next-line no-undef
      localStorage.setItem('username', verifiedUser);
      setAuthenticated(true);
    } catch (err) {
      setError(true);
    }
  };
  const handleFocus = (e) => {
    e.target.placeholder = '';
    setError(false);
  };

  const handleBlur = (e) => {
    e.target.placeholder = e.target.name;
  };

  return (
    <div className='bg-gray-900 flex flex-col align-center h-screen'>
      <div className='flex justify-center'>
        <h1 className='text-5xl font-bold m-0 mt-16'>Welcome to Snip Snip!</h1>
      </div>
      <div className='flex flex-col items-center justify-center flex-grow pb-48 font-poppins text-lg '>
        <img
          className='inline-block mb-4'
          src={scissorsImage}
          alt='scissors-logo'
          height='200px'
          width='250px'
        />
        <form
          className='flex flex-col items-center justify-between h-60 rounded-3xl  w-96 m-0 mb-7'
          onSubmit={sendLogin}
        >
          <input
            type='text'
            placeholder='username'
            className='rounded-3xl py-3 my-4 w-80 text-center outline-none'
            aria-label='login-username-input'
            name='username'
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleUsernameChange}
          />
          <input
            type='password'
            placeholder='password'
            className=' rounded-3xl py-3 mb-4 w-80 text-center outline-none'
            name='password'
            aria-label='login-password-input'
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handlePasswordChange}
          />
          <button
            className='bg-pink-600 text-white text-xl rounded-xl w-full h-14 hover:bg-pink-500'
            aria-label='login-submit-button'
            type='submit'
          >
            Sign in
          </button>
        </form>
        <div className='text-white text-center'>
          New here?{' '}
          <Link to='/signup' className='underline hover:text-gray-300 text-lg'>
            Create an account
          </Link>
        </div>
        {error && (
          <div className='text-red-400 mt-3'>
            Failed to login... Please check your credentials.
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
