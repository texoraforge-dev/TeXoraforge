/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Lock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings,
  Users,
  Key,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  X,
  Search,
  Filter,
  Trash2,
  UserCheck,
  UserX,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../storage';
import { User, UserRole, AdminPermission } from '../types';
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, getRoleBadgeInfo, hasPermission } from '../lib/permissions';

interface PermissionManagementProps {
  onNavigate?: (view: string) => void;
}

export const PermissionManagement: React.FC<PermissionManagementProps> = ({ onNavigate }) => {
  const { users, currentUser, school, actions } = useAppStore();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('VICE_PRINCIPAL');
  const [newUserPermissions, setNewUserPermissions] = useState<AdminPermission[]>(
    DEFAULT_ROLE_PERMISSIONS.VICE_PRINCIPAL
  );

  // Selected User Permissions State for Edit
  const [editPermissions, setEditPermissions] = useState<AdminPermission[]>([]);

  // Check if current user is Proprietor or Super Admin
  const isProprietor = currentUser?.role === 'PROPRIETOR';

  // Filter staff & admin users
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Open Edit Permissions Modal
  const handleOpenPermissionsModal = (user: User) => {
    setSelectedUser(user);
    const currentPerms = user.permissions ?? DEFAULT_ROLE_PERMISSIONS[user.role] ?? [];
    setEditPermissions([...currentPerms]);
    setShowPermissionsModal(true);
  };

  // Toggle permission in edit state
  const handleTogglePermission = (permKey: AdminPermission) => {
    if (editPermissions.includes(permKey)) {
      setEditPermissions(editPermissions.filter(p => p !== permKey));
    } else {
      setEditPermissions([...editPermissions, permKey]);
    }
  };

  // Save Permissions
  const handleSavePermissions = () => {
    if (!selectedUser) return;
    actions.updateUserPermissions(selectedUser.id, editPermissions, currentUser || undefined);
    setShowPermissionsModal(false);
    setSelectedUser(null);
  };

  // Handle Role Change in New User Form
  const handleRoleSelectInNewUser = (role: UserRole) => {
    setNewUserRole(role);
    setNewUserPermissions([...DEFAULT_ROLE_PERMISSIONS[role]]);
  };

  // Toggle permission in new user form
  const handleToggleNewUserPermission = (permKey: AdminPermission) => {
    if (newUserPermissions.includes(permKey)) {
      setNewUserPermissions(newUserPermissions.filter(p => p !== permKey));
    } else {
      setNewUserPermissions([...newUserPermissions, permKey]);
    }
  };

  // Handle Create User Submit
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    actions.createUser(
      {
        schoolId: school?.id || 'school_apex',
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        role: newUserRole,
        permissions: newUserRole === 'TEACHER' || newUserRole === 'PARENT' ? undefined : newUserPermissions,
        phone: newUserPhone.trim() || undefined,
        assignedClassIds: [],
        assignedSubjects: [],
        active: true
      },
      currentUser || undefined
    );

    // Reset Form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserRole('VICE_PRINCIPAL');
    setNewUserPermissions([...DEFAULT_ROLE_PERMISSIONS.VICE_PRINCIPAL]);
    setShowCreateUserModal(false);
  };

  // Handle Account Status Toggle
  const handleToggleStatus = (user: User) => {
    actions.toggleUserActive(user.id, currentUser || undefined);
  };

  // Group permissions by module category
  const permissionsByModule = ALL_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, typeof ALL_PERMISSIONS>);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>Proprietor & Super Admin Permission Control</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Role Hierarchy & Delegated Permissions</h1>
          <p className="text-sm text-slate-300">
            Assign custom administrative privileges to Vice Principals, School Admins, and Teachers while maintaining full school oversight.
          </p>
        </div>

        {isProprietor && (
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" /> Provision Vice Principal / Admin Account
          </button>
        )}
      </div>

      {!isProprietor && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold">Account Provisioning Rules</p>
            <p>Only the <strong>School Proprietor</strong> is authorized to provision new Vice Principal and School Admin accounts. As School Admin, you can provision and assign Teacher accounts in the <strong>Teacher Roster</strong> module.</p>
          </div>
        </div>
      )}

      {/* Role Hierarchy Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Proprietor / Super Admin
            </span>
            <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xs text-amber-900 dark:text-amber-200">
            Full executive ownership. Unrestricted access across all school modules, analytics, and admin accounts.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              Vice Principal
            </span>
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xs text-blue-900 dark:text-blue-200">
            Admissions, Student Management, Guardian Records, Class Assignments & Promotions.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">
              School Admin
            </span>
            <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-xs text-purple-900 dark:text-purple-200">
            Academic Administration: Lesson Notes, Lesson Plans, Examination Timetables & CA Score Approvals.
          </p>
        </div>
      </div>

      {/* User Accounts List Table & Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 transition-colors">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400 hidden sm:inline" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="PROPRIETOR">Proprietor</option>
              <option value="VICE_PRINCIPAL">Vice Principal</option>
              <option value="SCHOOL_ADMIN">School Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="PARENT">Parent</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-bold">User / Account</th>
                <th className="py-3 px-4 font-bold">Role</th>
                <th className="py-3 px-4 font-bold">Assigned Privileges</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map(user => {
                const roleBadge = getRoleBadgeInfo(user.role);
                const userPerms = user.permissions ?? DEFAULT_ROLE_PERMISSIONS[user.role] ?? [];
                const isTargetProprietor = user.role === 'PROPRIETOR';

                return (
                  <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleBadge.bgClass} ${roleBadge.textClass} ${roleBadge.borderClass}`}>
                        {roleBadge.label}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {isTargetProprietor ? (
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" /> Full School Control (15/15)
                        </span>
                      ) : user.role === 'TEACHER' || user.role === 'PARENT' ? (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          Standard Role Access
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {userPerms.length} / {ALL_PERMISSIONS.length} Permissions Active
                          </p>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {userPerms.slice(0, 3).map(p => (
                              <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {p.replace(/_/g, ' ')}
                              </span>
                            ))}
                            {userPerms.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold">
                                +{userPerms.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.active
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}>
                        {user.active ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                        {user.active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isTargetProprietor ? (
                        <span className="text-[11px] text-slate-400 italic">Owner Protected</span>
                      ) : isProprietor ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenPermissionsModal(user)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Key className="h-3.5 w-3.5" /> Edit Permissions
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              user.active
                                ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-400'
                                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-400'
                            }`}
                            title={user.active ? 'Deactivate Account' : 'Activate Account'}
                          >
                            {user.active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">View Only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Manage Permissions for {selectedUser.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Role: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedUser.role.replace('_', ' ')}</span> • {selectedUser.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPermissionsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Permission Toggles by Category */}
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {Object.entries(permissionsByModule).map(([moduleName, perms]) => (
                <div key={moduleName} className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1">
                    {moduleName} Privileges
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {perms.map(perm => {
                      const isChecked = editPermissions.includes(perm.key);
                      return (
                        <div
                          key={perm.key}
                          onClick={() => handleTogglePermission(perm.key)}
                          className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-indigo-50/70 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800'
                              : 'bg-slate-50/50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className={`mt-0.5 p-1 rounded-md ${isChecked ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                            {isChecked ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{perm.label}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{perm.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{editPermissions.length}</span> permissions selected
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPermissionsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Permission Privileges
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Provision Admin User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Provision New Delegated Account</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Create a Vice Principal, School Admin, or Teacher account</p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateUserModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vice Principal Mrs. Margaret Folorunsho"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. vp@apexhorizon.edu"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+234 800 123 4567"
                    value={newUserPhone}
                    onChange={e => setNewUserPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Assign Role *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleSelectInNewUser('VICE_PRINCIPAL')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      newUserRole === 'VICE_PRINCIPAL'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <p className="text-xs">Vice Principal</p>
                    <p className="text-[10px] opacity-75">Admissions</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelectInNewUser('SCHOOL_ADMIN')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      newUserRole === 'SCHOOL_ADMIN'
                        ? 'bg-purple-50 border-purple-500 text-purple-800 dark:bg-purple-950/60 dark:border-purple-500 dark:text-purple-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <p className="text-xs">School Admin</p>
                    <p className="text-[10px] opacity-75">Academic</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelectInNewUser('TEACHER')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      newUserRole === 'TEACHER'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500 dark:text-emerald-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <p className="text-xs">Teacher</p>
                    <p className="text-[10px] opacity-75">Subject Staff</p>
                  </button>
                </div>
              </div>

              {/* Initial Permissions Toggles if Admin Role */}
              {newUserRole !== 'TEACHER' && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Initial Administrative Privileges</p>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    {ALL_PERMISSIONS.map(p => {
                      const isChecked = newUserPermissions.includes(p.key);
                      return (
                        <label key={p.key} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleNewUserPermission(p.key)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="truncate">{p.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Create & Provision Account
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
