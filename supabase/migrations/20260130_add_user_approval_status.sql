-- Add approval status to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add approved_by and approved_at columns for audit trail
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add created_by to distinguish admin-created vs self-registered
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Comment on columns
COMMENT ON COLUMN users.approval_status IS 'Approval status: pending (needs approval), approved (can access), rejected (denied access)';
COMMENT ON COLUMN users.approved_by IS 'User ID of admin who approved this user';
COMMENT ON COLUMN users.approved_at IS 'Timestamp when user was approved';
COMMENT ON COLUMN users.created_by IS 'User ID of admin who created this user (null for self-registered)';

-- Update existing users to be approved (they were created before this system)
UPDATE users SET approval_status = 'approved' WHERE approval_status IS NULL;
