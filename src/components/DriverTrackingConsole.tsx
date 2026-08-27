/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Bus,
  Navigation,
  Radio,
  Power,
  MapPin,
  Clock,
  Users,
  Phone,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  Sparkles,
  Shield,
  Compass,
  Gauge,
  Bell,
  RefreshCw,
  ChevronRight,
  BatteryCharging
} from 'lucide-react';
import { useAppStore } from '../storage';
import { TransportRoute, TransportStop } from '../types';

interface DriverTrackingConsoleProps {
  onLogout: () => void;
}

export const DriverTrackingConsole: React.FC<DriverTrackingConsoleProps> = ({ onLogout }) => {
  const { currentUser, transportRoutes, school, actions } = useAppStore();

  // Find the route assigned to this driver
  const myRoute = transportRoutes.find(r => 
    (currentUser?.id && r.driverUserId === currentUser.id) ||
    (currentUser?.name && r.driverName?.toLowerCase() === currentUser.name.toLowerCase()) ||
    (r.driverAccessCode && currentUser?.email && currentUser.email.includes(r.driverAccessCode.toLowerCase().replace(/[^a-z0-9]/g, '')))
  ) || transportRoutes[0] || null;

  const [isTracking, setIsTracking] = useState<boolean>(myRoute?.isTrackingActive ?? false);
  const [tripType, setTripType] = useState<TransportRoute['tripStatus']>(
    myRoute?.tripStatus === 'IDLE' ? 'AFTERNOON_DROPOFF' : (myRoute?.tripStatus || 'AFTERNOON_DROPOFF')
  );
  const [currentSpeed, setCurrentSpeed] = useState<number>(myRoute?.currentLocation?.speedKmH || 0);
  const [currentStopIdx, setCurrentStopIdx] = useState<number>(myRoute?.currentLocation?.currentStopIndex || 0);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [activeAlert, setActiveAlert] = useState<TransportRoute['activeAlert']>(myRoute?.activeAlert || null);
  const [simulatedProgress, setSimulatedProgress] = useState<number>(0);
  const [gpsAccuracy, setGpsAccuracy] = useState<string>('High Precision (±3m)');

  const intervalRef = useRef<any>(null);

  // Sync state if route changes in storage
  useEffect(() => {
    if (myRoute) {
      setIsTracking(myRoute.isTrackingActive);
      if (myRoute.tripStatus !== 'IDLE') {
        setTripType(myRoute.tripStatus);
      }
      if (myRoute.currentLocation) {
        setCurrentSpeed(myRoute.currentLocation.speedKmH);
        setCurrentStopIdx(myRoute.currentLocation.currentStopIndex);
      }
      setActiveAlert(myRoute.activeAlert || null);
    }
  }, [myRoute?.id, myRoute?.isTrackingActive, myRoute?.tripStatus]);

  // Live Location Simulation / Real Device GPS Broadcast Loop
  useEffect(() => {
    if (isTracking && myRoute) {
      const stops = myRoute.stops && myRoute.stops.length > 0 ? myRoute.stops : [
        { id: 's1', name: 'School Campus', lat: 6.4281, lng: 3.4219 },
        { id: 's2', name: 'Stop 1', lat: 6.4385, lng: 3.4682 },
        { id: 's3', name: 'Stop 2', lat: 6.4421, lng: 3.5187 }
      ];

      intervalRef.current = setInterval(() => {
        setSimulatedProgress(prev => {
          const nextProg = (prev + 0.08) % 1;
          const stopIdx = Math.floor(nextProg * stops.length);
          const currentStop = stops[stopIdx];
          const nextStop = stops[(stopIdx + 1) % stops.length];

          // Interpolate between stops
          const fraction = (nextProg * stops.length) - stopIdx;
          const lat = currentStop.lat + ((nextStop?.lat || currentStop.lat) - currentStop.lat) * fraction;
          const lng = currentStop.lng + ((nextStop?.lng || currentStop.lng) - currentStop.lng) * fraction;
          
          const speed = Math.floor(28 + Math.sin(Date.now() / 3000) * 14); // Realistic urban speed 25-42 km/h
          const heading = Math.floor(70 + Math.sin(Date.now() / 5000) * 30);

          setCurrentSpeed(speed);
          setCurrentStopIdx(stopIdx);

          actions.updateDriverLocation(myRoute.id, {
            lat,
            lng,
            speedKmH: speed,
            heading,
            lastUpdated: new Date().toISOString(),
            currentStopIndex: stopIdx,
            addressDescription: `Near ${currentStop.name} (Heading toward ${nextStop?.name || 'Next Destination'})`,
            batteryLevel: 92
          });

          return nextProg;
        });
      }, 3500);

      // Also request real browser geolocation if permitted
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            setGpsAccuracy(`GPS Locked (±${Math.round(pos.coords.accuracy)}m)`);
          },
          err => {
            setGpsAccuracy('Live Simulated GPS Active');
          },
          { enableHighAccuracy: true }
        );
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setCurrentSpeed(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTracking, myRoute?.id]);

  const handleToggleTracking = () => {
    if (!myRoute) return;
    const nextState = !isTracking;
    setIsTracking(nextState);

    const newTripStatus = nextState ? (tripType === 'IDLE' ? 'AFTERNOON_DROPOFF' : tripType) : 'IDLE';
    actions.toggleDriverTracking(myRoute.id, nextState, newTripStatus);
  };

  const handleTripTypeChange = (type: TransportRoute['tripStatus']) => {
    setTripType(type);
    if (myRoute && isTracking) {
      actions.toggleDriverTracking(myRoute.id, true, type);
    }
  };

  const handleSendAlert = (type: 'DELAY' | 'TRAFFIC' | 'EMERGENCY' | 'INFO', msg: string) => {
    if (!myRoute) return;
    const alertObj = {
      type,
      message: msg,
      timestamp: new Date().toISOString()
    };
    setActiveAlert(alertObj);
    actions.broadcastDriverAlert(myRoute.id, alertObj);
    setAlertMessage('');
  };

  const handleClearAlert = () => {
    if (!myRoute) return;
    setActiveAlert(null);
    actions.broadcastDriverAlert(myRoute.id, null);
  };

  const stops = myRoute?.stops || [];
  const currentStop = stops[currentStopIdx] || stops[0] || null;
  const nextStop = (stops && stops.length > currentStopIdx + 1) ? stops[currentStopIdx + 1] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Driver Header */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3.5 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-bold shadow-md shadow-amber-500/10">
            <Bus className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-white">
                Driver Console
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {myRoute?.vehicleNo || 'BUS-01'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {currentUser?.name || myRoute?.driverName || 'Driver'} • {school?.name || 'Apex Horizon'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Radio className={`h-3.5 w-3.5 ${isTracking ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span>{isTracking ? 'Broadcasting Live' : 'GPS Offline'}</span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-700/80 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            title="Sign Out of Driver Console"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Single-Screen Driver Cockpit */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Notice of Strict Driver Isolation */}
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-700/50 text-amber-200 text-xs flex items-start gap-3">
          <Shield className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-amber-300">Driver Mode Active</p>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              Your driver account is strictly configured for real-time location broadcasting. Turn on the toggle below when beginning your student pickup or drop-off run so parents and school management can track your movement live.
            </p>
          </div>
        </div>

        {/* PRIMARY HERO: LIVE GPS BROADCAST TOGGLE */}
        <div className={`relative overflow-hidden rounded-3xl border transition-all duration-500 p-6 sm:p-8 ${
          isTracking
            ? 'bg-gradient-to-b from-emerald-950/60 via-slate-900/90 to-slate-950 border-emerald-500/60 shadow-2xl shadow-emerald-900/20'
            : 'bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-slate-800 shadow-xl'
        }`}>
          
          {/* Animated radar circles when active */}
          {isTracking && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-72 h-72 rounded-full border border-emerald-500/20 animate-ping opacity-40" />
              <div className="w-96 h-96 rounded-full border border-emerald-500/10 animate-pulse opacity-30 -m-12" />
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border"
              style={{
                backgroundColor: isTracking ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                borderColor: isTracking ? 'rgba(16, 185, 129, 0.5)' : 'rgba(100, 116, 139, 0.3)',
                color: isTracking ? '#34d399' : '#94a3b8'
              }}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${isTracking ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span>{isTracking ? 'GPS BROADCASTING ACTIVE' : 'TRACKING IS TURNED OFF'}</span>
            </div>

            {/* Giant High-Visibility Power Toggle Button */}
            <button
              onClick={handleToggleTracking}
              className={`group relative h-36 w-36 sm:h-44 sm:w-44 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer select-none ${
                isTracking
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-2xl shadow-emerald-500/40 ring-8 ring-emerald-500/20 hover:ring-emerald-500/30'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-2 border-slate-700 shadow-lg ring-4 ring-slate-800'
              }`}
            >
              <Power className={`h-12 w-12 sm:h-16 sm:w-16 transition-transform duration-300 group-hover:scale-110 ${isTracking ? 'text-slate-950' : 'text-slate-400'}`} />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider mt-2">
                {isTracking ? 'TAP TO STOP' : 'TAP TO START'}
              </span>
            </button>

            {/* Vehicle & Route Summary */}
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {myRoute?.routeName || 'School Shuttle Bus Route'}
              </h2>
              <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
                <span>Vehicle: <strong className="text-slate-200">{myRoute?.vehicleModel || 'Toyota Coaster'}</strong></span>
                <span>•</span>
                <span>Plate: <strong className="text-amber-400 font-mono">{myRoute?.vehicleNo || 'LAG-849-XY'}</strong></span>
              </p>
            </div>

            {/* Live Telemetry Grid */}
            <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-slate-800/80">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-1 font-semibold">
                  <Gauge className="h-3.5 w-3.5 text-indigo-400" /> Speed
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono text-white">
                  {isTracking ? currentSpeed : 0} <span className="text-[10px] font-normal text-slate-400">km/h</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-1 font-semibold">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" /> Current Stop
                </div>
                <div className="text-sm sm:text-base font-bold text-amber-300 truncate">
                  Stop {currentStopIdx + 1} of {stops.length || 1}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-1 font-semibold">
                  <Users className="h-3.5 w-3.5 text-emerald-400" /> Students
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono text-emerald-300">
                  {myRoute?.assignedStudentIds?.length || 2} <span className="text-[10px] font-normal text-slate-400">on bus</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TRIP MODE SELECTOR */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Select Current Trip Run</span>
            <span className="text-[10px] text-slate-500 font-normal">{gpsAccuracy}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleTripTypeChange('MORNING_PICKUP')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                tripType === 'MORNING_PICKUP'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-md shadow-amber-950/30 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Clock className="h-4 w-4 mx-auto mb-1 text-amber-400" />
              <p className="text-xs">Morning</p>
              <p className="text-[10px] text-slate-400">Pickup Run</p>
            </button>

            <button
              type="button"
              onClick={() => handleTripTypeChange('AFTERNOON_DROPOFF')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                tripType === 'AFTERNOON_DROPOFF'
                  ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-950/30 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Bus className="h-4 w-4 mx-auto mb-1 text-indigo-400" />
              <p className="text-xs">Afternoon</p>
              <p className="text-[10px] text-slate-400">Drop-off Run</p>
            </button>

            <button
              type="button"
              onClick={() => handleTripTypeChange('SPECIAL_TRIP')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                tripType === 'SPECIAL_TRIP'
                  ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-md shadow-purple-950/30 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Sparkles className="h-4 w-4 mx-auto mb-1 text-purple-400" />
              <p className="text-xs">Excursion</p>
              <p className="text-[10px] text-slate-400">Special Trip</p>
            </button>
          </div>
        </div>

        {/* ACTIVE ALERT BANNER (IF ANY) */}
        {activeAlert && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-start justify-between gap-3 text-rose-200 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-300">Broadcast Alert to Parents Active</p>
                <p className="text-[11px] text-rose-200/90 mt-0.5">{activeAlert.message}</p>
                <p className="text-[10px] text-slate-400 mt-1">Sent at {new Date(activeAlert.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
            <button
              onClick={handleClearAlert}
              className="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[11px] font-bold transition-colors cursor-pointer shrink-0"
            >
              Dismiss Alert
            </button>
          </div>
        )}

        {/* QUICK ALERT BROADCAST BUTTONS */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Quick Delay / Traffic Broadcast (Alerts Parents)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleSendAlert('TRAFFIC', 'Bus experiencing heavy traffic on Lekki Expressway. Delayed by approx 15 mins.')}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500 text-left text-slate-300 text-xs transition-colors cursor-pointer"
            >
              <p className="font-bold text-amber-400">🚦 Traffic Jam</p>
              <p className="text-[10px] text-slate-400">15 min delay alert</p>
            </button>

            <button
              type="button"
              onClick={() => handleSendAlert('DELAY', 'Heavy rainfall in area. Vehicle moving at safe reduced speed.')}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500 text-left text-slate-300 text-xs transition-colors cursor-pointer"
            >
              <p className="font-bold text-blue-400">🌧️ Heavy Rain</p>
              <p className="text-[10px] text-slate-400">Safe speed notice</p>
            </button>

            <button
              type="button"
              onClick={() => handleSendAlert('INFO', 'All students dropped off safely at their designated stops.')}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500 text-left text-slate-300 text-xs transition-colors cursor-pointer"
            >
              <p className="font-bold text-emerald-400">✅ All Dropped Off</p>
              <p className="text-[10px] text-slate-400">Safe trip complete</p>
            </button>

            <button
              type="button"
              onClick={() => handleSendAlert('EMERGENCY', 'Vehicle undergoing brief roadside tire inspection. Parents please stand by.')}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-rose-500 text-left text-slate-300 text-xs transition-colors cursor-pointer"
            >
              <p className="font-bold text-rose-400">⚠️ Quick Check</p>
              <p className="text-[10px] text-slate-400">Vehicle stop notice</p>
            </button>
          </div>
        </div>

        {/* ROUTE STOPS PROGRESSION */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-400" /> Route Stops & Waypoints
            </h3>
            <span className="text-[11px] text-slate-400">
              {stops.length} Designated Stops
            </span>
          </div>

          <div className="space-y-2.5">
            {stops.map((stp, idx) => {
              const isPast = idx < currentStopIdx;
              const isCurrent = idx === currentStopIdx;
              return (
                <div
                  key={stp.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-amber-950/40 border-amber-500/80 text-amber-200 shadow-md shadow-amber-950/20'
                      : isPast
                      ? 'bg-slate-950/40 border-slate-800 text-slate-500'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                        : isPast
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isPast ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">{stp.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {isCurrent ? 'Current Location / Next Stop' : isPast ? 'Completed Stop' : `Scheduled Stop • ETA ${stp.estimatedTime || '--:--'}`}
                      </p>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      BUS HERE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* DRIVER CREDENTIAL CARD SUMMARY */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
          <p>Logged in with Driver Access Code: <strong className="font-mono text-amber-300">{myRoute?.driverAccessCode || 'DRV-8492-BUS'}</strong></p>
          <p className="text-[11px] text-slate-500 mt-0.5">Assigned to {myRoute?.driverName} • Contact: {myRoute?.driverPhone}</p>
        </div>

      </main>
    </div>
  );
};
