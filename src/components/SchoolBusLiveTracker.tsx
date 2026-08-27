/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Bus,
  Navigation,
  Radio,
  MapPin,
  Clock,
  Users,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Copy,
  ExternalLink,
  Shield,
  Gauge,
  Compass,
  Search,
  ChevronRight,
  Sparkles,
  RefreshCw,
  X,
  Eye,
  KeyRound,
  Info
} from 'lucide-react';
import { useAppStore } from '../storage';
import { TransportRoute, TransportStop, Student } from '../types';

interface SchoolBusLiveTrackerProps {
  onBack?: () => void;
  defaultRouteId?: string;
}

export const SchoolBusLiveTracker: React.FC<SchoolBusLiveTrackerProps> = ({ onBack, defaultRouteId }) => {
  const { transportRoutes, currentUser, students, actions, school } = useAppStore();
  
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    defaultRouteId || transportRoutes[0]?.id || ''
  );
  
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [manifestSearch, setManifestSearch] = useState('');

  // New Driver Form State (for Proprietor / Admin)
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newVehicleNo, setNewVehicleNo] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('Toyota Coaster Bus (30-Seater)');
  const [newCapacity, setNewCapacity] = useState(30);
  const [newRouteName, setNewRouteName] = useState('');
  const [newStops, setNewStops] = useState<Array<{ name: string; estimatedTime: string }>>([
    { name: 'School Main Campus (Departure)', estimatedTime: '15:30' },
    { name: 'Admiralty Way, Lekki Phase 1', estimatedTime: '15:55' },
    { name: 'Chevron Roundabout Bus Stop', estimatedTime: '16:20' }
  ]);
  const [newStopInput, setNewStopInput] = useState('');
  const [newStopTimeInput, setNewStopTimeInput] = useState('16:45');

  const isProprietorOrAdmin = currentUser?.role === 'SCHOOL_ADMIN';

  // Active selected route
  const activeRoute = transportRoutes.find(r => r.id === selectedRouteId) || transportRoutes[0] || null;

  useEffect(() => {
    if (!selectedRouteId && transportRoutes.length > 0 && transportRoutes[0]) {
      setSelectedRouteId(transportRoutes[0].id);
    }
  }, [transportRoutes, selectedRouteId]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleAddStop = () => {
    if (!newStopInput.trim()) return;
    setNewStops(prev => [
      ...prev,
      { name: newStopInput.trim(), estimatedTime: newStopTimeInput.trim() || '16:30' }
    ]);
    setNewStopInput('');
  };

  const handleRemoveStop = (idx: number) => {
    setNewStops(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateDriverRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim() || !newVehicleNo.trim() || !newRouteName.trim()) {
      alert('Please fill in all required driver and route fields.');
      return;
    }

    const stopsWithCoords: TransportStop[] = newStops.map((s, idx) => ({
      id: `stp_${Date.now()}_${idx}`,
      name: s.name,
      lat: 6.4281 + (idx * 0.015),
      lng: 3.4219 + (idx * 0.025),
      estimatedTime: s.estimatedTime
    }));

    const result = actions.createDriverAccount({
      driverName: newDriverName.trim(),
      driverPhone: newDriverPhone.trim() || '+234 800 000 0000',
      vehicleNo: newVehicleNo.trim().toUpperCase(),
      vehicleModel: newVehicleModel.trim(),
      capacity: Number(newCapacity) || 30,
      routeName: newRouteName.trim(),
      stops: stopsWithCoords
    });

    if (result) {
      setSelectedRouteId(result.route.id);
      setIsRegisterModalOpen(false);
      // Reset form
      setNewDriverName('');
      setNewDriverPhone('');
      setNewVehicleNo('');
      setNewRouteName('');
    }
  };

  // Filter routes
  const filteredRoutes = transportRoutes.filter(r => 
    r.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Student manifest for active route
  const assignedStudents = students.filter(s => 
    activeRoute?.assignedStudentIds?.includes(s.id) ||
    s.transportRouteId === activeRoute?.id
  );

  const filteredStudents = assignedStudents.filter(s =>
    s.name.toLowerCase().includes(manifestSearch.toLowerCase()) ||
    s.admissionNumber.toLowerCase().includes(manifestSearch.toLowerCase()) ||
    s.guardianPhone.toLowerCase().includes(manifestSearch.toLowerCase())
  );

  const stops = activeRoute?.stops || [];
  const currentStopIdx = activeRoute?.currentLocation?.currentStopIndex || 0;
  const currentStop = stops[currentStopIdx] || stops[0] || null;
  const nextStop = (stops && stops.length > currentStopIdx + 1) ? stops[currentStopIdx + 1] : null;

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow-lg shadow-amber-500/10">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Live School Bus Fleet & Tracking Hub
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  <Radio className="h-3 w-3 animate-pulse" /> Live Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time transit GPS tracking for Parents, Teachers, Principal, and School Proprietors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isProprietorOrAdmin && (
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Register New Driver & Bus Route</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fleet Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {transportRoutes.map(route => {
          const isSelected = route.id === selectedRouteId;
          const isLive = route.isTrackingActive;

          return (
            <div
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900/90 border-amber-500 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-slate-700">
                  {route.vehicleNo}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isLive
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  {isLive ? 'LIVE ON ROUTE' : 'PARKED / IDLE'}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white truncate">{route.routeName}</h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Driver: <strong className="text-slate-300">{route.driverName}</strong>
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Gauge className="h-3 w-3 text-indigo-400" />
                  <strong className="text-white">{isLive ? route.currentLocation?.speedKmH || 32 : 0}</strong> km/h
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-emerald-400" />
                  <strong className="text-white">{route.assignedStudentIds?.length || 0}</strong> Students
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Selected Bus Tracking Stage */}
      {activeRoute ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Interactive Visual Radar & Route Stepper */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Interactive Map Stage Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">
                      {activeRoute.routeName}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                      {activeRoute.vehicleNo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeRoute.vehicleModel} • Driver: <strong className="text-slate-200">{activeRoute.driverName}</strong> ({activeRoute.driverPhone})
                  </p>
                </div>

                {/* Driver Access Code Pill for Proprietor */}
                {isProprietorOrAdmin && activeRoute.driverAccessCode && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Driver Login Code</p>
                      <p className="font-mono font-bold text-amber-400">{activeRoute.driverAccessCode}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(activeRoute.driverAccessCode!)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Copy Driver Login Code"
                    >
                      {copiedCode === activeRoute.driverAccessCode ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Active Emergency / Delay Alert from Driver */}
              {activeRoute.activeAlert && (
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-start gap-3 text-rose-200 text-xs animate-pulse">
                  <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-rose-300 text-sm">Active Driver Traffic Alert</p>
                    <p className="text-rose-200/90 mt-0.5 leading-relaxed">{activeRoute.activeAlert.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Broadcasted at {new Date(activeRoute.activeAlert.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              )}

              {/* VISUAL GPS RADAR & MAP CANVAS SIMULATOR */}
              <div className="relative w-full h-72 sm:h-80 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between p-4">
                
                {/* Map Grid Background Graphics */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

                {/* Top Radar Overlay Overlay Badges */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs">
                    <span className={`h-2 w-2 rounded-full ${activeRoute.isTrackingActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                    <span className="font-bold text-white">
                      {activeRoute.isTrackingActive ? 'GPS Signal Connected' : 'Bus Tracking Offline (Parked)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span>Updated: {activeRoute.currentLocation?.lastUpdated ? new Date(activeRoute.currentLocation.lastUpdated).toLocaleTimeString() : 'Just now'}</span>
                  </div>
                </div>

                {/* Center Route Path & Live Moving Bus Representation */}
                <div className="relative z-10 my-auto py-6 px-4">
                  <div className="relative flex items-center justify-between">
                    {/* Connecting Route Line */}
                    <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1.5 bg-slate-800 rounded-full">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500 rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min(100, ((currentStopIdx + (activeRoute.isTrackingActive ? 0.5 : 0)) / Math.max(1, stops.length - 1)) * 100)}%`
                        }}
                      />
                    </div>

                    {/* Stops Nodes */}
                    {stops.map((stp, idx) => {
                      const isPast = idx < currentStopIdx;
                      const isCurrent = idx === currentStopIdx;
                      const isNext = idx === currentStopIdx + 1;

                      return (
                        <div key={stp.id} className="relative z-10 flex flex-col items-center group">
                          
                          {/* Node Icon */}
                          <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/30 scale-110'
                              : isPast
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-600'
                              : 'bg-slate-900 text-slate-400 border border-slate-700'
                          }`}>
                            {isPast ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : isCurrent ? (
                              <Bus className="h-6 w-6 animate-bounce text-slate-950" />
                            ) : (
                              <MapPin className="h-5 w-5" />
                            )}
                          </div>

                          {/* Stop Label */}
                          <div className="mt-2 text-center max-w-[100px] sm:max-w-[120px]">
                            <p className={`text-[11px] font-bold truncate ${isCurrent ? 'text-amber-300' : 'text-slate-300'}`}>
                              {stp.name}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {stp.estimatedTime || '--:--'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Telemetry HUD */}
                <div className="relative z-10 grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 bg-slate-900/80 backdrop-blur-md rounded-xl p-2.5 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold">Live Speed</p>
                    <p className="text-xs sm:text-sm font-bold font-mono text-white">
                      {activeRoute.isTrackingActive ? activeRoute.currentLocation?.speedKmH || 36 : 0} km/h
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold">Heading / Direction</p>
                    <p className="text-xs sm:text-sm font-bold text-amber-300">
                      {activeRoute.currentLocation?.heading || 84}° Eastbound
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold">Next Stop ETA</p>
                    <p className="text-xs sm:text-sm font-bold text-emerald-300">
                      {nextStop ? nextStop.estimatedTime : 'At Terminus'}
                    </p>
                  </div>
                </div>

              </div>

              {/* Waypoint Detailed Progression List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Designated Route Waypoints ({stops.length} Stops)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Trip: {activeRoute.tripStatus.replace('_', ' ')}</span>
                </h3>

                <div className="space-y-2">
                  {stops.map((stp, idx) => {
                    const isPast = idx < currentStopIdx;
                    const isCurrent = idx === currentStopIdx;

                    return (
                      <div
                        key={stp.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isCurrent
                            ? 'bg-amber-950/30 border-amber-500 text-amber-200 shadow-sm'
                            : isPast
                            ? 'bg-slate-950/30 border-slate-800 text-slate-500'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : isPast
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isPast ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                          </div>
                          <div>
                            <p className="text-xs font-bold">{stp.name}</p>
                            <p className="text-[10px] text-slate-400">
                              Estimated Arrival Time: <span className="font-mono font-bold text-slate-300">{stp.estimatedTime || 'N/A'}</span>
                            </p>
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            BUS IS HERE
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

          {/* Right Col: Driver Info & Student Passenger Manifest */}
          <div className="space-y-6">
            
            {/* Driver Profile Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Assigned Driver</span>
                <span className="text-[10px] text-slate-500 font-normal">Dedicated Transit Role</span>
              </h3>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="h-12 w-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-black text-base">
                  {activeRoute?.driverName ? activeRoute.driverName.split(/\s+/).filter(Boolean).map(n => n[0]).join('').slice(0, 2) : 'DR'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{activeRoute.driverName}</h4>
                  <p className="text-xs text-slate-400">{activeRoute.vehicleModel}</p>
                  <p className="text-xs text-amber-400 font-mono font-semibold">{activeRoute.vehicleNo}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <a
                  href={`tel:${activeRoute.driverPhone}`}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="h-4 w-4 text-emerald-400" />
                  <span>Call Driver ({activeRoute.driverPhone})</span>
                </a>

                {isProprietorOrAdmin && activeRoute.driverAccessCode && (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 space-y-1">
                    <p className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1">
                      <KeyRound className="h-3 w-3" /> Driver Access Code
                    </p>
                    <p className="font-mono text-sm font-black text-amber-300">{activeRoute.driverAccessCode}</p>
                    <p className="text-[10px] text-slate-400">Give this code to the driver to sign in at the Driver Portal.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Student Passenger Manifest */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Student Passenger Manifest
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {assignedStudents.length} Students Assigned
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                  Cap: {activeRoute.capacity || 30}
                </span>
              </div>

              {/* Manifest Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search passenger by name..."
                  value={manifestSearch}
                  onChange={e => setManifestSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Student list */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(std => (
                    <div
                      key={std.id}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-white">{std.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {std.className} • Adm: <span className="font-mono text-indigo-300">{std.admissionNumber}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                          {std.guardianPhone || 'Guardian'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {std.pickupStopName || 'Assigned Stop'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                    No matching student passengers found.
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-400">
          <Bus className="h-10 w-10 mx-auto text-slate-600 mb-2" />
          <p className="font-bold">No transport routes configured yet.</p>
          <p className="text-xs text-slate-500 mt-1">School Proprietor or Admin can click the button above to register the first driver and bus route.</p>
        </div>
      )}

      {/* PROPRIETOR / ADMIN MODAL: REGISTER NEW DRIVER & ROUTE */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-bold">
                  <Bus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Register New Driver & Bus Route</h2>
                  <p className="text-xs text-slate-400">Creates an isolated driver account with a unique login code</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDriverRoute} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Driver Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Emmanuel Okon"
                    value={newDriverName}
                    onChange={e => setNewDriverName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Driver Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +234 803 123 4567"
                    value={newDriverPhone}
                    onChange={e => setNewDriverPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Vehicle Plate No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KJA-482-AB"
                    value={newVehicleNo}
                    onChange={e => setNewVehicleNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono uppercase placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Vehicle Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Toyota HiAce / Coaster"
                    value={newVehicleModel}
                    onChange={e => setNewVehicleModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Capacity (Seats)</label>
                  <input
                    type="number"
                    min="5"
                    max="80"
                    value={newCapacity}
                    onChange={e => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Route Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lekki Phase 1 & Ikoyi Shuttle"
                  value={newRouteName}
                  onChange={e => setNewRouteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Waypoints & Stops Config */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Route Stops & Estimated Drop-off Times
                </label>

                <div className="space-y-2">
                  {newStops.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-white">{s.name}</span>
                        <span className="text-slate-400 font-mono text-[10px]">({s.estimatedTime})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1 transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="New stop name (e.g. VGC Roundabout)"
                    value={newStopInput}
                    onChange={e => setNewStopInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Time e.g. 16:15"
                    value={newStopTimeInput}
                    onChange={e => setNewStopTimeInput(e.target.value)}
                    className="w-24 px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-200 text-xs flex items-start gap-2.5">
                <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  An isolated Driver Account with a generated Access Code (e.g. <span className="font-mono font-bold text-amber-300">DRV-XXXX-BUS</span>) will be provisioned immediately. The driver will only see the live GPS tracking toggle when logging in.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-600/30 transition-colors cursor-pointer"
                >
                  Save & Provision Driver Account
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
