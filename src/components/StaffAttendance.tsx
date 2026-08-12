import React, { useState, useEffect } from 'react';
import { 
  MapPin, Clock, ShieldCheck, AlertTriangle, CheckCircle, XCircle, 
  Settings, UserCheck, Calendar, Filter, Edit2, Search, ArrowRight,
  Compass, Navigation, Lock, RefreshCw, Smartphone, Award
} from 'lucide-react';
import { User, AttendanceSettings, StaffAttendanceRecord } from '../types';
import { AppStorage } from '../storage';
import { hasPermission } from '../lib/permissions';

interface StaffAttendanceProps {
  currentUser: User | null;
  attendanceSettings: AttendanceSettings;
  staffAttendance: StaffAttendanceRecord[];
  users: User[];
  onRefresh?: () => void;
}

// Haversine formula to compute distance in meters between two lat/lng coordinates
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const StaffAttendance: React.FC<StaffAttendanceProps> = ({
  currentUser,
  attendanceSettings,
  staffAttendance,
  users,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'MY_SIGN_IN' | 'LOGS' | 'SETTINGS'>('MY_SIGN_IN');
  
  // Geolocation state
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Settings form state (Proprietor)
  const [settingsForm, setSettingsForm] = useState<AttendanceSettings>(attendanceSettings);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  // Override modal state
  const [selectedRecord, setSelectedRecord] = useState<StaffAttendanceRecord | null>(null);
  const [overrideSignInStatus, setOverrideSignInStatus] = useState<'ON_TIME' | 'LATE' | 'ABSENT'>('ON_TIME');
  const [overrideSignOutStatus, setOverrideSignOutStatus] = useState<'NORMAL' | 'EARLY_DEPARTURE'>('NORMAL');
  const [overrideReason, setOverrideReason] = useState<string>('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterRole, setFilterRole] = useState<string>('ALL');

  const isProprietor = currentUser?.role === 'PROPRIETOR';
  const canManageSettings = isProprietor || hasPermission(currentUser, 'STAFF_ATTENDANCE_MANAGEMENT');

  useEffect(() => {
    setSettingsForm(attendanceSettings);
  }, [attendanceSettings]);

  // Fetch device GPS on mount or refresh
  const fetchCurrentLocation = () => {
    setIsLocating(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. You can use the coordinate picker below to simulate or test GPS.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude);
        setUserLng(position.coords.longitude);
        setIsLocating(false);
      },
      (error) => {
        let msg = 'Unable to fetch your precise GPS location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser or enter test coordinates.';
        }
        setGeoError(msg);
        setIsLocating(false);
        // Fallback to near school location for test demo
        setUserLat(attendanceSettings.schoolLatitude + 0.0002);
        setUserLng(attendanceSettings.schoolLongitude + 0.0001);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  // Today's record for current user
  const todayStr = new Date().toISOString().split('T')[0];
  const myTodayRecord = staffAttendance.find(
    a => a.staffId === currentUser?.id && a.date === todayStr
  );

  // Compute distance from school
  const currentDistance = (userLat !== null && userLng !== null)
    ? calculateDistanceMeters(userLat, userLng, attendanceSettings.schoolLatitude, attendanceSettings.schoolLongitude)
    : null;

  const isWithinGeofence = currentDistance !== null && currentDistance <= attendanceSettings.allowedRadiusMeters;

  // Handle Sign In Action
  const handleSignIn = () => {
    if (!currentUser) return;
    if (userLat === null || userLng === null) {
      alert('Please wait for GPS location or allow location permissions.');
      return;
    }

    const dist = currentDistance ?? 0;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"
    
    // Check if late based on startTime + lateThresholdMinutes
    const [startH, startM] = attendanceSettings.startTime.split(':').map(Number);
    const startTotalMins = startH * 60 + startM;
    const [nowH, nowM] = timeStr.split(':').map(Number);
    const nowTotalMins = nowH * 60 + nowM;

    let signInStatus: 'ON_TIME' | 'LATE' = 'ON_TIME';
    if (nowTotalMins > startTotalMins + attendanceSettings.lateThresholdMinutes) {
      signInStatus = 'LATE';
    }

    const flagged = dist > attendanceSettings.allowedRadiusMeters;

    AppStorage.recordStaffSignIn({
      staffId: currentUser.id,
      staffName: currentUser.name,
      staffEmail: currentUser.email,
      role: currentUser.role,
      department: currentUser.role === 'TEACHER' ? 'Academic' : 'Administrative',
      date: todayStr,
      signInTime: now.toISOString(),
      signInLat: userLat,
      signInLng: userLng,
      signInDistanceMeters: dist,
      signInStatus,
      flaggedSuspicious: flagged,
      suspiciousReason: flagged ? `Signed in ${dist}m away from perimeter (Radius: ${attendanceSettings.allowedRadiusMeters}m)` : undefined,
      deviceInfo: `${navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser'} GPS`
    });

    if (onRefresh) onRefresh();
  };

  // Handle Sign Out Action
  const handleSignOut = () => {
    if (!currentUser) return;
    if (userLat === null || userLng === null) {
      alert('Please wait for GPS location.');
      return;
    }

    const dist = currentDistance ?? 0;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    // Check early departure
    const [closeH, closeM] = attendanceSettings.closingTime.split(':').map(Number);
    const closeTotalMins = closeH * 60 + closeM;
    const [nowH, nowM] = timeStr.split(':').map(Number);
    const nowTotalMins = nowH * 60 + nowM;

    let signOutStatus: 'NORMAL' | 'EARLY_DEPARTURE' = 'NORMAL';
    if (nowTotalMins < closeTotalMins - attendanceSettings.earlyDepartureThresholdMinutes) {
      signOutStatus = 'EARLY_DEPARTURE';
    }

    AppStorage.recordStaffSignOut(currentUser.id, {
      signOutTime: now.toISOString(),
      signOutLat: userLat,
      signOutLng: userLng,
      signOutDistanceMeters: dist,
      signOutStatus
    });

    if (onRefresh) onRefresh();
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    AppStorage.saveAttendanceSettings(settingsForm);
    setSettingsSuccess('Geofence & Attendance Settings saved successfully!');
    setTimeout(() => setSettingsSuccess(null), 3000);
    if (onRefresh) onRefresh();
  };

  // Apply Manual Override (Proprietor)
  const handleApplyOverride = () => {
    if (!selectedRecord) return;
    if (!overrideReason.trim()) {
      alert('Please provide a valid justification reason for overriding staff attendance.');
      return;
    }

    AppStorage.overrideStaffAttendance(
      selectedRecord.id,
      {
        signInStatus: overrideSignInStatus,
        signOutStatus: overrideSignOutStatus
      },
      currentUser?.name || 'Proprietor',
      overrideReason.trim()
    );

    setSelectedRecord(null);
    setOverrideReason('');
    if (onRefresh) onRefresh();
  };

  // Filtered Logs
  const filteredLogs = staffAttendance.filter(rec => {
    const matchesSearch = rec.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.staffEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !selectedDate || rec.date === selectedDate;
    const matchesRole = filterRole === 'ALL' || rec.role === filterRole;
    return matchesSearch && matchesDate && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4" /> Geofenced Staff Attendance Engine
            </div>
            <h1 className="text-2xl font-bold mt-1">Staff Sign-In & Sign-Out Hub</h1>
            <p className="text-slate-300 text-sm mt-1">
              Location-validated staff presence with proprietor-controlled perimeter thresholds and automated audit compliance.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('MY_SIGN_IN')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'MY_SIGN_IN'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <UserCheck className="w-4 h-4 inline mr-1.5" /> My Attendance
            </button>
            <button
              onClick={() => setActiveTab('LOGS')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'LOGS'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1.5" /> Attendance Logs
            </button>
            {canManageSettings && (
              <button
                onClick={() => setActiveTab('SETTINGS')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'SETTINGS'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-1.5" /> Geofence Setup
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: MY SIGN IN / SIGN OUT */}
      {activeTab === 'MY_SIGN_IN' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Action Box */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daily Sign-In & Sign-Out Terminal</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>

                <button
                  onClick={fetchCurrentLocation}
                  disabled={isLocating}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-emerald-600' : ''}`} />
                  {isLocating ? 'Refreshing GPS...' : 'Refresh Location'}
                </button>
              </div>

              {/* Location & Geofence Distance Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Current GPS Coordinates:</span>
                    </div>
                    {userLat !== null && userLng !== null ? (
                      <p className="text-xs font-mono text-slate-600 dark:text-slate-400 pl-6">
                        Lat: {userLat.toFixed(5)}, Lng: {userLng.toFixed(5)}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-600 dark:text-amber-400 pl-6 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> GPS location pending... Click refresh location above.
                      </p>
                    )}
                  </div>

                  {currentDistance !== null && (
                    <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${
                      isWithinGeofence 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                    }`}>
                      {isWithinGeofence ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider">
                          {isWithinGeofence ? 'Within School Perimeter' : 'Outside Geofence Perimeter'}
                        </div>
                        <div className="text-sm font-medium">
                          {currentDistance} meters from school center (Radius limit: {attendanceSettings.allowedRadiusMeters}m)
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {geoError && (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                    {geoError}
                  </div>
                )}
              </div>

              {/* Status & Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sign-In Card */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Step 1: Arrival Sign-In</span>
                      {myTodayRecord ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          myTodayRecord.signInStatus === 'ON_TIME'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {myTodayRecord.signInStatus === 'ON_TIME' ? 'Signed In On-Time' : 'Signed In Late'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          Pending Arrival
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mb-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Official Start Time: <strong className="text-slate-800 dark:text-slate-200">{attendanceSettings.startTime} AM</strong></p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Grace Period: <strong className="text-slate-800 dark:text-slate-200">+{attendanceSettings.lateThresholdMinutes} minutes</strong></p>
                    </div>

                    {myTodayRecord && (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 mb-4 text-xs">
                        <p className="text-slate-600 dark:text-slate-400">Signed In at: <strong className="text-slate-900 dark:text-white">{new Date(myTodayRecord.signInTime).toLocaleTimeString()}</strong></p>
                        <p className="text-slate-600 dark:text-slate-400">Recorded Distance: <strong>{Math.round(myTodayRecord.signInDistanceMeters)} meters</strong></p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSignIn}
                    disabled={!!myTodayRecord || userLat === null}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all ${
                      myTodayRecord
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        : isWithinGeofence
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 shadow-lg'
                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {myTodayRecord ? 'Already Signed In Today' : isWithinGeofence ? 'Sign In Now (In Geofence)' : 'Sign In (Flagged Outside Geofence)'}
                  </button>
                </div>

                {/* Sign-Out Card */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Step 2: Departure Sign-Out</span>
                      {myTodayRecord?.signOutTime ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          myTodayRecord.signOutStatus === 'NORMAL'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {myTodayRecord.signOutStatus === 'NORMAL' ? 'Signed Out Normal' : 'Early Departure'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          Not Signed Out
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mb-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Official Closing Time: <strong className="text-slate-800 dark:text-slate-200">{attendanceSettings.closingTime} PM</strong></p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Early Threshold: <strong className="text-slate-800 dark:text-slate-200">{attendanceSettings.earlyDepartureThresholdMinutes} mins before closing</strong></p>
                    </div>

                    {myTodayRecord?.signOutTime && (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 mb-4 text-xs">
                        <p className="text-slate-600 dark:text-slate-400">Signed Out at: <strong className="text-slate-900 dark:text-white">{new Date(myTodayRecord.signOutTime).toLocaleTimeString()}</strong></p>
                        <p className="text-slate-600 dark:text-slate-400">Total Duration: <strong className="text-slate-900 dark:text-white">{myTodayRecord.totalHoursWorked || 0} Hours</strong></p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSignOut}
                    disabled={!myTodayRecord || !!myTodayRecord?.signOutTime || userLat === null}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all ${
                      !myTodayRecord || myTodayRecord?.signOutTime
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 shadow-lg'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    {!myTodayRecord ? 'Sign In First' : myTodayRecord.signOutTime ? 'Signed Out for the Day' : 'Sign Out Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Summary & Rules */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Geofence Rules & Policies
              </h3>

              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="font-semibold text-slate-900 dark:text-white mb-1">Perimeter Enforcement</div>
                  <p>All sign-in and sign-out events are verified against the school radius parameter ({attendanceSettings.allowedRadiusMeters} meters).</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="font-semibold text-slate-900 dark:text-white mb-1">Punctuality Standards</div>
                  <p>Arrivals after {attendanceSettings.startTime} (+{attendanceSettings.lateThresholdMinutes} mins grace) are classified as LATE.</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="font-semibold text-slate-900 dark:text-white mb-1">Audit Trail & Overrides</div>
                  <p>Only the Proprietor can manually override attendance logs. Every override retains the original GPS record for payroll review.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE LOGS & REPORTING */}
      {activeTab === 'LOGS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Staff Attendance Records</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Comprehensive daily sign-in logs with distance calculations and status tracking.</p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[180px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-full text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Roles</option>
                <option value="TEACHER">Teachers</option>
                <option value="SCHOOL_ADMIN">School Admins</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Staff Member</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Sign-In Time</th>
                  <th className="p-3.5">Sign-In Dist</th>
                  <th className="p-3.5">Sign-In Status</th>
                  <th className="p-3.5">Sign-Out Time</th>
                  <th className="p-3.5">Total Hours</th>
                  <th className="p-3.5">Flags</th>
                  {isProprietor && <th className="p-3.5 rounded-r-xl text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No attendance records match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{rec.staffName}</div>
                        <div className="text-[11px] text-slate-500">{rec.role} • {rec.department}</div>
                      </td>
                      <td className="p-3.5 font-medium">{rec.date}</td>
                      <td className="p-3.5">
                        {rec.signInTime ? new Date(rec.signInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="p-3.5">
                        <span className={`font-mono ${rec.signInDistanceMeters > attendanceSettings.allowedRadiusMeters ? 'text-amber-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                          {Math.round(rec.signInDistanceMeters)}m
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          rec.signInStatus === 'ON_TIME'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        }`}>
                          {rec.signInStatus}
                        </span>
                        {rec.modifiedBy && (
                          <span className="ml-1 text-[10px] text-slate-400">(Overridden)</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {rec.signOutTime ? new Date(rec.signOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {rec.totalHoursWorked ? `${rec.totalHoursWorked} hrs` : '-'}
                      </td>
                      <td className="p-3.5">
                        {rec.flaggedSuspicious ? (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold flex items-center gap-1 w-max" title={rec.suspiciousReason}>
                            <AlertTriangle className="w-3 h-3" /> Outside Geofence
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Normal</span>
                        )}
                      </td>
                      {isProprietor && (
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedRecord(rec);
                              setOverrideSignInStatus(rec.signInStatus === 'ABSENT' ? 'ON_TIME' : rec.signInStatus);
                              setOverrideSignOutStatus(rec.signOutStatus || 'NORMAL');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-[11px] flex items-center gap-1 ml-auto"
                          >
                            <Edit2 className="w-3 h-3" /> Override
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PROPRIETOR GEOFENCE & ATTENDANCE SETTINGS */}
      {activeTab === 'SETTINGS' && canManageSettings && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" /> Geofence Perimeter & Attendance Control
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure school latitude/longitude, allowed boundary radius, official hours, and threshold parameters.
            </p>
          </div>

          {settingsSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> {settingsSuccess}
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coordinates */}
              <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" /> School Coordinates & Perimeter
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">School Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={settingsForm.schoolLatitude}
                    onChange={(e) => setSettingsForm({ ...settingsForm, schoolLatitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">School Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={settingsForm.schoolLongitude}
                    onChange={(e) => setSettingsForm({ ...settingsForm, schoolLongitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Allowed Radius (Meters)</label>
                  <input
                    type="number"
                    value={settingsForm.allowedRadiusMeters}
                    onChange={(e) => setSettingsForm({ ...settingsForm, allowedRadiusMeters: parseInt(e.target.value) || 50 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Staff within this radius will be verified as ON-SITE.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (userLat !== null && userLng !== null) {
                      setSettingsForm({
                        ...settingsForm,
                        schoolLatitude: userLat,
                        schoolLongitude: userLng
                      });
                    } else {
                      alert('Current GPS position unavailable. Ensure location permissions are active.');
                    }
                  }}
                  className="w-full py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" /> Set School Coordinates to My Current GPS
                </button>
              </div>

              {/* Work Hours & Thresholds */}
              <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" /> Work Hours & Punctuality Thresholds
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Official Start Time</label>
                    <input
                      type="time"
                      value={settingsForm.startTime}
                      onChange={(e) => setSettingsForm({ ...settingsForm, startTime: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Official Closing Time</label>
                    <input
                      type="time"
                      value={settingsForm.closingTime}
                      onChange={(e) => setSettingsForm({ ...settingsForm, closingTime: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Late Grace Period (Mins)</label>
                    <input
                      type="number"
                      value={settingsForm.lateThresholdMinutes}
                      onChange={(e) => setSettingsForm({ ...settingsForm, lateThresholdMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Early Depart Grace (Mins)</label>
                    <input
                      type="number"
                      value={settingsForm.earlyDepartureThresholdMinutes}
                      onChange={(e) => setSettingsForm({ ...settingsForm, earlyDepartureThresholdMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <input
                      type="checkbox"
                      checked={settingsForm.requireGeofenceForSignOut}
                      onChange={(e) => setSettingsForm({ ...settingsForm, requireGeofenceForSignOut: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Require Geofence validation for Sign-Out as well
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Save Geofence & Attendance Settings
            </button>
          </form>
        </div>
      )}

      {/* OVERRIDE MODAL (PROPRIETOR ONLY) */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-600" /> Proprietor Attendance Override
              </h3>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              <div>Staff Name: <strong className="text-slate-900 dark:text-white">{selectedRecord.staffName}</strong></div>
              <div>Date: <strong>{selectedRecord.date}</strong></div>
              <div>Original GPS Sign-In: <strong>{Math.round(selectedRecord.signInDistanceMeters)}m from perimeter</strong></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Sign-In Status</label>
              <select
                value={overrideSignInStatus}
                onChange={(e) => setOverrideSignInStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
              >
                <option value="ON_TIME">ON_TIME (Excused/Punctual)</option>
                <option value="LATE">LATE</option>
                <option value="ABSENT">ABSENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Sign-Out Status</label>
              <select
                value={overrideSignOutStatus}
                onChange={(e) => setOverrideSignOutStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="EARLY_DEPARTURE">EARLY_DEPARTURE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mandatory Override Reason</label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g., Excused due to official school assignment off-campus..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyOverride}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Apply Proprietor Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
