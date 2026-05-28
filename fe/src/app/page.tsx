"use client";

import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun,
  RefreshCw,
  User,
  Lock,
  Mail,
  Plus,
  Trash2,
  Pencil,
  LogOut,
  AlertCircle,
  X,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function BackendIntegration() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Authentication State
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Auth Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Data List & General State
  const [dataList, setDataList] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Custom Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'logout' | 'delete'>('logout');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('username');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(savedUser);
      fetchData(savedToken);
    }
  }, []);

  // Fetch data list from backend
  const fetchData = async (authToken: string) => {
    setDataLoading(true);
    setDataError(null);
    try {
      const response = await fetch(`${API_URL}/api/data`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setDataList(data);
    } catch (err: any) {
      setDataError(err.message || 'Error fetching data. Is backend running?');
    } finally {
      setDataLoading(false);
    }
  };

  // Handle Authentication (Login / Register)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const url = authMode === 'login' 
      ? `${API_URL}/api/auth/login` 
      : `${API_URL}/api/auth/register`;

    const body = authMode === 'login'
      ? { email, password }
      : { username, email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Authentication failed');
      }

      // Save token & user
      localStorage.setItem('token', resData.token);
      localStorage.setItem('username', resData.username);
      setToken(resData.token);
      setCurrentUser(resData.username);
      
      // Clear forms
      setEmail('');
      setPassword('');
      setUsername('');
      
      // Load data
      fetchData(resData.token);
    } catch (err: any) {
      setAuthError(err.message || 'Connection failed. Is backend running on port 5001?');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Create Data (POST)
  const handleCreateData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!addTitle || !addDescription) return;

    setAddLoading(true);
    setDataError(null);

    try {
      const response = await fetch(`${API_URL}/api/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: addTitle, description: addDescription })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to create data');
      }

      // Append new data to list and close modal
      setDataList([resData, ...dataList]);
      setAddTitle('');
      setAddDescription('');
      setIsAddModalOpen(false);
    } catch (err: any) {
      setDataError(err.message || 'Error creating data');
    } finally {
      setAddLoading(false);
    }
  };

  // Handle Update/Edit Data (PUT)
  const handleUpdateData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingItem) return;
    if (!editTitle || !editDescription) return;

    setEditLoading(true);
    setDataError(null);

    try {
      const response = await fetch(`${API_URL}/api/data/${editingItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: editTitle, description: editDescription })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to update data');
      }

      // Update item in local list and close modal
      setDataList(dataList.map(item => item._id === editingItem._id ? resData : item));
      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      setDataError(err.message || 'Error updating data');
    } finally {
      setEditLoading(false);
    }
  };

  // Trigger Delete Confirmation
  const handleDeleteData = (id: string) => {
    setPendingDeleteId(id);
    setConfirmAction('delete');
    setIsConfirmModalOpen(true);
  };

  // Actual Delete Data Operation
  const proceedDeleteData = async (id: string) => {
    if (!token) return;
    setDataError(null);

    try {
      const response = await fetch(`${API_URL}/api/data/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.message || 'Failed to delete data');
      }

      setDataList(dataList.filter(item => item._id !== id));
    } catch (err: any) {
      setDataError(err.message || 'Error deleting data');
    }
  };

  // Trigger Logout Confirmation
  const handleLogout = () => {
    setConfirmAction('logout');
    setIsConfirmModalOpen(true);
  };

  // Actual Logout Operation
  const proceedLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setCurrentUser(null);
    setDataList([]);
  };

  // Execute confirmed action from modal
  const executeConfirmAction = async () => {
    setIsConfirmModalOpen(false);
    if (confirmAction === 'delete' && pendingDeleteId) {
      await proceedDeleteData(pendingDeleteId);
      setPendingDeleteId(null);
    } else if (confirmAction === 'logout') {
      proceedLogout();
    }
  };

  // Open Edit Modal
  const openEditModal = (item: any) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setIsEditModalOpen(true);
  };

  const themeClasses = isDarkMode 
    ? 'bg-[#0b0f19] text-gray-100' 
    : 'bg-[#F9FAFB] text-gray-900';

  const cardClasses = isDarkMode
    ? 'bg-[#151c2c]/80 border-gray-800 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl'
    : 'bg-white/80 border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl';

  return (
    <div className={`min-h-screen p-4 sm:p-10 transition-colors duration-500 font-sans ${themeClasses}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Tugas Pertemuan 13
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              
            </p>
          </div>

          {/* Cyber-neon Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`
              relative group overflow-hidden p-3 rounded-2xl transition-all duration-300
              ${isDarkMode ? 'bg-gray-850 hover:bg-gray-800 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white shadow-sm hover:shadow-md'}
              hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] 
              active:scale-95
            `}
          >
            <div className={`
              absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
              bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl
            `} />
            <div className="relative flex items-center justify-center">
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-blue-400 transition-transform duration-500 rotate-0 group-hover:-rotate-12" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500 transition-transform duration-500 rotate-0 group-hover:rotate-90" />
              )}
            </div>
          </button>
        </header>

        {/* Main Content Dashboard - Now Full Width */}
        <div className={`rounded-3xl border p-6 sm:p-8 transition-all duration-300 ${cardClasses}`}>
          
          {!token ? (
            /* AUTHENTICATION TABPANEL */
            <div className="max-w-md mx-auto py-4">
              <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
                <button 
                  onClick={() => { setAuthMode('login'); setAuthError(null); }}
                  className={`flex-1 pb-3 text-sm font-semibold transition-all ${authMode === 'login' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}
                >
                  Login
                </button>
                <button 
                  onClick={() => { setAuthMode('register'); setAuthError(null); }}
                  className={`flex-1 pb-3 text-sm font-semibold transition-all ${authMode === 'register' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <h3 className="text-xl font-bold mb-2">
                  {authMode === 'login' ? 'Sign in to your Account' : 'Create an Account'}
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                  Tugas Membuat & Mengintegrasikan REST API dan JWT Auth
                </p>

                {authError && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {authMode === 'register' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">Username</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input 
                        type="text" 
                        placeholder="johndoe" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-[#0f1422] border-gray-800 text-white' : 'bg-white border-gray-200'}`}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input 
                      type="email" 
                      placeholder="john@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-[#0f1422] border-gray-800 text-white' : 'bg-white border-gray-200'}`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-[#0f1422] border-gray-800 text-white' : 'bg-white border-gray-200'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-550 dark:hover:text-gray-300 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md active:scale-98 transition-all disabled:opacity-50"
                >
                  {authLoading ? 'Signing in...' : authMode === 'login' ? 'Login' : 'Register'}
                </button>
              </form>
            </div>
          ) : (
            /* CRUD INTERACTIVE AREA */
            <div className="space-y-6">
              
              {/* Logged in User Bar */}
              <div className="flex justify-between items-center p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/30 dark:border-blue-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm uppercase">
                    {currentUser?.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Logged in as</p>
                    <h4 className="font-semibold text-sm">{currentUser}</h4>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border text-red-500 dark:text-red-400 transition-all ${isDarkMode ? 'bg-gray-850 hover:bg-gray-800 border-gray-800' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>

              {/* Data List (Read) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg sm:text-xl">Your Data Items (CRUD)</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => token && fetchData(token)}
                      className={`p-2 rounded-xl text-sm transition-all duration-300 active:scale-95 border ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
                      title="Refresh List"
                    >
                      <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg"
                    >
                      <Plus className="w-4 h-4" /> Add Data
                    </button>
                  </div>
                </div>

                {dataError && (
                  <div className="p-3.5 rounded-xl bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs">
                    {dataError}
                  </div>
                )}

                {dataLoading && dataList.length === 0 ? (
                  <div className="flex justify-center py-20">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : dataList.length === 0 ? (
                  <div className="text-center py-16 border border-dashed dark:border-gray-800 rounded-2xl">
                    <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No data found. Click "+ Add Data" to create one!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dataList.map((item, idx) => (
                      <div 
                        key={item._id || idx} 
                        className={`p-4 rounded-2xl border transition-all hover:scale-[1.005] flex justify-between items-center gap-4 ${isDarkMode ? 'bg-[#0f1422]/60 border-gray-800 hover:bg-[#0f1422]' : 'bg-gray-50/50 border-gray-150 hover:bg-gray-50'}`}
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm sm:text-base text-blue-600 dark:text-blue-400 truncate">{item.title}</h4>
                          <p className={`text-xs sm:text-sm mt-1 truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</p>
                        </div>
                        
                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => openEditModal(item)}
                            className={`p-2 rounded-xl transition-all active:scale-90 border hover:text-blue-600 ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-400' : 'bg-white border-gray-250 hover:bg-gray-50 text-gray-500'}`}
                            title="Edit Item"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteData(item._id)}
                            className={`p-2 rounded-xl transition-all active:scale-90 border hover:text-red-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-400' : 'bg-white border-gray-250 hover:bg-gray-50 text-gray-500'}`}
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ADD DATA MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl transition-transform duration-300 scale-100 ${isDarkMode ? 'bg-[#151c2c] border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add New Data</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className={`p-1.5 rounded-xl border transition-all ${isDarkMode ? 'bg-gray-850 hover:bg-gray-800 border-gray-800 text-gray-400' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-500'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateData} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Title</label>
                <input 
                  type="text" 
                  placeholder="Task or note title..." 
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-[#0f1422] border-gray-800 text-white' : 'bg-white border-gray-200'}`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Description</label>
                <textarea 
                  placeholder="Write details here..." 
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  required
                  rows={3}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-[#0f1422] border-gray-800 text-white' : 'bg-white border-gray-200'}`}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 border-gray-250 text-gray-700'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {addLoading ? 'Saving...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DATA MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl transition-transform duration-300 scale-100 ${isDarkMode ? 'bg-[#151c2c] border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Edit Data</h3>
              <button 
                onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}
                className={`p-1.5 rounded-xl border transition-all ${isDarkMode ? 'bg-gray-850 hover:bg-gray-800 border-gray-800 text-gray-400' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-500'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateData} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Title</label>
                <input 
                  type="text" 
                  placeholder="Task or note title..." 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-[#0f1422] border-gray-800 text-white' : 'bg-white border-gray-200'}`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Description</label>
                <textarea 
                  placeholder="Write details here..." 
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                  rows={3}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-[#0f1422] border-gray-800 text-white' : 'bg-white border-gray-200'}`}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 border-gray-250 text-gray-700'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {editLoading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl transition-transform duration-355 scale-100 ${isDarkMode ? 'bg-[#151c2c] border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-3 text-red-500 mb-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-bold">
                {confirmAction === 'delete' ? 'Delete Item?' : 'Log Out?'}
              </h3>
            </div>
            
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {confirmAction === 'delete' 
                ? 'Are you sure you want to delete this item? This action cannot be undone.'
                : 'Are you sure you want to log out of your account?'}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setIsConfirmModalOpen(false); setPendingDeleteId(null); }}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border ${isDarkMode ? 'bg-gray-850 hover:bg-gray-800 border-gray-800 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 border-gray-250 text-gray-700'}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmAction}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 bg-red-600 hover:bg-red-500 shadow-md hover:shadow-lg"
              >
                {confirmAction === 'delete' ? 'Delete' : 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
