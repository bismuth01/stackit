-- Notifications Database Schema
-- Simple in-app notifications for: answer, comment, mention, vote

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,              -- Who receives the notification (references users.id)
    type VARCHAR(20) NOT NULL CHECK (type IN ('answer', 'comment', 'mention', 'vote')),

    -- Pre-formatted message for display
    message TEXT NOT NULL,

    -- Actor and related entities
    actor_user_id UUID NOT NULL,        -- Who performed the action (references users.id)
    question_id UUID,                    -- Always present for context
    answer_id UUID,                      -- Present for answer/comment notifications
    comment_id UUID,                     -- Present for comment notifications

    -- Simple status
    is_read BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User notification preferences
CREATE TABLE user_notification_preferences (
    user_id UUID PRIMARY KEY,           -- References users.id from users database

    -- Simple toggles for each notification type
    answer_notifications BOOLEAN DEFAULT TRUE,
    comment_notifications BOOLEAN DEFAULT TRUE,
    mention_notifications BOOLEAN DEFAULT TRUE,
    vote_notifications BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_actor ON notifications(actor_user_id);

-- Trigger function for answer notifications
CREATE OR REPLACE FUNCTION notify_question_answered()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify if user has answer notifications enabled
    IF EXISTS (
        SELECT 1 FROM user_notification_preferences
        WHERE user_id = (SELECT user_id FROM questions WHERE id = NEW.question_id)
        AND answer_notifications = TRUE
    ) THEN
        -- Notify question author (if not self-answer)
        IF NEW.user_id != (SELECT user_id FROM questions WHERE id = NEW.question_id) THEN
            INSERT INTO notifications (user_id, type, message, actor_user_id, question_id, answer_id)
            SELECT
                q.user_id,
                'answer',
                u.username || ' answered your question "' ||
                CASE
                    WHEN LENGTH(q.title) > 50 THEN LEFT(q.title, 47) || '...'
                    ELSE q.title
                END || '"',
                NEW.user_id,
                NEW.question_id,
                NEW.id
            FROM questions q
            CROSS JOIN (
                -- We need to get username from users database, but we can't cross-reference
                -- For now, we'll use a placeholder and handle username lookup in application
                SELECT 'Someone' as username
            ) u
            WHERE q.id = NEW.question_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for comment notifications
CREATE OR REPLACE FUNCTION notify_content_commented()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    target_question_id UUID;
BEGIN
    -- Get the owner of the commented content and question context
    IF NEW.target_type = 'question' THEN
        SELECT user_id, id INTO target_user_id, target_question_id
        FROM questions WHERE id = NEW.target_id;
    ELSE
        SELECT user_id, question_id INTO target_user_id, target_question_id
        FROM answers WHERE id = NEW.target_id;
    END IF;

    -- Only notify if user has comment notifications enabled
    IF EXISTS (
        SELECT 1 FROM user_notification_preferences
        WHERE user_id = target_user_id AND comment_notifications = TRUE
    ) THEN
        -- Notify content owner (if not self-comment)
        IF NEW.user_id != target_user_id THEN
            INSERT INTO notifications (user_id, type, message, actor_user_id, question_id, answer_id, comment_id)
            VALUES (
                target_user_id,
                'comment',
                'Someone commented on your ' || NEW.target_type,
                NEW.user_id,
                target_question_id,
                CASE WHEN NEW.target_type = 'answer' THEN NEW.target_id ELSE NULL END,
                NEW.id
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for vote notifications (upvotes only)
CREATE OR REPLACE FUNCTION notify_content_voted()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    target_question_id UUID;
BEGIN
    -- Only notify for upvotes
    IF NEW.vote_type = 'up' THEN
        -- Get content owner and question context
        IF NEW.target_type = 'question' THEN
            SELECT user_id, id INTO target_user_id, target_question_id
            FROM questions WHERE id = NEW.target_id;
        ELSE
            SELECT user_id, question_id INTO target_user_id, target_question_id
            FROM answers WHERE id = NEW.target_id;
        END IF;

        -- Only notify if user has vote notifications enabled
        IF EXISTS (
            SELECT 1 FROM user_notification_preferences
            WHERE user_id = target_user_id AND vote_notifications = TRUE
        ) THEN
            -- Notify content owner (if not self-vote)
            IF NEW.user_id != target_user_id THEN
                INSERT INTO notifications (user_id, type, message, actor_user_id, question_id, answer_id)
                VALUES (
                    target_user_id,
                    'vote',
                    'Your ' || NEW.target_type || ' received an upvote',
                    NEW.user_id,
                    target_question_id,
                    CASE WHEN NEW.target_type = 'answer' THEN NEW.target_id ELSE NULL END
                );
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_notify_question_answered
    AFTER INSERT ON answers
    FOR EACH ROW EXECUTE FUNCTION notify_question_answered();

CREATE TRIGGER trigger_notify_content_commented
    AFTER INSERT ON comments
    FOR EACH ROW EXECUTE FUNCTION notify_content_commented();

CREATE TRIGGER trigger_notify_content_voted
    AFTER INSERT ON votes
    FOR EACH ROW EXECUTE FUNCTION notify_content_voted();

-- Function to handle mention notifications (called from application)
CREATE OR REPLACE FUNCTION create_mention_notification(
    mentioned_user_id UUID,
    mentioner_user_id UUID,
    mention_question_id UUID,
    mention_answer_id UUID DEFAULT NULL,
    mention_comment_id UUID DEFAULT NULL,
    mention_context VARCHAR(10) DEFAULT 'comment'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    -- Only create if user has mention notifications enabled
    IF EXISTS (
        SELECT 1 FROM user_notification_preferences
        WHERE user_id = mentioned_user_id AND mention_notifications = TRUE
    ) THEN
        INSERT INTO notifications (user_id, type, message, actor_user_id, question_id, answer_id, comment_id)
        VALUES (
            mentioned_user_id,
            'mention',
            'Someone mentioned you in a ' || mention_context,
            mentioner_user_id,
            mention_question_id,
            mention_answer_id,
            mention_comment_id
        )
        RETURNING id INTO notification_id;

        RETURN notification_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(target_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications
        WHERE user_id = target_user_id AND is_read = FALSE
    );
END;
$$ LANGUAGE plpgsql;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
    target_user_id UUID,
    notification_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    IF notification_ids IS NULL THEN
        -- Mark all notifications as read for user
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = target_user_id AND is_read = FALSE;
        GET DIAGNOSTICS updated_count = ROW_COUNT;
    ELSE
        -- Mark specific notifications as read
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = target_user_id
        AND id = ANY(notification_ids)
        AND is_read = FALSE;
        GET DIAGNOSTICS updated_count = ROW_COUNT;
    END IF;

    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default preferences for existing users (from sample data)
INSERT INTO user_notification_preferences (user_id)
SELECT id FROM (
    VALUES
    ('11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222')
) AS sample_users(id)
ON CONFLICT (user_id) DO NOTHING;

-- Sample notifications for testing
INSERT INTO notifications (user_id, type, message, actor_user_id, question_id, answer_id) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'answer',
    'jane_smith answered your question "How to handle async/await in JavaScript?"',
    '22222222-2222-2222-2222-222222222222',
    (SELECT id FROM questions LIMIT 1),
    (SELECT id FROM answers LIMIT 1)
),
(
    '22222222-2222-2222-2222-222222222222',
    'vote',
    'Your question received an upvote',
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM questions LIMIT 1 OFFSET 1),
    NULL
),
(
    '11111111-1111-1111-1111-111111111111',
    'comment',
    'dev_guru commented on your answer',
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM questions LIMIT 1),
    (SELECT id FROM answers LIMIT 1)
);

-- Create view for easier notification querying with user details
CREATE OR REPLACE VIEW notification_details AS
SELECT
    n.id,
    n.user_id,
    n.type,
    n.message,
    n.actor_user_id,
    n.question_id,
    n.answer_id,
    n.comment_id,
    n.is_read,
    n.created_at,
    -- Question title for context (when available)
    q.title as question_title,
    q.title as context_title
FROM notifications n
LEFT JOIN questions q ON n.question_id = q.id
ORDER BY n.created_at DESC;

-- Cleanup function to remove old read notifications (optional)
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE is_read = TRUE
    AND created_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * days_to_keep;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed based on your user setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO stackit_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON user_notification_preferences TO stackit_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO stackit_user;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Notification system setup completed successfully!';
    RAISE NOTICE 'Tables created: notifications, user_notification_preferences';
    RAISE NOTICE 'Triggers created: answer, comment, vote notifications';
    RAISE NOTICE 'Helper functions created for mentions, unread counts, and cleanup';
    RAISE NOTICE 'Sample data inserted for testing';
END $$;
