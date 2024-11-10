import dotenv from 'dotenv';
import express from 'express';
import sql from 'mssql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import azureStorage from 'azure-storage';
import getStream from 'into-stream';
import cors from 'cors';
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { SearchClient } from '@azure/search-documents';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});

app.use(express.json());

// set up rate limiter: maximum of five requests per minute
var RateLimit = require('express-rate-limit');
var limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});

// apply rate limiter to all requests
app.use(limiter);

app.get('/:path', function(req, res) {
  let path = req.params.path;
  if (isValidPath(path))
    res.sendFile(path);
});


const vaultName = process.env.AZURE_KEY_VAULT_NAME;
const vaultUrl = `https://${vaultName}.vault.azure.net`;
const credential = new DefaultAzureCredential({
    managedIdentityClientId: process.env.MANAGED_IDENTITY_CLIENT_ID, // Use environment variable for managed identity client ID
});
const secretClient = new SecretClient(vaultUrl, credential);

async function getSecret(secretName) {
    const secret = await secretClient.getSecret(secretName);
    return secret.value;
}

const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('photo');

let sqlConfig;
let storageAccountName;
let azureStorageConnectionString;
let jwtSecret;
let searchEndpoint;
let searchApiKey;
let openaiEndpoint;
let openaiApiKey;

async function initializeApp() {
    sqlConfig = {
        user: await getSecret("sql-admin-username"),
        password: await getSecret("sql-admin-password"),
        database: await getSecret("sql-database-name"),
        server: await getSecret("sql-server-name"),
        options: {
            encrypt: true,
            trustServerCertificate: false
        }
    };

    storageAccountName = await getSecret("storage-account-name");
    azureStorageConnectionString = await getSecret("storage-account-connection-string");
    jwtSecret = await getSecret("jwt-secret");
    searchEndpoint = await getSecret("search-endpoint");
    searchApiKey = await getSecret("search-apikey");
    openaiEndpoint = await getSecret("openai-endpoint");
    openaiApiKey = await getSecret("openai-apikey");

    //console.log("SQL Config:", sqlConfig);
    // console.log("Storage Account Name:", storageAccountName);
    // console.log("Azure Storage Connection String:", azureStorageConnectionString);
    // console.log("JWT Secret:", jwtSecret);
    // console.log("Search Endpoint:", searchEndpoint);
    // console.log("Search API Key:", searchApiKey);
    // console.log("OpenAI Endpoint:", openaiEndpoint);
    // console.log("OpenAI API Key:", openaiApiKey);

    // Initialize OpenAI and Azure Search clients
    const openaiClient = new OpenAIClient(openaiEndpoint, new AzureKeyCredential(openaiApiKey));
    const userSearchClient = new SearchClient(searchEndpoint, 'users-index', new AzureKeyCredential(searchApiKey));
    const bookSearchClient = new SearchClient(searchEndpoint, 'books-index', new AzureKeyCredential(searchApiKey));

    // Start server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    }).on('error', error => {
        console.error("Error initializing application:", error);
    });
}
initializeApp().catch(error => {
    console.error("Error initializing application:", error);
});

// Upload photo endpoint
app.post('/uploadphoto', uploadStrategy, (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const blobName = `userphotos/${Date.now()}_${req.file.originalname}`;
    const stream = getStream(req.file.buffer);
    const streamLength = req.file.buffer.length;
    const blobService = azureStorage.createBlobService(azureStorageConnectionString);

    blobService.createBlockBlobFromStream('pics', blobName, stream, streamLength, err => {
        if (err) {
            console.error(err);
            res.status(500).send('Error uploading the file');
        } else {
            const photoUrl = `https://${storageAccountName}.blob.core.windows.net/pics/${blobName}`;
            res.status(200).send({ photoUrl });
        }
    });
});

// Register endpoint
app.post('/register', uploadStrategy, async (req, res) => {
    const { firstName, lastName, username, password, age, emailAddress, genres } = req.body;
    if (!password) {
        return res.status(400).send({ message: 'Password is required' });
    }

    let photoUrl = '';
    if (req.file) {
        const blobName = `userphotos/${Date.now()}_${req.file.originalname}`;
        const stream = getStream(req.file.buffer);
        const streamLength = req.file.buffer.length;
        const blobService = azureStorage.createBlobService(azureStorageConnectionString);

        await new Promise((resolve, reject) => {
            blobService.createBlockBlobFromStream('pics', blobName, stream, streamLength, err => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    photoUrl = `https://${storageAccountName}.blob.core.windows.net/pics/${blobName}`;
                    resolve();
                }
            });
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashedPassword)
            .input('firstname', sql.NVarChar, firstName)
            .input('lastname', sql.NVarChar, lastName)
            .input('age', sql.Int, age)
            .input('emailAddress', sql.NVarChar, emailAddress)
            .input('photoUrl', sql.NVarChar, photoUrl)
            .query(`
                INSERT INTO Users 
                (Username, PasswordHash, FirstName, LastName, Age, EmailAddress, PhotoUrl) 
                VALUES 
                (@username, @password, @firstname, @lastname, @age, @emailAddress, @photoUrl);
                SELECT SCOPE_IDENTITY() AS UserId;
            `);

        const userId = result.recordset[0].UserId;

        if (genres && genres.length > 0) {
            const genreNames = genres.split(','); // Assuming genres are sent as a comma-separated string
            for (const genreName of genreNames) {
                let genreResult = await pool.request()
                    .input('genreName', sql.NVarChar, genreName.trim())
                    .query(`
                        IF NOT EXISTS (SELECT 1 FROM Genres WHERE GenreName = @genreName)
                        BEGIN
                            INSERT INTO Genres (GenreName) VALUES (@genreName);
                        END
                        SELECT GenreId FROM Genres WHERE GenreName = @genreName;
                    `);

                const genreId = genreResult.recordset[0].GenreId;

                await pool.request()
                    .input('userId', sql.Int, userId)
                    .input('genreId', sql.Int, genreId)
                    .query('INSERT INTO UsersGenres (UserId, GenreId) VALUES (@userId, @genreId)');
            }
        }

        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error registering user' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('username', sql.NVarChar, req.body.username)
            .query('SELECT UserId, PasswordHash FROM Users WHERE Username = @username');

        if (result.recordset.length === 0) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        const user = result.recordset[0];
        const validPassword = await bcrypt.compare(req.body.password, user.PasswordHash);

        if (!validPassword) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ UserId: user.UserId }, jwtSecret, { expiresIn: '1h' });
        res.send({ token: token, UserId: user.UserId });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error logging in' });
    }
});

// Get user data endpoint
app.get('/user/:UserId', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('UserId', sql.Int, req.params.UserId)
            .query('SELECT Username, FirstName, LastName, Age, EmailAddress, PhotoUrl FROM Users WHERE UserId = @UserId');

        if (result.recordset.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        const user = result.recordset[0];
        res.send(user);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error fetching user data' });
    }
});

// // AI Assistant endpoint for book questions and recommendations
// app.post('/ai-assistant', async (req, res) => {
//     const { query, userId } = req.body;

//     console.log('Received request body:', req.body);
//     console.log('Extracted userId:', userId);

//     try {
//         if (!userId) {
//             console.error('User ID is missing from the request.');
//             return res.status(400).send({ message: 'User ID is required.' });
//         }

//         //console.log(`Received request for user ID: ${userId}`);

//         // Retrieve user data
//         let pool = await sql.connect(sqlConfig);
//         let userResult = await pool.request()
//             .input('UserId', sql.Int, userId)
//             .query('SELECT * FROM Users WHERE UserId = @UserId');
        
//         const user = userResult.recordset[0];

//         if (!user) {
//             console.error(`User with ID ${userId} not found.`);
//             return res.status(404).send({ message: `User with ID ${userId} not found.` });
//         }

//         console.log(`User data: ${JSON.stringify(user)}`);

//         if (query.toLowerCase().includes("recommendation")) {
//             // Fetch user genres
//             const userGenresResult = await pool.request()
//                 .input('UserId', sql.Int, userId)
//                 .query('SELECT GenreName FROM Genres g JOIN UsersGenres ug ON g.GenreId = ug.GenreId WHERE ug.UserId = @UserId');

//             const userGenres = userGenresResult.recordset.map(record => record.GenreName).join(' ');

//             //console.log(`User genres: ${userGenres}`);

//             // Fetch user embedding from search index
//             const userSearchClient = new SearchClient(searchEndpoint, 'users-index', new AzureKeyCredential(searchApiKey));
//             const userEmbeddingResult = await userSearchClient.getDocument(String(user.UserId));
//             const userEmbedding = userEmbeddingResult.Embedding;

//             //console.log(`User embedding result: ${JSON.stringify(userEmbeddingResult)}`);
//             //console.log(`User embedding: ${userEmbedding}`);

//             if (!userEmbedding || userEmbedding.length === 0) {
//                 console.error('User embedding not found.');
//                 return res.status(500).send({ message: 'User embedding not found.' });
//             }

//             // Search for recommendations
//             const bookSearchClient = new SearchClient(searchEndpoint, 'books-index', new AzureKeyCredential(searchApiKey));
//             const searchResponse = await bookSearchClient.search("*", {
//                 vectors: [{
//                     value: userEmbedding,
//                     fields: ["Embedding"],
//                     kNearestNeighborsCount: 5
//                 }],
//                 includeTotalCount: true,
//                 select: ["Title", "Author"]
//             });

//             const recommendations = [];
//             for await (const result of searchResponse.results) {
//                 recommendations.push({
//                     title: result.document.Title,
//                     author: result.document.Author,
//                     score: result.score
//                 });
//             }

//             // Limit recommendations to top 5
//             const topRecommendations = recommendations.slice(0, 5);

//             return res.json({ response: "Here are some personalized recommendations for you:", recommendations: topRecommendations });
//         } else {
//             // General book query
//             const openaiClient = new OpenAIClient(openaiEndpoint, new AzureKeyCredential(openaiApiKey));
//             const deploymentId = "gpt";  // Replace with your deployment ID

//             // Extract rating and genre from query
//             const ratingMatch = query.match(/rating over (\d+(\.\d+)?)/);
//             const genreMatch = query.match(/genre (\w+)/i);
//             const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
//             const genre = genreMatch ? genreMatch[1] : null;

//             if (rating && genre) {
//                 // Search for books with the specified genre and rating
//                 const bookSearchClient = new SearchClient(searchEndpoint, 'books-index', new AzureKeyCredential(searchApiKey));
//                 const searchResponse = await bookSearchClient.search("*", {
//                     filter: `Rating gt ${rating} and Genres/any(g: g eq '${genre}')`,
//                     top: 5,
//                     select: ["Title", "Author", "Rating"]
//                 });

//                 const books = [];
//                 for await (const result of searchResponse.results) {
//                     books.push({
//                         title: result.document.Title,
//                         author: result.document.Author,
//                         rating: result.document.Rating
//                     });
//                 }

//                 const bookResponse = books.map(book => `${book.title} by ${book.author} with rating ${book.rating}`).join('\n');
//                 return res.json({ response: `Here are 5 books with rating over ${rating} in ${genre} genre:\n${bookResponse}` });
//             } else {
//                 // Handle general queries about books using OpenAI with streaming chat completions
//                 const events = await openaiClient.streamChatCompletions(
//                     deploymentId,
//                     [
//                         { role: "system", content: "You are a helpful assistant that answers questions about books and provides personalized recommendations." },
//                         { role: "user", content: query }
//                     ],
//                     { maxTokens: 350 }
//                 );

//                 let aiResponse = "";
//                 for await (const event of events) {
//                     for (const choice of event.choices) {
//                         aiResponse += choice.delta?.content || '';
//                     }
//                 }

//                 return res.json({ response: aiResponse });
//             }
//         }
//     } catch (error) {
//         console.error('Error processing AI Assistant request:', error);
//         return res.status(500).send({ message: 'Error processing your request.' });
//     }
// });

// AI Assistant endpoint for book questions and recommendations
app.post('/ai-assistant', async (req, res) => {
    const { query, userId } = req.body;

    console.log('Received request body:', req.body);
    console.log('Extracted userId:', userId);

    try {
        if (!userId) {
            console.error('User ID is missing from the request.');
            return res.status(400).send({ message: 'User ID is required.' });
        }

        // Retrieve user data
        let pool = await sql.connect(sqlConfig);
        let userResult = await pool.request()
            .input('UserId', sql.Int, userId)
            .query('SELECT * FROM Users WHERE UserId = @UserId');
        
        const user = userResult.recordset[0];

        if (!user) {
            console.error(`User with ID ${userId} not found.`);
            return res.status(404).send({ message: `User with ID ${userId} not found.` });
        }

        if (query.toLowerCase().includes("recommendation")) {
            // Fetch user genres
            const userGenresResult = await pool.request()
                .input('UserId', sql.Int, userId)
                .query('SELECT GenreName FROM Genres g JOIN UsersGenres ug ON g.GenreId = ug.GenreId WHERE ug.UserId = @UserId');

            const userGenres = userGenresResult.recordset.map(record => record.GenreName).join(' ');

            // Fetch user embedding from search index
            const userSearchClient = new SearchClient(searchEndpoint, 'users-index', new AzureKeyCredential(searchApiKey));
            const userEmbeddingResult = await userSearchClient.getDocument(String(user.UserId));
            const userEmbedding = userEmbeddingResult.Embedding;

            if (!userEmbedding || userEmbedding.length === 0) {
                console.error('User embedding not found.');
                return res.status(500).send({ message: 'User embedding not found.' });
            }

            // Search for book recommendations using both Embedding and DescriptionEmbedding
            const bookSearchClient = new SearchClient(searchEndpoint, 'books-index', new AzureKeyCredential(searchApiKey));
            const searchResponse = await bookSearchClient.search("*", {
                vectors: [
                    {
                        value: userEmbedding,
                        fields: ["Embedding"],
                        kNearestNeighborsCount: 3
                    },
                    {
                        value: userEmbedding,
                        fields: ["DescriptionEmbedding"],
                        kNearestNeighborsCount: 2
                    }
                ],
                includeTotalCount: true,
                select: ["Title", "Author", "Description"]
            });

            const recommendations = [];
            for await (const result of searchResponse.results) {
                recommendations.push({
                    title: result.document.Title,
                    author: result.document.Author,
                    description: result.document.Description,
                    score: result.score
                });
            }

            // Limit recommendations to top 5
            const topRecommendations = recommendations.slice(0, 5);

            return res.json({
                response: "Here are some personalized recommendations for you:",
                recommendations: topRecommendations.map(book => ({
                    title: book.title,
                    author: book.author,
                    description: book.description
                }))
            });
        } else {
            // General book query using OpenAI
            const openaiClient = new OpenAIClient(openaiEndpoint, new AzureKeyCredential(openaiApiKey));
            const deploymentId = "gpt";

            const events = await openaiClient.streamChatCompletions(
                deploymentId,
                [
                    { role: "system", content: "You are a helpful assistant that answers questions about books and provides personalized recommendations." },
                    { role: "user", content: query }
                ],
                { maxTokens: 350 }
            );

            let aiResponse = "";
            for await (const event of events) {
                for (const choice of event.choices) {
                    aiResponse += choice.delta?.content || '';
                }
            }

            return res.json({ response: aiResponse });
        }
    } catch (error) {
        console.error('Error processing AI Assistant request:', error);
        return res.status(500).send({ message: 'Error processing your request.' });
    }
});
