-- Content Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References users.id from users database
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[], -- Array of tag names
    vote_count INTEGER DEFAULT 0,
    answer_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_answered BOOLEAN DEFAULT FALSE,
    accepted_answer_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Answers table
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- References users.id from users database
    content TEXT NOT NULL,
    vote_count INTEGER DEFAULT 0,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Votes table
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References users.id from users database
    target_id UUID NOT NULL, -- Can be question_id or answer_id
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('question', 'answer')),
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_id, target_type)
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id UUID NOT NULL, -- Can be question_id or answer_id
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('question', 'answer')),
    user_id UUID NOT NULL, -- References users.id from users database
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_vote_count ON questions(vote_count DESC);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_user_id ON answers(user_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_target ON votes(target_id, target_type);
CREATE INDEX idx_comments_target ON comments(target_id, target_type);
CREATE INDEX idx_tags_name ON tags(name);

-- Triggers to update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'question' THEN
            UPDATE questions
            SET vote_count = vote_count + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END
            WHERE id = NEW.target_id;
        ELSIF NEW.target_type = 'answer' THEN
            UPDATE answers
            SET vote_count = vote_count + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END
            WHERE id = NEW.target_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.target_type = 'question' THEN
            UPDATE questions
            SET vote_count = vote_count - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
            WHERE id = OLD.target_id;
        ELSIF OLD.target_type = 'answer' THEN
            UPDATE answers
            SET vote_count = vote_count - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
            WHERE id = OLD.target_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vote_counts
    AFTER INSERT OR DELETE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- Sample data
INSERT INTO tags (name, description, usage_count) VALUES
('javascript', 'JavaScript programming language', 150),
('python', 'Python programming language', 200),
('react', 'React.js library', 100),
('nodejs', 'Node.js runtime', 80);

-- Sample questions
INSERT INTO questions (user_id, title, content, tags, vote_count, view_count) VALUES
('11111111-1111-1111-1111-111111111111', 'How to handle async/await in JavaScript?', 'I am having trouble understanding how async/await works...', ARRAY['javascript', 'nodejs'], 5, 120),
('22222222-2222-2222-2222-222222222222', 'Best practices for React state management', 'What are the best practices for managing state in React applications?', ARRAY['react', 'javascript'], 8, 200);
