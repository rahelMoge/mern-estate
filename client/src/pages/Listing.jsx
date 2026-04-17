import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux';
import { Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import {
    FaBath,
    FaBed,
    FaChair,
    FaMapMarkedAlt,
    FaMapMarkerAlt,
    FaParking,
    FaShare,
} from 'react-icons/fa';
import Contact from '../components/Contact';

export default function Listing() {
    SwiperCore.use([Navigation]);
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [copied, setCopied] = useState(false);
    const [contact, setContact] = useState(false);
    const params = useParams();
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/listing/get/${params.listingId}`);
                const data = await res.json();
                if (data.success === false) {
                    setError(true);
                    setLoading(false);
                    return;
                }
                setListing(data);
                setLoading(false);
                setError(false);
            } catch (error) {
                setError(true);
                setLoading(false);
            }
        };
        fetchListing();
    }, [params.listingId]);

    return (
        <main className='bg-slate-50 min-h-screen'>
            {loading && <p className='text-center my-7 text-2xl font-semibold animate-pulse text-slate-600'>Loading...</p>}
            {error && (
                <div className='flex flex-col items-center justify-center my-20 gap-4'>
                    <p className='text-center text-2xl text-red-600 font-bold'>Something went wrong!</p>
                    <button
                        onClick={() => window.location.reload()}
                        className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95'
                    >
                        Try Again
                    </button>
                </div>
            )}
            {listing && !loading && !error && (
                <div>
                    <Swiper navigation className='shadow-lg'>
                        {listing.imageUrls.map((url) => (
                            <SwiperSlide key={url}>
                                <div
                                    className='h-[350px]'
                                    style={{
                                        background: `url(${url}) center no-repeat`,
                                        backgroundSize: 'cover',
                                    }}
                                ></div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className='fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-white cursor-pointer shadow-md hover:scale-110 active:scale-95 transition-all'>
                        <FaShare
                            className='text-slate-500'
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                setCopied(true);
                                setTimeout(() => {
                                    setCopied(false);
                                }, 2000);
                            }}
                        />
                    </div>
                    {copied && (
                        <p className='fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2 shadow-sm text-slate-700 font-medium'>
                            Link copied!
                        </p>
                    )}
                    <div className='flex flex-col max-w-4xl mx-auto p-5 my-7 gap-6 bg-white rounded-2xl shadow-xl'>
                        <div className='flex flex-col gap-2'>
                            <p className='text-2xl font-bold text-slate-800 lg:text-3xl'>
                                {listing.name} - ${' '}
                                {listing.offer
                                    ? listing.discountPrice.toLocaleString('en-US')
                                    : listing.regularPrice.toLocaleString('en-US')}
                                {listing.type === 'rent' && ' / month'}
                            </p>
                            <p className='flex items-center mt-2 gap-2 text-slate-600  text-sm lg:text-base'>
                                <FaMapMarkerAlt className='text-green-700' />
                                {listing.address}
                            </p>
                        </div>

                        <div className='flex gap-4'>
                            <p className='bg-red-900 w-full max-w-[200px] text-white text-center p-1.5 rounded-lg font-semibold shadow-inner'>
                                {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
                            </p>
                            {listing.offer && (
                                <p className='bg-green-900 w-full max-w-[200px] text-white text-center p-1.5 rounded-lg font-semibold shadow-inner'>
                                    ${listing.discountPrice.toLocaleString('en-US')} Discount Price
                                </p>
                            )}
                        </div>
                        <p className='text-slate-800 leading-relaxed text-base lg:text-lg'>
                            <span className='font-bold text-black border-b-2 border-slate-200 pb-1'>Description</span>
                            <span className='block mt-3 bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-slate-700'>
                                {listing.description}
                            </span>
                        </p>
                        <ul className='text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6 bg-green-50/50 p-4 rounded-xl border border-green-100'>
                            <li className='flex items-center gap-2 whitespace-nowrap bg-white px-3 py-1.5 rounded-full shadow-sm'>
                                <FaBed className='text-lg' />
                                {listing.bedrooms > 1
                                    ? `${listing.bedrooms} beds `
                                    : `${listing.bedrooms} bed `}
                            </li>
                            <li className='flex items-center gap-2 whitespace-nowrap bg-white px-3 py-1.5 rounded-full shadow-sm'>
                                <FaBath className='text-lg' />
                                {listing.bathrooms > 1
                                    ? `${listing.bathrooms} baths `
                                    : `${listing.bathrooms} bath `}
                            </li>
                            <li className='flex items-center gap-2 whitespace-nowrap bg-white px-3 py-1.5 rounded-full shadow-sm'>
                                <FaParking className='text-lg' />
                                {listing.parking ? 'Parking spot' : 'No Parking'}
                            </li>
                            <li className='flex items-center gap-2 whitespace-nowrap bg-white px-3 py-1.5 rounded-full shadow-sm'>
                                <FaChair className='text-lg' />
                                {listing.furnished ? 'Furnished' : 'Unfurnished'}
                            </li>
                        </ul>
                        {/* Not logged in: show sign-in prompt */}
                        {!currentUser && (
                            <Link
                                to='/sign-in'
                                className='block bg-slate-700 text-white text-center rounded-lg uppercase hover:opacity-95 p-4 transition-all shadow-lg text-lg font-bold'
                            >
                                Sign in to contact landlord
                            </Link>
                        )}

                        {/* Logged in: show contact button */}
                        {currentUser && !contact && (
                            <button
                                onClick={() => setContact(true)}
                                className='w-full bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-4 transition-all duration-300 shadow-lg text-lg font-bold'
                            >
                                Contact landlord
                            </button>
                        )}
                        {contact && <Contact listing={listing} />}
                    </div>
                </div>
            )}
        </main>
    );
}
