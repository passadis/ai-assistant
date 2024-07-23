-- Users table
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Age INT NOT NULL,
    EmailAddress NVARCHAR(100) NOT NULL,
    Username NVARCHAR(50) NOT NULL,
    PasswordHash NVARCHAR(100) NOT NULL,
    photoUrl NVARCHAR(500) NOT NULL
);

-- Genres table
CREATE TABLE Genres (
    GenreId INT PRIMARY KEY IDENTITY(1,1),
    GenreName NVARCHAR(550)
);

-- UsersGenres join table
CREATE TABLE UsersGenres (
    UserId INT,
    GenreId INT,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (GenreId) REFERENCES Genres(GenreId)
);

ALTER DATABASE dbusesearch02
SET CHANGE_TRACKING = ON  
(CHANGE_RETENTION = 2 DAYS, AUTO_CLEANUP = ON)