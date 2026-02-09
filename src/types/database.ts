// Database types generated from Supabase schema

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            hospitals: {
                Row: {
                    id: string
                    name: string
                    location: string
                    address: string | null
                    phone: string | null
                    email: string | null
                    latitude: number | null
                    longitude: number | null
                    departments: Json
                    services: Json
                    is_open: boolean
                    registration_fee: number
                    operating_hours: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    location: string
                    address?: string | null
                    phone?: string | null
                    email?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    departments?: Json
                    services?: Json
                    is_open?: boolean
                    registration_fee?: number
                    operating_hours?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    location?: string
                    address?: string | null
                    phone?: string | null
                    email?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    departments?: Json
                    services?: Json
                    is_open?: boolean
                    registration_fee?: number
                    operating_hours?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            users: {
                Row: {
                    id: string
                    full_name: string
                    phone: string
                    email: string | null
                    date_of_birth: string | null
                    gender: string | null
                    address: string | null
                    next_of_kin: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name: string
                    phone: string
                    email?: string | null
                    date_of_birth?: string | null
                    gender?: string | null
                    address?: string | null
                    next_of_kin?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string
                    phone?: string
                    email?: string | null
                    date_of_birth?: string | null
                    gender?: string | null
                    address?: string | null
                    next_of_kin?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            hospital_profiles: {
                Row: {
                    id: string
                    user_id: string
                    hospital_id: string
                    card_id: string
                    registration_date: string
                    is_paid: boolean
                    payment_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    hospital_id: string
                    card_id: string
                    registration_date?: string
                    is_paid?: boolean
                    payment_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    hospital_id?: string
                    card_id?: string
                    registration_date?: string
                    is_paid?: boolean
                    payment_id?: string | null
                    created_at?: string
                }
            }
            queue_items: {
                Row: {
                    id: string
                    patient_id: string
                    hospital_id: string
                    ticket_id: string
                    status: string
                    stage: string
                    department: string
                    service: string
                    appointment_date: string
                    time_slot: string
                    is_emergency: boolean
                    payment_status: string
                    notified: boolean
                    queue_position: number | null
                    estimated_wait_time: number | null
                    assigned_staff_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    patient_id: string
                    hospital_id: string
                    ticket_id: string
                    status?: string
                    stage?: string
                    department: string
                    service: string
                    appointment_date: string
                    time_slot: string
                    is_emergency?: boolean
                    payment_status?: string
                    notified?: boolean
                    queue_position?: number | null
                    estimated_wait_time?: number | null
                    assigned_staff_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    patient_id?: string
                    hospital_id?: string
                    ticket_id?: string
                    status?: string
                    stage?: string
                    department?: string
                    service?: string
                    appointment_date?: string
                    time_slot?: string
                    is_emergency?: boolean
                    payment_status?: string
                    notified?: boolean
                    queue_position?: number | null
                    estimated_wait_time?: number | null
                    assigned_staff_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    queue_item_id: string | null
                    title: string
                    message: string
                    type: string
                    is_read: boolean
                    sent_via: string[]
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    queue_item_id?: string | null
                    title: string
                    message: string
                    type: string
                    is_read?: boolean
                    sent_via?: string[]
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    queue_item_id?: string | null
                    title?: string
                    message?: string
                    type?: string
                    is_read?: boolean
                    sent_via?: string[]
                    created_at?: string
                }
            }
            staff: {
                Row: {
                    id: string
                    hospital_id: string
                    full_name: string
                    email: string
                    role: string
                    department: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id: string
                    hospital_id: string
                    full_name: string
                    email: string
                    role: string
                    department?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    hospital_id?: string
                    full_name?: string
                    email?: string
                    role?: string
                    department?: string | null
                    is_active?: boolean
                    created_at?: string
                }
            }
            payments: {
                Row: {
                    id: string
                    user_id: string
                    hospital_id: string
                    amount: number
                    payment_type: string
                    payment_method: string | null
                    payment_reference: string | null
                    status: string
                    metadata: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    hospital_id: string
                    amount: number
                    payment_type: string
                    payment_method?: string | null
                    payment_reference?: string | null
                    status?: string
                    metadata?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    hospital_id?: string
                    amount?: number
                    payment_type?: string
                    payment_method?: string | null
                    payment_reference?: string | null
                    status?: string
                    metadata?: Json | null
                    created_at?: string
                }
            }
            feedback: {
                Row: {
                    id: string
                    user_id: string
                    hospital_id: string
                    queue_item_id: string | null
                    rating: number
                    comment: string | null
                    category: string | null
                    is_public: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    hospital_id: string
                    queue_item_id?: string | null
                    rating: number
                    comment?: string | null
                    category?: string | null
                    is_public?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    hospital_id?: string
                    queue_item_id?: string | null
                    rating?: number
                    comment?: string | null
                    category?: string | null
                    is_public?: boolean
                    created_at?: string
                }
            }
            analytics_events: {
                Row: {
                    id: string
                    hospital_id: string
                    event_type: string
                    department: string | null
                    service: string | null
                    duration: number | null
                    metadata: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    hospital_id: string
                    event_type: string
                    department?: string | null
                    service?: string | null
                    duration?: number | null
                    metadata?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    hospital_id?: string
                    event_type?: string
                    department?: string | null
                    service?: string | null
                    duration?: number | null
                    metadata?: Json | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            generate_ticket_id: {
                Args: {
                    hospital_code: string
                    department_code: string
                }
                Returns: string
            }
            calculate_queue_position: {
                Args: {
                    p_hospital_id: string
                    p_department: string
                    p_appointment_date: string
                    p_is_emergency: boolean
                }
                Returns: number
            }
            estimate_wait_time: {
                Args: {
                    p_hospital_id: string
                    p_department: string
                    p_queue_position: number
                }
                Returns: number
            }
            advance_queue: {
                Args: {
                    p_hospital_id: string
                    p_department: string
                }
                Returns: string
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
