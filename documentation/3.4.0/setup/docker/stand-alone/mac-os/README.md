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

</details>
</details>

</br>
The Project building block facilitates the creation and engagement with micro-improvement projects.

</div>
</br>

# Docker Setup Project Service - Stand Alone

Expectation: By diligently following the outlined steps, you will successfully establish a fully operational Project application setup, including both the portal and backend services.

## Prerequisites

To set up the Project application, ensure you have Docker and Docker Compose installed on your system. For Linux users, detailed installation instructions for both can be found in the documentation here: [How To Install and Use Docker Compose on Linux](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04). To install and use Nodejs in Linux machine, you can follow instructions here: [How To Install Nodejs in Linux](https://nodejs.org/en/download/package-manager).

## Installation

**Create project Directory:** Establish a directory titled **project**.

> Example Command: `mkdir project && cd project/`

> Note: All commands are run from the project directory.

## Operating Systems: Linux

> **Caution:** Before proceeding, please ensure that the ports given here are available and open. It is essential to verify their availability prior to moving forward. You can run below command in your terminal to check this

```
for port in 3001 3002 6000 5001 4000 9092 5432 7007 2181 27017 3569; do
    if sudo lsof -iTCP:$port -sTCP:LISTEN &>/dev/null; then
        echo "Port $port is IN USE"
    else
        echo "Port $port is available"
    fi
done
```

1. **Download and execute main setup script:** Execute the following command in your terminal from the project directory.
    ```
    curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/dockerized/scripts/mac-linux/setup_project.sh \
    && chmod +x setup_project.sh \
    && ./setup_project.sh
    ```

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

## Enable Citus Extension (Optional)

User management service comes with this bundle relies on PostgreSQL as its core database system. To boost performance and scalability, users can opt to enable the Citus extension. This transforms PostgreSQL into a distributed database, spreading data across multiple nodes to handle large datasets more efficiently as demand grows.

For more information, refer **[Citus Data](https://www.citusdata.com/)**.

To enable the Citus extension for user services, follow these steps.

1. Create a sub-directory named `user` and download `distributionColumns.sql` into it. (Skip this for linux)

    ```
    mkdir user && curl -o ./user/distributionColumns.sql -JL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/distribution-columns/user/distributionColumns.sql
    ```

2. Set up the citus_setup file by following the steps given below.

    1. Enable Citus and set distribution columns for `user` database by running the `citus_setup.sh`with the following arguments.

    ```
    sudo ./citus_setup.sh user postgres://postgres:postgres@citus_master:5432/user
    ```

## Update Cloud Credentials for Project Service

To enable full functionality, including certificate generation and report storage, you must configure cloud credentials in the Project Service environment file.

    Path: project_env

Add or update the following variables in the .env file, substituting the example values with your actual cloud credentials:

    CLOUD_STORAGE_PROVIDER=gcloud
    CLOUD_STORAGE_ACCOUNTNAME=your_account_name
    CLOUD_STORAGE_SECRET="-----BEGIN PRIVATE KEY-----\n..."
    CLOUD_STORAGE_PROJECT=your_cloud_project_id
    CLOUD_STORAGE_BUCKETNAME=your_bucket_name
    CLOUD_STORAGE_BUCKET_TYPE=private

> NOTE : This service is designed to support multiple cloud storage providers and offers flexible cloud integration capabilities. Based on your selected cloud provider, the service can be configured accordingly to enable seamless storage, certificate generation, and report handling.

For detailed configuration options, supported cloud providers, and integration guidelines, please refer to the official documentation available in this [ReadMe](https://www.npmjs.com/package/client-cloud-services?activeTab=readme)

## Persistence Of Database Data In Docker Container (Optional)

To ensure the persistence of database data when running `docker compose down`, it is necessary to modify the `docker-compose-project.yml` file according to the steps given below:

1. **Modification Of The `docker-compose-project.yml` File:**

    Begin by opening the `docker-compose-project.yml` file. Locate the section pertaining to the Citus and mongo container and proceed to uncomment the volume specification. This action is demonstrated in the snippet provided below:

    ```yaml
    mongo:
    image: 'mongo:4.4.14'
    restart: 'always'
    ports:
        - '27017:27017'
    networks:
        - project_net
    volumes:
        - mongo-data:/data/db
    logging:
        driver: none

    citus:
        image: citusdata/citus:11.2.0
        container_name: 'citus_master'
        ports:
            - 5432:5432
        volumes:
            - citus-data:/var/lib/postgresql/data
    ```

2. **Uncommenting Volume Names Under The Volumes Section:**

    Next, navigate to the volumes section of the file and proceed to uncomment the volume names as illustrated in the subsequent snippet:

    ```yaml
    networks:
        elevate_net:
            external: false

    volumes:
        citus-data:
        mongo-data:
    ```

By implementing these adjustments, the configuration ensures that when the `docker-compose down` command is executed, the database data is securely stored within the specified volumes. Consequently, this data will be retained and remain accessible, even after the containers are terminated and subsequently reinstated using the `docker-compose up` command.

## Sample User Accounts Generation

During the initial setup of Project services with the default configuration, you may encounter issues creating new accounts through the regular SignUp flow on the project portal. This typically occurs because the default SignUp process includes OTP verification to prevent abuse. Until the notification service is configured correctly to send actual emails, you will not be able to create new accounts.

In such cases, you can generate sample user accounts using the steps below. This allows you to explore the Project services and portal immediately after setup.

> **Warning:** Use this generator only immediately after the initial system setup and before any normal user accounts are created through the portal. It should not be used under any circumstances thereafter.

```
docker exec -i citus_master psql -U postgres -d user < insert_sample_data.sql
```

After successfully running the script mentioned above, the following user accounts will be created and available for login:

| Email ID               | Password   | Role                    |
| ---------------------- | ---------- | ----------------------- |
| mallanagouda@gmail.com | Password1@ | State Education Officer |
| prajwal@gmail.com      | Password1@ | State Education Officer |
| vishnu@gmail.com       | Password1@ | State Education Officer |

## Sample Data Creation For Projects

This step will guide us in implementing a sample project solution following the initial setup of the project service.

1. **Insert Sample Data To Database:**

    ```
    node insert_sample_solutions.js
    ```

## 🌐 Micro-Frontend (FE) Setup

The ELEVATE application uses a micro-frontend architecture. After setting up the backend services, you must configure and run the frontend repositories to access the application via the portal.

Follow the setup guides for the frontend repositories:

-   **Login Portal:** [elevate-portal](https://github.com/ELEVATE-Project/elevate-portal/tree/releaase-1.1.0)
-   **Projects Program Module (PWA):** [observation-survey-projects-pwa](https://github.com/ELEVATE-Project/observation-survey-projects-pwa/tree/release-3.4.0)

> **Warning:** In this setup, features such as **Sign-Up, Project Certificate, Project Sharing, and Project PDF Report** will not be available because cloud storage credentials have been masked in the environment files for security reasons.

## Postman Collections

-   [Projects Service](https://github.com/ELEVATE-Project/project-service/tree/main/api-doc)

## Adding New Projects to the System

With implementation scripts, you can seamlessly add new projects to the system. Once a project is successfully added, it becomes visible on the portal, ready for use and interaction. For a comprehensive guide on setting up and using the implementation script, please refer to the [documentation here](https://github.com/ELEVATE-Project/project-service/tree/main/Project-Service-implementation-Script).

# Team

<a href="https://github.com/ELEVATE-Project/project-service/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ELEVATE-Project/project-service" />
</a>

# Open Source Dependencies

Several open source dependencies that have aided Projects's development:

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
