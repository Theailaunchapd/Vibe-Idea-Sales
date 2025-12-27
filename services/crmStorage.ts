import type { Business, CrmLead, LeadPriority, LeadStatus, SocialIdea, UserProfile } from '../types';

const USER_KEY = 'vib3_user';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function slugify(input: string): string {
  return (input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function nowIso(): string {
  return new Date().toISOString();
}

function storageKeyForLeads(userId: string): string {
  return `vib3_crm_leads_${userId}`;
}

export function ensureUserId(profile: UserProfile | null): UserProfile | null {
  if (!profile) return null;
  if (profile.id) return profile;

  const base = `u_${slugify(profile.name)}_${slugify(profile.role)}` || 'u_agent';
  const id = `${base}_${Math.random().toString(16).slice(2, 10)}`;
  const updated: UserProfile = { ...profile, id };

  try {
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return updated;
}

export function loadUserProfile(): UserProfile | null {
  const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(USER_KEY);
  const parsed = safeParse<UserProfile>(raw);
  return ensureUserId(parsed);
}

export function saveUserProfile(profile: UserProfile): void {
  const ensured = ensureUserId(profile) || profile;
  localStorage.setItem(USER_KEY, JSON.stringify(ensured));
}

export function clearUserProfile(): void {
  localStorage.removeItem(USER_KEY);
}

export function loadCrmLeads(ownerUserId: string): CrmLead[] {
  const raw = localStorage.getItem(storageKeyForLeads(ownerUserId));
  const parsed = safeParse<CrmLead[]>(raw);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveCrmLeads(ownerUserId: string, leads: CrmLead[]): void {
  localStorage.setItem(storageKeyForLeads(ownerUserId), JSON.stringify(leads));
}

export function upsertLeadFromBusiness(opts: {
  ownerUserId: string;
  business: Business;
  status?: LeadStatus;
  priority?: LeadPriority;
}): CrmLead {
  const status: LeadStatus = opts.status || 'New';
  const priority: LeadPriority = opts.priority || 'Medium';
  const createdAt = nowIso();

  return {
    id: `lead_${opts.business.id}_${Math.random().toString(16).slice(2, 10)}`,
    ownerUserId: opts.ownerUserId,
    source: 'business',
    businessId: opts.business.id,
    business: opts.business,
    status,
    priority,
    tags: [],
    notes: '',
    createdAt,
    updatedAt: createdAt,
  };
}

export function upsertLeadFromSocial(opts: {
  ownerUserId: string;
  socialIdea: SocialIdea;
  status?: LeadStatus;
  priority?: LeadPriority;
}): CrmLead {
  const status: LeadStatus = opts.status || 'New';
  const priority: LeadPriority = opts.priority || 'Medium';
  const createdAt = nowIso();

  return {
    id: `lead_social_${opts.socialIdea.id}_${Math.random().toString(16).slice(2, 10)}`,
    ownerUserId: opts.ownerUserId,
    source: 'social',
    socialId: opts.socialIdea.id,
    socialIdea: opts.socialIdea,
    status,
    priority,
    tags: [],
    notes: '',
    createdAt,
    updatedAt: createdAt,
  };
}

export function mergeLead(existing: CrmLead, patch: Partial<CrmLead>): CrmLead {
  return {
    ...existing,
    ...patch,
    business: patch.business ?? existing.business,
    tags: patch.tags ?? existing.tags,
    updatedAt: nowIso(),
  };
}

