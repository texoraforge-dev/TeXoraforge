/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users,
  Send,
  Search,
  MessageSquare,
  ShieldCheck,
  Megaphone,
  HelpCircle,
  Calendar,
  Sparkles,
  UserCheck,
  Building2,
  GraduationCap
} from 'lucide-react';
import { useAppStore } from '../storage';
import { PublicChatMessage, UserRole } from '../types';

interface PublicParentTeacherChatProps {
  onStartDirectChat?: (targetUserId?: string) => void;
}

type ChannelType = 'general-announcements' | 'pta-forum' | 'academic-qa' | 'school-events';

const CHANNELS: { id: ChannelType; label: string; icon: any; desc: string }[] = [
  {
    id: 'general-announcements',
    label: 'General Announcements',
    icon: Megaphone,
    desc: 'Official updates from School Management, VP, and Proprietor.'
  },
  {
    id: 'pta-forum',
    label: 'PTA & School Forum',
    icon: Users,
    desc: 'Open discussions between Parents, Teachers, and Executives.'
  },
  {
    id: 'academic-qa',
    label: 'Academic Q&A',
    icon: HelpCircle,
    desc: 'Ask questions regarding curriculum, exams, and assignments.'
  },
  {
    id: 'school-events',
    label: 'School Events',
    icon: Calendar,
    desc: 'Planning and updates for sports, excursions, and ceremonies.'
  }
];

export const PublicParentTeacherChat: React.FC<PublicParentTeacherChatProps> = ({ onStartDirectChat }) => {
  const { school, currentUser, publicChatMessages, actions } = useAppStore();
  const [activeChannel, setActiveChannel] = useState<ChannelType>('general-announcements');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isProprietor = currentUser?.role === 'PROPRIETOR';

  // Filter messages by active channel and search query
  const channelMessages = useMemo(() => {
    let list = publicChatMessages.filter(m => m.channel === activeChannel);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(m => m.content.toLowerCase().includes(q) || m.senderName.toLowerCase().includes(q));
    }
    return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [publicChatMessages, activeChannel, searchTerm]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length, activeChannel]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !currentUser || !school) return;

    actions.sendPublicChatMessage(
      school.id,
      activeChannel,
      currentUser,
      newMessage.trim()
    );

    setNewMessage('');
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'PROPRIETOR':
        return { label: 'Proprietor', icon: Sparkles, bg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800' };
      case 'VICE_PRINCIPAL':
        return { label: 'Vice Principal', icon: ShieldCheck, bg: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800' };
      case 'SCHOOL_ADMIN':
        return { label: 'School Admin', icon: Building2, bg: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800' };
      case 'TEACHER':
        return { label: 'Teacher', icon: GraduationCap, bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800' };
      case 'PARENT':
        return { label: 'Parent', icon: Users, bg: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-800' };
      default:
        return { label: role, icon: UserCheck, bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200' };
    }
  };

  const activeChannelInfo = CHANNELS.find(c => c.id === activeChannel)!;

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/30 rounded-xl border border-indigo-500/30">
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Parent-Teacher Room (Public Forum)
            </h1>
          </div>
          <p className="text-xs text-indigo-200 font-medium">
            A communal forum accessible to all Teachers, Parents, Vice Principals, School Admins, and the Proprietor.
          </p>
        </div>

        {onStartDirectChat && (
          <button
            onClick={() => onStartDirectChat()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0"
          >
            <MessageSquare className="h-4 w-4" />
            Switch to 1-on-1 Direct Chat
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Channels & Search */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search forum messages..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Channels Header */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 mb-2">
                Forum Channels
              </p>

              <div className="space-y-1.5">
                {CHANNELS.map(ch => {
                  const Icon = ch.icon;
                  const isActive = activeChannel === ch.id;
                  const count = publicChatMessages.filter(m => m.channel === ch.id).length;

                  return (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChannel(ch.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span className="text-xs font-bold truncate">{ch.label}</span>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privacy Badge */}
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-indigo-900 dark:text-indigo-200 leading-tight">
                <span className="font-extrabold">🌐 Public School Room:</span> All parents and school staff can view messages posted here.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Forum Message Feed */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[650px] overflow-hidden">
          
          {/* Header of Active Channel */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/80 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <activeChannelInfo.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  #{activeChannelInfo.label}
                  {isProprietor && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800 rounded-full">
                      👑 Proprietor Oversight
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeChannelInfo.desc}
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-3 py-1 rounded-full shrink-0 hidden sm:inline">
              {channelMessages.length} Messages
            </span>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {channelMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-full text-indigo-500">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                    No messages in #{activeChannelInfo.label} yet
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                    Be the first parent, teacher, or school executive to post a message in this channel!
                  </p>
                </div>
              </div>
            ) : (
              channelMessages.map(msg => {
                const isMe = msg.senderId === currentUser?.id;
                const roleBadge = getRoleBadge(msg.senderRole);
                const BadgeIcon = roleBadge.icon;

                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isMe
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/80 ml-4'
                        : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 mr-4'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={msg.senderAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={msg.senderName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {msg.senderName}
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border flex items-center gap-1 shrink-0 ${roleBadge.bg}`}>
                              <BadgeIcon className="h-3 w-3" />
                              {roleBadge.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {new Date(msg.createdAt).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Direct Message Action if message is from someone else */}
                      {!isMe && onStartDirectChat && (
                        <button
                          onClick={() => onStartDirectChat(msg.senderId)}
                          className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/80 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1 shrink-0"
                          title={`Send 1-on-1 private direct message to ${msg.senderName}`}
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span>1-on-1 DM</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed pl-10">
                      {msg.content}
                    </p>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Send Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={`Post a message in #${activeChannelInfo.label}...`}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-indigo-600/20"
            >
              <span>Send</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
