
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
        <p className="mb-8 text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;