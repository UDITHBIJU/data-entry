# Data Entry and Verification System Backend

## Summary
This NestJS backend implements a Data Entry and Verification System for virtual assistants (VAs) to manage, verify, and audit document-derived data. It supports secure data entry, role-based access (VA, Admin), record locking, batch management, audit trails, vector search, and pagination using Neon PostgreSQL and TypeORM. All functional requirements are met except for side-by-side TIFF image display. Bugs (invalid UUID, TypeError in `unlockRecord`, JWT logging) are fixed.

## Implemented Features
### Functional Requirements
1. **Data Entry & Verification**
   - Records include Property Address, Transaction Date, Borrower Name, Loan Officer Name, NMLS ID, Loan Amount, Loan Term, APN, Down Payment (virtual), Entered By, Entered By Date, Reviewed By, Reviewed By Date.
   - Verification via “Good”/“Bad” actions locks records.
2. **Record Locking**
   - Prevents concurrent edits with a 10-minute timeout (10 seconds for testing).
   - Auto-unlocks with audit logging.
3. **Batch Handling**
   - Records grouped into batches (e.g., “Test Batch”).
   - VAs see only assigned records.
4. **Audit Trail**
   - Logs create, update, lock, unlock, verify actions in `audit_log` table.
5. **Search & Pagination**
   - Vector search (`tsvector`) on Property Address, Borrower Name, APN.
   - Paginated lists via `GET /records`.

### Non-Functional Requirements
- **Security**: JWT authentication, role-based access, Neon encryption.
- **Scalability**: Supports 100 concurrent users (pending testing).
- **Reliability**: Neon ensures high availability.
- **Usability**: RESTful APIs with clear endpoints.

### Limitations
- **Side-by-Side Display**: TIFF image serving and county website links not implemented.

## Technical Stack
- **Framework**: NestJS
- **Database**: Neon PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT
- **Node.js**: v21.6.2

## Setup Instructions
1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd data-entry
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   - Create `.env`:
     ```env
     DATABASE_URL=postgres://<username>:<password>@<neon-host>/main?sslmode=require
     JWT_SECRET=secretKey
     ```
   - Replace `<username>`, `<password>`, `<neon-host>` with Neon credentials.


5. **Seed Dummy Data**:
   - Generate 50 records, 2 users (`va1`, `admin1`), and “Test Batch”:
     ```bash
     npm run seed
     ```
   - Verify:
     ```sql
     SELECT COUNT(*) FROM record; -- ~50
     SELECT * FROM "user"; -- va1, admin1
     ```

6. **Start Server**:
   ```bash
   npm run dev
   ```
   - Access at `http://localhost:3000`.

## API Endpoints
All endpoints except `POST /auth/login` and POST /auth/register require `Authorization: Bearer <JWT_TOKEN>`.
- POST /auth/register For registering new User
- POST /auth/login - Authenticate user and get JWT token
- POST /records - Create a new record
- GET /records - List assigned records with search and pagination
- GET /records/:id - Get a single record by ID
- PATCH /records/:id - Update a record
- POST /records/:id/verify/:status - Verify record as “good” or “bad” and lock
- POST /records/:id/lock - Lock a record
- GET /batches - List all batches

## Testing with Postman
1. **Login**:
   - `POST http://localhost:3000/auth/login`
   - Body: `{ "username": "va1", "password": "password" }`
   - Save `<JWT_TOKEN>`.

2. **Create Record**:
   - `POST http://localhost:3000/records`
   - Headers: `Authorization: Bearer <JWT_TOKEN>`
   - Body:
     ```json
     {
       "propertyAddress": "456 Oak Avenue, Springfield",
       "transactionDate": "2025-06-01",
       "borrowerName": "Alice Johnson",
       "loanOfficerName": "Bob Smith",
       "nmlsId": 9876543,
       "loanAmount": 250000,
       "loanTerm": 15,
       "apn": "XYZ9876543"
     }
     ```
   - Save `<RECORD_ID>`.

3. **List Records**:
   - `GET http://localhost:3000/records?page=1&limit=5&search=Alice`

4. **Lock/Unlock**:
   - `POST http://localhost:3000/records/<RECORD_ID>/lock`
   - Wait 10 seconds (test timeout).
   - Verify:
     ```sql
     SELECT isLocked, lockedBy FROM record WHERE id = '<RECORD_ID>';
     ```

5. **Verify Record**:
   - `POST http://localhost:3000/records/<RECORD_ID>/verify/good`
   - Verify:
     ```sql
     SELECT status, isLocked FROM record WHERE id = '<RECORD_ID>';
     ```

6. **List Batches**:
   - `GET http://localhost:3000/batches`

7. **Audit Logs**:
   - ```sql
     SELECT * FROM audit_log WHERE recordId = '<RECORD_ID>';
     ```

8. **Role-Based Access**:
   - Login as `admin1` (`username: admin1`, `password: password`).
   - `GET /records` (expect empty or 404).


## Limitations & Next Steps
- **Not Implemented**: TIFF image serving, county website links.
- **Pending**: Performance testing (100 users), HTTPS configuration.

