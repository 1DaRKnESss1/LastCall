-- Where the card sits on the board. NULL means it has never been dragged, so
-- the board lays it out automatically instead of stacking everything at 0,0.
ALTER TABLE subjects ADD COLUMN pos_x INTEGER;
ALTER TABLE subjects ADD COLUMN pos_y INTEGER;
