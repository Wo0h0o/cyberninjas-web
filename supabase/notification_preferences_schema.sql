-- Notification Preferences Table
-- This stores user email notification preferences

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Email notification toggles
    email_new_courses BOOLEAN DEFAULT true,
    email_weekly_summary BOOLEAN DEFAULT true,
    email_achievements BOOLEAN DEFAULT true,
    email_streak_reminders BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own notification preferences"
ON notification_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own notification preferences"
ON notification_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own preferences (for manual creation)
CREATE POLICY "Users can insert own notification preferences"
ON notification_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id 
ON notification_preferences(user_id);

-- Function to auto-create notification preferences on user signup
CREATE OR REPLACE FUNCTION create_notification_preferences_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create preferences when profile is created
-- (profiles are created after user signup)
CREATE TRIGGER on_profile_created_create_notification_preferences
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_notification_preferences_for_user();

-- Update updated_at timestamp on changes
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_notification_preferences_updated
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_notification_preferences_updated_at();
