export * from './database';

// Convenience type exports from database
import type { Database } from './database';

export type Tables = Database['public']['Tables'];
export type Profile = Tables['profiles']['Row'];
export type TravelRequest = Tables['travel_requests']['Row'];
export type StatusHistory = Tables['status_history']['Row'];
export type FileAttachment = Tables['file_attachments']['Row'];
export type FormDraft = Tables['form_drafts']['Row'];

// Insert types for creating new records
export type NewTravelRequest = Tables['travel_requests']['Insert'];
export type NewProfile = Tables['profiles']['Insert'];
export type NewStatusHistory = Tables['status_history']['Insert'];
export type NewFileAttachment = Tables['file_attachments']['Insert'];
export type NewFormDraft = Tables['form_drafts']['Insert'];

// Update types for updating records
export type UpdateTravelRequest = Tables['travel_requests']['Update'];
export type UpdateProfile = Tables['profiles']['Update'];
export type UpdateFormDraft = Tables['form_drafts']['Update'];