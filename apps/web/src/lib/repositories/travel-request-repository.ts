import { SupabaseClient } from '@supabase/supabase-js';
import type { 
  Database, 
  TravelRequest, 
  NewTravelRequest, 
  UpdateTravelRequest,
  StatusHistory,
  FormDraft 
} from '@trip-form-app/shared';
import { BaseRepository } from './base-repository';

export class TravelRequestRepository extends BaseRepository<TravelRequest> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'travel_requests');
  }

  async create(data: Omit<NewTravelRequest, 'id' | 'user_id'>, userId: string) {
    return this.executeQuery(
      this.supabase
        .from('travel_requests')
        .insert({ ...data, user_id: userId })
        .select()
        .single()
    );
  }

  async saveDraft(data: any, userId: string, requestId?: string) {
    if (requestId) {
      // Update existing draft request
      return this.executeQuery(
        this.supabase
          .from('travel_requests')
          .update(data as UpdateTravelRequest)
          .eq('id', requestId)
          .eq('user_id', userId)
          .eq('status', 'draft')
          .select()
          .single()
      );
    } else {
      // Save to form_drafts table
      return this.executeQuery(
        this.supabase
          .from('form_drafts')
          .upsert({
            user_id: userId,
            form_data: data,
            current_page: data.current_page || 1,
          })
          .select()
          .single()
      );
    }
  }

  async getDraft(userId: string) {
    return this.executeQuery(
      this.supabase
        .from('form_drafts')
        .select()
        .eq('user_id', userId)
        .single()
    );
  }

  async findById(id: string, userId?: string) {
    let query = this.supabase
      .from('travel_requests')
      .select(`
        *,
        profiles!travel_requests_user_id_fkey (
          name,
          email
        ),
        file_attachments (
          id,
          file_name,
          file_size,
          file_type,
          file_url,
          category,
          created_at
        )
      `)
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    return this.executeQuery(query.single());
  }

  async findByUser(userId: string, filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.supabase
      .from('travel_requests')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    return this.executeQuery(query);
  }

  async findAll(filters?: {
    status?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.supabase
      .from('travel_requests')
      .select(`
        *,
        profiles!travel_requests_user_id_fkey (
          name,
          email
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    return this.executeQuery(query);
  }

  async submitRequest(id: string, userId: string) {
    return this.executeTransaction(async (client) => {
      // Update status to submitted
      const { data: request, error: updateError } = await client
        .from('travel_requests')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .eq('status', 'draft')
        .select()
        .single();

      if (updateError) throw updateError;
      if (!request) throw new Error('Request not found or already submitted');

      // Add to status history
      const { error: historyError } = await client
        .from('status_history')
        .insert({
          request_id: id,
          changed_by: userId,
          previous_status: 'draft',
          new_status: 'submitted',
          comment: 'Request submitted by user'
        });

      if (historyError) throw historyError;

      // Clear any draft for this user
      await client
        .from('form_drafts')
        .delete()
        .eq('user_id', userId);

      return request;
    });
  }

  async cancelRequest(id: string, userId: string, reason: string) {
    return this.executeTransaction(async (client) => {
      // Get current status
      const { data: current, error: fetchError } = await client
        .from('travel_requests')
        .select('status')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;
      if (!current) throw new Error('Request not found');
      if (current.status === 'cancelled') throw new Error('Request already cancelled');
      if (current.status === 'approved') throw new Error('Cannot cancel approved request');

      // Update status
      const { data: request, error: updateError } = await client
        .from('travel_requests')
        .update({ 
          status: 'cancelled',
          rejection_reason: reason
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Add to status history
      const { error: historyError } = await client
        .from('status_history')
        .insert({
          request_id: id,
          changed_by: userId,
          previous_status: current.status,
          new_status: 'cancelled',
          comment: reason
        });

      if (historyError) throw historyError;

      return request;
    });
  }

  async updateStatus(
    id: string, 
    status: TravelRequest['status'], 
    changedBy: string, 
    comment?: string,
    adminNotes?: string
  ) {
    return this.executeTransaction(async (client) => {
      // Get current status
      const { data: current, error: fetchError } = await client
        .from('travel_requests')
        .select('status')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!current) throw new Error('Request not found');

      // Update status
      const updateData: UpdateTravelRequest = { 
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: changedBy
      };

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      if (status === 'rejected' && comment) {
        updateData.rejection_reason = comment;
      }

      const { data: request, error: updateError } = await client
        .from('travel_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Add to status history
      const { error: historyError } = await client
        .from('status_history')
        .insert({
          request_id: id,
          changed_by: changedBy,
          previous_status: current.status || null,
          new_status: status,
          comment: comment || null
        });

      if (historyError) throw historyError;

      return request;
    });
  }

  async getStatusHistory(requestId: string) {
    return this.executeQuery(
      this.supabase
        .from('status_history')
        .select(`
          *,
          profiles!status_history_changed_by_fkey (
            name,
            email
          )
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: false })
    );
  }
}