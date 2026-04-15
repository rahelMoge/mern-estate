import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import 'swiper/css/bundle';

export default function Listing() {
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const params = useParams();

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
            } catch (err) {
                setError(true);
                setLoading(false);
            }
        };

        fetchListing();
    }, [params.listingId]);

    return (
        <main>
            {/* Loading */}
            {loading && (
                <p className='text-center my-7 text-2xl'>Loading...</p>
            )}

            {/* Error */}
            {error && (
                <p className='text-center my-7 text-2xl'>
                    Something went wrong
                </p>
            )}

            {/* Listing Content */}
            {listing && !loading && !error && (
                <div>
                    {/* Image Slider */}
                    <Swiper
                        modules={[Navigation, Pagination, Scrollbar, A11y]}
                        navigation
                        pagination={{ clickable: true }}
                        scrollbar={{ draggable: true }}
                    >
                        {listing.imageUrls?.map((url) => (
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

                    {/* Listing Info */}
                    <div className='p-4 max-w-4xl mx-auto'>
                        <h1 className='text-2xl font-semibold mb-2'>
                            {listing.name}
                        </h1>

                        <p className='text-green-700 text-xl font-bold mb-2'>
                            ${listing.regularPrice}
                            {listing.type === 'rent' && ' / month'}
                        </p>

                        <p className='text-gray-600 mb-3'>
                            📍 {listing.address}
                        </p>

                        <p className='mb-4'>
                            <span className='font-semibold'>Description: </span>
                            {listing.description}
                        </p>

                        <ul className='flex flex-wrap gap-4 text-sm'>
                            <li>🛏 {listing.bedrooms} beds</li>
                            <li>🛁 {listing.bathrooms} baths</li>
                            <li>
                                🚗 {listing.parking ? 'Parking available' : 'No parking'}
                            </li>
                            <li>
                                🪑 {listing.furnished ? 'Furnished' : 'Unfurnished'}
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </main>
    );
}
