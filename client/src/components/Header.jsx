import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { useState, useEffect } from 'react';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlparams = new URLSearchParams(window.location.search);

    urlparams.set('searchTerm', searchTerm);
    const searchQuery = urlparams.toString();
    navigate(`/search?${searchQuery}`);
  };

  // ✅ Add the function here, inside the component
  const getAvatar = () => {
    const avatar = currentUser?.avatar;
    if (!avatar) return '/default-avatar.png';

    // check if base64 is valid
    if (avatar.startsWith('data:image') && avatar.length > 100) {
      return avatar;
    }

    // allow URL
    if (avatar.startsWith('http')) return avatar;

    return '/default-avatar.png';
  };


  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }

  }, [location.search]);
  return (
    <header className='bg-slate-200 shadow-md mx-auto p-3'>
      <div className='flex justify-between items-center max-w-6xl'>
        <Link to='/'>
          <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
            <span className='text-slate-500'>Rahel</span>
            <span className='text-slate-700'>Estate</span>
          </h1>
        </Link>

        <form onSubmit={handleSubmit} className='bg-slate-100 p-3 rounded-lg flex items-center'>
          <input
            type='text'
            placeholder='search...'
            className='bg-transparent focus:outline-none w-24 sm:w-64'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch className='text-slate-600' />
          </button>

        </form>

        <ul className='flex gap-4 items-center'>
          <Link to='/'>
            <li className='hidden sm:inline text-slate-700 hover:underline'>Home</li>
          </Link>

          <Link to='/about'>
            <li className='hidden sm:inline text-slate-700 hover:underline'>About</li>
          </Link>

          <Link to='/profile'>
            {currentUser ? (
              <img
                className='rounded-full h-7 w-7 object-cover'
                src={getAvatar()} // ✅ Use the function here
                alt='profile'
              />
            ) : (
              <li className='text-slate-700 hover:underline'>Sign in</li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}
