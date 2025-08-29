import React, { useState, useEffect } from 'react';
import { UserPlusIcon, UsersIcon, MailIcon, XIcon, CheckIcon, ClockIcon, Loader2Icon } from 'lucide-react';
import { dataService } from '../../lib/dataService';
import { supabase } from '../../lib/supabase';

interface Collaborator {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'manager' | 'worker' | 'viewer';
  status: 'active' | 'pending' | 'invited';
  invited_at?: string;
  joined_at?: string;
}

interface Invitation {
  id: string;
  email: string;
  role: 'manager' | 'worker' | 'viewer';
  status: 'pending' | 'accepted' | 'expired';
  invited_at: string;
  expires_at: string;
}

export const Collaborators: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'team' | 'invitations'>('team');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'worker' as 'manager' | 'worker' | 'viewer',
    message: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Starting collaboration data load...');
      
      // Step 1: Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 User check:', user ? 'Logged in' : 'Not logged in');
      
      if (!user) {
        setError('❌ You need to log in first');
        return;
      }

      // Step 2: Test if we can access the collaborators table
      console.log('🗄️ Testing database access...');
      const { data: testData, error: testError } = await supabase
        .from('collaborators')
        .select('*')
        .limit(1);
      
      console.log('📊 Database test:', testError ? `❌ Error: ${testError.message}` : '✅ Success');
      
      if (testError) {
        setError(`❌ Database error: ${testError.message}`);
        return;
      }

      // Step 3: Load actual data
      console.log('📥 Loading collaborators and invitations...');
      const [collaboratorsResult, invitationsResult] = await Promise.all([
        dataService.collaborators.getAll(),
        dataService.invitations.getAll()
      ]);

      console.log('👥 Collaborators result:', collaboratorsResult.error ? `❌ ${collaboratorsResult.error}` : `✅ Found ${collaboratorsResult.data?.length || 0} collaborators`);
      console.log('📧 Invitations result:', invitationsResult.error ? `❌ ${invitationsResult.error}` : `✅ Found ${invitationsResult.data?.length || 0} invitations`);

      // Handle collaborators
      if (collaboratorsResult.error) {
        setError(`❌ Failed to load team members: ${collaboratorsResult.error}`);
      } else if (collaboratorsResult.data) {
        const transformedCollaborators = collaboratorsResult.data.map((item: any) => ({
          id: item.id,
          email: item.collaborator_email || '',
          name: item.collaborator_name || 'Unknown User',
          role: item.role,
          status: item.status,
          joined_at: item.joined_at,
          invited_at: item.invited_at
        }));
        setCollaborators(transformedCollaborators);
      }

      // Handle invitations
      if (invitationsResult.error) {
        setError(`❌ Failed to load invitations: ${invitationsResult.error}`);
      } else if (invitationsResult.data) {
        const transformedInvitations = invitationsResult.data.map((item: any) => ({
          id: item.id,
          email: item.email,
          role: item.role,
          status: item.status,
          invited_at: item.invited_at,
          expires_at: item.expires_at
        }));
        setInvitations(transformedInvitations);
      }

      console.log('✅ Data loading completed successfully!');
    } catch (error) {
      console.error('💥 Unexpected error:', error);
      setError(`❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const invitation = {
        email: inviteData.email,
        role: inviteData.role,
        invited_by: user.id,
        message: inviteData.message || null
      };

      const result = await dataService.invitations.send(invitation);
      if (result.error) {
        setError(result.error);
        return;
      }

      await loadData();
      
      setInviteData({
        email: '',
        role: 'worker',
        message: ''
      });
      setShowInviteForm(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
      setError('Failed to send invitation');
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      const result = await dataService.collaborators.remove(collaboratorId);
      if (result.error) {
        setError(result.error);
        return;
      }
      await loadData();
    } catch (error) {
      console.error('Error removing collaborator:', error);
      setError('Failed to remove collaborator');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const result = await dataService.invitations.cancel(invitationId);
      if (result.error) {
        setError(result.error);
        return;
      }
      await loadData();
    } catch (error) {
      console.error('Error canceling invitation:', error);
      setError('Failed to cancel invitation');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'worker': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckIcon size={16} className="text-green-500" />;
      case 'pending': return <ClockIcon size={16} className="text-yellow-500" />;
      case 'invited': return <MailIcon size={16} className="text-blue-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="pb-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">Collaborators</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2Icon className="animate-spin h-8 w-8 text-green-600 mr-3" />
          <p className="text-gray-600">Loading collaboration data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">Collaborators</h1>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={loadData}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">Collaborators</h1>
        <button
          onClick={() => setShowInviteForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <UserPlusIcon size={18} className="mr-2" />
          Invite
        </button>
      </div>

      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('team')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'team' 
              ? 'bg-white text-green-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <UsersIcon size={16} className="inline mr-2" />
          Team ({collaborators.length})
        </button>
        <button
          onClick={() => setActiveTab('invitations')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'invitations' 
              ? 'bg-white text-green-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MailIcon size={16} className="inline mr-2" />
          Invitations ({invitations.length})
        </button>
      </div>

      {activeTab === 'team' && (
        <div className="space-y-4">
          {collaborators.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UsersIcon size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No team members yet</p>
              <p className="text-sm">Invite fellow farmers to collaborate</p>
            </div>
          ) : (
            collaborators.map(collaborator => (
              <div key={collaborator.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 font-medium">
                        {collaborator.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{collaborator.name}</h3>
                      <p className="text-sm text-gray-500">{collaborator.email}</p>
                      <div className="flex items-center mt-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(collaborator.role)}`}>
                          {collaborator.role}
                        </span>
                        <span className="ml-2 flex items-center text-xs text-gray-500">
                          {getStatusIcon(collaborator.status)}
                          <span className="ml-1 capitalize">{collaborator.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  {collaborator.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <XIcon size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'invitations' && (
        <div className="space-y-4">
          {invitations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MailIcon size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No pending invitations</p>
            </div>
          ) : (
            invitations.map(invitation => (
              <div key={invitation.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <MailIcon size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{invitation.email}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(invitation.role)}`}>
                          {invitation.role}
                        </span>
                        <span className="ml-2 flex items-center text-xs text-gray-500">
                          {getStatusIcon(invitation.status)}
                          <span className="ml-1 capitalize">{invitation.status}</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Invited {new Date(invitation.invited_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelInvitation(invitation.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Invite Collaborator</h2>
              <button 
                onClick={() => setShowInviteForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                  placeholder="farmer@example.com"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({...inviteData, role: e.target.value as 'manager' | 'worker' | 'viewer'})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="manager">Manager - Full access to manage farm operations</option>
                  <option value="worker">Worker - Can add tasks and update resources</option>
                  <option value="viewer">Viewer - Read-only access to farm data</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={inviteData.message}
                  onChange={(e) => setInviteData({...inviteData, message: e.target.value})}
                  placeholder="Add a personal message to your invitation..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvitation}
                  disabled={!inviteData.email}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
