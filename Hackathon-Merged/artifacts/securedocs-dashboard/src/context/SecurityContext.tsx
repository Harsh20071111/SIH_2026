import React, { createContext, useContext, useState, useEffect } from 'react';
import { activities } from '@/lib/mock-data';

export type RiskRules = {
  unusualTime: number;
  excessiveDownloads: number;
  unassignedCase: number;
  failedAttempts: number;
};

export type RiskEnabled = {
  unusualTime: boolean;
  excessiveDownloads: boolean;
  unassignedCase: boolean;
  failedAttempts: boolean;
};

export type SecurityEvent = {
  _id: string;
  timestamp: string;
  type: string;
  riskLevel: 'High' | 'Medium' | 'Low' | 'HIGH' | 'CRITICAL' | 'MEDIUM' | 'LOW' | string;
  riskScore: number;
  sourceIp?: string;
  ipAddress?: string;
  status: 'Monitoring' | 'Resolved' | 'Open' | 'Investigating' | string;
  userId?: string;
  userName?: string;
  action: string;
  caseId?: string;
  details?: string;
};

type SecurityContextType = {
  riskRules: RiskRules;
  riskEnabled: RiskEnabled;
  setRiskRules: React.Dispatch<React.SetStateAction<RiskRules>>;
  setRiskEnabled: React.Dispatch<React.SetStateAction<RiskEnabled>>;
  events: SecurityEvent[];
  updateEventStatus: (id: string, status: 'Monitoring' | 'Resolved') => void;
  getDashboardStats: () => {
    totalEvents: number;
    highRiskEvents: number;
    mediumRiskEvents: number;
    lowRiskEvents: number;
  };
};

const defaultRules: RiskRules = {
  unusualTime: 20,
  excessiveDownloads: 25,
  unassignedCase: 30,
  failedAttempts: 20,
};

const defaultEnabled: RiskEnabled = {
  unusualTime: true,
  excessiveDownloads: true,
  unassignedCase: true,
  failedAttempts: true,
};

function parseTimeStringToIso(timeStr: string, baseDate = '2024-06-18'): string {
  try {
    const parts = (timeStr || '').trim().split(/\s+/);
    if (parts.length === 2) {
      const [timePart, meridiem] = parts;
      const [rawH, rawM] = timePart.split(':').map(Number);
      let hours = isNaN(rawH) ? 12 : rawH;
      const minutes = isNaN(rawM) ? 0 : rawM;
      if (meridiem.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
      const hh = String(hours).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');
      return `${baseDate}T${hh}:${mm}:00.000Z`;
    }
  } catch {}
  return new Date().toISOString();
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [riskRules, setRiskRules] = useState<RiskRules>(() => {
    const saved = localStorage.getItem('securedocs_risk_rules');
    return saved ? JSON.parse(saved) : defaultRules;
  });

  const [riskEnabled, setRiskEnabled] = useState<RiskEnabled>(() => {
    const saved = localStorage.getItem('securedocs_risk_enabled');
    return saved ? JSON.parse(saved) : defaultEnabled;
  });

  const [events, setEvents] = useState<SecurityEvent[]>(() => {
    const saved = localStorage.getItem('securedocs_security_events');
    return saved ? JSON.parse(saved) : [];
  });

  // Save rules to localStorage
  useEffect(() => {
    localStorage.setItem('securedocs_risk_rules', JSON.stringify(riskRules));
  }, [riskRules]);

  useEffect(() => {
    localStorage.setItem('securedocs_risk_enabled', JSON.stringify(riskEnabled));
  }, [riskEnabled]);

  useEffect(() => {
    localStorage.setItem('securedocs_security_events', JSON.stringify(events));
  }, [events]);

  // Recalculate security events from mock activities when rules change (or on mount if empty)
  useEffect(() => {
    const newEvents: SecurityEvent[] = activities.map((act, index) => {
      // Calculate risk score based on activity type and rules
      let score = 0;
      let type = 'Standard Activity';

      if (act.status === 'Blocked' && riskEnabled.failedAttempts) {
        score += riskRules.failedAttempts;
        type = 'Failed Attempt';
      }
      if (act.action.includes('Downloaded') && riskEnabled.excessiveDownloads) {
        if (act.user === 'Officer A') {
          score += riskRules.excessiveDownloads;
          type = 'Excessive Downloads';
        }
      }
      if (act.action.includes('Attempted restricted') && riskEnabled.unassignedCase) {
        score += riskRules.unassignedCase;
        type = 'Unassigned Case Access';
      }
      
      // Simulate unusual time (e.g. before 9am or after 6pm)
      const hour = parseInt(act.time.split(':')[0], 10) || 12;
      const ampm = (act.time.split(' ')[1] || '').toUpperCase();
      if (riskEnabled.unusualTime) {
        if ((ampm === 'AM' && hour < 9) || (ampm === 'PM' && hour > 6)) {
          score += riskRules.unusualTime;
          if (type === 'Standard Activity') type = 'Unusual Access Time';
        }
      }

      // Add a base risk for everything else or variations
      if (score === 0 && act.status === 'Successful') {
        score = Math.floor(Math.random() * 15); 
      }

      let riskLevel: 'High' | 'Medium' | 'Low' = 'Low';
      if (score >= 50) riskLevel = 'High';
      else if (score >= 25) riskLevel = 'Medium';

      // Keep existing status if it was already saved
      const existingEvent = events.find((e) => e._id === act.id);
      
      return {
        _id: act.id,
        timestamp: parseTimeStringToIso(act.time),
        type,
        riskLevel,
        riskScore: score,
        sourceIp: `192.168.1.${100 + index}`,
        ipAddress: `192.168.1.${100 + index}`,
        status: existingEvent ? existingEvent.status : (riskLevel === 'Low' ? 'Resolved' : 'Monitoring'),
        userId: act.user,
        userName: act.user,
        action: act.action,
        caseId: act.caseId,
        details: `${act.action} on ${act.document}`,
      };
    });

    setEvents(newEvents);
  }, [riskRules, riskEnabled]); // re-run only when rules change

  const updateEventStatus = (id: string, status: 'Monitoring' | 'Resolved') => {
    setEvents((prev) => prev.map((e) => (e._id === id ? { ...e, status } : e)));
  };

  const getDashboardStats = () => {
    return {
      totalEvents: events.length,
      highRiskEvents: events.filter(e => e.riskLevel === 'High' && e.status !== 'Resolved').length,
      mediumRiskEvents: events.filter(e => e.riskLevel === 'Medium' && e.status !== 'Resolved').length,
      lowRiskEvents: events.filter(e => e.riskLevel === 'Low').length,
    };
  };

  return (
    <SecurityContext.Provider value={{ riskRules, riskEnabled, setRiskRules, setRiskEnabled, events, updateEventStatus, getDashboardStats }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
