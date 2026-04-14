import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

export default function UpdateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const params = useParams();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 50,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingListing, setFetchingListing] = useState(true);

  // Fetch existing listing data on mount
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const listingId = params.listingId;
        const res = await fetch(`/api/listing/get/${listingId}`);
        const data = await res.json();
        if (data.success === false) {
          console.log(data.message);
          setFetchingListing(false);
          return;
        }
        setFormData({
          imageUrls: data.imageUrls || [],
          name: data.name || '',
          description: data.description || '',
          address: data.address || '',
          type: data.type || 'rent',
          bedrooms: data.bedrooms || 1,
          bathrooms: data.bathrooms || 1,
          regularPrice: data.regularPrice || 50,
          discountPrice: data.discountPrice || 50,
          offer: data.offer || false,
          parking: data.parking || false,
          furnished: data.furnished || false,
        });
        setFetchingListing(false);
      } catch (error) {
        console.error(error);
        setFetchingListing(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  // Upload images
  const handleImageSubmit = async () => {
    if (files.length === 0) {
      setImageUploadError('Please select at least one image');
      return;
    }
    if (files.length + formData.imageUrls.length > 7) {
      setImageUploadError('You can only upload 7 images per listing');
      return;
    }

    setUploading(true);
    setImageUploadError(false);

    try {
      const formPayload = new FormData();
      for (let i = 0; i < files.length; i++) {
        formPayload.append('files', files[i]);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formPayload,
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setImageUploadError('Image upload failed (2 mb max per image)');
        setUploading(false);
        return;
      }

      const urls = data.files.map(
        (f) => `http://localhost:5000/uploads/listings/${f.filename}`
      );

      setFormData({
        ...formData,
        imageUrls: formData.imageUrls.concat(urls),
      });
      setImageUploadError(false);
    } catch (err) {
      setImageUploadError('Image upload failed (2 mb max per image)');
    } finally {
      setUploading(false);
    }
  };

  // Remove image
  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  // Handle input changes
  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;

    if (id === 'sale' || id === 'rent') {
      setFormData({ ...formData, type: id });
    } else if (id === 'parking' || id === 'furnished' || id === 'offer') {
      setFormData({ ...formData, [id]: checked });
    } else if (type === 'number' || type === 'text' || type === 'textarea') {
      setFormData({ ...formData, [id]: value });
    }
  };

  // Submit updated listing
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formData.imageUrls.length < 1) {
        return setError('You must upload at least one image');
      }
      if (+formData.regularPrice < +formData.discountPrice) {
        return setError('Discount price must be lower than regular price');
      }

      setLoading(true);
      setError(false);

      const bodyData = {
        ...formData,
        userRef: currentUser._id,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        regularPrice: Number(formData.regularPrice),
        type: formData.type,
        ...(formData.offer && { discountPrice: Number(formData.discountPrice) }),
        imageUrls: formData.imageUrls.map((url) =>
          url.startsWith('http') ? url : `${window.location.origin}${url}`
        ),
      };

      const res = await fetch(`/api/listing/update/${params.listingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || data.success === false) {
        setError(data.message || 'Failed to update listing');
        return;
      }

      navigate(`/listing/${data._id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  if (fetchingListing) {
    return (
      <main className="p-3 max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-center my-7">Loading listing...</h1>
      </main>
    );
  }

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Update Listing</h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        {/* Left side inputs */}
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />

          {/* Type & Features */}
          <div className="flex gap-6 flex-wrap">
            {['sale', 'rent'].map((t) => (
              <div key={t} className="flex gap-2">
                <input
                  type="checkbox"
                  id={t}
                  className="w-5"
                  onChange={handleChange}
                  checked={formData.type === t}
                />
                <span>{t === 'sale' ? 'Sell' : 'Rent'}</span>
              </div>
            ))}
            {['parking', 'furnished', 'offer'].map((f) => (
              <div key={f} className="flex gap-2">
                <input
                  type="checkbox"
                  id={f}
                  className="w-5"
                  onChange={handleChange}
                  checked={formData[f]}
                />
                <span>{f.charAt(0).toUpperCase() + f.slice(1)}</span>
              </div>
            ))}
          </div>

          {/* Number inputs */}
          <div className="flex flex-wrap gap-6">
            {['bedrooms', 'bathrooms', 'regularPrice', 'discountPrice'].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <input
                  type="number"
                  id={n}
                  min="1"
                  max="10000000"
                  required
                  className="p-3 border border-gray-300 rounded-lg"
                  onChange={handleChange}
                  value={formData[n]}
                  disabled={n === 'discountPrice' && !formData.offer}
                />
                <p>
                  {n === 'bedrooms'
                    ? 'Beds'
                    : n === 'bathrooms'
                    ? 'Baths'
                    : n === 'regularPrice'
                    ? 'Regular price'
                    : 'Discounted price'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side images */}
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(e.target.files)}
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageSubmit}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          <p className="text-red-700 text-sm">{imageUploadError && imageUploadError}</p>

          {/* Preview images - vertical column */}
          {formData.imageUrls.length > 0 && (
            <div className="flex flex-col gap-3 mt-2">
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="relative group border rounded-lg overflow-hidden">
                  <img src={url} alt={`listing ${index}`} className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    Remove
                  </button>
                  {index === 0 && (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            disabled={loading || uploading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? 'Updating...' : 'Update listing'}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
