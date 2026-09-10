// Audit Logging Service for Administrative Compliance
import { rtdb, isFirebaseConfigured } from './firebase';
import { ref, set } from 'firebase/database';
import { AuditLog } from '../types';
import { authService } from './authService';

class AuditService {
  private localLogs: AuditLog[] = [];

  public async logAction(
    action: AuditLog['action'],
    metadata?: Record<string, any>
  ): Promise<void> {
    const user = authService.getCurrentUser();
    const logItem: AuditLog = {
      id: `audit_${Date.now()}`,
      userId: user?.id || 'system',
      userName: user?.name || 'System Admin',
      action,
      timestamp: Date.now(),
      metadata,
    };

    this.localLogs.unshift(logItem);

    if (isFirebaseConfigured && rtdb) {
      try {
        await set(ref(rtdb, `auditLogs/${logItem.id}`), logItem);
      } catch (err) {
        console.warn('Failed to persist audit log to Firebase RTDB:', err);
      }
    }
  }

  public getRecentLogs(limit: number = 10): AuditLog[] {
    return this.localLogs.slice(0, limit);
  }
}

export const auditService = new AuditService();
