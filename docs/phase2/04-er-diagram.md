# Entity-Relationship Diagram

Reference: [03-low-level-design.md](03-low-level-design.md). Rendered as Mermaid ER syntax — paste into any Mermaid renderer (GitHub renders it inline).

Scope: MVP tables + fast-follow tables (homework, exams, ai_*) so the schema doesn't need reshaping later — fast-follow tables are created in later Flyway migrations but modeled now for consistency.

```mermaid
erDiagram
    USERS ||--o| STUDENT_PROFILES : "has"
    USERS ||--o| PARENT_PROFILES : "has"
    USERS ||--o| TUTOR_PROFILES : "has"
    USERS ||--o{ REFRESH_TOKENS : "owns"
    USERS ||--o{ DEVICE_TOKENS : "registers"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ SUPPORT_TICKETS : "raises"
    USERS ||--o{ AUDIT_LOGS : "actor_of"

    PARENT_PROFILES ||--o{ PARENT_STUDENT_LINKS : "links"
    STUDENT_PROFILES ||--o{ PARENT_STUDENT_LINKS : "linked_by"

    TUTOR_PROFILES ||--o{ TUTOR_DOCUMENTS : "submits"
    TUTOR_PROFILES ||--o{ AVAILABILITY_RULES : "defines"
    TUTOR_PROFILES ||--o{ BOOKINGS : "receives"
    TUTOR_PROFILES ||--o{ REVIEWS : "receives"

    STUDENT_PROFILES ||--o{ BOOKINGS : "books (as student)"
    PARENT_PROFILES  ||--o{ BOOKINGS : "books (as payer, optional)"

    BOOKINGS ||--o| PAYMENTS : "has"
    BOOKINGS ||--o{ LEDGER_ENTRIES : "generates"
    BOOKINGS ||--o| CLASS_SESSIONS : "has (online)"
    BOOKINGS ||--o{ ATTENDANCE_RECORDS : "has (offline)"
    BOOKINGS ||--o| DISPUTES : "may raise"
    BOOKINGS ||--o| CHAT_THREADS : "has"
    BOOKINGS ||--o| REVIEWS : "receives one"

    CHAT_THREADS ||--o{ CHAT_MESSAGES : "contains"

    TUTOR_PROFILES ||--o{ PAYOUT_ITEMS : "earns"
    PAYOUTS ||--o{ PAYOUT_ITEMS : "batches"

    SUPPORT_TICKETS ||--o{ TICKET_MESSAGES : "contains"

    STUDENT_PROFILES ||--o{ AI_CONVERSATIONS : "starts"
    AI_CONVERSATIONS ||--o{ AI_MESSAGES : "contains"
    USERS ||--o{ AI_USAGE_LOG : "consumes"

    TUTOR_PROFILES ||--o{ HOMEWORK_ASSIGNMENTS : "creates"
    BOOKINGS ||--o{ HOMEWORK_ASSIGNMENTS : "linked_to"
    HOMEWORK_ASSIGNMENTS ||--o{ HOMEWORK_SUBMISSIONS : "receives"

    TUTOR_PROFILES ||--o{ EXAMS : "creates"
    EXAMS ||--o{ EXAM_QUESTIONS : "contains"
    EXAMS ||--o{ EXAM_ATTEMPTS : "attempted_via"

    USERS {
        uuid id PK
        string email UK
        string phone UK
        string password_hash
        string role "STUDENT|PARENT|TUTOR|ADMIN"
        string status "ACTIVE|SUSPENDED|UNVERIFIED_EMAIL"
        timestamptz created_at
    }
    STUDENT_PROFILES {
        uuid id PK
        uuid user_id FK "nullable, added V9 Phase 7 - null for parent-managed children"
        string display_name
        string grade
        text subjects_of_interest
        string city
        geography location
    }
    PARENT_PROFILES {
        uuid id PK
        uuid user_id FK
        string display_name
    }
    PARENT_STUDENT_LINKS {
        uuid id PK
        uuid parent_id FK
        uuid student_id FK
        string relationship
    }
    TUTOR_PROFILES {
        uuid id PK
        uuid user_id FK
        string display_name "added V8, Phase 6"
        text bio
        string[] subjects
        numeric hourly_rate
        string teaching_mode "ONLINE|OFFLINE|BOTH"
        int service_radius_km
        geography base_location
        string verification_status "NOT_SUBMITTED|SUBMITTED|VERIFIED|REJECTED"
        numeric avg_rating
        int review_count
    }
    TUTOR_DOCUMENTS {
        uuid id PK
        uuid tutor_id FK
        string doc_type "ID_PROOF|QUALIFICATION"
        string s3_key
        string status "PENDING|APPROVED|REJECTED"
        uuid reviewed_by FK
        string reject_reason
        timestamptz submitted_at
    }
    AVAILABILITY_RULES {
        uuid id PK
        uuid tutor_id FK
        int day_of_week
        time start_time
        time end_time
    }
    BOOKINGS {
        uuid id PK
        uuid student_id FK
        uuid parent_id FK "nullable"
        uuid tutor_id FK
        string subject
        string mode "ONLINE|OFFLINE"
        tstzrange time_range
        string status
        timestamptz payment_deadline
        timestamptz last_transition_at
        timestamptz created_at
    }
    PAYMENTS {
        uuid id PK
        uuid booking_id FK
        string razorpay_order_id UK
        string razorpay_payment_id
        string razorpay_event_id UK
        numeric amount
        string status "CREATED|AUTHORIZED|CAPTURED|RELEASED|REFUNDED|FAILED"
        timestamptz created_at
    }
    LEDGER_ENTRIES {
        uuid id PK
        uuid booking_id FK
        uuid tutor_id FK
        string type "HOLD|RELEASE|REFUND"
        numeric amount
        timestamptz created_at
    }
    PAYOUTS {
        uuid id PK
        uuid tutor_id FK
        numeric total_amount
        string status "PENDING|PAID"
        string bank_reference
        timestamptz paid_at
    }
    PAYOUT_ITEMS {
        uuid id PK
        uuid payout_id FK
        uuid ledger_entry_id FK
        numeric amount
    }
    CLASS_SESSIONS {
        uuid id PK
        uuid booking_id FK
        string agora_channel_name
        timestamptz actual_start
        timestamptz actual_end
    }
    ATTENDANCE_RECORDS {
        uuid id PK
        uuid booking_id FK
        uuid marked_by FK
        string status "PRESENT|ABSENT"
        timestamptz marked_at
    }
    DISPUTES {
        uuid id PK
        uuid booking_id FK
        string reason
        string status "OPEN|RESOLVED"
        string resolution
        uuid resolved_by FK
        timestamptz resolved_at
    }
    CHAT_THREADS {
        uuid id PK
        uuid booking_id FK
    }
    CHAT_MESSAGES {
        uuid id PK
        uuid thread_id FK
        uuid sender_id FK
        text body
        timestamptz sent_at
        boolean deleted
    }
    REVIEWS {
        uuid id PK
        uuid booking_id FK UK
        uuid tutor_id FK
        uuid author_id FK
        int rating
        text comment
        timestamptz created_at
    }
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string type
        jsonb payload
        boolean read
        timestamptz created_at
    }
    DEVICE_TOKENS {
        uuid id PK
        uuid user_id FK
        string fcm_token
        string platform
    }
    SUPPORT_TICKETS {
        uuid id PK
        uuid raised_by FK
        string subject
        string status "OPEN|IN_PROGRESS|CLOSED"
        timestamptz created_at
    }
    TICKET_MESSAGES {
        uuid id PK
        uuid ticket_id FK
        uuid sender_id FK
        text body
        timestamptz sent_at
    }
    AUDIT_LOGS {
        uuid id PK
        uuid actor_id FK
        string action
        string target_id
        jsonb metadata
        timestamptz created_at
    }
    AI_CONVERSATIONS {
        uuid id PK
        uuid student_id FK
        string title
        timestamptz created_at
    }
    AI_MESSAGES {
        uuid id PK
        uuid conversation_id FK
        string role "USER|ASSISTANT"
        text content
        timestamptz created_at
    }
    AI_USAGE_LOG {
        uuid id PK
        uuid user_id FK
        string feature "ASSISTANT|RECOMMENDATION|HOMEWORK_SOLVER|TEST_GENERATOR"
        int tokens_used
        numeric estimated_cost
        date usage_date
    }
    HOMEWORK_ASSIGNMENTS {
        uuid id PK
        uuid tutor_id FK
        uuid booking_id FK
        string title
        text instructions
        timestamptz due_at
    }
    HOMEWORK_SUBMISSIONS {
        uuid id PK
        uuid assignment_id FK
        uuid student_id FK
        text submission_text
        string s3_key "nullable"
        numeric grade
        text feedback
        timestamptz submitted_at
    }
    EXAMS {
        uuid id PK
        uuid tutor_id FK
        string title
        string subject
        int duration_minutes
    }
    EXAM_QUESTIONS {
        uuid id PK
        uuid exam_id FK
        text question
        jsonb options
        string correct_answer
    }
    EXAM_ATTEMPTS {
        uuid id PK
        uuid exam_id FK
        uuid student_id FK
        jsonb answers
        numeric score
        timestamptz submitted_at
    }
```

## Notes on cardinality choices

- `BOOKINGS.parent_id` is nullable — a Student can book directly (older students) or a Parent books on their behalf; payment/audit always ties to whichever `payer` (student or parent user) initiated it.
- `REVIEWS.booking_id` is unique — enforces "one review per booking" (FR-9.1) at the schema level, not just application logic.
- `PAYMENTS.razorpay_event_id` is unique — this is the idempotency guarantee for webhook processing (HLD §3 payment flow).
- `TUTOR_PROFILES.base_location` and `STUDENT_PROFILES.location` use PostGIS `geography(Point, 4326)` — enables efficient `ST_DWithin` radius queries for nearby search, far cheaper than Haversine computed in application code at scale.
