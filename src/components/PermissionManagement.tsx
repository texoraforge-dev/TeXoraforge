/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
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
  ChevronRight,
  X,
  Search,
  Filter,
  UserCheck,
  UserX,
  Sparkles,
  Copy,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  Bus,
  Phone,
  Mail,
  MapPin,
  HeartHandshake,
  User as UserIcon,
  RefreshCw,
  Trash2,
  ArrowRight,
  Car,
  Camera,
  Upload
} from 'lucide-react';
import { useAppStore } from '../storage';
import { User, UserRole, AdminPermission, TransportRoute } from '../types';
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, getRoleBadgeInfo, hasPermission } from '../lib/permissions';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ImageUploadBox } from './ImageUploadBox';

interface PermissionManagementProps {
  onNavigate?: (view: string) => void;
}

export const PermissionManagement: React.FC<PermissionManagementProps> = ({ onNavigate }) => {
  const { users, currentUser, school, classes, students, transportRoutes, actions } = useAppStore();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('PRINCIPAL');
  const [newUserAvatarUrl, setNewUserAvatarUrl] = useState<string>('');
  const [newUserPermissions, setNewUserPermissions] = useState<AdminPermission[]>(
    DEFAULT_ROLE_PERMISSIONS.PRINCIPAL
  );

  // Photo Edit Modal for existing users
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoModalUser, setPhotoModalUser] = useState<User | null>(null);
  const [photoModalUrl, setPhotoModalUrl] = useState<string>('');

  // Specific Role Form State:
  // Driver Fields
  const [driverRouteName, setDriverRouteName] = useState('Main Campus Express Route');
  const [driverVehicleNo, setDriverVehicleNo] = useState('KJA-482-AB');
  const [driverVehicleModel, setDriverVehicleModel] = useState('Toyota Coaster 30-Seater');
  const [driverCapacity, setDriverCapacity] = useState(25);
  const [driverAccessCode, setDriverAccessCode] = useState(() => `DRV-${Math.floor(1000 + Math.random() * 9000)}-BUS`);
  const [driverPin, setDriverPin] = useState('1234');
  const [driverPickupLocations, setDriverPickupLocations] = useState('School Gate, Chevron Toll, Lekki Phase 1, Ajah Junction');

  // Teacher Fields
  const [teacherSubjects, setTeacherSubjects] = useState('Mathematics, English');
  const [teacherClassIds, setTeacherClassIds] = useState<string[]>([]);

  // Student Fields
  const [studentClassId, setStudentClassId] = useState<string>('');
  const [studentAdmissionNo, setStudentAdmissionNo] = useState(() => `STU-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [studentGuardianName, setStudentGuardianName] = useState('');
  const [studentGuardianPhone, setStudentGuardianPhone] = useState('');

  // Parent Fields
  const [parentLinkedStudentIds, setParentLinkedStudentIds] = useState<string[]>([]);
  const [parentAddress, setParentAddress] = useState('');

  // Newly Created Credentials modal/banner
  const [createdAccount, setCreatedAccount] = useState<{
    name: string;
    email: string;
    role: UserRole;
    password: string;
    driverCode?: string;
    driverPin?: string;
    vehicleNo?: string;
    routeName?: string;
    admissionNo?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Selected User Permissions State for Edit
  const [editPermissions, setEditPermissions] = useState<AdminPermission[]>([]);

  // Check if current user is Proprietor
  const isProprietor = currentUser?.role === 'PROPRIETOR';

  // Map driver user ID to route
  const driverRouteMap = useMemo(() => {
    const map = new Map<string, TransportRoute>();
    transportRoutes.forEach(r => {
      if (r.driverUserId) map.set(r.driverUserId, r);
      if (r.driverName) map.set(r.driverName.toLowerCase(), r);
    });
    return map;
  }, [transportRoutes]);

  // Filter staff & all users
  const filteredUsers = users.filter(u => {
    const route = driverRouteMap.get(u.id) || driverRouteMap.get(u.name.toLowerCase());
    const extraMatch = route ? (route.vehicleNo + ' ' + route.routeName + ' ' + (route.driverAccessCode || '')).toLowerCase() : '';

    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      extraMatch.includes(searchTerm.toLowerCase());

    if (roleFilter === 'ALL') return matchesSearch;
    if (roleFilter === 'LEADERSHIP') return matchesSearch && (u.role === 'PROPRIETOR' || u.role === 'PRINCIPAL');
    if (roleFilter === 'ADMINS') return matchesSearch && (u.role === 'SCHOOL_ADMIN' || u.role === 'VICE_PRINCIPAL');
    if (roleFilter === 'DRIVERS') return matchesSearch && u.role === 'DRIVER';
    if (roleFilter === 'TEACHERS') return matchesSearch && u.role === 'TEACHER';
    if (roleFilter === 'PARENTS') return matchesSearch && u.role === 'PARENT';
    if (roleFilter === 'STUDENTS') return matchesSearch && u.role === 'STUDENT';

    return matchesSearch && u.role === roleFilter;
  });

  // Account Counts
  const counts = useMemo(() => {
    return {
      all: users.length,
      leadership: users.filter(u => u.role === 'PROPRIETOR' || u.role === 'PRINCIPAL').length,
      admins: users.filter(u => u.role === 'SCHOOL_ADMIN' || u.role === 'VICE_PRINCIPAL').length,
      teachers: users.filter(u => u.role === 'TEACHER').length,
      drivers: users.filter(u => u.role === 'DRIVER').length,
      parents: users.filter(u => u.role === 'PARENT').length,
      students: users.filter(u => u.role === 'STUDENT').length,
    };
  }, [users]);

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

  // Select all / clear permissions in edit modal
  const handleSelectAllEdit = () => {
    setEditPermissions(ALL_PERMISSIONS.map(p => p.key));
  };
  const handleClearAllEdit = () => {
    setEditPermissions([]);
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
    setNewUserPermissions([...(DEFAULT_ROLE_PERMISSIONS[role] || [])]);
    if (role === 'DRIVER') {
      setDriverAccessCode(`DRV-${Math.floor(1000 + Math.random() * 9000)}-BUS`);
    } else if (role === 'STUDENT') {
      setStudentAdmissionNo(`STU-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      if (classes.length > 0 && classes[0]?.id && !studentClassId) {
        setStudentClassId(classes[0].id);
      }
    }
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
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const name = newUserName.trim();
    const role = newUserRole;
    const password = newUserPassword.trim() || 'password123';
    let email = newUserEmail.trim().toLowerCase();

    // Auto-generate email for driver if empty
    if (role === 'DRIVER' && !email) {
      const codeClean = driverAccessCode.toLowerCase().replace(/[^a-z0-9]/g, '');
      email = `${codeClean}@driver.texora.edu`;
    }

    if (!email) {
      email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@school.edu`;
    }

    // 1. If Driver: Create via AppStorage driver route generator
    if (role === 'DRIVER') {
      const generatedCode = driverAccessCode.trim() || `DRV-${Math.floor(1000 + Math.random() * 9000)}-BUS`;
      const generatedPin = driverPin.trim() || '1234';
      const cleanVehicle = driverVehicleNo.trim().toUpperCase() || 'BUS-001';
      const cleanRoute = driverRouteName.trim() || `${name}'s School Bus Route`;

      actions.createDriverAccount({
        routeName: cleanRoute,
        vehicleNo: cleanVehicle,
        vehicleModel: driverVehicleModel.trim() || 'Toyota Coaster 30-Seater',
        driverName: name,
        driverPhone: newUserPhone.trim() || '+234 800 123 4567',
        driverPhotoUrl: newUserAvatarUrl || undefined,
        pickupLocations: driverPickupLocations.split(',').map(s => s.trim()).filter(Boolean),
        assignedStudentIds: [],
        capacity: Number(driverCapacity) || 25,
        driverAccessCode: generatedCode,
        driverPin: generatedPin,
        schoolId: school?.id || 'school_apex'
      });

      setCreatedAccount({
        name,
        email,
        role: 'DRIVER',
        password,
        driverCode: generatedCode,
        driverPin: generatedPin,
        vehicleNo: cleanVehicle,
        routeName: cleanRoute
      });
    } else if (role === 'STUDENT') {
      // 2. Student creation
      const admNo = studentAdmissionNo.trim() || `STU-${Date.now().toString().slice(-4)}`;
      const targetClass = studentClassId || (classes[0]?.id || 'cls_jss1a');

      actions.createStudent(
        {
          schoolId: school?.id || 'school_apex',
          name,
          classId: targetClass,
          admissionNumber: admNo,
          guardianName: studentGuardianName.trim() || 'Parent / Guardian',
          guardianPhone: studentGuardianPhone.trim() || newUserPhone.trim() || '+234 800 000 0000',
          guardianEmail: email,
          gender: 'MALE',
          dateOfBirth: '2010-05-15',
          attendanceCount: 0,
          riskStatus: 'LOW',
          photoUrl: newUserAvatarUrl || undefined,
          enrolledAt: new Date().toISOString()
        },
        currentUser || undefined
      );

      actions.createUser(
        {
          schoolId: school?.id || 'school_apex',
          name,
          email,
          role: 'STUDENT',
          avatarUrl: newUserAvatarUrl || undefined,
          phone: newUserPhone.trim() || undefined,
          assignedClassIds: [targetClass],
          assignedSubjects: [],
          active: true
        },
        currentUser || undefined
      );

      setCreatedAccount({
        name,
        email,
        role: 'STUDENT',
        password,
        admissionNo: admNo
      });
    } else if (role === 'TEACHER') {
      // 3. Teacher creation
      const subjectsList = teacherSubjects.split(',').map(s => s.trim()).filter(Boolean);
      actions.createUser(
        {
          schoolId: school?.id || 'school_apex',
          name,
          email,
          role: 'TEACHER',
          avatarUrl: newUserAvatarUrl || undefined,
          phone: newUserPhone.trim() || undefined,
          assignedClassIds: teacherClassIds,
          assignedSubjects: subjectsList,
          active: true
        },
        currentUser || undefined
      );

      setCreatedAccount({
        name,
        email,
        role: 'TEACHER',
        password
      });
    } else {
      // 4. Principal, VP, School Admin, Parent, Proprietor
      actions.createUser(
        {
          schoolId: school?.id || 'school_apex',
          name,
          email,
          role,
          avatarUrl: newUserAvatarUrl || undefined,
          permissions: role === 'PARENT' ? undefined : newUserPermissions,
          phone: newUserPhone.trim() || undefined,
          assignedClassIds: [],
          assignedSubjects: [],
          active: true
        },
        currentUser || undefined
      );

      setCreatedAccount({
        name,
        email,
        role,
        password
      });
    }

    // Provision Supabase Auth account if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role,
              avatar_url: newUserAvatarUrl || undefined,
              school_id: school?.id || 'school_apex'
            }
          }
        });
      } catch (err) {
        console.warn('Background Supabase auth signup notice:', err);
      }
    }

    // Reset Form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('password123');
    setNewUserPhone('');
    setNewUserAvatarUrl('');
    setNewUserRole('PRINCIPAL');
    setNewUserPermissions([...DEFAULT_ROLE_PERMISSIONS.PRINCIPAL]);
    setShowCreateUserModal(false);
  };

  // Open Photo Edit Modal for existing user
  const handleOpenPhotoModal = (user: User) => {
    setPhotoModalUser(user);
    setPhotoModalUrl(user.avatarUrl || '');
    setShowPhotoModal(true);
  };

  const handleSavePhotoModal = () => {
    if (!photoModalUser) return;
    actions.updateUserProfilePicture(photoModalUser.id, photoModalUrl, currentUser || undefined);
    setShowPhotoModal(false);
    setPhotoModalUser(null);
  };

  const handleCopyCredentials = () => {
    if (!createdAccount) return;
    let text = `School Portal Login Credentials\n---------------------------\nName: ${createdAccount.name}\nRole: ${createdAccount.role.replace('_', ' ')}\nEmail: ${createdAccount.email}\nPassword: ${createdAccount.password}`;
    if (createdAccount.driverCode) {
      text += `\nDriver Access Code: ${createdAccount.driverCode}\nDriver PIN: ${createdAccount.driverPin}\nVehicle Plate No: ${createdAccount.vehicleNo}\nRoute: ${createdAccount.routeName}`;
    }
    if (createdAccount.admissionNo) {
      text += `\nAdmission No: ${createdAccount.admissionNo}`;
    }
    text += `\nPortal URL: ${window.location.origin}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/80 to-slate-900 border border-amber-800/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>Proprietor Master Accounts & User Provisioning Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Accounts Management & Provisioning</h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Create, configure, and manage credentials for <strong className="text-amber-300">Principals</strong>, <strong className="text-purple-300">Admins</strong>, <strong className="text-blue-300">Vice Principals</strong>, <strong className="text-emerald-300">Teachers</strong>, <strong className="text-amber-400">School Bus Drivers</strong>, <strong className="text-slate-200">Parents</strong>, and <strong className="text-indigo-300">Students</strong>.
          </p>
        </div>

        {isProprietor && (
          <button
            onClick={() => {
              setNewUserRole('PRINCIPAL');
              setNewUserPermissions([...DEFAULT_ROLE_PERMISSIONS.PRINCIPAL]);
              setShowCreateUserModal(true);
            }}
            className="px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2.5 shadow-xl hover:shadow-amber-500/30 transition-all shrink-0 cursor-pointer"
          >
            <UserPlus className="h-5 w-5" /> + Create New Account
          </button>
        )}
      </div>

      {/* Success Notification Modal when Account is Created */}
      {createdAccount && (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in zoom-in-95">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                Account Provisioned for {createdAccount.name}!
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-bold">
                  {createdAccount.role.replace('_', ' ')}
                </span>
              </h4>
              <div className="text-xs text-emerald-800 dark:text-emerald-200 space-y-0.5">
                <p>Email: <span className="font-mono font-bold">{createdAccount.email}</span> • Password: <span className="font-mono font-bold">{createdAccount.password}</span></p>
                {createdAccount.driverCode && (
                  <p className="font-semibold text-amber-800 dark:text-amber-300">
                    🚌 Driver Access Code: <span className="font-mono font-bold">{createdAccount.driverCode}</span> • PIN: <span className="font-mono font-bold">{createdAccount.driverPin}</span> • Vehicle: <span className="font-mono font-bold">{createdAccount.vehicleNo}</span>
                  </p>
                )}
                {createdAccount.admissionNo && (
                  <p className="font-semibold text-indigo-800 dark:text-indigo-300">
                    🎓 Student Admission No: <span className="font-mono font-bold">{createdAccount.admissionNo}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyCredentials}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Credentials Copied!' : 'Copy Login Details'}
            </button>
            <button
              onClick={() => setCreatedAccount(null)}
              className="p-2 rounded-xl text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/40 cursor-pointer"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Account Categories Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total Accounts */}
        <div
          onClick={() => setRoleFilter('ALL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'ALL'
              ? 'bg-slate-900 text-white border-amber-500 ring-2 ring-amber-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Accounts</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">{counts.all}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">All registered users</p>
        </div>

        {/* Leadership */}
        <div
          onClick={() => setRoleFilter('LEADERSHIP')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'LEADERSHIP'
              ? 'bg-teal-900 text-white border-teal-500 ring-2 ring-teal-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">Principals</span>
            <GraduationCap className="h-4 w-4 text-teal-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">{counts.leadership}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Executive leadership</p>
        </div>

        {/* Admins & VPs */}
        <div
          onClick={() => setRoleFilter('ADMINS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'ADMINS'
              ? 'bg-purple-900 text-white border-purple-500 ring-2 ring-purple-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">Admins & VPs</span>
            <Settings className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">{counts.admins}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Officers & operations</p>
        </div>

        {/* Teachers */}
        <div
          onClick={() => setRoleFilter('TEACHERS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'TEACHERS'
              ? 'bg-emerald-900 text-white border-emerald-500 ring-2 ring-emerald-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Teachers</span>
            <BookOpen className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">{counts.teachers}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Teaching faculty</p>
        </div>

        {/* School Bus Drivers */}
        <div
          onClick={() => setRoleFilter('DRIVERS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'DRIVERS'
              ? 'bg-amber-900 text-white border-amber-500 ring-2 ring-amber-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">Bus Drivers</span>
            <Bus className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">{counts.drivers}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Fleet & transit</p>
        </div>

        {/* Parents & Students */}
        <div
          onClick={() => setRoleFilter('PARENTS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'PARENTS'
              ? 'bg-indigo-900 text-white border-indigo-500 ring-2 ring-indigo-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Parents/Students</span>
            <HeartHandshake className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">{counts.parents + counts.students}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Families & learners</p>
        </div>

      </div>

      {/* Main Accounts Table Directory */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        
        {/* Filters and Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Active Accounts Directory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredUsers.length} of {users.length} registered account(s)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, driver code, plate..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Roles ({counts.all})</option>
              <option value="LEADERSHIP">Principals & Owners ({counts.leadership})</option>
              <option value="ADMINS">School Admins & VPs ({counts.admins})</option>
              <option value="TEACHERS">Teachers ({counts.teachers})</option>
              <option value="DRIVERS">School Bus Drivers ({counts.drivers})</option>
              <option value="PARENTS">Parents ({counts.parents})</option>
              <option value="STUDENTS">Students ({counts.students})</option>
            </select>

            {isProprietor && (
              <button
                onClick={() => {
                  setNewUserRole('DRIVER');
                  setDriverAccessCode(`DRV-${Math.floor(1000 + Math.random() * 9000)}-BUS`);
                  setShowCreateUserModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Bus className="h-3.5 w-3.5" /> + New Driver
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-bold">User / Staff Member</th>
                <th className="py-3 px-4 font-bold">Role</th>
                <th className="py-3 px-4 font-bold">Role-Specific Details / Privileges</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    No accounts found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const roleBadge = getRoleBadgeInfo(user.role);
                  const userPerms = user.permissions ?? DEFAULT_ROLE_PERMISSIONS[user.role] ?? [];
                  const isTargetProprietor = user.role === 'PROPRIETOR';
                  const isTargetDriver = user.role === 'DRIVER';
                  const route = driverRouteMap.get(user.id) || driverRouteMap.get(user.name.toLowerCase());

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* Name & Contact */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => handleOpenPhotoModal(user)}
                            className="relative group cursor-pointer"
                            title="Click to view or change profile photo"
                          >
                            <img
                              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                              alt={user.name}
                              className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm group-hover:opacity-80 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Camera className="h-4 w-4 drop-shadow" />
                            </div>
                            {isTargetDriver && (
                              <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-500 text-slate-950 shadow">
                                <Bus className="h-2.5 w-2.5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {user.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.email}</p>
                            {user.phone && <p className="text-[10px] text-slate-400 flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> {user.phone}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleBadge.bgClass} ${roleBadge.textClass} ${roleBadge.borderClass}`}>
                          {isTargetDriver ? <Bus className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* Specific Details */}
                      <td className="py-3 px-4">
                        {isTargetDriver ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/60">
                                {route?.vehicleNo || 'BUS-FLEET'}
                              </span>
                              <span className="text-slate-600 dark:text-slate-300 font-semibold truncate max-w-xs">
                                {route?.routeName || 'School Shuttle Route'}
                              </span>
                            </div>
                            {route?.driverAccessCode && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                Driver Code: <span className="font-bold text-slate-700 dark:text-slate-200">{route.driverAccessCode}</span> (PIN: {route.driverPin || '1234'})
                              </p>
                            )}
                          </div>
                        ) : isTargetProprietor ? (
                          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" /> Full Executive Governance & Ownership
                          </span>
                        ) : user.role === 'TEACHER' ? (
                          <div className="space-y-1">
                            <p className="text-slate-700 dark:text-slate-300 font-semibold">
                              {user.assignedSubjects && user.assignedSubjects.length > 0
                                ? user.assignedSubjects.join(', ')
                                : 'General Teaching Staff'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {user.assignedClassIds && user.assignedClassIds.length > 0
                                ? `${user.assignedClassIds.length} Assigned Class(es)`
                                : 'All Classes Accessible'}
                            </p>
                          </div>
                        ) : user.role === 'STUDENT' ? (
                          <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">
                            Student Portal Account
                          </span>
                        ) : user.role === 'PARENT' ? (
                          <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                            Parent Portal Account
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              {userPerms.length} / {ALL_PERMISSIONS.length} Privileges Active
                            </p>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {userPerms.slice(0, 2).map(p => (
                                <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {p.replace(/_/g, ' ')}
                                </span>
                              ))}
                              {userPerms.length > 2 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold">
                                  +{userPerms.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          user.active
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        }`}>
                          {user.active ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                          {user.active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        {isTargetProprietor ? (
                          <span className="text-[11px] text-slate-400 italic">Owner Protected</span>
                        ) : isProprietor ? (
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* For Administrative Roles: Edit Permissions */}
                            {(user.role === 'PRINCIPAL' || user.role === 'SCHOOL_ADMIN' || user.role === 'VICE_PRINCIPAL') && (
                              <button
                                onClick={() => handleOpenPermissionsModal(user)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Key className="h-3.5 w-3.5" /> Privileges
                              </button>
                            )}

                            {/* Photo Upload / Update Button */}
                            <button
                              onClick={() => handleOpenPhotoModal(user)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Update Photo"
                            >
                              <Camera className="h-3.5 w-3.5 text-slate-500" /> Photo
                            </button>

                            {/* For Driver: Copy Code / Go to Bus Tracking */}
                            {isTargetDriver && route?.driverAccessCode && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`Driver Login Code: ${route.driverAccessCode} (PIN: ${route.driverPin || '1234'})`);
                                  alert(`Copied Driver Code: ${route.driverAccessCode}`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-800 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                title="Copy Driver Access Code"
                              >
                                <Copy className="h-3.5 w-3.5" /> Copy Code
                              </button>
                            )}

                            {/* Status Toggle */}
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150">
            
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

            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">Toggle privileges for this staff member:</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllEdit}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <button
                  type="button"
                  onClick={handleClearAllEdit}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
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
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{editPermissions.length}</span> privileges assigned
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
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Permission Privileges
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ALL-IN-ONE PROPRIETOR ACCOUNT PROVISIONING MODAL */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-500 font-bold">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Provision New School Account</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Create credentials for Principals, Admins, Teachers, Drivers, Parents, or Students
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateUserModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-5">
              
              {/* Role Selection Grid */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Select Role to Provision *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  
                  {/* Principal */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelectInNewUser('PRINCIPAL')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      newUserRole === 'PRINCIPAL'
                        ? 'bg-teal-50 border-teal-500 text-teal-800 dark:bg-teal-950/60 dark:border-teal-500 dark:text-teal-200 font-bold ring-2 ring-teal-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <GraduationCap className="h-5 w-5 mx-auto mb-1 text-teal-600 dark:text-teal-400" />
                    <p className="text-xs font-bold">Principal</p>
                    <p className="text-[10px] opacity-75">Head of School</p>
                  </button>

                  {/* School Admin */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelectInNewUser('SCHOOL_ADMIN')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      newUserRole === 'SCHOOL_ADMIN'
                        ? 'bg-purple-50 border-purple-500 text-purple-800 dark:bg-purple-950/60 dark:border-purple-500 dark:text-purple-200 font-bold ring-2 ring-purple-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Settings className="h-5 w-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                    <p className="text-xs font-bold">School Admin</p>
                    <p className="text-[10px] opacity-75">Academic Officer</p>
                  </button>

                  {/* Vice Principal */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelectInNewUser('VICE_PRINCIPAL')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      newUserRole === 'VICE_PRINCIPAL'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-200 font-bold ring-2 ring-blue-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Users className="h-5 w-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs font-bold">Vice Principal</p>
                    <p className="text-[10px] opacity-75">Admissions</p>
                  </button>

                  {/* Teacher */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelectInNewUser('TEACHER')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      newUserRole === 'TEACHER'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <BookOpen className="h-5 w-5 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-xs font-bold">Teacher</p>
                    <p className="text-[10px] opacity-75">Subject Faculty</p>
                  </button>

                  {/* Driver */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelectInNewUser('DRIVER')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      newUserRole === 'DRIVER'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-950/60 dark:border-amber-500 dark:text-amber-200 font-bold ring-2 ring-amber-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Bus className="h-5 w-5 mx-auto mb-1 text-amber-600 dark:text-amber-400" />
                    <p className="text-xs font-bold">Bus Driver</p>
                    <p className="text-[10px] opacity-75">Transport & Fleet</p>
                  </button>

                  {/* Parent */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelectInNewUser('PARENT')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      newUserRole === 'PARENT'
                        ? 'bg-slate-200 dark:bg-slate-700 border-slate-500 text-slate-900 dark:text-white font-bold ring-2 ring-slate-400/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <HeartHandshake className="h-5 w-5 mx-auto mb-1 text-slate-600 dark:text-slate-300" />
                    <p className="text-xs font-bold">Parent</p>
                    <p className="text-[10px] opacity-75">Family Portal</p>
                  </button>

                  {/* Student */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelectInNewUser('STUDENT')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      newUserRole === 'STUDENT'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-800 dark:bg-indigo-950/60 dark:border-indigo-500 dark:text-indigo-200 font-bold ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <UserIcon className="h-5 w-5 mx-auto mb-1 text-indigo-600 dark:text-indigo-400" />
                    <p className="text-xs font-bold">Student</p>
                    <p className="text-[10px] opacity-75">CBT & Portal</p>
                  </button>

                </div>
              </div>

              {/* Profile Photo / Picture Upload Component */}
              <ImageUploadBox
                value={newUserAvatarUrl}
                onChange={setNewUserAvatarUrl}
                rolePreset={newUserRole}
                label={`${newUserRole.replace('_', ' ')} Profile Photo / Picture`}
                helperText="Upload passport headshot from device, take a picture, or select from sample avatars."
              />

              {/* Core Details */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {newUserRole === 'DRIVER' ? 'Driver Full Name *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    newUserRole === 'PRINCIPAL'
                      ? 'e.g. Principal Dr. Anthony Adebayo'
                      : newUserRole === 'SCHOOL_ADMIN'
                      ? 'e.g. Admin Mrs. Blessing Okafor'
                      : newUserRole === 'VICE_PRINCIPAL'
                      ? 'e.g. VP Mr. Ibrahim Danjuma'
                      : newUserRole === 'DRIVER'
                      ? 'e.g. Mr. Emmanuel Okon'
                      : newUserRole === 'PARENT'
                      ? 'e.g. Chief & Mrs. Adeleke'
                      : newUserRole === 'STUDENT'
                      ? 'e.g. David Adeleke'
                      : 'e.g. Mr. Emmanuel Olatunji'
                  }
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Address {newUserRole === 'DRIVER' ? '(Optional / Auto-Generated)' : '*'}
                  </label>
                  <input
                    type="email"
                    required={newUserRole !== 'DRIVER'}
                    placeholder={
                      newUserRole === 'DRIVER'
                        ? 'driver@school.edu (or auto-generated)'
                        : 'user@school.edu'
                    }
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Temporary Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newUserPassword}
                      onChange={e => setNewUserPassword(e.target.value)}
                      className="w-full pl-3.5 pr-8 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Phone Number {newUserRole === 'DRIVER' ? '*' : '(Optional)'}
                </label>
                <input
                  type="tel"
                  required={newUserRole === 'DRIVER'}
                  placeholder="+234 800 123 4567"
                  value={newUserPhone}
                  onChange={e => setNewUserPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* ROLE-SPECIFIC DEDICATED FIELDS */}
              {/* 1. DRIVER DEDICATED FIELDS */}
              {newUserRole === 'DRIVER' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Bus className="h-4 w-4" /> Bus Vehicle & Route Assignment
                    </span>
                    <span className="text-[10px] text-slate-400">Driver Console Ready</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Vehicle Plate No *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. KJA-482-AB"
                        value={driverVehicleNo}
                        onChange={e => setDriverVehicleNo(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-mono uppercase bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Vehicle Model</label>
                      <input
                        type="text"
                        placeholder="e.g. Toyota Coaster 30-Seater"
                        value={driverVehicleModel}
                        onChange={e => setDriverVehicleModel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Driver Login Access Code *</label>
                      <input
                        type="text"
                        required
                        value={driverAccessCode}
                        onChange={e => setDriverAccessCode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-mono uppercase bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-700 dark:text-amber-400 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Driver PIN (4-Digits)</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="1234"
                        value={driverPin}
                        onChange={e => setDriverPin(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Route Name & Description *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Main Lekki - Victoria Island Express Route"
                      value={driverRouteName}
                      onChange={e => setDriverRouteName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* 2. TEACHER DEDICATED FIELDS */}
              {newUserRole === 'TEACHER' && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" /> Subjects & Class Assignments
                  </span>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Assigned Subjects (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="Mathematics, English Language, Physics"
                      value={teacherSubjects}
                      onChange={e => setTeacherSubjects(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Assigned Classes</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-28 overflow-y-auto p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      {classes.map(c => {
                        const isSelected = teacherClassIds.includes(c.id);
                        return (
                          <label key={c.id} className="flex items-center gap-1.5 text-[11px] cursor-pointer text-slate-700 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) setTeacherClassIds(teacherClassIds.filter(id => id !== c.id));
                                else setTeacherClassIds([...teacherClassIds, c.id]);
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="truncate">{c.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. STUDENT DEDICATED FIELDS */}
              {newUserRole === 'STUDENT' && (
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" /> Student Academic Profile
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Class *</label>
                      <select
                        value={studentClassId}
                        onChange={e => setStudentClassId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Admission No *</label>
                      <input
                        type="text"
                        required
                        value={studentAdmissionNo}
                        onChange={e => setStudentAdmissionNo(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-400 font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. ADMIN & PRINCIPAL PERMISSIONS MATRIX */}
              {(newUserRole === 'PRINCIPAL' || newUserRole === 'SCHOOL_ADMIN' || newUserRole === 'VICE_PRINCIPAL') && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Assigned Administrative Privileges ({newUserPermissions.length} selected)
                    </p>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                      Auto-configured for {newUserRole.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    {ALL_PERMISSIONS.map(p => {
                      const isChecked = newUserPermissions.includes(p.key);
                      return (
                        <label key={p.key} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleNewUserPermission(p.key)}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span className="truncate">{p.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" /> Create & Provision Account
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UPDATE PROFILE PHOTO MODAL FOR ANY USER (PROPRIETOR, STAFF, DRIVER, ETC.) */}
      {/* ========================================================================= */}
      {showPhotoModal && photoModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Update Profile Picture
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {photoModalUser.name} • {photoModalUser.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPhotoModal(false);
                  setPhotoModalUser(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ImageUploadBox
              value={photoModalUrl}
              onChange={setPhotoModalUrl}
              rolePreset={photoModalUser.role}
              label="Account Profile Photograph"
              helperText="Upload a new photo file, camera snapshot, or select a sample portrait."
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowPhotoModal(false);
                  setPhotoModalUser(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePhotoModal}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" /> Save Photo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
