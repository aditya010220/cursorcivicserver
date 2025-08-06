import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaVrCardboard, FaExpand, FaCompress, FaSearch, FaMapMarkerAlt, FaMap, FaTh, FaArrowLeft, FaArrowRight, FaArrowUp, FaArrowDown, FaSyncAlt, FaCompressArrowsAlt } from 'react-icons/fa';

// Create a singleton for the Google Maps API loading
// This prevents multiple API loads which cause many of your errors
let googleMapsApiLoaded = false;
let loadingPromise = null;

const loadGoogleMapsApi = () => {
  // Return existing promise if already loading
  if (loadingPromise) return loadingPromise;
  
  // Return immediately if already loaded
  if (googleMapsApiLoaded) return Promise.resolve();
  
  loadingPromise = new Promise((resolve, reject) => {
    try {
      // Check if the API is already loaded (global google object exists)
      if (window.google && window.google.maps) {
        googleMapsApiLoaded = true;
        return resolve();
      }

      // Create callback for async loading
      window.initGoogleMapsApi = () => {
        googleMapsApiLoaded = true;
        resolve();
      };

      // Create script element
      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsApi`;
      script.async = true;
      script.defer = true;
      
      script.onerror = (error) => {
        reject(new Error('Google Maps failed to load'));
      };

      document.head.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });
  
  return loadingPromise;
};

const StreetViewModal = ({ location, isOpen, onClose }) => {
  const streetViewRef = useRef(null);
  const mapRef = useRef(null);
  const panoramaRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVRMode, setIsVRMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [inputLocation, setInputLocation] = useState('');
  const [showInputForm, setShowInputForm] = useState(true);
  const [activeLocation, setActiveLocation] = useState('');
  const [viewMode, setViewMode] = useState('street'); // 'street' or 'map'
  const [vrAvailable, setVrAvailable] = useState(false);
  const [mockVRActive, setMockVRActive] = useState(false);
  const [vrRotation, setVrRotation] = useState({ heading: 0, pitch: 0 });
  const [vrZoom, setVrZoom] = useState(1);
  
  // Check if VR is available
  useEffect(() => {
    const checkVRAvailability = async () => {
      if ('xr' in navigator) {
        try {
          const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
          setVrAvailable(isSupported);
        } catch (error) {
          console.log('VR not available:', error);
          setVrAvailable(false);
        }
      } else {
        setVrAvailable(false);
      }
    };
    
    checkVRAvailability();
  }, []);
  
  // Clear old instances when component unmounts
  useEffect(() => {
    return () => {
      if (panoramaRef.current && window.google && window.google.maps) {
        window.google.maps.event.clearInstanceListeners(panoramaRef.current);
      }
    };
  }, []);
  
  // Set initial location when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputLocation(location || '');
      setShowInputForm(true);
      setErrorMessage('');
      setViewMode('street');
    }
  }, [isOpen, location]);
  
  // Handle form submission
  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (!inputLocation.trim()) return;
    
    setShowInputForm(false);
    setActiveLocation(inputLocation);
    
    // Try to show street view first, fallback to map if needed
    loadLocationView(inputLocation);
  };
  
  // Main function to load the view
  const loadLocationView = async (locationString) => {
    if (!locationString) return;
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Load Google Maps API
      await loadGoogleMapsApi();
      
      // Get coordinates from location
      const coordinates = await geocodeLocation(locationString);
      
      if (viewMode === 'street') {
        // Try to load Street View first
        try {
          await loadStreetView(coordinates);
        } catch (error) {
          console.log("Street View failed, falling back to map view", error);
          setViewMode('map');
          await loadMapView(coordinates);
        }
      } else {
        // Load map view
        await loadMapView(coordinates);
      }
      
    } catch (error) {
      console.error('Error loading location view:', error);
      setErrorMessage(error.message || 'Failed to load view');
      setIsLoading(false);
    }
  };
  
  // Function to geocode location string to coordinates
  const geocodeLocation = (address) => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          resolve({ 
            lat: lat(), 
            lng: lng(),
            formattedAddress: results[0].formatted_address 
          });
        } else if (status === 'OVER_QUERY_LIMIT') {
          reject(new Error('Google Maps API limit exceeded. Please try again later.'));
        } else {
          reject(new Error('Location not found. Please enter a more specific address.'));
        }
      });
    });
  };
  
  // Function to load Street View
  const loadStreetView = async (coordinates) => {
    return new Promise((resolve, reject) => {
      // Create Street View service instance
      const streetViewService = new window.google.maps.StreetViewService();
      
      // Look for nearby Street View panorama
      streetViewService.getPanorama(
        {
          location: coordinates,
          radius: 100, // Look for StreetView panoramas within 100m
          preference: 'nearest'
        },
        (data, status) => {
          if (status === 'OK') {
            try {
              // Clean up any existing panorama
              if (panoramaRef.current) {
                window.google.maps.event.clearInstanceListeners(panoramaRef.current);
              }
              
              // Create new panorama
              panoramaRef.current = new window.google.maps.StreetViewPanorama(
                streetViewRef.current,
                {
                  position: data.location.latLng,
                  pov: { heading: 0, pitch: 0 },
                  zoom: 1,
                  addressControl: true,
                  fullscreenControl: false,
                  motionTracking: false,
                  motionTrackingControl: false,
                  linksControl: true,
                }
              );
              
              // When panorama is ready
              window.google.maps.event.addListenerOnce(panoramaRef.current, 'status_changed', () => {
                setIsLoading(false);
                resolve();
              });
              
              // Set updated location from StreetView
              setActiveLocation(coordinates.formattedAddress);
            } catch (error) {
              console.error("Error setting up panorama:", error);
              reject(error);
            }
          } else {
            reject(new Error('Street View not available for this location'));
          }
        }
      );
    });
  };
  
  // Function to load regular map view
  const loadMapView = async (coordinates) => {
    try {
      // Create map instance
      const map = new window.google.maps.Map(mapRef.current, {
        center: coordinates,
        zoom: 16,
        mapTypeId: 'roadmap',
        fullscreenControl: false
      });
      
      // Add marker for the location
      new window.google.maps.Marker({
        position: coordinates,
        map: map,
        animation: window.google.maps.Animation.DROP
      });
      
      setIsLoading(false);
      setActiveLocation(coordinates.formattedAddress);
      return Promise.resolve();
    } catch (error) {
      setIsLoading(false);
      return Promise.reject(error);
    }
  };
  
  // Toggle between Street View and Map
  const toggleViewMode = async () => {
    if (isLoading) return;
    
    const newMode = viewMode === 'street' ? 'map' : 'street';
    setViewMode(newMode);
    setIsLoading(true);
    
    try {
      if (newMode === 'street') {
        await loadStreetView({ lat: panoramaRef.current.getPosition().lat(), lng: panoramaRef.current.getPosition().lng() });
      } else {
        await loadMapView({ lat: panoramaRef.current.getPosition().lat(), lng: panoramaRef.current.getPosition().lng() });
      }
    } catch (error) {
      console.error("Error toggling view mode:", error);
      setErrorMessage(`Could not switch to ${newMode === 'street' ? 'Street View' : 'Map View'}`);
      setIsLoading(false);
      // Revert back to previous mode
      setViewMode(viewMode);
    }
  };
  
  const toggleFullscreen = () => {
    const element = viewMode === 'street' ? streetViewRef.current : mapRef.current;
    
    if (!document.fullscreenElement) {
      element.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  const toggleMockVRMode = () => {
    if (mockVRActive) {
      // Exit mock VR mode
      setMockVRActive(false);
      
      // Reset panorama to normal view if it exists
      if (panoramaRef.current) {
        panoramaRef.current.setPov({
          heading: vrRotation.heading,
          pitch: vrRotation.pitch
        });
        panoramaRef.current.setZoom(1);
      }
    } else {
      // Enter mock VR mode
      setMockVRActive(true);
      
      if (panoramaRef.current) {
        // Store current POV for when we exit
        const pov = panoramaRef.current.getPov();
        setVrRotation({
          heading: pov.heading,
          pitch: pov.pitch
        });
      }
      
      // Show instructions for mock VR
      alert('Mock VR Mode: Use arrow controls to look around and experience a simulated VR view.');
    }
  };

  const rotateVRView = (direction, amount = 15) => {
    if (!mockVRActive || !panoramaRef.current) return;
    
    const currentPov = panoramaRef.current.getPov();
    let newHeading = currentPov.heading;
    let newPitch = currentPov.pitch;
    
    switch (direction) {
      case 'left':
        newHeading = (currentPov.heading - amount) % 360;
        break;
      case 'right':
        newHeading = (currentPov.heading + amount) % 360;
        break;
      case 'up':
        newPitch = Math.min(currentPov.pitch + amount, 90);
        break;
      case 'down':
        newPitch = Math.max(currentPov.pitch - amount, -90);
        break;
      default:
        break;
    }
    
    setVrRotation({ heading: newHeading, pitch: newPitch });
    panoramaRef.current.setPov({
      heading: newHeading,
      pitch: newPitch
    });
  };

  const adjustVRZoom = (increase) => {
    if (!mockVRActive || !panoramaRef.current) return;
    
    const newZoom = increase ? 
      Math.min(vrZoom + 0.5, 3) : 
      Math.max(vrZoom - 0.5, 0.5);
    
    setVrZoom(newZoom);
    panoramaRef.current.setZoom(newZoom);
  };

  const enterVRMode = async () => {
    if (isLoading || viewMode !== 'street') return;
    
    // If real VR is available, try to use it
    if (vrAvailable) {
      try {
        setIsVRMode(true);
        
        // Request VR session
        const session = await navigator.xr.requestSession('immersive-vr', {
          optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
        });
        
        session.addEventListener('end', () => {
          setIsVRMode(false);
        });
        
        // For a real implementation, we would render the panorama in WebXR here
        // Since that's complex, we'll fall back to mock VR mode
        console.log('Real VR session started, but rendering not implemented');
        session.end(); // End the session as we can't actually render to it
        
        // Fall back to mock VR mode
        toggleMockVRMode();
        
      } catch (error) {
        console.error('Failed to start VR session, falling back to mock VR:', error);
        setIsVRMode(false);
        
        // Fall back to mock VR mode
        toggleMockVRMode();
      }
    } else {
      // No real VR available, use mock VR
      toggleMockVRMode();
    }
  };

  const handleChangeLocation = () => {
    setShowInputForm(true);
  };
  
  const handleCloseModal = () => {
    // Clean up resources
    if (panoramaRef.current && window.google && window.google.maps) {
      window.google.maps.event.clearInstanceListeners(panoramaRef.current);
    }
    
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    
    // Call the parent's onClose function
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="relative bg-white rounded-lg w-full max-w-5xl h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {showInputForm ? 'Enter Location to Visualize' : `Viewing: ${activeLocation}`}
          </h3>
          <div className="flex items-center space-x-2">
            {!showInputForm && !errorMessage && (
              <>
                <button 
                  onClick={handleChangeLocation}
                  className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md"
                  title="Change Location"
                >
                  <FaSearch size={14} className="mr-1" />
                  <span>Change Location</span>
                </button>
                
                <button 
                  onClick={toggleViewMode}
                  className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md"
                  title={`Switch to ${viewMode === 'street' ? 'Map' : 'Street'} View`}
                  disabled={isLoading}
                >
                  {viewMode === 'street' ? (
                    <>
                      <FaMap size={14} className="mr-1" />
                      <span>Map View</span>
                    </>
                  ) : (
                    <>
                      <FaVrCardboard size={14} className="mr-1" />
                      <span>Street View</span>
                    </>
                  )}
                </button>
                
                {/* VR Mode Button (only shown in Street View and when available) */}
                {viewMode === 'street' && vrAvailable && (
                  <button
                    onClick={enterVRMode}
                    disabled={isLoading || isVRMode}
                    className={`flex items-center px-3 py-1.5 rounded-md text-white ${
                      isLoading || isVRMode ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                    title="Enter VR Mode"
                  >
                    <FaVrCardboard size={14} className="mr-1" />
                    <span>{isVRMode ? 'In VR' : 'VR Mode'}</span>
                  </button>
                )}
                
                <button 
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full hover:bg-gray-100"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  disabled={isLoading}
                >
                  {isFullscreen ? <FaCompress /> : <FaExpand />}
                </button>
              </>
            )}
            <button 
              onClick={handleCloseModal}
              className="p-2 rounded-full hover:bg-gray-100 hover:bg-red-100 hover:text-red-600 transition-colors"
              title="Close"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>
        
        {/* Location Input Form */}
        {showInputForm ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="w-full max-w-md">
              <form onSubmit={handleLocationSubmit} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-6">
                  <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">
                    Enter a specific location to visualize:
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <input 
                      id="location"
                      type="text" 
                      value={inputLocation} 
                      onChange={(e) => setInputLocation(e.target.value)}
                      className="pl-10 shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                      placeholder="e.g. 123 Main St, City, State"
                      autoFocus
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Enter a detailed address for the best results.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={!inputLocation.trim()}
                  >
                    Visualize Now
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="relative h-full">
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-gray-600">Loading {viewMode === 'street' ? 'Street View' : 'Map'}...</p>
                </div>
              </div>
            )}
            
            {/* Error message */}
            {errorMessage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                <div className="text-red-500 text-xl mb-2">⚠️</div>
                <p className="text-gray-800 mb-4">{errorMessage}</p>
                <button
                  onClick={handleChangeLocation}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Try Another Location
                </button>
              </div>
            )}
            
            {/* View Containers */}
            <div className="relative w-full h-full">
              {/* Street View Container */}
              <div 
                ref={streetViewRef} 
                className={`absolute inset-0 transition-opacity duration-300 ${viewMode === 'street' ? 'opacity-100 z-[1]' : 'opacity-0 z-0'}`}
              />
              
              {/* Map View Container */}
              <div 
                ref={mapRef} 
                className={`absolute inset-0 transition-opacity duration-300 ${viewMode === 'map' ? 'opacity-100 z-[1]' : 'opacity-0 z-0'}`}
              />
            </div>
            
            {/* VR Mode Indicator */}
            {isVRMode && (
              <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full z-20">
                <div className="flex items-center">
                  <FaVrCardboard className="mr-1" />
                  <span>VR Mode Active</span>
                </div>
              </div>
            )}
            
            {/* Bottom Controls Bar */}
            {!isLoading && !errorMessage && (
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
                {/* Instructions */}
                <div className="bg-black/50 text-white p-3 rounded-md backdrop-blur-sm z-20">
                  <p className="text-sm">
                    {viewMode === 'street' ? (
                      <>
                        <span className="font-bold">Controls:</span> Click and drag to look around. 
                        Double click to move forward. Use arrow keys to navigate. 
                        {vrAvailable && ' Click "VR Mode" to experience in virtual reality.'}
                      </>
                    ) : (
                      <>
                        <span className="font-bold">Controls:</span> Click and drag to move the map. 
                        Use the mouse wheel to zoom. Click the Street View button to try Street View for this location.
                      </>
                    )}
                  </p>
                </div>
                
                {/* Mobile Controls (for small screens) */}
                <div className="md:hidden flex justify-center gap-2">
                  <button 
                    onClick={handleChangeLocation}
                    className="flex-1 bg-white/80 hover:bg-white py-2 rounded-md flex items-center justify-center"
                  >
                    <FaSearch size={14} className="mr-2" />
                    <span>Change</span>
                  </button>
                  
                  <button 
                    onClick={toggleViewMode}
                    className="flex-1 bg-white/80 hover:bg-white py-2 rounded-md flex items-center justify-center"
                  >
                    {viewMode === 'street' ? <FaMap size={14} className="mr-2" /> : <FaTh size={14} className="mr-2" />}
                    <span>{viewMode === 'street' ? 'Map' : 'Street'}</span>
                  </button>
                  
                  {viewMode === 'street' && vrAvailable && (
                    <button 
                      onClick={enterVRMode}
                      className="flex-1 bg-indigo-600/90 hover:bg-indigo-600 text-white py-2 rounded-md flex items-center justify-center"
                    >
                      <FaVrCardboard size={14} className="mr-2" />
                      <span>VR</span>
                    </button>
                  )}
                  
                  <button 
                    onClick={handleCloseModal}
                    className="flex-1 bg-red-500/80 hover:bg-red-500 text-white py-2 rounded-md flex items-center justify-center"
                  >
                    <FaTimes size={14} className="mr-2" />
                    <span>Close</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Mock VR Controls Overlay */}
            {mockVRActive && viewMode === 'street' && !isLoading && !errorMessage && (
              <div className="absolute inset-0 pointer-events-none z-30">
                {/* VR effect overlay - creates a split screen effect */}
                <div className="absolute inset-0 flex">
                  <div className="w-1/2 border-r-2 border-black/50"></div>
                  <div className="w-1/2 border-l-2 border-black/50"></div>
                </div>
                
                {/* Mock VR Controls */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/70 rounded-lg p-3 flex flex-col items-center pointer-events-auto">
                  <div className="text-white text-center mb-2">VR Navigation Controls</div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button className="bg-transparent w-10 h-10"></button>
                    <button 
                      onClick={() => rotateVRView('up')}
                      className="bg-gray-700 hover:bg-gray-600 text-white w-10 h-10 rounded flex items-center justify-center"
                    >
                      <FaArrowUp />
                    </button>
                    <button className="bg-transparent w-10 h-10"></button>
                    
                    <button 
                      onClick={() => rotateVRView('left')}
                      className="bg-gray-700 hover:bg-gray-600 text-white w-10 h-10 rounded flex items-center justify-center"
                    >
                      <FaArrowLeft />
                    </button>
                    <button 
                      onClick={() => toggleMockVRMode()}
                      className="bg-red-700 hover:bg-red-600 text-white w-10 h-10 rounded flex items-center justify-center"
                    >
                      <FaCompressArrowsAlt />
                    </button>
                    <button 
                      onClick={() => rotateVRView('right')}
                      className="bg-gray-700 hover:bg-gray-600 text-white w-10 h-10 rounded flex items-center justify-center"
                    >
                      <FaArrowRight />
                    </button>
                    
                    <button 
                      onClick={() => adjustVRZoom(false)}
                      className="bg-gray-700 hover:bg-gray-600 text-white w-10 h-10 rounded flex items-center justify-center text-lg"
                    >
                      -
                    </button>
                    <button 
                      onClick={() => rotateVRView('down')}
                      className="bg-gray-700 hover:bg-gray-600 text-white w-10 h-10 rounded flex items-center justify-center"
                    >
                      <FaArrowDown />
                    </button>
                    <button 
                      onClick={() => adjustVRZoom(true)}
                      className="bg-gray-700 hover:bg-gray-600 text-white w-10 h-10 rounded flex items-center justify-center text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* VR Mode indicator */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full">
                  <div className="flex items-center">
                    <FaVrCardboard className="mr-2" />
                    <span>VR Mode Active</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Close button in corner for easy access */}
      <button
        onClick={handleCloseModal}
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
        aria-label="Close"
      >
        <FaTimes size={20} />
      </button>
    </div>
  );
};

export default StreetViewModal;