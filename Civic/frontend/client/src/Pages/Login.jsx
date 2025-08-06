import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Context/authContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const { login, register, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Slides for the left section
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      title: "Make Your Voice Heard",
      description: "Join thousands of citizens creating positive change in their communities."
    },
    {
      image: "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      title: "Connect with Local Leaders",
      description: "Build coalitions and partner with decision-makers for greater impact."
    },
    {
      image: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      title: "Track Your Impact",
      description: "See how your campaigns are making a difference with detailed analytics."
    }
  ];

  // Rotate slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Update form error from context error
  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (isLogin) {
      // Login mode
      if (!email || !password) {
        setFormError('Please enter both email and password');
        return;
      }
      
      const result = await login({ email, password });
      
      if (result.success) {
        navigate('/dashboard');
      }
    } else {
      // Register mode
      if (!fullName || !email || !password || !confirmPassword) {
        setFormError('Please fill out all fields');
        return;
      }
      
      if (password !== confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }
      
      if (password.length < 8) {
        setFormError('Password must be at least 8 characters long');
        return;
      }
      
      const result = await register({ fullName, email, password });
      
      if (result.success) {
        navigate('/dashboard');
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormError('');
  };

  const connectWallet = async () => {
    setIsConnectingWallet(true);
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to continue');
      }

      // Request account access
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      // Get the chain ID
      const network = await provider.getNetwork();
      const chainId = network.chainId;

      // Check if we're on the correct network (e.g., Ethereum Mainnet)
      if (chainId !== 1) { // 1 is Ethereum Mainnet
        try {
          // Request network switch to Ethereum Mainnet
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }], // '0x1' is Ethereum Mainnet
          });
        } catch (switchError) {
          // Handle network switch error
          throw new Error('Please switch to Ethereum Mainnet');
        }
      }

      setWalletAddress(address);
      
      // Sign a message to verify ownership
      const message = `Welcome to Civic Platform!\n\nPlease sign this message to verify your wallet ownership.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address: ${address}\nTimestamp: ${Date.now()}`;
      
      const signature = await signer.signMessage(message);
      
      // Here you can send the address and signature to your backend
      // for verification and login/registration
      const result = await login({
        walletAddress: address,
        signature: signature,
        message: message
      });

      if (result.success) {
        navigate('/dashboard');
      }

    } catch (error) {
      setFormError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnectingWallet(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Left Section - 60% - Visual Content */}
      <div className="hidden lg:block w-3/5 relative overflow-hidden">
        {/* Slide transition */}
        <motion.div 
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${slides[currentSlide].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/70"></div>
        </motion.div>
        
        {/* Logo and Branding */}
        <div className="absolute top-8 left-8 flex items-center z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="ml-2 text-2xl font-bold text-white">Civic Platform</span>
        </div>
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center px-12 z-10"
            >
              <h1 className="text-5xl font-bold text-white mb-6">{slides[currentSlide].title}</h1>
              <p className="text-xl text-white/90 max-w-lg mx-auto">{slides[currentSlide].description}</p>
            </motion.div>
          </AnimatePresence>
          
          {/* Slide indicators */}
          <div className="absolute bottom-28 left-0 right-0 flex justify-center space-x-2 mt-12">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentSlide ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Stats */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-12 text-white z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center"
          >
            <p className="text-3xl font-bold">10,000+</p>
            <p className="text-sm uppercase tracking-wider">Campaigns</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center"
          >
            <p className="text-3xl font-bold">250+</p>
            <p className="text-sm uppercase tracking-wider">Communities</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center"
          >
            <p className="text-3xl font-bold">5M+</p>
            <p className="text-sm uppercase tracking-wider">Citizens Engaged</p>
          </motion.div>
        </div>
      </div>
      
      {/* Right Section - 40% - Auth Form */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-2/5 flex flex-col bg-white text-black"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 lg:hidden">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h1 className="text-xl font-bold text-black ml-2">Civic Platform</h1>
          </div>
          <button 
            onClick={toggleMode} 
            className="px-4 py-2 text-sm font-medium text-black hover:text-gray-700 underline underline-offset-4"
          >
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </div>
        
        <div className="flex-grow flex flex-col justify-center px-10 lg:px-16 py-12">
          {/* Welcome text with animated gradient */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <h2 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              {isLogin ? 'Welcome Back' : 'Join Our Community'}
            </h2>
            <p className="text-gray-600">
              {isLogin 
                ? 'Sign in to continue your journey as a changemaker' 
                : 'Start making a difference in your community today'}
            </p>
          </motion.div>
          
          {/* Modern tab navigation with pill style */}
          <div className="mb-8 bg-gray-100 p-1 rounded-full flex">
            <motion.button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-full text-center text-sm font-medium relative transition-all duration-200 ease-in-out ${
                isLogin 
                  ? 'bg-white text-black shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              whileHover={!isLogin ? { scale: 1.02 } : {}}
              whileTap={!isLogin ? { scale: 0.98 } : {}}
            >
              Sign In
            </motion.button>
            <motion.button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-full text-center text-sm font-medium relative transition-all duration-200 ease-in-out ${
                !isLogin 
                  ? 'bg-white text-black shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              whileHover={isLogin ? { scale: 1.02 } : {}}
              whileTap={isLogin ? { scale: 0.98 } : {}}
            >
              Register
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {formError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{formError}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Full Name field - only for register mode */}
              {!isLogin && (
                <motion.div
                  key="fullName"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required={!isLogin}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm transition-all duration-200"
                      placeholder="John Doe"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email field */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </motion.div>

            {/* Password field */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                {isLogin && (
                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-gray-600 hover:text-black transition-colors duration-200">
                      Forgot password?
                    </Link>
                  </div>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {/* Confirm Password field - only for register mode */}
              {!isLogin && (
                <motion.div
                  key="confirmPassword"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required={!isLogin}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm transition-all duration-200"
                      placeholder="••••••••"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="pt-2"
            >
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200"
              >
                {isLogin ? 'Sign in' : 'Create account'}
              </motion.button>
            </motion.div>
          </form>

          {/* Social login */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mt-8"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <motion.button 
                whileHover={{ scale: 1.03, backgroundColor: "#f8f8f8" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545 10.239v3.821h5.445c-0.212 1.212-1.454 3.544-5.445 3.544-3.282 0-5.955-2.724-5.955-6.067s2.673-6.067 5.955-6.067c1.869 0 3.118 0.792 3.832 1.479l2.605-2.506c-1.675-1.565-3.842-2.513-6.437-2.513-5.322 0-9.617 4.318-9.617 9.607s4.295 9.607 9.617 9.607c5.545 0 9.228-3.901 9.228-9.396 0-0.635-0.063-1.111-0.151-1.607l-9.077-0.003z" />
                </svg>
                Google
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.03, backgroundColor: "#f8f8f8" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200"
              >
                <svg className="h-5 w-5 mr-2 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z" />
                </svg>
                Facebook
              </motion.button>
              <motion.button 
                onClick={connectWallet}
                disabled={isConnectingWallet}
                whileHover={{ scale: 1.03, backgroundColor: "#f8f8f8" }}
                whileTap={{ scale: 0.97 }}
                className="col-span-2 flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200"
              >
                {isConnectingWallet ? (
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <img src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" className="h-5 w-5 mr-2" alt="MetaMask" />
                )}
                {isConnectingWallet ? 'Connecting...' : 'Connect with MetaMask'}
              </motion.button>
            </div>
          </motion.div>
          
          {/* Footer for mobile view */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-center text-gray-500 text-xs lg:hidden"
          >
            <p>© 2025 Civic Platform. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;