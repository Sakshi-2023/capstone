# Capstone Portal TODO

## 1. Final target

Build an institute form portal that replaces Word-based forms with web forms, PDF output, submission history, dynamic approval workflows, and admin-driven user management.

## 2. Non-negotiable constraints

- [ ] Docker-first setup for local development and deployment.
- [ ] Use exact dependency versions only. No caret (`^`) or tilde (`~`) ranges.
- [ ] Commit lockfiles and keep Docker base images version-pinned.
- [ ] PDF generation must use PDFKit in Node.js, with WeasyPrint as backup.
- [ ] Email flow must use SMTP with credentials stored only in environment variables.
- [ ] Rotate any SMTP password that has already been exposed outside secure env storage.

## 3. Recommended architecture for this repo

### Frontend
- [ ] Keep React frontend for portal UI.
- [ ] Add pages for login, forgot password, dashboard, form catalog, form fill page, submission history, submission detail, admin panel, and approval inbox.

### Backend
- [ ] Keep Node/Express as primary API because the current project already uses it.
- [ ] Integrate PDFKit in Node.js for PDF generation, with WeasyPrint as backup.
- [ ] Use MongoDB for users, form templates, submissions, workflow definitions, and approval logs.

### Containers
- [ ] `frontend` container
- [ ] `backend` container
- [ ] `mongodb` container
- [ ] optional `mailpit` container for local SMTP testing

## 4. Version pinning tasks

- [ ] Pin root/base Docker images to exact versions, for example:
	- [ ] Node image pinned to a fixed tag
	- [ ] Mongo image pinned to a fixed tag
- [ ] Remove version ranges from [frontend/package.json](frontend/package.json).
- [ ] Remove version ranges from [backend/package.json](backend/package.json) if any remain.
- [ ] Keep [frontend/package-lock.json](frontend/package-lock.json) committed.
- [ ] Keep [backend/package-lock.json](backend/package-lock.json) committed.
- [ ] Add a Docker Compose file with fixed image versions.

## 5. Core product modules

### A. Authentication and account recovery
- [ ] Login with institute email and password.
- [ ] Forgot password flow.
- [ ] Admin can manually set/reset passwords.
- [ ] Password reset email sent only if user exists.
- [ ] Reset link should contain a signed token carrying:
	- [ ] user id
	- [ ] issued timestamp
	- [ ] expiry window of 30 minutes
- [ ] On reset request, backend must validate signature and timeout before allowing password change.
- [ ] Store password hashes securely.
- [ ] Add role-based access control for student, faculty, HOD, dean, director, and admin.

### B. User management
- [ ] Admin can create a single user.
- [ ] Admin can bulk-create users from CSV/Excel upload.
- [ ] Admin can activate/deactivate users.
- [ ] Admin can assign roles and approval authority.
- [ ] Admin can map faculty/HOD/dean/director chains where needed.

### C. Form catalog and template system
- [ ] Build category-based form listing page for 100+ forms.
- [ ] Each form belongs to a section/category.
- [ ] Form builder schema should support:
	- [ ] textbox
	- [ ] radio
	- [ ] date
	- [ ] dropdown
- [ ] Keep form layout flexible rather than matching old Word files exactly.
- [ ] Allow admin to define PDF header, logo, form title, and section metadata.
- [ ] Store form schema in database so new forms do not require code changes.

### D. Submission and history
- [ ] Save every filled form as a submission record.
- [ ] Show user submission history.
- [ ] Allow opening old submissions.
- [ ] Add `edit as new` action:
	- [ ] duplicate prior submission data
	- [ ] prefill a new draft
	- [ ] allow edits before resubmission
	- [ ] preserve old submission unchanged

### E. Approval workflow engine
- [ ] Make approval actors dynamic per form.
- [ ] Support workflows such as:
	- [ ] faculty only
	- [ ] faculty -> HOD
	- [ ] faculty -> HOD -> dean
	- [ ] faculty -> HOD -> dean -> director
- [ ] Track approval state per stage.
- [ ] Keep audit log of approver, action, timestamp, and comment.
- [ ] Allow reject, send back, approve, and forward actions.
- [ ] Add approver dashboard/inbox.

### F. PDF generation
- [ ] Replace current basic PDF generation with branded output.
- [ ] Use institute logo and header.
- [ ] Use PDFKit templates for clean layouts, with WeasyPrint as backup if needed.
- [ ] Support dynamic field rendering from stored form schema.
- [ ] Generate final PDF after submission and after final approval if required.
- [ ] Store PDF path/metadata for later download.

## 6. Data model tasks

- [ ] Extend `User` model with role, department, status, and reset-token metadata if needed.
- [ ] Create `FormCategory` model.
- [ ] Extend or redesign `FormTemplate` to store JSON schema and PDF config.
- [ ] Extend `FormSubmission` to store:
	- [ ] form id
	- [ ] user id
	- [ ] form data snapshot
	- [ ] source submission id for `edit as new`
	- [ ] approval status
	- [ ] generated PDF metadata
- [ ] Add `WorkflowDefinition` model for dynamic approval steps.
- [ ] Add `ApprovalAction` or embedded approval log structure.

## 7. Backend API tasks

- [ ] Auth APIs: register, login, me, forgot password, reset password.
- [ ] Admin APIs: create user, bulk import users, reset password, list users, assign roles.
- [ ] Form APIs: list categories, list forms, get form schema, create/update form schema.
- [ ] Submission APIs: create draft, submit, list history, get details, `edit as new`.
- [ ] Approval APIs: inbox, approve, reject, send back, history.
- [ ] PDF APIs: generate, preview, download.

## 8. Frontend tasks

- [ ] Redesign dashboard to show categories and available forms.
- [ ] Add form renderer from backend schema.
- [ ] Add submission history page with filters.
- [ ] Add `edit as new` button in history/detail views.
- [ ] Add forgot password and reset password pages.
- [ ] Add admin screens for user import and form management.
- [ ] Add approver screens for pending approvals.
- [ ] Show PDF preview/download actions.

## 9. Security and configuration

- [ ] Move all secrets to `.env` files and Docker environment configuration.
- [ ] Never hardcode SMTP credentials in source files.
- [ ] Add request validation for all form and auth APIs.
- [ ] Add rate limiting on login and forgot-password endpoints.
- [ ] Add JWT auth and protected routes.
- [ ] Validate form access by role and workflow permissions.
- [ ] Add audit logging for admin and approval actions.

## 10. Docker deliverables

- [ ] Write [Dockerfile](Dockerfile) or service Dockerfiles with exact base image versions.
- [ ] Add `docker-compose.yml` with fixed service versions.
- [ ] Add environment variable examples for backend, frontend, and MongoDB.
- [ ] Ensure one command can boot the full stack locally.
- [ ] Add persistent Mongo volume.
- [ ] Add health checks for backend.

## 11. Suggested implementation order

### Phase 1 - Stabilize foundation
- [ ] Fix dependency version ranges.
- [ ] Add Docker Compose.
- [ ] Normalize backend module system and project structure.

### Phase 2 - Auth and users
- [ ] Complete login/me flow.
- [ ] Add forgot/reset password.
- [ ] Add admin user management and bulk import.

### Phase 3 - Forms and submissions
- [ ] Build category + form schema system.
- [ ] Build dynamic form renderer.
- [ ] Save drafts/submissions and history.
- [ ] Implement `edit as new`.

### Phase 4 - Workflow and approvals
- [ ] Add workflow definition engine.
- [ ] Add approver inbox and actions.
- [ ] Add status tracking and audit logs.

### Phase 5 - PDF and polish
- [ ] Build branded PDFKit templates.
- [ ] Add logo/header support.
- [ ] Improve final PDF design.
- [ ] Add preview/download experience.

## 12. Acceptance checklist

- [ ] A user can log in and recover password through email.
- [ ] Admin can bulk-create users.
- [ ] User can browse 100+ forms by category.
- [ ] User can fill a dynamic form and submit it.
- [ ] A styled PDF with logo/header is generated.
- [ ] User can view submission history.
- [ ] User can use `edit as new` from an old submission.
- [ ] Approval chain can vary by form.
- [ ] Full system runs through Docker with exact dependency versions.
