DROP DATABASE IF EXISTS habit_builder_db;

CREATE DATABASE habit_builder_db;

USE habit_builder_db;

DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS themes;
DROP TABLE IF EXISTS levels;
DROP TABLE IF EXISTS user_level;
DROP TABLE IF EXISTS habits;
DROP TABLE IF EXISTS user_habits;
DROP TABLE If EXISTS badges;
DROP TABLE IF EXISTS user_badges;
DROP TABLE IF EXISTS habit_completion;
DROP TABLE IF EXISTS passwords;
DROP TABLE IF EXISTS days;
DROP TABLE IF EXISTS frequency;
DROP TABLE IF EXISTS badge_level;
DROP TABLE IF EXISTS pending_badges;
DROP TABLE IF EXISTS friends;
DROP TRIGGER IF EXISTS delete_friend_request;
DROP TRIGGER IF EXISTS add_habit_status;
DROP TRIGGER IF EXISTS check_status_before_completion;


CREATE TABLE user(
	id BINARY(16),
    first_name VARCHAR(20) CHECK (CHAR_LENGTH(first_name) >= 2 AND first_name REGEXP '^[A-Za-z]+$') NOT NULL,
    last_name VARCHAR(20) CHECK (CHAR_LENGTH(last_name) >= 2 AND last_name REGEXP '^[A-Za-z]+$') NOT NULL,
    username VARCHAR(20) CHECK (CHAR_LENGTH(username) > 1) NOT NULL UNIQUE,
    user_email VARCHAR(256) CHECK (CHAR_LENGTH(user_email) > 10) NOT NULL UNIQUE,
	amount_in_progress INT DEFAULT 0,
    amount_scheduled INT DEFAULT 0,
    points INT DEFAULT 0 NOT NULL,
    theme VARCHAR(20) NOT NULL,
    date_of_birth VARCHAR(15) NOT NULL,
    country VARCHAR(20) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE friends(
    friend_1 BINARY(16),
    friend_2 BINARY(16),
    status  ENUM('ACCEPTED', 'PENDING', 'REJECTED'),
    PRIMARY KEY(friend_1, friend_2),
    FOREIGN KEY(friend_1) REFERENCES user(id),
    FOREIGN KEY(friend_2) REFERENCES user(id)    
);

CREATE TABLE levels(
	id INT AUTO_INCREMENT,
    badge_level VARCHAR(20) UNIQUE,
    user_level INT UNIQUE,
    points_or_completions_required INT NOT NULL,
	points_given INT UNIQUE,
    PRIMARY KEY(id)
);

CREATE TABLE themes(
	id INT AUTO_INCREMENT,
    theme VARCHAR(20) NOT NULL,
    level_name VARCHAR(20) NOT NULL UNIQUE,
    level_number INT NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(level_number) REFERENCES levels(id)
);

CREATE TABLE user_level(
	level_id INT DEFAULT 1,
    user_id BINARY(16),
    PRIMARY KEY(level_id, user_id),
    FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY(level_id) REFERENCES levels(id)
);

CREATE TABLE badges(
	id INT AUTO_INCREMENT,
    badge VARCHAR(30) NOT NULL UNIQUE,
    keyword VARCHAR(30) NOT NULL UNIQUE,
    username VARCHAR(30) NOT NULL,
    PRIMARY KEY(id)
);


CREATE TABLE pending_badges(
id INT AUTO_INCREMENT,
badge VARCHAR(30) NOT NULL UNIQUE,
keyword VARCHAR(30) NOT NULL UNIQUE,
username VARCHAR(20) NOT NULL UNIQUE,
PRIMARY KEY(id)
);
CREATE TABLE user_habits(
	id INT AUTO_INCREMENT,
	user_id BINARY(16) NOT NULL,
    habit VARCHAR(30) NOT NULL,
	status VARCHAR(20),
    deadline VARCHAR(10) NOT NULL,
    PRIMARY KEY(id), 
    UNIQUE(habit, deadline),
    FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE habit_completion(
	user_id BINARY(16),
    habit VARCHAR(30) NOT NULL,
	badge_id INT,
	badge_level VARCHAR(30),
	times_completed INT DEFAULT 0,
	times_not_completed INT DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE,
	FOREIGN KEY(badge_id) REFERENCES badges(id)
);

CREATE TABLE passwords(
	id INT AUTO_INCREMENT,
	user_id BINARY(16),
    password VARCHAR(60) NOT NULL,
    temporary_password VARCHAR(60),
    time_stamp INT,
    FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE,
	PRIMARY KEY(id, password)
);

CREATE TABLE days(
	id INT AUTO_INCREMENT,
    day VARCHAR(20),
	PRIMARY KEY(id)
);

CREATE TABLE frequency(
	habit_id INT,
    id_day INT,
    FOREIGN KEY(habit_id) REFERENCES user_habits(id) ON DELETE CASCADE,
    FOREIGN KEY(id_day) REFERENCES days(id),
	PRIMARY KEY (habit_id, id_day)
);

CREATE INDEX username_index ON user(username);
CREATE INDEX habit_id_index ON user_habits(id);
CREATE INDEX level_id ON levels(id, points_or_completions_required);

DELIMITER $
CREATE TRIGGER delete_friend_request
	AFTER UPDATE ON friends
    FOR EACH ROW
BEGIN
	DELETE FROM friends WHERE status = 'REJECTED';
END $
DELIMITER ;

DELIMITER $
CREATE TRIGGER check_status_before_completion
	BEFORE UPDATE ON user_habits
    FOR EACH ROW
BEGIN
 	IF OLD.status != 'IN PROGRESS' THEN 
 		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only habits that are in progress can be completed.';
 	END IF;
END $
DELIMITER ;


DELIMITER $
CREATE TRIGGER add_habit_status
	BEFORE INSERT ON user_habits
    FOR EACH ROW
BEGIN
	IF NEW.deadline > CURDATE() THEN 
		SET NEW.status = 'SCHEDULED';
	ELSEIF NEW.deadline = CURDATE() THEN 
		SET NEW.status = 'IN PROGRESS';
	ELSE
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Deadline cannot be before today.';
	END IF;
END $
DELIMITER ;

INSERT INTO levels(user_level, points_or_completions_required)
VALUES
(1, 0),
(2, 50),
(3, 150),
(4, 300),
(5, 500),
(6, 750),
(7, 1050),
(8, 1400),
(9, 1800),
(10, 2250),
(11, 2750),
(12, 3300),
(13, 3900),
(14, 4550),
(15, 5250);

INSERT INTO levels(badge_level, points_or_completions_required, points_given)
VALUES
('NO LEVEL', 0, 1),
('BRONZE', 25, 2),
('SILVER', 50, 3),
('GOLD', 75, 4),
('DIAMOND', 100, 5),
('RUBY', 150, 6),
('EMERALD', 200, 7),
('OPAL', 300, 8);


INSERT INTO themes (theme, level_name, level_number)
VALUES
('greek_gods', 'Human', 1),
('greek_gods', 'Hero', 2),
('greek_gods', 'Demigod', 3),
('greek_gods', 'Minor Deity', 4),
('greek_gods', 'Titan', 5),
('greek_gods', 'Demeter', 6),
('greek_gods', 'Dionysus', 7),
('greek_gods', 'Artemis', 8),
('greek_gods', 'Ares', 9),
('greek_gods', 'Apollo', 10),
('greek_gods', 'Athena', 11),
('greek_gods', 'Poseidon', 12),
('greek_gods', 'Hades', 13),
('greek_gods', 'Zeus', 14),
('greek_gods', 'Chronos', 15);

INSERT INTO themes (theme, level_name, level_number)
VALUES
('traveler', 'Local explorer', 1),
('traveler', 'Backpacker', 2),
('traveler', 'Tourist', 3),
('traveler', 'Sightseer', 4),
('traveler', 'Road tripper', 5),
('traveler', 'Adventurer', 6),
('traveler', 'Hiker', 7),
('traveler', 'Voyager', 8),
('traveler', 'Globetrotter', 9),
('traveler', 'Nomad', 10),
('traveler', 'Pioneer', 11),
('traveler', 'Wanderer', 12),
('traveler', 'Pathfinder', 13),
('traveler', 'Journey Master', 14),
('traveler', 'World Conqueror', 15);

INSERT INTO themes (theme, level_name, level_number)
VALUES
('athele', 'Beginner', 1),
('athele', 'Trainee', 2),
('athele', 'Amateur', 3),
('athele', 'Competitor', 4),
('athele', 'Contender', 5),
('athele', 'Specialist', 6),
('athele', 'Skilled Player', 7),
('athele', 'Professional', 8),
('athele', 'Elite athlete', 9),
('athele', 'Champion', 10),
('athele', 'Record Holder', 11),
('athele', 'Icon', 12),
('athele', 'Olympian', 13),
('athele', 'World Champion', 14),
('athele', 'Legend', 15);

INSERT INTO themes (theme, level_name, level_number)
VALUES
('medieval_fantasy', 'Peasant', 1),
('medieval_fantasy', 'Squire', 2),
('medieval_fantasy', 'Knight', 3),
('medieval_fantasy', 'Baron', 4),
('medieval_fantasy', 'Viscount', 5),
('medieval_fantasy', 'Count', 6),
('medieval_fantasy', 'Marquis', 7),
('medieval_fantasy', 'Duke', 8),
('medieval_fantasy', 'Archduke', 9),
('medieval_fantasy', 'Prince', 10),
('medieval_fantasy', 'King', 11),
('medieval_fantasy', 'Emperor', 12),
('medieval_fantasy', 'High mage', 13),
('medieval_fantasy', 'Dragon rider', 14),
('medieval_fantasy', 'Divine sovereign', 15);

INSERT INTO themes (theme, level_name, level_number)
VALUES
('magic', 'Apprentice mage', 1),
('magic', 'Novice enchanter', 2),
('magic', 'Adept spellcaster', 3),
('magic', 'Skiler Sorcerer', 4),
('magic', 'Cunning illusionist', 5),
('magic', 'Mystic conjurer', 6),
('magic', 'Master alchemist', 7),
('magic', 'Archane wizard', 8),
('magic', 'Elemental warlock', 9),
('magic', 'Shadow necromancer', 10),
('magic', 'Divine cleric', 11),
('magic', 'Grand Druid', 12),
('magic', 'High archmage', 13),
('magic', 'Supreme thaumaturge', 14),
('magic', 'Legendary magus', 15);

INSERT INTO badges(badge, keyword, username)
VALUES
('book lover', 'read', 'habitbuilder'),
('Exercise', 'workout', 'habitbuilder'),
('Runner', 'run', 'habitbuilder'),
('Meditation', 'meditate', 'habitbuilder'),
('Better sleep', 'sleep', 'habitbuilder'),
('Screen time', 'screen', 'habitbuilder'),
('Bonding', 'get in touch', 'habitbuilder'),
('Financial Management', 'finance', 'habitbuilder'),
('Professional development', 'career', 'habitbuilder'),
('Self-care', 'myself', 'habitbuilder'),
('Hobby pursuit', 'hobby', 'habitbuilder'),
('New skill', 'practice', 'habitbuilder');

INSERT INTO days(day)
VALUE
('Monday'),
('Tuesday'),
('Wednesday'),
('Thursday'),
('Friday'),
('Saturday'),
('Sunday');