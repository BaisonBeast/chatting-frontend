import React from 'react';

const NotFound: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-red-500">404</h1>
                <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
                <p className="mt-2 text-gray-600">
                    Sorry, the page you are looking for does not exist.
                </p>
                <a href="/" className="mt-6 inline-block px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                    Go Back Home
                </a>
            </div>
        </div>
    );
};

export default NotFound;
