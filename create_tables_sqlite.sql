CREATE TABLE order_rent
(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name VARCHAR(1000) NOT NULL,
    start_date TIMESTAMP,
    end_date TIMESTAMP
);
CREATE UNIQUE INDEX order_rent_id_uindex ON order_rent (id);

CREATE TABLE movies
(
  id_movie       INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name           VARCHAR(200),
  clasification  INTEGER NOT NULL,
  summary        VARCHAR(200),
  main_character INTEGER NOT NULL,
  director       INTEGER NOT NULL,
  number_copies  INTEGER NOT NULL,
  free           INTEGER NOT NULL,
  rented         INTEGER NOT NULL,
  year           INTEGER NOT NULL
);
CREATE UNIQUE INDEX movies_id_movie_uindex ON movies (id_movie);

CREATE TABLE movie_rent_cart_temp
(
  id                 INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  id_movie           INTEGER,
  id_movie_rent_temp INTEGER,
  id_order           INTEGER
);
CREATE UNIQUE INDEX movie_rent_cart_temp_id_uindex ON movie_rent_cart_temp (id);

CREATE TABLE movie_rent
(
  id       INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  id_movie INTEGER,
  id_order INTEGER
);
CREATE UNIQUE INDEX movie_rent_id_uindex ON movie_rent (id);