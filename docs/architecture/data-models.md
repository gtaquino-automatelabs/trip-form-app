# Data Models

### TravelRequest
**Purpose:** Core entity representing a complete travel request submission with all passenger, travel, and administrative details

**Key Attributes:**
- id: string (CUID) - Unique request identifier
- requestNumber: string - Human-readable request number (REQ-2025-XXXX)
- userId: string - Reference to authenticated user
- status: enum - Request status (submitted, under_review, approved, rejected, completed)
- createdAt: timestamp - Submission timestamp
- updatedAt: timestamp - Last modification timestamp

#### TypeScript Interface
```typescript
interface TravelRequest {
  id: string;
  requestNumber: string;
  userId: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
  
  // Passenger Data (Page 1)
  projectName: string;
  passengerName: string;
  passengerEmail: string;
  rg: string;
  rgIssuer: string;
  cpf: string;
  birthDate: Date;
  phone: string;
  bankDetails: string;
  requestType: 'passages_per_diem' | 'passages_only' | 'per_diem_only';
  
  // Travel Details (Page 2)
  origin: string;
  destination: string;
  departureDate: Date;
  returnDate: Date;
  transportType: 'air' | 'road' | 'both' | 'own_car';
  
  // Expense Types (Page 3)
  expenseTypes: string[];
  
  // Preferences (Page 4)
  baggageAllowance: boolean;
  transportAllowance: boolean;
  estimatedDailyAllowance: number;
  
  // International Travel (Page 5 - conditional)
  isInternational: boolean;
  passportNumber?: string;
  passportValidity?: Date;
  passportImageUrl?: string;
  visaRequired?: boolean;
  
  // Time Restrictions (Page 6 - conditional)
  hasTimeRestrictions: boolean;
  timeRestrictionDetails?: string;
  
  // Flight Preferences (Page 7 - conditional)
  hasFlightPreferences: boolean;
  flightSuggestionUrls?: string[];
  
  // Trip Objective (Page 8)
  tripObjective: string;
  observations?: string;
  isUrgent: boolean;
  urgentJustification?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### Relationships
- Belongs to User (via userId)
- Has many StatusHistory entries
- Has many FileAttachments

### User
**Purpose:** Authenticated user who can submit travel requests and potentially access admin functions

**Key Attributes:**
- id: string (UUID) - Supabase Auth UUID
- email: string - User email address
- name: string - Full name
- role: enum - User role (user, admin)
- createdAt: timestamp - Account creation

#### TypeScript Interface
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  metadata?: {
    department?: string;
    employeeId?: string;
  };
  createdAt: Date;
  lastLogin: Date;
}
```

#### Relationships
- Has many TravelRequests
- Managed by Supabase Auth

### StatusHistory
**Purpose:** Audit trail of status changes for travel requests

**Key Attributes:**
- id: string - History entry ID
- requestId: string - Reference to TravelRequest
- previousStatus: enum - Status before change
- newStatus: enum - Status after change
- changedBy: string - User who made the change
- comment: string - Optional comment
- timestamp: timestamp - When change occurred

#### TypeScript Interface
```typescript
interface StatusHistory {
  id: string;
  requestId: string;
  previousStatus: TravelRequest['status'];
  newStatus: TravelRequest['status'];
  changedBy: string;
  comment?: string;
  timestamp: Date;
}
```

#### Relationships
- Belongs to TravelRequest
- References User (changedBy)

### FileAttachment
**Purpose:** Metadata for uploaded files associated with travel requests

**Key Attributes:**
- id: string - Attachment ID
- requestId: string - Reference to TravelRequest
- fileName: string - Original file name
- fileUrl: string - Supabase Storage URL
- fileType: string - MIME type
- fileSize: number - Size in bytes
- uploadedAt: timestamp - Upload timestamp

#### TypeScript Interface
```typescript
interface FileAttachment {
  id: string;
  requestId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: 'passport' | 'flight_suggestion' | 'other';
  uploadedAt: Date;
}
```

#### Relationships
- Belongs to TravelRequest
