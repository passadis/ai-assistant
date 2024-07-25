<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=azure,react,nodejs,js,terraform,vscode" />
  </a>
</p>

<h1 align="center">Azure AI Search: Nativity in Microsoft Fabric</h1>

## Introduction

This project is about building a new **Ai Assistant in Web App** leveraging the power of **Azure SQL Database**, **Ai Search Vector Index**, **Microsoft Fabric** and **Azure Web Apps**. The Project uses a Custom Identity Database where users provide preferences over Books Genres.The system takes the preferences and creates **embeddings** in Azure OpenAI alongside with a Books Dataset and combines the preferences with the Books Dataset, for an interactive AI Experience. The Users cna ask for recommendations, request specific details about Genres and Ratings and also interact in a normal chat converstation about literature with the AI Assistant, powered from OpenAI latest models.

## Project Build

### Frontend

- **React Web Application**: The frontend of our identity system is a user-friendly React web application. It includes:
  - **Sign Up and Sign In Features**: Allows users to register and log into the system, providing a seamless authentication experience.
  - **User Dashboard**: After logging in, users access a dashboard, where they can interact with Azure OpenAI for recommendations, ratings and genres and literature and books!

### Backend

- **API Endpoint**: The backend is structured as an API endpoint handling the Sign Up and Login processes. It involves:
  - **Integration with Azure SQL Database**: Our code interacts with Azure SQL Database to perform operations like inserting data and verifying user credentials.
  - **Azure AI Search Vector Index & Azure OpenAI Embeddings**: Creates and configures Azure Ai Search Indexes with Vector Profiles and creates embeddings with Azure OpenAI.
  - **Relevant Queries**: The system uses SQL queries to manage user data efficiently.

### Deployment and Hosting

- **Docker Containers**: Both the frontend and backend components are containerized using Docker, ensuring consistency across different development and production environments.
- **Azure Container Registry**: The Docker images are pushed to Azure Container Registry, from where they are managed and deployed.
- **Deployment on Azure Web Apps**: The Docker images are then pulled and hosted on Azure Web Apps, providing a scalable and managed hosting environment.

## Features

- AI Powered recommendations Assistant
- Managed cloud-based SQL database for secure and scalable data handling.
- User-friendly React-based frontend interface for registration and login.
- Secure backend API for handling authentication processes.
- Docker containerization for consistent deployment and scalability.
- Integration with Azure services for robust and reliable application performance.

## Conclusion

This Identity System project demonstrates a seamless integration of modern web technologies with Azure's cloud services. It showcases how Azure SQL and Azure Web Apps can be utilized to build and deploy a secure and scalable user authentication system, complete with a front-end user interface and a back-end API service.
## Instructions
**Follow the Blog for Detailed Instructions**: For step-by-step guidance, visit [Azure AI Search: Nativity in Microsoft Fabric](https://www.cloudblogger.eu/2024/07/23/azure-ai-search-nativity-in-microsoft-fabric/).

**Additional help for the Identity** : step-by-step guidance, visit [Custom Identity Database with Azure SQL and Web Apps](https://www.cloudblogger.eu/2023/12/11/custom-identity-database-with-azure-sql-and-web-apps/).
## Contribution

Contributions are welcome! If you have suggestions or improvements, feel free to fork the repository, make your changes, and submit a pull request.


## Contribute
We encourage contributions! If you have ideas on how to improve this application or want to report a bug, please feel free to open an issue or submit a pull request.

## Architecture

![books-arch](https://github.com/user-attachments/assets/29c4a43d-b91e-4993-ba86-c289f2c8dfdd)

