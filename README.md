<div align="center">

# Projects Service

<a href="https://shikshalokam.org/elevate/">
<img
    src="https://shikshalokam.org/wp-content/uploads/2021/06/elevate-logo.png"
    height="140"
    width="300"
  />
</a>

![GitHub package.json version (subfolder of monorepo)](https://img.shields.io/github/package-json/v/ELEVATE-Project/mentoring?filename=src%2Fpackage.json)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

</div>

</br>
The Project building block facilitates the creation and engagement with micro-improvement projects.

</div>
</br>

# Supported Operating Systems

-   **Ubuntu (Recommended: Version 20 and above)**
-   **Windows (Recommended: Version 11 and above)**
-   **macOs (Recommended: Version 12 and above)**

# Setup Options

**Project services can be setup using two methods:**

> Note : This guide outlines two setup methods, detailed below. For a quick, beginner-friendly setup and walkthrough of services, it is recommended to use the Dockerized Services & Dependencies setup with the Docker-Compose file.

<details><summary>Dockerized Services & Dependencies Using Docker-Compose File</summary>

## Dockerized Services & Dependencies

Expectation: By diligently following the outlined steps, you will successfully establish a fully operational Project application setup, including both the portal and backend services.

## Prerequisites

To set up the Project application, ensure you have Docker and Docker Compose installed on your system. For Ubuntu users, detailed installation instructions for both can be found in the documentation here: [How To Install and Use Docker Compose on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04). To install and use Nodejs in Ubuntu machine, you can follow instructions here: [How To Install Nodejs in Ubuntu](https://nodejs.org/en/download/package-manager). For Windows and MacOS users, you can refer to the Docker documentation for installation instructions: [Docker Compose Installation Guide](https://docs.docker.com/compose/install/). Once these prerequisites are in place, you're all set to get started with setting up the Project application.

## Installation

**Create project Directory:** Establish a directory titled **project**.

> Example Command: `mkdir project && cd project/`

> Note: All commands are run from the project directory.

## Operating Systems: Linux / macOS

> **Caution:** Before proceeding, please ensure that the ports given here are available and open. It is essential to verify their availability prior to moving forward. You can run below command in your terminal to check this

```
for port in 3000 3001 3002 6000 5001 4000 9092 5432 7007 2181 2707 3569; do
    if lsof -iTCP:$port -sTCP:LISTEN &>/dev/null; then
        echo "Port $port is in use"
    else
        echo "Port $port is available"
    fi
done
```

1.  **Download and execute main setup script:** Execute the following command in your terminal from the project directory.
    `   curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/scripts/mac-linux/setup_project.sh && chmod +x setup_project.sh && sudo ./setup_project.sh`

         > Note : The script will download all the essential files and launch the services in Docker. Once all services are successfully up and running, you can proceed to the next steps.

         **General Instructions :**

         1. All containers which are part of the docker-compose can be gracefully stopped by pressing Ctrl + c in the same terminal where the services are running.

         2. All docker containers can be stopped and removed by using below command.
             ```
             sudo ./docker-compose-down.sh
             ```
         3. All services and dependencies can be started using below command.
             ```
             sudo ./docker-compose-up.sh
             ```

    **Keep the current terminal session active, and kindly open a new terminal window within the project directory.**

**After successfully completing this, please move to the next section: [Enable Citus Extension](#enable-citus-extension-optional)**

## Operating Systems: Windows

1.  **Download Docker Compose File:** Retrieve the **[docker-compose-project.yml](https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/docker-compose-project.yml)** file from the Project service repository and save it to the project directory.

    ```
    curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/docker-compose-project.yml
    ```

    > Note: All commands are run from the project directory.

2.  **Download Environment Files**: Using the OS specific commands given below, download environment files for all the services.

    -   **Windows**

        ```
        curl -L ^
         -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/interface_env ^
         -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/entity_management_env ^
         -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/project_env ^
         -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/notification_env ^
         -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/scheduler_env ^
         -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/user_env ^
         -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/env.js
        ```

    > **Note:** Modify the environment files as necessary for your deployment using any text editor, ensuring that the values are appropriate for your environment. The default values provided in the current files are functional and serve as a good starting point. Refer to the sample env files provided at the [Project](https://github.com/ELEVATE-Project/project-service/blob/main/.env.sample), [User](https://github.com/ELEVATE-Project/user/blob/master/src/.env.sample), [Notification](https://github.com/ELEVATE-Project/notification/blob/master/src/.env.sample), [Scheduler](https://github.com/ELEVATE-Project/scheduler/blob/master/src/.env.sample), [Interface](https://github.com/ELEVATE-Project/interface-service/blob/main/src/.env.sample) and [Entity-management](https://github.com/ELEVATE-Project/entity-management/blob/main/src/.env.sample) repositories for reference.

    > **Caution:** While the default values in the downloaded environment files enable the Project Application to operate, certain features may not function correctly or could be impaired unless the adopter-specific environment variables are properly configured.

3.  **Download `replace_volume_path` Script File**

    -   **Windows**

        ```
        curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/dockerized/scripts/windows/replace_volume_path.bat
        ```

4.  **Run `replace_volume_path` Script File**

    -   **Windows**

        Run the script file either by double clicking it or by executing the following command from the terminal.

        ```
        replace_volume_path.bat
        ```

        > **Note**: The provided script file replaces the host path for the **portal** service container volume in the `docker-compose-project.yml` file with your current directory path.
        >
        > volumes:
        >
        > \- /home/shikshalokam/elevate/single-click/linux/env.js:/usr/src/app/www/assets/env/env.js

5.  **Download `docker-compose-up` & `docker-compose-down` Script Files**

    -   **Windows**

        ```
        curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/scripts/windows/docker-compose-up.bat
        ```

        ```
        curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/scripts/windows/docker-compose-down.bat
        ```

6.  **Run All Services & Dependencies**:All services and dependencies can be started using the `docker-compose-up` script file.

    -   **Windows**

        ```
        docker-compose-up.bat
        ```

        > Double-click the file or run the above command from the terminal.

        > **Note**: During the first Docker Compose run, the database, migration seeder files, and the script to set the default organization will be executed automatically.

7.  **Remove All Service & Dependency Containers**:
    All docker containers can be stopped and removed by using the `docker-compose-down` file.

    -   **Windows**

        ```
        docker-compose-down.bat
        ```

    > **Caution**: As per the default configuration in the `docker-compose-project.yml` file, using the `down` command will lead to data loss since the database container does not persist data. To persist data across `down` commands and subsequent container removals, refer to the "Persistence of Database Data in Docker Containers" section of this documentation.

## 💻 Supported Operating Systems

- **Ubuntu** (Recommended: Version 20 and above)  
- **Windows** (Recommended: Version 11 and above)  
- **macOS** (Recommended: Version 12 and above)  

---

## ✨ Setup & Deployment Guide

This section outlines the different ways to set up the **Projects Service**. Please select the deployment environment and setup method that best suits your needs.

---

<details>
<summary> 🚀 <b>STAND-ALONE SETUP (Stand Alone Setup)</b> </summary>
<br>

This setup is ideal for **local development and testing** where only the core Projects Service components are required.  

In the **Stand-Alone Setup**, the **Samiksha service is not included**. Only the following flows will be available:  
- **Programs**  
- **Projects**  
- **Reports**

#### I. Docker Setup (Recommended)

- [Setup guide for Linux](https://github.com/ELEVATE-Project/project-service/blob/setupGuide-3.4/documentation/3.4.0/setup/docker/stand-alone/ubuntu/README.md)  
- [Setup guide for macOS](link/to/standalone/docker/macos/README)  
- [Setup guide for Windows](link/to/standalone/docker/windows/README)  

<br>

#### II. Native Setup (PM2 Managed Services)

- [Setup guide for Linux](https://github.com/ELEVATE-Project/project-service/blob/setupGuide-3.4/documentation/3.4.0/setup/native/stand-alone/ubuntu/README.md)  
- [Setup guide for macOS](link/to/standalone/native/macos/README)  
- [Setup guide for Windows](link/to/standalone/native/windows/README)  

</details>

---

<details>
<summary> 🚀 <b>WITH SAMIKSHA SERVICE (Integrated Setup)</b> </summary>
<br>

This setup integrates the Projects Service with the **Samiksha Service**, providing a full-featured, production-ready deployment environment. The following flows will be available:  
- **Programs**  
- **Projects**  
- **Survey**  
- **Observation**  
- **Reports**

#### I. Docker Setup (Recommended)

- [Setup guide for Linux](https://github.com/ELEVATE-Project/project-service/blob/setupGuideWithSurvey/documentation/3.4.0/setup/docker/project-with-survey/ubuntu/README.md)  
- [Setup guide for macOS](link/to/samiksha/docker/macos/README)  
- [Setup guide for Windows](link/to/samiksha/docker/windows/README)  

<br>

#### II. Native Setup (PM2 Managed Services)

- [Setup guide for Linux](https://github.com/ELEVATE-Project/project-service/blob/setupGuideWithSurvey/documentation/3.4.0/setup/native/project-with-survey/ubuntu/README.md)  
- [Setup guide for macOS](link/to/samiksha/native/macos/README)  
- [Setup guide for Windows](link/to/samiksha/native/windows/README) 

</details>
<br>

## 📖 Related Documentation & Tools


### 🗂️ Database Architecture Diagrams

Explore the database schemas for the ELEVATE-Project services below.  
Click on a service name to expand and view the diagram.

<br>

<details>
<summary>📂 <b>Entity Management Service (EMS)</b></summary>
<br>
<p align="center">
  <img src="https://github.com/ELEVATE-Project/project-service/raw/MainReadMe/documentation/3.4.0/database-diagram/EMS-Entity-Service.drawio.png" alt="Entity Management Diagram" width="100%">
</p>
</details>

<details>
<summary>📂 <b>Project Service</b></summary>
<br>
<p align="center">
  <img src="https://github.com/ELEVATE-Project/project-service/raw/MainReadMe/documentation/3.4.0/database-diagram/EMS-Project-Service.drawio.png" alt="Project Service Diagram" width="100%">
</p>
</details>

<details>
<summary>📂 <b>Samiksha Service (Survey & Observation)</b></summary>
<br>
<p align="center">
  <img src="https://github.com/ELEVATE-Project/project-service/raw/MainReadMe/documentation/3.4.0/database-diagram/EMS-Samiksha-Service.drawio.png" alt="Samiksha Service Diagram" width="100%">
</p>
</details>

> **Tip:** If the diagrams appear too small, you can right-click the image and select  
> **"Open image in new tab"** to view the full-resolution architectural details.

---

### 🧪 Postman Collections and API DOC

- <a href="https://github.com/ELEVATE-Project/project-service/tree/main/api-doc" target="_blank">
  Projects Service API Collection
- <a href="https://github.com/ELEVATE-Project/samiksha-service/tree/main/api-doc" target="_blank">
  Samiksha Service API Collection
</a>

---

### 🛠️ Adding New Projects to the System

With SUP (Solution Upload Portal), you can seamlessly add new projects , survey and observation to the system.  
Once it's successfully added, it becomes visible on the portal, ready for use and interaction.

For a comprehensive guide on setting up and using the SUP, please refer to:

- <a href="https://github.com/ELEVATE-Project/project-service/tree/main/Project-Service-implementation-Script" target="_blank">
  solution-Upload-Portal-Service
- <a href="https://github.com/ELEVATE-Project/project-service/tree/main/Project-Service-implementation-Script" target="_blank">
  solution-Upload-Portal
</a>

---

### 🔖 Versioning & Documentation Links

This README is focused on the **3.4.0 Setup Guide** for the Projects Service.

- **Current Version (3.4.0) Documentation**  
  All setup links above point to the **3.4.0** guides.

- **Legacy Version (1.0.0) Documentation**  
  <a href="https://github.com/ELEVATE-Project/project-service/blob/setupGuide-3.4/documentation/1.0.0/ReadMe.md" target="_blank">
    View 1.0.0 Documentation
  </a>

---
## 👥 Team

<a href="https://github.com/ELEVATE-Project/project-service/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ELEVATE-Project/project-service" />
</a>

---

### Open Source Dependencies
This project uses several open-source tools and dependencies that supported its development

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)  
![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)  
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)  
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)  
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)  
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)  
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)  
