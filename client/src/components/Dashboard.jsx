import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import QRCode from 'react-qr-code';

export default function Dashboard() {
  const [showQR, setShowQR] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [urls, setUrls] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Configure axios defaults
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  const handleQRCode = (originalUrl) => {
    setQrValue(originalUrl);
    setShowQR(true);
  };

  const handleLogout = async () => {
    try {
      await axios.delete('http://localhost:3000/api/auth/logout');
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const fetchUrls = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/url/user-urls');
      if (response.data) {
        setUrls(response.data);
      }
    } catch (error) {
      console.error('Error fetching URLs:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUrls();
    }
  }, [token]);

  const createShortUrl = async (e) => {
    e.preventDefault();
    try {
      console.log(token);
      const response = await axios.post('http://localhost:3000/api/url/shorten', 
        { url: newUrl },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setNewUrl('');
      fetchUrls();
    } catch (error) {
      console.error('Error creating short URL:', error);
    }
  };



  const deleteUrl = async (shortUrl) => {
    try {
      await axios.delete(`http://localhost:3000/api/url/${shortUrl}`);
      setUrls(urls.filter(url => url.short_url !== shortUrl));
    } catch (error) {
      console.error('Error deleting URL:', error);
    }
  };

  if (!token) {
    return <div>Please log in to view your dashboard</div>;
  }

  return (
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">URL Shortener Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      
      <form onSubmit={createShortUrl} className="mb-8">
        <div className="flex gap-4">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Enter URL to shorten"
            required
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Shorten URL
          </button>
        </div>
      </form>

      {urls.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No shortened URLs yet</p>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Original URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Short URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
        {urls.map((url) => (
          <tr key={url._id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {url.original_url}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
              <a 
                href={`http://localhost:3000/api/url/${url.short_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {url.short_url}
              </a>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-4">
              <button
                onClick={() => handleQRCode(url.original_url)}
                className="text-blue-600 hover:text-blue-900"
              >
                QR Code
              </button>
              <button
                onClick={() => deleteUrl(url.short_url)}
                className="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
          </table>
        </div>
        )}
        {showQR && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <div className="flex flex-col items-center space-y-4">
              <QRCode value={qrValue} size={256} />
              <button
                onClick={() => setShowQR(false)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}