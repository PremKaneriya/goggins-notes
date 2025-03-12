'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Loader2, ArrowLeft, LogOut, Phone, User, Mail, Save, 
  Camera, Bell, Shield, CreditCard, HelpCircle, Trash2, AlertTriangle
} from 'lucide-react';

interface UserProfile {
  name: string;
  avatar: string;
  email: string;
  id: string;
  phoneNumber: string;
  totalNotesCreated?: number;
}

const defaultAvatar = '/default-avatar.png';

export default function AccountSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    avatar: defaultAvatar,
    email: '',
    id: '',
    phoneNumber: '',
  });

  const hasValidAvatar = profile.avatar && profile.avatar !== defaultAvatar && !avatarError;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/profile');
        setProfile({
          name: response.data.name,
          avatar: response.data.avatar || defaultAvatar,
          email: response.data.email,
          id: response.data.id,
          phoneNumber: response.data.phoneNumber || '',
          totalNotesCreated: response.data.totalNotesCreated
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfile((prev) => ({
            ...prev,
            avatar: event.target?.result as string,
          }));
          setAvatarError(false);
        }
      };
      reader.readAsDataURL(file);
      
      toast.success('Avatar updated for preview. Save changes to confirm.');
    } catch (error) {
      console.error('Failed to update avatar:', error);
      toast.error('Failed to update avatar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      
      const updateData = {
        firstName: profile.name,
        avatar: profile.avatar,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
      };
      
      await axios.put('/api/profile/account-settings', updateData);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    // Implement logout functionality
    router.push('/login');
  };

  const handleDeleteConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteConfirmation(e.target.value);
  };

  const handleInitiateDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion');
      return;
    }
    
    try {
      setIsDeleting(true);
      
      await axios.patch('/api/profile/account-settings/delete-account');
      
      toast.success('Your account has been successfully deleted');
      
      // Redirect to logout or home page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading your account settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/profileinnotes" className="flex items-center text-sm text-gray-600 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Profile</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* User profile card */}
              <div className="px-6 py-6 border-b border-gray-100">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="relative group mb-4">
                    <div className="w-24 h-24 rounded-full relative overflow-hidden border-4 border-white shadow-md">
                      {hasValidAvatar ? (
                        <Image 
                          src={profile.avatar} 
                          alt="Profile picture" 
                          fill
                          className="object-cover"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <Image
                          src={defaultAvatar}
                          alt="Default avatar" 
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <label 
                      htmlFor="avatar-upload" 
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-6 h-6" />
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{profile.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{profile.email}</p>
                  
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    Active Account
                  </div>
                  
                  {profile.totalNotesCreated !== undefined && (
                    <div className="mt-4 text-sm text-gray-500">
                      <span className="font-semibold text-gray-800">{profile.totalNotesCreated}</span> notes created
                    </div>
                  )}
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="p-4">
                <ul className="space-y-1">
                  <li>
                    <button 
                      onClick={() => setActiveTab('profile')}
                      className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'profile' 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <User className="w-5 h-5 mr-3" />
                      Profile
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('help')}
                      className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'help' 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <HelpCircle className="w-5 h-5 mr-3" />
                      Help & Support
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('delete-account')}
                      className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'delete-account' 
                          ? 'bg-red-50 text-red-700' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="w-5 h-5 mr-3" />
                      Delete Account
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Profile Information</h2>
                    <p className="text-sm text-gray-500 mt-1">Update your account profile information and email address.</p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={profile.name}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-colors text-gray-900"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Phone Number Field */}
                    <div className="space-y-2">
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                        Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={profile.phoneNumber}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-colors text-gray-900"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        This will be used for account recovery and important notifications.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end space-x-4">
                  <Link 
                    href="/profileinnotes" 
                    className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
            
            {activeTab === 'delete-account' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">Delete Account</h2>
                  <p className="text-sm text-gray-500 mt-1">Permanently delete your account and all associated data.</p>
                </div>
                
                <div className="p-6">
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Warning: This action cannot be undone</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>
                            When you delete your account, all of your notes, personal information, and account history will be permanently removed from our system.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!showDeleteConfirmation ? (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-6">
                        Are you sure you want to delete your account? This action is permanent and cannot be reversed.
                      </p>
                      <button
                        type="button"
                        onClick={handleInitiateDelete}
                        className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                      >
                        Delete My Account
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleDeleteAccount}>
                      <p className="text-sm text-gray-700 mb-4">
                        To confirm deletion, please type <strong>DELETE</strong> in the field below:
                      </p>
                      <div className="mb-6">
                        <input
                          type="text"
                          value={deleteConfirmation}
                          onChange={handleDeleteConfirmationChange}
                          className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 transition-colors text-gray-900"
                          placeholder="Type DELETE to confirm"
                          required
                        />
                      </div>
                      
                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirmation(false)}
                          className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
                          disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            'Permanently Delete Account'
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
            
            {(activeTab !== 'profile' && activeTab !== 'delete-account') && (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="py-12">
                  <div className="bg-gray-50 inline-flex p-4 rounded-full mb-4">
                    {activeTab === 'notifications' && <Bell className="w-8 h-8 text-indigo-600" />}
                    {activeTab === 'security' && <Shield className="w-8 h-8 text-indigo-600" />}
                    {activeTab === 'billing' && <CreditCard className="w-8 h-8 text-indigo-600" />}
                    {activeTab === 'help' && <HelpCircle className="w-8 h-8 text-indigo-600" />}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {activeTab === 'notifications' && 'Notification Settings'}
                    {activeTab === 'security' && 'Security Settings'}
                    {activeTab === 'billing' && 'Billing Information'}
                    {activeTab === 'help' && 'Help & Support'}
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    This section is currently under development. Check back soon for updates!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}