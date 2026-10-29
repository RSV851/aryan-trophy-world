'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Building,
  Image as ImageIcon,
  UserCheck,
  Trophy,
  ExternalLink,
  Clock,
  Sparkles,
  X,
  Mail,
  Filter,
  Trash2,
  Lightbulb,
  History,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: 'storage' | 'inquiry' | 'reminder';
  entityType?: 'setting' | 'profile' | 'product' | 'inquiry';
  entityId?: string;
  fieldName?: string;
  imageUrl?: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  fixUrl: string;
  isDismissable: boolean;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  formattedTime: string;
  totalChecked: number;
  warningsCount: number;
  status: 'healthy' | 'warnings';
  durationMs: number;
}

import { runSharedHealthAudit } from '@/lib/utils/audit-throttler';

export default function AdminNotificationsPage() {
  // Instant 0ms page load: Do NOT block initial render with full-page loading state
  const [isAuditing, setIsAuditing] = useState(false);
  const [totalChecked, setTotalChecked] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'system' | 'leads' | 'reminders'>('all');
  const [lastAuditTime, setLastAuditTime] = useState<string | null>(null);

  // Pagination for Notifications List
  const [notificationPage, setNotificationPage] = useState(1);

  // Audit History Logs State, Filter & Pagination
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [logFilter, setLogFilter] = useState<'1h' | '24h' | '7d'>('7d');
  const [historyLogPage, setHistoryLogPage] = useState(1);

  // Reset pagination when active tab or log filter changes
  useEffect(() => {
    setNotificationPage(1);
  }, [activeTab]);

  useEffect(() => {
    setHistoryLogPage(1);
  }, [logFilter]);

  // Load dismissed notifications & audit history from localStorage on mount
  useEffect(() => {
    try {
      const savedDismissed = localStorage.getItem('atw_dismissed_notifications');
      if (savedDismissed) setDismissedIds(JSON.parse(savedDismissed));

      const savedLogs = localStorage.getItem('atw_audit_history_logs');
      if (savedLogs) setAuditLogs(JSON.parse(savedLogs));
    } catch {}
  }, []);

  const fetchHealthAudit = async (showToast = false, force = false) => {
    const startTime = performance.now();
    try {
      setIsAuditing(true);
      if (showToast) {
        toast.loading('Auditing database assets & customer lead pipeline...', { id: 'audit-run' });
      }

      const json = await runSharedHealthAudit(force);
      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      if (json && json.success) {
        setTotalChecked(json.totalChecked || 0);
        setNotifications(json.warnings || []);
        const formattedTimeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastAuditTime(formattedTimeString);

        // Record Audit Log Entry in History if not returning throttled cache
        if (!json.isCached) {
          const newLogEntry: AuditLogEntry = {
            id: 'audit_' + Date.now(),
            timestamp: new Date().toISOString(),
            formattedTime: formattedTimeString + ' — ' + new Date().toLocaleDateString(),
            totalChecked: json.totalChecked || 0,
            warningsCount: (json.warnings || []).length,
            status: (json.warnings || []).length === 0 ? 'healthy' : 'warnings',
            durationMs,
          };

          setAuditLogs((prevLogs) => {
            const updated = [newLogEntry, ...prevLogs].slice(0, 50); // Keep last 50 audit logs
            try {
              localStorage.setItem('atw_audit_history_logs', JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }

        if (showToast) {
          if ((json.warnings || []).length === 0) {
            toast.success('System Audit Complete! All assets & pipeline 100% healthy.', { id: 'audit-run' });
          } else {
            toast.warning(`Audit Complete! ${json.warnings.length} alert(s) detected.`, { id: 'audit-run' });
          }
        }
      }
    } catch {
      if (showToast) {
        toast.error('Failed to run system audit. Check server logs.', { id: 'audit-run' });
      }
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    fetchHealthAudit(false, false);
  }, []);

  const handleDismissNotification = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem('atw_dismissed_notifications', JSON.stringify(updated));
    } catch {}
    toast.info('Notification dismissed');
  };

  const handleClearAllDismissed = () => {
    setDismissedIds([]);
    try {
      localStorage.removeItem('atw_dismissed_notifications');
    } catch {}
    toast.success('All dismissed notifications restored');
  };

  // Filter out dismissed notifications (Only for dismissable non-critical categories)
  const activeNotifications = notifications.filter(
    (n) => !n.isDismissable || !dismissedIds.includes(n.id)
  );

  // Tab Filtering
  const systemNotifications = activeNotifications.filter((n) => n.category === 'storage');
  const leadNotifications = activeNotifications.filter((n) => n.category === 'inquiry');
  const reminderNotifications = activeNotifications.filter((n) => n.category === 'reminder');

  const getVisibleNotifications = () => {
    if (activeTab === 'system') return systemNotifications;
    if (activeTab === 'leads') return leadNotifications;
    if (activeTab === 'reminders') return reminderNotifications;
    return activeNotifications;
  };

  const visibleNotifications = getVisibleNotifications();

  // Notifications List Pagination (10 per page)
  const notificationLimit = 10;
  const totalNotificationPages = Math.ceil(visibleNotifications.length / notificationLimit) || 1;
  const paginatedNotifications = visibleNotifications.slice(
    (notificationPage - 1) * notificationLimit,
    notificationPage * notificationLimit
  );

  // Tab Counts
  const totalCount = activeNotifications.length;
  const systemCount = systemNotifications.length;
  const leadsCount = leadNotifications.length;
  const remindersCount = reminderNotifications.length;

  const getEmptyStateMessage = () => {
    if (activeTab === 'system') {
      return {
        title: 'All System Assets Operational',
        description: 'Zero missing image assets detected on Supabase storage buckets.',
      };
    }
    if (activeTab === 'leads') {
      return {
        title: 'No Pending Customer Leads',
        description: 'All incoming customer quotation inquiries have been reviewed.',
      };
    }
    if (activeTab === 'reminders') {
      return {
        title: 'No Workload Reminders',
        description: 'All follow-up tasks and response deadlines are up to date.',
      };
    }
    return {
      title: 'All Clear! No Active Notifications',
      description: 'Your system health is 100% operational, all image assets exist on storage, and customer leads are updated.',
    };
  };

  // Filter audit history logs based on time range
  const filteredAuditLogs = auditLogs.filter((log) => {
    const logTime = new Date(log.timestamp).getTime();
    const now = Date.now();
    if (logFilter === '1h') return now - logTime <= 60 * 60 * 1000;
    if (logFilter === '24h') return now - logTime <= 24 * 60 * 60 * 1000;
    if (logFilter === '7d') return now - logTime <= 7 * 24 * 60 * 60 * 1000;
    return true;
  });

  // Audit Logs Modal Pagination (10 logs per page)
  const logLimit = 10;
  const totalLogPages = Math.ceil(filteredAuditLogs.length / logLimit) || 1;
  const paginatedAuditLogs = filteredAuditLogs.slice(
    (historyLogPage - 1) * logLimit,
    historyLogPage * logLimit
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6 text-gray-100 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C5A55A]/10 border border-[#C5A55A]/40 flex items-center justify-center text-[#C5A55A]">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif text-white tracking-wide flex items-center space-x-2">
              <span>Executive Notification & Health Center</span>
              {totalCount > 0 && (
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs px-2.5 py-0.5 rounded-full font-sans font-bold">
                  {totalCount} Alert{totalCount > 1 ? 's' : ''}
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-400">
              Live monitoring hub for Supabase storage assets, system health, incoming leads, and workload reminders.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {dismissedIds.length > 0 && (
            <Button
              onClick={handleClearAllDismissed}
              variant="outline"
              className="border-gray-700 bg-gray-900 text-gray-300 hover:text-white text-xs h-10 px-3.5"
            >
              Restore Dismissed ({dismissedIds.length})
            </Button>
          )}
          <Button
            onClick={() => fetchHealthAudit(true, true)}
            disabled={isAuditing}
            className="bg-[#C5A55A] hover:bg-[#b0924c] text-gray-950 font-bold text-xs flex items-center space-x-2 shadow-lg h-10 px-4 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Scanning...' : 'Run Audit Now'}</span>
          </Button>
        </div>
      </div>

      {/* Structured Summary Cards Grid (Row 1: System Cards | Row 2: Business Cards) */}
      <div className="space-y-6">
        
        {/* ROW 1: SYSTEM & HEALTH CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Card 1: System & Storage */}
          <div className={`p-6 rounded-2xl border ${systemCount === 0 ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">System & Storage</span>
              {systemCount === 0 ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              )}
            </div>
            <p className={`text-xl font-bold ${systemCount === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {systemCount === 0 ? '100% Operational' : `${systemCount} Critical Asset(s)`}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {systemCount === 0 ? 'All image URLs exist on storage.' : '404 missing bucket files detected.'}
            </p>
          </div>

          {/* Card 2: Last Background Check & Audit History Trigger */}
          <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Last Background Check</span>
                <Clock className="w-5 h-5 text-sky-400" />
              </div>
              <p className="text-xl font-bold text-white font-mono">{lastAuditTime || 'Scanning...'}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Background scan every 15 mins</p>
            </div>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="mt-4 pt-3 border-t border-gray-800/80 text-xs font-bold text-[#C5A55A] hover:text-[#d4b76a] flex items-center justify-between w-full transition-colors"
            >
              <span className="flex items-center space-x-1.5">
                <History className="w-3.5 h-3.5" />
                <span>View Audit Logs (7 Days)</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Reserved Slot for Future Backend System Metrics */}
          <div className="bg-[#111827]/40 p-6 rounded-2xl border border-dashed border-gray-800 flex items-center justify-center text-center">
            <div className="space-y-1">
              <Activity className="w-5 h-5 text-gray-600 mx-auto" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">System Health Metric</p>
              <p className="text-[11px] text-gray-600">Reserved for DB Connection & SLA Metrics</p>
            </div>
          </div>

        </div>

        {/* ROW 2: BUSINESS & INQUIRY LEADS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Card 4: Customer Leads */}
          <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Customer Leads</span>
              <Mail className="w-6 h-6 text-sky-400" />
            </div>
            <p className="text-xl font-bold text-white">{leadsCount} New Quotes</p>
            <p className="text-xs text-gray-400 mt-1">Fresh incoming wholesale customer inquiries</p>
          </div>

          {/* Card 5: Workload Reminders */}
          <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Workload Reminders</span>
              <Lightbulb className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-xl font-bold text-white">{remindersCount} Pending Tasks</p>
            <p className="text-xs text-gray-400 mt-1">Follow-ups &amp; pending replies (&gt;24h)</p>
          </div>

        </div>

      </div>

      {/* 4-Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 pb-3">
        {[
          { id: 'all', label: `All Notifications (${totalCount})` },
          { id: 'system', label: `System & Security (${systemCount})` },
          { id: 'leads', label: `New Customer Leads (${leadsCount})` },
          { id: 'reminders', label: `Insights & Reminders (${remindersCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-[#C5A55A] text-gray-950 shadow-md font-extrabold'
                : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {visibleNotifications.length === 0 ? (
          <div className="bg-[#111827] border border-emerald-500/20 rounded-2xl p-10 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-90" />
            <h3 className="text-lg font-bold text-white">{getEmptyStateMessage().title}</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              {getEmptyStateMessage().description}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedNotifications.map((n) => {
              const isSystem = n.category === 'storage';
              const isLead = n.category === 'inquiry';

              return (
                <div
                  key={n.id}
                  className={`bg-[#111827] border rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl transition-all ${
                    isSystem
                      ? 'border-rose-500/40 bg-rose-950/10'
                      : isLead
                      ? 'border-sky-500/30 bg-sky-950/10'
                      : 'border-purple-500/30 bg-purple-950/10'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3 rounded-xl border shrink-0 mt-0.5 ${
                        isSystem
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : isLead
                          ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                          : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                      }`}
                    >
                      {isSystem ? <AlertTriangle className="w-5 h-5" /> : isLead ? <Mail className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{n.title}</span>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                            isSystem
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : isLead
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                              : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                          }`}
                        >
                          {isSystem ? 'System Critical' : isLead ? 'Customer Lead' : 'Reminder'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">{n.description}</p>
                      {n.imageUrl && (
                        <p className="text-[10px] font-mono text-gray-400 truncate max-w-xl pt-1">
                          URL: {n.imageUrl}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                    {/* Action Button */}
                    <Link href={n.fixUrl}>
                      <Button
                        size="sm"
                        className="bg-[#C5A55A] hover:bg-[#b0924c] text-gray-950 font-bold text-xs flex items-center space-x-1.5 px-4 h-9 shadow-md"
                      >
                        <span>{isSystem ? 'Fix & Replace Image' : 'View Details'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>

                    {/* Dismiss Button */}
                    {n.isDismissable && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDismissNotification(n.id)}
                        className="text-gray-500 hover:text-gray-300 hover:bg-gray-800 h-9 w-9 p-0 rounded-xl"
                        title="Dismiss notification"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Notifications Tab Pagination Bar */}
            {totalNotificationPages > 1 && (
              <div className="bg-[#111827] border border-gray-800 rounded-2xl px-6 py-4 flex items-center justify-between text-xs text-gray-400 shadow-md">
                <div>
                  Showing page <strong className="text-[#C5A55A]">{notificationPage}</strong> of{' '}
                  <strong className="text-white">{totalNotificationPages}</strong> (
                  <span>{visibleNotifications.length} items</span>)
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNotificationPage((p) => Math.max(1, p - 1))}
                    disabled={notificationPage <= 1}
                    className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs h-8 px-3"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                    <span>Prev</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNotificationPage((p) => Math.min(totalNotificationPages, p + 1))}
                    disabled={notificationPage >= totalNotificationPages}
                    className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs h-8 px-3"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audit History Logs Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#C5A55A]/10 border border-[#C5A55A]/40 flex items-center justify-center text-[#C5A55A]">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif uppercase tracking-wide">
                    Audit History Logs (Last 7 Days)
                  </h3>
                  <p className="text-xs text-gray-400">
                    Filterable log entries of all automatic 15-minute background scans.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Time Filter Bar */}
            <div className="px-6 py-3 bg-[#090909] border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mr-2">Filter Time:</span>
                {[
                  { id: '1h', label: 'Last 1 Hour' },
                  { id: '24h', label: 'Last 24 Hours' },
                  { id: '7d', label: 'Last 7 Days' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setLogFilter(f.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      logFilter === f.id
                        ? 'bg-[#C5A55A] text-gray-950 shadow-xs'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <span className="text-xs text-gray-400 font-mono">
                {filteredAuditLogs.length} Log{filteredAuditLogs.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Logs Table */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredAuditLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs font-mono">
                  No audit logs recorded for the selected time filter.
                </div>
              ) : (
                <div className="space-y-2 font-mono text-xs">
                  {paginatedAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-[#090909] border border-gray-800/80 rounded-xl p-3.5 flex items-center justify-between hover:border-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {log.status === 'healthy' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <div>
                          <span className="text-gray-200 font-bold">{log.formattedTime}</span>
                          <span className="text-gray-500 ml-2">({log.durationMs}ms scan)</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400">{log.totalChecked} Checked</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.status === 'healthy'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {log.warningsCount === 0 ? '100% Healthy' : `${log.warningsCount} Warning(s)`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer with Pagination Controls */}
            <div className="p-4 border-t border-gray-800 bg-[#090909] flex items-center justify-between">
              {totalLogPages > 1 ? (
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span>Page <strong className="text-[#C5A55A]">{historyLogPage}</strong> of {totalLogPages}</span>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setHistoryLogPage((p) => Math.max(1, p - 1))}
                      disabled={historyLogPage <= 1}
                      className="h-7 px-2 border-gray-700 bg-gray-800 text-gray-300 text-xs"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setHistoryLogPage((p) => Math.min(totalLogPages, p + 1))}
                      disabled={historyLogPage >= totalLogPages}
                      className="h-7 px-2 border-gray-700 bg-gray-800 text-gray-300 text-xs"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : <div />}

              <Button
                onClick={() => setShowHistoryModal(false)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold px-4"
              >
                Close Logs
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
