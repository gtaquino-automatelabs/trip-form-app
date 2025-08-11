# API Specification

### REST API Specification

```yaml
openapi: 3.0.0
info:
  title: Travel Request Form API
  version: 1.0.0
  description: API for managing travel requests and administrative functions
servers:
  - url: /api
    description: Next.js API Routes

paths:
  /auth/login:
    post:
      summary: Authenticate user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        200:
          description: Successfully authenticated
          
  /auth/logout:
    post:
      summary: Logout current user
      responses:
        200:
          description: Successfully logged out
          
  /auth/session:
    get:
      summary: Get current session
      responses:
        200:
          description: Current user session
          
  /form/submit:
    post:
      summary: Submit travel request form
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TravelRequestInput'
      responses:
        201:
          description: Request created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                  requestNumber:
                    type: string
                    
  /form/draft:
    post:
      summary: Save form draft
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/FormDraft'
      responses:
        200:
          description: Draft saved
          
    get:
      summary: Get saved draft
      security:
        - BearerAuth: []
      responses:
        200:
          description: Draft data
          
  /upload:
    post:
      summary: Upload file attachment
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                category:
                  type: string
                  enum: [passport, flight_suggestion]
      responses:
        200:
          description: File uploaded
          content:
            application/json:
              schema:
                type: object
                properties:
                  fileUrl:
                    type: string
                  fileId:
                    type: string
                    
  /admin/requests:
    get:
      summary: List all travel requests (admin only)
      security:
        - BearerAuth: []
      parameters:
        - in: query
          name: status
          schema:
            type: string
        - in: query
          name: search
          schema:
            type: string
        - in: query
          name: page
          schema:
            type: integer
        - in: query
          name: limit
          schema:
            type: integer
      responses:
        200:
          description: List of requests
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/TravelRequest'
                  total:
                    type: integer
                  page:
                    type: integer
                    
  /admin/requests/{id}:
    get:
      summary: Get request details (admin only)
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        200:
          description: Request details
          
    patch:
      summary: Update request status (admin only)
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                comment:
                  type: string
      responses:
        200:
          description: Status updated
          
  /admin/export:
    get:
      summary: Export requests to CSV (admin only)
      security:
        - BearerAuth: []
      parameters:
        - in: query
          name: format
          schema:
            type: string
            enum: [csv, excel]
      responses:
        200:
          description: Export file
          content:
            text/csv:
              schema:
                type: string

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      
  schemas:
    TravelRequest:
      type: object
      # Full schema as defined in TypeScript interface above
    
    TravelRequestInput:
      type: object
      # Input schema for form submission
      
    FormDraft:
      type: object
      properties:
        currentPage:
          type: integer
        formData:
          type: object
```
