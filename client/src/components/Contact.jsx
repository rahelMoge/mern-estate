import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState('');
  const onChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`/api/user/${listing.userRef}`);
        const data = await res.json();
        setLandlord(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);

  return (
    <>
      {landlord && (
        <div className='flex flex-col gap-3 mt-4 border-t pt-4 animate-in fade-in duration-500'>
          <p className='text-slate-700 font-medium'>
            Contact <span className='font-bold text-slate-900'>{landlord.username}</span>{' '}
            for <span className='font-bold text-slate-900'>{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            name='message'
            id='message'
            rows='3'
            value={message}
            onChange={onChange}
            placeholder='Enter your message here...'
            className='w-full border p-3 rounded-xl focus:ring-2 focus:ring-slate-400 focus:outline-none transition-all placeholder:text-slate-400'
          ></textarea>

          <Link
            to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
            className='bg-slate-700 text-white text-center p-3 uppercase rounded-xl hover:opacity-95 font-bold transition-all shadow-md hover:shadow-lg'
          >
            Send Message          
          </Link>
        </div>
      )}
    </>
  );
}
