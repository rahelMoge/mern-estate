import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`/api/user/${listing.userRef}`);
        const data = await res.json();
        if (data && data._id) {
          setLandlord(data);
        } else {
          console.error('Failed to fetch landlord data:', data);
        }
      } catch (error) {
        console.error('Error fetching landlord:', error);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }
    setError('');
    setSending(true);

    try {
      const res = await fetch('/api/message/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing._id,
          listingName: listing.name,
          senderId: currentUser._id,
          senderName: currentUser.username,
          senderEmail: currentUser.email,
          recipientId: landlord._id,
          recipientName: landlord.username,
          recipientEmail: landlord.email,
          subject: `Regarding ${listing.name}`,
          message: message,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSent(true);
        setTimeout(() => {
          setShowPopup(false);
          setSent(false);
          setMessage('');
        }, 2500);
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {landlord && (
        <div className='flex flex-col gap-3 mt-4 border-t pt-4'>
          <p className='text-slate-700 font-medium'>
            Contact <span className='font-bold text-slate-900'>{landlord.username}</span>{' '}
            for <span className='font-bold text-slate-900'>{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            name='message'
            id='message'
            rows='3'
            value={message}
            onChange={(e) => { setMessage(e.target.value); setError(''); }}
            placeholder='Enter your message here...'
            className='w-full border p-3 rounded-xl focus:ring-2 focus:ring-slate-400 focus:outline-none transition-all placeholder:text-slate-400'
          ></textarea>
          <button
            onClick={() => {
              if (!message.trim()) {
                setError('Please enter a message first');
                return;
              }
              setError('');
              setShowPopup(true);
            }}
            className='bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95 font-bold transition-all shadow-md hover:shadow-lg'
          >
            Send Message
          </button>
          {error && !showPopup && (
            <p className='text-red-500 text-sm text-center'>{error}</p>
          )}
        </div>
      )}

      {/* ── Popup Modal ── */}
      {showPopup && landlord && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center'
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => { if (!sending) setShowPopup(false); }}
        >
          <div
            className='bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden'
            style={{ animation: 'popupSlideIn 0.3s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className='flex items-center justify-between px-6 py-4'
              style={{ background: 'linear-gradient(135deg, #334155, #1e293b)' }}
            >
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-white/20 flex items-center justify-center'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <h3 className='text-white font-bold text-lg'>New Message</h3>
              </div>
              <button
                onClick={() => { if (!sending) setShowPopup(false); }}
                className='text-white/70 hover:text-white transition-colors'
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Sent Success State */}
            {sent ? (
              <div className='flex flex-col items-center justify-center py-16 gap-4'>
                <div
                  className='w-16 h-16 rounded-full flex items-center justify-center'
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className='text-xl font-bold text-slate-800'>Message Sent!</p>
                <p className='text-slate-500 text-sm'>
                  Your message has been delivered to {landlord.username}
                </p>
              </div>
            ) : (
              <>
                {/* Compose Form */}
                <div className='px-6 py-4 space-y-3'>
                  {/* To Field */}
                  <div className='flex items-center gap-3 border-b border-slate-100 pb-3'>
                    <span className='text-sm font-semibold text-slate-400 w-16'>To:</span>
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold'
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                      >
                        {landlord.username.charAt(0).toUpperCase()}
                      </div>
                      <span className='text-sm font-medium text-slate-700'>{landlord.username}</span>
                      <span
                        className='text-xs px-2 py-0.5 rounded-full'
                        style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}
                      >
                        {landlord.email}
                      </span>
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div className='flex items-center gap-3 border-b border-slate-100 pb-3'>
                    <span className='text-sm font-semibold text-slate-400 w-16'>Subject:</span>
                    <span className='text-sm text-slate-700'>Regarding {listing.name}</span>
                  </div>

                  {/* Message Body */}
                  <div className='pt-1'>
                    <div
                      className='w-full min-h-[140px] p-3 rounded-xl text-sm text-slate-700 leading-relaxed whitespace-pre-wrap'
                      style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                    >
                      {message}
                    </div>
                  </div>

                  {error && (
                    <p className='text-red-500 text-sm text-center'>{error}</p>
                  )}
                </div>

                {/* Footer Actions */}
                <div
                  className='flex items-center justify-end gap-3 px-6 py-4'
                  style={{ borderTop: '1px solid #f1f5f9' }}
                >
                  <button
                    onClick={() => setShowPopup(false)}
                    disabled={sending}
                    className='px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={sending}
                    className='px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center gap-2'
                    style={{ background: 'linear-gradient(135deg, #334155, #1e293b)' }}
                  >
                    {sending ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        Send
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          <style>{`
            @keyframes popupSlideIn {
              from {
                opacity: 0;
                transform: translateY(20px) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
