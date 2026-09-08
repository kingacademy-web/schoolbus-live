// Audit Logging Service for Administrative Compliance
import { db, isFirebaseConfigured } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
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

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'auditLogs'), logItem);
      } catch (err) {
        console.warn('Failed to persist audit log to Firestore:', err);
      }
    }
  }

  public getRecentLogs(limit: number = 10): AuditLog[] {
    return this.localLogs.slice(0, limit);
  }
}

export const auditService = new AuditService();
